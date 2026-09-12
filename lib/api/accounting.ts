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

// ==========================================================================
// TVA — Lot 2 (§5.1-5.3). Mode de décompte (convenues/reçues) and méthode
// de décompte (effective/TDFN) are two independent settings, never
// conflated. VAT codes are versioned by validity period (rates changed
// 01.01.2024: 7.7/2.5/3.7% -> 8.1/2.6/3.8%), and every auto-posted entry's
// TVA line now carries its vat_code/vat_base/vat_amount, so the per-code
// report below reads real ledger data instead of re-deriving it.
//
// No eCH-0217 XML export exists here — that standard's official domains
// (ech.ch, estv.admin.ch) were unreachable from this environment to
// verify the exact XSD/schema, and shipping an unverified "compliance"
// export would be worse than not having one. getVatWorksheet below
// produces a correctly-computed, clearly-labeled worksheet for manual
// entry into the AFC's "Décompte TVA pro" portal instead.
// ==========================================================================

export interface VatSettings {
  vatLiable: boolean;
  vatMethod: 'effective' | 'tdfn';
  vatBasisDefault: 'invoiced' | 'collected';
  vatPeriodicity: 'mensuelle' | 'trimestrielle' | 'semestrielle' | 'annuelle';
  vatLiableSince: string | null;
  vatRounding: 'aucun' | 'cinq_centimes';
  ideNumber: string | null;
}

export async function getVatSettings(organizationId: string): Promise<VatSettings | null> {
  const { data } = await supabase
    .from('organizations')
    .select('vat_liable, vat_method, vat_basis_default, vat_periodicity, vat_liable_since, vat_rounding, ide_number')
    .eq('id', organizationId)
    .maybeSingle();
  if (!data) return null;
  return {
    vatLiable: data.vat_liable,
    vatMethod: data.vat_method,
    vatBasisDefault: data.vat_basis_default,
    vatPeriodicity: data.vat_periodicity,
    vatLiableSince: data.vat_liable_since,
    vatRounding: data.vat_rounding,
    ideNumber: data.ide_number,
  };
}

export async function updateVatSettings(organizationId: string, updates: Partial<Omit<VatSettings, 'ideNumber'>> & { ideNumber?: string | null }): Promise<{ error: string | null }> {
  const payload: Record<string, unknown> = {};
  if (updates.vatLiable !== undefined) payload.vat_liable = updates.vatLiable;
  if (updates.vatMethod !== undefined) payload.vat_method = updates.vatMethod;
  if (updates.vatBasisDefault !== undefined) payload.vat_basis_default = updates.vatBasisDefault;
  if (updates.vatPeriodicity !== undefined) payload.vat_periodicity = updates.vatPeriodicity;
  if (updates.vatLiableSince !== undefined) payload.vat_liable_since = updates.vatLiableSince;
  if (updates.vatRounding !== undefined) payload.vat_rounding = updates.vatRounding;
  if (updates.ideNumber !== undefined) payload.ide_number = updates.ideNumber;
  const { error } = await supabase.from('organizations').update(payload).eq('id', organizationId);
  return { error: error?.message ?? null };
}

export interface VatCode {
  id: string;
  code: string;
  label: string;
  category: string;
  rate: number;
  valid_from: string;
  valid_to: string | null;
  is_active: boolean;
  is_system: boolean;
}

export async function listVatCodes(organizationId: string, includeInactive = false): Promise<VatCode[]> {
  let query = supabase.from('vat_codes').select('*').eq('organization_id', organizationId).order('category').order('valid_from', { ascending: false });
  if (!includeInactive) query = query.eq('is_active', true);
  const { data } = await query;
  return (data ?? []) as VatCode[];
}

export async function createVatCode(
  organizationId: string,
  input: { code: string; label: string; category: string; rate: number; validFrom: string; validTo: string | null },
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('vat_codes').insert({
    organization_id: organizationId,
    code: input.code.trim().toUpperCase(),
    label: input.label.trim(),
    category: input.category,
    rate: input.rate,
    valid_from: input.validFrom,
    valid_to: input.validTo,
  });
  return { error: error?.message ?? null };
}

