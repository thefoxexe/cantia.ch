import { supabase } from '../supabase';
import { type BankStatementEntry, type ParsedCamtStatement, buildDedupeKey, fingerprintText } from '../bankStatement';

// Cahier des charges V2, Lot 3 §6.1-6.3 — persists what the statement
// importer used to only hold in memory, so a re-imported file (or an
// overlapping date range) never books the same transaction twice, and so
// reconciliation state survives across sessions. See the migrations
// 20260912120000-120500 for the schema and the SECURITY DEFINER matching
// functions this module wraps.

export interface BankAccount {
  id: string;
  institutionName: string;
  accountName: string;
  iban: string | null;
  currency: string;
  accountingAccountId: string | null;
  openingBalance: number;
  lastImportedBalance: number | null;
  lastImportedAt: string | null;
  isActive: boolean;
}

function mapAccount(row: any): BankAccount {
  return {
    id: row.id,
    institutionName: row.institution_name,
    accountName: row.account_name,
    iban: row.iban,
    currency: row.currency,
    accountingAccountId: row.accounting_account_id,
    openingBalance: Number(row.opening_balance),
    lastImportedBalance: row.last_imported_balance != null ? Number(row.last_imported_balance) : null,
    lastImportedAt: row.last_imported_at,
    isActive: row.is_active,
  };
}

export async function getBankAccount(id: string): Promise<BankAccount | null> {
  const { data } = await supabase.from('bank_accounts').select('*').eq('id', id).maybeSingle();
  return data ? mapAccount(data) : null;
}

export async function listBankAccounts(organizationId: string, includeInactive = false): Promise<BankAccount[]> {
  let query = supabase.from('bank_accounts').select('*').eq('organization_id', organizationId).order('created_at');
  if (!includeInactive) query = query.eq('is_active', true);
  const { data } = await query;
  return (data ?? []).map(mapAccount);
}

export async function createBankAccount(
  organizationId: string,
  input: { institutionName: string; accountName: string; iban: string | null; accountingAccountId: string | null; currency?: string },
): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from('bank_accounts')
    .insert({
      organization_id: organizationId,
      institution_name: input.institutionName,
      account_name: input.accountName,
      iban: input.iban,
      accounting_account_id: input.accountingAccountId,
      currency: input.currency ?? 'CHF',
    })
    .select('id')
    .single();
  return { id: data?.id ?? null, error: error?.message ?? null };
}

export async function setBankAccountActive(id: string, isActive: boolean): Promise<{ error: string | null }> {
  const { error } = await supabase.from('bank_accounts').update({ is_active: isActive }).eq('id', id);
  return { error: error?.message ?? null };
}

// Resolves the bank account a statement belongs to from the IBAN it
// declares, creating one automatically the first time that IBAN is seen —
// avoids forcing a separate "set up your bank account" step before the
// first import, while still giving every account a stable identity across
// imports (needed for the per-account dedupe index).
async function findOrCreateAccountForStatement(organizationId: string, parsed: ParsedCamtStatement, userId: string | undefined): Promise<{ account: BankAccount | null; error: string | null }> {
  if (parsed.accountIban) {
    const { data: existing } = await supabase.from('bank_accounts').select('*').eq('organization_id', organizationId).eq('iban', parsed.accountIban).maybeSingle();
    if (existing) return { account: mapAccount(existing), error: null };
  }

  const { data: bankMapping } = await supabase.from('accounting_account_mappings').select('account_id').eq('organization_id', organizationId).eq('mapping_key', 'banque').maybeSingle();

  const { data: created, error } = await supabase
    .from('bank_accounts')
    .insert({
      organization_id: organizationId,
      institution_name: 'Import CAMT',
      account_name: parsed.accountIban ?? `Compte ${parsed.currency}`,
      iban: parsed.accountIban,
      currency: parsed.currency,
      accounting_account_id: bankMapping?.account_id ?? null,
      created_by: userId,
    })
    .select('*')
    .single();
  if (error) return { account: null, error: error.message };
  return { account: mapAccount(created), error: null };
}

export interface ImportResult {
  bankAccountId: string | null;
  imported: number;
  duplicates: number;
  alreadyImported: boolean;
  error: string | null;
}

