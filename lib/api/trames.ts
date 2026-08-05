import { supabase } from '../supabase';
import type { DevisTrame, DevisTrameItem } from '../types';

export interface TrameItemInput {
  description: string;
  unit: string;
  unitPrice: number;
}

export async function listTrames(organizationId: string): Promise<DevisTrame[]> {
  const { data } = await supabase
    .from('devis_trames')
    .select('*')
    .eq('organization_id', organizationId)
    .order('name', { ascending: true });
  return data ?? [];
}

export async function fetchTrame(trameId: string): Promise<{ trame: DevisTrame | null; items: DevisTrameItem[] }> {
  const [{ data: trame }, { data: items }] = await Promise.all([
    supabase.from('devis_trames').select('*').eq('id', trameId).single(),
    supabase.from('devis_trame_items').select('*').eq('trame_id', trameId).order('sort_order', { ascending: true }),
  ]);
  return { trame: trame ?? null, items: items ?? [] };
}

async function insertItems(trameId: string, items: TrameItemInput[]): Promise<{ error: string | null }> {
  if (!items.length) return { error: null };
  const { error } = await supabase.from('devis_trame_items').insert(
    items.map((it, i) => ({
      trame_id: trameId,
      description: it.description,
      unit: it.unit || 'pce',
      unit_price: it.unitPrice,
      sort_order: i,
    })),
  );
  return { error: error?.message ?? null };
}

export async function createTrame(
  organizationId: string,
  name: string,
  items: TrameItemInput[],
): Promise<{ id: string | null; error: string | null }> {
  const { data: created, error: insertError } = await supabase
    .from('devis_trames')
    .insert({ organization_id: organizationId, name })
    .select('id')
    .single();
  if (insertError || !created) return { id: null, error: insertError?.message ?? 'Échec de la création.' };

  const { error: itemsError } = await insertItems(created.id, items);
  if (itemsError) return { id: created.id, error: itemsError };
  return { id: created.id, error: null };
}

// Captures a devis's current lines into a brand-new trame — the "enregistrer
// comme trame" action on an existing devis.
export async function createTrameFromDevis(
  organizationId: string,
  name: string,
  devisId: string,
): Promise<{ id: string | null; error: string | null }> {
  const { data: devisItems } = await supabase
    .from('devis_items')
    .select('description, unit, unit_price')
    .eq('devis_id', devisId)
    .order('sort_order', { ascending: true });

  return createTrame(
    organizationId,
    name,
    (devisItems ?? []).map((it) => ({ description: it.description, unit: it.unit ?? 'pce', unitPrice: Number(it.unit_price) })),
  );
}

export async function renameTrame(trameId: string, name: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('devis_trames').update({ name }).eq('id', trameId);
  return { error: error?.message ?? null };
}

// Full replace rather than diffing — a trame's item list is short (a
// handful of positions) and edited as a whole from the detail screen, so
// there's no benefit to a more surgical update.
export async function replaceTrameItems(trameId: string, items: TrameItemInput[]): Promise<{ error: string | null }> {
  const { error: delError } = await supabase.from('devis_trame_items').delete().eq('trame_id', trameId);
  if (delError) return { error: delError.message };
  return insertItems(trameId, items);
}

export async function deleteTrame(trameId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('devis_trames').delete().eq('id', trameId);
  return { error: error?.message ?? null };
}
