// From a measure on a plan to quantities in the métré.
//
// A measure (a wall drawn as a line, a slab drawn as a surface…) can feed
// several positions at once: the same 13 m wall gives the formwork in m²
// (length × height × 2 faces), the concrete in m³ (× thickness) and the
// rebar in kg (× kg/m³). Each link is an allocation with a fixed formula —
// no free expressions, so the server can recompute every figure
// (public.tender_alloc_quantity, same table as FORMULAS below).

import { round } from './numbers.ts';
import { normalizeUnit, unitDimension, type UnitDimension } from './units.ts';
import type { MeasureKind } from './geometry.ts';

export type ParamKey = 'height' | 'thickness' | 'width' | 'faces' | 'rate' | 'factor';
export type Base = 'L' | 'A' | 'P' | 'N';

export interface FormulaDef {
  key: string;
  base: Base;
  params: ParamKey[]; // multiplied with the base, in this order
  dim: 'length' | 'area' | 'volume' | 'mass' | 'count';
  kinds: MeasureKind[];
}

const LINEAR: MeasureKind[] = ['distance', 'polyline', 'perimeter'];

export const FORMULAS: FormulaDef[] = [
  { key: 'length', base: 'L', params: [], dim: 'length', kinds: LINEAR },
  { key: 'perimeter', base: 'P', params: [], dim: 'length', kinds: ['polygon'] },
  { key: 'area', base: 'A', params: [], dim: 'area', kinds: ['polygon'] },
  { key: 'count', base: 'N', params: [], dim: 'count', kinds: ['count'] },
  // walls, drawn as a line
  { key: 'wall_area', base: 'L', params: ['height'], dim: 'area', kinds: LINEAR },
  { key: 'wall_formwork', base: 'L', params: ['height', 'faces'], dim: 'area', kinds: LINEAR },
  { key: 'wall_volume', base: 'L', params: ['height', 'thickness'], dim: 'volume', kinds: LINEAR },
  { key: 'wall_rebar', base: 'L', params: ['height', 'thickness', 'rate'], dim: 'mass', kinds: LINEAR },
  // footings / strips, drawn as a line
  { key: 'strip_area', base: 'L', params: ['width'], dim: 'area', kinds: LINEAR },
  { key: 'strip_volume', base: 'L', params: ['width', 'height'], dim: 'volume', kinds: LINEAR },
  // slabs, drawn as a surface
  { key: 'slab_volume', base: 'A', params: ['thickness'], dim: 'volume', kinds: ['polygon'] },
  { key: 'slab_rebar', base: 'A', params: ['thickness', 'rate'], dim: 'mass', kinds: ['polygon'] },
  { key: 'edge_formwork', base: 'P', params: ['height'], dim: 'area', kinds: ['polygon', 'perimeter'] },
];

export const formulaDef = (key: string) => FORMULAS.find((f) => f.key === key) ?? null;

export const PARAM_DEFAULTS: Partial<Record<ParamKey, number>> = { faces: 2, factor: 1 };

export interface MeasureValues {
  kind: MeasureKind;
  length_m: number | null;
  area_m2: number | null;
  perimeter_m: number | null;
  count: number | null;
}

export type Params = Partial<Record<ParamKey, number | null>>;

export function baseValue(base: Base, m: MeasureValues): number | null {
  if (base === 'L') return m.length_m ?? m.perimeter_m;
  if (base === 'P') return m.perimeter_m ?? m.length_m;
  if (base === 'A') return m.area_m2;
  return m.count;
}

export interface AllocationResult {
  quantity: number | null;
  missing: ParamKey[];
  // "13.15 m × 2.60 m × 2 = 68.38" — what the user sees next to the quantity.
  steps: { label: string; value: number; unit: string }[];
}

const PARAM_UNIT: Record<ParamKey, string> = { height: 'm', thickness: 'm', width: 'm', faces: '', rate: 'kg/m³', factor: '×' };
const BASE_UNIT: Record<Base, string> = { L: 'm', P: 'm', A: 'm²', N: 'pce' };

