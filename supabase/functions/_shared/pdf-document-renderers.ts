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
  formatDateTime,
  formatOrgAddress,
  swissRound,
  wrapText,
} from './pdf-helpers.ts';
import { PdfLocale, pdfT } from './pdf-i18n.ts';

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
  brand: RGB;
  footerText: string | null;
  docLabel: string; // localized 'Devis'/'Angebot' or 'Facture'/'Rechnung'
  docKind: 'devis' | 'facture'; // drives which fixed strings drawTerms/renderUnified pick, independent of docLabel's locale
  metaLine: string | null; // e.g. "Échéance : 05.09.2026" or "Payée le 20.08.2026"
  locale: PdfLocale;
}

function renderUnified(ctx: RenderCtx): RenderResult {
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
    brand,
    footerText,
    docLabel,
    docKind,
    metaLine,
    locale,
  } = ctx;
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;
  let pageNum = 1;

  const newPage = () => {
    drawFooter(page, font, pageNum, footerText ?? org?.name ?? 'Cantia', locale);
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pageNum += 1;
    y = PAGE_HEIGHT - MARGIN;
  };

  drawText(page, org?.name ?? pdfT(locale, 'entrepriseFallback'), MARGIN, y, fontBold, 17, brand);
  y -= 16;
  const orgLine = [formatOrgAddress(org), org?.ide_number ? `IDE ${org.ide_number}` : null].filter(Boolean).join(' · ');
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
  drawTextRight(page, formatDate(devis.created_at, locale), PAGE_WIDTH - MARGIN, y, font, 10, MUTED);
  y -= 22;
  if (metaLine) {
    drawTextRight(page, metaLine, PAGE_WIDTH - MARGIN, y, font, 9, MUTED);
    y -= 14;
  }

  const clientLines = [
    devis.client_name,
    devis.client_address,
    devis.client_email,
    devis.projects?.name ? pdfT(locale, 'project', { name: devis.projects.name }) : null,
  ].filter(Boolean) as string[];
  drawText(page, pdfT(locale, 'client'), MARGIN, y, fontBold, 10, MUTED);
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
    drawText(page, pdfT(locale, 'description'), colX.desc, y, fontBold, 9.5, MUTED);
    drawTextRight(page, pdfT(locale, 'quantity'), colRight.qty, y, fontBold, 9.5, MUTED);
    drawTextRight(page, pdfT(locale, 'unit'), colRight.unit, y, fontBold, 9.5, MUTED);
    drawTextRight(page, pdfT(locale, 'price'), colRight.price, y, fontBold, 9.5, MUTED);
    drawTextRight(page, pdfT(locale, 'total'), colRight.total, y, fontBold, 9.5, MUTED);
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
    drawTextRight(page, item.unit ?? pdfT(locale, 'unitFallback'), colRight.unit, rowTop, font, 10, INK);
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

  drawTotalsLine(page, font, y, pdfT(locale, 'subtotal'), chf(subtotal));
  y -= 15;
  drawTotalsLine(page, font, y, pdfT(locale, 'vat', { rate: devis.vat_rate }), chf(vat));
  y -= 15;
  drawTotalsLine(page, fontBold, y, pdfT(locale, 'totalIncl'), chf(total), 12);
  y -= 30;

  y = drawTerms(page, font, org, y, docKind, locale);

  if (showSignatures) {
    const h = 50;
    const creatorW = signatureImg ? (signatureImg.width / signatureImg.height) * h : 150;
    const clientW = clientSignatureImg ? (clientSignatureImg.width / clientSignatureImg.height) * h : 150;
    const gap = 30;
    const totalW = creatorW + gap + clientW;
    if (y < MARGIN + 100) newPage();
    const startX = PAGE_WIDTH - MARGIN - totalW;

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
function drawTerms(page: PDFPage, font: PDFFont, org: any, y: number, docKind: 'devis' | 'facture', locale: PdfLocale): number {
  const validityDays = org?.devis_validity_days ?? 30;
  const baseText =
    docKind === 'facture' ? pdfT(locale, 'paymentReminder') : pdfT(locale, 'quoteValidity', { days: validityDays });
  const pricesLine = pdfT(locale, 'pricesInChf');
  const termsLines = wrapText(
    org?.devis_terms?.trim() ? `${org.devis_terms.trim()} ${baseText} ${pricesLine}` : `${baseText} ${pricesLine}`,
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
