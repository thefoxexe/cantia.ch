import { createClient } from 'npm:@supabase/supabase-js@2';
import { PDFDocument, PDFFont, PDFPage, RGB, rgb } from 'npm:pdf-lib@1.17.1';

export const PAGE_WIDTH = 595.28; // A4 pt
export const PAGE_HEIGHT = 841.89;
export const MARGIN = 42;

export const INK = rgb(0.0941, 0.1098, 0.1059);
export const MUTED = rgb(0.3608, 0.3961, 0.3765);
export const ACCENT = rgb(0.6902, 0.4118, 0.1725);
export const LINE = rgb(0.8824, 0.8706, 0.8314);
export const WHITE = rgb(1, 1, 1);
export const PAPER_ALT = rgb(0.9569, 0.9490, 0.9412);
export const BAND_MUTED = rgb(0.85, 0.89, 0.87);

// pdf-lib's standard fonts use WinAnsi (cp1252) encoding, which can't encode
// most unicode punctuation/space variants — e.g. Intl.NumberFormat('fr-CH', {
// style: 'currency' }) inserts a narrow no-break space (U+202F) as the
// thousands separator for any amount >= 1000. Left unsanitized, drawText
// throws mid-render, which previously produced blank/broken PDFs. Every
// string that reaches the page goes through wrapText, drawText, or
// drawTextRight, so sanitizing here is a single choke point.
export function sanitizePdfText(text: string): string {
  return (text || '')
    .replace(/[  -   　]/g, ' ')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/œ/g, 'oe')
    .replace(/Œ/g, 'OE')
    .replace(/Ÿ/g, 'Y')
    .replace(/[^\x00-\xFF]/g, '?');
}

export function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of sanitizePdfText(text).split('\n')) {
    const words = paragraph.split(' ').filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      continue;
    }
    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

export function drawText(page: PDFPage, text: string, x: number, y: number, font: PDFFont, size: number, color: RGB = INK) {
  page.drawText(sanitizePdfText(text), { x, y, size, font, color });
}

export function drawTextRight(page: PDFPage, text: string, xRight: number, y: number, font: PDFFont, size: number, color: RGB = INK) {
  const safe = sanitizePdfText(text);
  const w = font.widthOfTextAtSize(safe, size);
  page.drawText(safe, { x: xRight - w, y, size, font, color });
}

export async function fetchStorageBytes(
  admin: ReturnType<typeof createClient>,
  bucket: string,
  path: string,
): Promise<{ bytes: Uint8Array; contentType: string } | null> {
  const { data, error } = await admin.storage.from(bucket).download(path);
  if (error || !data) return null;
  const buf = new Uint8Array(await data.arrayBuffer());
  const contentType = (data.type as string) || guessContentType(path);
  return { bytes: buf, contentType };
}

export function guessContentType(path: string): string {
  const lower = path.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  return 'application/octet-stream';
}

export async function embedImageSmart(pdfDoc: PDFDocument, bytes: Uint8Array, contentType: string) {
  try {
    if (contentType.includes('png')) return await pdfDoc.embedPng(bytes);
    return await pdfDoc.embedJpg(bytes);
  } catch {
    try {
      return await pdfDoc.embedPng(bytes);
    } catch {
      return await pdfDoc.embedJpg(bytes);
    }
  }
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function drawFooter(page: PDFPage, font: PDFFont, pageNum: number, brand: string) {
  drawText(page, brand, MARGIN, 24, font, 8, MUTED);
  drawTextRight(page, `Page ${pageNum}`, PAGE_WIDTH - MARGIN, 24, font, 8, MUTED);
}

// Falls back to the previous hardcoded brand green whenever the org hasn't
// set one yet or stored something malformed — every renderer used to read
// this as a module-level constant, so a bad/missing value must never throw.
const DEFAULT_BRAND_HEX = '#1F3D3A';

export function hexToRgb(hex: string | null | undefined): RGB {
  const match = /^#?([0-9a-f]{6})$/i.exec((hex ?? '').trim());
  const clean = match ? match[1] : DEFAULT_BRAND_HEX.slice(1);
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return rgb(r, g, b);
}

// Picks black or white text for legibility on top of a filled brand-color
// rectangle (the moderne/structure templates print white text on the brand
// band today, which breaks if an org picks a light brand color). Uses the
// standard WCAG relative-luminance formula against an RGB in the 0-1 range.
export function pickReadableTextColor(bg: RGB): RGB {
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const luminance = 0.2126 * lin(bg.red) + 0.7152 * lin(bg.green) + 0.0722 * lin(bg.blue);
  return luminance > 0.5 ? INK : WHITE;
}

export type LogoPlacement = 'left' | 'center' | 'right';

export function logoX(placement: LogoPlacement, pageWidth: number, margin: number, logoWidth: number): number {
  if (placement === 'left') return margin;
  if (placement === 'center') return (pageWidth - logoWidth) / 2;
  return pageWidth - margin - logoWidth;
}

export interface PdfTemplateRow {
  id: string;
  base_layout: 'classic' | 'moderne' | 'minimal' | 'structure';
  sections: string[];
}

const BASE_LAYOUTS = ['classic', 'moderne', 'minimal', 'structure'] as const;

// Shared by both edge functions: resolve the pdf_templates row to render
// with — the document's own template_id override when set, else the org's
// default row for that kind. Falls back to an in-memory 'classic' row (never
// throws) if an org somehow has none, which can't normally happen since
// create_organization() and the pdf_templates backfill both always seed one.
export async function resolvePdfTemplate(
  admin: ReturnType<typeof createClient>,
  orgId: string,
  kind: 'devis' | 'report',
  templateId: string | null | undefined,
): Promise<PdfTemplateRow> {
  if (templateId) {
    const { data } = await admin
      .from('pdf_templates')
      .select('id, base_layout, sections')
      .eq('id', templateId)
      .eq('organization_id', orgId)
      .eq('kind', kind)
      .maybeSingle();
    if (data) return data as PdfTemplateRow;
  }
  const { data } = await admin
    .from('pdf_templates')
    .select('id, base_layout, sections')
    .eq('organization_id', orgId)
    .eq('kind', kind)
    .eq('is_default', true)
    .maybeSingle();
  if (data) return data as PdfTemplateRow;
  return { id: '', base_layout: 'classic', sections: kind === 'report' ? ['intro', 'photos', 'signature'] : [] };
}

export function normalizeBaseLayout(value: string | null | undefined): PdfTemplateRow['base_layout'] {
  return (BASE_LAYOUTS as readonly string[]).includes(value ?? '') ? (value as PdfTemplateRow['base_layout']) : 'classic';
}
