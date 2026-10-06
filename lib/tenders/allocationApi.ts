// Links between plan measures and métré positions (phase E). Quantities are
// recomputed by the database (quantity_allocations_compute); what is sent
// here is only the formula, its parameters and an optional adjustment.

import { supabase } from '../supabase';
import { loadTender, type TenderBundle } from './api.ts';
import type { Params, PositionLite } from './allocation.ts';

export interface Allocation {
  id: string;
  tender_id: string;
  position_id: string;
  measured_object_id: string | null;
  formula: string;
  params: Params;
  calculated_quantity: number | null;
  manual_adjustment: number;
  final_quantity: number | null;
  comment: string | null;
  created_at: string;
}

const num = (v: unknown) => (v == null ? null : Number(v));
const toAlloc = (r: Record<string, unknown>): Allocation => ({
  id: r.id as string,
  tender_id: r.tender_id as string,
  position_id: r.position_id as string,
  measured_object_id: (r.measured_object_id as string | null) ?? null,
  formula: r.formula as string,
  params: (r.params as Params) ?? {},
  calculated_quantity: num(r.calculated_quantity),
  manual_adjustment: Number(r.manual_adjustment ?? 0),
  final_quantity: num(r.final_quantity),
  comment: (r.comment as string | null) ?? null,
  created_at: r.created_at as string,
});

// Positions of a métré as the suggestion engine needs them: own text plus
// the titles of the parents (chapter › article › sub-article).
export interface TenderPositions {
  bundle: TenderBundle;
  lite: PositionLite[];
  byId: Map<string, PositionLite & { source: string; quantity_original: number | null; quantity_measured: number | null; quantity_selected: number | null }>;
}

export function positionsLite(bundle: TenderBundle): TenderPositions {
  const nodes = new Map(bundle.nodes.map((n) => [n.id, n]));
  const byId: TenderPositions['byId'] = new Map();
  const lite: PositionLite[] = [];
  const ordered = [...bundle.positions].sort((a, b) => (nodes.get(a.node_id)?.sort_order ?? 0) - (nodes.get(b.node_id)?.sort_order ?? 0));
  for (const p of ordered) {
    const n = nodes.get(p.node_id);
    if (!n) continue;
    const chain: string[] = [];
    let parent = n.parent_id ? nodes.get(n.parent_id) : undefined;
    while (parent) {
      if (parent.node_type !== 'contract' && parent.title) chain.unshift(parent.title);
      parent = parent.parent_id ? nodes.get(parent.parent_id) : undefined;
    }
    const item: PositionLite = {
      id: p.id,
      ref: n.display_reference ?? n.position_path ?? n.raw_number,
      title: n.title ?? '',
      text: n.description || n.title || '',
      context: chain.slice(-3).join(' › '),
      unit: p.unit,
      excluded: p.excluded,
    };
    lite.push(item);
    byId.set(p.id, { ...item, source: p.quantity_selected_source, quantity_original: p.quantity_original, quantity_measured: p.quantity_measured, quantity_selected: p.quantity_selected });
  }
  return { bundle, lite, byId };
}

export async function loadTenderPositions(tenderId: string): Promise<TenderPositions | null> {
  const { bundle } = await loadTender(tenderId);
  return bundle ? positionsLite(bundle) : null;
}

export async function allocationsForObjects(objectIds: string[]): Promise<Allocation[]> {
  if (!objectIds.length) return [];
  const { data } = await supabase.from('quantity_allocations').select('*').in('measured_object_id', objectIds).is('deleted_at', null).order('created_at');
  return (data ?? []).map(toAlloc);
}

export async function allocationsForTender(tenderId: string): Promise<Allocation[]> {
  const { data } = await supabase.from('quantity_allocations').select('*').eq('tender_id', tenderId).is('deleted_at', null).order('created_at');
  return (data ?? []).map(toAlloc);
}

export async function createAllocations(rows: { positionId: string; measuredObjectId: string; formula: string; params: Params; manualAdjustment?: number }[]) {
  if (!rows.length) return { allocations: [] as Allocation[], error: null };
  const { data, error } = await supabase
    .from('quantity_allocations')
    .insert(rows.map((r) => ({ position_id: r.positionId, measured_object_id: r.measuredObjectId, formula: r.formula, params: r.params, manual_adjustment: r.manualAdjustment ?? 0 })))
    .select('*');
  return { allocations: (data ?? []).map(toAlloc), error: error?.message ?? null };
}

export async function updateAllocation(id: string, patch: { params?: Params; manual_adjustment?: number; comment?: string | null }) {
  const { data, error } = await supabase.from('quantity_allocations').update(patch).eq('id', id).select('*').single();
  return { allocation: data ? toAlloc(data) : null, error: error?.message ?? null };
}

export async function removeAllocation(id: string) {
  const { error } = await supabase.from('quantity_allocations').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  return { error: error?.message ?? null };
}

// The measured quantity becomes the one used in the métré.
export async function useMeasuredQuantity(positionIds: string[]) {
  if (!positionIds.length) return { error: null };
  const { error } = await supabase.from('tender_positions').update({ quantity_selected_source: 'measured' }).in('id', positionIds);
  return { error: error?.message ?? null };
}

// Where each measure lives, to open it from the métré.
export async function measuresInfo(objectIds: string[]): Promise<Map<string, { name: string | null; kind: string; plan_id: string; plan_name: string; page_index: number }>> {
  const out = new Map<string, { name: string | null; kind: string; plan_id: string; plan_name: string; page_index: number }>();
  if (!objectIds.length) return out;
  const { data } = await supabase
    .from('measured_objects')
    .select('id, name, kind, site_plan_pages!inner(page_index, site_plan_revisions!inner(plan_id, site_plans!site_plan_revisions_plan_id_fkey(name)))')
    .in('id', objectIds);
  for (const r of (data ?? []) as unknown as Array<{ id: string; name: string | null; kind: string; site_plan_pages: { page_index: number; site_plan_revisions: { plan_id: string; site_plans: { name: string } | null } } }>) {
    out.set(r.id, { name: r.name, kind: r.kind, plan_id: r.site_plan_pages.site_plan_revisions.plan_id, plan_name: r.site_plan_pages.site_plan_revisions.site_plans?.name ?? '', page_index: r.site_plan_pages.page_index });
  }
  return out;
}