export function computeAllocation(formula: string, m: MeasureValues, params: Params): AllocationResult {
  const f = formulaDef(formula);
  if (!f) return { quantity: null, missing: [], steps: [] };
  const base = baseValue(f.base, m);
  const missing: ParamKey[] = [];
  const steps: AllocationResult['steps'] = [];
  if (base != null) steps.push({ label: f.base, value: base, unit: BASE_UNIT[f.base] });
  let q = base;
  for (const p of f.params) {
    const v = params[p] ?? PARAM_DEFAULTS[p] ?? null;
    if (v == null || !(v > 0)) {
      missing.push(p);
      continue;
    }
    steps.push({ label: p, value: v, unit: PARAM_UNIT[p] });
    if (q != null) q *= v;
  }
  const factor = params.factor ?? 1;
  if (factor !== 1 && factor > 0) {
    steps.push({ label: 'factor', value: factor, unit: '×' });
    if (q != null) q *= factor;
  }
  return { quantity: missing.length || q == null ? null : round(q, 3), missing, steps };
}

// ---------------------------------------------------------------------------
// What the position needs, read from its unit and its text
// ---------------------------------------------------------------------------

// CAN "up" says what it counts: "up = pce", "up = m2"…
export function positionDimension(unit: string | null, text: string): UnitDimension | null {
  const d = unitDimension(unit);
  if (d !== 'price_unit') return d;
  const m = text.match(/up\s*=\s*([a-zA-Zé²³0-9]+)/i);
  if (!m) return null;
  return unitDimension(normalizeUnit(m[1]).unit);
}