export async function importCamtStatement(
  organizationId: string,
  fileName: string,
  xmlText: string,
  parsed: ParsedCamtStatement,
  userId: string | undefined,
): Promise<ImportResult> {
  const { account, error: accountError } = await findOrCreateAccountForStatement(organizationId, parsed, userId);
  if (!account) return { bankAccountId: null, imported: 0, duplicates: 0, alreadyImported: false, error: accountError };

  const fileHash = fingerprintText(xmlText);
  const { data: existingImport } = await supabase
    .from('bank_statement_imports')
    .select('id')
    .eq('bank_account_id', account.id)
    .eq('file_hash', fileHash)
    .maybeSingle();
  if (existingImport) {
    return { bankAccountId: account.id, imported: 0, duplicates: parsed.entries.length, alreadyImported: true, error: null };
  }

  const { data: importRow, error: importError } = await supabase
    .from('bank_statement_imports')
    .insert({
      organization_id: organizationId,
      bank_account_id: account.id,
      format: parsed.format,
      file_name: fileName,
      file_hash: fileHash,
      statement_from: parsed.statementFrom,
      statement_to: parsed.statementTo,
      opening_balance: parsed.openingBalance,
      closing_balance: parsed.closingBalance,
      transaction_count: parsed.entries.length,
      imported_by: userId,
    })
    .select('id')
    .single();
  if (!importRow) return { bankAccountId: account.id, imported: 0, duplicates: 0, alreadyImported: false, error: importError?.message ?? 'Import impossible' };

  const rows = parsed.entries.map((e: BankStatementEntry) => ({
    organization_id: organizationId,
    bank_account_id: account.id,
    import_id: importRow.id,
    bank_reference: e.bankReference,
    dedupe_key: buildDedupeKey(e),
    booking_date: e.date,
    value_date: e.valueDate,
    amount: e.direction === 'credit' ? e.amount : -e.amount,
    currency: e.currency,
    counterparty_name: e.debtorName ?? e.creditorName,
    counterparty_iban: e.counterpartyIban,
    end_to_end_id: e.endToEndId,
    qr_reference: e.reference,
    remittance_info: e.info,
  }));

  // Duplicate rows (same account + dedupe_key, from an overlapping
  // statement re-import) are silently skipped rather than erroring the
  // whole batch — exactly the idempotency the cahier requires.
  const { data: inserted, error: insertError } = await supabase
    .from('bank_transactions')
    .upsert(rows, { onConflict: 'bank_account_id,dedupe_key', ignoreDuplicates: true })
    .select('id');
  if (insertError) return { bankAccountId: account.id, imported: 0, duplicates: 0, alreadyImported: false, error: insertError.message };

  const importedCount = inserted?.length ?? 0;
  if (parsed.closingBalance != null) {
    await supabase.from('bank_accounts').update({ last_imported_balance: parsed.closingBalance, last_imported_at: new Date().toISOString() }).eq('id', account.id);
  }

  return { bankAccountId: account.id, imported: importedCount, duplicates: rows.length - importedCount, alreadyImported: false, error: null };
}

export interface BankTransactionRow {
  id: string;
  bankAccountId: string;
  bookingDate: string;
  amount: number; // signed
  currency: string;
  counterpartyName: string | null;
  counterpartyIban: string | null;
  qrReference: string | null;
  remittanceInfo: string | null;
  status: 'unmatched' | 'matched' | 'ignored';
}

function mapTransaction(row: any): BankTransactionRow {
  return {
    id: row.id,
    bankAccountId: row.bank_account_id,
    bookingDate: row.booking_date,
    amount: Number(row.amount),
    currency: row.currency,
    counterpartyName: row.counterparty_name,
    counterpartyIban: row.counterparty_iban,
    qrReference: row.qr_reference,
    remittanceInfo: row.remittance_info,
    status: row.status,
  };
}

export async function listBankTransactions(organizationId: string, status?: 'unmatched' | 'matched' | 'ignored', bankAccountId?: string): Promise<BankTransactionRow[]> {
  let query = supabase.from('bank_transactions').select('*').eq('organization_id', organizationId).order('booking_date', { ascending: false });
  if (status) query = query.eq('status', status);
  if (bankAccountId) query = query.eq('bank_account_id', bankAccountId);
  const { data } = await query;
  return (data ?? []).map(mapTransaction);
}

