import { supabase } from '../supabase';
import {
  closeFiscalYear,
  createAccount,
  createDraftEntry,
  addEntryLine,
  deleteDraftEntry,
  getBalanceSheet,
  getTrialBalance,
  listAccounts,
  listJournals,
  type FiscalYear,
  type TrialBalanceRow,
} from './accounting';
import { listVatDeclarations } from './vatDeclarations';
import { listBankAccounts } from './bank';
import { periodsFor, type Periodicity } from '../vat/afcForm.ts';
import { CLOSING_ACCOUNTS, type AccrualInput, type AssetInput, type ClosingEntryProposal, type LegalForm } from '../accounting/closing.ts';

// Data + actions of the year-end closing assistant
// (app/(app)/compta/bouclement.tsx). What the company types in is kept in
// public.fiscal_closings (migration 20261003120000); without that table
// the assistant still works, it just doesn't remember the inputs.

export interface ClosingData {
  foreignReceivables?: number;
  swissRate?: number;
  foreignRate?: number;
  assets?: AssetInput[];
  accruals?: AccrualInput[];
  wipValue?: number | null;
  taxRate?: number | null;
  capitalTax?: number;
  generated?: Record<string, string>; // proposal key -> draft entry id
  stepsDone?: string[];
  aiReview?: { at: string; text: string } | null;
}

export interface FiscalClosing {
  id: string;
  organization_id: string;
  fiscal_year_id: string;
  legal_form: LegalForm | null;
  data: ClosingData;
  status: 'en_cours' | 'verrouille' | 'transmis';
  transmitted_at: string | null;
  updated_at: string;
}

const missingTable = (msg?: string) => !!msg && /fiscal_closings|relation|schema cache|does not exist/i.test(msg);

export async function getClosing(fiscalYearId: string): Promise<{ closing: FiscalClosing | null; available: boolean }> {
  const { data, error } = await supabase.from('fiscal_closings').select('*').eq('fiscal_year_id', fiscalYearId).maybeSingle();
  if (error) return { closing: null, available: !missingTable(error.message) };
  return { closing: (data as FiscalClosing) ?? null, available: true };
}

export async function latestClosing(organizationId: string): Promise<FiscalClosing | null> {
  const { data } = await supabase.from('fiscal_closings').select('*').eq('organization_id', organizationId).order('updated_at', { ascending: false }).limit(1).maybeSingle();
  return (data as FiscalClosing) ?? null;
}

export async function saveClosing(
  organizationId: string,
  fiscalYearId: string,
  userId: string | undefined,
  patch: Partial<Pick<FiscalClosing, 'legal_form' | 'data' | 'status' | 'transmitted_at'>>,
): Promise<{ closing: FiscalClosing | null; error: string | null }> {
  const { data, error } = await supabase
    .from('fiscal_closings')
    .upsert(
      { organization_id: organizationId, fiscal_year_id: fiscalYearId, updated_by: userId ?? null, updated_at: new Date().toISOString(), ...patch },
      { onConflict: 'fiscal_year_id' },
    )
    .select('*')
    .single();
  return { closing: (data as FiscalClosing) ?? null, error: error ? (missingTable(error.message) ? null : error.message) : null };
}

// Everything the assistant needs, read once.
export interface ClosingContext {
  trial: TrialBalanceRow[]; // movements of the year
  balances: Record<string, number>; // account code -> balance at year end (debit +)
  result: number; // profit before closing entries
  drafts: number;
  unmatchedBank: number;
  bankStatementBalance: number | null;
  vatPeriodsOpen: number;
  balanceSheetGap: number;
  trialDebit: number;
  trialCredit: number;
}

function nextDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export async function loadClosingContext(
  organizationId: string,
  fy: FiscalYear,
  vat: { liable: boolean; periodicity: Periodicity | null },
): Promise<ClosingContext> {
  const endEx = nextDay(fy.end_date);
  const year = Number(fy.end_date.slice(0, 4));
  const [trial, cumulative, { count: drafts }, { count: unmatched }, banks, declarations, sheet] = await Promise.all([
    getTrialBalance(organizationId, fy.start_date, endEx),
    getTrialBalance(organizationId, '1900-01-01', endEx),
    supabase
      .from('accounting_entries')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .in('status', ['brouillon', 'validee'])
      .gte('entry_date', fy.start_date)
      .lt('entry_date', endEx),
    supabase
      .from('bank_transactions')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'unmatched')
      .gte('booking_date', fy.start_date)
      .lt('booking_date', endEx),
    listBankAccounts(organizationId).catch(() => []),
    vat.liable ? listVatDeclarations(organizationId, year) : Promise.resolve([]),
    getBalanceSheet(organizationId, fy.start_date, fy.end_date),
  ]);

  const balances: Record<string, number> = {};
  for (const r of cumulative) balances[r.code] = r.closingBalance;
  const produits = trial.filter((r) => r.type === 'produit').reduce((s, r) => s + r.creditMovements - r.debitMovements, 0);
  const charges = trial.filter((r) => r.type === 'charge').reduce((s, r) => s + r.debitMovements - r.creditMovements, 0);

  const imported = banks.filter((b) => b.isActive && b.lastImportedBalance != null);
  const today = new Date().toISOString().slice(0, 10);
  const periods = vat.liable && vat.periodicity ? periodsFor(year, vat.periodicity).filter((p) => p.end < today && p.end <= fy.end_date) : [];
  const declared = new Set((declarations ?? []).filter((d) => d.status === 'filed' || d.status === 'paid').map((d) => d.period_start));

  return {
    trial,
    balances,
    result: Math.round((produits - charges) * 100) / 100,
    drafts: drafts ?? 0,
    unmatchedBank: unmatched ?? 0,
    bankStatementBalance: imported.length ? imported.reduce((s, b) => s + Number(b.lastImportedBalance), 0) : null,
    vatPeriodsOpen: periods.filter((p) => !declared.has(p.start)).length,
    balanceSheetGap: sheet.ecart,
    trialDebit: trial.reduce((s, r) => s + r.debitMovements, 0),
    trialCredit: trial.reduce((s, r) => s + r.creditMovements, 0),
  };
}