export async function setVatCodeActive(id: string, isActive: boolean): Promise<{ error: string | null }> {
  const { error } = await supabase.from('vat_codes').update({ is_active: isActive }).eq('id', id);
  return { error: error?.message ?? null };
}

export interface VatCodeReportRow {
  code: string;
  label: string;
  category: string;
  rate: number;
  base: number;
  amount: number;
  entryCount: number;
}

export interface VatLedgerReport {
  salesRows: VatCodeReportRow[];
  totalSalesBase: number;
  totalSalesVat: number;
  deductibleRows: VatCodeReportRow[];
  totalDeductibleBase: number;
  totalDeductibleVat: number;
  netVatDue: number;
  roundedNetVatDue: number;
}

function roundToFiveCents(n: number): number {
  return Math.round(n * 20) / 20;
}

// Reads real posted lines carrying a vat_code (set by the auto-posting
// triggers and the historical backfill) — grouped by code, split into
// sales (collected) vs deductible (préalable) by category prefix.
export async function getVatReportByCode(organizationId: string, periodStart: string, periodEnd: string, rounding: VatSettings['vatRounding'] = 'aucun'): Promise<VatLedgerReport> {
  const [{ data: lines }, codes] = await Promise.all([
    supabase
      .from('accounting_entry_lines')
      .select('vat_code, vat_base, vat_amount, accounting_entries!inner(organization_id, entry_date, status)')
      .eq('accounting_entries.organization_id', organizationId)
      .eq('accounting_entries.status', 'comptabilisee')
      .gte('accounting_entries.entry_date', periodStart)
      .lt('accounting_entries.entry_date', periodEnd)
      .not('vat_code', 'is', null),
    listVatCodes(organizationId, true),
  ]);

  const codeByCode = new Map(codes.map((c) => [c.code, c]));
  const totalsByCode = new Map<string, { base: number; amount: number; count: number }>();
  for (const l of lines ?? []) {
    const code = (l as any).vat_code as string;
    const cur = totalsByCode.get(code) ?? { base: 0, amount: 0, count: 0 };
    cur.base += Number(l.vat_base ?? 0);
    cur.amount += Number(l.vat_amount ?? 0);
    cur.count += 1;
    totalsByCode.set(code, cur);
  }

  const salesRows: VatCodeReportRow[] = [];
  const deductibleRows: VatCodeReportRow[] = [];
  for (const [code, totals] of totalsByCode.entries()) {
    const meta = codeByCode.get(code);
    const row: VatCodeReportRow = {
      code,
      label: meta?.label ?? code,
      category: meta?.category ?? '',
      rate: meta?.rate ?? 0,
      base: round2(totals.base),
      amount: round2(totals.amount),
      entryCount: totals.count,
    };
    if (meta?.category.startsWith('achat')) deductibleRows.push(row);
    else salesRows.push(row);
  }
  salesRows.sort((a, b) => b.rate - a.rate);
  deductibleRows.sort((a, b) => b.rate - a.rate);

  const totalSalesBase = round2(salesRows.reduce((s, r) => s + r.base, 0));
  const totalSalesVat = round2(salesRows.reduce((s, r) => s + r.amount, 0));
  const totalDeductibleBase = round2(deductibleRows.reduce((s, r) => s + r.base, 0));
  const totalDeductibleVat = round2(deductibleRows.reduce((s, r) => s + r.amount, 0));
  const netVatDue = round2(totalSalesVat - totalDeductibleVat);
  const roundedNetVatDue = rounding === 'cinq_centimes' ? roundToFiveCents(netVatDue) : netVatDue;

  return { salesRows, totalSalesBase, totalSalesVat, deductibleRows, totalDeductibleBase, totalDeductibleVat, netVatDue, roundedNetVatDue };
}

export interface VatDrilldownRow {
  entryId: string;
  entryNumber: number | null;
  entryDate: string;
  label: string;
  base: number;
  amount: number;
}

