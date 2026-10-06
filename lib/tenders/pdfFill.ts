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
import type { OcrFields } from './parser/ocrLayout.ts';

export type FieldRole =
  | 'position'
  | 'carry'
  | 'chapter_total'
  | 'grand_total'
  // summary page ("CAP" programs): one line per chapter, then the totals
  | 'recap_chapter'
  | 'recap_brut'
  | 'recap_rabais'
  | 'recap_escompte'
  | 'recap_tva'
  | 'recap_net';

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
  code?: string; // recap_chapter: "113"
  rate?: number; // recap_tva: the rate printed on the line ("TVA 7.60")
  bare?: boolean; // no dots to cover: write straight into the cell
}

const DOTS = /^[.…_·\-]{5,}$/;

export function detectFieldLines(doc: ExtractedDocument): FieldLine[] {
  const out: FieldLine[] = [];
  for (const l of groupLines(doc.items)) {
    const slots = l.items.filter((i) => DOTS.test(i.str.trim().replace(/\s+/g, ''))).map((i) => ({ x: i.x, right: i.x + i.w }));
    // A rule under a title ("------") spans the text column: not a field.
    const fields = slots.filter((s) => s.right - s.x < 160);
    if (!fields.length) continue;
    // quantity · unit price · amount, all blank ("descriptif type"): a position
    const role = roleOf(l) ?? (fields.length >= 3 ? 'position' : null);
    if (!role) continue;
    out.push({ page: l.page, y: l.y, h: l.h, fontSize: Math.max(...l.items.map((i) => i.fontSize)), role, slots: fields.sort((a, b) => a.x - b.x), text: l.text });
  }

  // Some programs print the carries and totals as bare labels ("report de
  // bas de page", "total chapitre") and leave the amount column empty, with
  // a summary page of chapters on page 1. The figures go in the amount
  // column learned from the priced lines, or under the summary's "Offre".
  const rights = out.filter((l) => l.role === 'position').map((l) => Math.round(l.slots[l.slots.length - 1].right));
  const amountRight = mostFrequent(rights);
  if (amountRight != null) {
    const all = groupLines(doc.items);
    const offerRight = new Map<number, number>();
    for (const l of all) {
      const head = l.items.find((i) => /^offre$|^angebot$|^offerta$/i.test(i.str.trim()));
      if (head && !offerRight.has(l.page)) offerRight.set(l.page, head.x + head.w);
    }
    for (const l of all) {
      if (out.some((f) => f.page === l.page && Math.abs(f.y - l.y) < 1)) continue;
      const t = l.text.trim();
      const role = labelRole(t, offerRight.has(l.page));
      if (!role) continue;
      const right = role.startsWith('recap') ? offerRight.get(l.page) ?? amountRight : amountRight;
      const code = role === 'recap_chapter' ? /^(\d{3})/.exec(t)?.[1] : undefined;
      const rate = role === 'recap_tva' ? Number(/(\d{1,2}[.,]\d{1,2})/.exec(t)?.[1]?.replace(',', '.')) || undefined : undefined;
      out.push({ page: l.page, y: l.y, h: l.h, fontSize: Math.max(...l.items.map((i) => i.fontSize)), role, slots: [{ x: right - 70, right }], text: l.text, bare: true, ...(code ? { code } : {}), ...(rate ? { rate } : {}) });
    }
  }
  return out.sort((a, b) => a.page - b.page || a.y - b.y);
}

// A scanned soumission has no text layer: the field lines come from the
// OCR (row heights and column edges, as fractions of the page), kept with
// the métré at import.
export function fieldLinesFromOcr(fields: OcrFields[], pages: { page: number; width: number; height: number }[]): FieldLine[] {
  const size = new Map(pages.map((p) => [p.page, p]));
  const out: FieldLine[] = [];
  for (const f of fields) {
    const pg = size.get(f.page);
    if (!pg || f.amountRight == null) continue;
    const h = 9;
    // a few points past the read edge: the dots of a scan must not peek out
    const slot = (right: number | null) => (right == null ? null : { x: right * pg.width - 62, right: right * pg.width + 4 });
    for (const l of f.lines) {
      const y = l.y * pg.height;
      const slots: Slot[] = [];
      if (l.kind === 'position') {
        const q = l.blankQuantity ? slot(f.quantityRight) : null;
        const p = slot(f.priceRight);
        if (q) slots.push(q);
        if (p) slots.push(p);
      }
      slots.push(slot(f.amountRight)!);
      out.push({ page: f.page, y, h, fontSize: 10, role: l.kind, slots, text: '' });
    }
  }
  return out.sort((a, b) => a.page - b.page || a.y - b.y);
}

