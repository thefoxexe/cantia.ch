// LayoutAnalyzer: runs → lines, repeated page headers/footers, columns.
// Columns are learned from the document itself (never hard-coded x
// positions), so a soumission from another software with another layout
// goes through the same code.

import { parseSwissNumber } from '../numbers.ts';
import { normalizeUnit } from '../units.ts';
import type { ExtractedDocument, Line, PageInfo, TextItem } from './types.ts';

export function groupLines(items: TextItem[]): Line[] {
  const byPage = new Map<number, TextItem[]>();
  for (const it of items) {
    const list = byPage.get(it.page) ?? [];
    list.push(it);
    byPage.set(it.page, list);
  }
  const lines: Line[] = [];
  for (const [page, list] of [...byPage.entries()].sort((a, b) => a[0] - b[0])) {
    const sorted = [...list].sort((a, b) => a.y - b.y || a.x - b.x);
    let cur: TextItem[] = [];
    let curY = -Infinity;
    const flush = () => {
      if (!cur.length) return;
      cur.sort((a, b) => a.x - b.x);
      lines.push({ page, y: Math.min(...cur.map((c) => c.y)), h: Math.max(...cur.map((c) => c.h)), items: cur, text: cur.map((c) => c.str.trim()).join(' ') });
      cur = [];
    };
    for (const it of sorted) {
      // Same visual line when the tops are within ~1/3 of the font size.
      if (cur.length && Math.abs(it.y - curY) > Math.max(1.5, it.fontSize * 0.35)) flush();
      if (!cur.length) curY = it.y;
      cur.push(it);
    }
    flush();
  }
  return lines;
}

const signature = (text: string) => text.replace(/\d+/g, '#').replace(/\s+/g, ' ').trim().toLowerCase();

// Lines that sit in the same band on most pages (project name, date, page
// number, "Contrat : 1 CAN Construction : 241 …") are page furniture, not
// content. Returned separately so their content (chapter, date) can still
// be read.
export function splitFurniture(lines: Line[], pages: PageInfo[]): { body: Line[]; furniture: Line[] } {
  if (pages.length < 3) return { body: lines, furniture: [] };
  const band = (l: Line) => Math.round(l.y / 4);
  const counts = new Map<string, Set<number>>();
  for (const l of lines) {
    const page = pages[l.page - 1];
    if (!page) continue;
    const inMargin = l.y < page.height * 0.16 || l.y > page.height * 0.9;
    if (!inMargin) continue;
    const key = `${band(l)}|${signature(l.text).slice(0, 18)}`;
    const set = counts.get(key) ?? new Set<number>();
    set.add(l.page);
    counts.set(key, set);
  }
  const threshold = Math.max(3, Math.ceil(pages.length * 0.3));
  const repeated = new Set([...counts.entries()].filter(([, s]) => s.size >= threshold).map(([k]) => k));
  const body: Line[] = [];
  const furniture: Line[] = [];
  for (const l of lines) {
    const key = `${band(l)}|${signature(l.text).slice(0, 18)}`;
    (repeated.has(key) ? furniture : body).push(l);
  }
  return { body, furniture };
}

export interface Columns {
  // left edge of the numbering column(s) and of the running text
  articleX: number | null;
  subArticleX: number | null;
  textX: number | null;
  zoneX: number | null; // ":PG" codes
  unitX: number | null;
  // right edges of the quantity, unit-price and amount fields
  quantityRight: number | null;
  priceRight: number | null;
  amountRight: number | null;
}

function mode(values: number[], bucket = 2): number | null {
  if (!values.length) return null;
  const counts = new Map<number, number>();
  for (const v of values) {
    const k = Math.round(v / bucket) * bucket;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  let best: number | null = null;
  let n = 0;
  for (const [k, c] of counts) if (c > n || (c === n && best != null && k < best)) (best = k), (n = c);
  return best;
}

const ZONE = /^:[\p{L}\d][\p{L}\d\-/._ ]{0,15}$/u;
const DOTS = /^\.{4,}$/;
const ARTICLE = /^\d{3}(\.\d{3})?$/;
const SUBARTICLE = /^\.\d{3}\b/;

export function isZoneToken(s: string) {
  return ZONE.test(s.trim());
}
export function isDots(s: string) {
  return DOTS.test(s.trim());
}

export function detectColumns(lines: Line[]): Columns {
  const unitXs: number[] = [];
  const zoneXs: number[] = [];
  const qtyRights: number[] = [];
  const articleXs: number[] = [];
  const subXs: number[] = [];
  const textXs: number[] = [];
  const rightOfUnit: number[] = [];

  for (const l of lines) {
    const its = l.items;
    for (let i = 0; i < its.length; i++) {
      const s = its[i].str.trim();
      if (isZoneToken(s)) zoneXs.push(its[i].x);
      // "820 m2": a number immediately followed by a known unit.
      const next = its[i + 1];
      if (next && parseSwissNumber(s) != null && normalizeUnit(next.str).known && next.x - (its[i].x + its[i].w) < 40) {
        unitXs.push(next.x);
        qtyRights.push(its[i].x + its[i].w);
        for (const r of its.slice(i + 2)) rightOfUnit.push(r.x + r.w);
      }
    }
    const first = its[0];
    const head = first.str.trim().split(' ')[0];
    if (ARTICLE.test(head)) articleXs.push(first.x);
    else if (SUBARTICLE.test(first.str.trim())) subXs.push(first.x);
    if (its[1] && ARTICLE.test(first.str.trim())) textXs.push(its[1].x);
  }

  // The two right-most field edges after the unit: unit price, then amount.
  const rights = [...new Set(rightOfUnit.map((r) => Math.round(r / 6) * 6))].sort((a, b) => a - b);
  const clusters: number[][] = [];
  for (const r of rights) {
    const last = clusters.at(-1);
    if (last && r - last[last.length - 1] <= 12) last.push(r);
    else clusters.push([r]);
  }
  const weighted = clusters
    .map((cl) => ({ center: mode(rightOfUnit.filter((r) => r >= cl[0] - 6 && r <= cl[cl.length - 1] + 6), 3) ?? cl[0], n: rightOfUnit.filter((r) => r >= cl[0] - 6 && r <= cl[cl.length - 1] + 6).length }))
    .filter((c) => c.n >= 3)
    .sort((a, b) => a.center - b.center);
  return {
    articleX: mode(articleXs),
    subArticleX: mode(subXs),
    textX: mode(textXs),
    zoneX: mode(zoneXs),
    unitX: mode(unitXs),
    quantityRight: mode(qtyRights, 4),
    priceRight: weighted.length >= 2 ? weighted[weighted.length - 2].center : null,
    amountRight: weighted.length >= 1 ? weighted[weighted.length - 1].center : null,
  };
}

export function readDocument(doc: ExtractedDocument) {
  const lines = groupLines(doc.items);
  const { body, furniture } = splitFurniture(lines, doc.pages);
  return { lines, body, furniture, columns: detectColumns(body) };
}
