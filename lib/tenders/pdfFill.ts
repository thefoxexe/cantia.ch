// Fill the architect's own soumission PDF: unit prices and amounts go into
// the dotted fields printed for them, then the "A reporter" carries, the
// chapter totals and the "Total général". Nothing else on the page moves —
// it is still the original document, with the figures written in.
//
// 1. find the field lines (runs of dots/underscores) in the text layer;
// 2. give each one its value in reading order (position → its own figures,
//    carry/total → the running sums);
// 3. write them with pdf-lib (white box over the dots, number right-aligned).
// Steps 1–2 are pure and tested on the reference soumission.

import { groupLines } from './parser/layout.ts';
import type { ExtractedDocument, Line } from './parser/types.ts';

export type FieldRole = 'position' | 'carry' | 'chapter_total' | 'grand_total';

export interface Slot {
  x: number;
  right: number;
}

export interface FieldLine {
  page: number;
  y: number; // top, PDF points from the top of the page
  h: number;
  fontSize: number;
  role: FieldRole;
  slots: Slot[]; // left to right
  text: string;
}

const DOTS = /^[.…_·\-]{5,}$/;

export function detectFieldLines(doc: ExtractedDocument): FieldLine[] {
  const out: FieldLine[] = [];
  for (const l of groupLines(doc.items)) {
    const slots = l.items.filter((i) => DOTS.test(i.str.trim().replace(/\s+/g, ''))).map((i) => ({ x: i.x, right: i.x + i.w }));
    // A rule under a title ("------") spans the text column: not a field.
    const fields = slots.filter((s) => s.right - s.x < 160);
    if (!fields.length) continue;
    const role = roleOf(l);
    if (!role) continue;
    out.push({ page: l.page, y: l.y, h: l.h, fontSize: Math.max(...l.items.map((i) => i.fontSize)), role, slots: fields.sort((a, b) => a.x - b.x), text: l.text });
  }
  return out.sort((a, b) => a.page - b.page || a.y - b.y);
}

