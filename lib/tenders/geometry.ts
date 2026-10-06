// Plan measurements. Points are normalized 0..1 on the displayed page, the
// page size is in PDF points (1 pt = 1/72 inch) and the calibration turns
// points into metres. Same formulas as public.measure_geometry in SQL — the
// server figure is the reference, this one is for live display.

import { round } from './numbers.ts';

export type Point = [number, number];
export type MeasureKind = 'distance' | 'polyline' | 'polygon' | 'perimeter' | 'count';

// source 'pdf': the scale was read on the plan itself at import ("Échelle 1:50").
export type Calibration = { method: 'scale'; scale: number; source?: 'pdf' | 'user'; quote?: string } | { method: 'two_points'; a: Point; b: Point; real_m: number };

export interface PageSize {
  width_pt: number;
  height_pt: number;
}

export interface Measures {
  length_m: number | null;
  area_m2: number | null;
  perimeter_m: number | null;
  count: number | null;
}

const PT_M = 0.0254 / 72;

export function distancePt(a: Point, b: Point, page: PageSize): number {
  const dx = (b[0] - a[0]) * page.width_pt;
  const dy = (b[1] - a[1]) * page.height_pt;
  return Math.sqrt(dx * dx + dy * dy);
}

export function metersPerPt(cal: Calibration | null | undefined, page: PageSize): number | null {
  if (!cal) return null;
  if (cal.method === 'scale') return cal.scale > 0 ? cal.scale * PT_M : null;
  const d = distancePt(cal.a, cal.b, page);
  return d >= 1 && cal.real_m > 0 ? cal.real_m / d : null;
}

// "1:50" / "1/50" / "50" → 50
export function parseScale(s: string): number | null {
  const m = s.trim().replace(/\s/g, '').match(/^(?:1[:/])?(\d+(?:[.,]\d+)?)$/);
  if (!m) return null;
  const v = Number(m[1].replace(',', '.'));
  return v > 0 ? v : null;
}

// Scale implied by a calibration, to always show "≈ 1:50" next to the plan.
export function impliedScale(mpp: number | null): number | null {
  return mpp ? round(mpp / PT_M, 0) : null;
}

export const MIN_POINTS: Record<MeasureKind, number> = { distance: 2, polyline: 2, polygon: 3, perimeter: 3, count: 1 };

export function isComplete(kind: MeasureKind, pts: Point[]): boolean {
  if (kind === 'distance') return pts.length === 2;
  return pts.length >= MIN_POINTS[kind];
}

export function measure(kind: MeasureKind, pts: Point[], page: PageSize, mpp: number | null): Measures {
  const out: Measures = { length_m: null, area_m2: null, perimeter_m: null, count: null };
  if (kind === 'count') {
    out.count = pts.length;
    return out;
  }
  if (!mpp) return out;
  let open = 0;
  let shoelace = 0;
  for (let i = 0; i < pts.length - 1; i += 1) {
    open += distancePt(pts[i], pts[i + 1], page);
    shoelace += pts[i][0] * page.width_pt * pts[i + 1][1] * page.height_pt - pts[i + 1][0] * page.width_pt * pts[i][1] * page.height_pt;
  }
  let closing = 0;
  if (pts.length >= 3) {
    const a = pts[pts.length - 1];
    const b = pts[0];
    closing = distancePt(a, b, page);
    shoelace += a[0] * page.width_pt * b[1] * page.height_pt - b[0] * page.width_pt * a[1] * page.height_pt;
  }
  if (kind === 'distance' || kind === 'polyline') out.length_m = round(open * mpp, 4);
  else if (kind === 'perimeter') {
    out.perimeter_m = round((open + closing) * mpp, 4);
    out.length_m = out.perimeter_m;
  } else if (kind === 'polygon') {
    out.area_m2 = round((Math.abs(shoelace) / 2) * mpp * mpp, 4);
    out.perimeter_m = round((open + closing) * mpp, 4);
  }
  return out;
}

// The figure that matters for each kind, with its unit.
export function mainValue(kind: MeasureKind, m: Measures): { value: number | null; unit: string } {
  if (kind === 'count') return { value: m.count, unit: 'pce' };
  if (kind === 'polygon') return { value: m.area_m2, unit: 'm²' };
  if (kind === 'perimeter') return { value: m.perimeter_m, unit: 'm' };
  return { value: m.length_m, unit: 'm' };
}

// Holding Shift snaps the new segment to horizontal / vertical (on screen).
export function snapOrtho(prev: Point, p: Point, page: PageSize): Point {
  const dx = Math.abs((p[0] - prev[0]) * page.width_pt);
  const dy = Math.abs((p[1] - prev[1]) * page.height_pt);
  return dx >= dy ? [p[0], prev[1]] : [prev[0], p[1]];
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// Undo / redo over an immutable list of states.
export interface History<T> {
  past: T[];
  present: T;
  future: T[];
}
export const historyInit = <T>(present: T): History<T> => ({ past: [], present, future: [] });
export const historyPush = <T>(h: History<T>, next: T, limit = 100): History<T> => ({ past: [...h.past, h.present].slice(-limit), present: next, future: [] });
export const historyUndo = <T>(h: History<T>): History<T> =>
  h.past.length ? { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] } : h;
export const historyRedo = <T>(h: History<T>): History<T> =>
  h.future.length ? { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) } : h;

// 12.3456 → "12.35" (Swiss grouping: 1'234.50); counts without decimals.
export function formatMeasure(v: number | null | undefined, decimals = 2): string {
  if (v == null || !Number.isFinite(v)) return '—';
  const [int, dec] = Math.abs(v).toFixed(decimals).split('.');
  return `${v < 0 ? '-' : ''}${int.replace(/\B(?=(\d{3})+(?!\d))/g, "'")}${dec ? `.${dec}` : ''}`;
}
