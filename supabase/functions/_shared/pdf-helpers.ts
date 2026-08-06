import { createClient } from 'npm:@supabase/supabase-js@2';
import { PDFDocument, PDFFont, PDFImage, PDFPage, RGB, rgb } from 'npm:pdf-lib@1.17.1';

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
//
// Iterates by code point and compares numeric ranges rather than using a
// regex character class of literal unicode characters — an earlier version
// used literal unicode space characters in a regex, which got silently
// mangled by an editing/transport pass, so U+202F (the fr-CH thousands
// separator) fell through to the catch-all below and rendered as a literal
// "?" in every amount >= CHF 1000 (e.g. "22 185.23" became "22?185.23").
export function sanitizePdfText(text: string): string {
  const REPLACEMENTS: Record<number, string> = {
    0x2018: "'", 0x2019: "'",
    0x201c: '"', 0x201d: '"',
    0x2013: '-', 0x2014: '-', 0x2022: '-',
    0x20ac: 'EUR',
    0x2026: '...',
    0x0153: 'oe', 0x0152: 'OE', 0x0178: 'Y',
  };
  let result = '';
  for (const ch of text || '') {
    const code = ch.codePointAt(0) ?? 0;
    const isSpaceVariant =
      code === 0x00a0 ||
      (code >= 0x2000 && code <= 0x200f) ||
      (code >= 0x2028 && code <= 0x202f) ||
      code === 0x205f ||
      code === 0x3000;
    if (isSpaceVariant) result += ' ';
    else if (REPLACEMENTS[code] !== undefined) result += REPLACEMENTS[code];
    else if (code > 0xff) result += '?';
    else result += ch;
  }
  return result;
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

// Decodes a data: URL (what SignaturePad.web.tsx captures — a base64 PNG
// drawn in-browser) into raw bytes ready for embedImageSmart. Distinct from
// fetchStorageBytes: a client's e-signature is stored inline on the row
// (devis.client_signature_data) rather than as a storage object, since it's
// small and only ever needs to travel alongside the row that owns it.
export function decodeDataUrl(dataUrl: string): { bytes: Uint8Array; contentType: string } | null {
  const match = /^data:(image\/\w+);base64,(.+)$/.exec(dataUrl.trim());
  if (!match) return null;
  try {
    const binary = atob(match[2]);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return { bytes, contentType: match[1] };
  } catch {
    return null;
  }
}

export function guessContentType(path: string): string {
  const lower = path.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  return 'application/octet-stream';
}

// Returns null instead of throwing when a file is neither a valid PNG nor a
// valid JPEG (corrupt upload, HEIC that slipped past the picker's format
// filter, etc.) — callers already treat a null logo/signature/photo as "skip
// this image", so one bad file degrades gracefully instead of taking down
// the whole PDF generation (which previously surfaced as a hard failure with
// no indication of which image was the problem).
export async function embedImageSmart(pdfDoc: PDFDocument, bytes: Uint8Array, contentType: string): Promise<PDFImage | null> {
  const attempts = contentType.includes('png')
    ? [() => pdfDoc.embedPng(bytes), () => pdfDoc.embedJpg(bytes)]
    : [() => pdfDoc.embedJpg(bytes), () => pdfDoc.embedPng(bytes)];
  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch {
      // try the next format
    }
  }
  console.error(`embedImageSmart: could not embed image as PNG or JPEG (contentType: ${contentType}, ${bytes.length} bytes)`);
  return null;
}

// Sanitized at the source, not just via the drawText/drawTextRight choke
// point — box-width measurements in devis renderers call
// widthOfTextAtSize directly on this string before it ever reaches drawText.
export function formatChf(amount: number): string {
  return sanitizePdfText(new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(amount));
}

// Swiss cash settlement rounds to the nearest 5 centimes (the smallest coin
// still in circulation) — applied once to the final payable total, never to
// the subtotal or VAT lines, so the printed breakdown still adds up exactly
// on paper and only the bottom-line "Total TTC" (and the QR-bill amount,
// which must match it) gets rounded.
export function swissRound(amount: number): number {
  return Math.round(amount / 0.05) * 0.05;
}

