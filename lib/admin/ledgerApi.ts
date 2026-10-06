import { supabase } from '../supabase';
import { getRevenueOverview } from '../api/admin';
import { dueOccurrences, type LedgerEntry, type RecurringRule } from './ledgerCalc';

// Data of admin › Comptabilité (table admin_ledger_entries, private bucket
// admin-ledger, migration 20261003150000). Platform admins only (RLS).

const BUCKET = 'admin-ledger';

export type LedgerInput = Omit<LedgerEntry, 'id' | 'source' | 'source_id'> & { id?: string };

// Columns of the second migration (20261003190000): recurring entries and
// « proof ». Until it is pasted, the page keeps working without them.
let v2: boolean | null = null;
export async function ledgerV2(): Promise<boolean> {
  if (v2 !== null) return v2;
  const { error } = await supabase.from('admin_ledger_recurring').select('id').limit(1);
  v2 = !error;
  return v2;
}

const missing = (msg?: string) => !!msg && /admin_ledger_entries|relation|schema cache|does not exist/i.test(msg);

export async function listLedger(from: string, to: string): Promise<{ rows: LedgerEntry[]; available: boolean; error: string | null }> {
  const { data, error } = await supabase
    .from('admin_ledger_entries')
    .select('*')
    .gte('entry_date', from)
    .lte('entry_date', to)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) return { rows: [], available: !missing(error.message), error: missing(error.message) ? null : error.message };
  return { rows: (data ?? []).map((r: any) => ({ ...r, amount_chf: Number(r.amount_chf), vat_rate: Number(r.vat_rate) })) as LedgerEntry[], available: true, error: null };
}

export async function saveLedgerEntry(input: LedgerInput): Promise<{ entry: LedgerEntry | null; error: string | null }> {
  const row = {
    entry_date: input.entry_date,
    kind: input.kind,
    category: input.category,
    label: input.label.trim(),
    counterparty: input.counterparty?.trim() || null,
    amount_chf: Math.round(Math.abs(input.amount_chf) * 100) / 100,
    vat_rate: input.vat_rate || 0,
    payment_method: input.payment_method || null,
    reference: input.reference?.trim() || null,
    receipt_path: input.receipt_path || null,
    notes: input.notes?.trim() || null,
    updated_at: new Date().toISOString(),
    ...((await ledgerV2()) ? { proof: input.receipt_path && input.proof !== 'quittance_interne' ? null : input.proof ?? null } : {}),
  };
  const { data, error } = input.id
    ? await supabase.from('admin_ledger_entries').update(row).eq('id', input.id).select('*').single()
    : await supabase.from('admin_ledger_entries').insert(row).select('*').single();
  return { entry: (data as LedgerEntry | null) ?? null, error: error?.message ?? null };
}

export async function deleteLedgerEntry(entry: LedgerEntry): Promise<{ error: string | null }> {
  const { error } = await supabase.from('admin_ledger_entries').delete().eq('id', entry.id);
  if (!error && entry.receipt_path) await supabase.storage.from(BUCKET).remove([entry.receipt_path]);
  return { error: error?.message ?? null };
}

