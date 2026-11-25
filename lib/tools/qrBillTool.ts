import { loadPdfLib } from '../loadPdfLib';
import { appendQrBillPage, isValidSwissIban } from './qrbill/qrbill';
import type { PdfLocale } from './qrbill/pdf-i18n';

// Free QR-bill generator (cantia.ch/outils/qr-facture): the same renderer
// as Cantia's real invoices (supabase/functions/_shared/qrbill.ts), run in
// the browser. Nothing is sent anywhere: the PDF is built on the device.

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

export function qrToolErrors(i: QrToolInput): string[] {
  const e: string[] = [];
  if (!isValidSwissIban(i.iban)) e.push('iban');
  if (!i.creditorName.trim() || !i.creditorPostalCode.trim() || !i.creditorTown.trim()) e.push('creditor');
  if (!(i.amount > 0) || i.amount > 999999999.99) e.push('amount');
  return e;
}

function randomId(): string {
  const c = (globalThis as any).crypto;
  if (c?.randomUUID) return c.randomUUID();
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

export async function buildQrBillPdf(i: QrToolInput, locale: PdfLocale, title: string): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = (await loadPdfLib()) as unknown as typeof import('pdf-lib');
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const page = pdfDoc.addPage([595.28, 841.89]);
  const ink = rgb(0.13, 0.14, 0.12);
  const muted = rgb(0.4, 0.42, 0.38);
  page.drawText(i.creditorName.trim(), { x: 50, y: 780, size: 15, font: fontBold, color: ink });
  const addr = [i.creditorStreet.trim(), `${i.creditorPostalCode.trim()} ${i.creditorTown.trim()}`].filter(Boolean).join(' · ');
  page.drawText(addr, { x: 50, y: 762, size: 9, font, color: muted });
  page.drawText(title, { x: 50, y: 712, size: 20, font: fontBold, color: ink });
  if (i.message.trim()) page.drawText(i.message.trim().slice(0, 90), { x: 50, y: 690, size: 11, font, color: ink });
  const debtor = i.debtorName.trim()
    ? { name: i.debtorName.trim(), addressLine1: i.debtorStreet.trim() || null, postalCode: i.debtorPostalCode.trim() || null, town: i.debtorTown.trim() || null }
    : null;
  await appendQrBillPage(
    pdfDoc,
    font,
    fontBold,
    {
      iban: i.iban,
      creditor: { name: i.creditorName.trim(), addressLine1: i.creditorStreet.trim() || null, postalCode: i.creditorPostalCode.trim(), town: i.creditorTown.trim() },
      amount: Math.round(i.amount * 100) / 100,
      currency: 'CHF',
      debtor,
      referenceId: randomId(),
      unstructuredMessage: i.message.trim() || undefined,
    },
    { page, y: 660 },
    locale,
  );
  return pdfDoc.save();
}

export function downloadBytes(bytes: Uint8Array, filename: string): void {
  if (typeof document === 'undefined') return;
  const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
