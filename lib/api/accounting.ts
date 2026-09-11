import { supabase } from '../supabase';
import { invokeFunction } from './functions';
import { getLatestCashSnapshot } from './treasury';

// Real double-entry bookkeeping (Cahier des charges V2, Lot 1) — every
// operation Cantia already knows about (factures, encaissements, dépenses)
// is posted automatically as a balanced pièce by DB triggers; salaires are
// posted monthly via postPayrollMonth (no single row a trigger can hang
// off). Manual entries go through createDraftEntry -> addEntryLine ->
// postEntry, same brouillon -> comptabilisée lifecycle enforced server-side
// (post_accounting_entry / reverse_accounting_entry — see migrations
// 20260911233000-236000).

export interface AccountingAccount {
  id: string;
  organization_id: string;
  code: string;
  label: string;
  class: number;
  type: 'actif' | 'passif' | 'produit' | 'charge';
  normal_balance: 'debit' | 'credit';
  parent_account_id: string | null;
  is_active: boolean;
  is_system: boolean;
}

export interface FiscalYear {
  id: string;
  organization_id: string;
  start_date: string;
  end_date: string;
  status: 'open' | 'closing' | 'closed';
  locked_until_date: string | null;
}

export interface AccountingJournal {
  id: string;
  organization_id: string;
  code: string;
  label: string;
  kind: 'system' | 'custom';
  is_active: boolean;
}

export type EntryStatus = 'brouillon' | 'validee' | 'comptabilisee' | 'extournee';

export interface AccountingEntry {
  id: string;
  organization_id: string;
  fiscal_year_id: string;
  journal_id: string;
  entry_number: number | null;
  entry_date: string;
  label: string;
  external_reference: string | null;
  source: string;
  source_id: string | null;
  status: EntryStatus;
  reversed_entry_id: string | null;
  created_at: string;
}

export interface AccountingEntryLine {
  id: string;
  entry_id: string;
  account_id: string;
  debit: number;
  credit: number;
  label: string | null;
  project_id: string | null;
  sort_order: number;
}

export interface AccountingEntryLineWithAccount extends AccountingEntryLine {
  account_code: string;
  account_label: string;
}

export interface AccountingEntryWithLines extends AccountingEntry {
  journal_code: string;
  journal_label: string;
  lines: AccountingEntryLineWithAccount[];
}

// ==========================================================================
// Chart of accounts, fiscal years, journals
// ==========================================================================

export async function listAccounts(organizationId: string, includeInactive = false): Promise<AccountingAccount[]> {
  let query = supabase.from('accounting_accounts').select('*').eq('organization_id', organizationId).order('code', { ascending: true });
  if (!includeInactive) query = query.eq('is_active', true);
  const { data } = await query;
  return (data ?? []) as AccountingAccount[];
}

export async function createAccount(
  organizationId: string,
  input: { code: string; label: string; classNum: number; type: AccountingAccount['type']; normalBalance: 'debit' | 'credit' },
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('accounting_accounts').insert({
    organization_id: organizationId,
    code: input.code.trim(),
    label: input.label.trim(),
    class: input.classNum,
    type: input.type,
    normal_balance: input.normalBalance,
  });
  return { error: error?.message ?? null };
}

// §4.1 "un compte utilisé ne peut plus être supprimé, seulement archivé" —
// this only ever flips is_active, never deletes (no delete RLS policy
// exists on accounting_accounts).
export async function setAccountActive(id: string, isActive: boolean): Promise<{ error: string | null }> {
  const { error } = await supabase.from('accounting_accounts').update({ is_active: isActive, updated_at: new Date().toISOString() }).eq('id', id);
  return { error: error?.message ?? null };
}

export async function listFiscalYears(organizationId: string): Promise<FiscalYear[]> {
  const { data } = await supabase.from('accounting_fiscal_years').select('*').eq('organization_id', organizationId).order('start_date', { ascending: false });
  return (data ?? []) as FiscalYear[];
}

export async function getFiscalYearForDate(organizationId: string, date: string): Promise<FiscalYear | null> {
  const { data } = await supabase
    .from('accounting_fiscal_years')
    .select('*')
    .eq('organization_id', organizationId)
    .lte('start_date', date)
    .gte('end_date', date)
    .maybeSingle();
  return (data as FiscalYear) ?? null;
}

