// OCR rows (supabase/functions/tender-ocr) laid back out on a canonical
// CAN grid, so a scanned soumission goes through the same rules-based
// parser as a native PDF. Pure: tested in scripts/tenders-parser.test.mjs.

import type { ExtractedDocument, TextItem } from './types.ts';

export interface OcrRow {
  kind: 'line' | 'chapter_header' | 'total';
  reserved: boolean;
  number: string;
  text: string;
  zone: string;
  quantity: string;
  unit: string;
  unit_price: string;
  amount: string;
  y?: number | null; // top of the row, % of the page height
}

export interface OcrPage {
  page: number;
  rows: OcrRow[];
  // right edges of the columns, % of the page width
  quantity_right?: number | null;
  price_right?: number | null;
  amount_right?: number | null;
}

// Where the figures go on a scanned page: kept with the métré so the
// export can write into the scan (see pdfFill.fieldLinesFromOcr).
export interface OcrFieldLine {
  y: number; // 0..1 from the top
  kind: 'position' | 'carry' | 'chapter_total' | 'grand_total';
  blankQuantity: boolean;
}
export interface OcrFields {
  page: number;
  quantityRight: number | null; // 0..1
  priceRight: number | null;
  amountRight: number | null;
  lines: OcrFieldLine[];
}

export function ocrFields(pages: OcrPage[]): OcrFields[] {
  return pages.map((p) => ({
    page: p.page,
    quantityRight: p.quantity_right != null ? p.quantity_right / 100 : null,
    priceRight: p.price_right != null ? p.price_right / 100 : null,
    amountRight: p.amount_right != null ? p.amount_right / 100 : null,
    lines: p.rows.flatMap((r): OcrFieldLine[] => {
      if (r.y == null) return [];
      const y = r.y / 100;
      const t = `${r.number} ${r.text}`.trim();
      if (r.kind === 'total') {
        if (/report|übertrag|riporto/i.test(t)) return [{ y, kind: 'carry', blankQuantity: false }];
        if (/total\s*g[ée]n[ée]ral|gesamttotal|totale\s*generale/i.test(t)) return [{ y, kind: 'grand_total', blankQuantity: false }];
        return [{ y, kind: 'chapter_total', blankQuantity: false }];
      }
      if (r.kind === 'line' && (r.unit || r.quantity) && !r.amount) return [{ y, kind: 'position', blankQuantity: !r.quantity }];
      return [];
    }),
  }));
}

const W = 595;
const H = 842;
// Canonical columns (a Messerli/CAN layout), see lib/tenders/parser/layout.ts.
const COL = { r: 46, article: 60, sub: 77, text: 101, zone: 249, qtyRight: 368, unit: 390, priceRight: 487, amountRight: 561 };
const run = (page: number, x: number, y: number, str: string): TextItem => ({ page, x, y, w: str.length * 5, h: 10, str, fontSize: 10 });
const right = (page: number, edge: number, y: number, str: string): TextItem => ({ page, x: edge - str.length * 5, y, w: str.length * 5, h: 10, str, fontSize: 10 });

// Rows → positioned runs. Exported for the tests.
export function rowsToItems(pages: OcrPage[]): ExtractedDocument {
  const items: TextItem[] = [];
  for (const { page, rows } of pages) {
    let y = 106;
    for (const r of rows) {
      // The row's real height on the scan, when the reader gave it, so the
      // source boxes (and the filled PDF) land on the right line.
      if (r.y != null && r.kind !== 'chapter_header') y = Math.max(y, (r.y / 100) * H);
      if (r.kind === 'chapter_header') {
        items.push(run(page, 113, 78, r.text));
        continue;
      }
      if (r.reserved) items.push(run(page, COL.r, y, 'R'));
      const num = r.number.trim();
      if (num.startsWith('.')) items.push(run(page, COL.sub, y, `${num} ${r.text}`.trim()));
      else if (/^\d{3}\.\d{3}$/.test(num)) items.push(run(page, COL.article, y, `${num} ${r.text}`.trim()));
      else {
        if (num) items.push(run(page, COL.article, y, num));
        if (r.text) items.push(run(page, COL.text, y, r.text));
      }
      if (r.zone) items.push(run(page, COL.zone, y, `:${r.zone}`));
      if (r.quantity) items.push(right(page, COL.qtyRight, y, r.quantity));
      if (r.unit) items.push(run(page, COL.unit, y, r.unit));
      if (r.zone || r.quantity || r.unit) {
        items.push(right(page, COL.priceRight, y, r.unit_price || '......................'));
        items.push(right(page, COL.amountRight, y, r.amount || '......................'));
      }
      y += 11;
    }
  }
  const pageNos = [...new Set(pages.map((p) => p.page))];
  return {
    pages: pageNos.map((page) => ({ page, width: W, height: H, rotation: 0, textItems: items.filter((i) => i.page === page).length })),
    items,
    scanned: false,
  };
}

