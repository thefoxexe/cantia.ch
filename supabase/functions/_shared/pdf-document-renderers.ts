// Single unified PDF layout, shared between generate-devis-pdf and
// generate-facture-pdf — a facture's layout needs (org header, client block,
// items table, totals) are structurally identical to a devis's, the only
// differences being the document label ("Devis" vs "Facture") and an extra
// meta line (due date / paid stamp), parametrized via docLabel/metaLine.
//
// Previously offered 4 selectable designs (classic/moderne/minimal/
// structure); collapsed to this one sober layout so brand color is the only
// visual customization, with the org's name as the header's primary
// identity mark. logoImg (org.logo_url, same asset/placement setting used by
// generate-report-pdf) is optional — when an org hasn't uploaded one, the
// header renders exactly as before. RENDERERS/TemplateId are kept (rather
// than removed) so every existing pdf_templates row's base_layout value
// still resolves without a migration, and both callers' `RENDERERS[template
// .base_layout]` lookup keeps working unchanged.
//
// Elaborated layout: a tinted reference/date/validity box (brand-colored
// left edge), a brand-colored table header band, zebra-striped item rows,
// and a boxed TOTAL TTC / NET À PAYER highlight — all driven by the org's
// own brand_color, never a hardcoded color. Every amount column's width is
// measured against the actual formatted strings that will appear in *this*
// document (font.widthOfTextAtSize), not a fixed pixel guess, so a total in
// the millions gets a wider column instead of overlapping its neighbour —
// the description column simply absorbs whatever space is left over.
import { PDFFont, PDFImage, PDFPage, PDFDocument, RGB, StandardFonts, rgb } from 'npm:pdf-lib@1.17.1';
import {
  INK,
  LINE,
  LogoPlacement,
  MARGIN,
  MUTED,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  drawFooter,
  drawText,
  drawTextRight,
  formatChf,
  formatDate,
  formatDateTime,
  formatOrgAddress,
  hexToRgb,
  logoX,
  pickReadableTextColor,
  sanitizePdfText,
  swissRound,
  wrapText,
} from './pdf-helpers.ts';
import { PdfLocale, pdfProjectLine, pdfT } from './pdf-i18n.ts';

const chf = formatChf;

export type TemplateId = 'classic' | 'moderne' | 'minimal' | 'structure';

// The last page a renderer drew on, plus the y cursor where its content
// ended — lets a caller (generate-devis-pdf / generate-facture-pdf) decide
// whether there's still room to append something (the QR-bill band) to that
// same page instead of always starting a fresh one. The renderer no longer
// draws its own trailing footer or calls pdfDoc.save() — the caller does
// both, once it knows what (if anything) still needs to go on this last page.
export interface RenderResult {
  page: PDFPage;
  y: number;
  pageNum: number;
}

export interface RenderCtx {
  pdfDoc: PDFDocument;
  font: PDFFont;
  fontBold: PDFFont;
  org: any;
  devis: any; // the devis or facture row — same field shape either way
  items: any[];
  // The document creator's own personal signature (organization_members.
  // signature_url), not a company-wide stamp — a devis is signed by
  // whoever drew it up, not "the company". Only devis show this block at
  // all (showSignatures); a facture is a payment request, not something
  // anyone signs.
  signatureImg: PDFImage | null;
  signatureLabel: string;
  showSignatures: boolean;
  // The client's own e-signature, captured once via accept_public_devis
  // (SignaturePad.web.tsx -> devis.client_signature_data) and never
  // overwritten afterwards — this is the durable proof of acceptance, drawn
  // in place of the blank "Signature client" line once it exists. Optional
  // so generate-facture-pdf's ctx (showSignatures always false there) can
  // omit them entirely.
  clientSignatureImg?: PDFImage | null;
  clientSignedAt?: string | null;
  clientSignerName?: string | null;
  // Same org.logo_url asset and left/center/right placement setting as
  // generate-report-pdf's header — optional so an org without a logo (or a
  // corrupt/unreadable upload, which embedImageSmart already degrades to
  // null rather than throwing) just gets the name-only header unchanged.
  logoImg?: PDFImage | null;
  logoPlacement?: LogoPlacement;
  brand: RGB;
  footerText: string | null;
  docLabel: string; // localized 'Devis'/'Angebot' or 'Facture'/'Rechnung'
  docKind: 'devis' | 'facture' | 'extra_work'; // drives which fixed strings drawTerms/renderUnified pick, independent of docLabel's locale
  metaLine: string | null; // e.g. "Échéance : 05.09.2026" or "Payée le 20.08.2026"
  locale: PdfLocale;
  // Real cash already received against this facture (sum of
  // facture_payments.amount), computed once by generate-facture-pdf and
  // passed in so the on-page totals block can show "Déjà payé" / "Net à
  // payer" — not just the QR-bill's amount, which previously was the only
  // place a partial payment showed up. Undefined/0 on a devis (no payments
  // concept there) and on a facture with no payments recorded yet.
  paidSum?: number;
}

// Blends a color toward white by `amount` (0-1) — used for a light tint of
// the org's own brand color behind the reference box, table zebra rows and
// totals highlight, so any brand color (light or dark) stays legible as a
// background fill instead of needing a second hardcoded palette.
// Swiss envelopes have their window on the right: at least 100 × 45 mm,
// about 20 mm from the right edge. Folded in three (C5/6) or in two (C5),
// with the play of the sheet inside the envelope, an A4 page always shows
// about 100–200 mm from the left and 57–84 mm from the top in that window.
// The address starts 120 mm from the left and 61 mm from the top, with a
// margin inside that zone on every side (5 lines fit); each company can shift it by a few millimetres for its own printer
// and envelopes (Compte → Apparence), with a test page to check.
const MM = 72 / 25.4;
export const WINDOW_ADDRESS_LEFT_MM = 120;
export const WINDOW_ADDRESS_TOP_MM = 61;
const WINDOW_ZONE_LEFT_MM = 100;
const WINDOW_ZONE_TOP_MM = 57;
const WINDOW_ZONE_BOTTOM_MM = 84;
export function windowAddressBox(org: any): { x: number; top: number } {
  const dx = Number(org?.client_address_offset_x_mm) || 0;
  const dy = Number(org?.client_address_offset_y_mm) || 0;
  return { x: (WINDOW_ADDRESS_LEFT_MM + dx) * MM, top: PAGE_HEIGHT - (WINDOW_ADDRESS_TOP_MM + dy) * MM };
}

