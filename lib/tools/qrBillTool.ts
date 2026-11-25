import { loadPdfLib } from '../loadPdfLib';
import { appendQrBillPage, isValidSwissIban, swissQrPayload, swissQrSvg, type QrBillData } from './qrbill/qrbill';
import type { PdfLocale } from './qrbill/pdf-i18n';

// Free Swiss QR code generator (cantia.ch/outils/qr-facture): the same
// payload and renderer as Cantia's real invoices (supabase/functions/_shared/
// qrbill.ts), run in the browser. It makes the QR code alone (PNG or SVG),
// or the payment part on its own page; never an invoice. Nothing is sent
// anywhere.

export interface QrToolInput {
  iban: string;
  creditorName: string;
  creditorStreet: string;
  creditorPostalCode: string;
  creditorTown: string;
  amount: number;
  debtorName: string;
  debtorStreet: string;
  debtorPostalCode: string;
  debtorTown: string;
  message: string;
}

// The amount is optional for the QR code (the payer then types it in their
// e-banking). The printed payment part still asks for one.
export function qrToolErrors(i: QrToolInput, needAmount = false): string[] {
  const e: string[] = [];
  if (!isValidSwissIban(i.iban)) e.push('iban');
  if (!i.creditorName.trim() || !i.creditorPostalCode.trim() || !i.creditorTown.trim()) e.push('creditor');
  if (i.amount < 0 || i.amount > 999999999.99 || Number.isNaN(i.amount) || (needAmount && !(i.amount > 0))) e.push('amount');
  return e;
}

function randomId(): string {
  const c = (globalThis as any).crypto;
  if (c?.randomUUID) return c.randomUUID();
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

function qrData(i: QrToolInput, referenceId: string): QrBillData {
  const debtor = i.debtorName.trim()
    ? { name: i.debtorName.trim(), addressLine1: i.debtorStreet.trim() || null, postalCode: i.debtorPostalCode.trim() || null, town: i.debtorTown.trim() || null }
    : null;
  return {
    iban: i.iban,
    creditor: { name: i.creditorName.trim(), addressLine1: i.creditorStreet.trim() || null, postalCode: i.creditorPostalCode.trim(), town: i.creditorTown.trim() },
    amount: i.amount > 0 ? Math.round(i.amount * 100) / 100 : 0,
    currency: 'CHF',
    debtor,
    referenceId,
    unstructuredMessage: i.message.trim() || undefined,
  };
}

// One reference per generated code (SCOR derived from a random id), so the
// preview and the downloaded file carry the same reference.
export function newReferenceId(): string {
  return randomId();
}

export function buildQrSvg(i: QrToolInput, referenceId: string, sizePx = 1000): string {
  return swissQrSvg(swissQrPayload(qrData(i, referenceId)), sizePx);
}

export function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// PNG for people who paste the code in Word, a website or a flyer.
export async function svgToPng(svg: string, sizePx = 1000): Promise<Blob> {
  const img = new Image();
  img.src = svgDataUrl(svg);
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = sizePx;
  canvas.height = sizePx;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, sizePx, sizePx);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('png'))), 'image/png'));
}

// The official payment part (receipt + payment part) alone at the bottom of
// an A4 page, to print and cut. No header, no title: not an invoice.
export async function buildQrBillPdf(i: QrToolInput, locale: PdfLocale, referenceId: string): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts } = (await loadPdfLib()) as unknown as typeof import('pdf-lib');
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const page = pdfDoc.addPage([595.28, 841.89]);
  await appendQrBillPage(pdfDoc, font, fontBold, qrData(i, referenceId), { page, y: 800 }, locale);
  return pdfDoc.save();
}

export function downloadBlob(data: Blob | Uint8Array | string, filename: string, type: string): void {
  if (typeof document === 'undefined') return;
  const blob = data instanceof Blob ? data : new Blob([data as BlobPart], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
