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

export async function createCatalogItem(
  organizationId: string,
  description: string,
  unit: string,
  unitPrice: number,
): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc('create_catalog_item', {
    p_organization_id: organizationId,
    p_description: description,
    p_unit: unit,
    p_unit_price: unitPrice,
  });
  return { id: data ?? null, error: error?.message ?? null };
}

export async function updateCatalogItem(
  catalogItemId: string,
  description: string,
  unit: string,
  unitPrice: number,
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('update_catalog_item', {
    p_catalog_item_id: catalogItemId,
    p_description: description,
    p_unit: unit,
    p_unit_price: unitPrice,
  });
  return { error: error?.message ?? null };
}

// Admins-only per the "admins can delete catalog items" RLS policy — a
// plain delete (not an RPC) since that policy already covers it.
export async function deleteCatalogItem(catalogItemId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('catalog_items').delete().eq('id', catalogItemId);
  return { error: error?.message ?? null };
}

export async function importCatalogItems(
  organizationId: string,
  items: { description: string; unit: string; unitPrice: number }[],
): Promise<{ count: number; error: string | null }> {
  const { data, error } = await supabase.rpc('import_catalog_items', {
    p_organization_id: organizationId,
    p_items: items.map((it) => ({ description: it.description, unit: it.unit, unit_price: it.unitPrice })),
  });
  return { count: data ?? 0, error: error?.message ?? null };
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

export interface ParsedCsvItem {
  description: string;
  unit: string;
  unitPrice: number;
}

export interface ParsedCsv {
  items: ParsedCsvItem[];
  skipped: number;
  error: string | null;
}

// Splits one CSV line into fields, respecting double-quoted fields (with ""
// as an escaped quote) — good enough for flat price-list exports (Excel,
// Chiffr, Bexio, ...), not a full RFC4180 implementation.
function parseCsvLine(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields.map((f) => f.trim());
}

// Swiss price cells show up as "60.00", "60,00", "CHF 1'200.50", "1 200,50"
// — strips currency/thousand markers, then treats whichever of ',' or '.'
// appears last as the decimal separator.
function parsePrice(raw: string): number {
  let s = raw.replace(/chf/gi, '').replace(/['’\s]/g, '').trim();
  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');
  if (lastComma > lastDot) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else {
    s = s.replace(/,/g, '');
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

function normalizeHeader(h: string): string {
  return normalizeDescription(h).replace(/\s+/g, '');
}

const TITLE_HEADERS = ['titre', 'designation', 'nom', 'article', 'prestation', 'libelle', 'intitule', 'description', 'poste'];
const DETAIL_HEADERS = ['description', 'detail', 'details', 'descriptif', 'remarque', 'commentaire'];
const UNIT_HEADERS = ['unite', 'unit', 'u', 'um'];
const PRICE_HEADERS = ['prix', 'prixunitaire', 'prixunit', 'tarif', 'pu', 'montantunitaire', 'price', 'prixht', 'prixttc'];

// "Smart" import: guesses which columns are the title/description, unit and
// price from the header row's wording — French-first vocabulary, but plain
// English headers ("description", "unit", "price") work too. If a sheet has
// both a "titre" and a separate "description" column, the two are combined
// ("Titre — description") rather than picking just one.
export function parseCatalogCsv(text: string): ParsedCsv {
  const lines = text.split(/\r\n|\r|\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return { items: [], skipped: 0, error: 'Le fichier est vide ou ne contient aucune ligne de données.' };
  }

  const commaCount = (lines[0].match(/,/g) || []).length;
  const semicolonCount = (lines[0].match(/;/g) || []).length;
  const delimiter = semicolonCount > commaCount ? ';' : ',';

  const headerCells = parseCsvLine(lines[0], delimiter).map(normalizeHeader);

  let titleIdx = headerCells.findIndex((h) => TITLE_HEADERS.includes(h));
  let detailIdx = headerCells.findIndex((h, i) => i !== titleIdx && DETAIL_HEADERS.includes(h));
  if (titleIdx === -1) {
    titleIdx = detailIdx;
    detailIdx = -1;
  }
  if (titleIdx === -1) {
    return { items: [], skipped: 0, error: "Impossible de détecter une colonne de titre ou de description dans ce fichier." };
  }
  const unitIdx = headerCells.findIndex((h) => UNIT_HEADERS.includes(h));
  const priceIdx = headerCells.findIndex((h) => PRICE_HEADERS.includes(h));

  const items: ParsedCsvItem[] = [];
  let skipped = 0;
  for (const line of lines.slice(1)) {
    const cells = parseCsvLine(line, delimiter);
    const title = (cells[titleIdx] ?? '').trim();
    const detail = detailIdx >= 0 ? (cells[detailIdx] ?? '').trim() : '';
    const description = detail && detail !== title ? `${title} — ${detail}` : title;
    if (!description) {
      skipped += 1;
      continue;
    }
    const unit = unitIdx >= 0 ? (cells[unitIdx] ?? '').trim() || 'pce' : 'pce';
    const unitPrice = priceIdx >= 0 ? parsePrice(cells[priceIdx] ?? '0') : 0;
    items.push({ description, unit, unitPrice });
  }

  return { items, skipped, error: null };
}

// Semicolon-delimited — the separator fr-CH Excel expects for a CSV to
// split into columns on open, without the user having to import it manually.
export function buildCatalogCsv(entries: CatalogEntry[]): string {
  const escape = (value: string) => (/[;"\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);
  const rows = [
    ['Description', 'Unité', 'Prix unitaire'].join(';'),
    ...entries.map((e) => [escape(e.description), escape(e.unit), e.unitPrice.toFixed(2)].join(';')),
  ];
  return rows.join('\n');
}
