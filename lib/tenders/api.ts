// Supabase access for métrés. Every table is protected by RLS
// (can_access_tender / can_edit_tender / can_price_tender); the client never
// sends an organization_id — the database derives it from the chantier.

import { supabase } from '../supabase';
import type {
  PositionBreakdown,
  PositionPrice,
  QuantitySource,
  Tender,
  TenderKind,
  TenderNode,
  TenderPosition,
  ZoneLabel,
  NodeType,
} from './types.ts';

const num = (v: unknown): number | null => (v == null || v === '' ? null : Number(v));

function toTender(r: any): Tender {
  return { ...r, discount_percent: Number(r.discount_percent ?? 0), escompte_percent: Number(r.escompte_percent ?? 0), vat_rate: Number(r.vat_rate ?? 0) };
}
function toPosition(r: any): TenderPosition {
  return {
    ...r,
    quantity_original: num(r.quantity_original),
    quantity_measured: num(r.quantity_measured),
    quantity_manual: num(r.quantity_manual),
    quantity_selected: num(r.quantity_selected),
  };
}
function toBreakdown(r: any): PositionBreakdown {
  return { ...r, quantity_original: num(r.quantity_original), quantity_measured: num(r.quantity_measured), quantity_manual: num(r.quantity_manual) };
}
function toPrice(r: any): PositionPrice {
  return { ...r, unit_price: num(r.unit_price), document_unit_price: num(r.document_unit_price), document_amount: num(r.document_amount), amount: num(r.amount) };
}

export interface TenderSummary extends Tender {
  positions: number;
  amount: number | null;
}

export async function listTenders(projectId: string): Promise<{ tenders: TenderSummary[]; error: string | null }> {
  const { data, error } = await supabase
    .from('tenders')
    .select('*, tender_positions(count)')
    .eq('project_id', projectId)
    .order('sort_order')
    .order('created_at');
  if (error) return { tenders: [], error: error.message };
  const ids = (data ?? []).map((t: any) => t.id);
  // Prices are only returned to members with the Finances permission.
  const { data: prices } = ids.length
    ? await supabase.from('tender_position_prices').select('tender_id, amount').in('tender_id', ids)
    : { data: [] as { tender_id: string; amount: number | null }[] };
  const totals = new Map<string, number>();
  for (const p of prices ?? []) totals.set(p.tender_id, (totals.get(p.tender_id) ?? 0) + Number(p.amount ?? 0));
  return {
    tenders: (data ?? []).map((t: any) => ({
      ...toTender(t),
      positions: t.tender_positions?.[0]?.count ?? 0,
      amount: totals.has(t.id) ? totals.get(t.id)! : null,
    })),
    error: null,
  };
}

export async function createTender(projectId: string, fields: { name: string; kind: TenderKind; number?: string | null; cfc_code?: string | null }) {
  const { data, error } = await supabase
    .from('tenders')
    .insert({ project_id: projectId, name: fields.name, kind: fields.kind, number: fields.number ?? null, cfc_code: fields.cfc_code ?? null, classification_type: 'CUSTOM', source_type: 'manual', status: 'in_progress' })
    .select('*')
    .single();
  return { tender: data ? toTender(data) : null, error: error?.message ?? null };
}

export async function updateTender(id: string, patch: Partial<Pick<Tender, 'name' | 'number' | 'kind' | 'status' | 'cfc_code' | 'cfc_label' | 'discount_percent' | 'escompte_percent' | 'vat_rate' | 'sort_order'>>) {
  const { error } = await supabase.from('tenders').update(patch).eq('id', id);
  return { error: error?.message ?? null };
}

export async function deleteTender(id: string) {
  const { error } = await supabase.from('tenders').delete().eq('id', id);
  return { error: error?.message ?? null };
}

export async function duplicateTender(id: string, name: string) {
  const { data, error } = await supabase.rpc('duplicate_tender', { p_tender: id, p_name: name });
  return { id: (data as string | null) ?? null, error: error?.message ?? null };
}

export async function canEditTenders(organizationId: string): Promise<boolean> {
  const { data } = await supabase.rpc('org_has_tenders', { org_id: organizationId });
  return data === true;
}

export interface TenderBundle {
  tender: Tender;
  nodes: TenderNode[];
  positions: TenderPosition[];
  breakdowns: PositionBreakdown[];
  prices: PositionPrice[];
  zoneLabels: ZoneLabel[];
  // false when RLS hid the prices (no Finances permission).
  pricesVisible: boolean;
}

// Paged reads: a 50-page soumission easily has 1'000+ nodes.
async function selectAll<T>(table: string, tenderId: string, order: string): Promise<T[]> {
  const out: T[] = [];
  const size = 1000;
  for (let from = 0; ; from += size) {
    const { data, error } = await supabase.from(table).select('*').eq('tender_id', tenderId).order(order).range(from, from + size - 1);
    if (error) throw new Error(error.message);
    out.push(...((data ?? []) as T[]));
    if (!data || data.length < size) break;
  }
  return out;
}

