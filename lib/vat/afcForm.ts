// The AFC VAT return (« Décompte TVA », form 0550 effective method / 0551
// TDFN), figure by figure, computed from the VAT ledger (posted entries
// grouped by VAT code) plus the few amounts Cantia cannot know and the
// taxpayer types in (transfers, acquisition tax, corrections…).
//
// Figure numbers and wording follow the official form valid from 1.1.2024
// (rates 8.1 / 2.6 / 3.8 %: figures 303 / 313 / 343; the pre-2024 rates
// 7.7 / 2.5 / 3.7 % stay on 302 / 312 / 342 for late invoices), and match
// the eCH-0217 elements already exported by lib/api/accounting.ts.
// Pure module (no I/O) so it can be tested with node directly.

export type VatMethod = 'effective' | 'tdfn';
export type Periodicity = 'mensuelle' | 'trimestrielle' | 'semestrielle' | 'annuelle';

export interface LedgerRow {
  code: string;
  category: string;
  rate: number;
  base: number;
  amount: number;
}

// Amounts the taxpayer adds by hand (all CHF, positive).
export interface VatAdjustments {
  f205?: number; // opted exclusions (included in 200)
  f225?: number; // transfers with the notification procedure (art. 38)
  f235?: number; // discounts / losses not already credited per rate
  f280?: number; // miscellaneous (land value, margin taxation…)
  f383Base?: number; // services bought abroad (acquisition tax, art. 45)
  f410?: number; // subsequent input tax deduction (art. 32)
  f415?: number; // input tax corrections (art. 30, 31)
  f420?: number; // input tax reductions (subsidies…, art. 33 al. 2)
  f470?: number; // TDFN: tax credited per form 1050
  f900?: number; // subsidies, tourist taxes…
  f910?: number; // donations, dividends, compensation…
  tdfnRate1?: number; // % approved by the AFC
  tdfnRate2?: number;
  tdfnRate2Turnover?: number; // TTC turnover at the second rate
}

export interface FormLine {
  figure: string;
  turnover?: number; // « Prestations CHF »
  rate?: number;
  tax?: number; // « Impôt CHF »
  amount?: number; // single-column figures
  editable?: keyof VatAdjustments;
  subtotal?: boolean;
}

export interface AfcForm {
  method: VatMethod;
  turnover: FormLine[]; // I. Chiffre d'affaires
  tax: FormLine[]; // II. Calcul de l'impôt
  other: FormLine[]; // III. Autres mouvements de fonds
  totalTax: number; // 399
  totalInputTax: number; // 479 (effective) / 470 (TDFN)
  payable: number; // 500 (> 0) or -510 (< 0), before rounding
  payableRounded: number;
  warnings: string[];
}

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const sum = (rows: LedgerRow[], f: (r: LedgerRow) => number) => rows.reduce((s, r) => s + f(r), 0);
const n = (v: number | undefined) => (typeof v === 'number' && isFinite(v) ? v : 0);

const RATE_FIGURE: Record<string, string> = { '8.1': '303', '2.6': '313', '3.8': '343', '7.7': '302', '2.5': '312', '3.7': '342' };
const TAXABLE = ['vente_normal', 'vente_reduit', 'vente_hebergement'];

// §6.2.1 eCH-0217: only the final amount may be rounded to 5 centimes, and
// always in the taxpayer's favour.
export function roundInTaxpayerFavour(v: number): number {
  return Math.floor(r2(v) * 20) / 20;
}

