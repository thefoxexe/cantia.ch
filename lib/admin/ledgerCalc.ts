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
  source: 'manuel' | 'stripe' | 'recurrent';
  source_id: string | null;
  proof?: ProofKind | null; // how it is justified when no file is attached
  recurring_id?: string | null;
}

// ---- Justificatifs ----------------------------------------------------------
// A file attached is the best proof. Without one, the entry says where the
// proof is: an invoice that can be downloaded any time from the supplier's
// account (Google Ads, Meta, Stripe…), the bank or card statement only, or an
// internal receipt written when no document exists (parking meter, tip…).
export type ProofKind = 'piece' | 'facture_en_ligne' | 'releve' | 'quittance_interne';

export const PROOFS: { key: ProofKind; label: string; short: string; level: 'ok' | 'weak' }[] = [
  { key: 'piece', label: 'Facture ou ticket conservé (papier ou PDF ailleurs)', short: 'Pièce conservée', level: 'ok' },
  { key: 'facture_en_ligne', label: 'Facture téléchargeable dans le compte du fournisseur', short: 'Facture en ligne', level: 'ok' },
  { key: 'quittance_interne', label: 'Quittance interne (aucun document n’existe)', short: 'Quittance interne', level: 'weak' },
  { key: 'releve', label: 'Seulement le relevé bancaire ou de carte', short: 'Relevé seul', level: 'weak' },
];

export type ProofStatus = 'file' | 'stripe' | 'declared' | 'weak' | 'missing' | 'na';

// Income needs no receipt from you (your own invoices / Stripe are the proof).
export function proofStatus(e: Pick<LedgerEntry, 'kind' | 'receipt_path' | 'source' | 'proof'>): ProofStatus {
  if (e.kind === 'recette') return 'na';
  if (e.receipt_path) return e.proof === 'quittance_interne' ? 'weak' : 'file';
  if (e.source === 'stripe') return 'stripe';
  if (!e.proof) return 'missing';
  return PROOFS.find((p) => p.key === e.proof)?.level === 'weak' ? 'weak' : 'declared';
}

export function isJustified(e: Pick<LedgerEntry, 'kind' | 'receipt_path' | 'source' | 'proof'>): boolean {
  return proofStatus(e) !== 'missing';
}

// What to keep, by expense category, and where to find it.
export const PROOF_GUIDE: Record<string, string> = {
  logiciels: 'Facture mensuelle ou annuelle dans le compte du service (Billing / Facturation). Téléchargez le PDF chaque mois ou chaque année.',
  marketing: 'Google Ads : Facturation › Documents (une facture ou un reçu par paiement). Meta : Paramètres de facturation › Activité de paiement › Télécharger. LinkedIn : Campaign Manager › Historique de facturation. Ces documents existent toujours, même si vous ne les avez pas encore téléchargés.',
  materiel: 'Facture ou ticket de caisse. À partir d’environ CHF 1’000, le matériel durable est en principe amorti sur plusieurs années plutôt que déduit d’un coup : demandez à votre fiduciaire.',
  telecom: 'Facture de l’opérateur (My Swisscom, Salt, Sunrise…). Si l’abonnement sert aussi en privé, ne comptez que la part professionnelle et notez le pourcentage.',
  deplacements: 'Billets CFF (historique d’achats SwissPass), tickets de parking, carburant. Voiture privée : carnet de bord (date, trajet, km, motif), puis un forfait par km.',
  repas: 'Ticket + au dos ou en note : avec qui et dans quel but professionnel. Vos repas seuls en déplacement sont souvent limités par le fisc.',
  bureau: 'Contrat de bail et quittances. Bureau à domicile : seulement si une pièce sert surtout à l’activité ; notez la surface et le calcul.',
  assurances: 'Police et facture de prime (RC professionnelle, choses…). Les primes privées (maladie, 3e pilier) ne vont pas ici.',
  formation: 'Facture du cours, du livre ou de l’abonnement. Le lien avec l’activité actuelle doit être clair.',
  honoraires: 'Facture de la fiduciaire, de l’avocat ou du notaire.',
  sous_traitance: 'Facture du freelance ou du sous-traitant, avec son nom et son adresse.',
  frais_financiers: 'Relevé de frais de la banque ou rapport de frais Stripe / TWINT. Le relevé suffit généralement.',
  taxes: 'Décision ou facture de l’autorité (registre du commerce, émoluments).',
  autres_charges: 'Facture ou ticket, et une note sur le lien avec l’activité.',
};