export interface EntryLineCandidate {
  entryLineId: string;
  entryId: string;
  entryNumber: number | null;
  entryDate: string;
  label: string;
  source: string;
  debit: number;
  credit: number;
}

// Candidates for the generic "match this transaction to an existing
// posted entry" fallback (§6.3's dépenses/écritures/virement cases — the
// facture-payment side has its own tuned reference/amount/fuzzy matcher in
// app/(app)/devis/factures/import-releve.tsx and doesn't need this).
export async function findEntryLineCandidates(organizationId: string, transaction: BankTransactionRow): Promise<EntryLineCandidate[]> {
  const { data: account } = await supabase.from('bank_accounts').select('accounting_account_id').eq('id', transaction.bankAccountId).maybeSingle();
  if (!account?.accounting_account_id) return [];

  const from = new Date(transaction.bookingDate);
  from.setDate(from.getDate() - 45);
  const to = new Date(transaction.bookingDate);
  to.setDate(to.getDate() + 45);

  const { data: lines } = await supabase
    .from('accounting_entry_lines')
    .select('id, debit, credit, label, entry_id, accounting_entries!inner(id, entry_number, entry_date, label, source, organization_id, status)')
    .eq('account_id', account.accounting_account_id)
    .eq('accounting_entries.organization_id', organizationId)
    .eq('accounting_entries.status', 'comptabilisee')
    .gte('accounting_entries.entry_date', from.toISOString().slice(0, 10))
    .lte('accounting_entries.entry_date', to.toISOString().slice(0, 10));
  if (!lines?.length) return [];

  const { data: alreadyMatched } = await supabase.from('bank_transactions').select('matched_entry_line_id').eq('organization_id', organizationId).not('matched_entry_line_id', 'is', null);
  const matchedIds = new Set((alreadyMatched ?? []).map((r: any) => r.matched_entry_line_id));

  const wantDebit = transaction.amount > 0;
  return (lines as any[])
    .filter((l) => !matchedIds.has(l.id))
    .filter((l) => (wantDebit ? Number(l.debit) > 0 && Math.abs(Number(l.debit) - transaction.amount) < 0.01 : Number(l.credit) > 0 && Math.abs(Number(l.credit) - Math.abs(transaction.amount)) < 0.01))
    .map((l) => ({
      entryLineId: l.id,
      entryId: l.accounting_entries.id,
      entryNumber: l.accounting_entries.entry_number,
      entryDate: l.accounting_entries.entry_date,
      label: l.label || l.accounting_entries.label,
      source: l.accounting_entries.source,
      debit: Number(l.debit),
      credit: Number(l.credit),
    }))
    .sort((a, b) => Math.abs(new Date(a.entryDate).getTime() - new Date(transaction.bookingDate).getTime()) - Math.abs(new Date(b.entryDate).getTime() - new Date(transaction.bookingDate).getTime()));
}

export async function linkBankTransactionToEntryLine(transactionId: string, entryLineId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('link_bank_transaction_to_entry_line', { p_transaction_id: transactionId, p_entry_line_id: entryLineId });
  return { error: error?.message ?? null };
}

export async function ignoreBankTransaction(transactionId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('ignore_bank_transaction', { p_transaction_id: transactionId });
  return { error: error?.message ?? null };
}

export async function unmatchBankTransaction(transactionId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('unmatch_bank_transaction', { p_transaction_id: transactionId });
  return { error: error?.message ?? null };
}

// Looks up the accounting_entry_line the Lot 1 auto-posting trigger already
// created for a given source row (e.g. a facture_payment just inserted),
// on the given bank account's mapped accounting_account — so a confirmed
// facture match can be linked to its real posted line right after
// addFacturePayment succeeds, with no new posting logic of its own.
export async function findAutoPostedEntryLine(organizationId: string, source: string, sourceId: string, accountingAccountId: string): Promise<string | null> {
  const { data } = await supabase
    .from('accounting_entry_lines')
    .select('id, accounting_entries!inner(organization_id, source, source_id, status)')
    .eq('account_id', accountingAccountId)
    .eq('accounting_entries.organization_id', organizationId)
    .eq('accounting_entries.source', source)
    .eq('accounting_entries.source_id', sourceId)
    .eq('accounting_entries.status', 'comptabilisee')
    .maybeSingle();
  return (data as any)?.id ?? null;
}
