// Self-employed bookkeeping of the platform owner (admin › Comptabilité):
// categories and the figures of the yearly income statement. Pure (no
// I/O) so scripts/ledger.test.mjs can check them with node.

export type LedgerKind = 'recette' | 'depense';

export interface LedgerEntry {
  id: string;
  entry_date: string; // YYYY-MM-DD
  kind: LedgerKind;
  category: string;
  label: string;
  counterparty: string | null;
  amount_chf: number; // what was actually paid / received (VAT included)
  vat_rate: number;
  payment_method: string | null;
  reference: string | null;
  receipt_path: string | null;
  notes: string | null;
  source: 'manuel' | 'stripe';
  source_id: string | null;
}

export const CATEGORIES: Record<LedgerKind, { key: string; label: string }[]> = {
  recette: [
    { key: 'ventes', label: 'Ventes et abonnements' },
    { key: 'prestations', label: 'Prestations de services' },
    { key: 'commissions', label: 'Commissions reçues' },
    { key: 'autres_produits', label: 'Autres produits' },
  ],
  depense: [
    { key: 'logiciels', label: 'Logiciels, hébergement et abonnements' },
    { key: 'marketing', label: 'Marketing et publicité' },
    { key: 'materiel', label: 'Matériel et équipement' },
    { key: 'telecom', label: 'Téléphone et internet' },
    { key: 'deplacements', label: 'Déplacements et véhicule' },
    { key: 'repas', label: 'Repas et représentation' },
    { key: 'bureau', label: 'Loyer et frais de bureau' },
    { key: 'assurances', label: 'Assurances' },
    { key: 'formation', label: 'Formation et documentation' },
    { key: 'honoraires', label: 'Honoraires (fiduciaire, juridique)' },
    { key: 'sous_traitance', label: 'Sous-traitance et freelances' },
    { key: 'frais_financiers', label: 'Frais bancaires et de paiement' },
    { key: 'taxes', label: 'Taxes et émoluments' },
    { key: 'autres_charges', label: 'Autres charges' },
  ],
};

