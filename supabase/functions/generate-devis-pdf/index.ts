import { createClient } from 'npm:@supabase/supabase-js@2';
import { PDFDocument, PDFFont, PDFImage, PDFPage, RGB, StandardFonts, rgb } from 'npm:pdf-lib@1.17.1';
import {
  ACCENT,
  INK,
  LINE,
  MARGIN,
  MUTED,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  PAPER_ALT,
  WHITE,
  drawFooter,
  drawText,
  drawTextRight,
  embedImageSmart,
  fetchStorageBytes,
  formatChf,
  formatDate,
  logoX,
  pickReadableTextColor,
  resolveBrand,
  resolveFooterText,
  resolveLogoPlacement,
  resolvePdfTemplate,
  wrapText,
  type LogoPlacement,
} from '../_shared/pdf-helpers.ts';
import { drawCustomLayout } from '../_shared/pdf-blocks.ts';
import { appendQrBillPage, isValidSwissIban } from '../_shared/qrbill.ts';

const BUCKET = 'opus-storage';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const chf = formatChf;

interface RenderCtx {
  pdfDoc: PDFDocument;
  font: PDFFont;
  fontBold: PDFFont;
  org: any;
  devis: any;
  items: any[];
  logoImg: PDFImage | null;
  signatureImg: PDFImage | null;
  brand: RGB;
  textOnBrand: RGB;
  logoPlacement: LogoPlacement;
  footerText: string | null;
}

type TemplateId = 'classic' | 'moderne' | 'minimal' | 'structure';

