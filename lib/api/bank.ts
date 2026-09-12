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
  autoPosted?: number;
  warnings?: string[];
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
    .select('*');
  if (insertError) return { bankAccountId: account.id, imported: 0, duplicates: 0, alreadyImported: false, error: insertError.message };

  const importedCount = inserted?.length ?? 0;
  if (parsed.closingBalance != null) {
    await supabase.from('bank_accounts').update({ last_imported_balance: parsed.closingBalance, last_imported_at: new Date().toISOString() }).eq('id', account.id);
  }

  let autoPosted = 0;
  const warnings: string[] = [];
  if (account.accountingAccountId && inserted?.length) {
    const rules = await listBankRules(organizationId, false);
    const autoRules = rules.filter((r) => r.autoPost);
    if (autoRules.length) {
      for (const row of inserted.map(mapTransaction)) {
        if (row.amount >= 0 || row.status !== 'unmatched') continue;
        const rule = matchRuleForTransaction(autoRules, row);
        if (!rule) continue;
        const { error: applyError } = await applyAutoPostRule(organizationId, row, rule, userId, account.accountingAccountId);
        if (applyError) warnings.push(applyError);
        else autoPosted += 1;
      }
    }
  }

  return { bankAccountId: account.id, imported: importedCount, duplicates: rows.length - importedCount, alreadyImported: false, autoPosted, warnings, error: null };
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
//
// Goes through a SECURITY DEFINER RPC rather than a direct table read:
// accounting_entry_lines/accounting_entries are gated by
// can_view_org_accounting, a narrower, dedicated permission the bank
// permissions deliberately don't grant (a member with only bank access
// must not thereby gain read access to the full ledger) — the RPC itself
// checks the bank permissions instead, scoped to exactly this lookup.
export async function findEntryLineCandidates(organizationId: string, transaction: BankTransactionRow): Promise<EntryLineCandidate[]> {
  const { data } = await supabase.rpc('bank_find_entry_line_candidates', { p_transaction_id: transaction.id });
  return (data ?? []).map((l: any) => ({
    entryLineId: l.entry_line_id,
    entryId: l.entry_id,
    entryNumber: l.entry_number,
    entryDate: l.entry_date,
    label: l.label,
    source: l.source,
    debit: Number(l.debit),
    credit: Number(l.credit),
  }));
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
// Same rationale as findEntryLineCandidates for going through an RPC
// instead of a direct table read — see its comment.
export async function findAutoPostedEntryLine(organizationId: string, source: string, sourceId: string, accountingAccountId: string): Promise<string | null> {
  const { data } = await supabase.rpc('bank_find_auto_posted_entry_line', {
    p_organization_id: organizationId,
    p_source: source,
    p_source_id: sourceId,
    p_accounting_account_id: accountingAccountId,
  });
  return data ?? null;
}

// ==========================================================================
// §6.4 "Règles automatiques" — recognizes a beneficiary/label pattern and
// proposes an account, a code TVA, a chantier and a supplier label for the
// dépense a matching debit transaction probably represents. A rule only
// proposes by default; auto_post is the explicit, per-rule opt-in the
// cahier requires, and its execution is always paired with a dedicated
// audit event (record_bank_rule_application) naming the rule that acted.
// ==========================================================================

export interface BankRule {
  id: string;
  name: string;
  matchField: 'counterparty_name' | 'counterparty_iban' | 'remittance_info';
  matchPattern: string;
  proposedAccountId: string | null;
  proposedVatCode: string | null;
  proposedProjectId: string | null;
  proposedTiers: string | null;
  proposedLabel: string | null;
  autoPost: boolean;
  isActive: boolean;
}

function mapRule(row: any): BankRule {
  return {
    id: row.id,
    name: row.name,
    matchField: row.match_field,
    matchPattern: row.match_pattern,
    proposedAccountId: row.proposed_account_id,
    proposedVatCode: row.proposed_vat_code,
    proposedProjectId: row.proposed_project_id,
    proposedTiers: row.proposed_tiers,
    proposedLabel: row.proposed_label,
    autoPost: row.auto_post,
    isActive: row.is_active,
  };
}

export async function listBankRules(organizationId: string, includeInactive = true): Promise<BankRule[]> {
  let query = supabase.from('bank_rules').select('*').eq('organization_id', organizationId).order('created_at');
  if (!includeInactive) query = query.eq('is_active', true);
  const { data } = await query;
  return (data ?? []).map(mapRule);
}

export async function createBankRule(
  organizationId: string,
  input: {
    name: string;
    matchField: BankRule['matchField'];
    matchPattern: string;
    proposedAccountId: string | null;
    proposedVatCode: string | null;
    proposedProjectId: string | null;
    proposedTiers: string | null;
    proposedLabel: string | null;
    autoPost: boolean;
  },
  userId: string | undefined,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('bank_rules').insert({
    organization_id: organizationId,
    name: input.name.trim(),
    match_field: input.matchField,
    match_pattern: input.matchPattern.trim(),
    proposed_account_id: input.proposedAccountId,
    proposed_vat_code: input.proposedVatCode,
    proposed_project_id: input.proposedProjectId,
    proposed_tiers: input.proposedTiers,
    proposed_label: input.proposedLabel,
    auto_post: input.autoPost,
    created_by: userId,
  });
  return { error: error?.message ?? null };
}

export async function setBankRuleActive(id: string, isActive: boolean): Promise<{ error: string | null }> {
  const { error } = await supabase.from('bank_rules').update({ is_active: isActive }).eq('id', id);
  return { error: error?.message ?? null };
}

export async function deleteBankRule(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('bank_rules').delete().eq('id', id);
  return { error: error?.message ?? null };
}

// Case-insensitive substring match, first active rule wins (rules are
// listed oldest-first, so an org's earlier, more specific rules take
// priority over later broad ones it might add). Only ever applied to
// outgoing (debit) transactions — rules exist to recognize recurring
// suppliers/expenses, not incoming client payments (which already have
// their own tuned matcher in import-releve.tsx).
export function matchRuleForTransaction(rules: BankRule[], transaction: BankTransactionRow): BankRule | null {
  const fieldValue: Record<BankRule['matchField'], string | null> = {
    counterparty_name: transaction.counterpartyName,
    counterparty_iban: transaction.counterpartyIban,
    remittance_info: transaction.remittanceInfo,
  };
  const needle = (s: string) => s.trim().toLowerCase();
  for (const rule of rules) {
    if (!rule.isActive) continue;
    const value = fieldValue[rule.matchField];
    if (value && needle(value).includes(needle(rule.matchPattern))) return rule;
  }
  return null;
}

// Same rationale as findEntryLineCandidates — vat_codes is gated by
// can_view_org_accounting, which bank permissions deliberately don't grant.
export interface BankRuleAccountOption {
  id: string;
  code: string;
  label: string;
}

export interface BankRuleVatCodeOption {
  id: string;
  code: string;
  label: string;
  rate: number;
}

// Narrow reads for the bank-rules screen's own pickers — same rationale
// as findEntryLineCandidates: accounting_accounts/vat_codes are gated by
// can_view_org_accounting, which bank permissions deliberately don't
// include, so a member who can only manage bank rules still needs a
// dedicated, narrowly-scoped way to see charge accounts and VAT codes to
// configure one.
export async function bankListChargeAccounts(organizationId: string): Promise<BankRuleAccountOption[]> {
  const { data } = await supabase.rpc('bank_list_charge_accounts', { p_organization_id: organizationId });
  return data ?? [];
}

export async function bankListDeductibleVatCodes(organizationId: string): Promise<BankRuleVatCodeOption[]> {
  const { data } = await supabase.rpc('bank_list_deductible_vat_codes', { p_organization_id: organizationId });
  return (data ?? []).map((c: any) => ({ ...c, rate: Number(c.rate) }));
}

async function vatRateForCode(organizationId: string, code: string, atDate: string): Promise<number | null> {
  const { data } = await supabase.rpc('bank_vat_rate_for_code', { p_organization_id: organizationId, p_code: code, p_at_date: atDate });
  return data != null ? Number(data) : null;
}

// Creates the dépense a matched auto_post rule proposes, then links the
// bank transaction to the entry line the existing posting trigger creates
// for it — no new posting logic, same mechanism as a manually-confirmed
// facture/dépense match, just without a human clicking "confirmer".
export async function applyAutoPostRule(
  organizationId: string,
  transaction: BankTransactionRow,
  rule: BankRule,
  userId: string | undefined,
  bankAccountingAccountId: string,
): Promise<{ error: string | null }> {
  const amount = Math.abs(transaction.amount);
  const label = rule.proposedLabel || transaction.counterpartyName || transaction.remittanceInfo || 'Dépense (règle bancaire)';
  const vatRate = rule.proposedVatCode ? await vatRateForCode(organizationId, rule.proposedVatCode, transaction.bookingDate) : null;
  const tiers = rule.proposedTiers || transaction.counterpartyName;

  const table = rule.proposedProjectId ? 'project_expenses' : 'expenses';
  const payload: Record<string, unknown> = {
    organization_id: organizationId,
    label,
    expense_date: transaction.bookingDate,
    vat_rate: vatRate,
    accounting_account_id: rule.proposedAccountId,
    tiers,
    created_by: userId,
  };
  if (rule.proposedProjectId) {
    payload.project_id = rule.proposedProjectId;
    payload.amount = amount;
  } else {
    payload.amount_chf = amount;
  }

  const { data: expenseRow, error: expenseError } = await supabase.from(table).insert(payload).select('id').single();
  if (expenseError || !expenseRow) return { error: expenseError?.message ?? 'Dépense non créée' };

  // The posting trigger can skip posting silently (missing fiscal year or
  // account mapping — it logs a warning, not an error, so the INSERT
  // above always succeeds either way). If no posted line shows up, this
  // must NOT be reported as a successful auto-post: the dépense row now
  // exists but is unaccounted for, and the transaction has to stay
  // unmatched so a human notices instead of assuming the rule handled it.
  const lineId = await findAutoPostedEntryLine(organizationId, 'facture_fournisseur', expenseRow.id, bankAccountingAccountId);
  if (!lineId) {
    return { error: `Dépense créée pour "${label}" mais non comptabilisée automatiquement (configuration comptable incomplète : exercice ouvert ou mapping de compte manquant) — à vérifier manuellement dans Comptabilité.` };
  }
  await linkBankTransactionToEntryLine(transaction.id, lineId);
  await supabase.rpc('record_bank_rule_application', { p_transaction_id: transaction.id, p_rule_id: rule.id, p_expense_id: expenseRow.id });
  return { error: null };
}
