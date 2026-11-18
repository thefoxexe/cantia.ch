// Pure part of the post-calcul (lib/tenders/postcalc.ts): the soumission
// against its métré, position by position. No database access, so it can be
// tested on its own (scripts/postcalc.test.mjs).

import type { TenderBundle } from './api.ts';
import { lineAmount, selectedQuantity, tenderTotals } from './calc.ts';
import { round } from './numbers.ts';
import { childrenIndex } from './tree.ts';
import type { TenderNode } from './types.ts';

export interface CompareLine {
  key: string;
  ref: string;
  title: string;
  unit: string;
  // The soumission: quantity and unit price offered.
  soldQty: number | null;
  soldPrice: number | null;
  // Billable: quantity executed × unit price of the soumission (unit-price
  // contract), else nothing for work outside the soumission.
  billable: number | null;
  realQty: number | null;
  realCost: number | null;
  // Real cost: quantity executed × real unit cost.
  real: number | null;
  // billable - real.
  profit: number | null;
  // Only in the métré (work added) or only in the soumission (not executed).
  only: 'base' | 'real' | null;
  // Ids in the métré, to edit the line there (null when not in the métré).
  realPositionId: string | null;
  realNodeId: string | null;
  // The soumission's line, to bring it into the métré.
  basePositionId: string | null;
}

export interface CompareChapter {
  key: string;
  title: string;
  lines: CompareLine[];
  billable: number;
  real: number;
  profit: number;
  // The chapter's node in the métré, where an added position goes.
  realChapterId: string | null;
  realChapterDepth: number;
}

export interface Comparison {
  chapters: CompareChapter[];
  // Excluding VAT, after the soumission's rabais and escompte.
  offerNet: number;
  billableNet: number;
  real: number;
  profit: number;
  marginPercent: number | null;
  // Positions of the métré still without a real cost.
  missingCosts: number;
  pricesVisible: boolean;
}

interface Pos {
  key: string;
  positionId: string;
  chapter: TenderNode | null;
  node: TenderNode;
  unit: string;
  qty: number | null;
  price: number | null;
  amount: number | null;
}

const refOf = (n: TenderNode) => (n.display_reference || n.position_path || n.raw_number || '').trim();

// Billable positions in the order of the document, with their top chapter.
function positionsOf(b: TenderBundle): Pos[] {
  const byParent = childrenIndex(b.nodes);
  const posByNode = new Map(b.positions.map((p) => [p.node_id, p]));
  const priceByPos = new Map(b.prices.map((p) => [p.position_id, p]));
  const out: Pos[] = [];
  const seen = new Map<string, number>();
  const walk = (parent: string | null, chapter: TenderNode | null) => {
    for (const n of byParent.get(parent) ?? []) {
      const top = chapter ?? (n.node_type === 'billable_position' ? null : n);
      const p = posByNode.get(n.id);
      if (n.node_type === 'billable_position' && p) {
        const qty = selectedQuantity(p);
        const price = priceByPos.get(p.id)?.unit_price ?? null;
        // Same reference twice (rare): told apart by its rank.
        const base = `${refOf(n)}|${(n.title ?? '').trim().toLowerCase()}`;
        const rank = seen.get(base) ?? 0;
        seen.set(base, rank + 1);
        out.push({ key: `${base}#${rank}`, positionId: p.id, chapter: top, node: n, unit: p.unit ?? p.raw_unit ?? '', qty, price, amount: lineAmount(qty, price, p.excluded) });
      }
      walk(n.id, top);
    }
  };
  walk(null, null);
  return out;
}

export function compareTenders(base: TenderBundle, real: TenderBundle): Comparison {
  const sold = positionsOf(base);
  const done = positionsOf(real);
  const doneByKey = new Map(done.map((p) => [p.key, p]));
  const used = new Set<string>();
  const chapters = new Map<string, CompareChapter>();
  const chapterKey = (n: TenderNode | null) => (n ? `${refOf(n)}|${(n.title ?? '').trim()}` : '');
  // Chapters of the métré by the same key, so an added line lands there.
  const realChapters = new Map<string, TenderNode>();
  for (const n of real.nodes) if (!n.parent_id && n.node_type !== 'billable_position') realChapters.set(chapterKey(n), n);
  const chapterOf = (n: TenderNode | null) => {
    const key = chapterKey(n);
    let c = chapters.get(key);
    if (!c) {
      const rc = realChapters.get(key) ?? null;
      c = { key, title: n ? [refOf(n), n.title].filter(Boolean).join(' ') : '', lines: [], billable: 0, real: 0, profit: 0, realChapterId: rc?.id ?? null, realChapterDepth: rc?.depth ?? -1 };
      chapters.set(key, c);
    }
    return c;
  };
  let missingCosts = 0;
  const billableAmounts: (number | null)[] = [];
  const push = (s: Pos | null, r: Pos | null) => {
    const n = (s ?? r)!.node;
    const realQty = r ? r.qty : null;
    // Not in the métré: not executed, nothing billed.
    const billable = s && r ? lineAmount(realQty, s.price) : s ? 0 : null;
    const line: CompareLine = {
      key: (s ?? r)!.key,
      ref: refOf(n),
      title: n.title ?? n.description ?? '',
      unit: (s ?? r)!.unit,
      soldQty: s?.qty ?? null,
      soldPrice: s?.price ?? null,
      billable,
      realQty,
      realCost: r?.price ?? null,
      real: r?.amount ?? null,
      profit: null,
      only: s && r ? null : s ? 'base' : 'real',
      realPositionId: r?.positionId ?? null,
      realNodeId: r?.node.id ?? null,
      basePositionId: s?.positionId ?? null,
    };
    if (r && r.price == null && (r.qty ?? 0) !== 0) missingCosts++;
    else if (line.billable != null || line.real != null) line.profit = round((line.billable ?? 0) - (line.real ?? 0), 2);
    billableAmounts.push(line.billable);
    const c = chapterOf((s ?? r)!.chapter);
    c.lines.push(line);
    c.billable = round(c.billable + (line.billable ?? 0), 2);
    c.real = round(c.real + (line.real ?? 0), 2);
    c.profit = round(c.billable - c.real, 2);
  };
  for (const s of sold) {
    const r = doneByKey.get(s.key) ?? null;
    if (r) used.add(r.key);
    push(s, r);
  }
  for (const r of done) if (!used.has(r.key)) push(null, r);

  const offer = tenderTotals(sold.map((s) => s.amount), base.tender);
  const billable = tenderTotals(billableAmounts, base.tender);
  const realTotal = round(done.reduce((sum, r) => sum + (r.amount ?? 0), 0), 2);
  const profit = round(billable.subtotal2 - realTotal, 2);
  return {
    chapters: [...chapters.values()],
    offerNet: offer.subtotal2,
    billableNet: billable.subtotal2,
    real: realTotal,
    profit,
    marginPercent: billable.subtotal2 > 0 ? round((profit / billable.subtotal2) * 100, 1) : null,
    missingCosts,
    pricesVisible: base.pricesVisible && real.pricesVisible,
  };
}