// "Rue du Lac 12\n1000 Lausanne" or "Rue du Lac 12, 1000 Lausanne": one
// line per part, as on an envelope.
function postalLines(address: string | null | undefined): string[] {
  if (!address?.trim()) return [];
  const lines = address.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1) return lines;
  return address.split(/,\s*(?=(?:CH-)?\d{4}\s)/).map((l) => l.trim()).filter(Boolean);
}

// The name and postal address as they must show in the window: each line
// wrapped to the window's width (up to 200 mm from the left), smaller type
// for a 5- or 6-line address so it still ends inside the window, and past
// 6 lines whole address lines go from the top — the name, the street and
// the postcode + locality are always kept.
const WINDOW_ZONE_RIGHT_MM = 200;
function fitPostalBlock(
  name: string | null | undefined,
  address: string | null | undefined,
  x: number,
  font: PDFFont,
  fontBold: PDFFont,
): { size: number; lead: number; lines: { text: string; bold: boolean }[] } {
  const maxW = Math.max(40 * MM, Math.min(WINDOW_ZONE_RIGHT_MM * MM, PAGE_WIDTH - 12) - x);
  const steps = [
    { size: 10.5, lead: 13, max: 4 },
    { size: 10, lead: 12, max: 5 },
    { size: 9, lead: 10.8, max: 6 },
  ];
  const parts = postalLines(address);
  let result = { size: 9, lead: 10.8, lines: [] as { text: string; bold: boolean }[] };
  for (const step of steps) {
    const nameLines = name?.trim() ? wrapText(name.trim(), fontBold, step.size, maxW).map((text) => ({ text, bold: true })) : [];
    const addrLines = parts.flatMap((p) => wrapText(p, font, step.size, maxW).map((text) => ({ text, bold: false })));
    const lines = [...nameLines, ...addrLines];
    result = { size: step.size, lead: step.lead, lines };
    if (lines.length <= step.max) return result;
  }
  // Still too long at the smallest size: the name stays (two lines at most)
  // and whole address lines go from the top (p.a., department…) until it
  // fits — the street and postcode + locality are always kept.
  const last = steps[steps.length - 1];
  const nameLines = (name?.trim() ? wrapText(name.trim(), fontBold, last.size, maxW) : []).slice(0, 2).map((text) => ({ text, bold: true }));
  let rest = parts.map((p) => wrapText(p, font, last.size, maxW).map((text) => ({ text, bold: false })));
  while (rest.length > 2 && nameLines.length + rest.flat().length > last.max) rest = rest.slice(1);
  result.lines = [...nameLines, ...rest.flat().slice(-(last.max - nameLines.length))];
  return result;
}

function softTint(c: RGB, amount: number): RGB {
  return rgb(c.red + (1 - c.red) * amount, c.green + (1 - c.green) * amount, c.blue + (1 - c.blue) * amount);
}

// Widest rendered width of a set of strings at a given size — the basis for
// every dynamically-sized column/box below. Sanitized first: widthOfTextAtSize
// on an unsanitized string containing e.g. a curly quote can throw or
// mis-measure against pdf-lib's WinAnsi-encoded standard fonts, the same
// reason drawText/drawTextRight always sanitize before drawing.
function measureMax(font: PDFFont, strings: string[], size: number, fallback = 0): number {
  return strings.reduce((max, s) => Math.max(max, font.widthOfTextAtSize(sanitizePdfText(s), size)), fallback);
}

// The four document models (Compte → Apparence), all built on the same
// skeleton so the client's address, the signatures and the QR-bill never
// move: 'classic' (the original), 'angle' (triangles in the top corner, a
// slanted total), 'prestige' (centred letterhead, serif title and total,
// fine double rules) and 'epure' (Swiss grid, hairlines, colour only on the
// top rule and the total). They keep the base_layout ids the database
// already allows: moderne = angle, structure = prestige, minimal = epure.
type Layout = 'classic' | 'angle' | 'prestige' | 'epure';
const DEFAULT_ACCENT_HEX = '#C9A46A';

// A filled polygon, points in PDF coordinates (origin bottom-left).
function fillPolygon(page: PDFPage, points: [number, number][], color: RGB) {
  const d = points.map(([x, y], i) => `${i ? 'L' : 'M'} ${x.toFixed(2)} ${(PAGE_HEIGHT - y).toFixed(2)}`).join(' ') + ' Z';
  page.drawSvgPath(d, { x: 0, y: PAGE_HEIGHT, color });
}

// Letter-spaced text (pdf-lib has no character spacing): returns its width.
function drawSpaced(page: PDFPage, text: string, x: number, y: number, f: PDFFont, size: number, color: RGB, spacing: number): number {
  let cx = x;
  for (const ch of sanitizePdfText(text)) {
    drawText(page, ch, cx, y, f, size, color);
    cx += f.widthOfTextAtSize(ch, size) + spacing;
  }
  return cx - x - spacing;
}

// « Échéance : 05.09.2026 » → ['Échéance', '05.09.2026'].
function splitMeta(line: string): [string, string] {
  const i = line.indexOf(' : ');
  if (i > 0) return [line.slice(0, i), line.slice(i + 3)];
  const j = line.indexOf(': '); // German and Italian: « Fällig am: … »
  return j > 0 ? [line.slice(0, j), line.slice(j + 2)] : ['', line];
}

function spacedWidth(text: string, f: PDFFont, size: number, spacing: number): number {
  const t = sanitizePdfText(text);
  return f.widthOfTextAtSize(t, size) + spacing * Math.max(0, t.length - 1);
}