export async function createFiscalYear(organizationId: string, startDate: string, endDate: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('accounting_fiscal_years').insert({ organization_id: organizationId, start_date: startDate, end_date: endDate });
  return { error: error?.message ?? null };
}

// Partial lock (§4.2 "verrouillage jusqu'à une date") — entries dated on
// or before untilDate can no longer be posted; the year stays open for
// later dates. Pass null to unlock.
export async function lockFiscalYearUntil(id: string, untilDate: string | null): Promise<{ error: string | null }> {
  const { error } = await supabase.from('accounting_fiscal_years').update({ locked_until_date: untilDate }).eq('id', id);
  return { error: error?.message ?? null };
}

// Full close — no further postings at all for this year. This is the
// blocking mechanism itself (§ critère "une période verrouillée refuse les
// écritures"); the fuller "assistant de clôture" (§4.7: balance checks,
// résultat -> nouvel exercice report, réouverture) is not built yet.
export async function closeFiscalYear(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('accounting_fiscal_years').update({ status: 'closed' }).eq('id', id);
  return { error: error?.message ?? null };
}

export async function listJournals(organizationId: string): Promise<AccountingJournal[]> {
  const { data } = await supabase.from('accounting_journals').select('*').eq('organization_id', organizationId).eq('is_active', true).order('code');
  return (data ?? []) as AccountingJournal[];
}

// ==========================================================================
// Manual entries — brouillon (direct table access, RLS-gated to
// can_manage_org_accounting_drafts and status='brouillon') -> comptabilisée
// (via the post_accounting_entry RPC only).
// ==========================================================================

export async function createDraftEntry(params: {
  organizationId: string;
  fiscalYearId: string;
  journalId: string;
  entryDate: string;
  label: string;
  externalReference?: string | null;
}): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from('accounting_entries')
    .insert({
      organization_id: params.organizationId,
      fiscal_year_id: params.fiscalYearId,
      journal_id: params.journalId,
      entry_date: params.entryDate,
      label: params.label.trim(),
      external_reference: params.externalReference ?? null,
      source: 'manuelle',
      status: 'brouillon',
    })
    .select('id')
    .single();
  return { id: data?.id ?? null, error: error?.message ?? null };
}

export async function updateDraftEntry(id: string, updates: { entryDate: string; label: string; journalId: string }): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('accounting_entries')
    .update({ entry_date: updates.entryDate, label: updates.label.trim(), journal_id: updates.journalId, updated_at: new Date().toISOString() })
    .eq('id', id);
  return { error: error?.message ?? null };
}

export async function deleteDraftEntry(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('accounting_entries').delete().eq('id', id);
  return { error: error?.message ?? null };
}

export async function addEntryLine(params: {
  entryId: string;
  accountId: string;
  debit: number;
  credit: number;
  label?: string | null;
  projectId?: string | null;
  sortOrder: number;
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from('accounting_entry_lines').insert({
    entry_id: params.entryId,
    account_id: params.accountId,
    debit: params.debit,
    credit: params.credit,
    label: params.label ?? null,
    project_id: params.projectId ?? null,
    sort_order: params.sortOrder,
  });
  return { error: error?.message ?? null };
}

export async function updateEntryLine(
  id: string,
  updates: { accountId: string; debit: number; credit: number; label: string | null; projectId: string | null },
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('accounting_entry_lines')
    .update({ account_id: updates.accountId, debit: updates.debit, credit: updates.credit, label: updates.label, project_id: updates.projectId })
    .eq('id', id);
  return { error: error?.message ?? null };
}

export async function deleteEntryLine(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('accounting_entry_lines').delete().eq('id', id);
  return { error: error?.message ?? null };
}

// Assigns the sequential entry_number, validates the debit=credit
// invariant and the fiscal-year lock, flips status to comptabilisée —
// entirely inside the security-definer RPC (see post_accounting_entry).
export async function postEntry(id: string): Promise<{ entryNumber: number | null; error: string | null }> {
  const { data, error } = await supabase.rpc('post_accounting_entry', { p_entry_id: id });
  return { entryNumber: error ? null : (data as number), error: error?.message ?? null };
}

export async function reverseEntry(id: string, reversalDate?: string): Promise<{ reversalEntryId: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc('reverse_accounting_entry', { p_entry_id: id, p_reversal_date: reversalDate ?? undefined });
  return { reversalEntryId: error ? null : (data as string), error: error?.message ?? null };
}

export async function listEntries(
  organizationId: string,
  filters: { periodStart?: string; periodEnd?: string; status?: EntryStatus; journalId?: string; search?: string } = {},
): Promise<AccountingEntryWithLines[]> {
  let query = supabase
    .from('accounting_entries')
    .select('*, accounting_journals(code, label), accounting_entry_lines(*, accounting_accounts(code, label))')
    .eq('organization_id', organizationId)
    .order('entry_date', { ascending: false })
    .order('entry_number', { ascending: false, nullsFirst: false })
    .limit(300);
  if (filters.periodStart) query = query.gte('entry_date', filters.periodStart);
  if (filters.periodEnd) query = query.lt('entry_date', filters.periodEnd);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.journalId) query = query.eq('journal_id', filters.journalId);
  if (filters.search) query = query.ilike('label', `%${filters.search}%`);

  const { data } = await query;
  return (data ?? []).map((e: any) => ({
    ...e,
    journal_code: e.accounting_journals?.code ?? '',
    journal_label: e.accounting_journals?.label ?? '',
    lines: (e.accounting_entry_lines ?? [])
      .map((l: any) => ({ ...l, account_code: l.accounting_accounts?.code ?? '', account_label: l.accounting_accounts?.label ?? '' }))
      .sort((a: any, b: any) => a.sort_order - b.sort_order),
  }));
}

