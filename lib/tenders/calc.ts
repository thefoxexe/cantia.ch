// Métré arithmetic. The same rules run in SQL (triggers in
// 20261006120000_tenders_foundation.sql) — this copy drives the live
// display and the import checks; the stored figures stay the reference.

import { round } from './numbers.ts';
import type { NodeType, QuantitySource } from './types.ts';

export interface QuantityInputs {
  quantity_original: number | null;
  quantity_measured: number | null;
  quantity_manual: number | null;
  quantity_selected_source: QuantitySource;
}

export function selectedQuantity(p: QuantityInputs): number | null {
  if (p.quantity_selected_source === 'measured') return p.quantity_measured;
  if (p.quantity_selected_source === 'manual') return p.quantity_manual;
  return p.quantity_original;
}

export function lineAmount(quantity: number | null, unitPrice: number | null, excluded = false): number | null {
  if (excluded || quantity == null || unitPrice == null) return null;
  return round(quantity * unitPrice, 2);
}

// Soumission vs métré: absolute and relative gap (null when either side is missing).
export function quantityGap(original: number | null, other: number | null): { delta: number; percent: number | null } | null {
  if (original == null || other == null) return null;
  const delta = round(other - original, 3);
  return { delta, percent: original === 0 ? null : round((delta / original) * 100, 2) };
}

export const DEFAULT_TOLERANCE = { absolute: 0.01, relative: 0.0005 };

export function nearlyEqual(a: number, b: number, tol = DEFAULT_TOLERANCE): boolean {
  const diff = Math.abs(a - b);
  return diff <= tol.absolute || diff <= Math.max(Math.abs(a), Math.abs(b)) * tol.relative;
}

// PG 650 + A-B 70 + C-D 100 = Total 820 ?
export function checkBreakdownSum(parts: (number | null)[], total: number | null, tol = DEFAULT_TOLERANCE):
  { ok: boolean; sum: number; total: number | null; difference: number | null } {
  const sum = round(parts.reduce<number>((s, q) => s + (q ?? 0), 0), 3);
  if (total == null) return { ok: true, sum, total: null, difference: null };
  return { ok: nearlyEqual(sum, total, tol), sum, total, difference: round(sum - total, 3) };
}

// quantity × unit price ≈ amount printed in the document?
export function checkLineAmount(quantity: number | null, unitPrice: number | null, amount: number | null, tol = DEFAULT_TOLERANCE): boolean | null {
  if (quantity == null || unitPrice == null || amount == null) return null;
  return nearlyEqual(round(quantity * unitPrice, 2), amount, tol);
}

// ---- Totals ------------------------------------------------------------------

export interface TotalsConditions {
  discount_percent: number;
  escompte_percent: number;
  vat_rate: number;
}

export interface TenderTotals {
  brut: number;
  discount: number;
  subtotal1: number;
  escompte: number;
  subtotal2: number;
  vat: number;
  net: number;
}

// Brut → Rabais → Sous-total 1 → Escompte → Sous-total 2 → TVA → Net, the
// order of the récapitulation page of a soumission.
export function tenderTotals(lineAmounts: (number | null)[], c: TotalsConditions): TenderTotals {
  const brut = round(lineAmounts.reduce<number>((s, a) => s + (a ?? 0), 0), 2);
  const discount = round((brut * (c.discount_percent || 0)) / 100, 2);
  const subtotal1 = round(brut - discount, 2);
  const escompte = round((subtotal1 * (c.escompte_percent || 0)) / 100, 2);
  const subtotal2 = round(subtotal1 - escompte, 2);
  const vat = round((subtotal2 * (c.vat_rate || 0)) / 100, 2);
  return { brut, discount, subtotal1, escompte, subtotal2, vat, net: round(subtotal2 + vat, 2) };
}

// ---- Tree roll-ups -------------------------------------------------------------

export interface RollupNode {
  id: string;
  parent_id: string | null;
  node_type: NodeType;
}

// Sum of the line amounts under every node (chapter / section subtotals).
// amounts: position amount keyed by node id.
export function subtotalsByNode(nodes: RollupNode[], amounts: Map<string, number | null>): Map<string, number> {
  const byParent = new Map<string | null, RollupNode[]>();
  for (const n of nodes) {
    const list = byParent.get(n.parent_id) ?? [];
    list.push(n);
    byParent.set(n.parent_id, list);
  }
  const out = new Map<string, number>();
  const visit = (n: RollupNode): number => {
    let total = amounts.get(n.id) ?? 0;
    for (const child of byParent.get(n.id) ?? []) total += visit(child);
    total = round(total, 2);
    out.set(n.id, total);
    return total;
  };
  for (const root of byParent.get(null) ?? []) visit(root);
  return out;
}

// Lines that carry a quantity and a price; everything else (titles, notes,
// reports, totals) is structure only.
export function isBillable(type: NodeType): boolean {
  return type === 'billable_position';
}

export const NON_BILLABLE_FINANCIAL: NodeType[] = ['carry_forward', 'subtotal', 'chapter_total', 'financial_adjustment'];