export function categoryLabel(kind: LedgerKind, key: string): string {
  return CATEGORIES[kind].find((c) => c.key === key)?.label ?? key;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export interface LedgerFilter {
  from?: string;
  to?: string;
  kind?: LedgerKind | 'all';
  categories?: string[]; // empty = all
  search?: string;
  missingReceipt?: boolean;
}

export function filterEntries(entries: LedgerEntry[], f: LedgerFilter): LedgerEntry[] {
  const q = (f.search ?? '').trim().toLowerCase();
  return entries.filter(
    (e) =>
      (!f.from || e.entry_date >= f.from) &&
      (!f.to || e.entry_date <= f.to) &&
      (!f.kind || f.kind === 'all' || e.kind === f.kind) &&
      (!f.categories?.length || f.categories.includes(e.category)) &&
      (!f.missingReceipt || !e.receipt_path) &&
      (!q || [e.label, e.counterparty, e.reference, e.notes].some((v) => v?.toLowerCase().includes(q))),
  );
}

// VAT contained in an amount that includes it.
export const vatIncluded = (amount: number, rate: number) => (rate > 0 ? r2((amount * rate) / (100 + rate)) : 0);

export interface LedgerSummary {
  income: number;
  expenses: number;
  profit: number;
  marginPercent: number;
  incomeVat: number;
  expensesVat: number;
  count: number;
  missingReceipts: number; // expenses without a receipt
  byCategory: { kind: LedgerKind; category: string; label: string; total: number; count: number; share: number }[];
  byMonth: { month: string; income: number; expenses: number; profit: number; cumulative: number }[];
}

// Every month of a period, so empty months still show (« 2026-01 » …).
export function monthsBetween(from: string, to: string): string[] {
  const out: string[] = [];
  let y = Number(from.slice(0, 4));
  let m = Number(from.slice(5, 7));
  const end = to.slice(0, 7);
  for (let guard = 0; guard < 600; guard++) {
    const key = `${y}-${String(m).padStart(2, '0')}`;
    if (key > end) break;
    out.push(key);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}

const iso = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const lastDay = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

// The calendar year when the period is exactly one, else null.
export function fullYearOf(from: string, to: string): number | null {
  const y = Number(from.slice(0, 4));
  return from === iso(y, 1, 1) && to === iso(y, 12, 31) ? y : null;
}

export interface PeriodPreset {
  key: string;
  label: string;
  from: string;
  to: string;
}

// Quick choices of the export dialog, relative to today (YYYY-MM-DD).
export function periodPresets(today: string): PeriodPreset[] {
  const y = Number(today.slice(0, 4));
  const m = Number(today.slice(5, 7));
  const pm = m === 1 ? 12 : m - 1;
  const py = m === 1 ? y - 1 : y;
  const q = Math.floor((m - 1) / 3);
  const MONTH = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const list: PeriodPreset[] = [
    { key: 'month', label: `Ce mois (${MONTH[m - 1]})`, from: iso(y, m, 1), to: iso(y, m, lastDay(y, m)) },
    { key: 'prev-month', label: `Mois passé (${MONTH[pm - 1]})`, from: iso(py, pm, 1), to: iso(py, pm, lastDay(py, pm)) },
  ];
  for (let i = 0; i <= q; i++) list.push({ key: `q${i + 1}`, label: `T${i + 1} ${y}`, from: iso(y, i * 3 + 1, 1), to: iso(y, i * 3 + 3, lastDay(y, i * 3 + 3)) });
  if (q === 0) list.push({ key: 'q4-prev', label: `T4 ${y - 1}`, from: iso(y - 1, 10, 1), to: iso(y - 1, 12, 31) });
  list.push(
    { key: 'h1', label: `1er semestre ${y}`, from: iso(y, 1, 1), to: iso(y, 6, 30) },
    ...(m > 6 ? [{ key: 'h2', label: `2e semestre ${y}`, from: iso(y, 7, 1), to: iso(y, 12, 31) }] : []),
    { key: 'ytd', label: `Depuis le 1er janvier`, from: iso(y, 1, 1), to: today },
    { key: 'year', label: `Année ${y}`, from: iso(y, 1, 1), to: iso(y, 12, 31) },
    { key: 'prev-year', label: `Année ${y - 1}`, from: iso(y - 1, 1, 1), to: iso(y - 1, 12, 31) },
    { key: '12m', label: '12 derniers mois', from: iso(m === 12 ? y : y - 1, m === 12 ? 1 : m + 1, 1), to: iso(y, m, lastDay(y, m)) },
  );
  return list;
}

// period: a calendar year, or { from, to } — every month of it is listed.
export function summarize(entries: LedgerEntry[], period?: number | { from: string; to: string }): LedgerSummary {
  let income = 0;
  let expenses = 0;
  let incomeVat = 0;
  let expensesVat = 0;
  const cats = new Map<string, { kind: LedgerKind; category: string; total: number; count: number }>();
  const months = new Map<string, { income: number; expenses: number }>();
  const range = typeof period === 'number' ? { from: `${period}-01-01`, to: `${period}-12-31` } : period;
  if (range) for (const mk of monthsBetween(range.from, range.to)) months.set(mk, { income: 0, expenses: 0 });
  for (const e of entries) {
    const a = Number(e.amount_chf);
    const key = `${e.kind}:${e.category}`;
    const c = cats.get(key) ?? { kind: e.kind, category: e.category, total: 0, count: 0 };
    c.total += a;
    c.count += 1;
    cats.set(key, c);
    const mk = e.entry_date.slice(0, 7);
    const m = months.get(mk) ?? { income: 0, expenses: 0 };
    if (e.kind === 'recette') {
      income += a;
      incomeVat += vatIncluded(a, Number(e.vat_rate));
      m.income += a;
    } else {
      expenses += a;
      expensesVat += vatIncluded(a, Number(e.vat_rate));
      m.expenses += a;
    }
    months.set(mk, m);
  }
  let cumulative = 0;
  const byMonth = [...months.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, v]) => {
      cumulative += v.income - v.expenses;
      return { month, income: r2(v.income), expenses: r2(v.expenses), profit: r2(v.income - v.expenses), cumulative: r2(cumulative) };
    });
  const byCategory = [...cats.values()]
    .map((c) => ({ ...c, total: r2(c.total), label: categoryLabel(c.kind, c.category), share: r2((c.total / Math.max(0.01, c.kind === 'recette' ? income : expenses)) * 100) }))
    .sort((a, b) => (a.kind === b.kind ? b.total - a.total : a.kind === 'recette' ? -1 : 1));
  return {
    income: r2(income),
    expenses: r2(expenses),
    profit: r2(income - expenses),
    marginPercent: income > 0 ? r2(((income - expenses) / income) * 100) : 0,
    incomeVat: r2(incomeVat),
    expensesVat: r2(expensesVat),
    count: entries.length,
    missingReceipts: entries.filter((e) => e.kind === 'depense' && !e.receipt_path).length,
    byCategory,
    byMonth,
  };
}

export function ledgerCsv(entries: LedgerEntry[]): string {
  const esc = (v: string) => (/[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const head = ['N°', 'Date', 'Type', 'Catégorie', 'Libellé', 'Contrepartie', 'Référence', 'Moyen de paiement', 'TVA %', 'TVA incluse', 'Montant CHF', 'Justificatif', 'Notes'];
  const rows = [...entries]
    .sort((a, b) => (a.entry_date < b.entry_date ? -1 : a.entry_date > b.entry_date ? 1 : 0))
    .map((e, i) =>
      [
        String(i + 1),
        e.entry_date,
        e.kind === 'recette' ? 'Recette' : 'Dépense',
        categoryLabel(e.kind, e.category),
        e.label,
        e.counterparty ?? '',
        e.reference ?? '',
        e.payment_method ?? '',
        String(e.vat_rate ?? 0),
        vatIncluded(Number(e.amount_chf), Number(e.vat_rate)).toFixed(2),
        (e.kind === 'depense' ? -1 : 1) * Number(e.amount_chf) + '',
        e.receipt_path ? 'oui' : 'non',
        e.notes ?? '',
      ]
        .map(esc)
        .join(';'),
    );
  return [head.join(';'), ...rows].join('\n');
}