export async function loadTender(id: string): Promise<{ bundle: TenderBundle | null; error: string | null }> {
  try {
    const { data: tender, error } = await supabase.from('tenders').select('*').eq('id', id).maybeSingle();
    if (error) return { bundle: null, error: error.message };
    if (!tender) return { bundle: null, error: null };
    const [nodes, positions, breakdowns, prices, zoneLabels, priceAccess] = await Promise.all([
      selectAll<TenderNode>('tender_nodes', id, 'sort_order'),
      selectAll<any>('tender_positions', id, 'created_at'),
      selectAll<any>('position_breakdowns', id, 'sort_order'),
      selectAll<any>('tender_position_prices', id, 'position_id'),
      selectAll<ZoneLabel>('tender_zone_labels', id, 'code'),
      supabase.rpc('can_price_tender', { t_id: id }),
    ]);
    return {
      bundle: {
        tender: toTender(tender),
        nodes,
        positions: positions.map(toPosition),
        breakdowns: breakdowns.map(toBreakdown),
        prices: prices.map(toPrice),
        zoneLabels,
        pricesVisible: priceAccess.data === true,
      },
      error: null,
    };
  } catch (e) {
    return { bundle: null, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function updatePosition(id: string, patch: Partial<Pick<TenderPosition, 'unit' | 'raw_unit' | 'quantity_manual' | 'manual_note' | 'quantity_selected_source' | 'status' | 'excluded'>> & { quantity_original?: number | null }) {
  const { data, error } = await supabase.from('tender_positions').update(patch).eq('id', id).select('*').single();
  return { position: data ? toPosition(data) : null, error: error?.message ?? null };
}

export async function setUnitPrice(tenderId: string, positionId: string, unitPrice: number | null, source: PositionPrice['price_source'] = 'manual') {
  const { data, error } = await supabase
    .from('tender_position_prices')
    .upsert({ position_id: positionId, tender_id: tenderId, unit_price: unitPrice, price_source: unitPrice == null ? null : source }, { onConflict: 'position_id' })
    .select('*')
    .single();
  return { price: data ? toPrice(data) : null, error: error?.message ?? null };
}

export async function updateNode(id: string, patch: Partial<Pick<TenderNode, 'title' | 'description' | 'raw_number' | 'display_reference' | 'needs_review' | 'is_reserved'>> & { validated_at?: string | null }) {
  const { error } = await supabase.from('tender_nodes').update(patch).eq('id', id);
  return { error: error?.message ?? null };
}

// Adds a node (and its position when billable) right after `afterSortOrder`
// under `parentId`. sort_order leaves gaps of 1000 so inserts rarely need a
// renumbering.
export async function addNode(tenderId: string, fields: { parentId: string | null; nodeType: NodeType; depth: number; sortOrder: number; title: string; reference?: string | null; unit?: string | null }) {
  const { data: node, error } = await supabase
    .from('tender_nodes')
    .insert({
      tender_id: tenderId,
      parent_id: fields.parentId,
      node_type: fields.nodeType,
      depth: fields.depth,
      sort_order: fields.sortOrder,
      title: fields.title,
      raw_number: fields.reference ?? null,
      display_reference: fields.reference ?? null,
      classification_type: 'CUSTOM',
    })
    .select('*')
    .single();
  if (error || !node) return { node: null, position: null, error: error?.message ?? 'Erreur' };
  if (fields.nodeType !== 'billable_position') return { node: node as TenderNode, position: null, error: null };
  const { data: pos, error: posError } = await supabase
    .from('tender_positions')
    .insert({ tender_id: tenderId, node_id: node.id, unit: fields.unit ?? null, raw_unit: fields.unit ?? null, quantity_selected_source: 'manual' as QuantitySource, status: 'to_price' })
    .select('*')
    .single();
  return { node: node as TenderNode, position: pos ? toPosition(pos) : null, error: posError?.message ?? null };
}

export async function deleteNode(id: string) {
  const { error } = await supabase.from('tender_nodes').delete().eq('id', id);
  return { error: error?.message ?? null };
}

export async function updateBreakdown(id: string, patch: Partial<Pick<PositionBreakdown, 'quantity_manual' | 'label'>>) {
  const { error } = await supabase.from('position_breakdowns').update(patch).eq('id', id);
  return { error: error?.message ?? null };
}

export async function setZoneLabel(tenderId: string, code: string, label: string | null) {
  const { error } = await supabase.from('tender_zone_labels').upsert({ tender_id: tenderId, code, label, source: 'user' }, { onConflict: 'tender_id,code' });
  return { error: error?.message ?? null };
}

export interface AuditEntry {
  id: number;
  entity: string;
  entity_id: string;
  field: string;
  old_value: string | null;
  new_value: string | null;
  actor: string | null;
  at: string;
}

export async function auditFor(tenderId: string, entityIds: string[]): Promise<AuditEntry[]> {
  if (!entityIds.length) return [];
  const { data } = await supabase
    .from('tender_audit_log')
    .select('*')
    .eq('tender_id', tenderId)
    .in('entity_id', entityIds)
    .order('at', { ascending: false })
    .limit(50);
  return (data ?? []) as AuditEntry[];
}
