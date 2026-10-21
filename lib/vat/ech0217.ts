// The eCH-0217 v2.0.0 VAT return file, as a pure function (Node tests in
// scripts/ech0217.test.mjs). lib/api/accounting.ts wraps it with the error
// messages in the reader's language.
import type { VatCodeReportRow, VatLedgerReport, VatSettings } from '../api/accounting';

export interface Ech0217Messages {
  echEffectiveOnly: string;
  echInvoicedOnly: string;
  echUid: string;
}

const FR_MESSAGES: Ech0217Messages = {
  echEffectiveOnly: "L'export eCH-0217 n'est disponible que pour la méthode effective.",
  echInvoicedOnly: 'L’export eCH-0217 requiert le mode "contre-prestations convenues" — le registre TVA de Cantia n’est pas encore calculé sur une base "reçues".',
  echUid: 'Numéro IDE manquant ou invalide (format attendu : CHE-123.456.789) — impossible de générer le fichier eCH-0217.',
};

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// ==========================================================================
// eCH-0217 v2.0.0 "Spécification E-MWST" — XML for manual upload into the
// AFC/ESTV "MWST abrechnen" portal (SuisseTax). Built and verified against
// the official XSD and the official 40-page specification PDF (both
// supplied by the user for this purpose) — not guessed from search snippets.
//
// SCOPE: effective method ("méthode effective") only, mode "convenues"
// only. Cantia's vat_codes are rate-based (7.7/8.1%, 2.5/2.6%, 3.7/3.8%),
// not TDFN/PSS activity-rate based, so netTaxRateMethod / flatTaxRateMethod
// / simpleTaxRateMethod (the eCH-0217 branches for Saldo-/Pauschalsteuersatz)
// cannot be populated honestly — buildEch0217Xml refuses for those. The VAT
// ledger is also only ever posted at invoice date (mode "convenues" timing),
// so exporting on a "reçues" basis would misstate which period each amount
// belongs to — buildEch0217Xml refuses that too, matching the same caveat
// already shown on the per-code ledger report.
//
// NOT MODELED (omitted rather than fabricated, matching the cahier's own
// rule): acquisitionTax/Bezugsteuer (Art. 45, reverse charge on services
// bought abroad — no such vat_code category exists), opted/option pour
// l'imposition, subsequentInputTaxDeduction/Einlageentsteuerung (the PDF
// itself notes on p.7 that most ERPs can't populate this), and
// inputTaxCorrections/inputTaxReductions (Cantia's generic "CORR" code
// mixes Art. 30/31 corrections and Art. 33 al. 2 reductions together with
// no way to tell them apart — surfaced as a warning instead of guessed).
//
// NOT INDEPENDENTLY VERIFIED: the exact child-element structure of
// eCH-0108:uidType, eCH-0108:unitNameType and eCH-0058:sendingApplicationType
// — these three types belong to two OTHER eCH standards (eCH-0108 v6.0.0,
// eCH-0058 v5.1.0) whose own XSDs were not supplied, only referenced by
// import in eCH-0217's schema. uid's shape below (a category + a 9-digit
// id) is reconstructed from two simple types defined — unusually — directly
// in the eCH-0217 XSD but not otherwise used by it (uidOrganisationIdCategoryType,
// uidOrganisationIdType), which match the well-known eCH-0108 uidType shape
// exactly; sendingApplication's shape (manufacturer/product/productVersion)
// mirrors the standard eCH message-frame convention shared by many eCH XML
// formats. Both are well-reasoned reconstructions, not verified against the
// real combined schema. The ESTV portal itself schema-validates every
// upload and rejects anything non-conformant (§7.1 of the spec) — so a
// structural mistake here would be caught immediately, not silently filed.
// ==========================================================================

export interface Ech0217Result {
  xml: string;
  warnings: string[];
}

const ECH0217_NS = 'http://www.ech.ch/xmlns/eCH-0217/2';
const ECH0108_NS = 'http://www.ech.ch/xmlns/eCH-0108/7';
const ECH0058_NS = 'http://www.ech.ch/xmlns/eCH-0058/5';

const KNOWN_VAT_RATES = new Set([8.1, 2.6, 3.8, 7.7, 2.5, 3.7, 0]);

function xmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

// amountType = xs:decimal, exactly 2 fraction digits (§5.2). Every figure
// is computed to 2dp without extra intermediate rounding per §6.2.1.
function amt(n: number): string {
  return round2(n).toFixed(2);
}
function pct(n: number): string {
  return round2(n).toFixed(2);
}