// ---------------------------------------------------------------------------
// Template: classic — sober header, thin rules, understated (default)
// ---------------------------------------------------------------------------
function renderClassic(ctx: RenderCtx): Uint8Array | Promise<Uint8Array> {
  const { pdfDoc, font, fontBold, org, devis, items, logoImg, signatureImg, brand, logoPlacement, footerText } = ctx;
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;
  let pageNum = 1;

  const newPage = () => {
    drawFooter(page, font, pageNum, footerText ?? 'Généré via Cantia');
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pageNum += 1;
    y = PAGE_HEIGHT - MARGIN;
  };

  if (logoImg) {
    const h = 46;
    const w = (logoImg.width / logoImg.height) * h;
    // 'left'/'center' logos share the text column below them — only
    // 'right' is naturally clear of it, so only that placement keeps the
    // side-by-side look; left/center get their own row above the text.
    if (logoPlacement === 'right') {
      page.drawImage(logoImg, { x: logoX(logoPlacement, PAGE_WIDTH, MARGIN, w), y: y - h + 10, width: w, height: h });
    } else {
      page.drawImage(logoImg, { x: logoX(logoPlacement, PAGE_WIDTH, MARGIN, w), y: y - h, width: w, height: h });
      y -= h + 12;
    }
  }

  drawText(page, org?.name ?? 'Entreprise', MARGIN, y, fontBold, 17, brand);
  y -= 16;
  const orgLine = [org?.address, org?.ide_number ? `IDE ${org.ide_number}` : null].filter(Boolean).join(' · ');
  if (orgLine) {
    drawText(page, orgLine, MARGIN, y, font, 9, MUTED);
    y -= 12;
  }
  const contactLine = [org?.phone, org?.email, org?.website].filter(Boolean).join(' · ');
  if (contactLine) {
    drawText(page, contactLine, MARGIN, y, font, 9, MUTED);
    y -= 12;
  }
  y -= 16;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 1, color: LINE });
  y -= 28;

  drawText(page, `Devis ${devis.number ?? ''}`, MARGIN, y, fontBold, 16, ACCENT);
  drawTextRight(page, formatDate(devis.created_at), PAGE_WIDTH - MARGIN, y, font, 10, MUTED);
  y -= 22;

  const clientLines = [
    devis.client_name,
    devis.client_address,
    devis.client_email,
    devis.projects?.name ? `Chantier : ${devis.projects.name}` : null,
  ].filter(Boolean) as string[];
  drawText(page, 'Client', MARGIN, y, fontBold, 10, MUTED);
  y -= 14;
  for (const line of clientLines) {
    drawText(page, line, MARGIN, y, font, 10.5, INK);
    y -= 14;
  }
  y -= 16;

  if (devis.notes?.trim()) {
    const lines = wrapText(devis.notes, font, 9.5, PAGE_WIDTH - 2 * MARGIN);
    for (const line of lines) {
      drawText(page, line, MARGIN, y, font, 9.5, MUTED);
      y -= 12;
    }
    y -= 12;
  }

  // Price/Total need real room: a 6-digit CHF amount ("999 999.95 CHF") is
  // ~85pt wide at this font size, so those two columns get ~90-100pt each
  // instead of the old fixed 50-70pt gaps that amounts routinely outgrew.
  const colX = { desc: MARGIN, qty: 300, unit: 335, price: 375, total: 463 };
  const tableRight = PAGE_WIDTH - MARGIN;
  // Numeric columns are right-aligned to the next column's start (minus a
  // gap) rather than left-aligned at their own x — a fixed left-aligned
  // start let long CHF amounts (thousands separator, 4+ digits) run into
  // the next column, e.g. "1'156.50 CHF" colliding with "Total". Right-
  // aligning keeps every amount, however wide, inside its own column.
  const colRight = { qty: colX.unit - 10, unit: colX.price - 10, price: colX.total - 10, total: tableRight };

  const drawTableHeader = () => {
    drawText(page, 'Description', colX.desc, y, fontBold, 9.5, MUTED);
    drawTextRight(page, 'Qté', colRight.qty, y, fontBold, 9.5, MUTED);
    drawTextRight(page, 'Unité', colRight.unit, y, fontBold, 9.5, MUTED);
    drawTextRight(page, 'Prix', colRight.price, y, fontBold, 9.5, MUTED);
    drawTextRight(page, 'Total', colRight.total, y, fontBold, 9.5, MUTED);
    y -= 8;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: tableRight, y }, thickness: 1, color: LINE });
    y -= 16;
  };

  drawTableHeader();

  let subtotal = 0;
  for (const item of items) {
    const lineTotal = Number(item.quantity) * Number(item.unit_price);
    subtotal += lineTotal;

    const descLines = wrapText(item.description, font, 10, colX.qty - colX.desc - 10);
    if (y - descLines.length * 13 < MARGIN + 120) {
      newPage();
      drawTableHeader();
    }
    const rowTop = y;
    for (const line of descLines) {
      drawText(page, line, colX.desc, y, font, 10, INK);
      y -= 13;
    }
    drawTextRight(page, String(item.quantity), colRight.qty, rowTop, font, 10, INK);
    drawTextRight(page, item.unit ?? 'pce', colRight.unit, rowTop, font, 10, INK);
    drawTextRight(page, chf(Number(item.unit_price)), colRight.price, rowTop, font, 10, INK);
    drawTextRight(page, chf(lineTotal), colRight.total, rowTop, font, 10, INK);
    y -= 6;
  }

  y -= 6;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: tableRight, y }, thickness: 1, color: LINE });
  y -= 20;

  if (y < MARGIN + 100) newPage();

  const vat = subtotal * (Number(devis.vat_rate) / 100);
  const total = subtotal + vat;

  drawTotalsLine(page, font, y, 'Sous-total', chf(subtotal));
  y -= 15;
  drawTotalsLine(page, font, y, `TVA (${devis.vat_rate}%)`, chf(vat));
  y -= 15;
  drawTotalsLine(page, fontBold, y, 'Total TTC', chf(total), 12);
  y -= 30;

  y = drawTerms(page, font, org, y);

  if (signatureImg) {
    if (y < MARGIN + 90) newPage();
    const h = 50;
    const w = (signatureImg.width / signatureImg.height) * h;
    drawText(page, 'Signature', PAGE_WIDTH - MARGIN - w, y, font, 9, MUTED);
    page.drawImage(signatureImg, { x: PAGE_WIDTH - MARGIN - w, y: y - h - 10, width: w, height: h });
  }

  drawFooter(page, font, pageNum, footerText ?? 'Généré via Cantia');
  return pdfDoc.save();
}

