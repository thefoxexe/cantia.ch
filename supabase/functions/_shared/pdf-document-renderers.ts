// Single unified PDF layout, shared between generate-devis-pdf and
// generate-facture-pdf — a facture's layout needs (org header, client block,
// items table, totals) are structurally identical to a devis's, the only
// differences being the document label ("Devis" vs "Facture") and an extra
// meta line (due date / paid stamp), parametrized via docLabel/metaLine.
//
// Previously offered 4 selectable designs (classic/moderne/minimal/
// structure); collapsed to this one sober layout so brand color is the only
// customization left, and no logo is drawn — the org's own name is the
// document's identity mark instead. RENDERERS/TemplateId are kept (rather
// than removed) so every existing pdf_templates row's base_layout value
// still resolves without a migration, and both callers' `RENDERERS[template
// .base_layout]` lookup keeps working unchanged.
import { PDFFont, PDFImage, PDFPage, PDFDocument, RGB } from 'npm:pdf-lib@1.17.1';
import {
  INK,
  LINE,
  MARGIN,
  MUTED,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  drawFooter,
  drawText,
  drawTextRight,
  formatChf,
  formatDate,
  swissRound,
  wrapText,
} from './pdf-helpers.ts';

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
  signatureImg: PDFImage | null;
  brand: RGB;
  footerText: string | null;
  docLabel: string; // 'Devis' or 'Facture'
  metaLine: string | null; // e.g. "Échéance : 05.09.2026" or "Payée le 20.08.2026"
}

function renderUnified(ctx: RenderCtx): RenderResult {
  const { pdfDoc, font, fontBold, org, devis, items, signatureImg, brand, footerText, docLabel, metaLine } = ctx;
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;
  let pageNum = 1;

  const newPage = () => {
    drawFooter(page, font, pageNum, footerText ?? org?.name ?? 'Cantia');
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pageNum += 1;
    y = PAGE_HEIGHT - MARGIN;
  };

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

  drawText(page, `${docLabel} ${devis.number ?? ''}`, MARGIN, y, fontBold, 16, brand);
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

export const RENDERERS: Record<TemplateId, (ctx: RenderCtx) => RenderResult> = {
  classic: renderUnified,
  moderne: renderUnified,
  minimal: renderUnified,
  structure: renderUnified,
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
