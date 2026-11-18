// Post-calcul (module Métrés): a métré made from the soumission of a
// chantier. The soumission keeps what was sold; the métré takes the
// quantities really executed and the real unit costs. Comparing the two,
// position by position, gives the profit of the chantier.
//
// On a unit-price contract the company bills the quantities executed at
// the unit prices of the soumission: that is the revenue compared with the
// real cost.
//
// The link is kept in the métré's metadata ({ role: 'postcalc',
// base_tender_id }), so no table changes: the métré is an ordinary tender
// (kind « interne ») made with duplicate_tender, its prices cleared so the
// real costs are entered, not copied from the sale.

import { supabase } from '../supabase';
import { addNode, duplicateTender, loadTender, setUnitPrice, updatePosition, type TenderBundle } from './api';
import type { PositionPrice, Tender, TenderNode, TenderPosition } from './types';

export const POSTCALC_ROLE = 'postcalc';

export function isPostcalc(t: Pick<Tender, 'metadata'> | null | undefined): boolean {
  return (t?.metadata as Record<string, unknown> | undefined)?.role === POSTCALC_ROLE;
}

export function baseTenderId(t: Pick<Tender, 'metadata'> | null | undefined): string | null {
  const id = (t?.metadata as Record<string, unknown> | undefined)?.base_tender_id;
  return typeof id === 'string' ? id : null;
}

// The métré of a soumission: same positions and quantities, no price yet.
export async function createPostcalc(base: Pick<Tender, 'id' | 'name' | 'metadata'>, name: string): Promise<{ id: string | null; error: string | null }> {
  const { id, error } = await duplicateTender(base.id, name);
  if (!id) return { id: null, error: error ?? 'Copie impossible' };
  const metadata = { ...((base.metadata as Record<string, unknown>) ?? {}), role: POSTCALC_ROLE, base_tender_id: base.id };
  const { error: e1 } = await supabase.from('tenders').update({ kind: 'interne', status: 'in_progress', metadata }).eq('id', id);
  if (e1) return { id, error: e1.message };
  // Real costs are entered by the company: the sale prices are not copied.
  await supabase.from('tender_position_prices').delete().eq('tender_id', id);
  return { id, error: null };
}

export { compareTenders, type CompareChapter, type CompareLine, type Comparison } from './postcalcCompare';
import { compareTenders, type Comparison } from './postcalcCompare';

export async function loadComparison(metreId: string): Promise<{ metre: TenderBundle | null; base: TenderBundle | null; comparison: Comparison | null; error: string | null }> {
  const { bundle: metre, error } = await loadTender(metreId);
  if (!metre) return { metre: null, base: null, comparison: null, error: error ?? 'Métré introuvable' };
  const baseId = baseTenderId(metre.tender);
  if (!baseId) return { metre, base: null, comparison: null, error: null };
  const { bundle: base, error: e2 } = await loadTender(baseId);
  if (!base) return { metre, base: null, comparison: null, error: e2 ?? 'La soumission de base n’existe plus' };
  return { metre, base, comparison: compareTenders(base, metre), error: null };
}

// ---- Editing the métré from the comparison --------------------------------
// Each helper writes to the database and returns the métré bundle with the
// change applied, so the comparison is recomputed without reloading.

function withPosition(b: TenderBundle, position: TenderPosition): TenderBundle {
  const exists = b.positions.some((p) => p.id === position.id);
  return { ...b, positions: exists ? b.positions.map((p) => (p.id === position.id ? position : p)) : [...b.positions, position] };
}

function withPrice(b: TenderBundle, price: PositionPrice): TenderBundle {
  const exists = b.prices.some((p) => p.position_id === price.position_id);
  return { ...b, prices: exists ? b.prices.map((p) => (p.position_id === price.position_id ? price : p)) : [...b.prices, price] };
}

// The quantity really executed (entered by hand).
export async function setRealQuantity(metre: TenderBundle, positionId: string, quantity: number | null): Promise<{ metre: TenderBundle; error: string | null }> {
  const { position, error } = await updatePosition(positionId, { quantity_manual: quantity, quantity_selected_source: 'manual' });
  if (!position) return { metre, error: error ?? 'Erreur' };
  return { metre: withPosition(metre, position), error: null };
}

// The real cost per unit (stored as the métré's unit price).
export async function setRealCost(metre: TenderBundle, positionId: string, cost: number | null): Promise<{ metre: TenderBundle; error: string | null }> {
  const { price, error } = await setUnitPrice(metre.tender.id, positionId, cost);
  if (!price) return { metre, error: error ?? 'Erreur' };
  return { metre: withPrice(metre, price), error: null };
}

export interface NewLine {
  reference: string;
  title: string;
  unit: string;
  quantity: number | null;
  cost: number | null;
}

// A position added to the métré (work not in the soumission), in a chapter
// of the métré or at its root.
export async function addRealPosition(metre: TenderBundle, chapterId: string | null, line: NewLine): Promise<{ metre: TenderBundle; error: string | null }> {
  const parent = chapterId ? metre.nodes.find((n) => n.id === chapterId) ?? null : null;
  const siblings = metre.nodes.filter((n) => n.parent_id === (parent?.id ?? null));
  const sortOrder = siblings.reduce((m, n) => Math.max(m, n.sort_order), 0) + 1000;
  const { node, position, error } = await addNode(metre.tender.id, {
    parentId: parent?.id ?? null,
    nodeType: 'billable_position',
    depth: parent ? parent.depth + 1 : 0,
    sortOrder,
    title: line.title.trim(),
    reference: line.reference.trim() || null,
    unit: line.unit.trim() || null,
  });
  if (!node || !position) return { metre, error: error ?? 'Erreur' };
  let next: TenderBundle = withPosition({ ...metre, nodes: [...metre.nodes, node as TenderNode] }, position);
  const q = await setRealQuantity(next, position.id, line.quantity);
  next = q.metre;
  if (line.cost != null) {
    const c = await setRealCost(next, position.id, line.cost);
    next = c.metre;
    if (c.error) return { metre: next, error: c.error };
  }
  return { metre: next, error: q.error };
}

// Brings a soumission position that is missing from the métré back into it,
// with the soumission's quantity and no cost yet.
export async function bringFromBase(metre: TenderBundle, base: TenderBundle, basePositionId: string, chapterId: string | null): Promise<{ metre: TenderBundle; error: string | null }> {
  const pos = base.positions.find((p) => p.id === basePositionId);
  const node = pos ? base.nodes.find((n) => n.id === pos.node_id) : null;
  if (!pos || !node) return { metre, error: 'Position introuvable' };
  return addRealPosition(metre, chapterId, {
    reference: node.display_reference ?? node.position_path ?? node.raw_number ?? '',
    title: node.title ?? node.description ?? '',
    unit: pos.unit ?? pos.raw_unit ?? '',
    quantity: pos.quantity_selected ?? pos.quantity_manual ?? pos.quantity_original,
    cost: null,
  });
}
