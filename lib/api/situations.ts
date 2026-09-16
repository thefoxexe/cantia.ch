import { supabase } from '../supabase';
import type { ChantierSituation, ChantierSituationItem, Devis, DevisItem } from '../types';

export async function listSituations(projectId: string): Promise<ChantierSituation[]> {
  const { data } = await supabase
    .from('chantier_situations')
    .select('*')
    .eq('project_id', projectId)
    .order('situation_index', { ascending: false });
  return data ?? [];
}

export async function getSituation(situationId: string): Promise<{ situation: ChantierSituation | null; items: ChantierSituationItem[] }> {
  const [{ data: situation }, { data: items }] = await Promise.all([
    supabase.from('chantier_situations').select('*').eq('id', situationId).single(),
    supabase.from('chantier_situation_items').select('*').eq('situation_id', situationId).order('sort_order', { ascending: true }),
  ]);
  return { situation: situation ?? null, items: items ?? [] };
}

// Devis a chantier can base a situation on — only devis that actually have
// items (an empty devis has nothing to track progress against).
export async function listDevisForProject(projectId: string): Promise<Devis[]> {
  const { data } = await supabase
    .from('devis')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  return data ?? [];
}

// Pre-fills previous_percent from the most recently FINALIZED situation on
// the same devis, matched by source_devis_item_id (never by description —
// wording can change between situations, the devis_items row never does).
async function previousPercentsByDevisItem(devisId: string): Promise<Map<string, number>> {
  const { data: prior } = await supabase
    .from('chantier_situations')
    .select('id')
    .eq('devis_id', devisId)
    .eq('status', 'finalized')
    .order('situation_index', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!prior) return new Map();
  const { data: items } = await supabase
    .from('chantier_situation_items')
    .select('source_devis_item_id, cumulative_percent')
    .eq('situation_id', prior.id);
  const map = new Map<string, number>();
  for (const it of items ?? []) {
    if (it.source_devis_item_id) map.set(it.source_devis_item_id, Number(it.cumulative_percent));
  }
  return map;
}

export async function createSituationDraft(params: {
  organizationId: string;
  projectId: string;
  devisId: string;
  title: string;
  userId: string | undefined;
}): Promise<{ situationId: string | null; error: string | null }> {
  const [{ data: devis }, { data: devisItems }, existingCount] = await Promise.all([
    supabase.from('devis').select('*').eq('id', params.devisId).single(),
    supabase.from('devis_items').select('*').eq('devis_id', params.devisId).order('sort_order', { ascending: true }),
    supabase.from('chantier_situations').select('id', { count: 'exact', head: true }).eq('devis_id', params.devisId),
  ]);
  if (!devis) return { situationId: null, error: 'Devis introuvable' };
  const items = (devisItems ?? []) as DevisItem[];
  if (items.length === 0) return { situationId: null, error: 'Ce devis ne contient aucune ligne à suivre.' };

  const previousPercents = await previousPercentsByDevisItem(params.devisId);
  const situationIndex = (existingCount.count ?? 0) + 1;

  const { data: situation, error: situationError } = await supabase
    .from('chantier_situations')
    .insert({
      organization_id: params.organizationId,
      project_id: params.projectId,
      devis_id: params.devisId,
      situation_index: situationIndex,
      title: params.title.trim(),
      client_name: devis.client_name,
      client_email: devis.client_email,
      vat_rate: devis.vat_rate,
      created_by: params.userId,
    })
    .select()
    .single();

  if (situationError || !situation) return { situationId: null, error: situationError?.message ?? 'Échec de la création de la situation' };

  const itemsPayload = items.map((it, i) => {
    const previous = previousPercents.get(it.id) ?? 0;
    return {
      situation_id: situation.id,
      source_devis_item_id: it.id,
      description: it.description,
      unit: it.unit,
      contract_quantity: it.quantity,
      unit_price: it.unit_price,
      previous_percent: previous,
      cumulative_percent: previous,
      sort_order: i,
    };
  });

  const { error: itemsError } = await supabase.from('chantier_situation_items').insert(itemsPayload);
  if (itemsError) return { situationId: situation.id, error: itemsError.message };

  return { situationId: situation.id, error: null };
}

export async function updateSituationItemPercent(itemId: string, cumulativePercent: number): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('chantier_situation_items')
    .update({ cumulative_percent: cumulativePercent })
    .eq('id', itemId);
  return { error: error?.message ?? null };
}

export async function updateSituationRetenue(situationId: string, percent: number): Promise<{ error: string | null }> {
  const { error } = await supabase.from('chantier_situations').update({ retenue_garantie_percent: percent }).eq('id', situationId);
  return { error: error?.message ?? null };
}

export async function finalizeSituation(situationId: string): Promise<{ factureId: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc('finalize_chantier_situation', { p_situation_id: situationId });
  return { factureId: (data as string) ?? null, error: error?.message ?? null };
}