export async function getVatCodeDrilldown(organizationId: string, vatCode: string, periodStart: string, periodEnd: string): Promise<VatDrilldownRow[]> {
  const { data } = await supabase
    .from('accounting_entry_lines')
    .select('vat_base, vat_amount, accounting_entries!inner(id, entry_number, entry_date, label, organization_id, status)')
    .eq('accounting_entries.organization_id', organizationId)
    .eq('accounting_entries.status', 'comptabilisee')
    .eq('vat_code', vatCode)
    .gte('accounting_entries.entry_date', periodStart)
    .lt('accounting_entries.entry_date', periodEnd)
    .order('entry_date', { referencedTable: 'accounting_entries', ascending: false });
  return (data ?? []).map((l: any) => ({
    entryId: l.accounting_entries.id,
    entryNumber: l.accounting_entries.entry_number,
    entryDate: l.accounting_entries.entry_date,
    label: l.accounting_entries.label,
    base: Number(l.vat_base ?? 0),
    amount: Number(l.vat_amount ?? 0),
  }));
}

// A worksheet to fill the AFC "Décompte TVA pro" portal form by hand —
// not an eCH-0217 file (see module comment above). Every figure here is
// real, computed from posted entries; nothing claims official submission
// format compliance.
export function vatWorksheetToCsv(report: VatLedgerReport, periodLabel: string, settings: VatSettings | null): string {
  const escape = (v: string) => (/[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const lines: string[] = [];
  lines.push(escape(`Feuille de travail TVA (à reporter manuellement dans le portail AFC — Décompte TVA pro) — ${periodLabel}`));
  lines.push('');
  if (settings) {
    lines.push(escape(`Méthode : ${settings.vatMethod === 'tdfn' ? 'Taux de la dette fiscale nette' : 'Méthode effective'} · Mode : ${settings.vatBasisDefault === 'collected' ? 'Contre-prestations reçues' : 'Contre-prestations convenues'}`));
    lines.push('');
  }
  lines.push(['Chiffre d\'affaires', 'Code', 'Taux', 'Base HT (CHF)', 'TVA (CHF)'].map(escape).join(';'));
  for (const r of report.salesRows) lines.push(['', r.code, `${r.rate}%`, r.base.toFixed(2), r.amount.toFixed(2)].map(escape).join(';'));
  lines.push(['Total chiffre d\'affaires imposable', '', '', report.totalSalesBase.toFixed(2), report.totalSalesVat.toFixed(2)].map(escape).join(';'));
  lines.push('');
  lines.push(['TVA préalable déductible', 'Code', 'Taux', 'Base HT (CHF)', 'TVA (CHF)'].map(escape).join(';'));
  for (const r of report.deductibleRows) lines.push(['', r.code, `${r.rate}%`, r.base.toFixed(2), r.amount.toFixed(2)].map(escape).join(';'));
  lines.push(['Total TVA préalable', '', '', report.totalDeductibleBase.toFixed(2), report.totalDeductibleVat.toFixed(2)].map(escape).join(';'));
  lines.push('');
  lines.push(['Montant TVA net dû (ou crédit si négatif)', '', '', '', report.netVatDue.toFixed(2)].map(escape).join(';'));
  if (settings?.vatRounding === 'cinq_centimes' && report.roundedNetVatDue !== report.netVatDue) {
    lines.push(['Arrondi aux 5 centimes', '', '', '', report.roundedNetVatDue.toFixed(2)].map(escape).join(';'));
  }
  return lines.join('\n');
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

function parseSwissUid(ideNumber: string | null): { category: string; id: string } | null {
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
): Ech0217Result {
  if (vatSettings.vatMethod !== 'effective') {
    throw new Error("L'export eCH-0217 n'est disponible que pour la méthode effective.");
  }
  if (vatSettings.vatBasisDefault !== 'invoiced') {
    throw new Error('L’export eCH-0217 requiert le mode "contre-prestations convenues" — le registre TVA de Cantia n’est pas encore calculé sur une base "reçues".');
  }
  const uid = parseSwissUid(organization.ide_number);
  if (!uid) {
    throw new Error('Numéro IDE manquant ou invalide (format attendu : CHE-123.456.789) — impossible de générer le fichier eCH-0217.');
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
