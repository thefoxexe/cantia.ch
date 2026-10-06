// OCR path for scanned soumissions: pages rendered to JPEG in the browser,
// transcribed row by row by supabase/functions/tender-ocr, then laid back
// out on a canonical grid so the very same rules-based parser runs on them.

import { supabase } from '../supabase';
import type { PdfJsLike } from './parser/extract.ts';
import type { ExtractedDocument } from './parser/types.ts';
import { ocrFields, rowsToItems, type OcrFields, type OcrPage } from './parser/ocrLayout.ts';

export async function renderPage(pdfjs: PdfJsLike, data: Uint8Array, pageNo: number, docCache: { doc?: any }, maxSide = 0): Promise<string> {
  docCache.doc ??= await pdfjs.getDocument({ data }).promise;
  const page = await docCache.doc.getPage(pageNo);
  const base = page.getViewport({ scale: 1 });
  // Large plans (A0) are capped so the image stays within the reader's limits.
  const scale = maxSide ? Math.min(1.7, maxSide / Math.max(base.width, base.height)) : 1.7;
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL('image/jpeg', 0.82).split(',')[1];
}

export async function ocrDocument(pdfjs: PdfJsLike, data: Uint8Array, onPage: (page: number, pages: number) => void, organizationId: string): Promise<{ doc: ExtractedDocument | null; fields: OcrFields[]; model: string | null; error: string | null }> {
  const cache: { doc?: any } = {};
  const first = await pdfjs.getDocument({ data: data.slice() }).promise;
  const total = first.numPages;
  await first.destroy?.();
  if (total > 80) return { doc: null, fields: [], model: null, error: 'PDF scanné trop long pour la lecture automatique (80 pages au maximum).' };
  const out: OcrPage[] = [];
  let model: string | null = null;
  for (let start = 1; start <= total; start += 4) {
    const batch: { page: number; image_base64: string }[] = [];
    for (let p = start; p < Math.min(start + 4, total + 1); p++) batch.push({ page: p, image_base64: await renderPage(pdfjs, data, p, cache) });
    const { data: res, error } = await supabase.functions.invoke('tender-ocr', { body: { organization_id: organizationId, pages: batch } });
    if (error || !res?.pages) return { doc: null, fields: [], model, error: (res as { error?: string } | null)?.error ?? error?.message ?? 'Lecture impossible' };
    model = res.model ?? model;
    out.push(...res.pages);
    onPage(Math.min(start + 3, total), total);
  }
  return { doc: rowsToItems(out), fields: ocrFields(out), model, error: null };
}

// Scanned plan: the scale read in the title block (one AI use).
export async function ocrPlanScale(imageBase64: string, organizationId: string): Promise<{ scale: number | null; quote: string | null; paperFormat: string | null }> {
  const { data } = await supabase.functions.invoke('tender-ocr', { body: { organization_id: organizationId, mode: 'plan_scale', pages: [{ page: 1, image_base64: imageBase64 }] } });
  return { scale: data?.scale ?? null, quote: data?.quote ?? null, paperFormat: data?.paper_format ?? null };
}
