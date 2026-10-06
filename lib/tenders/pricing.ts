// Price suggestions for a position. Only the organisation's own figures:
// prices it already used in other métrés (history) and its catalogue. No
// market price is ever invented; every suggestion says where it comes from.

import { round } from './numbers.ts';
import type { PriceSource } from './types.ts';

export interface HistoryPrice {
  description: string;
  unit: string | null;
  unitPrice: number;
  tenderName: string;
  at: string; // ISO date
}

export interface CatalogPrice {
  description: string;
  unit: string | null;
  unitPrice: number;
}

export interface PriceSuggestion {
  source: PriceSource;
  unitPrice: number;
  label: string; // "Dernier prix", "Moyenne (3)", "Catalogue"
  detail: string; // where it comes from
}

export const normalizeText = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9.,]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokens = (s: string) => new Set(normalizeText(s).split(' ').filter((w) => w.length > 1));

export function textSimilarity(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  if (!ta.size || !tb.size) return 0;
  let shared = 0;
  for (const t of ta) if (tb.has(t)) shared += 1;
  return (2 * shared) / (ta.size + tb.size);
}

// Short catalogue names ("Coffrage parois") are judged on how much of them
// the position text contains.
export function containment(short: string, long: string): number {
  const ts = tokens(short);
  const tl = tokens(long);
  if (ts.size < 2 || !tl.size) return 0;
  let shared = 0;
  for (const t of ts) if (tl.has(t)) shared += 1;
  return shared / ts.size;
}

const sameUnit = (a: string | null, b: string | null) => !a || !b || normalizeText(a).replace(/[²2]/, '2').replace(/[³3]/, '3') === normalizeText(b).replace(/[²2]/, '2').replace(/[³3]/, '3');

export function median(values: number[]): number | null {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : round((s[m - 1] + s[m]) / 2, 2);
}

export interface SuggestionInput {
  text: string;
  unit: string | null;
  documentUnitPrice?: number | null;
}

// Same work in another métré = same unit and (almost) the same wording.
export function suggestPrices(input: SuggestionInput, history: HistoryPrice[], catalog: CatalogPrice[], opts = { threshold: 0.72 }): PriceSuggestion[] {
  const out: PriceSuggestion[] = [];
  if (input.documentUnitPrice != null) out.push({ source: 'document', unitPrice: input.documentUnitPrice, label: 'Document', detail: 'Prix imprimé dans la soumission' });

  const matches = history
    .filter((h) => sameUnit(h.unit, input.unit) && h.unitPrice > 0)
    .map((h) => ({ h, score: normalizeText(h.description) === normalizeText(input.text) ? 1 : textSimilarity(h.description, input.text) }))
    .filter((m) => m.score >= opts.threshold)
    .sort((a, b) => (a.h.at < b.h.at ? 1 : -1));
  if (matches.length) {
    const last = matches[0].h;
    out.push({ source: 'last_used', unitPrice: last.unitPrice, label: 'Dernier prix', detail: last.tenderName });
    if (matches.length > 1) {
      const values = matches.map((m) => m.h.unitPrice);
      const avg = round(values.reduce((s, v) => s + v, 0) / values.length, 2);
      out.push({ source: 'history_average', unitPrice: avg, label: `Moyenne (${values.length})`, detail: `Médiane ${median(values)}` });
    }
  }

  const cat = catalog
    .filter((c) => sameUnit(c.unit, input.unit) && c.unitPrice > 0)
    .map((c) => ({ c, score: Math.max(textSimilarity(c.description, input.text), containment(c.description, input.text) * 0.95) }))
    .filter((m) => m.score >= opts.threshold)
    .sort((a, b) => b.score - a.score)[0];
  if (cat) out.push({ source: 'catalog', unitPrice: cat.c.unitPrice, label: 'Catalogue', detail: cat.c.description });
  return out;
}
