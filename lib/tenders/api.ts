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

// ---- Chiffrage --------------------------------------------------------------

// Prices this organisation used in its other métrés (RLS limits them to the
// tenders the member may see, with the Finances permission).
export async function loadPriceHistory(excludeTenderId: string): Promise<import('./pricing.ts').HistoryPrice[]> {
  const { data } = await supabase
    .from('tender_position_prices')
    .select('unit_price, updated_at, tender_id, tenders(name), tender_positions(unit, tender_nodes(title, description))')
    .neq('tender_id', excludeTenderId)
    .not('unit_price', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(3000);
  return ((data ?? []) as any[])
    .filter((r) => r.tender_positions?.tender_nodes)
    .map((r) => ({
      description: r.tender_positions.tender_nodes.description || r.tender_positions.tender_nodes.title || '',
      unit: r.tender_positions.unit ?? null,
      unitPrice: Number(r.unit_price),
      tenderName: r.tenders?.name ?? '',
      at: r.updated_at,
    }));
}

export async function setPrices(tenderId: string, rows: { positionId: string; unitPrice: number; source: NonNullable<PositionPrice['price_source']> }[]) {
  if (!rows.length) return { prices: [] as PositionPrice[], error: null };
  const { data, error } = await supabase
    .from('tender_position_prices')
    .upsert(rows.map((r) => ({ position_id: r.positionId, tender_id: tenderId, unit_price: r.unitPrice, price_source: r.source })), { onConflict: 'position_id' })
    .select('*');
  return { prices: (data ?? []).map(toPrice), error: error?.message ?? null };
}

// The offer is a regular Cantia devis (numbering, quota, PDF, e-mail,
// follow-ups…). Quantities and prices are read back from the database —
// the stored, trigger-computed figures — not from the screen.
export async function createOfferDevis(tenderId: string, opts: { clientName: string; clientId?: string | null; includeUnpriced: boolean }) {
  const { bundle, error } = await loadTender(tenderId);
  if (!bundle) return { devisId: null, error: error ?? 'Métré introuvable' };
  const { tender, nodes, positions, prices } = bundle;
  const priceByPos = new Map(prices.map((p) => [p.position_id, p]));
  const { data: project } = await supabase.from('projects').select('client_name').eq('id', tender.project_id).maybeSingle();
  const { data: devis, error: devErr } = await supabase
    .from('devis')
    .insert({
      organization_id: tender.organization_id,
      project_id: tender.project_id,
      client_name: opts.clientName.trim() || project?.client_name || tender.name,
      client_id: opts.clientId ?? null,
      vat_rate: tender.vat_rate,
      status: 'draft',
      notes: [tender.name, tender.cfc_code ? `CFC ${tender.cfc_code}` : null].filter(Boolean).join(' · '),
    })
    .select('id')
    .single();
  if (devErr || !devis) return { devisId: null, error: devErr?.message ?? 'Création du devis impossible' };
  const order = new Map(nodes.map((n, i) => [n.id, i]));
  const items = positions
    .filter((p) => !p.excluded && p.quantity_selected != null)
    .filter((p) => opts.includeUnpriced || priceByPos.get(p.id)?.unit_price != null)
    .sort((a, b) => (order.get(a.node_id) ?? 0) - (order.get(b.node_id) ?? 0))
    .map((p) => {
      const n = nodes.find((x) => x.id === p.node_id)!;
      const ref = n.display_reference ?? n.position_path ?? n.raw_number;
      const text = (n.description || n.title || '').replace(/\s*\n\s*/g, ' ');
      return { description: ref ? `${n.is_reserved && !ref.startsWith('R') ? 'R ' : ''}${ref} — ${text}` : text, quantity: p.quantity_selected!, unit: unitLabelOf(p.unit), unit_price: priceByPos.get(p.id)?.unit_price ?? 0 };
    });
  const brut = items.reduce((s, it) => s + Math.round(it.quantity * it.unit_price * 100) / 100, 0);
  if (tender.discount_percent > 0) items.push({ description: `Rabais ${tender.discount_percent} %`, quantity: 1, unit: 'forfait', unit_price: -Math.round(brut * tender.discount_percent) / 100 });
  if (tender.escompte_percent > 0) {
    const after = brut * (1 - tender.discount_percent / 100);
    items.push({ description: `Escompte ${tender.escompte_percent} %`, quantity: 1, unit: 'forfait', unit_price: -Math.round(after * tender.escompte_percent) / 100 });
  }
  for (let i = 0; i < items.length; i += 500) {
    const { error: itErr } = await supabase.from('devis_items').insert(items.slice(i, i + 500).map((it, j) => ({ ...it, devis_id: devis.id, sort_order: i + j })));
    if (itErr) return { devisId: devis.id as string, error: itErr.message };
  }
  await supabase.from('tenders').update({ devis_id: devis.id, status: 'offered' }).eq('id', tenderId);
  return { devisId: devis.id as string, error: null };
}

function unitLabelOf(u: string | null): string {
  return ({ m2: 'm²', m3: 'm³', gl: 'forfait' } as Record<string, string>)[u ?? ''] ?? (u || 'pce');
}