export async function getEntry(id: string): Promise<AccountingEntryWithLines | null> {
  const { data } = await supabase
    .from('accounting_entries')
    .select('*, accounting_journals(code, label), accounting_entry_lines(*, accounting_accounts(code, label))')
    .eq('id', id)
    .maybeSingle();
  if (!data) return null;
  return {
    ...data,
    journal_code: (data as any).accounting_journals?.code ?? '',
    journal_label: (data as any).accounting_journals?.label ?? '',
    lines: ((data as any).accounting_entry_lines ?? [])
      .map((l: any) => ({ ...l, account_code: l.accounting_accounts?.code ?? '', account_label: l.accounting_accounts?.label ?? '' }))
      .sort((a: any, b: any) => a.sort_order - b.sort_order),
  } as AccountingEntryWithLines;
}

// ==========================================================================
// Reports — computed from real posted lines (accounting_entry_lines),
// never re-derived from factures/dépenses/salaires directly anymore.
// ==========================================================================

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export interface TrialBalanceRow {
  accountId: string;
  code: string;
  label: string;
  type: AccountingAccount['type'];
  openingBalance: number;
  debitMovements: number;
  creditMovements: number;
  closingBalance: number;
}

// Balance — solde d'ouverture (tout ce qui précède periodStart), mouvements
// de la période, solde final. §4.6.
export async function getTrialBalance(organizationId: string, periodStart: string, periodEnd: string): Promise<TrialBalanceRow[]> {
  const [accounts, { data: openingLines }, { data: periodLines }] = await Promise.all([
    listAccounts(organizationId, true),
    supabase
      .from('accounting_entry_lines')
      .select('account_id, debit, credit, accounting_entries!inner(organization_id, entry_date, status)')
      .eq('accounting_entries.organization_id', organizationId)
      .eq('accounting_entries.status', 'comptabilisee')
      .lt('accounting_entries.entry_date', periodStart),
    supabase
      .from('accounting_entry_lines')
      .select('account_id, debit, credit, accounting_entries!inner(organization_id, entry_date, status)')
      .eq('accounting_entries.organization_id', organizationId)
      .eq('accounting_entries.status', 'comptabilisee')
      .gte('accounting_entries.entry_date', periodStart)
      .lt('accounting_entries.entry_date', periodEnd),
  ]);

  const openingByAccount = new Map<string, number>();
  for (const l of openingLines ?? []) {
    const signed = Number(l.debit) - Number(l.credit);
    openingByAccount.set(l.account_id, (openingByAccount.get(l.account_id) ?? 0) + signed);
  }
  const debitByAccount = new Map<string, number>();
  const creditByAccount = new Map<string, number>();
  for (const l of periodLines ?? []) {
    debitByAccount.set(l.account_id, (debitByAccount.get(l.account_id) ?? 0) + Number(l.debit));
    creditByAccount.set(l.account_id, (creditByAccount.get(l.account_id) ?? 0) + Number(l.credit));
  }

  return accounts
    .map((a) => {
      const opening = round2(openingByAccount.get(a.id) ?? 0);
      const debit = round2(debitByAccount.get(a.id) ?? 0);
      const credit = round2(creditByAccount.get(a.id) ?? 0);
      const closing = round2(opening + debit - credit);
      return { accountId: a.id, code: a.code, label: a.label, type: a.type, openingBalance: opening, debitMovements: debit, creditMovements: credit, closingBalance: closing };
    })
    .filter((r) => r.openingBalance !== 0 || r.debitMovements !== 0 || r.creditMovements !== 0);
}

