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
import { PDFFont, PDFImage, PDFPage, PDFDocument, RGB, rgb } from 'npm:pdf-lib@1.17.1';
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
  logoX,
  pickReadableTextColor,
  sanitizePdfText,
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
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;
  let pageNum = 1;

  const newPage = () => {
    drawFooter(page, font, pageNum, footerText ?? org?.name ?? 'Cantia', locale);
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pageNum += 1;
    y = PAGE_HEIGHT - MARGIN;
  };

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
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 1, color: LINE });
  y -= 24;

  // --- Big document-type label, brand-colored, then a tinted reference box
  // right below it (replaces the old plain "Devis 2026-018 ... date" line).
  drawText(page, docLabel.toUpperCase(), MARGIN, y, fontBold, 20, brand);
  y -= 22;

  const boxRows: string[] = [
    `${pdfT(locale, 'reference')} : ${devis.number ?? '—'}`,
    `${pdfT(locale, 'date')} : ${formatDate(devis.created_at, locale)}`,
  ];
  if (metaLine) {
    boxRows.push(metaLine);
  } else if (docKind === 'devis' && devis.valid_until) {
    boxRows.push(`${pdfT(locale, 'validity')} : ${formatDate(devis.valid_until, locale)}`);
  }
  const boxRowH = 13;
  const boxPadV = 7;
  const boxPadL = 16;
  const boxW = Math.min(320, Math.max(220, measureMax(font, boxRows, 10) + boxPadL + 16));
  const boxH = boxRows.length * boxRowH + boxPadV * 2;
  const boxTop = y;
  page.drawRectangle({ x: MARGIN, y: boxTop - boxH, width: boxW, height: boxH, color: softTint(brand, 0.93) });
  page.drawRectangle({ x: MARGIN, y: boxTop - boxH, width: 3, height: boxH, color: brand });
  let rowY = boxTop - boxPadV - 9;
  for (const row of boxRows) {
    drawText(page, row, MARGIN + boxPadL, rowY, font, 9.5, INK);
    rowY -= boxRowH;
  }
  y = boxTop - boxH - 18;

  // --- Client block ---
  const clientLines = [
    devis.client_name,
    devis.client_address,
    devis.client_email,
    devis.projects?.name ? pdfT(locale, 'project', { name: devis.projects.name }) : null,
  ].filter(Boolean) as string[];
  drawText(page, pdfT(locale, 'client'), MARGIN, y, fontBold, 9, MUTED);
  y -= 14;
  for (const line of clientLines) {
    drawText(page, line, MARGIN, y, font, 10.5, INK);
    y -= 14;
  }
  y -= 10;

  if (devis.notes?.trim()) {
    const lines = wrapText(devis.notes, font, 9.5, PAGE_WIDTH - 2 * MARGIN);
    for (const line of lines) {
      drawText(page, line, MARGIN, y, font, 9.5, MUTED);
      y -= 12;
    }
    y -= 10;
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
    desc: MARGIN,
    qty: colRight.qty - qtyW,
  };
  const descWidth = colX.qty - gutter - MARGIN;

  const headerH = 22;
  const drawTableHeader = () => {
    const top = y;
    page.drawRectangle({ x: MARGIN, y: top - headerH, width: tableRight - MARGIN, height: headerH, color: brand });
    const headTextColor = pickReadableTextColor(brand);
    const midY = top - headerH + 7;
    drawText(page, pdfT(locale, 'description'), colX.desc + 8, midY, fontBold, 9, headTextColor);
    drawTextRight(page, pdfT(locale, 'quantity'), colRight.qty, midY, fontBold, 9, headTextColor);
    drawTextRight(page, pdfT(locale, 'unit'), colRight.unit, midY, fontBold, 9, headTextColor);
    drawTextRight(page, pdfT(locale, 'price'), colRight.price, midY, fontBold, 9, headTextColor);
    drawTextRight(page, pdfT(locale, 'total'), colRight.total - 8, midY, fontBold, 9, headTextColor);
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
    if (idx % 2 === 1) {
      page.drawRectangle({ x: MARGIN, y: rowTop - rowH, width: tableRight - MARGIN, height: rowH, color: softTint(brand, 0.96) });
    }
    let lineY = rowTop - 15;
    for (const line of descLines) {
      drawText(page, line, colX.desc + 8, lineY, font, 10, INK);
      lineY -= 13;
    }
    drawTextRight(page, String(item.quantity), colRight.qty, rowTop - 15, font, 10, INK);
    drawTextRight(page, item.unit ?? pdfT(locale, 'unitFallback'), colRight.unit, rowTop - 15, font, 10, INK);
    drawTextRight(page, chf(Number(item.unit_price)), colRight.price, rowTop - 15, font, 10, INK);
    drawTextRight(page, chf(lineTotal), colRight.total - 8, rowTop - 15, fontBold, 10, INK);
    page.drawLine({ start: { x: MARGIN, y: rowTop - rowH }, end: { x: tableRight, y: rowTop - rowH }, thickness: 0.5, color: LINE });
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
  const totalsValueW = measureMax(fontBold, totalsValueSamples, 12, 60);
  const totalsBoxW = Math.max(220, totalsLabelW + totalsValueW + 30);
  const totalsRight = PAGE_WIDTH - MARGIN;
  const totalsLeft = totalsRight - totalsBoxW;

  const plainRow = (label: string, value: string) => {
    drawText(page, label, totalsLeft, y, font, 10.5, INK);
    drawTextRight(page, value, totalsRight, y, font, 10.5, INK);
    y -= 15;
  };
  const boxedRow = (label: string, value: string) => {
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
  plainRow(pdfT(locale, 'vat', { rate: devis.vat_rate }), chf(vat));
  boxedRow(pdfT(locale, 'totalIncl'), chf(total));
  if (netToPay != null) {
    plainRow(pdfT(locale, 'alreadyPaid'), chf(-(paidSum as number)));
    boxedRow(pdfT(locale, 'netToPay'), chf(netToPay));
  }
  y -= 6;

  y = drawTerms(page, font, org, y, docKind, locale, docKind === 'devis' ? devis.valid_until : null);

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
  classic: renderUnified,
  moderne: renderUnified,
  minimal: renderUnified,
  structure: renderUnified,
};

// For a devis: the original "valable X jours" quote-validity notice
// (byte-identical to the pre-facture behavior). For a facture: a payment
// reminder instead — the actual due date is already shown as metaLine near
// the title, this is just the closing courtesy line.
function drawTerms(page: PDFPage, font: PDFFont, org: any, y: number, docKind: 'devis' | 'facture' | 'extra_work', locale: PdfLocale, validUntil?: string | null): number {
  const validityDays = org?.devis_validity_days ?? 30;
  const baseText =
    docKind === 'facture'
      ? pdfT(locale, 'paymentReminder')
      : docKind === 'extra_work'
      ? pdfT(locale, 'extraWorkAccepted')
      : validUntil
      // An explicit per-devis date (chosen at creation) always wins over
      // the generic "valable X jours" org default — it's the actual date
      // the creator committed to, not a computed approximation of it.
      ? pdfT(locale, 'quoteValidUntil', { date: new Date(`${validUntil}T00:00:00`).toLocaleDateString(`${locale}-CH`) })
      : pdfT(locale, 'quoteValidity', { days: validityDays });
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
