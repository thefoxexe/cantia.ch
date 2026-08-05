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

// ISO 7064 MOD97-10 — the checksum shared by IBAN validation and the ISO
// 11649 structured creditor reference (SCOR) below. Digit-by-digit so it
// never needs a big-integer type for a 20+ digit number.
function mod97(digits: string): number {
  let remainder = 0;
  for (const ch of digits) {
    remainder = (remainder * 10 + Number(ch)) % 97;
  }
  return remainder;
}

export function isValidSwissIban(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const iban = raw.replace(/\s+/g, '').toUpperCase();
  if (!/^(CH|LI)\d{19}$/.test(iban)) return false;
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (ch) => String(ch.charCodeAt(0) - 55));
  return mod97(numeric) === 1;
}

// A QR-IBAN's bank clearing number (IID, IBAN chars 5-9) falls in the
// 30000-31999 range reserved for QR-IBANs — those require the proprietary
// 27-digit "QRR" reference below. Any other (regular) IBAN falls back to a
// "SCOR" (ISO 11649) structured creditor reference instead, which works
// with any valid IBAN — so a facture always gets a real, bank-recognized
// reference rather than silently having none.
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

// ISO 11649 structured creditor reference ("SCOR") — used when the org's
// IBAN is a regular IBAN rather than a QR-IBAN (the common case: a
// QR-IBAN has to be specifically requested from the bank). Works with any
// valid IBAN, unlike QRR.
function generateScorReference(devisId: string): string {
  const hex = devisId.replace(/-/g, '');
  const body = hex
    .split('')
    .map((ch) => String(parseInt(ch, 16) % 10))
    .join('')
    .slice(0, 18);
  // Check digit: append literal "RF00" (letters converted to digits per
  // ISO 11649: R=27, F=15) to the body, then 98 minus the MOD97-10
  // remainder of the whole thing — the same rearrange-and-mod97 pattern
  // used for IBAN validation above, just run in the "generate" direction.
  const checkDigits = String(98 - mod97(`${body}271500`)).padStart(2, '0');
  return `RF${checkDigits}${body}`;
}

function formatReferenceForDisplay(ref: string, type: 'QRR' | 'SCOR'): string {
  if (type === 'SCOR') return ref.replace(/(.{4})/g, '$1 ').trim();
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

// A party uses the structured ("S") SPC address type when postalCode and
// town are both known — the org's street/postal_code/locality columns,
// once filled in, give us that. Otherwise it falls back to combined ("K"):
// two free-text address lines with postal-code/town left blank. This is
// still the only option for a debtor, since devis/facture client addresses
// remain a single free-text field.
interface QrBillParty {
  name: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  postalCode?: string | null;
  town?: string | null;
  country?: string; // ISO 3166-1 alpha-2, defaults to "CH"
}

interface PartyAddressFields {
  type: 'S' | 'K';
  line1: string | null;
  line2: string | null;
  postalCode: string | null;
  town: string | null;
}

function partyAddressFields(party: QrBillParty): PartyAddressFields {
  if (party.postalCode?.trim() && party.town?.trim()) {
    return { type: 'S', line1: party.addressLine1 ?? null, line2: null, postalCode: party.postalCode, town: party.town };
  }
  return { type: 'K', line1: party.addressLine1 ?? null, line2: party.addressLine2 ?? null, postalCode: null, town: null };
}

export interface QrBillData {
  iban: string;
  creditor: QrBillParty;
  amount: number;
  currency: 'CHF' | 'EUR';
  debtor: QrBillParty | null;
  referenceId: string; // stable id (facture.id) used to derive the QRR/SCOR reference
  unstructuredMessage?: string;
}

// Builds the "Swiss QR Code" payload (a.k.a. SPC — Swiss Payments Code): a
// fixed-order, \r\n-separated text structure. Field order below must not
// change — this is what a banking app parses, not a human-readable format.
function buildSpcPayload(data: QrBillData): { payload: string; reference: string; referenceType: 'QRR' | 'SCOR' } {
  const iban = data.iban.replace(/\s+/g, '').toUpperCase();
  const qrIban = isQrIban(iban);
  const referenceType: 'QRR' | 'SCOR' = qrIban ? 'QRR' : 'SCOR';
  const reference = qrIban ? generateQrrReference(data.referenceId) : generateScorReference(data.referenceId);
  const creditorFields = partyAddressFields(data.creditor);
  const debtorFields = data.debtor ? partyAddressFields(data.debtor) : null;

  const lines: string[] = [
    'SPC', // QRType
    '0200', // Version
    '1', // Coding type: UTF-8
    iban,
    creditorFields.type, // Creditor address type: structured ("S") or combined ("K")
    sanitizeSpcField(data.creditor.name, 70),
    sanitizeSpcField(creditorFields.line1, 70),
    sanitizeSpcField(creditorFields.line2, 70),
    sanitizeSpcField(creditorFields.postalCode, 16),
    sanitizeSpcField(creditorFields.town, 35),
    data.creditor.country ?? 'CH',
    // Ultimate creditor block — deprecated by the spec since 2020, must
    // always be left blank, but it mirrors the Creditor block's own
    // structure exactly: 7 fields (address type, name, 2 address lines,
    // postal code, town, country), not 6. This block previously had only 6
    // blank fields, which silently shifted every field after it (amount,
    // currency, debtor block, reference, message) out of position — the QR
    // still scanned as *a* QR code, but a banking app's strict SPC parser
    // would reject the misaligned payload outright, which is almost
    // certainly why real banking apps couldn't read a generated bill.
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    data.amount > 0 ? data.amount.toFixed(2) : '',
    data.currency,
    debtorFields ? debtorFields.type : '',
    data.debtor ? sanitizeSpcField(data.debtor.name, 70) : '',
    debtorFields ? sanitizeSpcField(debtorFields.line1, 70) : '',
    debtorFields ? sanitizeSpcField(debtorFields.line2, 70) : '',
    debtorFields ? sanitizeSpcField(debtorFields.postalCode, 16) : '',
    debtorFields ? sanitizeSpcField(debtorFields.town, 35) : '',
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
  // Correction (verified against the official SIX "Swiss Implementation
  // Guidelines for the QR-bill" and an independent open-source generator):
  // the payload's "Coding Type" field (value "1", line 3 in buildSpcPayload)
  // means UTF-8 restricted to the Latin character set — not Latin-1. A
  // previous version of this function force-encoded the payload as Latin-1
  // bytes based on a wrong reading of the spec, which is itself invalid
  // per the declared coding type and likely made strict parsers reject it
  // rather than fix anything. QRCode.create with a plain JS string already
  // UTF-8-encodes the Byte-mode segment by default, which is correct here.
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
  const townLine = party.postalCode?.trim() && party.town?.trim() ? `${party.postalCode} ${party.town}` : null;
  return [party.name, party.addressLine1, townLine ?? party.addressLine2].filter((l): l is string => !!l && l.trim().length > 0);
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
  ry -= mm(2);
  drawText(page, 'Référence', rx, ry, fontBold, 6, INK);
  ry -= mm(3.5);
  drawText(page, formatReferenceForDisplay(reference, referenceType), rx, ry, font, 8, INK);
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
  iy -= mm(2);
  drawText(page, 'Référence', infoX, iy, fontBold, 6, INK);
  iy -= mm(3.5);
  drawText(page, formatReferenceForDisplay(reference, referenceType), infoX, iy, font, 8, INK);
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