// §6.2.1: only the final payableTax (Ziffer 500/510) may optionally be
// rounded to 5 centimes, and always in the taxpayer's favor — down when an
// amount is owed (e.g. 950.54 -> 950.50), and further into credit when a
// credit is due (e.g. a credit shown as -950.51 -> -950.55). Flooring the
// signed value in units of 0.05 gives both directions correctly.
function roundFiveCentsInTaxpayerFavor(n: number): number {
  return Math.floor(n * 20) / 20;
}

export function parseSwissUid(ideNumber: string | null): { category: string; id: string } | null {
  if (!ideNumber) return null;
  if (!/CHE/i.test(ideNumber)) return null;
  const digits = ideNumber.replace(/[^0-9]/g, '');
  if (digits.length !== 9) return null;
  return { category: 'CHE', id: digits };
}

export function buildEch0217Xml(
  organization: { name: string; ide_number: string | null },
  periodStart: string,
  periodEndExclusive: string,
  businessReferenceId: string,
  vatSettings: VatSettings,
  report: VatLedgerReport,
  messages: Ech0217Messages = FR_MESSAGES,
): Ech0217Result {
  if (vatSettings.vatMethod !== 'effective') {
    throw new Error(messages.echEffectiveOnly);
  }
  if (vatSettings.vatBasisDefault !== 'invoiced') {
    throw new Error(messages.echInvoicedOnly);
  }
  const uid = parseSwissUid(organization.ide_number);
  if (!uid) {
    throw new Error(messages.echUid);
  }

  const warnings: string[] = [];

  const byCategory = (rows: VatCodeReportRow[], ...cats: string[]) => rows.filter((r) => cats.includes(r.category));
  const sumBase = (rows: VatCodeReportRow[]) => rows.reduce((s, r) => s + r.base, 0);
  const sumAmount = (rows: VatCodeReportRow[]) => rows.reduce((s, r) => s + r.amount, 0);

  const taxableSales = byCategory(report.salesRows, 'vente_normal', 'vente_reduit', 'vente_hebergement');
  const exportedSales = round2(sumBase(byCategory(report.salesRows, 'vente_exoneree')));
  const exemptSales = round2(sumBase(byCategory(report.salesRows, 'vente_exclue')));
  const abroadSales = round2(sumBase(byCategory(report.salesRows, 'vente_etranger')));
  const totalConsideration = round2(sumBase(taxableSales) + exportedSales + exemptSales + abroadSales);

  const rateMap = new Map<number, number>();
  for (const r of taxableSales) rateMap.set(r.rate, (rateMap.get(r.rate) ?? 0) + r.base);
  const suppliesPerTaxRate = [...rateMap.entries()]
    .map(([rate, turnover]) => ({ rate, turnover: round2(turnover) }))
    .filter((r) => r.turnover !== 0);
  for (const r of suppliesPerTaxRate) {
    if (!KNOWN_VAT_RATES.has(r.rate)) {
      warnings.push(`Taux TVA ${r.rate}% inhabituel détecté sur la période — vérifiez qu'il correspond à un taux publié par l'AFC (estv.admin.ch) avant l'envoi.`);
    }
  }

  const inputTaxMaterialAndServices = round2(sumAmount(byCategory(report.deductibleRows, 'achat_materiel')));
  const inputTaxInvestments = round2(sumAmount(byCategory(report.deductibleRows, 'achat_investissement', 'achat_autre')));

  const unclassifiedCorrections = [...report.salesRows, ...report.deductibleRows].filter((r) => r.category === 'correction');
  if (unclassifiedCorrections.some((r) => r.amount !== 0)) {
    const total = round2(sumAmount(unclassifiedCorrections));
    warnings.push(`Des montants (CHF ${total.toFixed(2)}) sont enregistrés sous le code "CORR" (corrections/réductions de TVA préalable) : Cantia ne peut pas déterminer automatiquement s'ils relèvent de l'art. 30/31 LTVA (inputTaxCorrections) ou de l'art. 33 al. 2 LTVA (inputTaxReductions) — à ajouter manuellement dans le décompte après contrôle.`);
  }

  const totalTaxDueOnSupplies = suppliesPerTaxRate.reduce((s, r) => s + (r.rate / 100) * r.turnover, 0);
  const payableTaxRaw = round2(totalTaxDueOnSupplies - inputTaxMaterialAndServices - inputTaxInvestments);
  const payableTax = vatSettings.vatRounding === 'cinq_centimes' ? roundFiveCentsInTaxpayerFavor(payableTaxRaw) : payableTaxRaw;

  // §7.5 self-check: the taxable Gesamtumsatz (Ziffer 299) computed from
  // turnoverComputation must equal the sum of suppliesPerTaxRate turnovers.
  // Guaranteed by construction above; checked anyway as a safety net.
  const gesamtumsatz = round2(totalConsideration - exportedSales - abroadSales - exemptSales);
  const sumSuppliesPerTaxRate = round2(suppliesPerTaxRate.reduce((s, r) => s + r.turnover, 0));
  if (Math.abs(gesamtumsatz - sumSuppliesPerTaxRate) > 0.01) {
    warnings.push(`Écart de réconciliation détecté entre le chiffre d'affaires imposable (${gesamtumsatz.toFixed(2)}) et la somme des Leistungen par taux (${sumSuppliesPerTaxRate.toFixed(2)}) — ne pas envoyer ce fichier sans vérification.`);
  }

  const periodTill = new Date(`${periodEndExclusive}T00:00:00Z`);
  periodTill.setUTCDate(periodTill.getUTCDate() - 1);
  const reportingPeriodTill = periodTill.toISOString().slice(0, 10);
  const generationTime = new Date().toISOString().slice(0, 19);

  const lines: string[] = [];
  const push = (depth: number, s: string) => lines.push('  '.repeat(depth) + s);

  push(0, '<?xml version="1.0" encoding="UTF-8"?>');
  push(0, `<VATDeclaration xmlns="${ECH0217_NS}" xmlns:eCH-0108="${ECH0108_NS}" xmlns:eCH-0058="${ECH0058_NS}">`);
  push(1, '<generalInformation>');
  push(2, '<uid>');
  push(3, `<eCH-0108:uidOrganisationIdCategorie>${uid.category}</eCH-0108:uidOrganisationIdCategorie>`);
  push(3, `<eCH-0108:uidOrganisationId>${uid.id}</eCH-0108:uidOrganisationId>`);
  push(2, '</uid>');
  push(2, `<organisationName>${xmlEscape(organization.name)}</organisationName>`);
  push(2, `<generationTime>${generationTime}</generationTime>`);
  push(2, `<reportingPeriodFrom>${periodStart}</reportingPeriodFrom>`);
  push(2, `<reportingPeriodTill>${reportingPeriodTill}</reportingPeriodTill>`);
  push(2, '<typeOfSubmission>1</typeOfSubmission>');
  push(2, '<formOfReporting>1</formOfReporting>');
  push(2, `<businessReferenceId>${xmlEscape(businessReferenceId)}</businessReferenceId>`);
  push(2, '<sendingApplication>');
  push(3, '<eCH-0058:manufacturer>Cantia</eCH-0058:manufacturer>');
  push(3, '<eCH-0058:product>Cantia</eCH-0058:product>');
  push(3, '<eCH-0058:productVersion>1.0</eCH-0058:productVersion>');
  push(2, '</sendingApplication>');
  push(1, '</generalInformation>');

  push(1, '<turnoverComputation>');
  push(2, `<totalConsideration>${amt(totalConsideration)}</totalConsideration>`);
  if (exportedSales !== 0) push(2, `<suppliesToForeignCountries>${amt(exportedSales)}</suppliesToForeignCountries>`);
  if (abroadSales !== 0) push(2, `<suppliesAbroad>${amt(abroadSales)}</suppliesAbroad>`);
  if (exemptSales !== 0) push(2, `<suppliesExemptFromTax>${amt(exemptSales)}</suppliesExemptFromTax>`);
  push(1, '</turnoverComputation>');

  push(1, '<effectiveReportingMethod>');
  push(2, '<grossOrNet>1</grossOrNet>');
  for (const r of suppliesPerTaxRate) {
    push(2, '<suppliesPerTaxRate>');
    push(3, `<taxRate>${pct(r.rate)}</taxRate>`);
    push(3, `<turnover>${amt(r.turnover)}</turnover>`);
    push(2, '</suppliesPerTaxRate>');
  }
  if (inputTaxMaterialAndServices !== 0) push(2, `<inputTaxMaterialAndServices>${amt(inputTaxMaterialAndServices)}</inputTaxMaterialAndServices>`);
  if (inputTaxInvestments !== 0) push(2, `<inputTaxInvestments>${amt(inputTaxInvestments)}</inputTaxInvestments>`);
  push(1, '</effectiveReportingMethod>');

  push(1, `<payableTax>${amt(payableTax)}</payableTax>`);
  push(0, '</VATDeclaration>');

  return { xml: lines.join('\n') + '\n', warnings };
}
