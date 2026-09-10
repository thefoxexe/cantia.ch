import { supabase } from '../supabase';
import { getLatestCashSnapshot } from './treasury';
import { computeSalaryBreakdown, listDeductionTypes, listProfileDeductions, listTimeEntries } from './payroll';
import type { PayrollDeductionType, PayrollProfileDeduction } from '../types';

// A read-only, auto-derived view over data Cantia already has (devis/
// factures/dépenses/salaires) — not a real double-entry ledger an org
// maintains itself. Every entry below comes from a fixed, small set of
// posting rules (one per Cantia data type), so it's correct by
// construction rather than something that can drift out of balance —
// but it has no notion of immobilisations, dettes bancaires, capital
// propre, or anything Cantia was never told about. Screens surfacing
// this must say so, same honesty pattern as the TVA report and the
// annual salary summary.

export type AccountCode = '1020' | '1100' | '1170' | '2200' | '2270' | '3200' | '4000' | '5000';

export type AccountType = 'actif' | 'passif' | 'produit' | 'charge';

export const ACCOUNTS: Record<AccountCode, { label: string; type: AccountType }> = {
  '1020': { label: 'Banque / Trésorerie', type: 'actif' },
  '1100': { label: 'Débiteurs (clients)', type: 'actif' },
  '1170': { label: 'TVA préalable', type: 'actif' },
  '2200': { label: 'TVA due', type: 'passif' },
  '2270': { label: 'Charges sociales dues', type: 'passif' },
  '3200': { label: 'Produits des prestations', type: 'produit' },
  '4000': { label: 'Charges de matériel et sous-traitance', type: 'charge' },
  '5000': { label: 'Charges de personnel', type: 'charge' },
};

