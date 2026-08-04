// The 4 hand-coded preset PDF layouts (classic/moderne/minimal/structure),
// shared between generate-devis-pdf and generate-facture-pdf — a facture's
// layout needs (org header, client block, items table, totals) are
// structurally identical to a devis's, the only differences being the
// document label ("Devis" vs "Facture") and an extra meta line (due date /
// paid stamp). Extracted verbatim from generate-devis-pdf with those two
// bits parametrized (docLabel/metaLine default to the exact previous
// devis-only text, so devis PDFs render byte-for-byte the same as before).
import { PDFDocument, PDFFont, PDFImage, PDFPage, RGB, rgb } from 'npm:pdf-lib@1.17.1';
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
  formatChf,
  formatDate,
  logoX,
  swissRound,
  wrapText,
  type LogoPlacement,
} from './pdf-helpers.ts';

const chf = formatChf;

export type TemplateId = 'classic' | 'moderne' | 'minimal' | 'structure';

// The last page a renderer drew on, plus the y cursor where its content
// ended — lets a caller (generate-devis-pdf / generate-facture-pdf) decide
// whether there's still room to append something (the QR-bill band) to that
// same page instead of always starting a fresh one. Renderers no longer draw
// their own trailing footer or call pdfDoc.save() — the caller does both,
// once it knows what (if anything) still needs to go on this last page.
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
  logoImg: PDFImage | null;
  signatureImg: PDFImage | null;
  brand: RGB;
  textOnBrand: RGB;
  logoPlacement: LogoPlacement;
  footerText: string | null;
  docLabel: string; // 'Devis' or 'Facture'
  metaLine: string | null; // e.g. "Échéance : 05.09.2026" or "Payée le 20.08.2026"
}

// ---------------------------------------------------------------------------
// Template: classic — sober header, thin rules, understated (default)
// ---------------------------------------------------------------------------
function renderClassic(ctx: RenderCtx): RenderResult {
  const { pdfDoc, font, fontBold, org, devis, items, logoImg, signatureImg, brand, logoPlacement, footerText, docLabel, metaLine } = ctx;
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

  drawText(page, `${docLabel} ${devis.number ?? ''}`, MARGIN, y, fontBold, 16, ACCENT);
  drawTextRight(page, formatDate(devis.created_at), PAGE_WIDTH - MARGIN, y, font, 10, MUTED);
  y -= 22;
  if (metaLine) {
    drawTextRight(page, metaLine, PAGE_WIDTH - MARGIN, y, font, 9, MUTED);
    y -= 14;
  }

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

  const colX = { desc: MARGIN, qty: 300, unit: 335, price: 375, total: 463 };
  const tableRight = PAGE_WIDTH - MARGIN;
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
  const total = swissRound(subtotal + vat);

  drawTotalsLine(page, font, y, 'Sous-total', chf(subtotal));
  y -= 15;
  drawTotalsLine(page, font, y, `TVA (${devis.vat_rate}%)`, chf(vat));
  y -= 15;
  drawTotalsLine(page, fontBold, y, 'Total TTC', chf(total), 12);
  y -= 30;

  y = drawTerms(page, font, org, y, docLabel);

  if (signatureImg) {
    if (y < MARGIN + 90) newPage();
    const h = 50;
    const w = (signatureImg.width / signatureImg.height) * h;
    drawText(page, 'Signature', PAGE_WIDTH - MARGIN - w, y, font, 9, MUTED);
    page.drawImage(signatureImg, { x: PAGE_WIDTH - MARGIN - w, y: y - h - 10, width: w, height: h });
  }

  return { page, y, pageNum };
}