// ---- Récurrents -------------------------------------------------------------
export type Frequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export const FREQUENCIES: { key: Frequency; label: string; perYear: number }[] = [
  { key: 'weekly', label: 'Chaque semaine', perYear: 52 },
  { key: 'monthly', label: 'Chaque mois', perYear: 12 },
  { key: 'quarterly', label: 'Chaque trimestre', perYear: 4 },
  { key: 'yearly', label: 'Chaque année', perYear: 1 },
];

export interface RecurringRule {
  id: string;
  kind: LedgerKind;
  category: string;
  label: string;
  counterparty: string | null;
  amount_chf: number;
  vat_rate: number;
  payment_method: string | null;
  frequency: Frequency;
  day_of_month: number;
  start_date: string;
  end_date: string | null;
  last_date: string | null;
  proof: ProofKind | null;
  notes: string | null;
  active: boolean;
}

const pad2 = (n: number) => String(n).padStart(2, '0');
const isoOf = (d: Date) => `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
const dim = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate(); // m: 1-12

// Every date of the rule from its start up to `until` (inclusive), capped.
export function occurrences(rule: Pick<RecurringRule, 'frequency' | 'day_of_month' | 'start_date' | 'end_date'>, until: string, cap = 400): string[] {
  const end = rule.end_date && rule.end_date < until ? rule.end_date : until;
  const out: string[] = [];
  if (rule.start_date > end) return out;
  if (rule.frequency === 'weekly') {
    const d = new Date(`${rule.start_date}T00:00:00Z`);
    while (out.length < cap) {
      const iso = isoOf(d);
      if (iso > end) break;
      out.push(iso);
      d.setUTCDate(d.getUTCDate() + 7);
    }
    return out;
  }
  const step = rule.frequency === 'monthly' ? 1 : rule.frequency === 'quarterly' ? 3 : 12;
  let y = Number(rule.start_date.slice(0, 4));
  let m = Number(rule.start_date.slice(5, 7));
  // First occurrence on or after the start date.
  if (Math.min(rule.day_of_month, dim(y, m)) < Number(rule.start_date.slice(8, 10))) {
    m += step;
    while (m > 12) (m -= 12), (y += 1);
  }
  while (out.length < cap) {
    const iso = `${y}-${pad2(m)}-${pad2(Math.min(rule.day_of_month, dim(y, m)))}`;
    if (iso > end) break;
    out.push(iso);
    m += step;
    while (m > 12) (m -= 12), (y += 1);
  }
  return out;
}

// Occurrences not posted yet (after last_date), up to today.
export function dueOccurrences(rule: RecurringRule, today: string): string[] {
  if (!rule.active) return [];
  return occurrences(rule, today).filter((d) => !rule.last_date || d > rule.last_date);
}

export function nextOccurrence(rule: RecurringRule, today: string): string | null {
  if (!rule.active) return null;
  const y = Number(today.slice(0, 4));
  const list = occurrences(rule, `${y + 2}-12-31`).filter((d) => d > today && (!rule.last_date || d > rule.last_date));
  return list[0] ?? null;
}

export function monthlyEquivalent(rule: Pick<RecurringRule, 'frequency' | 'amount_chf'>): number {
  const f = FREQUENCIES.find((x) => x.key === rule.frequency)?.perYear ?? 12;
  return r2((Number(rule.amount_chf) * f) / 12);
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
      (!f.missingReceipt || !isJustified(e)) &&
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
  missingReceipts: number; // expenses with no proof at all
  weakProofs: number; // bank statement only / internal receipt
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
    missingReceipts: entries.filter((e) => !isJustified(e)).length,
    weakProofs: entries.filter((e) => proofStatus(e) === 'weak').length,
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
        e.receipt_path ? 'fichier joint' : e.source === 'stripe' ? 'Stripe' : PROOFS.find((p) => p.key === e.proof)?.short ?? (e.kind === 'recette' ? '' : 'manquant'),
        e.notes ?? '',
      ]
        .map(esc)
        .join(';'),
    );
  return [head.join(';'), ...rows].join('\n');
}