// Receipt (photo or PDF) → admin-ledger/<year>/<uuid>-<name>.
export async function uploadReceipt(uri: string, name: string, mimeType: string | null, date: string): Promise<{ path: string | null; error: string | null }> {
  try {
    const blob = await (await fetch(uri)).blob();
    const safe = name.normalize('NFD').replace(/[^\w.-]+/g, '-').slice(-80) || 'justificatif';
    const id = Math.random().toString(36).slice(2, 10);
    const path = `${date.slice(0, 4)}/${date}-${id}-${safe}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: mimeType ?? blob.type ?? 'application/octet-stream', upsert: false });
    return error ? { path: null, error: error.message } : { path, error: null };
  } catch (e) {
    return { path: null, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function receiptUrl(path: string): Promise<string | null> {
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 300);
  return data?.signedUrl ?? null;
}

// Stripe: each paid invoice becomes an income (gross) and its Stripe fee an
// expense; each refund an expense. source_id is unique, so importing again only adds what is new.
export async function importStripe(): Promise<{ added: number; error: string | null }> {
  const { overview, error } = await getRevenueOverview();
  if (error || !overview) return { added: 0, error: error ?? 'Stripe indisponible' };
  const rows: Record<string, unknown>[] = [];
  for (const tx of overview.recent_transactions ?? []) {
    const date = tx.date.slice(0, 10);
    const gross = Math.round((Number(tx.amount_chf) + Number(tx.fee_chf)) * 100) / 100;
    if (gross > 0)
      rows.push({
        entry_date: date,
        kind: 'recette',
        category: 'ventes',
        label: `Abonnement Cantia${tx.number ? ` · facture ${tx.number}` : ''}`,
        counterparty: tx.customer_name,
        amount_chf: gross,
        vat_rate: 0,
        payment_method: 'stripe',
        reference: tx.number,
        source: 'stripe',
        source_id: `stripe:${tx.id}`,
      });
    if (Number(tx.fee_chf) > 0)
      rows.push({
        entry_date: date,
        kind: 'depense',
        category: 'frais_financiers',
        label: `Frais Stripe${tx.number ? ` · facture ${tx.number}` : ''}`,
        counterparty: 'Stripe',
        amount_chf: Number(tx.fee_chf),
        vat_rate: 0,
        payment_method: 'stripe',
        reference: tx.number,
        source: 'stripe',
        source_id: `stripe-fee:${tx.id}`,
      });
  }
  // Refunds: money paid back to a customer, recorded as its own expense
  // (Stripe keeps its original fee, so the fee entry above stays).
  for (const r of overview.recent_refunds ?? []) {
    if (!(Number(r.amount_chf) > 0)) continue;
    rows.push({
      entry_date: r.date.slice(0, 10),
      kind: 'depense',
      category: 'remboursements',
      label: `Remboursement Stripe${r.number ? ` · facture ${r.number}` : ''}`,
      counterparty: r.customer_name,
      amount_chf: Number(r.amount_chf),
      vat_rate: 0,
      payment_method: 'stripe',
      reference: r.number,
      source: 'stripe',
      source_id: `stripe-refund:${r.id}`,
    });
  }
  if (!rows.length) return { added: 0, error: null };
  const { data, error: upsertError } = await supabase.from('admin_ledger_entries').upsert(rows, { onConflict: 'source_id', ignoreDuplicates: true }).select('id');
  return { added: data?.length ?? 0, error: upsertError?.message ?? null };
}

// ---- Recurring entries --------------------------------------------------------

const num = (v: unknown) => Number(v ?? 0);

export async function listRecurring(): Promise<{ rules: RecurringRule[]; available: boolean }> {
  const { data, error } = await supabase.from('admin_ledger_recurring').select('*').order('active', { ascending: false }).order('label');
  if (error) return { rules: [], available: false };
  return { rules: (data ?? []).map((r: any) => ({ ...r, amount_chf: num(r.amount_chf), vat_rate: num(r.vat_rate), day_of_month: num(r.day_of_month) })) as RecurringRule[], available: true };
}

export type RecurringInput = Omit<RecurringRule, 'id' | 'last_date'> & { id?: string; last_date?: string | null };

export async function saveRecurring(input: RecurringInput): Promise<{ error: string | null }> {
  const row = {
    kind: input.kind,
    category: input.category,
    label: input.label.trim(),
    counterparty: input.counterparty?.trim() || null,
    amount_chf: Math.round(Math.abs(input.amount_chf) * 100) / 100,
    vat_rate: input.vat_rate || 0,
    payment_method: input.payment_method || null,
    frequency: input.frequency,
    day_of_month: input.day_of_month,
    start_date: input.start_date,
    end_date: input.end_date || null,
    proof: input.proof ?? null,
    notes: input.notes?.trim() || null,
    active: input.active,
    updated_at: new Date().toISOString(),
    ...(input.last_date !== undefined ? { last_date: input.last_date } : {}),
  };
  const { error } = input.id ? await supabase.from('admin_ledger_recurring').update(row).eq('id', input.id) : await supabase.from('admin_ledger_recurring').insert(row);
  return { error: error?.message ?? null };
}

export async function deleteRecurring(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('admin_ledger_recurring').delete().eq('id', id);
  return { error: error?.message ?? null };
}

// Posts every due occurrence into the journal (source « recurrent », one
// unique source_id per date) and moves last_date forward.
export async function postDueRecurring(rules: RecurringRule[], today: string): Promise<{ added: number; error: string | null }> {
  let added = 0;
  for (const rule of rules) {
    const dates = dueOccurrences(rule, today);
    if (!dates.length) continue;
    const rows = dates.map((d) => ({
      entry_date: d,
      kind: rule.kind,
      category: rule.category,
      label: rule.label,
      counterparty: rule.counterparty,
      amount_chf: rule.amount_chf,
      vat_rate: rule.vat_rate,
      payment_method: rule.payment_method,
      notes: rule.notes,
      proof: rule.proof,
      source: 'recurrent',
      source_id: `rec:${rule.id}:${d}`,
      recurring_id: rule.id,
    }));
    const { data, error } = await supabase.from('admin_ledger_entries').upsert(rows, { onConflict: 'source_id', ignoreDuplicates: true }).select('id');
    if (error) return { added, error: error.message };
    added += data?.length ?? 0;
    const { error: e2 } = await supabase.from('admin_ledger_recurring').update({ last_date: dates[dates.length - 1] }).eq('id', rule.id);
    if (e2) return { added, error: e2.message };
  }
  return { added, error: null };
}

// Internal receipt: the PDF (built by ledgerPdf.buildInternalReceipt) is
// stored like any receipt and attached to the entry.
export async function attachGeneratedReceipt(entry: LedgerEntry, pdf: string, fileName: string): Promise<{ path: string | null; error: string | null }> {
  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i) & 0xff;
  const path = `${entry.entry_date.slice(0, 4)}/${entry.entry_date}-quittance-${entry.id.slice(0, 8)}-${fileName}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, new Blob([bytes], { type: 'application/pdf' }), { contentType: 'application/pdf', upsert: true });
  if (error) return { path: null, error: error.message };
  const { error: e2 } = await supabase
    .from('admin_ledger_entries')
    .update({ receipt_path: path, ...((await ledgerV2()) ? { proof: 'quittance_interne' } : {}), updated_at: new Date().toISOString() })
    .eq('id', entry.id);
  return { path: e2 ? null : path, error: e2?.message ?? null };
}
