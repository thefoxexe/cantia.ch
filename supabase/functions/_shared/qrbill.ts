// Swiss QR-bill (Swiss Payment Standards "QR-bill", SIX Implementation
// Guidelines) — the payment slip glued to the bottom of a Swiss invoice
// since it became the mandatory replacement for the old orange/red slips
// in Sept/Oct 2022. Two things must be exactly right for a bank's app to
// accept a scan: the QR payload's field order (the "Swiss QR Code" / SPC
// text format below), and the reference number's check digit. The visual
// layout (receipt + payment part) has more tolerance in practice, but this
// aims to match the official structure closely.
//
// IMPORTANT: this was written from spec knowledge, not verified against a
// live scanner in this environment (no device access here). Scan a
// generated bill with a real banking app before relying on it for actual
// invoices.
import { PDFDocument, PDFFont, PDFPage, rgb } from 'npm:pdf-lib@1.17.1';
import QRCode from 'npm:qrcode@1.5.4';
import { INK, PAGE_HEIGHT, PAGE_WIDTH, drawText, drawTextRight, wrapText } from './pdf-helpers.ts';

const mm = (v: number) => v * 2.834645669; // 1mm in PDF points (72dpi/25.4)

const BLACK = rgb(0, 0, 0);
const WHITE = rgb(1, 1, 1);
const GREY = rgb(0.4, 0.4, 0.4);

export function isValidSwissIban(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const iban = raw.replace(/\s+/g, '').toUpperCase();
  if (!/^(CH|LI)\d{19}$/.test(iban)) return false;
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (ch) => String(ch.charCodeAt(0) - 55));
  let remainder = 0;
  for (const digit of numeric) {
    remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder === 1;
}

// A QR-IBAN's bank clearing number (IID, IBAN chars 5-9) falls in the
// 30000-31999 range reserved for QR-IBANs — those require the proprietary
// 27-digit "QRR" reference below. Any other (regular) IBAN must use
// reference type "NON" (no reference) for a first version of this feature —
// the alternative, a "SCOR"/ISO 11649 creditor reference, is a real option
// too but adds its own check-digit scheme; skipped for now since QR-IBAN
// (the common case for a business that specifically wants a QR-bill) is
// covered.
function isQrIban(iban: string): boolean {
  const iid = Number(iban.slice(4, 9));
  return iid >= 30000 && iid <= 31999;
}

// ISO 7064 MOD10 recursive ("Rekursives Modulo 10") — the checksum used by
// both the Swiss QRR reference and the older ESR reference. Table and
// algorithm are part of the public SIX specification, unchanged for
// decades.
const MOD10_TABLE = [
  [0, 9, 4, 6, 8, 2, 7, 1, 3, 5],
  [9, 4, 6, 8, 2, 7, 1, 3, 5, 0],
  [4, 6, 8, 2, 7, 1, 3, 5, 0, 9],
  [6, 8, 2, 7, 1, 3, 5, 0, 9, 4],
  [8, 2, 7, 1, 3, 5, 0, 9, 4, 6],
  [2, 7, 1, 3, 5, 0, 9, 4, 6, 8],
  [7, 1, 3, 5, 0, 9, 4, 6, 8, 2],
  [1, 3, 5, 0, 9, 4, 6, 8, 2, 7],
  [3, 5, 0, 9, 4, 6, 8, 2, 7, 1],
  [5, 0, 9, 4, 6, 8, 2, 7, 1, 3],
];
function mod10CheckDigit(digits: string): number {
  let carry = 0;
  for (const ch of digits) carry = MOD10_TABLE[carry][Number(ch)];
  return (10 - carry) % 10;
}

// 27-digit QRR reference, deterministically derived from the devis id so it
// never needs its own counter/column and always regenerates identically —
// useful since nothing about this reference is user-facing/editable.
// Not globally unique in a cryptographic sense, but collision odds at any
// real business's invoice volume are negligible.
function generateQrrReference(devisId: string): string {
  const hex = devisId.replace(/-/g, '');
  const digits = hex
    .split('')
    .map((ch) => String(parseInt(ch, 16) % 10))
    .join('')
    .padStart(26, '0')
    .slice(-26);
  return digits + mod10CheckDigit(digits);
}

