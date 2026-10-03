import { supabase } from '../supabase';
import { getRevenueOverview } from '../api/admin';
import type { LedgerEntry } from './ledgerCalc';

// Data of admin › Comptabilité (table admin_ledger_entries, private bucket
// admin-ledger, migration 20261003150000). Platform admins only (RLS).

const BUCKET = 'admin-ledger';

export type LedgerInput = Omit<LedgerEntry, 'id' | 'source' | 'source_id'> & { id?: string };

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

export async function saveLedgerEntry(input: LedgerInput): Promise<{ error: string | null }> {
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
  };
  const { error } = input.id ? await supabase.from('admin_ledger_entries').update(row).eq('id', input.id) : await supabase.from('admin_ledger_entries').insert(row);
  return { error: error?.message ?? null };
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
// expense. source_id is unique, so importing again only adds what is new.
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
  if (!rows.length) return { added: 0, error: null };
  const { data, error: upsertError } = await supabase.from('admin_ledger_entries').upsert(rows, { onConflict: 'source_id', ignoreDuplicates: true }).select('id');
  return { added: data?.length ?? 0, error: upsertError?.message ?? null };
}