function fitText(text: string, f: PDFFont, size: number, maxW: number): string {
  let t = sanitizePdfText(text);
  if (f.widthOfTextAtSize(t, size) <= maxW) return t;
  while (t.length > 1 && f.widthOfTextAtSize(t + '...', size) > maxW) t = t.slice(0, -1);
  return t + '...';
}

function renderUnified(ctx: RenderCtx, layout: Layout = 'classic'): RenderResult {
  const {
    pdfDoc,
    font,
    fontBold,
    org,
    devis,
    items,
    signatureImg,
    signatureLabel,
    showSignatures,
    clientSignatureImg,
    clientSignedAt,
    clientSignerName,
    logoImg,
    logoPlacement,
    brand,
    footerText,
    docLabel,
    docKind,
    metaLine,
    locale,
    paidSum,
  } = ctx;
  const accent = hexToRgb(org?.brand_accent_color || DEFAULT_ACCENT_HEX);
  const serif = layout === 'prestige' ? pdfDoc.embedStandardFont(StandardFonts.TimesRoman) : font;
  const serifItalic = layout === 'prestige' ? pdfDoc.embedStandardFont(StandardFonts.TimesRomanItalic) : font;
  // The QR-bill takes the bottom of a facture's last page: nothing is drawn
  // there on a facture (no bottom corner, no closed frame).
  const isFacture = docKind === 'facture';

  // Shapes of the model, on every page (the large ones on the first only).
  const decorate = (pg: PDFPage, first: boolean) => {
    if (layout === 'angle') {
      if (first) {
        fillPolygon(pg, [[PAGE_WIDTH - 68 * MM, PAGE_HEIGHT], [PAGE_WIDTH, PAGE_HEIGHT], [PAGE_WIDTH, PAGE_HEIGHT - 68 * MM]], brand);
        fillPolygon(pg, [[PAGE_WIDTH - 44 * MM, PAGE_HEIGHT], [PAGE_WIDTH, PAGE_HEIGHT], [PAGE_WIDTH, PAGE_HEIGHT - 44 * MM]], accent);
      }
      if (!isFacture) fillPolygon(pg, [[0, 0], [16 * MM, 0], [0, 16 * MM]], brand);
    } else if (layout === 'prestige') {
      // A hairline in the secondary colour above the footer (not on a
      // facture: the QR-bill takes the bottom of its last page).
      if (!isFacture) pg.drawLine({ start: { x: MARGIN, y: 40 }, end: { x: PAGE_WIDTH - MARGIN, y: 40 }, thickness: 0.5, color: accent });
    } else if (layout === 'epure') {
      pg.drawRectangle({ x: 0, y: PAGE_HEIGHT - 2.2 * MM, width: PAGE_WIDTH, height: 2.2 * MM, color: brand });
    }
  };

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  decorate(page, true);
  let y = PAGE_HEIGHT - MARGIN;
  let pageNum = 1;

  const newPage = () => {
    drawFooter(page, font, pageNum, footerText ?? org?.name ?? 'Cantia', locale);
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    decorate(page, false);
    pageNum += 1;
    y = PAGE_HEIGHT - MARGIN;
  };

  // Top of the page for the Angle, Prestige and Épuré models: logo (on the
  // left, or centred for Prestige; the corner belongs to the model's shapes), company, title,
  // document details, and the client's address at the envelope window's
  // place. Returns where the table starts.
  const drawModelTop = (): number => {
    const winAddr = org?.client_address_position === 'right';
    const addrX = winAddr ? windowAddressBox(org).x : 120 * MM;
    const addrTop = winAddr ? windowAddressBox(org).top : PAGE_HEIGHT - 61 * MM;
    const projectLine = devis.projects?.name ? pdfProjectLine(locale, org?.work_term, devis.projects.name) : null;
    const metas: [string, string][] = [[pdfT(locale, 'reference'), devis.number ?? '—'], [pdfT(locale, 'date'), formatDate(devis.created_at, locale)]];
    if (metaLine) metas.push(splitMeta(metaLine));
    else if (docKind === 'devis' && devis.valid_until) metas.push([pdfT(locale, 'validity'), formatDate(devis.valid_until, locale)]);
    if (projectLine) metas.push(splitMeta(projectLine));
    if (devis.client_reference?.trim()) metas.push([pdfT(locale, 'clientReference'), devis.client_reference.trim()]);

    // Logo.
    const top = PAGE_HEIGHT - 16 * MM;
    let logoBottom = top;
    if (logoImg) {
      const h = Math.min(40, (logoImg.height / logoImg.width) * 150);
      const w = (logoImg.width / logoImg.height) * h;
      page.drawImage(logoImg, { x: layout === 'prestige' ? (PAGE_WIDTH - w) / 2 : MARGIN, y: top - h, width: w, height: h });
      logoBottom = top - h;
    } else {
      const name = org?.name ?? pdfT(locale, 'entrepriseFallback');
      const nx = layout === 'prestige' ? (PAGE_WIDTH - fontBold.widthOfTextAtSize(sanitizePdfText(name), 16)) / 2 : MARGIN;
      drawText(page, name, nx, top - 16, fontBold, 16, brand);
      logoBottom = top - 20;
    }
    const street = org?.street || null;
    const town = [org?.postal_code, org?.locality].filter(Boolean).join(' ') || null;
    const addressLines = street || town ? [street, town].filter(Boolean) as string[] : [formatOrgAddress(org)].filter(Boolean) as string[];
    const contactLines = [org?.phone, org?.email, org?.website].filter(Boolean) as string[];
    const ide = org?.ide_number ? `IDE ${org.ide_number}${org?.vat_liable ? ' TVA' : ''}` : null;

    // Client's postal address (envelope window).
    const postal = fitPostalBlock(devis.client_name, devis.client_address, addrX, font, fontBold);
    let wy = addrTop - postal.size;
    for (const line of postal.lines) {
      drawText(page, line.text, addrX, wy, line.bold ? fontBold : font, postal.size, INK);
      wy -= postal.lead;
    }
    const clientBottom = wy + postal.lead - 4;

    if (layout === 'angle') {
      let ly = logoBottom - 16;
      for (const l of [addressLines.join(', '), contactLines.join(' · '), ide].filter(Boolean) as string[]) {
        drawText(page, fitText(l, font, 8.5, 92 * MM), MARGIN, ly, font, 8.5, MUTED);
        ly -= 11;
      }
      const titleBase = PAGE_HEIGHT - 61 * MM - 22;
      drawSpaced(page, docLabel.toUpperCase(), MARGIN, titleBase, font, 26, brand, 5);
      const bx = MARGIN, by = titleBase - 12;
      fillPolygon(page, [[bx + 6, by], [bx + 62, by], [bx + 56, by - 6], [bx, by - 6]], brand);
      const rowTop = Math.min(PAGE_HEIGHT - 98 * MM, clientBottom - 16, by - 26);
      const n = Math.min(5, metas.length);
      const gap = 16;
      const colW = (PAGE_WIDTH - 2 * MARGIN - gap * (n - 1)) / n;
      metas.slice(0, n).forEach(([k, v], i) => {
        const cx = MARGIN + i * (colW + gap);
        page.drawLine({ start: { x: cx, y: rowTop }, end: { x: cx + colW, y: rowTop }, thickness: 1.2, color: brand });
        drawSpaced(page, fitText(k.toUpperCase(), font, 7, colW - 10), cx, rowTop - 11, font, 7, MUTED, 0.8);
        drawText(page, fitText(v, fontBold, 9.5, colW), cx, rowTop - 24, fontBold, 9.5, INK);
      });
      return rowTop - 46;
    }

    if (layout === 'prestige') {
      // Coordinates on one centred line in spaced capitals, under the logo.
      const info = [addressLines.join(' · '), ...contactLines, ide].filter(Boolean).join(' · ').toUpperCase();
      let cs = 6.8, csp = 1.1;
      while (spacedWidth(info, font, cs, csp) > PAGE_WIDTH - 2 * MARGIN && cs > 5.6) { cs -= 0.3; csp = Math.max(0.3, csp - 0.2); }
      const iw = Math.min(spacedWidth(info, font, cs, csp), PAGE_WIDTH - 2 * MARGIN);
      drawSpaced(page, fitText(info, font, cs, PAGE_WIDTH - 2 * MARGIN), (PAGE_WIDTH - iw) / 2, logoBottom - 13, font, cs, MUTED, csp);
      // Double rule: main colour, then a fine secondary line.
      const ruleY = Math.min(PAGE_HEIGHT - 40 * MM, logoBottom - 24);
      page.drawLine({ start: { x: MARGIN, y: ruleY }, end: { x: PAGE_WIDTH - MARGIN, y: ruleY }, thickness: 1, color: brand });
      page.drawLine({ start: { x: MARGIN, y: ruleY - 3.4 }, end: { x: PAGE_WIDTH - MARGIN, y: ruleY - 3.4 }, thickness: 0.5, color: accent });
      const t0 = PAGE_HEIGHT - 61 * MM;
      drawSpaced(page, docLabel.toUpperCase(), MARGIN, t0 - 7, fontBold, 7.5, brand, 2.6);
      drawText(page, fitText(`N° ${devis.number ?? '—'}`, serif, 25, 95 * MM), MARGIN, t0 - 32, serif, 25, INK);
      let subY = t0 - 32;
      if (devis.projects?.name) {
        subY = t0 - 48;
        drawText(page, fitText(devis.projects.name, serifItalic, 12, 95 * MM), MARGIN, subY, serifItalic, 12, MUTED);
      }
      const rowTop = Math.min(PAGE_HEIGHT - 98 * MM, clientBottom - 16, subY - 22);
      const details = metas.slice(1, 5);
      const colW = (PAGE_WIDTH - 2 * MARGIN) / Math.max(1, details.length);
      details.forEach(([k, v], i) => {
        const cx = MARGIN + i * colW + (i ? 14 : 0);
        if (i) page.drawLine({ start: { x: MARGIN + i * colW, y: rowTop + 2 }, end: { x: MARGIN + i * colW, y: rowTop - 24 }, thickness: 0.5, color: accent });
        drawSpaced(page, fitText(k.toUpperCase(), font, 6.8, colW - 20), cx, rowTop - 7, font, 6.8, MUTED, 1);
        drawText(page, fitText(v, font, 9, colW - 20), cx, rowTop - 20, font, 9, INK);
      });
      return rowTop - 44;
    }

    // Épuré: company in two columns top right, title, a « details » row.
    const ix = 108 * MM;
    const colGap = 44 * MM;
    let iy = top - 8;
    const col1 = [org?.name ?? '', ...addressLines];
    col1.forEach((l, i) => drawText(page, fitText(l, i ? font : fontBold, 8, colGap - 8), ix, iy - i * 11, i ? font : fontBold, 8, i ? MUTED : INK));
    [...contactLines, ide].filter(Boolean).forEach((l, i) => drawText(page, fitText(l as string, font, 8, PAGE_WIDTH - MARGIN - ix - colGap), ix + colGap, iy - i * 11, font, 8, MUTED));
    const titleBase = PAGE_HEIGHT - 61 * MM - 26;
    drawText(page, docLabel, MARGIN, titleBase, font, 30, INK);
    drawText(page, `N° ${devis.number ?? '—'}`, MARGIN, titleBase - 18, font, 10, MUTED);
    const rowTop = Math.min(PAGE_HEIGHT - 96 * MM, clientBottom - 16, titleBase - 34);
    const labelX = MARGIN + 34 * MM;
    page.drawLine({ start: { x: MARGIN, y: rowTop }, end: { x: PAGE_WIDTH - MARGIN, y: rowTop }, thickness: 0.8, color: INK });
    drawText(page, pdfT(locale, 'details'), MARGIN, rowTop - 13, font, 8, MUTED);
    const details = metas.slice(1, 5);
    const dW = (PAGE_WIDTH - MARGIN - labelX) / Math.max(1, details.length);
    details.forEach(([k, v], i) => {
      drawText(page, fitText(k, font, 8.5, dW - 6), labelX + i * dW, rowTop - 13, font, 8.5, MUTED);
      drawText(page, fitText(v, font, 9.5, dW - 6), labelX + i * dW, rowTop - 26, font, 9.5, INK);
    });
    return rowTop - 50;
  };

  if (layout === 'classic') {
  // --- Header: logo + org identity. 'left' and 'right' sit inline with the
  // name/address/contact block (logo floats beside the text, same row) —
  // a stacked logo used to add ~60pt of pure vertical waste and looked
  // visually disconnected from the text, which also made a typical short
  // facture's QR-bill band miss fitting on the same page. 'center' can't
  // be inline (a centered logo and a centered text line both straddle the
  // page's mid-x and would draw on top of each other), so it keeps a
  // stacked layout — logo centered on its own row, then every text line
  // centered below it — just with a much tighter gap than before. With no
  // logo, text always stays left-aligned exactly as if placement were unset.
  const placement = logoPlacement ?? 'right';
  let textX = MARGIN;
  const centerText = placement === 'center' && !!logoImg;
  if (logoImg) {
    const maxW = 130;
    const naturalH = (logoImg.height / logoImg.width) * maxW;
    const h = Math.min(46, naturalH);
    const w = (logoImg.width / logoImg.height) * h;
    if (placement === 'left') {
      page.drawImage(logoImg, { x: MARGIN, y: y - h + 12, width: w, height: h });
      textX = MARGIN + w + 16;
    } else if (placement === 'center') {
      page.drawImage(logoImg, { x: logoX('center', PAGE_WIDTH, MARGIN, w), y: y - h, width: w, height: h });
      y -= h + 18; // clears the ~12pt ascender of the 17pt name text drawn right after
    } else {
      page.drawImage(logoImg, { x: logoX(placement, PAGE_WIDTH, MARGIN, w), y: y - h + 12, width: w, height: h });
    }
  }
  const drawHeaderLine = (text: string, size: number, lineFont: PDFFont, color: RGB) => {
    if (centerText) {
      const w = lineFont.widthOfTextAtSize(sanitizePdfText(text), size);
      drawText(page, text, (PAGE_WIDTH - w) / 2, y, lineFont, size, color);
    } else {
      drawText(page, text, textX, y, lineFont, size, color);
    }
  };

  drawHeaderLine(org?.name ?? pdfT(locale, 'entrepriseFallback'), 17, fontBold, brand);
  y -= 16;
  const orgLine = [formatOrgAddress(org), org?.ide_number ? `IDE ${org.ide_number}` : null].filter(Boolean).join(' · ');
  if (orgLine) {
    drawHeaderLine(orgLine, 9, font, MUTED);
    y -= 12;
  }
  const contactLine = [org?.phone, org?.email, org?.website].filter(Boolean).join(' · ');
  if (contactLine) {
    drawHeaderLine(contactLine, 9, font, MUTED);
    y -= 12;
  }
  y -= 12;
  // With the address in the envelope window, the rule stops short of the
  // window: a line showing through it would cross the address.
  const ruleInWindow = org?.client_address_position === 'right' && y < PAGE_HEIGHT - (WINDOW_ZONE_TOP_MM - 4) * MM;
  const ruleEnd = ruleInWindow ? WINDOW_ZONE_LEFT_MM * MM - 6 : PAGE_WIDTH - MARGIN;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: ruleEnd, y }, thickness: 1, color: LINE });
  y -= 24;

  // --- Reference box rows (number, date, due date / validity, client's
  // reference; on a letter layout also the chantier).
  const windowAddress = org?.client_address_position === 'right';
  const win = windowAddress ? windowAddressBox(org) : null;
  const projectLine = devis.projects?.name ? pdfProjectLine(locale, org?.work_term, devis.projects.name) : null;
  const boxRows: string[] = [
    `${pdfT(locale, 'reference')} : ${devis.number ?? '—'}`,
    `${pdfT(locale, 'date')} : ${formatDate(devis.created_at, locale)}`,
  ];
  if (metaLine) {
    boxRows.push(metaLine);
  } else if (docKind === 'devis' && devis.valid_until) {
    boxRows.push(`${pdfT(locale, 'validity')} : ${formatDate(devis.valid_until, locale)}`);
  }
  if (win && projectLine) boxRows.push(projectLine);
  if (devis.client_reference?.trim()) boxRows.push(`${pdfT(locale, 'clientReference')} : ${devis.client_reference.trim()}`);
  const boxRowH = 13;
  const boxPadV = 7;
  const boxPadL = 16;
  // On a letter layout the box must end before the window's visible zone
  // (~100 mm from the left), or its text would show through the window.
  const boxMaxW = win ? WINDOW_ZONE_LEFT_MM * MM - MARGIN - 6 : 320;
  const boxW = Math.min(boxMaxW, Math.max(Math.min(220, boxMaxW), measureMax(font, boxRows, 10) + boxPadL + 16));
  // A row too long for the box (a long client reference) goes on two lines.
  const fitted = boxRows.flatMap((row) => wrapText(row, font, 9.5, boxW - boxPadL - 8));
  const boxH = fitted.length * boxRowH + boxPadV * 2;
  const drawBox = (top: number) => {
    page.drawRectangle({ x: MARGIN, y: top - boxH, width: boxW, height: boxH, color: softTint(brand, 0.93) });
    page.drawRectangle({ x: MARGIN, y: top - boxH, width: 3, height: boxH, color: brand });
    let rowY = top - boxPadV - 9;
    for (const row of fitted) {
      drawText(page, row, MARGIN + boxPadL, rowY, font, 9.5, INK);
      rowY -= boxRowH;
    }
    return top - boxH;
  };

  if (win) {
    // --- Letter layout (address in the envelope window): the document
    // title under the header, then the client's name and postal address
    // alone at the window's place with the reference box on the left at
    // the same height, first lines aligned; the table below both.
    drawText(page, docLabel.toUpperCase(), MARGIN, y, fontBold, 20, brand);
    y -= 22;
    const postal = fitPostalBlock(devis.client_name, devis.client_address, win.x, font, fontBold);
    const firstBaseline = win.top - postal.size;
    let wy = firstBaseline;
    for (const line of postal.lines) {
      drawText(page, line.text, win.x, wy, line.bold ? fontBold : font, postal.size, INK);
      wy -= postal.lead;
    }
    // (Lower only if a tall header — centred logo — reaches that far.)
    const boxBottom = drawBox(Math.min(y, firstBaseline + 9 + boxPadV));
    const blockBottom = Math.min(boxBottom, wy + postal.lead - 4, PAGE_HEIGHT - WINDOW_ZONE_BOTTOM_MM * MM);
    y = Math.min(y, blockBottom) - 24;
  } else {
    // --- Classic layout: title, reference box, then the client block.
    drawText(page, docLabel.toUpperCase(), MARGIN, y, fontBold, 20, brand);
    y -= 22;
    y = drawBox(y) - 18;
    const clientLines = [devis.client_name, devis.client_address, devis.client_email, projectLine].filter(Boolean) as string[];
    drawText(page, pdfT(locale, 'client'), MARGIN, y, fontBold, 9, MUTED);
    y -= 14;
    for (const line of clientLines) {
      drawText(page, line, MARGIN, y, font, 10.5, INK);
      y -= 14;
    }
    y -= 10;
  }
  } else {
    y = drawModelTop();
  }

  // --- Totals math, computed up front (needed both to size the amount
  // columns below and to draw the totals block later). A deposit already
  // invoiced against this devis shows up as its own negative facture_items
  // row (sort_order 9999, see convert_devis_to_facture) — pulled out of the
  // visible item table and shown as its own "Acompte(s) déjà facturé(s)"
  // line instead, without changing the underlying subtotal/VAT/total math
  // at all (it's still included in allSubtotal exactly as before).
  const isDepositDeduction = (item: any) => Number(item.sort_order) === 9999 && Number(item.unit_price) < 0;
  const visibleItems = items.filter((item) => !isDepositDeduction(item));
  const depositItems = items.filter(isDepositDeduction);

  const allSubtotal = items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unit_price), 0);
  const visibleSubtotal = visibleItems.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unit_price), 0);
  const depositTotal = depositItems.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unit_price), 0);
  const vat = allSubtotal * (Number(devis.vat_rate) / 100);
  const total = swissRound(allSubtotal + vat);
  const hasPaidSum = typeof paidSum === 'number' && paidSum > 0;
  const netToPay = hasPaidSum ? swissRound(Math.max(0, total - (paidSum as number))) : null;

  // --- Line-items table — amount column widths are measured against the
  // actual strings this document will print, not a fixed guess, so large
  // totals (CHF 1'000'000+) get the room they need instead of overlapping.
  const amountSamples = [
    ...visibleItems.map((item) => chf(Number(item.quantity) * Number(item.unit_price))),
    ...visibleItems.map((item) => chf(Number(item.unit_price))),
    chf(visibleSubtotal),
    chf(vat),
    chf(total),
  ];
  const qtyStrings = visibleItems.map((item) => String(item.quantity));
  const unitStrings = visibleItems.map((item) => item.unit ?? pdfT(locale, 'unitFallback'));

  const tableRight = PAGE_WIDTH - MARGIN;
  // Épuré keeps a label column on the left; Plan numbers its positions.
  const tableLeft = layout === 'epure' ? MARGIN + 34 * MM : MARGIN;
  const posW = 0;
  const gutter = 12;
  const totalW = Math.max(60, measureMax(fontBold, amountSamples, 10));
  const priceW = Math.max(55, measureMax(font, amountSamples, 10));
  const unitW = Math.max(26, measureMax(font, unitStrings, 10));
  const qtyW = Math.max(22, measureMax(font, qtyStrings, 10));

  const colRight = {
    qty: tableRight - priceW - gutter - totalW - gutter - unitW - gutter,
    unit: tableRight - priceW - gutter - totalW - gutter,
    price: tableRight - totalW - gutter,
    total: tableRight,
  };
  const colX = {
    desc: tableLeft + posW,
    qty: colRight.qty - qtyW,
  };
  const descWidth = colX.qty - gutter - colX.desc;
  const descPad = layout === 'epure' || layout === 'prestige' ? 0 : 8;

  const headerH = 22;
  let servicesLabelDrawn = false;
  const drawTableHeader = () => {
    const top = y;
    const filled = layout === 'classic';
    if (filled) page.drawRectangle({ x: tableLeft, y: top - headerH, width: tableRight - tableLeft, height: headerH, color: brand });
    if (layout === 'angle') page.drawLine({ start: { x: tableLeft, y: top - headerH }, end: { x: tableRight, y: top - headerH }, thickness: 1.6, color: brand });
    if (layout === 'prestige') page.drawLine({ start: { x: tableLeft, y: top - headerH }, end: { x: tableRight, y: top - headerH }, thickness: 0.8, color: brand });
    if (layout === 'epure' && !servicesLabelDrawn) {
      page.drawLine({ start: { x: MARGIN, y: top + 4 }, end: { x: tableRight, y: top + 4 }, thickness: 0.8, color: INK });
      drawText(page, pdfT(locale, 'services'), MARGIN, top - headerH + 7, font, 8, MUTED);
      servicesLabelDrawn = true;
    }
    const headTextColor = filled ? pickReadableTextColor(brand) : layout === 'angle' ? brand : MUTED;
    const endPadH = layout === 'epure' || layout === 'prestige' ? 0 : 8;
    const hf = layout === 'epure' || layout === 'prestige' ? font : fontBold;
    const hs = layout === 'classic' ? 9 : layout === 'prestige' ? 6.8 : 7.8;
    const up = (k: string) => (layout === 'angle' || layout === 'prestige' ? pdfT(locale, k).toUpperCase() : pdfT(locale, k));
    const midY = top - headerH + 7;
    drawText(page, up('description'), colX.desc + descPad, midY, hf, hs, headTextColor);
    drawTextRight(page, up('quantity'), colRight.qty, midY, hf, hs, headTextColor);
    drawTextRight(page, up('unit'), colRight.unit, midY, hf, hs, headTextColor);
    drawTextRight(page, up('price'), colRight.price, midY, hf, hs, headTextColor);
    drawTextRight(page, up('total'), colRight.total - endPadH, midY, hf, hs, headTextColor);
    y = top - headerH - 4;
  };

  drawTableHeader();

  visibleItems.forEach((item, idx) => {
    const lineTotal = Number(item.quantity) * Number(item.unit_price);
    const descLines = wrapText(item.description, font, 10, descWidth - 8);
    const rowH = Math.max(24, descLines.length * 13 + 12);
    if (y - rowH < MARGIN + 130) {
      newPage();
      drawTableHeader();
    }
    const rowTop = y;
    if (layout === 'classic' && idx % 2 === 1) {
      page.drawRectangle({ x: tableLeft, y: rowTop - rowH, width: tableRight - tableLeft, height: rowH, color: softTint(brand, 0.96) });
    }
    let lineY = rowTop - 15;
    for (const line of descLines) {
      drawText(page, line, colX.desc + descPad, lineY, font, 10, INK);
      lineY -= 13;
    }
    const endPad = layout === 'epure' || layout === 'prestige' ? 0 : 8;
    drawTextRight(page, String(item.quantity), colRight.qty, rowTop - 15, font, 10, INK);
    drawTextRight(page, item.unit ?? pdfT(locale, 'unitFallback'), colRight.unit, rowTop - 15, font, 10, INK);
    drawTextRight(page, chf(Number(item.unit_price)), colRight.price, rowTop - 15, font, 10, INK);
    drawTextRight(page, chf(lineTotal), colRight.total - endPad, rowTop - 15, layout === 'epure' || layout === 'prestige' ? font : fontBold, 10, INK);
    page.drawLine({ start: { x: tableLeft, y: rowTop - rowH }, end: { x: tableRight, y: rowTop - rowH }, thickness: layout === 'prestige' ? 0.4 : 0.5, color: LINE });
    y = rowTop - rowH;
  });

  y -= 14;
  if (y < MARGIN + 150) newPage();

  // --- Totals block: plain rows for the running math, a boxed brand-tinted
  // highlight for TOTAL TTC and — only when this facture has recorded
  // payments — a second one for NET À PAYER.
  const totalsLabelSamples = [
    pdfT(locale, 'subtotal'),
    pdfT(locale, 'vat', { rate: devis.vat_rate }),
    pdfT(locale, 'totalIncl'),
    pdfT(locale, 'depositsDeducted'),
    pdfT(locale, 'alreadyPaid'),
    pdfT(locale, 'netToPay'),
  ];
  const totalsValueSamples = [chf(visibleSubtotal), chf(vat), chf(total)];
  if (depositTotal) totalsValueSamples.push(chf(depositTotal));
  if (hasPaidSum) totalsValueSamples.push(chf(-(paidSum as number)));
  if (netToPay != null) totalsValueSamples.push(chf(netToPay));
  const totalsLabelW = measureMax(font, totalsLabelSamples, 10.5);
  const totalsValueW = Math.max(measureMax(fontBold, totalsValueSamples, 12, 60), layout === 'prestige' ? measureMax(serif, totalsValueSamples, 18, 60) : 0);
  const totalsBoxW = Math.max(220, totalsLabelW + totalsValueW + 30);
  const totalsRight = PAGE_WIDTH - MARGIN;
  const totalsLeft = totalsRight - totalsBoxW;

  const plainRow = (label: string, value: string) => {
    const muted = layout !== 'classic';
    drawText(page, label, totalsLeft, y, font, 10.5, muted ? MUTED : INK);
    drawTextRight(page, value, totalsRight, y, font, 10.5, INK);
    y -= 15;
  };
  const boxedRow = (label: string, value: string) => {
    if (layout === 'angle') {
      const h = 26;
      const top = y + 8;
      fillPolygon(page, [[totalsLeft + 16, top], [totalsRight, top], [totalsRight, top - h], [totalsLeft, top - h]], brand);
      const tc = pickReadableTextColor(brand);
      drawText(page, label, totalsLeft + 26, top - 17, fontBold, 10.5, tc);
      drawTextRight(page, value, totalsRight - 10, top - 17.5, fontBold, 13, tc);
      y -= h + 8;
      return;
    }
    if (layout === 'prestige') {
      y -= 2;
      page.drawLine({ start: { x: totalsLeft, y: y + 11 }, end: { x: totalsRight, y: y + 11 }, thickness: 1, color: brand });
      page.drawLine({ start: { x: totalsLeft, y: y + 7.6 }, end: { x: totalsRight, y: y + 7.6 }, thickness: 0.5, color: accent });
      drawSpaced(page, label.toUpperCase(), totalsLeft, y - 9, fontBold, 7.5, brand, 1.8);
      drawTextRight(page, value, totalsRight, y - 11, serif, 18, brand);
      y -= 34;
      return;
    }
    if (layout === 'epure') {
      y -= 2;
      page.drawLine({ start: { x: totalsLeft, y: y + 11 }, end: { x: totalsRight, y: y + 11 }, thickness: 1, color: brand });
      drawText(page, label, totalsLeft, y - 6, fontBold, 10.5, brand);
      drawTextRight(page, value, totalsRight, y - 7, fontBold, 15, brand);
      y -= 30;
      return;
    }
    const h = 23;
    const fill = softTint(brand, 0.9);
    page.drawRectangle({ x: totalsLeft, y: y - h + 6, width: totalsBoxW, height: h, color: fill, borderColor: brand, borderWidth: 1 });
    const textColor = pickReadableTextColor(fill);
    drawText(page, label, totalsLeft + 10, y - h + 15, fontBold, 11, textColor);
    drawTextRight(page, value, totalsRight - 10, y - h + 15, fontBold, 12, textColor);
    y -= h + 7;
  };

  plainRow(pdfT(locale, 'subtotal'), chf(visibleSubtotal));
  if (depositTotal) plainRow(pdfT(locale, 'depositsDeducted'), chf(depositTotal));
  // A company that isn't VAT-registered (rate 0) shows no VAT line and a
  // plain "Total" — no "TTC" (lib/vat/vatStatus.ts).
  const hasVat = Number(devis.vat_rate) > 0;
  if (hasVat) plainRow(pdfT(locale, 'vat', { rate: devis.vat_rate }), chf(vat));
  boxedRow(pdfT(locale, hasVat ? 'totalIncl' : 'total'), chf(total));
  if (netToPay != null) {
    plainRow(pdfT(locale, 'alreadyPaid'), chf(-(paidSum as number)));
    boxedRow(pdfT(locale, 'netToPay'), chf(netToPay));
  }
  y -= 6;

  // --- Per-document remark (devis.notes/factures.notes) — free text the
  // creator typed in for this specific document, e.g. "Merci d'installer
  // l'échafaudage avant notre passage." Printed below the totals, ahead of
  // the org-wide terms, so it reads as this document's own note rather than
  // a fixed legal mention.
  if (devis.notes?.trim()) {
    if (y < MARGIN + 90) newPage();
    if (layout === 'epure') {
      page.drawLine({ start: { x: MARGIN, y: y + 10 }, end: { x: PAGE_WIDTH - MARGIN, y: y + 10 }, thickness: 0.8, color: INK });
      drawText(page, pdfT(locale, 'remarkLabel'), MARGIN, y - 4, font, 8, MUTED);
      y -= 4;
      for (const line of wrapText(devis.notes, font, 9.5, PAGE_WIDTH - MARGIN - tableLeft)) {
        drawText(page, line, tableLeft, y, font, 9.5, INK);
        y -= 12;
      }
    } else {
      drawText(page, pdfT(locale, 'remarkLabel'), MARGIN, y, fontBold, 9, layout === 'angle' ? brand : MUTED);
      y -= 13;
      const rf = layout === 'prestige' ? serifItalic : font;
      const rs = layout === 'prestige' ? 11 : 9.5;
      const remarkLines = wrapText(devis.notes, rf, rs, PAGE_WIDTH - 2 * MARGIN);
      for (const line of remarkLines) {
        drawText(page, line, MARGIN, y, rf, rs, layout === 'prestige' ? MUTED : INK);
        y -= rs + 2.5;
      }
    }
    y -= 8;
  }

  y = drawTerms(page, font, org, y, docKind, locale);

  if (showSignatures) {
    const h = 50;
    const creatorW = signatureImg ? (signatureImg.width / signatureImg.height) * h : 150;
    const clientW = clientSignatureImg ? (clientSignatureImg.width / clientSignatureImg.height) * h : 150;
    const gap = 30;
    const totalW2 = creatorW + gap + clientW;
    if (y < MARGIN + 100) newPage();
    const startX = PAGE_WIDTH - MARGIN - totalW2;

    drawText(page, signatureLabel, startX, y, font, 9, MUTED);
    if (signatureImg) {
      page.drawImage(signatureImg, { x: startX, y: y - h - 10, width: creatorW, height: h });
    } else {
      page.drawLine({ start: { x: startX, y: y - h - 10 }, end: { x: startX + creatorW, y: y - h - 10 }, thickness: 1, color: LINE });
    }

    const clientX = startX + creatorW + gap;
    if (clientSignatureImg && clientSignedAt) {
      // Real proof of an online acceptance: the client's own drawn
      // signature plus the exact moment it was captured, both baked
      // directly into the document instead of a blank line waiting to be
      // signed by hand.
      const clientLabel = clientSignerName
        ? pdfT(locale, 'signedBy', { name: clientSignerName })
        : pdfT(locale, 'clientSignature');
      drawText(page, clientLabel, clientX, y, font, 9, MUTED);
      page.drawImage(clientSignatureImg, { x: clientX, y: y - h - 10, width: clientW, height: h });
      drawText(page, pdfT(locale, 'signedOn', { date: formatDateTime(clientSignedAt, locale) }), clientX, y - h - 22, font, 7.5, MUTED);
    } else {
      const clientSignatureLabel = devis.client_name
        ? pdfT(locale, 'signatureOf', { name: devis.client_name })
        : pdfT(locale, 'clientSignature');
      drawText(page, clientSignatureLabel, clientX, y, font, 9, MUTED);
      page.drawLine({ start: { x: clientX, y: y - h - 10 }, end: { x: clientX + clientW, y: y - h - 10 }, thickness: 1, color: LINE });
    }
  }

  return { page, y, pageNum };
}