function formatReferenceForDisplay(ref: string): string {
  // Grouped in blocks of 5 from the left after a leading 2-digit block —
  // matches how Swiss banking apps print it, e.g. "00 00000 00000 00202 60186".
  return ref.replace(/(.{2})(.{5})(.{5})(.{5})(.{5})(.{5})/, '$1 $2 $3 $4 $5 $6');
}

function sanitizeSpcField(text: string | null | undefined, maxLen: number): string {
  return (text ?? '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/[^\x00-\xFF]/g, '?')
    .trim()
    .slice(0, maxLen);
}

// Combined ("K") address type, not structured ("S") — Cantia stores
// addresses as a single free-text field (org.address, devis.client_address),
// not street/postal-code/town split out separately, and "K" is the SPC
// address type built for exactly that: two free address lines instead of a
// structured breakdown, with postal-code/town left blank.
interface QrBillParty {
  name: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  country?: string; // ISO 3166-1 alpha-2, defaults to "CH"
}

export interface QrBillData {
  iban: string;
  creditor: QrBillParty;
  amount: number;
  currency: 'CHF' | 'EUR';
  debtor: QrBillParty | null;
  referenceId: string; // stable id (e.g. devis.id) used to derive the QRR reference
  unstructuredMessage?: string;
}

// Builds the "Swiss QR Code" payload (a.k.a. SPC — Swiss Payments Code): a
// fixed-order, \r\n-separated text structure. Field order below must not
// change — this is what a banking app parses, not a human-readable format.
function buildSpcPayload(data: QrBillData): { payload: string; reference: string; referenceType: 'QRR' | 'NON' } {
  const iban = data.iban.replace(/\s+/g, '').toUpperCase();
  const qrIban = isQrIban(iban);
  const referenceType: 'QRR' | 'NON' = qrIban ? 'QRR' : 'NON';
  const reference = qrIban ? generateQrrReference(data.referenceId) : '';

  const lines: string[] = [
    'SPC', // QRType
    '0200', // Version
    '1', // Coding type: UTF-8
    iban,
    'K', // Creditor address type: combined (2 free-text lines)
    sanitizeSpcField(data.creditor.name, 70),
    sanitizeSpcField(data.creditor.addressLine1, 70),
    sanitizeSpcField(data.creditor.addressLine2, 70),
    '', // Postal code — left blank for combined ("K") addresses
    '', // Town — left blank for combined ("K") addresses
    data.creditor.country ?? 'CH',
    // Ultimate creditor block (6 fields) — deprecated by the spec since
    // 2020, must always be left blank.
    '',
    '',
    '',
    '',
    '',
    '',
    data.amount > 0 ? data.amount.toFixed(2) : '',
    data.currency,
    data.debtor ? 'K' : '',
    data.debtor ? sanitizeSpcField(data.debtor.name, 70) : '',
    data.debtor ? sanitizeSpcField(data.debtor.addressLine1, 70) : '',
    data.debtor ? sanitizeSpcField(data.debtor.addressLine2, 70) : '',
    '',
    '',
    data.debtor ? data.debtor.country ?? 'CH' : '',
    referenceType,
    reference,
    sanitizeSpcField(data.unstructuredMessage, 140),
    'EPD', // trailer
  ];

  return { payload: lines.join('\r\n'), reference, referenceType };
}

// Draws the QR module matrix as plain filled squares (no image embedding —
// robust against any raster/canvas dependency the qrcode package might
// pull in) plus the mandatory Swiss cross in a white box at its center.
function drawQrCode(page: PDFPage, payload: string, x: number, y: number, sizePt: number) {
  const qr = QRCode.create(payload, { errorCorrectionLevel: 'M' });
  const modules = qr.modules;
  // A camera scanner needs a blank "quiet zone" margin around the code to
  // detect it at all — the spec's 46x46mm box is meant to hold the code
  // *plus* that margin, not be filled edge-to-edge by modules. This was
  // previously missing entirely (modules stretched to fill the whole box),
  // which is the likely reason a generated bill failed to scan even with a
  // valid IBAN: the scanner's decoder never found the code in the image in
  // the first place. Standard minimum is 4 modules on each side.
  const quietModules = 4;
  const totalModules = modules.size + quietModules * 2;
  const moduleSize = sizePt / totalModules;
  const offset = quietModules * moduleSize;

  page.drawRectangle({ x, y, width: sizePt, height: sizePt, color: WHITE });
  for (let row = 0; row < modules.size; row++) {
    for (let col = 0; col < modules.size; col++) {
      if (!modules.get(row, col)) continue;
      page.drawRectangle({
        x: x + offset + col * moduleSize,
        y: y + sizePt - offset - (row + 1) * moduleSize,
        width: moduleSize,
        height: moduleSize,
        color: BLACK,
      });
    }
  }

  // Swiss cross: a white square with a black border, holding a black cross,
  // centered on the QR code — required by the spec at a fixed 7x7mm
  // regardless of the QR's own size, safe because error correction level M
  // tolerates it.
  const crossBox = mm(7);
  const cx = x + sizePt / 2;
  const cy = y + sizePt / 2;
  page.drawRectangle({ x: cx - crossBox / 2, y: cy - crossBox / 2, width: crossBox, height: crossBox, color: WHITE, borderColor: BLACK, borderWidth: 1 });
  const armW = crossBox * 0.22;
  const armL = crossBox * 0.62;
  page.drawRectangle({ x: cx - armW / 2, y: cy - armL / 2, width: armW, height: armL, color: BLACK });
  page.drawRectangle({ x: cx - armL / 2, y: cy - armW / 2, width: armL, height: armW, color: BLACK });
}

function partyLines(party: QrBillParty): string[] {
  return [party.name, party.addressLine1, party.addressLine2].filter((l): l is string => !!l && l.trim().length > 0);
}

// Draws the receipt + payment part (105mm-tall band across the full page
// width, per spec) either at the bottom of the page the caller's content
// just finished on (when there's enough clear space left below it) or on a
// fresh page — so a short devis/facture gets its QR-bill glued to the same
// page instead of always burning a whole extra page for it. `attachTo` is
// the last content page + the y cursor where that content stopped; pass
// null to always force a new page (used for custom-layout templates, whose
// free-form blocks don't leave a reliable single "content ended here" y).
// Returns whether it reused the caller's page — the caller needs this to
// know whether it still owes that page a normal footer (the band replaces
// it when reused) or not (a fresh QR-only page never gets one).
export async function appendQrBillPage(
  pdfDoc: PDFDocument,
  font: PDFFont,
  fontBold: PDFFont,
  data: QrBillData,
  attachTo: { page: PDFPage; y: number } | null = null,
): Promise<boolean> {
  const { payload, reference, referenceType } = buildSpcPayload(data);

  const bandH = mm(105);
  const GAP = 16; // breathing room between last content line and the band's perforation
  const reuseExistingPage = attachTo != null && attachTo.y - GAP > bandH;
  const page = reuseExistingPage ? attachTo!.page : pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const receiptW = mm(62);

  // Perforation cue (dashed line across the full width, top of the band) —
  // this page is meant to be a stand-alone bulletin, torn off from the rest
  // of the invoice in a printed copy.
  page.drawLine({
    start: { x: 0, y: bandH },
    end: { x: PAGE_WIDTH, y: bandH },
    thickness: 0.75,
    color: GREY,
    dashArray: [2, 2],
  });
  // Vertical perforation between receipt and payment part.
  page.drawLine({
    start: { x: receiptW, y: 0 },
    end: { x: receiptW, y: bandH },
    thickness: 0.75,
    color: GREY,
    dashArray: [2, 2],
  });

  const amountStr = data.amount > 0 ? data.amount.toFixed(2) : '';

  // --- Récépissé (left, 0-62mm) ---
  let ry = bandH - mm(10);
  const rx = mm(5);
  drawText(page, 'Récépissé', rx, ry, fontBold, 11, INK);
  ry -= mm(9);
  drawText(page, 'Compte / Payable à', rx, ry, fontBold, 6, INK);
  ry -= mm(3.5);
  for (const line of [formatIbanDisplay(data.iban), ...partyLines(data.creditor)]) {
    drawText(page, line, rx, ry, font, 8, INK);
    ry -= mm(3.5);
  }
  if (referenceType === 'QRR') {
    ry -= mm(2);
    drawText(page, 'Référence', rx, ry, fontBold, 6, INK);
    ry -= mm(3.5);
    drawText(page, formatReferenceForDisplay(reference), rx, ry, font, 8, INK);
  }
  if (data.debtor) {
    ry -= mm(5);
    drawText(page, 'Payable par', rx, ry, fontBold, 6, INK);
    ry -= mm(3.5);
    for (const line of partyLines(data.debtor)) {
      drawText(page, line, rx, ry, font, 8, INK);
      ry -= mm(3.5);
    }
  }
  drawText(page, 'Monnaie', rx, mm(15), fontBold, 6, INK);
  drawText(page, 'Montant', rx + mm(18), mm(15), fontBold, 6, INK);
  drawText(page, data.currency, rx, mm(11), font, 8, INK);
  if (amountStr) drawText(page, amountStr, rx + mm(18), mm(11), font, 8, INK);
  drawTextRight(page, 'Point de dépôt', receiptW - mm(5), mm(11), font, 6, GREY);

  // --- Section paiement (right, 62-210mm) ---
  const px = receiptW + mm(5);
  drawText(page, 'Section paiement', px, bandH - mm(10), fontBold, 11, INK);

  const qrSize = mm(46);
  const qrX = px;
  const qrY = bandH - mm(17) - qrSize;
  drawQrCode(page, payload, qrX, qrY, qrSize);

  drawText(page, 'Monnaie', qrX, qrY - mm(8), fontBold, 6, INK);
  drawText(page, 'Montant', qrX + mm(18), qrY - mm(8), fontBold, 6, INK);
  drawText(page, data.currency, qrX, qrY - mm(12), font, 8, INK);
  if (amountStr) drawText(page, amountStr, qrX + mm(18), qrY - mm(12), font, 8, INK);

  const infoX = receiptW + mm(70);
  const infoWidth = PAGE_WIDTH - infoX - mm(5);
  let iy = bandH - mm(17);
  drawText(page, 'Compte / Payable à', infoX, iy, fontBold, 6, INK);
  iy -= mm(3.5);
  for (const line of [formatIbanDisplay(data.iban), ...partyLines(data.creditor)]) {
    for (const wrapped of wrapText(line, font, 8, infoWidth)) {
      drawText(page, wrapped, infoX, iy, font, 8, INK);
      iy -= mm(3.5);
    }
  }
  if (referenceType === 'QRR') {
    iy -= mm(2);
    drawText(page, 'Référence', infoX, iy, fontBold, 6, INK);
    iy -= mm(3.5);
    drawText(page, formatReferenceForDisplay(reference), infoX, iy, font, 8, INK);
  }
  if (data.debtor) {
    iy -= mm(5);
    drawText(page, 'Payable par', infoX, iy, fontBold, 6, INK);
    iy -= mm(3.5);
    for (const line of partyLines(data.debtor)) {
      for (const wrapped of wrapText(line, font, 8, infoWidth)) {
        drawText(page, wrapped, infoX, iy, font, 8, INK);
        iy -= mm(3.5);
      }
    }
  }
  if (data.unstructuredMessage) {
    iy -= mm(5);
    drawText(page, 'Informations supplémentaires', infoX, iy, fontBold, 6, INK);
    iy -= mm(3.5);
    for (const wrapped of wrapText(data.unstructuredMessage, font, 8, infoWidth)) {
      drawText(page, wrapped, infoX, iy, font, 8, INK);
      iy -= mm(3.5);
    }
  }

  return reuseExistingPage;
}

function formatIbanDisplay(raw: string): string {
  return raw.replace(/\s+/g, '').toUpperCase().replace(/(.{4})/g, '$1 ').trim();
}
