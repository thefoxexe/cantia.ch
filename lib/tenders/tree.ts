// Tree helpers for the métré table: ordering, collapse state, search.

import type { NodeType } from './types.ts';

export interface TreeNodeLike {
  id: string;
  parent_id: string | null;
  sort_order: number;
  node_type: NodeType;
}

export interface FlatRow<N extends TreeNodeLike> {
  node: N;
  level: number;
  hasChildren: boolean;
}

export function childrenIndex<N extends TreeNodeLike>(nodes: N[]): Map<string | null, N[]> {
  const ids = new Set(nodes.map((n) => n.id));
  const byParent = new Map<string | null, N[]>();
  for (const n of nodes) {
    // An orphan (parent filtered out or missing) is shown at the root rather than lost.
    const key = n.parent_id && ids.has(n.parent_id) ? n.parent_id : null;
    const list = byParent.get(key) ?? [];
    list.push(n);
    byParent.set(key, list);
  }
  for (const list of byParent.values()) list.sort((a, b) => a.sort_order - b.sort_order);
  return byParent;
}

// Depth-first rows, skipping the children of collapsed nodes.
export function flattenTree<N extends TreeNodeLike>(nodes: N[], collapsed: Set<string>, keep?: Set<string>): FlatRow<N>[] {
  const byParent = childrenIndex(keep ? nodes.filter((n) => keep.has(n.id)) : nodes);
  const out: FlatRow<N>[] = [];
  const walk = (parent: string | null, level: number) => {
    for (const n of byParent.get(parent) ?? []) {
      const kids = byParent.get(n.id) ?? [];
      out.push({ node: n, level, hasChildren: kids.length > 0 });
      if (kids.length && !collapsed.has(n.id)) walk(n.id, level + 1);
    }
  };
  walk(null, 0);
  return out;
}

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// "241 121.111", "béton", "R 411" — every word must match the reference or
// the text. Ancestors of a match are kept so it stays in context.
export function searchTree<N extends TreeNodeLike>(nodes: N[], query: string, text: (n: N) => string): Set<string> | null {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const keep = new Set<string>();
  for (const n of nodes) {
    const hay = normalize(text(n));
    if (words.every((w) => hay.includes(w))) {
      let cur: N | undefined = n;
      while (cur && !keep.has(cur.id)) {
        keep.add(cur.id);
        cur = cur.parent_id ? byId.get(cur.parent_id) : undefined;
      }
    }
  }
  return keep;
}

// sort_order for a node inserted after `after` (or at the end) among siblings.
export function sortOrderAfter(siblings: { sort_order: number }[], after?: { sort_order: number } | null): number {
  const sorted = [...siblings].sort((a, b) => a.sort_order - b.sort_order);
  if (!after) return (sorted.at(-1)?.sort_order ?? 0) + 1000;
  const next = sorted.find((s) => s.sort_order > after.sort_order);
  return next ? Math.floor((after.sort_order + next.sort_order) / 2) : after.sort_order + 1000;
}
