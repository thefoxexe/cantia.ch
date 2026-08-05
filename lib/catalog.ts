// Price-memory "catalog": no dedicated table — an org's own history of past
// devis_items IS the catalog. Reusing that table instead of introducing a
// parallel one means there's nothing to keep in sync and nothing new to
// migrate/deploy; every devis a team creates immediately enriches the
// matching pool for the next one, which is exactly the promise on the
// landing page's "Catalogue intelligent" card.
export interface CatalogEntry {
  description: string;
  unit: string;
  unitPrice: number;
  count: number;
  lastUsedAt: string;
}

export interface CatalogMatch extends CatalogEntry {
  score: number; // 0-1
}

// Strips accents, lowercases, drops punctuation — French trade vocabulary
// ("Fenêtre", "étanchéité") needs accent-folding or two spellings of the
// same word never match.
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
}

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

// Collapses raw devis_items rows into one entry per distinct description,
// keeping the most recently used price/unit for that description (prices
// drift over time — the latest one a team actually charged is more useful
// than an average) and a usage count for ranking ties.
export function buildCatalog(
  rows: { description: string; unit: string | null; unit_price: number; created_at: string }[],
): CatalogEntry[] {
  const byKey = new Map<string, CatalogEntry>();
  for (const row of rows) {
    const key = normalize(row.description);
    if (!key) continue;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, {
        description: row.description,
        unit: row.unit ?? 'pce',
        unitPrice: Number(row.unit_price) || 0,
        count: 1,
        lastUsedAt: row.created_at,
      });
      continue;
    }
    existing.count += 1;
    if (row.created_at > existing.lastUsedAt) {
      existing.description = row.description;
      existing.unit = row.unit ?? existing.unit;
      existing.unitPrice = Number(row.unit_price) || existing.unitPrice;
      existing.lastUsedAt = row.created_at;
    }
  }
  return Array.from(byKey.values());
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
