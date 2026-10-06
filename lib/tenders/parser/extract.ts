// DocumentExtractor: native text with positions through pdf.js. The pdf.js
// module is passed in, so the same code runs in the browser (loaded from
// the CDN, see lib/tenders/pdfjs.web.ts) and in Node for the tests
// (pdfjs-dist legacy build). No OCR here: a page without a text layer is
// only counted, and the import switches to the OCR path when most are.

import type { ExtractedDocument, PageInfo, TextItem } from './types.ts';

// Minimal surface of pdf.js we rely on (3.x API).
export interface PdfJsLike {
  getDocument(src: { data: Uint8Array; disableFontFace?: boolean; isEvalSupported?: boolean; useSystemFonts?: boolean }): { promise: Promise<PdfDocLike> };
}
export interface PdfDocLike {
  numPages: number;
  getPage(n: number): Promise<PdfPageLike>;
  destroy?: () => Promise<void>;
}
export interface PdfPageLike {
  rotate: number;
  getViewport(o: { scale: number }): { width: number; height: number };
  getTextContent(): Promise<{ items: Array<{ str?: string; transform?: number[]; width?: number; height?: number; fontName?: string }> }>;
}

export async function extractText(pdfjs: PdfJsLike, data: Uint8Array, onPage?: (page: number, total: number) => void): Promise<ExtractedDocument> {
  const doc = await pdfjs.getDocument({ data, disableFontFace: true, isEvalSupported: false, useSystemFonts: false }).promise;
  const pages: PageInfo[] = [];
  const items: TextItem[] = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const vp = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();
    let count = 0;
    for (const it of content.items) {
      const str = (it.str ?? '').replace(/\s+/g, ' ');
      if (!str.trim() || !it.transform) continue;
      const [a, b, , d, e, f] = it.transform;
      const fontSize = Math.hypot(a, b) || Math.abs(d) || it.height || 10;
      const h = it.height || fontSize;
      items.push({
        page: n,
        x: round1(e),
        // pdf.js gives the baseline from the bottom; we want the top from the top.
        y: round1(vp.height - f - h * 0.8),
        w: round1(it.width ?? str.length * fontSize * 0.5),
        h: round1(h),
        str,
        fontSize: round1(fontSize),
        fontName: it.fontName,
      });
      count += 1;
    }
    pages.push({ page: n, width: vp.width, height: vp.height, rotation: page.rotate ?? 0, textItems: count });
    onPage?.(n, doc.numPages);
  }
  await doc.destroy?.();
  const empty = pages.filter((p) => p.textItems < 5).length;
  return { pages, items, scanned: pages.length > 0 && empty / pages.length > 0.6 };
}

const round1 = (n: number) => Math.round(n * 10) / 10;