export const RENDERERS: Record<TemplateId, (ctx: RenderCtx) => RenderResult> = {
  classic: (ctx) => renderUnified(ctx, 'classic'),
  moderne: (ctx) => renderUnified(ctx, 'angle'),
  structure: (ctx) => renderUnified(ctx, 'prestige'),
  minimal: (ctx) => renderUnified(ctx, 'epure'),
};

// For a devis/facture: no more auto-generated "valable X jours" / "Prix en
// francs suisses (CHF)" / "Merci de régler avant l'échéance" boilerplate —
// the reference box right above already states the validity date or the
// échéance, and every printed amount already carries "CHF", so repeating
// either here was pure redundancy. The only thing drawn now is the org's
// own optional custom terms (compte > devis > "Conditions particulières",
// org.devis_terms) — genuinely optional, and only printed if actually set,
// so a document with none of that configured ends right after the totals
// instead of leaving a boilerplate line. extra_work keeps its own fixed
// notice (a signed extra-work order needs the "accepted and signed"
// wording spelled out — it isn't shown anywhere else on the document).
function drawTerms(page: PDFPage, font: PDFFont, org: any, y: number, docKind: 'devis' | 'facture' | 'extra_work', locale: PdfLocale): number {
  const text =
    docKind === 'extra_work'
      ? `${org?.devis_terms?.trim() ? org.devis_terms.trim() + ' ' : ''}${pdfT(locale, 'extraWorkAccepted')}`
      : org?.devis_terms?.trim() || null;
  if (!text) return y;
  const termsLines = wrapText(text, font, 8.5, PAGE_WIDTH - 2 * MARGIN);
  let cursor = y;
  for (const line of termsLines) {
    drawText(page, line, MARGIN, cursor, font, 8.5, MUTED);
    cursor -= 11;
  }
  return cursor - 8;
}