// ---------------------------------------------------------------------------
// Template: moderne — bold pine-green header band, big white title
// ---------------------------------------------------------------------------
function renderModerne(ctx: RenderCtx): Uint8Array | Promise<Uint8Array> {
  const { pdfDoc, font, fontBold, org, devis, items, logoImg, signatureImg, brand, textOnBrand, logoPlacement, footerText } = ctx;
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let pageNum = 1;

  const BAND_H = 118;
  // Same fix as the classic template: a 'left'/'center' logo shares the
  // band's left-anchored text column, so its fixed-offset badge used to sit
  // on top of "DEVIS N°...". Only 'right' stays clear of that text; for
  // left/center the band grows taller and the logo gets its own row above
  // the text instead.
  const stackLogo = Boolean(logoImg) && logoPlacement !== 'right';
  const shift = stackLogo ? 44 : 0;
  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - BAND_H - shift, width: PAGE_WIDTH, height: BAND_H + shift, color: brand });

  if (logoImg) {
    const h = 40;
    const w = (logoImg.width / logoImg.height) * h;
    const lx = logoX(logoPlacement, PAGE_WIDTH, MARGIN, w);
    const badgeY = stackLogo ? PAGE_HEIGHT - 66 : PAGE_HEIGHT - BAND_H + 20;
    const imgY = stackLogo ? PAGE_HEIGHT - 59 : PAGE_HEIGHT - BAND_H + 27;
    page.drawRectangle({ x: lx - 7, y: badgeY, width: w + 14, height: h + 14, color: WHITE });
    page.drawImage(logoImg, { x: lx, y: imgY, width: w, height: h });
  }

  drawText(page, org?.name ?? 'Entreprise', MARGIN, PAGE_HEIGHT - shift - 40, fontBold, 15, textOnBrand);
  const orgLine = [org?.address, org?.phone, org?.email].filter(Boolean).join(' · ');
  if (orgLine) drawText(page, orgLine, MARGIN, PAGE_HEIGHT - shift - 56, font, 9, rgb(0.85, 0.89, 0.87));
  drawText(page, `DEVIS ${devis.number ?? ''}`, MARGIN, PAGE_HEIGHT - shift - 92, fontBold, 22, textOnBrand);
  drawText(page, formatDate(devis.created_at), MARGIN, PAGE_HEIGHT - shift - 108, font, 9.5, rgb(0.85, 0.89, 0.87));

  let y = PAGE_HEIGHT - BAND_H - shift - 34;

  const newPage = () => {
    drawFooter(page, font, pageNum, footerText ?? org?.name ?? 'Cantia');
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pageNum += 1;
    y = PAGE_HEIGHT - MARGIN;
  };

  // The accent bar sits to the left of an indented text column instead of
  // sharing the text's x position — drawn at the same x as the text, it
  // used to cut straight through the "D" of "DESTINATAIRE".
  const clientTextX = MARGIN + 12;
  const clientBoxTop = y;
  const clientLines = [
    devis.client_name,
    devis.client_address,
    devis.client_email,
    devis.projects?.name ? `Chantier : ${devis.projects.name}` : null,
  ].filter(Boolean) as string[];
  drawText(page, 'DESTINATAIRE', clientTextX, y, fontBold, 8.5, ACCENT);
  y -= 15;
  for (const line of clientLines) {
    drawText(page, line, clientTextX, y, font, 10.5, INK);
    y -= 14;
  }
  page.drawLine({ start: { x: MARGIN, y: clientBoxTop + 6 }, end: { x: MARGIN, y: y + 6 }, thickness: 2, color: ACCENT });
  y -= 12;

  if (devis.notes?.trim()) {
    const lines = wrapText(devis.notes, font, 9.5, PAGE_WIDTH - 2 * MARGIN);
    for (const line of lines) {
      drawText(page, line, MARGIN, y, font, 9.5, MUTED);
      y -= 12;
    }
    y -= 10;
  }

  const colX = { desc: MARGIN, qty: 300, unit: 335, price: 375, total: 463 };
  const tableRight = PAGE_WIDTH - MARGIN;
  const colRight = { qty: colX.unit - 10, unit: colX.price - 10, price: colX.total - 10, total: tableRight };

  const drawTableHeader = () => {
    page.drawRectangle({ x: MARGIN - 6, y: y - 4, width: tableRight - MARGIN + 12, height: 20, color: PAPER_ALT });
    drawText(page, 'DESCRIPTION', colX.desc, y, fontBold, 8.5, brand);
    drawTextRight(page, 'QTÉ', colRight.qty, y, fontBold, 8.5, brand);
    drawTextRight(page, 'UNITÉ', colRight.unit, y, fontBold, 8.5, brand);
    drawTextRight(page, 'PRIX', colRight.price, y, fontBold, 8.5, brand);
    drawTextRight(page, 'TOTAL', colRight.total, y, fontBold, 8.5, brand);
    y -= 24;
  };

  drawTableHeader();

  let subtotal = 0;
  for (const item of items) {
    const lineTotal = Number(item.quantity) * Number(item.unit_price);
    subtotal += lineTotal;

    const descLines = wrapText(item.description, font, 10, colX.qty - colX.desc - 10);
    if (y - descLines.length * 13 < MARGIN + 130) {
      newPage();
      drawTableHeader();
    }
    const rowTop = y;
    for (const line of descLines) {
      drawText(page, line, colX.desc, y, font, 10, INK);
      y -= 13;
    }
    drawTextRight(page, String(item.quantity), colRight.qty, rowTop, font, 10, INK);
    drawTextRight(page, item.unit ?? 'pce', colRight.unit, rowTop, font, 10, INK);
    drawTextRight(page, chf(Number(item.unit_price)), colRight.price, rowTop, font, 10, INK);
    drawTextRight(page, chf(lineTotal), colRight.total, rowTop, fontBold, 10, brand);
    y -= 8;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: tableRight, y }, thickness: 0.5, color: LINE });
    y -= 6;
  }

  y -= 10;
  if (y < MARGIN + 120) newPage();

  const vat = subtotal * (Number(devis.vat_rate) / 100);
  const total = subtotal + vat;

  drawTotalsLine(page, font, y, 'Sous-total', chf(subtotal));
  y -= 16;
  drawTotalsLine(page, font, y, `TVA (${devis.vat_rate}%)`, chf(vat));
  y -= 8;
  // Box width is measured from the actual total text instead of a fixed
  // 150pt guess — a large total (5+ digits) used to overflow that fixed
  // width, spilling text past the colored box onto the white page.
  const totalTTCStr = chf(total);
  const totalTTCBoxRight = PAGE_WIDTH - MARGIN;
  const totalTTCBoxLeft = Math.min(500 - 150, totalTTCBoxRight - fontBold.widthOfTextAtSize(totalTTCStr, 12) - 100);
  page.drawRectangle({ x: totalTTCBoxLeft, y: y - 22, width: totalTTCBoxRight - totalTTCBoxLeft, height: 26, color: brand });
  drawText(page, 'TOTAL TTC', totalTTCBoxLeft + 10, y - 14, fontBold, 11, textOnBrand);
  drawTextRight(page, totalTTCStr, totalTTCBoxRight - 10, y - 14, fontBold, 12, textOnBrand);
  y -= 44;

  y = drawTerms(page, font, org, y);

  if (signatureImg) {
    if (y < MARGIN + 90) newPage();
    const h = 50;
    const w = (signatureImg.width / signatureImg.height) * h;
    drawText(page, 'Signature', PAGE_WIDTH - MARGIN - w, y, font, 9, MUTED);
    page.drawImage(signatureImg, { x: PAGE_WIDTH - MARGIN - w, y: y - h - 10, width: w, height: h });
  }

  drawFooter(page, font, pageNum, footerText ?? org?.name ?? 'Cantia');
  return pdfDoc.save();
}

