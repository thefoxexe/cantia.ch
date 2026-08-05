// Price-memory "catalog": backed by the catalog_items table (see migration
// catalog_items_table) rather than derived from devis_items history on every
// screen load. devis_items rows still feed it — a Postgres trigger auto-adds
// a catalog_items row the first time an org uses a given description — but
// the catalog itself is now a real, independently-editable record: an
// existing entry's price only ever changes through updateCatalogItemPrice
// (an explicit user choice), never by silently averaging/overwriting from
// whatever was typed most recently.
import { supabase } from './supabase';

export interface CatalogEntry {
  id?: string; // catalog_items.id — present once loaded from the DB, needed to persist a price update
  description: string;
  unit: string;
  unitPrice: number;
  count: number;
  lastUsedAt: string;
}

export interface CatalogMatch extends CatalogEntry {
  score: number; // 0-1
}

export async function fetchCatalog(organizationId: string): Promise<CatalogEntry[]> {
  const { data } = await supabase
    .from('catalog_items')
    .select('id, description, unit, unit_price, use_count, last_used_at')
    .eq('organization_id', organizationId)
    .order('last_used_at', { ascending: false })
    .limit(2000);
  return (data ?? []).map((row) => ({
    id: row.id,
    description: row.description,
    unit: row.unit,
    unitPrice: Number(row.unit_price) || 0,
    count: row.use_count,
    lastUsedAt: row.last_used_at,
  }));
}

// Persists an explicit "update the catalogue price" choice (the price-
// mismatch confirmation in devis/new.tsx) — the only client-triggered write
// to catalog_items; auto-adding new entries is handled entirely server-side
// by the devis_items insert trigger.
export async function updateCatalogItemPrice(catalogItemId: string, unitPrice: number, unit?: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('update_catalog_item_price', {
    p_catalog_item_id: catalogItemId,
    p_unit_price: unitPrice,
    p_unit: unit ?? null,
  });
  return { error: error?.message ?? null };
}

// Strips accents, lowercases, drops punctuation — French trade vocabulary
// ("Fenêtre", "étanchéité") needs accent-folding or two spellings of the
// same word never match. Exported so callers can do an exact-key lookup
// (e.g. "does this line already exist in the catalog verbatim?") without
// reimplementing the same normalization.
export function normalizeDescription(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
}
const normalize = normalizeDescription;

function tokens(text: string): Set<string> {
  return new Set(normalize(text).split(/\s+/).filter((w) => w.length > 1));
}

// Sørensen-Dice coefficient over word tokens — cheap, dependency-free, and a
// good fit for short trade-description phrases ("Fenêtre PVC double
// vitrage" vs "Fenêtre PVC triple vitrage" should read as close but not
// identical). No embeddings/AI call needed for this to feel "smart".
export function similarity(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let shared = 0;
  for (const t of ta) if (tb.has(t)) shared += 1;
  return (2 * shared) / (ta.size + tb.size);
}

// Keyword → unit heuristic, ordered from most to least specific so the
// first match wins (e.g. "tuyau" before a generic fallback) — not a
// exhaustive trade dictionary, just enough common Swiss construction
// vocabulary that typing "PVC" or "fenêtre" auto-fills a sensible unit
// instead of always defaulting to "pce".
const UNIT_KEYWORDS: { unit: string; words: string[] }[] = [
  { unit: 'ml', words: ['pvc', 'tuyau', 'tube', 'cable', 'canalisation', 'gouttiere', 'corniche', 'plinthe', 'chenau', 'rail', 'conduite', 'cornier'] },
  { unit: 'm²', words: ['peinture', 'carrelage', 'facade', 'isolation', 'crepi', 'revetement', 'plafond', 'surface', 'dalle', 'chape', 'parquet', 'faience', 'etancheite'] },
  { unit: 'm³', words: ['beton', 'terrassement', 'excavation', 'remblai', 'gravier', 'volume', 'decombres'] },
  { unit: 'h', words: ['main d oeuvre', 'heure', 'depannage', 'intervention', 'forfait horaire', 'deplacement'] },
  { unit: 'kg', words: ['acier', 'ferraillage', 'armature'] },
];

export function guessUnit(description: string): string | null {
  const norm = normalize(description);
  if (norm.length < 3) return null;
  for (const { unit, words } of UNIT_KEYWORDS) {
    if (words.some((w) => norm.includes(w))) return unit;
  }
  return null;
}

const MATCH_THRESHOLD = 0.4;

export function findMatches(catalog: CatalogEntry[], query: string, limit = 3): CatalogMatch[] {
  if (!query.trim() || query.trim().length < 3) return [];
  return catalog
    .map((entry) => ({ ...entry, score: similarity(query, entry.description) }))
    .filter((m) => m.score >= MATCH_THRESHOLD)
    .sort((a, b) => b.score - a.score || b.count - a.count)
    .slice(0, limit);
}