export function buildAfcForm(rows: LedgerRow[], method: VatMethod, adj: VatAdjustments, fiveCents = false): AfcForm {
  const warnings: string[] = [];
  const sales = rows.filter((r) => !r.category.startsWith('achat') && r.category !== 'correction' && r.category !== 'sans_tva');
  const taxable = sales.filter((r) => TAXABLE.includes(r.category));
  // TDFN declares turnover including VAT; the effective method excluding it.
  const gross = (r: LedgerRow) => (method === 'tdfn' ? r.base + r.amount : r.base);

  const f220 = r2(sum(sales.filter((r) => r.category === 'vente_exoneree'), gross));
  const f221 = r2(sum(sales.filter((r) => r.category === 'vente_etranger'), gross));
  const f230 = r2(sum(sales.filter((r) => r.category === 'vente_exclue'), gross));
  const f225 = r2(n(adj.f225));
  const f235 = r2(n(adj.f235));
  const f280 = r2(n(adj.f280));
  const taxableGross = r2(sum(taxable, gross));
  // 200 is the total before deductions: the ledger figures plus the
  // non-taxable amounts typed in. Discounts typed in 235 are not in the
  // ledger yet, so 299 = taxable turnover less those discounts.
  const f200 = r2(taxableGross + f220 + f221 + f225 + f230 + f280);
  const f289 = r2(f220 + f221 + f225 + f230 + f235 + f280);
  const f299 = r2(f200 - f289);

  const turnover: FormLine[] = [
    { figure: '200', amount: f200, subtotal: true },
    { figure: '205', amount: r2(n(adj.f205)), editable: 'f205' },
    { figure: '220', amount: f220 },
    { figure: '221', amount: f221 },
    { figure: '225', amount: f225, editable: 'f225' },
    { figure: '230', amount: f230 },
    { figure: '235', amount: f235, editable: 'f235' },
    { figure: '280', amount: f280, editable: 'f280' },
    { figure: '289', amount: f289, subtotal: true },
    { figure: '299', amount: f299, subtotal: true },
  ];

  const tax: FormLine[] = [];
  let totalTax = 0;
  const acqBase = r2(n(adj.f383Base));

  if (method === 'effective') {
    const byRate = new Map<number, number>();
    for (const r of taxable) byRate.set(r.rate, (byRate.get(r.rate) ?? 0) + r.base);
    // Extra discounts typed in 235 reduce the normal rate.
    if (f235) byRate.set(8.1, (byRate.get(8.1) ?? 0) - f235);
    const order = ['303', '313', '343', '302', '312', '342'];
    const lines = [...byRate.entries()]
      .filter(([, b]) => Math.abs(b) > 0.004)
      .map(([rate, base]) => {
        const figure = RATE_FIGURE[String(rate)];
        if (!figure) warnings.push(`Taux ${rate} % inconnu du formulaire AFC : vérifiez le code TVA utilisé.`);
        return { figure: figure ?? '???', turnover: r2(base), rate, tax: r2((base * rate) / 100) };
      })
      .sort((a, b) => order.indexOf(a.figure) - order.indexOf(b.figure));
    for (const fig of ['303', '313', '343']) if (!lines.some((l) => l.figure === fig)) lines.push({ figure: fig, turnover: 0, rate: { '303': 8.1, '313': 2.6, '343': 3.8 }[fig]!, tax: 0 });
    lines.sort((a, b) => order.indexOf(a.figure) - order.indexOf(b.figure));
    tax.push(...lines);
    tax.push({ figure: '383', turnover: acqBase, rate: 8.1, tax: r2(acqBase * 0.081), editable: 'f383Base' });
    totalTax = r2(lines.reduce((s, l) => s + (l.tax ?? 0), 0) + acqBase * 0.081);
    const reconciled = r2(lines.reduce((s, l) => s + (l.turnover ?? 0), 0));
    if (Math.abs(reconciled - f299) > 0.05) warnings.push(`Le chiffre d'affaires imposable (ch. 299 : ${f299.toFixed(2)}) ne correspond pas à la somme des taux (${reconciled.toFixed(2)}).`);
  } else {
    const rate1 = n(adj.tdfnRate1);
    const rate2 = n(adj.tdfnRate2);
    const t2 = rate2 ? Math.min(r2(n(adj.tdfnRate2Turnover)), f299) : 0;
    const t1 = r2(f299 - t2);
    if (!rate1) warnings.push('Indiquez votre taux de la dette fiscale nette (décision de l’AFC).');
    tax.push({ figure: '322', turnover: t1, rate: rate1, tax: r2((t1 * rate1) / 100), editable: 'tdfnRate1' });
    tax.push({ figure: '332', turnover: t2, rate: rate2, tax: r2((t2 * rate2) / 100), editable: 'tdfnRate2' });
    tax.push({ figure: '382', turnover: acqBase, rate: 8.1, tax: r2(acqBase * 0.081), editable: 'f383Base' });
    totalTax = r2((t1 * rate1) / 100 + (t2 * rate2) / 100 + acqBase * 0.081);
  }
  tax.push({ figure: '399', tax: totalTax, subtotal: true });

  let totalInputTax: number;
  if (method === 'effective') {
    const f400 = r2(sum(rows.filter((r) => r.category === 'achat_materiel'), (r) => r.amount));
    const f405 = r2(sum(rows.filter((r) => r.category === 'achat_investissement' || r.category === 'achat_autre'), (r) => r.amount));
    const f410 = r2(n(adj.f410));
    const f415 = r2(n(adj.f415));
    const f420 = r2(n(adj.f420));
    totalInputTax = r2(f400 + f405 + f410 - f415 - f420);
    tax.push(
      { figure: '400', tax: f400 },
      { figure: '405', tax: f405 },
      { figure: '410', tax: f410, editable: 'f410' },
      { figure: '415', tax: -f415, editable: 'f415' },
      { figure: '420', tax: -f420, editable: 'f420' },
      { figure: '479', tax: totalInputTax, subtotal: true },
    );
  } else {
    totalInputTax = r2(n(adj.f470));
    tax.push({ figure: '470', tax: totalInputTax, editable: 'f470' });
  }

  const corr = rows.filter((r) => r.category === 'correction' && Math.abs(r.amount) > 0.004);
  if (corr.length) {
    warnings.push(
      `CHF ${r2(sum(corr, (r) => r.amount)).toFixed(2)} sont saisis sous le code CORR : reportez-les au ch. 415 (corrections) ou 420 (réductions) selon leur nature.`,
    );
  }

  const payable = r2(totalTax - totalInputTax);
  const payableRounded = fiveCents ? roundInTaxpayerFavour(payable) : payable;
  tax.push({ figure: payable >= 0 ? '500' : '510', tax: Math.abs(payableRounded), subtotal: true });

  const other: FormLine[] = [
    { figure: '900', amount: r2(n(adj.f900)), editable: 'f900' },
    { figure: '910', amount: r2(n(adj.f910)), editable: 'f910' },
  ];

  return { method, turnover, tax, other, totalTax, totalInputTax, payable, payableRounded, warnings };
}