function mostFrequent(values: number[]): number | null {
  const c = new Map<number, number>();
  for (const v of values) c.set(v, (c.get(v) ?? 0) + 1);
  return [...c.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

// Labels without dots, as written by those programs.
function labelRole(t: string, summaryPage: boolean): FieldRole | null {
  if (/^report de (bas de page|la page pr[ée]c[ée]dente)$|^(übertrag|riporto)\b.{0,30}$/i.test(t)) return 'carry';
  if (/^total chapitre$|^total kapitel$|^totale capitolo$/i.test(t)) return 'chapter_total';
  if (!summaryPage) return null;
  if (/^\d{3}\s+(CAP|CAN|NPK|CPN)\s+\S/.test(t)) return 'recap_chapter';
  if (/^montant total brut|^total brut|^gesamttotal brutto|^totale lordo/i.test(t)) return 'recap_brut';
  if (/^rabais\b|^rabatt\b|^ribasso\b/i.test(t)) return 'recap_rabais';
  if (/^escompte\b|^skonto\b|^sconto\b/i.test(t)) return 'recap_escompte';
  if (/^tva\b|^mwst\b|^iva\b/i.test(t)) return 'recap_tva';
  if (/^montant total net|^total net|^gesamttotal netto|^totale netto/i.test(t)) return 'recap_net';
  return null;
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
  // Written in the blank quantity field when the document left it empty.
  quantity?: number | null;
  // Already printed by the architect (régie lines): nothing to write, but
  // it counts in the carries and totals.
  printedAmount?: number | null;
  chapter?: string | null; // "113", for the summary page
}

// Conditions of the offer, for the summary page (Brut → Rabais → Escompte → TVA → Net).
export interface FillTerms {
  discountPercent?: number;
  escomptePercent?: number;
  vatRate?: number;
}

export interface Write {
  page: number;
  right: number; // text is right-aligned on this x
  top: number;
  h: number;
  fontSize: number;
  text: string;
  cover: { x: number; w: number };
  kind: FieldRole | 'unit_price' | 'quantity';
}

export interface FillPlan {
  writes: Write[];
  filled: number; // positions written
  unpriced: string[]; // positions found in the PDF without a price
  notPlaced: string[]; // priced, but the PDF has no field for them
  unmatched: number; // price fields with no position before them
  total: number;
}

export function formatPdfQuantity(n: number): string {
  const r = Math.round(n * 1000) / 1000;
  const [int, dec] = String(Math.abs(r)).split('.');
  return `${r < 0 ? '-' : ''}${int.replace(/\B(?=(\d{3})+(?!\d))/g, "'")}${dec ? `.${dec}` : ''}`;
}

export function formatPdfAmount(n: number): string {
  const [int, dec] = Math.abs(n).toFixed(2).split('.');
  return `${n < 0 ? '-' : ''}${int.replace(/\B(?=(\d{3})+(?!\d))/g, "'")}.${dec}`;
}

// Each field line belongs to the last position that starts before it.
export function planFill(lines: FieldLine[], nodes: FillNode[], terms: FillTerms = {}): FillPlan {
  const sorted = [...nodes].sort((a, b) => a.page - b.page || a.y - b.y);
  const writes: Write[] = [];
  const done = new Set<string>();
  const unpriced = new Set<string>();
  let k = -1;
  let chapter = 0;
  let grand = 0;
  let unmatched = 0;
  const put = (l: FieldLine, slot: Slot, value: number, kind: Write['kind']) =>
    writes.push({ page: l.page, right: slot.right - 1, top: l.y, h: l.h, fontSize: Math.min(10, Math.max(7, l.fontSize)), text: kind === 'quantity' ? formatPdfQuantity(value) : formatPdfAmount(value), cover: { x: slot.x - 1, w: l.bare ? 0 : slot.right - slot.x + 2 }, kind });

  // The summary page comes first: its figures are the sums of the whole document.
  const byChapter = new Map<string, number>();
  let docTotal = 0;
  for (const n of sorted) {
    const a = n.printedAmount ?? n.amount;
    if (a == null) continue;
    docTotal += a;
    if (n.chapter) byChapter.set(n.chapter, (byChapter.get(n.chapter) ?? 0) + a);
  }
  const brut = round2(docTotal);
  const rabais = round2((brut * (terms.discountPercent ?? 0)) / 100);
  const escompte = round2(((brut - rabais) * (terms.escomptePercent ?? 0)) / 100);
  const ht = brut - rabais - escompte;
  // The rate printed on the summary wins: it is the one the document asks for.
  const vatRate = lines.find((l) => l.role === 'recap_tva')?.rate ?? terms.vatRate ?? 0;
  const tva = round2((ht * vatRate) / 100);
  const net = Math.round((ht + tva) * 20) / 20;

  for (const l of lines) {
    if (l.role.startsWith('recap')) {
      const v =
        l.role === 'recap_chapter' ? byChapter.get(l.code ?? '') ?? null
        : l.role === 'recap_brut' ? brut
        : l.role === 'recap_rabais' ? (rabais ? -rabais : null)
        : l.role === 'recap_escompte' ? (escompte ? -escompte : null)
        : l.role === 'recap_tva' ? (vatRate ? tva : null)
        : net;
      if (v != null && brut) put(l, l.slots[l.slots.length - 1], round2(v), l.role);
      continue;
    }
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
      // Three fields: the quantity is left to the bidder (measured on plan).
      if (l.slots.length >= 3 && n.quantity != null) put(l, l.slots[l.slots.length - 3], n.quantity, 'quantity');
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
    const f = w.kind === 'position' || w.kind === 'unit_price' || w.kind === 'quantity' ? font : bold;
    if (w.cover.w > 0) page.drawRectangle({ x: w.cover.x, y: H - (w.top + w.h + 1.5), width: w.cover.w, height: w.h + 3, color: pdfLib.rgb(1, 1, 1) });
    const tw = f.widthOfTextAtSize(w.text, w.fontSize);
    page.drawText(w.text, { x: w.right - tw, y: H - (w.top + w.h * 0.8), size: w.fontSize, font: f, color: ink });
  }
  return doc.save();
}