// Books the proposals as DRAFT entries dated on the last day of the year
// (journal OD when it exists). A proposal generated before and still in
// draft is replaced, so running a step again never doubles it.
export async function createClosingDrafts(
  organizationId: string,
  fy: FiscalYear,
  proposals: ClosingEntryProposal[],
  previous: Record<string, string>,
): Promise<{ generated: Record<string, string>; error: string | null }> {
  const [accounts, journals] = await Promise.all([listAccounts(organizationId, true), listJournals(organizationId)]);
  const journal = journals.find((j) => j.code === 'OD') ?? journals.find((j) => j.kind === 'custom') ?? journals[0];
  if (!journal) return { generated: previous, error: 'Aucun journal comptable : créez d’abord la comptabilité (Comptabilité › Paramètres).' };

  const byCode = new Map(accounts.map((a) => [a.code, a.id]));
  const needed = [...new Set(proposals.flatMap((p) => p.lines.map((l) => l.account)))].filter((code) => !byCode.has(code));
  for (const code of needed) {
    const def = CLOSING_ACCOUNTS[code];
    if (!def) return { generated: previous, error: `Compte ${code} introuvable dans votre plan comptable.` };
    const { error } = await createAccount(organizationId, { code, label: def.label, classNum: def.classNum, type: def.type, normalBalance: def.normalBalance });
    if (error) return { generated: previous, error };
  }
  const fresh = needed.length ? await listAccounts(organizationId, true) : accounts;
  const id = new Map(fresh.map((a) => [a.code, a.id]));

  const generated = { ...previous };
  for (const p of proposals) {
    const old = generated[p.key];
    if (old) {
      const { data } = await supabase.from('accounting_entries').select('status').eq('id', old).maybeSingle();
      if (data?.status === 'brouillon') await deleteDraftEntry(old);
      else if (data) continue; // already posted: leave it alone
    }
    const { id: entryId, error } = await createDraftEntry({ organizationId, fiscalYearId: fy.id, journalId: journal.id, entryDate: fy.end_date, label: p.label, externalReference: `bouclement:${p.key}` });
    if (error || !entryId) return { generated, error: error ?? 'Écriture non créée' };
    let order = 0;
    for (const l of p.lines) {
      const { error: lineError } = await addEntryLine({ entryId, accountId: id.get(l.account)!, debit: l.debit, credit: l.credit, label: l.label, sortOrder: order++ });
      if (lineError) return { generated, error: lineError };
    }
    generated[p.key] = entryId;
  }
  return { generated, error: null };
}

export async function lockYear(fy: FiscalYear): Promise<{ error: string | null }> {
  return closeFiscalYear(fy.id);
}

// The closing file: trial balance of the year + closing summary, as CSV
// (semicolons, Swiss Excel). Download is web-only.
export function closingCsv(trial: TrialBalanceRow[], summary: [string, string][]): string {
  const esc = (v: string) => (/[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const lines = ['Compte;Libellé;Solde ouverture;Débit;Crédit;Solde clôture'];
  for (const r of trial) lines.push([r.code, r.label, r.openingBalance.toFixed(2), r.debitMovements.toFixed(2), r.creditMovements.toFixed(2), r.closingBalance.toFixed(2)].map(esc).join(';'));
  lines.push('', 'Bouclement;Valeur');
  for (const [k, v] of summary) lines.push(`${esc(k)};${esc(v)}`);
  return lines.join('\n');
}

export function downloadText(content: string, filename: string, type = 'text/csv;charset=utf-8'): boolean {
  if (typeof document === 'undefined') return false;
  const url = URL.createObjectURL(new Blob(['﻿' + content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return true;
}

// Optional AI review of the closing (edge function closing-ai-review):
// unusual balances, missing provisions, questions to ask the fiduciary.
export async function aiReviewClosing(organizationId: string, payload: Record<string, unknown>, locale: string): Promise<{ text: string | null; error: string | null }> {
  const { data, error } = await supabase.functions.invoke('closing-ai-review', { body: { organization_id: organizationId, summary: payload, locale } });
  if (error) return { text: null, error: error.message };
  if (data?.error) return { text: null, error: String(data.error) };
  return { text: String(data?.review ?? ''), error: null };
}

// Drafts generated earlier for proposals that no longer exist (an accrual
// removed from the list): deleted while still in draft.
export async function removeClosingDrafts(keys: string[], generated: Record<string, string>): Promise<Record<string, string>> {
  const next = { ...generated };
  for (const key of keys) {
    const id = next[key];
    if (!id) continue;
    const { data } = await supabase.from('accounting_entries').select('status').eq('id', id).maybeSingle();
    if (!data || data.status === 'brouillon') {
      if (data) await deleteDraftEntry(id);
      delete next[key];
    }
  }
  return next;
}