export interface LedgerEntryRow {
  entryDate: string;
  entryNumber: number | null;
  label: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

// Grand livre for one account — every posted movement, running balance in
// the account's own normal-balance direction (debit-normal accounts show
// balance = running debit-credit; credit-normal accounts the opposite).
export async function getGeneralLedger(organizationId: string, accountId: string, periodStart: string, periodEnd: string): Promise<{ account: AccountingAccount | null; rows: LedgerEntryRow[] }> {
  const [{ data: account }, { data: opening }, { data: lines }] = await Promise.all([
    supabase.from('accounting_accounts').select('*').eq('id', accountId).maybeSingle(),
    supabase
      .from('accounting_entry_lines')
      .select('debit, credit, accounting_entries!inner(organization_id, entry_date, status)')
      .eq('account_id', accountId)
      .eq('accounting_entries.organization_id', organizationId)
      .eq('accounting_entries.status', 'comptabilisee')
      .lt('accounting_entries.entry_date', periodStart),
    supabase
      .from('accounting_entry_lines')
      .select('debit, credit, label, accounting_entries!inner(organization_id, entry_date, entry_number, label, status)')
      .eq('account_id', accountId)
      .eq('accounting_entries.organization_id', organizationId)
      .eq('accounting_entries.status', 'comptabilisee')
      .gte('accounting_entries.entry_date', periodStart)
      .lt('accounting_entries.entry_date', periodEnd)
      .order('entry_date', { referencedTable: 'accounting_entries', ascending: true }),
  ]);

  const acc = (account as AccountingAccount) ?? null;
  const direction = acc?.normal_balance === 'credit' ? -1 : 1;
  let running = ((opening ?? []).reduce((s, l) => s + (Number(l.debit) - Number(l.credit)), 0)) * direction;

  const rows: LedgerEntryRow[] = [];
  for (const l of lines ?? []) {
    const e: any = (l as any).accounting_entries;
    const debit = Number(l.debit);
    const credit = Number(l.credit);
    running = round2(running + (debit - credit) * direction);
    rows.push({ entryDate: e.entry_date, entryNumber: e.entry_number, label: l.label || e.label, debit, credit, runningBalance: running });
  }
  return { account: acc, rows };
}

export interface IncomeStatementLine {
  code: string;
  label: string;
  amount: number;
}

export interface IncomeStatement {
  produits: number;
  produitLines: IncomeStatementLine[];
  charges: IncomeStatementLine[];
  totalCharges: number;
  resultat: number;
}

// Compte de résultat — produits (classe 3) moins charges (classes 4/5/6),
// classe 9 (clôture/ouverture) explicitement exclue.
export async function getIncomeStatement(organizationId: string, periodStart: string, periodEnd: string): Promise<IncomeStatement> {
  const rows = await getTrialBalance(organizationId, periodStart, periodEnd);
  const produitRows = rows.filter((r) => r.type === 'produit');
  const chargeRows = rows.filter((r) => r.type === 'charge');
  const produitLines = produitRows.map((r) => ({ code: r.code, label: r.label, amount: round2(r.creditMovements - r.debitMovements) })).filter((l) => l.amount !== 0);
  const charges = chargeRows.map((r) => ({ code: r.code, label: r.label, amount: round2(r.debitMovements - r.creditMovements) })).filter((l) => l.amount !== 0);
  const produits = round2(produitLines.reduce((s, l) => s + l.amount, 0));
  const totalCharges = round2(charges.reduce((s, l) => s + l.amount, 0));
  return { produits, produitLines, charges: charges.sort((a, b) => b.amount - a.amount), totalCharges, resultat: round2(produits - totalCharges) };
}

export interface BalanceSheetLine {
  code: string;
  label: string;
  amount: number;
}

export interface BalanceSheet {
  asOfDate: string;
  actifs: BalanceSheetLine[];
  totalActifs: number;
  passifs: BalanceSheetLine[];
  resultatExercice: number;
  totalPassifs: number;
  // Actifs - (Passifs + résultat) — should be 0 for a balanced ledger;
  // shown so a real discrepancy (e.g. a still-missing account mapping) is
  // visible rather than silently hidden.
  ecart: number;
}

// Bilan — actif/passif à une date donnée, classe 9 exclue (comptes de
// clôture techniques, jamais présentés comme un solde réel).
export async function getBalanceSheet(organizationId: string, fiscalYearStart: string, asOfDate: string): Promise<BalanceSheet> {
  const [rows, income] = await Promise.all([
    getTrialBalance(organizationId, '1900-01-01', asOfDate),
    getIncomeStatement(organizationId, fiscalYearStart, asOfDate >= fiscalYearStart ? nextDay(asOfDate) : asOfDate),
  ]);
  const actifRows = rows.filter((r) => r.type === 'actif');
  const passifRows = rows.filter((r) => r.type === 'passif');
  const actifs = actifRows.map((r) => ({ code: r.code, label: r.label, amount: round2(r.closingBalance) })).filter((l) => l.amount !== 0);
  const passifs = passifRows.map((r) => ({ code: r.code, label: r.label, amount: round2(-r.closingBalance) })).filter((l) => l.amount !== 0);
  const totalActifs = round2(actifs.reduce((s, l) => s + l.amount, 0));
  const totalPassifsSansResultat = round2(passifs.reduce((s, l) => s + l.amount, 0));
  const totalPassifs = round2(totalPassifsSansResultat + income.resultat);
  return { asOfDate, actifs, totalActifs, passifs, resultatExercice: income.resultat, totalPassifs, ecart: round2(totalActifs - totalPassifs) };
}

function nextDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function entriesToCsv(entries: AccountingEntryWithLines[]): string {
  const escape = (v: string) => (/[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const lines = [['N°', 'Date', 'Journal', 'Libellé', 'Compte', 'Débit', 'Crédit'].map(escape).join(';')];
  for (const e of entries) {
    for (const l of e.lines) {
      lines.push(
        [
          e.entry_number != null ? String(e.entry_number) : '',
          e.entry_date,
          e.journal_code,
          e.label,
          `${l.account_code} ${l.account_label}`,
          l.debit > 0 ? l.debit.toFixed(2) : '',
          l.credit > 0 ? l.credit.toFixed(2) : '',
        ]
          .map(escape)
          .join(';'),
      );
    }
  }
  return lines.join('\n');
}

// ==========================================================================
// Financial snapshot — unchanged from V1 (trésorerie + créances clients),
// still valid: a real bank balance and unpaid-invoice total, independent
// of the double-entry ledger above.
// ==========================================================================

export interface FinancialSnapshot {
  cashBalance: number | null;
  cashRecordedAt: string | null;
  receivables: number;
}

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

// ==========================================================================
// Account mappings (§10) + payroll posting trigger (edge function, since
// payroll has no single row a DB trigger can hang off).
// ==========================================================================

export interface AccountMapping {
  id: string;
  mapping_key: string;
  account_id: string;
}

export async function listAccountMappings(organizationId: string): Promise<AccountMapping[]> {
  const { data } = await supabase.from('accounting_account_mappings').select('*').eq('organization_id', organizationId);
  return (data ?? []) as AccountMapping[];
}

export async function setAccountMapping(organizationId: string, mappingKey: string, accountId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('accounting_account_mappings')
    .upsert({ organization_id: organizationId, mapping_key: mappingKey, account_id: accountId }, { onConflict: 'organization_id,mapping_key' });
  return { error: error?.message ?? null };
}

export async function postPayrollMonth(organizationId: string, year: number, month: number): Promise<{ posted: number; skipped: number; errors: string[]; error: string | null }> {
  const { data, error } = await invokeFunction<{ posted: number; skipped: number; errors: string[] }>('post-payroll-accounting-entries', {
    organization_id: organizationId,
    year,
    month,
  });
  if (error || !data) return { posted: 0, skipped: 0, errors: [], error: error ?? 'Échec de la comptabilisation des salaires' };
  return { posted: data.posted ?? 0, skipped: data.skipped ?? 0, errors: data.errors ?? [], error: null };
}
