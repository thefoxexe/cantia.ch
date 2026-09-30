import { supabase } from '../supabase';

// Subtotal (sum of quantity x unit price, before VAT) of each devis /
// facture, computed in the database in one call (see
// supabase/migrations/20260930150000_document_subtotals.sql). Use this
// instead of reading every line with `.in(ids)`: that put the ids in the
// URL, was capped at 1000 lines and ran the row policies per line.

async function subtotals(fn: 'facture_subtotals' | 'devis_subtotals', key: 'facture_id' | 'devis_id', ids: string[]): Promise<Record<string, number>> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return {};
  const { data, error } = await supabase.rpc(fn, { p_ids: unique });
  if (error) console.error(fn, error.message);
  const out: Record<string, number> = {};
  for (const row of (data ?? []) as Record<string, unknown>[]) out[row[key] as string] = Number(row.subtotal) || 0;
  return out;
}

export function factureSubtotals(ids: string[]): Promise<Record<string, number>> {
  return subtotals('facture_subtotals', 'facture_id', ids);
}

export function devisSubtotals(ids: string[]): Promise<Record<string, number>> {
  return subtotals('devis_subtotals', 'devis_id', ids);
}