const n = (s: string) => Number(s.replace(/'/g, '').replace(',', '.'));
const toM = (v: number, u: string) => (u === 'mm' ? v / 1000 : u === 'cm' ? v / 100 : v);

export interface FoundParam {
  key: ParamKey;
  value: number;
  quote: string; // the words it was read from, shown to the user
}

// Dimensions printed in the soumission ("Epaisseur mm 250", "ép. 20 cm",
// "Masse kg/m3 85"). Ranges ("mm 51 à 100") and bounds ("jusqu'à mm 50")
// are not a dimension of the work and are never used.
export function paramsFromText(text: string): FoundParam[] {
  const out: FoundParam[] = [];
  const t = text.replace(/\s+/g, ' ');
  // keyword, up to a few words ("de paillasse"), optional unit, the number
  // (never cut short: "51 à 100" must not read as 5), optional unit.
  const num = String.raw`(?:(mm|cm|m)\s*)?(\d+(?:[.,]\d+)?)(?![\d.,]*\d)(?![.,]?\d)\s*(mm|cm|m\b)?(?!\s*(?:à|-|a|x)\s*\d)`;
  const dims: [ParamKey, RegExp][] = [
    ['thickness', new RegExp(String.raw`(?:[ée]paisseur|[ée]p\.)[^\d.;]{0,25}?` + num, 'i')],
    ['height', new RegExp(String.raw`(?:hauteur|haut\.|\bh\s*=)[^\d.;]{0,25}?` + num, 'i')],
    ['width', new RegExp(String.raw`(?:largeur|larg\.)[^\d.;]{0,25}?` + num, 'i')],
  ];
  for (const [key, re] of dims) {
    const m = t.match(re);
    if (!m) continue;
    const before = t.slice(Math.max(0, (m.index ?? 0) - 12), m.index ?? 0);
    if (/jusqu|max|min|dès|des\s*$/i.test(before + m[0].slice(0, 14)) || /jusqu/i.test(m[0])) continue;
    const unit = (m[1] || m[3] || '').toLowerCase();
    let v = n(m[2]);
    if (!unit) v = v > 20 ? v / 1000 : v; // "Epaisseur 250" → mm
    else v = toM(v, unit);
    if (v > 0 && v < 30) out.push({ key, value: round(v, 3), quote: m[0].trim() });
  }
  const rate = t.match(/(?:masse|armature|acier)[^.]{0,20}?kg\s*\/\s*m\s*[3³]\s*(\d+(?:[.,]\d+)?)/i) ?? t.match(/(\d+(?:[.,]\d+)?)\s*kg\s*\/\s*m\s*[3³]/i);
  if (rate) {
    const v = n(rate[1]);
    if (v > 5 && v < 400) out.push({ key: 'rate', value: v, quote: rate[0].trim() });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Suggestions: which positions a measure can feed, and with which formula
// ---------------------------------------------------------------------------

export type Element = 'wall' | 'slab' | 'footing' | 'surface' | 'line' | 'items';

export const ELEMENTS: Element[] = ['wall', 'slab', 'footing', 'surface', 'line', 'items'];

export function defaultElement(kind: MeasureKind): Element {
  if (kind === 'polygon') return 'slab';
  if (kind === 'count') return 'items';
  if (kind === 'perimeter') return 'line';
  return 'wall';
}

// Elements that make sense for a measure kind (a surface is never a wall).
export function elementsFor(kind: MeasureKind): Element[] {
  if (kind === 'polygon') return ['slab', 'surface'];
  if (kind === 'count') return ['items'];
  return ['wall', 'footing', 'line'];
}

const KEYWORDS: Record<Element, RegExp> = {
  wall: /\b(murs?|parois?|voiles?|ma[cç]onnerie|briques?|plots?|cloisons?|crépi|enduits?|isolation|façades?|élévation|elevation)\b/i,
  slab: /\b(dalles?|radiers?|planchers?|chapes?|sols?|toitures?|couvertures?|horizonta)/i,
  footing: /\b(semelles?|fondations?|longrines?|bandes?|socles?)\b/i,
  surface: /\b(surfaces?|sols?|chapes?|revêtements?|carrelages?|peintures?|nettoyage|crépi|enduits?|isolation|étanchéité|etancheite)\b/i,
  line: /\b(bordures?|joints?|plinthes?|tuyaux?|conduites?|canalisations?|drains?|garde-corps|rives?|arêtes?|chanfreins?)\b/i,
  items: /\b(pi[eè]ces?|pce|up\s*=\s*pce|éléments?|regards?|fourreaux|réservations?|percements?|carottages?|goujons?|ancrages?)\b/i,
};

export interface PositionLite {
  id: string;
  ref: string | null;
  title: string;
  text: string; // the position's own complete text
  // Titles of its parents: in a CAN soumission "Fourniture et mise en place"
  // only means something under "Béton pour parois/murs".
  context: string;
  unit: string | null;
  excluded?: boolean;
}

export interface Suggestion {
  position: PositionLite;
  formula: string;
  params: Params; // read from the position text (thickness, rate…)
  found: FoundParam[];
  score: number;
}

export function chooseFormula(kind: MeasureKind, dim: UnitDimension | null, text: string, element: Element): string | null {
  const t = text.toLowerCase();
  const linear = LINEAR.includes(kind);
  if (dim === 'count') return kind === 'count' ? 'count' : null;
  if (kind === 'count') return null;
  if (dim === 'length') return linear ? 'length' : 'perimeter';
  if (dim === 'area') {
    if (!linear) return /coffrage/.test(t) && /(rive|bord|about|socle|tête|tete)/.test(t) ? 'edge_formwork' : 'area';
    if (element === 'footing' && !/coffrage/.test(t)) return 'strip_area';
    if (/coffrage/.test(t)) return /(rive|bord|about|1 face|une face)/.test(t) ? 'wall_area' : 'wall_formwork';
    return 'wall_area';
  }
  if (dim === 'volume') {
    if (!linear) return 'slab_volume';
    return element === 'footing' || /(semelle|fondation|longrine)/.test(t) ? 'strip_volume' : 'wall_volume';
  }
  if (dim === 'mass') {
    if (!/(armature|acier|barres?|treillis|b500)/.test(t)) return null;
    return linear ? 'wall_rebar' : 'slab_rebar';
  }
  return null;
}

export function suggestPositions(kind: MeasureKind, element: Element, positions: PositionLite[], limit = 8): Suggestion[] {
  const out: Suggestion[] = [];
  for (const p of positions) {
    if (p.excluded) continue;
    const full = `${p.context} ${p.text}`;
    const dim = positionDimension(p.unit, p.text);
    const formula = chooseFormula(kind, dim, full, element);
    if (!formula) continue;
    const found = paramsFromText(p.text);
    const params: Params = {};
    for (const f of found) if (formulaDef(formula)!.params.includes(f.key)) params[f.key] = f.value;
    let score = 1;
    if (KEYWORDS[element].test(p.text)) score += 3;
    else if (KEYWORDS[element].test(p.context)) score += 2;
    for (const other of ELEMENTS) if (other !== element && KEYWORDS[other].test(full) && !KEYWORDS[element].test(full)) score -= 1;
    if (/b[ée]ton|coffrage|armature/i.test(full) && (element === 'wall' || element === 'slab' || element === 'footing')) score += 1;
    if (Object.keys(params).length) score += 0.5;
    // The work that is the element itself (formwork, concrete, masonry of the
    // wall) before what merely runs along it (joints, strips).
    const own: Record<Element, RegExp> = { wall: /^wall_/, slab: /^(slab_|area$)/, footing: /^strip_/, surface: /^area$/, line: /^(length|perimeter)$/, items: /^count$/ };
    if (own[element].test(formula)) score += 1.5;
    out.push({ position: p, formula, params, found, score });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit);
}

// The unit the user thinks in: CAN "up = ml" is a length in metres.
export function displayUnit(unit: string | null, text: string): string | null {
  if (unit !== 'up') return unit;
  const m = text.match(/up\s*=\s*([a-zA-Zé²³0-9]+)/i);
  const u = m ? normalizeUnit(m[1]) : null;
  return u?.known ? u.unit : unit;
}

// Text search over every position, for "Chercher une autre position".
export function searchPositions(q: string, positions: PositionLite[], limit = 20): PositionLite[] {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return positions.filter((p) => words.every((w) => `${p.ref ?? ''} ${p.context} ${p.text}`.toLowerCase().includes(w))).slice(0, limit);
}

// ---------------------------------------------------------------------------
// Starting from a position: how can it be measured on a plan?
// ---------------------------------------------------------------------------

export interface MeasureMode {
  kind: MeasureKind; // the tool to draw with
  element: Element;
  formula: string;
}

const TRIES: [MeasureKind, Element][] = [
  ['polyline', 'wall'],
  ['polygon', 'slab'],
  ['polygon', 'surface'],
  ['polyline', 'footing'],
  ['polyline', 'line'],
  ['perimeter', 'line'],
  ['count', 'items'],
];

// Ways to measure this position, best first: a wall formwork in m² is drawn
// as the wall's line (× height × faces) before a surface; a slab in m³ as a
// surface (× thickness)…
export function measureModes(p: PositionLite): MeasureMode[] {
  const full = `${p.context} ${p.text}`;
  const dim = positionDimension(p.unit, p.text);
  const best = new Map<string, MeasureMode & { score: number }>();
  for (const [kind, element] of TRIES) {
    const formula = chooseFormula(kind, dim, full, element);
    if (!formula) continue;
    let score = KEYWORDS[element].test(p.text) ? 3 : KEYWORDS[element].test(p.context) ? 2 : 0;
    if (formula === 'area' || formula === 'length' || formula === 'count') score += 0.5; // no extra figure to type
    if (kind === 'perimeter') score -= 0.25; // a closed outline is the rarer case
    const key = `${kind}:${formula}`;
    if ((best.get(key)?.score ?? -Infinity) < score) best.set(key, { kind, element, formula, score });
  }
  const out = [...best.values()];
  return out.sort((a, b) => b.score - a.score).map(({ score: _s, ...m }) => m);
}