// ---------------------------------------------------------------------------
// Template: minimal — generous whitespace, thin rules only, no color blocks
// ---------------------------------------------------------------------------
function renderMinimal(ctx: RenderCtx): Uint8Array | Promise<Uint8Array> {
  const { pdfDoc, font, fontBold, org, devis, items, logoImg, signatureImg, logoPlacement, footerText } = ctx;
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN - 10;
  let pageNum = 1;

  const newPage = () => {
    drawFooter(page, font, pageNum, footerText ?? org?.name ?? 'Cantia');
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pageNum += 1;
    y = PAGE_HEIGHT - MARGIN;
  };

  if (logoImg) {
    const h = 34;
    const w = (logoImg.width / logoImg.height) * h;
    page.drawImage(logoImg, { x: logoX(logoPlacement, PAGE_WIDTH, MARGIN, w), y: y - h + 8, width: w, height: h });
    y -= h + 18;
  }

  drawText(page, (org?.name ?? 'Entreprise').toUpperCase(), MARGIN, y, font, 10, MUTED);
  y -= 34;
  drawText(page, `Devis ${devis.number ?? ''}`, MARGIN, y, fontBold, 24, INK);
  y -= 20;
  drawText(page, formatDate(devis.created_at), MARGIN, y, font, 9.5, MUTED);
  y -= 40;

  const clientLines = [
    devis.client_name,
    devis.client_address,
    devis.client_email,
    devis.projects?.name ? `Chantier : ${devis.projects.name}` : null,
  ].filter(Boolean) as string[];
  for (const line of clientLines) {
    drawText(page, line, MARGIN, y, font, 10.5, INK);
    y -= 14;
  }
  y -= 20;

  if (devis.notes?.trim()) {
    const lines = wrapText(devis.notes, font, 9.5, PAGE_WIDTH - 2 * MARGIN);
    for (const line of lines) {
      drawText(page, line, MARGIN, y, font, 9.5, MUTED);
      y -= 12;
    }
    y -= 16;
  }

  const colX = { desc: MARGIN, qty: 300, unit: 335, price: 375, total: 463 };
  const tableRight = PAGE_WIDTH - MARGIN;
  // Right-aligned to each column's own right edge — left-aligned at a fixed
  // x, a wide CHF amount (thousands separator, 4+ digits) in "Prix" used to
  // run straight into "Total" with no gap between them. Price/Total also
  // get ~90-100pt each instead of the old 50pt gaps, enough for a 6-digit
  // amount ("999 999.95 CHF" is ~85pt wide at this font size).
  const colRight = { qty: colX.unit - 10, unit: colX.price - 10, price: colX.total - 10, total: tableRight };

  let subtotal = 0;
  for (const item of items) {
    const lineTotal = Number(item.quantity) * Number(item.unit_price);
    subtotal += lineTotal;

    const descLines = wrapText(item.description, font, 10, colX.qty - colX.desc - 10);
    if (y - descLines.length * 13 < MARGIN + 130) {
      newPage();
    }
    const rowTop = y;
    for (const line of descLines) {
      drawText(page, line, colX.desc, y, font, 10, INK);
      y -= 13;
    }
    drawTextRight(page, String(item.quantity), colRight.qty, rowTop, font, 9.5, MUTED);
    drawTextRight(page, item.unit ?? 'pce', colRight.unit, rowTop, font, 9.5, MUTED);
    drawTextRight(page, chf(Number(item.unit_price)), colRight.price, rowTop, font, 9.5, MUTED);
    drawTextRight(page, chf(lineTotal), colRight.total, rowTop, font, 10, INK);
    y -= 12;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: tableRight, y }, thickness: 0.5, color: LINE });
    y -= 12;
  }

  y -= 4;
  if (y < MARGIN + 100) newPage();

  const vat = subtotal * (Number(devis.vat_rate) / 100);
  const total = subtotal + vat;

  drawTotalsLine(page, font, y, 'Sous-total', chf(subtotal));
  y -= 16;
  drawTotalsLine(page, font, y, `TVA (${devis.vat_rate}%)`, chf(vat));
  y -= 12;
  page.drawLine({ start: { x: 500 - 130, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 1, color: INK });
  y -= 16;
  drawTotalsLine(page, fontBold, y, 'Total TTC', chf(total), 13);
  y -= 34;

  y = drawTerms(page, font, org, y);

  if (signatureImg) {
    if (y < MARGIN + 90) newPage();
    const h = 44;
    const w = (signatureImg.width / signatureImg.height) * h;
    page.drawImage(signatureImg, { x: PAGE_WIDTH - MARGIN - w, y: y - h, width: w, height: h });
  }

  drawFooter(page, font, pageNum, footerText ?? org?.name ?? 'Cantia');
  return pdfDoc.save();
}

