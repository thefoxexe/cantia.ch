import { supabase } from '../supabase';
import type { ExportEntry } from './exports';
import type { Kpis } from './pro';
import type { AccountType, LedgerEntryInput, LedgerLine } from './ledgerImport';

// The books of a client outside Cantia, kept by the firm
// (supabase/migrations/20261009090000_fiduciary_ledger.sql). Every call is
// checked by the database (the client belongs to the firm, the period is
// open).

export interface LedgerAccount {
  id: string;
  code: string;
  label: string;
  type: AccountType;
  is_active: boolean;
  used: boolean;
}

export interface LedgerEntry {
  id: string;
  entry_number: number | null;
  entry_date: string;
  label: string;
  reference: string | null;
  status: 'draft' | 'posted';
  source: 'manual' | 'import' | 'opening' | 'reversal';
  created_at: string;
  changed: boolean;
  reverses_entry_id: string | null;
  reversed_by_entry_id: string | null;
  // Written by the annual closing or a VAT return.
  system?: 'closing' | 'vat' | null;
  created_by_name: string | null;
  amount: number;
  lines: (LedgerLine & { account_label: string })[];
}

export interface TrialRow {
  code: string;
  label: string;
  type: AccountType;
  opening: number;
  debit: number;
  credit: number;
  closing: number;
}

export interface Statements {
  from: string;
  to: string;
  fy_start: string;
  assets: { code: string; label: string; amount: number }[];
  liabilities: { code: string; label: string; amount: number }[];
  income: { code: string; label: string; amount: number }[];
  expenses: { code: string; label: string; amount: number }[];
  result: number;
  year_result: number;
  prior_results: number;
  closed?: boolean;
}

export interface AccountLedger {
  code: string;
  label: string;
  type: AccountType;
  opening: number;
  rows: { entry_id: string; entry_number: number; entry_date: string; reference: string | null; label: string; debit: number; credit: number; balance: number; counterpart: string | null }[];
}

export interface VatSummary {
  codes: { vat_code: string; net: number; lines: number }[];
  vat_due: number;
  input_tax: number;
  input_material: number;
  input_invest: number;
}

export interface FiscalYear {
  start: string;
  end: string;
  entries: number;
  drafts: number;
  result: number;
  closed: boolean;
  closed_at: string | null;
  closed_by_name: string | null;
  closing_number: number | null;
  locked: boolean;
  finished: boolean;
}

export interface VatReturn {
  id: string;
  period_start: string;
  period_end: string;
  period_key: string;
  method: 'effective' | 'tdfn';
  figures: Record<string, number>;
  adjustments: Record<string, number>;
  payable: number;
  status: 'filed' | 'cancelled';
  filed_at: string;
  filed_by_name: string | null;
  cancelled_at: string | null;
  entry_number: number | null;
}

async function call<T>(fn: string, args?: Record<string, unknown>): Promise<{ data: T | null; error: string | null }> {
  const { data, error } = await supabase.rpc(fn, args ?? {});
  return { data: (data as T) ?? null, error: error?.message ?? null };
}

