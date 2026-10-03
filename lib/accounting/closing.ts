// Year-end closing (bouclement) for a Swiss SME: the adjusting entries an
// accountant would book before closing the books, computed from the trial
// balance and a few figures the company types in. Every result is a
// proposal: the screen (app/(app)/compta/bouclement.tsx) turns it into
// DRAFT entries the user reviews and posts.
// Pure module (no I/O) so it can be tested with node directly.
//
// References (Switzerland):
//  - Ducroire: the tax administrations accept a lump-sum provision of 5 %
//    of Swiss and 10 % of foreign receivables without proof (on top of
//    individual write-offs).
//  - Depreciation: AFC notice A 1995 « Amortissements sur les valeurs
//    immobilisées des entreprises commerciales », declining-balance rates
//    (straight-line = half the rate).
//  - Taxes: Sàrl / SA pay profit tax (federal 8.5 % on profit after tax, i.e.
//    7.83 % effective, plus canton and commune). A sole proprietorship pays
//    no company tax: its owner pays income tax and AVS as self-employed.

export type LegalForm = 'ri' | 'sarl' | 'sa';

export interface ClosingLine {
  account: string; // account code (created on demand if missing)
  debit: number;
  credit: number;
  label: string;
}

export interface ClosingEntryProposal {
  key: string;
  label: string;
  lines: ClosingLine[];
}

const r2 = (n: number) => Math.round(n * 100) / 100;
const r05 = (n: number) => Math.round(n * 20) / 20;

// Accounts the closing uses that the default chart may not have yet.
export const CLOSING_ACCOUNTS: Record<string, { label: string; classNum: number; type: 'actif' | 'passif' | 'produit' | 'charge'; normalBalance: 'debit' | 'credit' }> = {
  '1109': { label: 'Ducroire (provision débiteurs)', classNum: 1, type: 'actif', normalBalance: 'credit' },
  '1300': { label: 'Travaux en cours (chantiers)', classNum: 1, type: 'actif', normalBalance: 'debit' },
  '1400': { label: 'Charges payées d’avance', classNum: 1, type: 'actif', normalBalance: 'debit' },
  '1410': { label: 'Produits à recevoir', classNum: 1, type: 'actif', normalBalance: 'debit' },
  '1609': { label: 'Amortissements cumulés', classNum: 1, type: 'actif', normalBalance: 'credit' },
  '2330': { label: 'Charges à payer', classNum: 2, type: 'passif', normalBalance: 'credit' },
  '2340': { label: 'Produits encaissés d’avance', classNum: 2, type: 'passif', normalBalance: 'credit' },
  '2350': { label: 'Provision pour impôts', classNum: 2, type: 'passif', normalBalance: 'credit' },
  '3200': { label: 'Produits des prestations', classNum: 3, type: 'produit', normalBalance: 'credit' },
  '3805': { label: 'Pertes sur créances, variation du ducroire', classNum: 3, type: 'produit', normalBalance: 'credit' },
  '3940': { label: 'Variation des prestations non facturées (travaux en cours)', classNum: 3, type: 'produit', normalBalance: 'credit' },
  '6500': { label: 'Autres charges d’exploitation', classNum: 6, type: 'charge', normalBalance: 'debit' },
  '6800': { label: 'Amortissements', classNum: 6, type: 'charge', normalBalance: 'debit' },
  '8900': { label: 'Impôts directs', classNum: 8, type: 'charge', normalBalance: 'debit' },
};

// --- 1. Ducroire ---------------------------------------------------------

export interface DucroireInput {
  swissReceivables: number; // open Swiss customer invoices at year end
  foreignReceivables: number;
  currentProvision: number; // credit balance of 1109 (positive)
  swissRate?: number; // % default 5
  foreignRate?: number; // % default 10
}

export function ducroire(input: DucroireInput): { target: number; change: number; entry: ClosingEntryProposal | null } {
  const target = r05((input.swissReceivables * (input.swissRate ?? 5)) / 100 + (input.foreignReceivables * (input.foreignRate ?? 10)) / 100);
  const change = r2(target - input.currentProvision);
  if (Math.abs(change) < 0.05) return { target, change: 0, entry: null };
  const label = change > 0 ? 'Bouclement : constitution du ducroire' : 'Bouclement : dissolution partielle du ducroire';
  return {
    target,
    change,
    entry: {
      key: 'ducroire',
      label,
      lines:
        change > 0
          ? [
              { account: '3805', debit: change, credit: 0, label },
              { account: '1109', debit: 0, credit: change, label },
            ]
          : [
              { account: '1109', debit: -change, credit: 0, label },
              { account: '3805', debit: 0, credit: -change, label },
            ],
    },
  };
}