// ---------------------------------------------------------------------------
// Template: moderne — bold pine-green header band, big white title
// ---------------------------------------------------------------------------
function renderModerne(ctx: RenderCtx): RenderResult {
  const { pdfDoc, font, fontBold, org, devis, items, logoImg, signatureImg, brand, textOnBrand, logoPlacement, footerText, docLabel, metaLine } = ctx;
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let pageNum = 1;

  const BAND_H = 118;
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
  drawText(page, `${docLabel.toUpperCase()} ${devis.number ?? ''}`, MARGIN, PAGE_HEIGHT - shift - 92, fontBold, 22, textOnBrand);
  drawText(page, formatDate(devis.created_at), MARGIN, PAGE_HEIGHT - shift - 108, font, 9.5, rgb(0.85, 0.89, 0.87));
  if (metaLine) drawText(page, metaLine, MARGIN, PAGE_HEIGHT - shift - 121, font, 8.5, rgb(0.85, 0.89, 0.87));

  let y = PAGE_HEIGHT - BAND_H - shift - 34;

  const newPage = () => {
    drawFooter(page, font, pageNum, footerText ?? org?.name ?? 'Cantia');
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pageNum += 1;
    y = PAGE_HEIGHT - MARGIN;
  };

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
  const total = swissRound(subtotal + vat);

  drawTotalsLine(page, font, y, 'Sous-total', chf(subtotal));
  y -= 16;
  drawTotalsLine(page, font, y, `TVA (${devis.vat_rate}%)`, chf(vat));
  y -= 8;
  const totalTTCStr = chf(total);
  const totalTTCBoxRight = PAGE_WIDTH - MARGIN;
  const totalTTCBoxLeft = Math.min(500 - 150, totalTTCBoxRight - fontBold.widthOfTextAtSize(totalTTCStr, 12) - 100);
  page.drawRectangle({ x: totalTTCBoxLeft, y: y - 22, width: totalTTCBoxRight - totalTTCBoxLeft, height: 26, color: brand });
  drawText(page, 'TOTAL TTC', totalTTCBoxLeft + 10, y - 14, fontBold, 11, textOnBrand);
  drawTextRight(page, totalTTCStr, totalTTCBoxRight - 10, y - 14, fontBold, 12, textOnBrand);
  y -= 44;

  y = drawTerms(page, font, org, y, docLabel);

  if (signatureImg) {
    if (y < MARGIN + 90) newPage();
    const h = 50;
    const w = (signatureImg.width / signatureImg.height) * h;
    drawText(page, 'Signature', PAGE_WIDTH - MARGIN - w, y, font, 9, MUTED);
    page.drawImage(signatureImg, { x: PAGE_WIDTH - MARGIN - w, y: y - h - 10, width: w, height: h });
  }

  return { page, y, pageNum };
}