// Composes a single display line from an org's address, preferring the
// structured street/postal_code/locality fields (added once a QR-bill needs
// a structured "S" creditor address) and falling back to the legacy
// free-text `address` column for orgs that haven't re-entered it yet.
export function formatOrgAddress(org: any): string | null {
  const structured = [org?.street, [org?.postal_code, org?.locality].filter(Boolean).join(' ')]
    .filter((part) => part && part.trim().length > 0)
    .join(', ');
  return structured || org?.address || null;
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
  brand_color_override: string | null;
  logo_placement_override: LogoPlacement | null;
  footer_text_override: string | null;
}

const TEMPLATE_COLUMNS =
  'id, base_layout, sections, brand_color_override, logo_placement_override, footer_text_override';

const BASE_LAYOUTS = ['classic', 'moderne', 'minimal', 'structure'] as const;

const EMPTY_TEMPLATE: PdfTemplateRow = {
  id: '',
  base_layout: 'classic',
  sections: [],
  brand_color_override: null,
  logo_placement_override: null,
  footer_text_override: null,
};

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
      .select(TEMPLATE_COLUMNS)
      .eq('id', templateId)
      .eq('organization_id', orgId)
      .eq('kind', kind)
      .maybeSingle();
    if (data) return data as PdfTemplateRow;
  }
  const { data } = await admin
    .from('pdf_templates')
    .select(TEMPLATE_COLUMNS)
    .eq('organization_id', orgId)
    .eq('kind', kind)
    .eq('is_default', true)
    .maybeSingle();
  if (data) return data as PdfTemplateRow;
  return { ...EMPTY_TEMPLATE, sections: kind === 'report' ? ['intro', 'photos', 'signature'] : [] };
}

// A template's own override wins over the org's brand kit, which wins over
// the hardcoded default — one place both edge functions call so "template
// overrides org" isn't reimplemented per renderer.
export function resolveBrand(template: PdfTemplateRow, org: any): RGB {
  return hexToRgb(template.brand_color_override ?? org?.brand_color);
}

export function resolveLogoPlacement(template: PdfTemplateRow, org: any): LogoPlacement {
  return template.logo_placement_override ?? (org?.logo_placement as LogoPlacement) ?? 'right';
}

// Free-plan orgs can never actually have a footer_text_override or
// org.footer_text set (both writes are gated by org_has_customization at
// the DB level — see 20260807090000_pdf_customization_gating.sql), so this
// would otherwise just fall through to null and let the caller's generic
// "org name" fallback print instead. Forcing a Cantia mention here is the
// free plan's one bit of built-in advertising, and it's the only path that
// can reach it — a paying org's own footer_text/override always wins.
export function resolveFooterText(template: PdfTemplateRow, org: any, hasCustomization: boolean): string | null {
  if (!hasCustomization) return 'Document généré avec Cantia — cantia.ch';
  return template.footer_text_override?.trim() || org?.footer_text?.trim() || null;
}

// Same coalesce-to-true-on-missing-plan fallback as the DB's
// org_has_customization() function, read off the `plans(has_customization)`
// join every caller now includes in its organizations select.
export function orgHasCustomization(org: any): boolean {
  const plan = org?.plans;
  const flag = Array.isArray(plan) ? plan[0]?.has_customization : plan?.has_customization;
  return flag ?? true;
}

export function normalizeBaseLayout(value: string | null | undefined): PdfTemplateRow['base_layout'] {
  return (BASE_LAYOUTS as readonly string[]).includes(value ?? '') ? (value as PdfTemplateRow['base_layout']) : 'classic';
}

export function truncate(text: string, font: PDFFont, size: number, maxWidth: number): string {
  const safe = sanitizePdfText(text);
  if (font.widthOfTextAtSize(safe, size) <= maxWidth) return safe;
  let result = safe;
  while (result.length > 1 && font.widthOfTextAtSize(result + '...', size) > maxWidth) {
    result = result.slice(0, -1);
  }
  return result + '...';
}