// --- 2. Amortissements ----------------------------------------------------

export interface AssetCategory {
  key: string;
  label: string;
  rate: number; // AFC declining-balance rate, %
}

// AFC notice A 1995 (dégressif). Straight-line: half these rates.
export const ASSET_CATEGORIES: AssetCategory[] = [
  { key: 'machines', label: 'Machines et outillage', rate: 30 },
  { key: 'vehicules', label: 'Véhicules', rate: 40 },
  { key: 'informatique', label: 'Informatique et logiciels', rate: 40 },
  { key: 'mobilier', label: 'Mobilier et installations', rate: 25 },
  { key: 'outillage', label: 'Petit outillage, appareils', rate: 45 },
  { key: 'batiments', label: 'Bâtiments d’exploitation', rate: 8 },
];

export interface AssetInput {
  key: string;
  bookValue: number; // net book value at year end, before this year's depreciation
  rate: number; // %
}

export function depreciation(assets: AssetInput[]): { lines: { key: string; amount: number }[]; total: number; entry: ClosingEntryProposal | null } {
  const lines = assets.filter((a) => a.bookValue > 0 && a.rate > 0).map((a) => ({ key: a.key, amount: r05((a.bookValue * a.rate) / 100) }));
  const total = r2(lines.reduce((s, l) => s + l.amount, 0));
  if (!total) return { lines, total: 0, entry: null };
  const label = 'Bouclement : amortissements de l’exercice';
  return {
    lines,
    total,
    entry: {
      key: 'amortissements',
      label,
      lines: [
        { account: '6800', debit: total, credit: 0, label },
        { account: '1609', debit: 0, credit: total, label },
      ],
    },
  };
}

// --- 3. Transitoires --------------------------------------------------------

export type AccrualKind = 'prepaid_expense' | 'accrued_expense' | 'accrued_income' | 'deferred_income';

export interface AccrualInput {
  kind: AccrualKind;
  label: string;
  amount: number;
}

// prepaid_expense: paid this year for next year (insurance paid in advance) → 1400 / 6500
// accrued_expense: belongs to this year, invoice not received yet → 6500 / 2330
// accrued_income:  earned this year, not invoiced yet → 1410 / 3200
// deferred_income: invoiced this year for next year → 3200 / 2340
export function accruals(items: AccrualInput[]): ClosingEntryProposal[] {
  return items
    .filter((i) => i.amount > 0 && i.label.trim())
    .map((i, idx) => {
      const label = `Bouclement : ${i.label.trim()}`;
      const amount = r2(i.amount);
      const [debit, credit] =
        i.kind === 'prepaid_expense' ? ['1400', '6500'] : i.kind === 'accrued_expense' ? ['6500', '2330'] : i.kind === 'accrued_income' ? ['1410', '3200'] : ['3200', '2340'];
      return {
        key: `transitoire-${idx}`,
        label,
        lines: [
          { account: debit, debit: amount, credit: 0, label },
          { account: credit, debit: 0, credit: amount, label },
        ],
      };
    });
}

// --- 4. Travaux en cours ----------------------------------------------------

// Work done on chantiers and not invoiced at year end, valued at cost
// (materials + hours), adjusted against what 1300 already holds.
export function workInProgress(value: number, currentBalance: number): { change: number; entry: ClosingEntryProposal | null } {
  const change = r2(value - currentBalance);
  if (Math.abs(change) < 0.05) return { change: 0, entry: null };
  const label = change > 0 ? 'Bouclement : augmentation des travaux en cours' : 'Bouclement : diminution des travaux en cours';
  return {
    change,
    entry: {
      key: 'travaux-en-cours',
      label,
      lines:
        change > 0
          ? [
              { account: '1300', debit: change, credit: 0, label },
              { account: '3940', debit: 0, credit: change, label },
            ]
          : [
              { account: '3940', debit: -change, credit: 0, label },
              { account: '1300', debit: 0, credit: -change, label },
            ],
    },
  };
}

// --- 5. Impôts --------------------------------------------------------------

