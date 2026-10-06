// Units: the document's own spelling is always kept (raw_unit, needed to
// re-export); this only maps it onto a small normalized set for sums,
// formulas and display. An unknown unit is never guessed: it stays as
// written and is flagged so the import can ask.

export type UnitDimension = 'length' | 'area' | 'volume' | 'mass' | 'count' | 'time' | 'lump' | 'price_unit';

export interface UnitDef {
  key: string;
  label: string;
  dimension: UnitDimension;
}

export const UNITS: UnitDef[] = [
  { key: 'm', label: 'm', dimension: 'length' },
  { key: 'm2', label: 'm²', dimension: 'area' },
  { key: 'm3', label: 'm³', dimension: 'volume' },
  { key: 'kg', label: 'kg', dimension: 'mass' },
  { key: 't', label: 't', dimension: 'mass' },
  { key: 'pce', label: 'pce', dimension: 'count' },
  { key: 'h', label: 'h', dimension: 'time' },
  { key: 'jour', label: 'jour', dimension: 'time' },
  { key: 'gl', label: 'forfait', dimension: 'lump' },
  // CAN "up" (unité de prix): the quantity is itself an amount or a count
  // defined by the article ("up = Fr.", "up = pce").
  { key: 'up', label: 'up', dimension: 'price_unit' },
];

const ALIASES: Record<string, string> = {
  m: 'm', ml: 'm', 'm1': 'm', lfm: 'm', mct: 'm',
  m2: 'm2', 'm²': 'm2', qm: 'm2', mq: 'm2',
  m3: 'm3', 'm³': 'm3', cbm: 'm3', mc: 'm3',
  kg: 'kg',
  t: 't', to: 't',
  p: 'pce', pc: 'pce', pce: 'pce', pces: 'pce', 'pièce': 'pce', 'pièces': 'pce', st: 'pce', stk: 'pce', stück: 'pce', pz: 'pce', u: 'pce', un: 'pce',
  h: 'h', std: 'h', heure: 'h', heures: 'h', ora: 'h', ore: 'h',
  j: 'jour', jour: 'jour', jours: 'jour', tag: 'jour', tage: 'jour', giorno: 'jour', giorni: 'jour',
  gl: 'gl', fft: 'gl', forfait: 'gl', global: 'gl', pauschal: 'gl', psch: 'gl', 'a corpo': 'gl', ac: 'gl',
  up: 'up', le: 'up',
};

export function normalizeUnit(raw: string | null | undefined): { unit: string | null; known: boolean } {
  if (raw == null) return { unit: null, known: false };
  const key = String(raw).trim().toLowerCase().replace(/\.$/, '');
  if (!key) return { unit: null, known: false };
  const unit = ALIASES[key];
  return unit ? { unit, known: true } : { unit: String(raw).trim(), known: false };
}

export function unitLabel(unit: string | null | undefined): string {
  if (!unit) return '';
  return UNITS.find((u) => u.key === unit)?.label ?? unit;
}

export function unitDimension(unit: string | null | undefined): UnitDimension | null {
  return UNITS.find((u) => u.key === unit)?.dimension ?? null;
}

// The choices offered when the import is unsure of a unit.
export const UNIT_CHOICES = ['m', 'm2', 'm3', 'pce', 'kg', 'h', 'gl'];