// Official wording (abridged where the form adds legal references).
export const FIGURE_LABELS: Record<string, string> = {
  '200': 'Total des contre-prestations convenues ou reçues (y c. prestations exonérées, à l’étranger, transferts et prestations exclues optées)',
  '205': 'Dont contre-prestations de prestations exclues pour lesquelles il a été opté (art. 22)',
  '220': 'Prestations exonérées (p. ex. exportations, art. 23)',
  '221': 'Prestations fournies à l’étranger',
  '225': 'Transferts avec la procédure de déclaration (art. 38, formulaire n° 764)',
  '230': 'Prestations exclues du champ de l’impôt (art. 21), sans option',
  '235': 'Diminutions de la contre-prestation (rabais, escomptes, pertes sur débiteurs)',
  '280': 'Divers (p. ex. valeur du terrain, prix d’achat en cas d’imposition de la marge)',
  '289': 'Total des déductions (ch. 220 à 280)',
  '299': 'Chiffre d’affaires imposable (ch. 200 moins ch. 289)',
  '302': 'Taux normal 7,7 % (prestations jusqu’au 31.12.2023)',
  '303': 'Taux normal 8,1 %',
  '312': 'Taux réduit 2,5 % (jusqu’au 31.12.2023)',
  '313': 'Taux réduit 2,6 %',
  '342': 'Hébergement 3,7 % (jusqu’au 31.12.2023)',
  '343': 'Taux spécial hébergement 3,8 %',
  '322': 'Taux de la dette fiscale nette 1',
  '332': 'Taux de la dette fiscale nette 2',
  '382': 'Impôt sur les acquisitions (prestations de l’étranger, art. 45)',
  '383': 'Impôt sur les acquisitions (prestations de l’étranger, art. 45)',
  '399': 'Total de l’impôt dû',
  '400': 'Impôt préalable grevant les coûts en matériel et en prestations de services',
  '405': 'Impôt préalable grevant les investissements et autres charges d’exploitation',
  '410': 'Dégrèvement ultérieur de l’impôt préalable (art. 32)',
  '415': 'Corrections de l’impôt préalable : double affectation, prestations à soi-même (art. 30, 31)',
  '420': 'Réductions de la déduction de l’impôt préalable : subventions, taxes touristiques… (art. 33, al. 2)',
  '470': 'Impôt mis en compte selon le formulaire n° 1050 (impôt préalable fictif, marge…)',
  '479': 'Total des déductions de l’impôt préalable (ch. 400 à 420)',
  '500': 'Montant à payer',
  '510': 'Solde en faveur de l’assujetti',
  '900': 'Subventions, taxes touristiques, contributions aux établissements d’élimination des déchets et d’approvisionnement en eau',
  '910': 'Dons, dividendes, dédommagements et autres flux sans contre-prestation',
};

export interface VatPeriod {
  key: string; // e.g. 2026-Q1, 2026-S2, 2026-M03, 2026-Y
  label: string;
  start: string; // inclusive ISO date
  endExclusive: string;
  end: string; // inclusive
  due: string; // 60 days after the end (art. 71 LTVA)
}

const iso = (d: Date) => d.toISOString().slice(0, 10);
const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d));

export function periodsFor(year: number, periodicity: Periodicity): VatPeriod[] {
  const span = { mensuelle: 1, trimestrielle: 3, semestrielle: 6, annuelle: 12 }[periodicity];
  const out: VatPeriod[] = [];
  for (let m = 0; m < 12; m += span) {
    const start = utc(year, m, 1);
    const endEx = utc(year, m + span, 1);
    const end = utc(year, m + span, 0);
    const due = utc(year, m + span, 0);
    due.setUTCDate(due.getUTCDate() + 60);
    const i = m / span + 1;
    const key = periodicity === 'mensuelle' ? `${year}-M${String(i).padStart(2, '0')}` : periodicity === 'trimestrielle' ? `${year}-T${i}` : periodicity === 'semestrielle' ? `${year}-S${i}` : `${year}`;
    const label = periodicity === 'mensuelle'
      ? start.toLocaleDateString('fr-CH', { month: 'long', timeZone: 'UTC' })
      : periodicity === 'trimestrielle'
        ? `${i}${i === 1 ? 'er' : 'e'} trimestre`
        : periodicity === 'semestrielle'
          ? `${i}${i === 1 ? 'er' : 'e'} semestre`
          : `Année ${year}`;
    out.push({ key, label, start: iso(start), endExclusive: iso(endEx), end: iso(end), due: iso(due) });
  }
  return out;
}
