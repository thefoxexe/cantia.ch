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
import { duplicateTender, loadTender, type TenderBundle } from './api';
import type { Tender } from './types';

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
