import { supabase } from '../supabase';
import { invokeFunction } from './functions';

export async function sendDevisEmail(devisId: string): Promise<{ sent: boolean; error: string | null }> {
  const { data, error } = await invokeFunction<{ sent: boolean }>('send-devis-email', { devis_id: devisId });
  return { sent: !!data?.sent, error };
}

export async function duplicateDevis(devisId: string): Promise<{ id: string | null; error: string | null }> {
  const { data: original, error: loadError } = await supabase.from('devis').select('*').eq('id', devisId).single();
  if (loadError || !original) return { id: null, error: loadError?.message ?? 'Devis introuvable.' };

  const { data: items } = await supabase
    .from('devis_items')
    .select('*')
    .eq('devis_id', devisId)
    .order('sort_order', { ascending: true });

  const { data: created, error: insertError } = await supabase
    .from('devis')
    .insert({
      organization_id: original.organization_id,
      project_id: original.project_id,
      client_name: original.client_name,
      client_address: original.client_address,
      client_email: original.client_email,
      notes: original.notes,
      vat_rate: original.vat_rate,
    })
    .select('id')
    .single();
  if (insertError || !created) return { id: null, error: insertError?.message ?? 'Échec de la duplication.' };

  if (items?.length) {
    const { error: itemsError } = await supabase.from('devis_items').insert(
      items.map((it) => ({
        devis_id: created.id,
        description: it.description,
        quantity: it.quantity,
        unit: it.unit,
        unit_price: it.unit_price,
        sort_order: it.sort_order,
      })),
    );
    if (itemsError) return { id: created.id, error: itemsError.message };
  }

  return { id: created.id, error: null };
}
