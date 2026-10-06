// OCR path for scanned soumissions: pages rendered to JPEG in the browser,
// transcribed row by row by supabase/functions/tender-ocr, then laid back
// out on a canonical grid so the very same rules-based parser runs on them.

import { supabase } from '../supabase';
import type { PdfJsLike } from './parser/extract.ts';
import type { ExtractedDocument } from './parser/types.ts';
import { rowsToItems, type OcrRow } from './parser/ocrLayout.ts';

async function renderPage(pdfjs: PdfJsLike, data: Uint8Array, pageNo: number, docCache: { doc?: any }): Promise<string> {
  docCache.doc ??= await pdfjs.getDocument({ data }).promise;
  const page = await docCache.doc.getPage(pageNo);
  const viewport = page.getViewport({ scale: 1.7 });
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL('image/jpeg', 0.82).split(',')[1];
}

export async function ocrDocument(pdfjs: PdfJsLike, data: Uint8Array, onPage: (page: number, pages: number) => void, organizationId: string): Promise<{ doc: ExtractedDocument | null; model: string | null; error: string | null }> {
  const cache: { doc?: any } = {};
  const first = await pdfjs.getDocument({ data: data.slice() }).promise;
  const total = first.numPages;
  await first.destroy?.();
  if (total > 80) return { doc: null, model: null, error: 'PDF scanné trop long pour la lecture automatique (80 pages au maximum).' };
  const out: { page: number; rows: OcrRow[] }[] = [];
  let model: string | null = null;
  for (let start = 1; start <= total; start += 4) {
    const batch: { page: number; image_base64: string }[] = [];
    for (let p = start; p < Math.min(start + 4, total + 1); p++) batch.push({ page: p, image_base64: await renderPage(pdfjs, data, p, cache) });
    const { data: res, error } = await supabase.functions.invoke('tender-ocr', { body: { organization_id: organizationId, pages: batch } });
    if (error || !res?.pages) return { doc: null, model, error: (res as { error?: string } | null)?.error ?? error?.message ?? 'Lecture impossible' };
    model = res.model ?? model;
    out.push(...res.pages);
    onPage(Math.min(start + 3, total), total);
  }
  return { doc: rowsToItems(out), model, error: null };
}