// ---------------------------------------------------------------------------
// Template: structure — bordered grid table with alternating rows (dense)
// ---------------------------------------------------------------------------
function renderStructure(ctx: RenderCtx): Uint8Array | Promise<Uint8Array> {
  const { pdfDoc, font, fontBold, org, devis, items, logoImg, signatureImg, brand, textOnBrand, logoPlacement, footerText } = ctx;
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;
  let pageNum = 1;

  const newPage = () => {
    drawFooter(page, font, pageNum, footerText ?? org?.name ?? 'Cantia');
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pageNum += 1;
    y = PAGE_HEIGHT - MARGIN;
  };

  if (logoImg) {
    const h = 42;
    const w = (logoImg.width / logoImg.height) * h;
    if (logoPlacement === 'right') {
      page.drawImage(logoImg, { x: logoX(logoPlacement, PAGE_WIDTH, MARGIN, w), y: y - h + 6, width: w, height: h });
    } else {
      page.drawImage(logoImg, { x: logoX(logoPlacement, PAGE_WIDTH, MARGIN, w), y: y - h, width: w, height: h });
      y -= h + 10;
    }
  }
  drawText(page, org?.name ?? 'Entreprise', MARGIN, y, fontBold, 15, brand);
  y -= 14;
  const orgLine = [org?.address, org?.ide_number ? `IDE ${org.ide_number}` : null, org?.phone, org?.email]
    .filter(Boolean)
    .join(' · ');
  if (orgLine) {
    for (const line of wrapText(orgLine, font, 8.5, PAGE_WIDTH - 2 * MARGIN - 110)) {
      drawText(page, line, MARGIN, y, font, 8.5, MUTED);
      y -= 11;
    }
  }
  y -= 12;

  page.drawRectangle({ x: MARGIN, y: y - 26, width: PAGE_WIDTH - 2 * MARGIN, height: 26, color: PAPER_ALT });
  drawText(page, `DEVIS N° ${devis.number ?? ''}`, MARGIN + 8, y - 18, fontBold, 11, INK);
  drawTextRight(page, formatDate(devis.created_at), PAGE_WIDTH - MARGIN - 8, y - 18, font, 9.5, MUTED);
  y -= 40;

  const boxTop = y;
  const clientLines = [
    devis.client_name,
    devis.client_address,
    devis.client_email,
    devis.projects?.name ? `Chantier : ${devis.projects.name}` : null,
  ].filter(Boolean) as string[];
  drawText(page, 'Client', MARGIN + 8, y - 10, fontBold, 8.5, MUTED);
  let cy = y - 24;
  for (const line of clientLines) {
    drawText(page, line, MARGIN + 8, cy, font, 10, INK);
    cy -= 13;
  }
  const boxBottom = Math.min(cy - 4, y - 60);
  page.drawRectangle({
    x: MARGIN,
    y: boxBottom,
    width: PAGE_WIDTH - 2 * MARGIN,
    height: boxTop - boxBottom,
    borderColor: LINE,
    borderWidth: 1,
  });
  y = boxBottom - 20;

  if (devis.notes?.trim()) {
    const lines = wrapText(devis.notes, font, 9, PAGE_WIDTH - 2 * MARGIN);
    for (const line of lines) {
      drawText(page, line, MARGIN, y, font, 9, MUTED);
      y -= 12;
    }
    y -= 10;
  }

  const colX = { desc: MARGIN + 8, qty: 300, unit: 335, price: 375, total: 463 };
  const tableLeft = MARGIN;
  const tableRight = PAGE_WIDTH - MARGIN;
  const colRight = { qty: colX.unit - 10, unit: colX.price - 10, price: colX.total - 10, total: tableRight - 8 };

  const drawTableHeader = () => {
    page.drawRectangle({ x: tableLeft, y: y - 20, width: tableRight - tableLeft, height: 20, color: brand });
    drawText(page, 'DESCRIPTION', colX.desc, y - 14, fontBold, 8.5, textOnBrand);
    drawTextRight(page, 'QTÉ', colRight.qty, y - 14, fontBold, 8.5, textOnBrand);
    drawTextRight(page, 'UNITÉ', colRight.unit, y - 14, fontBold, 8.5, textOnBrand);
    drawTextRight(page, 'PRIX', colRight.price, y - 14, fontBold, 8.5, textOnBrand);
    drawTextRight(page, 'TOTAL', colRight.total, y - 14, fontBold, 8.5, textOnBrand);
    y -= 20;
  };

  drawTableHeader();

  let subtotal = 0;
  let rowIdx = 0;
  for (const item of items) {
    const lineTotal = Number(item.quantity) * Number(item.unit_price);
    subtotal += lineTotal;

    const descLines = wrapText(item.description, font, 9.5, colX.qty - colX.desc - 10);
    const rowH = Math.max(20, descLines.length * 12 + 8);

    if (y - rowH < MARGIN + 140) {
      newPage();
      drawTableHeader();
      rowIdx = 0;
    }

    if (rowIdx % 2 === 1) {
      page.drawRectangle({ x: tableLeft, y: y - rowH, width: tableRight - tableLeft, height: rowH, color: PAPER_ALT });
    }
    let ty = y - 13;
    for (const line of descLines) {
      drawText(page, line, colX.desc, ty, font, 9.5, INK);
      ty -= 12;
    }
    drawTextRight(page, String(item.quantity), colRight.qty, y - 13, font, 9.5, INK);
    drawTextRight(page, item.unit ?? 'pce', colRight.unit, y - 13, font, 9.5, INK);
    drawTextRight(page, chf(Number(item.unit_price)), colRight.price, y - 13, font, 9.5, INK);
    drawTextRight(page, chf(lineTotal), colRight.total, y - 13, fontBold, 9.5, INK);
    y -= rowH;
    rowIdx += 1;
  }
  page.drawRectangle({ x: tableLeft, y, width: tableRight - tableLeft, height: 1, color: LINE });
  y -= 20;

  if (y < MARGIN + 110) newPage();

  const vat = subtotal * (Number(devis.vat_rate) / 100);
  const total = subtotal + vat;

  drawTotalsLine(page, font, y, 'Sous-total', chf(subtotal));
  y -= 15;
  drawTotalsLine(page, font, y, `TVA (${devis.vat_rate}%)`, chf(vat));
  y -= 18;
  // Box width is measured from the actual total text instead of a fixed
  // 140pt guess — a large total (5+ digits) used to overflow that fixed
  // width, so the box's own border ended up drawn straight through the
  // last character(s) of the amount.
  const structTotalStr = chf(total);
  const structBoxRight = PAGE_WIDTH - MARGIN - 8;
  const structBoxLeft = Math.min(500 - 140, structBoxRight - fontBold.widthOfTextAtSize(structTotalStr, 11) - 100);
  page.drawRectangle({ x: structBoxLeft, y: y - 6, width: structBoxRight - structBoxLeft, height: 22, borderColor: brand, borderWidth: 1.2 });
  drawText(page, 'TOTAL TTC', structBoxLeft + 8, y, fontBold, 11, brand);
  drawTextRight(page, structTotalStr, structBoxRight - 8, y, fontBold, 11, brand);
  y -= 40;

  y = drawTerms(page, font, org, y);

  if (signatureImg) {
    if (y < MARGIN + 90) newPage();
    const h = 48;
    const w = (signatureImg.width / signatureImg.height) * h;
    drawText(page, 'Signature', PAGE_WIDTH - MARGIN - w, y, font, 9, MUTED);
    page.drawImage(signatureImg, { x: PAGE_WIDTH - MARGIN - w, y: y - h - 10, width: w, height: h });
  }

  drawFooter(page, font, pageNum, footerText ?? org?.name ?? 'Cantia');
  return pdfDoc.save();
}

