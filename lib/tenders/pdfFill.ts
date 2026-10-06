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
  | 'recap_total'
  | 'recap_brut'
  | 'recap_rabais'
  | 'recap_sub1'
  | 'recap_escompte'
  | 'recap_sub2'
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
  percentSlot?: Slot; // "Rabais ....... % ......": where the rate goes
  rounded?: boolean; // "arrondi aux 5 centimes"
}

const DOTS = /^[.…_·\-]{5,}$/;

export function detectFieldLines(doc: ExtractedDocument): FieldLine[] {
  const out: FieldLine[] = [];
  const recapCandidates: { l: Line; fields: Slot[]; percentSlot?: Slot }[] = [];
  for (const l of groupLines(doc.items)) {
    const slots: Slot[] = [];
    let percentSlot: Slot | undefined;
    for (const i of l.items) {
      const str = i.str.trim();
      if (DOTS.test(str.replace(/\s+/g, ''))) {
        slots.push({ x: i.x, right: i.x + i.w });
        continue;
      }
      // "Fr. ......................": currency, then the field
      const cur = /^(fr\.?|chf|sfr\.?)\s*([.…_]{5,})$/i.exec(str);
      if (cur) {
        const start = i.x + (i.w * (str.length - cur[2].length)) / str.length;
        slots.push({ x: start, right: i.x + i.w });
        continue;
      }
      // "................. % ......" or "7.70 % ......": rate field, then amount
      const pc = str.indexOf('%');
      if (pc > 0 && /^[\s.\d,]*%\s*[.…_\s]{5,}$/.test(str)) {
        const at = (k: number) => i.x + (i.w * k) / str.length;
        if (/^[.…_\s]{4,}$/.test(str.slice(0, pc))) percentSlot = { x: i.x, right: at(pc) - 7 };
        slots.push({ x: at(pc + 1) + 2, right: i.x + i.w });
      }
    }
    // A rule under a title ("------") spans the text column: not a field.
    const fields = slots.filter((s) => s.right - s.x < 160);
    if (!fields.length) continue;
    // quantity · unit price · amount, all blank ("descriptif type"): a position
    const role = roleOf(l) ?? (fields.length >= 3 ? 'position' : null);
    const label = recapLabel(l.text);
    if (label || !role) {
      recapCandidates.push({ l, fields: fields.sort((a, b) => a.x - b.x), percentSlot });
      continue;
    }
    out.push({ page: l.page, y: l.y, h: l.h, fontSize: Math.max(...l.items.map((i) => i.fontSize)), role, slots: fields.sort((a, b) => a.x - b.x), text: l.text });
  }

  // Summary pages (before the first priced page): title page "Montant net
  // soumission", chapter table (Brut / Net), conditions block. Figures go in
  // the first column ("Total de la soumission"), never in "Révisé".
  const firstPriced = Math.min(...out.filter((l) => l.role === 'position').map((l) => l.page), Infinity);
  for (const l of out) if (l.role === 'chapter_total' && l.page < firstPriced && /^total\b/i.test(l.text.replace(/[.…_]{3,}/g, ' ').trim())) l.role = 'recap_total';
  for (const { l, fields, percentSlot } of recapCandidates) {
    const label = recapLabel(l.text);
    const onSummary = l.page < firstPriced;
    let role: FieldRole | null = label;
    const text = l.text.replace(/[.…_]{3,}/g, ' ').replace(/\s+/g, ' ').trim();
    if (!role && onSummary && /^total$/i.test(text.replace(/\s*%.*$/, ''))) role = 'recap_total';
    if (!role && onSummary && /^\d{3}\s+\D/.test(text)) role = 'recap_chapter';
    if (!role) continue;
    if (role === 'recap_chapter' || role === 'recap_total' ? !onSummary : false) continue;
    const code = role === 'recap_chapter' ? /^(\d{3})/.exec(text)?.[1] : undefined;
    const rate = role === 'recap_tva' ? Number(/(\d{1,2}[.,]\d{1,2})\s*%/.exec(l.text)?.[1]?.replace(',', '.')) || undefined : undefined;
    out.push({
      page: l.page, y: l.y, h: l.h, fontSize: Math.max(...l.items.map((i) => i.fontSize)), role, slots: fields, text: l.text,
      ...(code ? { code } : {}), ...(rate ? { rate } : {}), ...(percentSlot ? { percentSlot } : {}), ...(/arrondi|gerundet|arrotondat/i.test(l.text) ? { rounded: true } : {}),
    });
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
      out.push({ page: l.page, y: l.y, h: l.h, fontSize: Math.max(...l.items.map((i) => i.fontSize)), role, slots: [{ x: right - 70, right }], text: l.text, bare: true, ...(code ? { code } : {}), ...(rate ? { rate } : {}), ...(/arrondi|gerundet|arrotondat/i.test(t) ? { rounded: true } : {}) });
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

// Summary labels (with or without dots).
function recapLabel(raw: string): FieldRole | null {
  const t = raw.replace(/[.…_]{3,}/g, ' ').replace(/\s+/g, ' ').trim();
  if (/^montant (total )?net\b|^offre nette|^nettobetrag|^importo netto/i.test(t)) return 'recap_net';
  if (/^net(to)?\s*(\(|$)/i.test(t)) return 'recap_net';
  if (/^brut(to)?\s*$|^montant total brut|^total brut/i.test(t)) return 'recap_brut';
  if (/^rabais\b|^rabatt\b|^ribasso\b/i.test(t)) return 'recap_rabais';
  if (/^sous-total 1\b|^zwischentotal 1\b|^subtotale 1\b/i.test(t)) return 'recap_sub1';
  if (/^escompte\b|^skonto\b|^sconto\b/i.test(t)) return 'recap_escompte';
  if (/^sous-total 2\b|^zwischentotal 2\b|^subtotale 2\b/i.test(t)) return 'recap_sub2';
  if (/^(tva|mwst|iva)\b/i.test(t)) return 'recap_tva';
  return null;
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
  // Summary figures are the sums of what is written in the body, so the
  // recap, the chapter totals and the "Total général" always agree.
  const byChapter = new Map<string, number>();
  const put = (l: FieldLine, slot: Slot, value: number, kind: Write['kind']) =>
    writes.push({ page: l.page, right: slot.right - 1, top: l.y, h: l.h, fontSize: Math.min(10, Math.max(7, l.fontSize)), text: kind === 'quantity' ? formatPdfQuantity(value) : formatPdfAmount(value), cover: { x: slot.x - 1, w: l.bare ? 0 : slot.right - slot.x + 2 }, kind });

  for (const l of lines) {
    if (l.role.startsWith('recap')) continue; // filled once the body is summed
    while (k + 1 < sorted.length && (sorted[k + 1].page < l.page || (sorted[k + 1].page === l.page && sorted[k + 1].y <= l.y + 1))) {
      k += 1;
      const passed = sorted[k];
      if (passed.printedAmount != null) {
        done.add(passed.id);
        chapter += passed.printedAmount;
        grand += passed.printedAmount;
        if (passed.chapter) byChapter.set(passed.chapter, (byChapter.get(passed.chapter) ?? 0) + passed.printedAmount);
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
      if (n.chapter) byChapter.set(n.chapter, (byChapter.get(n.chapter) ?? 0) + n.amount);
    } else if (l.role === 'carry') {
      if (chapter) put(l, l.slots[l.slots.length - 1], round2(chapter), 'carry');
    } else if (l.role === 'chapter_total') {
      if (chapter) put(l, l.slots[l.slots.length - 1], round2(chapter), 'chapter_total');
      chapter = 0;
    } else if (l.role === 'grand_total') {
      if (grand) put(l, l.slots[l.slots.length - 1], round2(grand), 'grand_total');
    }
  }

  // Summary pages: Brut → Rabais → Sous-total 1 → Escompte → Sous-total 2 → TVA → Net.
  const brut = round2(grand);
  const rPct = terms.discountPercent ?? 0;
  const ePct = terms.escomptePercent ?? 0;
  const rabais = round2((brut * rPct) / 100);
  const sub1 = round2(brut - rabais);
  const escompte = round2((sub1 * ePct) / 100);
  const sub2 = round2(sub1 - escompte);
  // The rate validated in the recap wins; otherwise the one printed.
  const vatRate = terms.vatRate ?? lines.find((l) => l.role === 'recap_tva')?.rate ?? 0;
  const tva = round2((sub2 * vatRate) / 100);
  const netExact = round2(sub2 + tva);
  const net5 = Math.round(netExact * 20) / 20;
  const chapterNet = (b: number) => round2(b * (1 - rPct / 100) * (1 - ePct / 100));
  const putPercent = (l: FieldLine, pct: number) =>
    l.percentSlot && writes.push({ page: l.page, right: l.percentSlot.right - 1, top: l.y, h: l.h, fontSize: Math.min(10, Math.max(7, l.fontSize)), text: pct.toFixed(2), cover: { x: l.percentSlot.x - 1, w: l.bare ? 0 : l.percentSlot.right - l.percentSlot.x + 2 }, kind: l.role });
  for (const l of lines) {
    if (!l.role.startsWith('recap')) continue;
    if (!brut) continue;
    const first = l.slots[0];
    if (l.role === 'recap_chapter' || l.role === 'recap_total') {
      const b = l.role === 'recap_total' ? brut : round2(byChapter.get(l.code ?? '') ?? 0);
      if (!b && l.role === 'recap_chapter' && !byChapter.has(l.code ?? '')) continue;
      put(l, first, b, l.role);
      // Brut / Net columns side by side
      if (l.slots.length >= 2 && !l.bare) put(l, l.slots[1], l.role === 'recap_total' ? sub2 : chapterNet(b), l.role);
      continue;
    }
    if (l.role === 'recap_rabais') {
      putPercent(l, rPct);
      if (rabais) put(l, first, -rabais, l.role);
      continue;
    }
    if (l.role === 'recap_escompte') {
      putPercent(l, ePct);
      if (escompte) put(l, first, -escompte, l.role);
      continue;
    }
    const v = l.role === 'recap_brut' ? brut : l.role === 'recap_sub1' ? sub1 : l.role === 'recap_sub2' ? sub2 : l.role === 'recap_tva' ? (vatRate ? tva : null) : l.rounded ? net5 : netExact;
    if (v != null) put(l, first, v, l.role);
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