// Indicative effective profit-tax rates (federal + canton + commune, cantonal
// capital, % of profit before tax), rounded. They move every year and differ
// by commune: an estimate to provision, never a tax computation.
export const PROFIT_TAX_RATES: Record<string, number> = {
  AG: 15.1, AI: 12.7, AR: 13.0, BE: 21.0, BL: 13.4, BS: 13.0, FR: 13.9, GE: 14.0, GL: 12.3, GR: 14.8, JU: 15.0, LU: 12.3, NE: 13.6,
  NW: 12.0, OW: 12.7, SG: 14.4, SH: 13.0, SO: 15.3, SZ: 14.1, TG: 13.3, TI: 19.2, UR: 12.6, VD: 14.0, VS: 17.1, ZG: 11.9, ZH: 19.6,
};

export interface TaxInput {
  legalForm: LegalForm;
  profitBeforeTax: number; // after the other closing entries
  ratePercent: number; // effective profit-tax rate (Sàrl / SA)
  alreadyProvisioned: number; // credit balance of 2350
  capitalTax?: number; // optional, typed in
}

export function taxProvision(input: TaxInput): { tax: number; change: number; avsSelfEmployed: number; entry: ClosingEntryProposal | null } {
  if (input.legalForm === 'ri') {
    // No company tax. AVS/AI/APG of the self-employed: up to 10 % of the
    // profit (sliding scale below about CHF 60'000), paid by the owner.
    return { tax: 0, change: 0, avsSelfEmployed: r05(Math.max(0, input.profitBeforeTax) * 0.1), entry: null };
  }
  const tax = r05(Math.max(0, input.profitBeforeTax) * (input.ratePercent / 100) + (input.capitalTax ?? 0));
  const change = r2(tax - input.alreadyProvisioned);
  if (Math.abs(change) < 0.05) return { tax, change: 0, avsSelfEmployed: 0, entry: null };
  const label = 'Bouclement : provision pour impôts sur le bénéfice et le capital';
  return {
    tax,
    change,
    avsSelfEmployed: 0,
    entry: {
      key: 'impots',
      label,
      lines:
        change > 0
          ? [
              { account: '8900', debit: change, credit: 0, label },
              { account: '2350', debit: 0, credit: change, label },
            ]
          : [
              { account: '2350', debit: -change, credit: 0, label },
              { account: '8900', debit: 0, credit: -change, label },
            ],
    },
  };
}

// --- Checks -----------------------------------------------------------------

export interface ClosingChecksInput {
  draftEntries: number;
  unmatchedBankTransactions: number;
  trialDebit: number;
  trialCredit: number;
  bankLedgerBalance: number | null; // 1020 at year end
  bankStatementBalance: number | null; // last imported statement
  vatPeriodsOpen: number; // VAT periods of the year not yet declared (registered companies)
  balanceSheetGap: number;
}

export type CheckStatus = 'ok' | 'warning' | 'blocking';

export interface ClosingCheck {
  key: 'drafts' | 'bank_matching' | 'trial_balance' | 'bank_reconciliation' | 'vat' | 'balance_sheet';
  status: CheckStatus;
  value?: number;
}

export function closingChecks(i: ClosingChecksInput): ClosingCheck[] {
  const checks: ClosingCheck[] = [];
  checks.push({ key: 'drafts', status: i.draftEntries > 0 ? 'blocking' : 'ok', value: i.draftEntries });
  checks.push({ key: 'bank_matching', status: i.unmatchedBankTransactions > 0 ? 'warning' : 'ok', value: i.unmatchedBankTransactions });
  const diff = r2(i.trialDebit - i.trialCredit);
  checks.push({ key: 'trial_balance', status: Math.abs(diff) > 0.01 ? 'blocking' : 'ok', value: diff });
  if (i.bankLedgerBalance != null && i.bankStatementBalance != null) {
    const gap = r2(i.bankLedgerBalance - i.bankStatementBalance);
    checks.push({ key: 'bank_reconciliation', status: Math.abs(gap) > 0.05 ? 'warning' : 'ok', value: gap });
  }
  checks.push({ key: 'vat', status: i.vatPeriodsOpen > 0 ? 'warning' : 'ok', value: i.vatPeriodsOpen });
  checks.push({ key: 'balance_sheet', status: Math.abs(i.balanceSheetGap) > 0.05 ? 'blocking' : 'ok', value: r2(i.balanceSheetGap) });
  return checks;
}

// Effect of the proposals on the result (charges − / produits +).
export function resultImpact(entries: ClosingEntryProposal[]): number {
  let impact = 0;
  for (const e of entries) {
    for (const l of e.lines) {
      const cls = l.account[0];
      if (cls === '3') impact += l.credit - l.debit;
      else if (cls >= '4' && cls <= '8') impact -= l.debit - l.credit;
    }
  }
  return r2(impact);
}