function roleOf(l: Line): FieldRole | null {
  const t = l.text.replace(/[.…_]{3,}/g, ' ').trim();
  if (/\b(a\s*reporter|report|übertrag|riporto|da\s*riportare)\b/i.test(t)) return 'carry';
  if (/\btotal\s*g[ée]n[ée]ral|gesamttotal|totale\s*generale|total\s*de\s*l['’]offre/i.test(t)) return 'grand_total';
  // "241 Total Constructions en béton" — not "durée total des travaux".
  if (/^(\d{2,3}\s+)?(total|totale|summe)\b/i.test(t)) return 'chapter_total';
  // a priced line: quantity + unit, or the ":Total" of the zone breakdown
  if (/:\s*total/i.test(t) || /\d\s*(m2|m3|m²|m³|m|ml|kg|t|p|pce|pces|up|h|gl|fft|st)\b/i.test(t)) return 'position';
  return null;
}

export interface FillNode {
  id: string;
  page: number;
  y: number; // top of the position's first line, points from the top
  unitPrice: number | null;
  amount: number | null;
  // Already printed by the architect (régie lines): nothing to write, but
  // it counts in the carries and totals.
  printedAmount?: number | null;
}

export interface Write {
  page: number;
  right: number; // text is right-aligned on this x
  top: number;
  h: number;
  fontSize: number;
  text: string;
  cover: { x: number; w: number };
  kind: FieldRole | 'unit_price';
}

export interface FillPlan {
  writes: Write[];
  filled: number; // positions written
  unpriced: string[]; // positions found in the PDF without a price
  notPlaced: string[]; // priced, but the PDF has no field for them
  unmatched: number; // price fields with no position before them
  total: number;
}

export function formatPdfAmount(n: number): string {
  const [int, dec] = Math.abs(n).toFixed(2).split('.');
  return `${n < 0 ? '-' : ''}${int.replace(/\B(?=(\d{3})+(?!\d))/g, "'")}.${dec}`;
}

// Each field line belongs to the last position that starts before it.
export function planFill(lines: FieldLine[], nodes: FillNode[]): FillPlan {
  const sorted = [...nodes].sort((a, b) => a.page - b.page || a.y - b.y);
  const writes: Write[] = [];
  const done = new Set<string>();
  const unpriced = new Set<string>();
  let k = -1;
  let chapter = 0;
  let grand = 0;
  let unmatched = 0;
  const put = (l: FieldLine, slot: Slot, value: number, kind: Write['kind']) =>
    writes.push({ page: l.page, right: slot.right - 1, top: l.y, h: l.h, fontSize: Math.min(10, Math.max(7, l.fontSize)), text: formatPdfAmount(value), cover: { x: slot.x - 1, w: slot.right - slot.x + 2 }, kind });

  for (const l of lines) {
    while (k + 1 < sorted.length && (sorted[k + 1].page < l.page || (sorted[k + 1].page === l.page && sorted[k + 1].y <= l.y + 1))) {
      k += 1;
      const passed = sorted[k];
      if (passed.printedAmount != null) {
        done.add(passed.id);
        chapter += passed.printedAmount;
        grand += passed.printedAmount;
      }
    }
    if (l.role === 'position') {
      const n = k >= 0 ? sorted[k] : null;
      if (!n) {
        unmatched += 1;
        continue;
      }
      if (done.has(n.id)) continue;
      done.add(n.id);
      if (n.unitPrice == null || n.amount == null) {
        unpriced.add(n.id);
        continue;
      }
      const amountSlot = l.slots[l.slots.length - 1];
      if (l.slots.length >= 2) put(l, l.slots[l.slots.length - 2], n.unitPrice, 'unit_price');
      put(l, amountSlot, n.amount, 'position');
      chapter += n.amount;
      grand += n.amount;
    } else if (l.role === 'carry') {
      if (chapter) put(l, l.slots[l.slots.length - 1], round2(chapter), 'carry');
    } else if (l.role === 'chapter_total') {
      if (chapter) put(l, l.slots[l.slots.length - 1], round2(chapter), 'chapter_total');
      chapter = 0;
    } else if (l.role === 'grand_total') {
      if (grand) put(l, l.slots[l.slots.length - 1], round2(grand), 'grand_total');
    }
  }
  const notPlaced = sorted.filter((n) => !done.has(n.id) && n.amount != null).map((n) => n.id);
  return { writes, filled: writes.filter((w) => w.kind === 'position').length, unpriced: [...unpriced], notPlaced, unmatched, total: round2(grand) };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

// pdf-lib, kept apart so the plan above can be tested without it.
export interface PdfLibLike {
  PDFDocument: { load(bytes: Uint8Array, opts?: { ignoreEncryption?: boolean }): Promise<any> };
  StandardFonts: { Helvetica: string; HelveticaBold: string };
  rgb(r: number, g: number, b: number): unknown;
}

export async function applyFill(pdfLib: PdfLibLike, bytes: Uint8Array, plan: FillPlan): Promise<Uint8Array> {
  const doc = await pdfLib.PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await doc.embedFont(pdfLib.StandardFonts.Helvetica);
  const bold = await doc.embedFont(pdfLib.StandardFonts.HelveticaBold);
  const ink = pdfLib.rgb(0.05, 0.11, 0.33);
  for (const w of plan.writes) {
    const page = doc.getPage(w.page - 1);
    if (!page || (page.getRotation?.().angle ?? 0) % 360 !== 0) continue;
    const H = page.getHeight();
    const f = w.kind === 'position' || w.kind === 'unit_price' ? font : bold;
    page.drawRectangle({ x: w.cover.x, y: H - (w.top + w.h + 1.5), width: w.cover.w, height: w.h + 3, color: pdfLib.rgb(1, 1, 1) });
    const tw = f.widthOfTextAtSize(w.text, w.fontSize);
    page.drawText(w.text, { x: w.right - tw, y: H - (w.top + w.h * 0.8), size: w.fontSize, font: f, color: ink });
  }
  return doc.save();
}
