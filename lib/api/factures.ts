import { invokeFunction } from './functions';
import { supabase } from '../supabase';
import type { Facture } from '../types';

export async function sendFactureReminder(factureId: string): Promise<{ sent: boolean; error: string | null }> {
  const { data, error } = await invokeFunction<{ sent: boolean }>('send-facture-reminder', { facture_id: factureId });
  return { sent: !!data?.sent, error };
}

// depositPercent omitted (or null) creates the normal final invoice, which
// auto-deducts any deposits already billed on the same devis. Passing a
// percent instead creates a deposit invoice for that share of the devis.
export async function convertDevisToFacture(
  devisId: string,
  depositPercent?: number,
): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc('convert_devis_to_facture', {
    p_devis_id: devisId,
    p_deposit_percent: depositPercent ?? null,
  });
  return { id: data ?? null, error: error?.message ?? null };
}

export async function listFacturesForDevis(devisId: string): Promise<Pick<Facture, 'id' | 'number' | 'status' | 'is_deposit'>[]> {
  const { data } = await supabase
    .from('factures')
    .select('id, number, status, is_deposit')
    .eq('devis_id', devisId)
    .order('created_at', { ascending: true });
  return data ?? [];
}

// devis_id is deliberately not copied: a duplicate is a fresh, unrelated
// document — keeping the link would make it look like another deposit/final
// invoice for the same quote, which the deduction logic in
// convert_devis_to_facture would then pick up unintentionally.
export async function duplicateFacture(factureId: string): Promise<{ id: string | null; error: string | null }> {
  const { data: original, error: loadError } = await supabase.from('factures').select('*').eq('id', factureId).single();
  if (loadError || !original) return { id: null, error: loadError?.message ?? 'Facture introuvable.' };

  const { data: items } = await supabase
    .from('facture_items')
    .select('*')
    .eq('facture_id', factureId)
    .order('sort_order', { ascending: true });

  const { data: created, error: insertError } = await supabase
    .from('factures')
    .insert({
      organization_id: original.organization_id,
      project_id: original.project_id,
      template_id: original.template_id,
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
    const { error: itemsError } = await supabase.from('facture_items').insert(
      items.map((it) => ({
        facture_id: created.id,
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