export const ledger = {
  init: (ext: string, seed: boolean) => call<number>('acc_ext_ledger_init', { p_ext: ext, p_seed: seed }),
  accounts: (ext: string) => call<LedgerAccount[]>('acc_ext_accounts', { p_ext: ext }),
  saveAccount: (ext: string, code: string, label: string, type: AccountType | null, active = true) =>
    call<string>('acc_ext_save_account', { p_ext: ext, p_code: code, p_label: label, p_type: type, p_active: active }),
  importAccounts: (ext: string, accounts: { code: string; label: string; type?: AccountType }[]) => call<number>('acc_ext_import_accounts', { p_ext: ext, p_accounts: accounts }),
  entries: (ext: string, f: { from?: string | null; to?: string | null; status?: 'all' | 'draft' | 'posted'; account?: string | null; search?: string | null; limit?: number; offset?: number } = {}) =>
    call<{ total: number; rows: LedgerEntry[] }>('acc_ext_entries', {
      p_ext: ext,
      p_from: f.from ?? null,
      p_to: f.to ?? null,
      p_status: f.status ?? 'all',
      p_account: f.account || null,
      p_search: f.search || null,
      p_limit: f.limit ?? 200,
      p_offset: f.offset ?? 0,
    }),
  saveEntry: (ext: string, id: string | null, input: { date: string; label: string; reference: string | null; lines: LedgerLine[] }, post = true) =>
    call<{ id: string; entry_number: number | null }>('acc_ext_save_entry', {
      p_ext: ext,
      p_id: id,
      p_date: input.date,
      p_label: input.label,
      p_reference: input.reference,
      p_lines: input.lines,
      p_post: post,
    }),
  entryAction: (id: string, action: 'post' | 'discard' | 'reverse', date?: string | null) =>
    call<{ id: string; entry_number?: number | null }>('acc_ext_entry_action', { p_id: id, p_action: action, p_date: date ?? null }),
  importEntries: (ext: string, entries: LedgerEntryInput[], opts: { post?: boolean; createAccounts?: boolean; source?: 'import' | 'opening' } = {}) =>
    call<number>('acc_ext_import_entries', {
      p_ext: ext,
      p_entries: entries,
      p_post: opts.post ?? true,
      p_create_accounts: opts.createAccounts ?? true,
      p_source: opts.source ?? 'import',
    }),
  setLock: (ext: string, until: string | null) => call<null>('acc_ext_set_lock', { p_ext: ext, p_until: until }),
  trialBalance: (ext: string, from: string, to: string) => call<TrialRow[]>('acc_ext_trial_balance', { p_ext: ext, p_from: from, p_to: to }),
  accountLedger: (ext: string, code: string, from: string, to: string) => call<AccountLedger>('acc_ext_account_ledger', { p_ext: ext, p_code: code, p_from: from, p_to: to }),
  statements: (ext: string, to: string, from?: string | null) => call<Statements>('acc_ext_statements', { p_ext: ext, p_to: to, p_from: from ?? null }),
  vat: (ext: string, from: string, to: string) => call<VatSummary>('acc_ext_vat_summary', { p_ext: ext, p_from: from, p_to: to }),
  kpis: (ext: string, asOf?: string) => call<Kpis>('acc_ext_kpis', { p_ext: ext, p_as_of: asOf ?? null }),
  // Annual closing
  years: (ext: string) => call<FiscalYear[]>('acc_ext_years', { p_ext: ext }),
  closeYear: (ext: string, end: string, carry: boolean, lock: boolean) =>
    call<{ result: number; entry_number: number | null; carry_number: number | null }>('acc_ext_close_year', { p_ext: ext, p_end: end, p_carry: carry, p_lock: lock }),
  reopenYear: (ext: string, end: string) => call<null>('acc_ext_reopen_year', { p_ext: ext, p_end: end }),
  // VAT returns
  vatReturns: (ext: string) => call<VatReturn[]>('acc_ext_vat_returns', { p_ext: ext }),
  fileVatReturn: (
    ext: string,
    r: { start: string; end: string; key: string; method: 'effective' | 'tdfn'; figures: Record<string, number>; adjustments: Record<string, number>; payable: number },
    book: boolean,
    lock: boolean,
  ) =>
    call<{ id: string; entry_number: number | null }>('acc_ext_file_vat_return', {
      p_ext: ext,
      p_start: r.start,
      p_end: r.end,
      p_key: r.key,
      p_method: r.method,
      p_figures: r.figures,
      p_adjustments: r.adjustments,
      p_payable: r.payable,
      p_book: book,
      p_lock: lock,
    }),
  cancelVatReturn: (id: string) => call<null>('acc_ext_cancel_vat_return', { p_id: id }),
};

// Every posted entry of a period, in the shape of the exports.
export async function loadExtPostedEntries(ext: string, from: string, to: string): Promise<ExportEntry[]> {
  const out: ExportEntry[] = [];
  for (let page = 0; page < 50; page++) {
    const { data, error } = await ledger.entries(ext, { from, to, status: 'posted', limit: 2000, offset: page * 2000 });
    if (error) throw new Error(error);
    for (const e of data?.rows ?? []) {
      out.push({ entry_number: e.entry_number, entry_date: e.entry_date, label: e.label, external_reference: e.reference, lines: e.lines });
    }
    if ((data?.rows.length ?? 0) < 2000) break;
  }
  return out;
}

// Periods of the client's fiscal year (fiscal_year_end 'MM-DD').
export type LedgerPeriod = 'month' | 'quarter' | 'fy' | 'lastFy' | 'all';

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function fiscalYear(fiscalYearEnd: string, at: Date = new Date()): { start: string; end: string } {
  const [m, d] = (fiscalYearEnd || '12-31').split('-').map(Number);
  const endIn = (y: number) => new Date(y, m - 1, Math.min(d, new Date(y, m, 0).getDate()));
  let end = endIn(at.getFullYear());
  if (end < new Date(at.getFullYear(), at.getMonth(), at.getDate())) end = endIn(at.getFullYear() + 1);
  const prevEnd = endIn(end.getFullYear() - 1);
  const start = new Date(prevEnd.getFullYear(), prevEnd.getMonth(), prevEnd.getDate() + 1);
  return { start: iso(start), end: iso(end) };
}

export function ledgerRange(period: LedgerPeriod, fiscalYearEnd: string, now: Date = new Date()): { start: string; end: string } {
  const y = now.getFullYear();
  const m = now.getMonth();
  if (period === 'month') return { start: iso(new Date(y, m, 1)), end: iso(new Date(y, m + 1, 0)) };
  if (period === 'quarter') {
    const q = Math.floor(m / 3) * 3;
    return { start: iso(new Date(y, q, 1)), end: iso(new Date(y, q + 3, 0)) };
  }
  const fy = fiscalYear(fiscalYearEnd, now);
  if (period === 'fy') return fy;
  if (period === 'lastFy') {
    const s = new Date(`${fy.start}T12:00:00`);
    return fiscalYear(fiscalYearEnd, new Date(s.getFullYear(), s.getMonth(), s.getDate() - 1));
  }
  return { start: '1990-01-01', end: '2100-12-31' };
}