const RENDERERS: Record<TemplateId, (ctx: RenderCtx) => Uint8Array | Promise<Uint8Array>> = {
  classic: renderClassic,
  moderne: renderModerne,
  minimal: renderMinimal,
  structure: renderStructure,
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { devis_id } = await req.json();
    if (!devis_id) return json({ error: 'devis_id requis' }, 400);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: devis, error: devisError } = await userClient
      .from('devis')
      .select('*, projects(name)')
      .eq('id', devis_id)
      .single();

    if (devisError || !devis) return json({ error: 'Devis introuvable ou accès refusé' }, 404);

    const [{ data: org }, { data: items }] = await Promise.all([
      admin.from('organizations').select('*').eq('id', devis.organization_id).single(),
      admin.from('devis_items').select('*').eq('devis_id', devis_id).order('sort_order', { ascending: true }),
    ]);

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let logoImg: PDFImage | null = null;
    if (org?.logo_url) {
      const bytes = await fetchStorageBytes(admin, BUCKET, org.logo_url);
      if (bytes) logoImg = await embedImageSmart(pdfDoc, bytes.bytes, bytes.contentType);
    }
    let signatureImg: PDFImage | null = null;
    if (org?.signature_url) {
      const bytes = await fetchStorageBytes(admin, BUCKET, org.signature_url);
      if (bytes) signatureImg = await embedImageSmart(pdfDoc, bytes.bytes, bytes.contentType);
    }

    const template = await resolvePdfTemplate(admin, devis.organization_id, 'devis', devis.template_id);
    const brand = resolveBrand(template, org);
    const footerText = resolveFooterText(template, org);

    let pdfBytes =
      template.layout_mode === 'custom'
        ? await drawCustomLayout('devis', template.blocks, {
            pdfDoc,
            admin,
            bucket: BUCKET,
            font,
            fontBold,
            org,
            doc: devis,
            items: items ?? [],
            logoImg,
            signatureImg,
            brand,
            footerText,
          })
        : await RENDERERS[template.base_layout]({
            pdfDoc,
            font,
            fontBold,
            org,
            devis,
            items: items ?? [],
            logoImg,
            signatureImg,
            brand,
            textOnBrand: pickReadableTextColor(brand),
            logoPlacement: resolveLogoPlacement(template, org),
            footerText,
          });

    // Swiss QR-bill: a dedicated final page appended to the already-rendered
    // PDF (pdfDoc is mutated in place, so this applies identically whether
    // the devis used a preset or a custom layout, without touching either
    // rendering path). Opt-in — only when the org has a valid CH/LI IBAN.
    if (isValidSwissIban(org?.iban)) {
      try {
        const itemsList = items ?? [];
        const subtotal = itemsList.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unit_price), 0);
        const vat = subtotal * (Number(devis.vat_rate) / 100);
        const total = subtotal + vat;
        await appendQrBillPage(pdfDoc, font, fontBold, {
          iban: org.iban,
          creditor: { name: org.name ?? 'Entreprise', addressLine1: org.address ?? null },
          amount: total,
          currency: 'CHF',
          debtor: devis.client_name
            ? { name: devis.client_name, addressLine1: devis.client_address ?? null }
            : null,
          referenceId: devis.id,
          unstructuredMessage: devis.number ? `Devis ${devis.number}` : undefined,
        });
        pdfBytes = await pdfDoc.save();
      } catch (qrErr) {
        // A QR-bill failure must never take down devis generation — the
        // rest of the PDF is still valid and useful without it.
        console.error('QR-bill generation failed:', qrErr);
      }
    }

    const path = `${devis.organization_id}/devis/${devis.id}/devis-${Date.now()}.pdf`;
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, pdfBytes, { contentType: 'application/pdf', upsert: true });

    if (uploadError) return json({ error: `Échec de l'enregistrement du PDF: ${uploadError.message}` }, 500);

    await admin.from('devis').update({ pdf_path: path }).eq('id', devis_id);

    const { data: signed } = await admin.storage.from(BUCKET).createSignedUrl(path, 60 * 60);

    return json({ path, url: signed?.signedUrl ?? null, template: template.layout_mode === 'custom' ? 'custom' : template.base_layout });
  } catch (err) {
    console.error(err);
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});

function drawTotalsLine(page: PDFPage, font: PDFFont, y: number, label: string, value: string, size = 10.5) {
  const x = 500 - 130;
  drawText(page, label, x, y, font, size, INK);
  drawTextRight(page, value, PAGE_WIDTH - MARGIN, y, font, size, INK);
}

function drawTerms(page: PDFPage, font: PDFFont, org: any, y: number): number {
  const validityDays = org?.devis_validity_days ?? 30;
  const termsLines = wrapText(
    org?.devis_terms?.trim()
      ? `${org.devis_terms.trim()} Devis valable ${validityDays} jours. Prix en francs suisses (CHF).`
      : `Devis valable ${validityDays} jours. Prix en francs suisses (CHF).`,
    font,
    8.5,
    PAGE_WIDTH - 2 * MARGIN,
  );
  let cursor = y;
  for (const line of termsLines) {
    drawText(page, line, MARGIN, cursor, font, 8.5, MUTED);
    cursor -= 11;
  }
  return cursor - 8;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