export interface JournalEntry {
  date: string; // ISO yyyy-mm-dd
  description: string;
  debitAccount: AccountCode;
  creditAccount: AccountCode;
  amount: number;
  source: 'facture' | 'paiement' | 'depense' | 'salaire';
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// Facture émise (statut ni brouillon ni annulée) : Débit Débiteurs, Crédit
// Produits pour le HT et Crédit TVA due pour la TVA — le client doit le
// TTC, l'entreprise ne "gagne" que le HT, et doit le reste à l'AFC.
async function facturesEntries(organizationId: string, periodStart: string, periodEnd: string): Promise<JournalEntry[]> {
  const { data: factures } = await supabase
    .from('factures')
    .select('id, number, vat_rate, created_at, client_name')
    .eq('organization_id', organizationId)
    .not('status', 'in', '(draft,cancelled)')
    .gte('created_at', periodStart)
    .lt('created_at', periodEnd);
  if (!factures?.length) return [];

  const { data: items } = await supabase
    .from('facture_items')
    .select('facture_id, quantity, unit_price')
    .in('facture_id', factures.map((f) => f.id));
  const htByFacture = new Map<string, number>();
  for (const it of items ?? []) {
    htByFacture.set(it.facture_id, (htByFacture.get(it.facture_id) ?? 0) + Number(it.quantity) * Number(it.unit_price));
  }

  const entries: JournalEntry[] = [];
  for (const f of factures) {
    const ht = round2(htByFacture.get(f.id) ?? 0);
    if (ht === 0) continue;
    const vat = round2(ht * (Number(f.vat_rate) / 100));
    const label = [f.number, f.client_name].filter(Boolean).join(' — ');
    const date = String(f.created_at).slice(0, 10);
    entries.push({ date, description: `Facture ${label}`, debitAccount: '1100', creditAccount: '3200', amount: ht, source: 'facture' });
    if (vat > 0) entries.push({ date, description: `TVA — facture ${label}`, debitAccount: '1100', creditAccount: '2200', amount: vat, source: 'facture' });
  }
  return entries;
}

// Paiement reçu sur une facture : Débit Banque, Crédit Débiteurs — le
// client doit moins, la banque a plus.
async function paiementsEntries(organizationId: string, periodStart: string, periodEnd: string): Promise<JournalEntry[]> {
  const { data: payments } = await supabase
    .from('facture_payments')
    .select('amount, paid_at, factures!inner(number, client_name, organization_id)')
    .eq('factures.organization_id', organizationId)
    .gte('paid_at', periodStart)
    .lt('paid_at', periodEnd);
  return (payments ?? []).map((p: any) => {
    const label = [p.factures?.number, p.factures?.client_name].filter(Boolean).join(' — ');
    return {
      date: String(p.paid_at).slice(0, 10),
      description: `Encaissement — facture ${label}`,
      debitAccount: '1020' as const,
      creditAccount: '1100' as const,
      amount: round2(Number(p.amount)),
      source: 'paiement' as const,
    };
  });
}

// Dépense (générale ou de chantier), toujours traitée comme déjà payée —
// Cantia n'a pas de notion de facture fournisseur en attente : Débit
// Charges (+ Débit TVA préalable si un taux est renseigné), Crédit Banque.
async function depensesEntries(organizationId: string, periodStart: string, periodEnd: string): Promise<JournalEntry[]> {
  const entries: JournalEntry[] = [];

  const { data: general } = await supabase
    .from('expenses')
    .select('label, amount_chf, vat_rate, expense_date')
    .eq('organization_id', organizationId)
    .gte('expense_date', periodStart)
    .lt('expense_date', periodEnd);
  for (const e of general ?? []) {
    const total = Number(e.amount_chf);
    if (total === 0) continue;
    const rate = e.vat_rate != null ? Number(e.vat_rate) : null;
    const ht = rate != null ? round2(total / (1 + rate / 100)) : total;
    const vat = round2(total - ht);
    entries.push({ date: e.expense_date, description: e.label, debitAccount: '4000', creditAccount: '1020', amount: ht, source: 'depense' });
    if (vat > 0) entries.push({ date: e.expense_date, description: `TVA — ${e.label}`, debitAccount: '1170', creditAccount: '1020', amount: vat, source: 'depense' });
  }

  const { data: project } = await supabase
    .from('project_expenses')
    .select('label, amount, vat_rate, expense_date, created_at')
    .eq('organization_id', organizationId)
    .or(`and(expense_date.gte.${periodStart},expense_date.lt.${periodEnd}),and(expense_date.is.null,created_at.gte.${periodStart},created_at.lt.${periodEnd})`);
  for (const e of project ?? []) {
    const total = Number(e.amount);
    if (total === 0) continue;
    const rate = e.vat_rate != null ? Number(e.vat_rate) : null;
    const ht = rate != null ? round2(total / (1 + rate / 100)) : total;
    const vat = round2(total - ht);
    const date = e.expense_date ?? String(e.created_at).slice(0, 10);
    entries.push({ date, description: e.label, debitAccount: '4000', creditAccount: '1020', amount: ht, source: 'depense' });
    if (vat > 0) entries.push({ date, description: `TVA — ${e.label}`, debitAccount: '1170', creditAccount: '1020', amount: vat, source: 'depense' });
  }

  return entries;
}

function monthsInRange(periodStart: string, periodEnd: string): { year: number; month: number; start: string; end: string }[] {
  const start = new Date(periodStart);
  const end = new Date(periodEnd);
  const months: { year: number; month: number; start: string; end: string }[] = [];
  let y = start.getUTCFullYear();
  let m = start.getUTCMonth();
  while (Date.UTC(y, m, 1) < end.getTime()) {
    const monthStart = new Date(Date.UTC(y, m, 1));
    const monthEnd = new Date(Date.UTC(y, m + 1, 0));
    months.push({
      year: y,
      month: m,
      start: monthStart.toISOString().slice(0, 10),
      end: monthEnd.toISOString().slice(0, 10),
    });
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }
  return months;
}

// Salaire du mois, par employé : Débit Charges de personnel pour le net
// versé + les charges sociales retenues, Crédit Banque pour le net et
// Crédit Charges sociales dues pour les retenues — même calcul mensuel que
// generate-salary-certificate-pdf, réappliqué mois par mois sur la période.
async function salairesEntries(organizationId: string, periodStart: string, periodEnd: string): Promise<JournalEntry[]> {
  const { data: profiles } = await supabase.from('payroll_profiles').select('*').eq('organization_id', organizationId);
  if (!profiles?.length) return [];

  const { data: members } = await supabase.from('organization_members').select('user_id, full_name').eq('organization_id', organizationId);
  const nameByUser = new Map((members ?? []).map((m: any) => [m.user_id, m.full_name as string | null]));

  const deductionTypes = await listDeductionTypes(organizationId);
  const months = monthsInRange(periodStart, periodEnd);
  const entries: JournalEntry[] = [];

  await Promise.all(
    profiles.map(async (profile: any) => {
      const overrides: PayrollProfileDeduction[] = await listProfileDeductions(organizationId, profile.user_id);
      const isHourly = profile.salary_type === 'hourly';
      const employeeName = nameByUser.get(profile.user_id) ?? 'Employé';

      for (const m of months) {
        const monthHours = isHourly
          ? (await listTimeEntries(organizationId, profile.user_id, m.start, m.end)).reduce((s, e) => s + Number(e.hours), 0)
          : 0;
        const gross = isHourly ? round2(monthHours * Number(profile.hourly_rate_chf ?? 0)) : Number(profile.monthly_salary_chf ?? 0);
        if (gross === 0) continue;

        const breakdown = computeSalaryBreakdown(gross, deductionTypes as PayrollDeductionType[], overrides);
        const label = `${employeeName} — ${m.end.slice(0, 7)}`;
        entries.push({ date: m.end, description: `Salaire net — ${label}`, debitAccount: '5000', creditAccount: '1020', amount: breakdown.net, source: 'salaire' });
        if (breakdown.totalDeductions > 0) {
          entries.push({ date: m.end, description: `Charges sociales — ${label}`, debitAccount: '5000', creditAccount: '2270', amount: breakdown.totalDeductions, source: 'salaire' });
        }
      }
    }),
  );

  return entries;
}

export async function getJournalEntries(organizationId: string, periodStart: string, periodEnd: string): Promise<JournalEntry[]> {
  const [factures, paiements, depenses, salaires] = await Promise.all([
    facturesEntries(organizationId, periodStart, periodEnd),
    paiementsEntries(organizationId, periodStart, periodEnd),
    depensesEntries(organizationId, periodStart, periodEnd),
    salairesEntries(organizationId, periodStart, periodEnd),
  ]);
  return [...factures, ...paiements, ...depenses, ...salaires].sort((a, b) => a.date.localeCompare(b.date));
}

export interface IncomeStatementLine {
  account: AccountCode;
  label: string;
  amount: number;
}

export interface IncomeStatement {
  produits: number;
  charges: IncomeStatementLine[];
  totalCharges: number;
  resultat: number;
}

// Compte de résultat : produits (crédits sur des comptes de type produit)
// moins charges (débits sur des comptes de type charge) — n'inclut ni les
// paiements ni les mouvements de TVA, qui ne sont que des transferts entre
// comptes de bilan et ne changent jamais le résultat.
export function getIncomeStatement(entries: JournalEntry[]): IncomeStatement {
  let produits = 0;
  const chargesByAccount = new Map<AccountCode, number>();
  for (const e of entries) {
    if (ACCOUNTS[e.creditAccount].type === 'produit') produits += e.amount;
    if (ACCOUNTS[e.debitAccount].type === 'charge') {
      chargesByAccount.set(e.debitAccount, (chargesByAccount.get(e.debitAccount) ?? 0) + e.amount);
    }
  }
  const charges = Array.from(chargesByAccount.entries())
    .map(([account, amount]) => ({ account, label: ACCOUNTS[account].label, amount: round2(amount) }))
    .sort((a, b) => b.amount - a.amount);
  const totalCharges = round2(charges.reduce((s, c) => s + c.amount, 0));
  produits = round2(produits);
  return { produits, charges, totalCharges, resultat: round2(produits - totalCharges) };
}

export interface LedgerLine {
  account: AccountCode;
  label: string;
  type: AccountType;
  debit: number;
  credit: number;
  balance: number;
}

// Grand livre : chaque compte touché sur la période, avec ses totaux débit/
// crédit et son solde (débit − crédit) — le solde se lit différemment
// selon le type de compte (un compte de charge/actif au débit, de produit/
// passif au crédit, est "normal"), affiché tel quel plutôt qu'interprété.
export function getLedgerByAccount(entries: JournalEntry[]): LedgerLine[] {
  const debitTotals = new Map<AccountCode, number>();
  const creditTotals = new Map<AccountCode, number>();
  for (const e of entries) {
    debitTotals.set(e.debitAccount, (debitTotals.get(e.debitAccount) ?? 0) + e.amount);
    creditTotals.set(e.creditAccount, (creditTotals.get(e.creditAccount) ?? 0) + e.amount);
  }
  return (Object.keys(ACCOUNTS) as AccountCode[])
    .map((account) => {
      const debit = round2(debitTotals.get(account) ?? 0);
      const credit = round2(creditTotals.get(account) ?? 0);
      return { account, label: ACCOUNTS[account].label, type: ACCOUNTS[account].type, debit, credit, balance: round2(debit - credit) };
    })
    .filter((l) => l.debit !== 0 || l.credit !== 0);
}

export interface FinancialSnapshot {
  cashBalance: number | null;
  cashRecordedAt: string | null;
  receivables: number;
}

// Situation financière "à aujourd'hui" — pas bornée à une période comme le
// reste de ce module. La trésorerie reprend le dernier relevé manuel
// (cash_snapshots, le même chiffre que Trésorerie affiche déjà) plutôt que
// d'être recalculée depuis l'historique complet des mouvements : Cantia ne
// connaît pas le solde bancaire réel du jour où l'entreprise a commencé à
// l'utiliser, donc une somme "depuis toujours" serait fausse. Les créances
// clients, elles, sont entièrement dérivables (chaque facture vit
// intégralement dans Cantia) — factures envoyées/partielles non soldées.
export async function getFinancialSnapshot(organizationId: string): Promise<FinancialSnapshot> {
  const [snapshot, { data: factures }] = await Promise.all([
    getLatestCashSnapshot(organizationId),
    supabase.from('factures').select('id, vat_rate').eq('organization_id', organizationId).in('status', ['sent', 'partial']),
  ]);

  let receivables = 0;
  if (factures?.length) {
    const ids = factures.map((f) => f.id);
    const [{ data: items }, { data: payments }] = await Promise.all([
      supabase.from('facture_items').select('facture_id, quantity, unit_price').in('facture_id', ids),
      supabase.from('facture_payments').select('facture_id, amount').in('facture_id', ids),
    ]);
    const vatByFacture = new Map(factures.map((f) => [f.id, Number(f.vat_rate)]));
    const htByFacture = new Map<string, number>();
    for (const it of items ?? []) htByFacture.set(it.facture_id, (htByFacture.get(it.facture_id) ?? 0) + Number(it.quantity) * Number(it.unit_price));
    const paidByFacture = new Map<string, number>();
    for (const p of payments ?? []) paidByFacture.set(p.facture_id, (paidByFacture.get(p.facture_id) ?? 0) + Number(p.amount));

    for (const f of factures) {
      const ht = htByFacture.get(f.id) ?? 0;
      const ttc = ht * (1 + (vatByFacture.get(f.id) ?? 0) / 100);
      const paid = paidByFacture.get(f.id) ?? 0;
      receivables += Math.max(0, ttc - paid);
    }
  }

  return { cashBalance: snapshot?.balance_chf ?? null, cashRecordedAt: snapshot?.recorded_at ?? null, receivables: round2(receivables) };
}

export function journalEntriesToCsv(entries: JournalEntry[]): string {
  const escape = (v: string) => (/[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const lines = [['Date', 'Description', 'Compte débit', 'Compte crédit', 'Montant (CHF)'].map(escape).join(';')];
  for (const e of entries) {
    lines.push(
      [e.date, e.description, `${e.debitAccount} ${ACCOUNTS[e.debitAccount].label}`, `${e.creditAccount} ${ACCOUNTS[e.creditAccount].label}`, e.amount.toFixed(2)]
        .map(escape)
        .join(';'),
    );
  }
  return lines.join('\n');
}