export function formatCoords(lat: number | null, lng: number | null): string | null {
  if (lat == null || lng == null) return null;
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('fr-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Shared 2-column photo grid — used by all 4 report renderers today, and by
// the free-canvas 'photos' block. cardBorder/cardBg null draws no card box
// at all (the minimal template's look). Pagination is handled internally:
// onNewPage draws the outgoing page's footer before a fresh page starts,
// mirroring each renderer's own newPage() closure.
export async function drawPhotoGrid(params: {
  pdfDoc: PDFDocument;
  admin: ReturnType<typeof createClient>;
  bucket: string;
  page: PDFPage;
  pageNum: number;
  y: number;
  photos: any[];
  font: PDFFont;
  fontBold: PDFFont;
  labelColor: RGB;
  cardBorder: RGB | null;
  cardBg: RGB | null;
  onNewPage: (page: PDFPage, pageNum: number) => void;
  // Optional overrides so a free-canvas 'photos' block can confine the grid
  // to its own x/width instead of the full page margin — every existing
  // caller omits these and keeps the original MARGIN-based layout exactly.
  x?: number;
  width?: number;
}): Promise<{ page: PDFPage; pageNum: number; y: number }> {
  let { page, pageNum, y } = params;
  const { pdfDoc, admin, bucket, photos, font, fontBold, labelColor, cardBorder, cardBg } = params;
  const gridX = params.x ?? MARGIN;
  const gridWidth = params.width ?? PAGE_WIDTH - 2 * MARGIN;

  const cols = 2;
  const gap = 16;
  const cellW = (gridWidth - gap * (cols - 1)) / cols;
  const imgH = 155;
  const captionH = 36;
  const cardPad = 8;
  const cellH = imgH + captionH + cardPad * 2 + 10;
  let col = 0;

  const newPage = () => {
    params.onNewPage(page, pageNum);
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pageNum += 1;
    y = PAGE_HEIGHT - MARGIN;
    drawText(page, 'PHOTOS (suite)', gridX, y, fontBold, 10, labelColor);
    y -= 20;
    col = 0;
  };

  for (const photo of photos) {
    if (y - cellH < MARGIN + 30) newPage();
    const x = gridX + col * (cellW + gap);
    const cardTop = y;
    const cardBottom = y - cellH + 10;

    if (cardBg || cardBorder) {
      page.drawRectangle({
        x,
        y: cardBottom,
        width: cellW,
        height: cardTop - cardBottom,
        color: cardBg ?? WHITE,
        borderColor: cardBorder ?? undefined,
        borderWidth: cardBorder ? 1 : 0,
      });
    }

    const bytes = await fetchStorageBytes(admin, bucket, photo.storage_path);
    const imgTop = cardTop - cardPad;
    if (bytes) {
      const img = await embedImageSmart(pdfDoc, bytes.bytes, bytes.contentType);
      const innerW = cellW - cardPad * 2;
      page.drawRectangle({ x: x + cardPad, y: imgTop - imgH, width: innerW, height: imgH, color: PAPER_ALT });
      if (img) {
        const scale = Math.min(innerW / img.width, imgH / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        page.drawImage(img, { x: x + cardPad + (innerW - w) / 2, y: imgTop - imgH + (imgH - h) / 2, width: w, height: h });
      }
    }

    let capY = imgTop - imgH - 14;
    if (photo.caption) {
      drawText(page, truncate(photo.caption, fontBold, 9.5, cellW - cardPad * 2), x + cardPad, capY, fontBold, 9.5, INK);
      capY -= 12;
    }
    const coords = formatCoords(photo.latitude, photo.longitude);
    const meta = [coords ? `GPS ${coords}` : null, formatDateTime(photo.taken_at)].filter(Boolean).join('  \u00b7  ');
    drawText(page, truncate(meta, font, 8, cellW - cardPad * 2), x + cardPad, capY, font, 8, MUTED);

    col += 1;
    if (col === cols) {
      col = 0;
      y -= cellH;
    }
  }
  if (col !== 0) y -= cellH;
  y -= 6;

  return { page, pageNum, y };
}