// ---------------------------------------------------------------------------
// Template: minimal — generous whitespace, thin rules only, no color blocks
// ---------------------------------------------------------------------------
function renderMinimal(ctx: RenderCtx): RenderResult {
  const { pdfDoc, font, fontBold, org, devis, items, logoImg, signatureImg, logoPlacement, footerText, docLabel, metaLine } = ctx;
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
  drawText(page, `${docLabel} ${devis.number ?? ''}`, MARGIN, y, fontBold, 24, INK);
  y -= 20;
  drawText(page, formatDate(devis.created_at), MARGIN, y, font, 9.5, MUTED);
  y -= 16;
  if (metaLine) {
    drawText(page, metaLine, MARGIN, y, font, 9.5, MUTED);
    y -= 16;
  }
  y -= 8;

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
  const total = swissRound(subtotal + vat);

  drawTotalsLine(page, font, y, 'Sous-total', chf(subtotal));
  y -= 16;
  drawTotalsLine(page, font, y, `TVA (${devis.vat_rate}%)`, chf(vat));
  y -= 12;
  page.drawLine({ start: { x: 500 - 130, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 1, color: INK });
  y -= 16;
  drawTotalsLine(page, fontBold, y, 'Total TTC', chf(total), 13);
  y -= 34;

  y = drawTerms(page, font, org, y, docLabel);

  if (signatureImg) {
    if (y < MARGIN + 90) newPage();
    const h = 44;
    const w = (signatureImg.width / signatureImg.height) * h;
    page.drawImage(signatureImg, { x: PAGE_WIDTH - MARGIN - w, y: y - h, width: w, height: h });
  }

  return { page, y, pageNum };
}

// ---------------------------------------------------------------------------
// Template: structure — bordered grid table with alternating rows (dense)
// ---------------------------------------------------------------------------
function renderStructure(ctx: RenderCtx): RenderResult {
  const { pdfDoc, font, fontBold, org, devis, items, logoImg, signatureImg, brand, textOnBrand, logoPlacement, footerText, docLabel, metaLine } = ctx;
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
  drawText(page, `${docLabel.toUpperCase()} N° ${devis.number ?? ''}`, MARGIN + 8, y - 18, fontBold, 11, INK);
  drawTextRight(page, formatDate(devis.created_at), PAGE_WIDTH - MARGIN - 8, y - 18, font, 9.5, MUTED);
  y -= 40;
  if (metaLine) {
    drawTextRight(page, metaLine, PAGE_WIDTH - MARGIN - 8, y, font, 8.5, MUTED);
    y -= 14;
  }

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
  const total = swissRound(subtotal + vat);

  drawTotalsLine(page, font, y, 'Sous-total', chf(subtotal));
  y -= 15;
  drawTotalsLine(page, font, y, `TVA (${devis.vat_rate}%)`, chf(vat));
  y -= 18;
  const structTotalStr = chf(total);
  const structBoxRight = PAGE_WIDTH - MARGIN - 8;
  const structBoxLeft = Math.min(500 - 140, structBoxRight - fontBold.widthOfTextAtSize(structTotalStr, 11) - 100);
  page.drawRectangle({ x: structBoxLeft, y: y - 6, width: structBoxRight - structBoxLeft, height: 22, borderColor: brand, borderWidth: 1.2 });
  drawText(page, 'TOTAL TTC', structBoxLeft + 8, y, fontBold, 11, brand);
  drawTextRight(page, structTotalStr, structBoxRight - 8, y, fontBold, 11, brand);
  y -= 40;

  y = drawTerms(page, font, org, y, docLabel);

  if (signatureImg) {
    if (y < MARGIN + 90) newPage();
    const h = 48;
    const w = (signatureImg.width / signatureImg.height) * h;
    drawText(page, 'Signature', PAGE_WIDTH - MARGIN - w, y, font, 9, MUTED);
    page.drawImage(signatureImg, { x: PAGE_WIDTH - MARGIN - w, y: y - h - 10, width: w, height: h });
  }

  return { page, y, pageNum };
}

export const RENDERERS: Record<TemplateId, (ctx: RenderCtx) => RenderResult> = {
  classic: renderClassic,
  moderne: renderModerne,
  minimal: renderMinimal,
  structure: renderStructure,
};

function drawTotalsLine(page: PDFPage, font: PDFFont, y: number, label: string, value: string, size = 10.5) {
  const x = 500 - 130;
  drawText(page, label, x, y, font, size, INK);
  drawTextRight(page, value, PAGE_WIDTH - MARGIN, y, font, size, INK);
}

// For a devis: the original "valable X jours" quote-validity notice
// (byte-identical to the pre-facture behavior). For a facture: a payment
// reminder instead — the actual due date is already shown as metaLine near
// the title, this is just the closing courtesy line.
function drawTerms(page: PDFPage, font: PDFFont, org: any, y: number, docLabel: string): number {
  const validityDays = org?.devis_validity_days ?? 30;
  const baseText =
    docLabel === 'Facture'
      ? 'Merci de régler cette facture avant l\'échéance indiquée ci-dessus.'
      : `Devis valable ${validityDays} jours.`;
  const termsLines = wrapText(
    org?.devis_terms?.trim() ? `${org.devis_terms.trim()} ${baseText} Prix en francs suisses (CHF).` : `${baseText} Prix en francs suisses (CHF).`,
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
