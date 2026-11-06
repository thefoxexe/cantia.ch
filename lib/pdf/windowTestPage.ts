// "Imprimer une page test" (Compte → Apparence): an A4 page with a sample
// address exactly where devis and factures print it when the address is set
// to the right (envelope window), the zone a Swiss right-window envelope
// shows, and the fold marks. Printed, folded and slipped into an envelope,
// it tells whether the offsets need a few millimetres more.
//
// Same position as supabase/functions/_shared/pdf-document-renderers.ts
// (windowAddressBox) — keep the two in step.
import { Platform } from 'react-native';
import { loadPdfLib } from '../loadPdfLib';

export const WINDOW_ADDRESS_LEFT_MM = 118;
export const WINDOW_ADDRESS_TOP_MM = 59;
// What a right-window envelope always shows of an A4 page, folded in three
// (C5/6) or in two (C5), whatever the play of the sheet inside.
const ZONE = { left: 100, right: 200, top: 57, bottom: 84 };
const FOLDS = [
  { mm: 99, label: 'A' },
  { mm: 198, label: 'A' },
  { mm: 148.5, label: 'B' },
];

export interface WindowTestTexts {
  title: string;
  steps: string[];
  zone: string;
  foldThirds: string; // "A : pli en trois (C5/6)"
  foldHalf: string; // "B : pli en deux (C5)"
  offsets: string; // "Décalage : {{x}} mm à droite, {{y}} mm vers le bas"
  sampleAddress: string[];
}

const MM = 72 / 25.4;
const W = 595.28;
const H = 841.89;

export async function buildWindowTestPdf(offsetXmm: number, offsetYmm: number, texts: WindowTestTexts): Promise<Uint8Array> {
  const lib = (await loadPdfLib()) as any;
  const doc = await lib.PDFDocument.create();
  const page = doc.addPage([W, H]);
  const font = await doc.embedFont(lib.StandardFonts.Helvetica);
  const bold = await doc.embedFont(lib.StandardFonts.HelveticaBold);
  const ink = lib.rgb(0.1, 0.1, 0.1);
  const muted = lib.rgb(0.45, 0.45, 0.45);
  const red = lib.rgb(0.85, 0.15, 0.15);
  const y = (mm: number) => H - mm * MM;
  // Helvetica only knows WinAnsi: "→" becomes ">", anything else unknown goes.
  const safe = (s: string) => s.replace(/→/g, '>').replace(/[^\x20-\x7E\u00A0-\u00FF\u2013\u2014\u2019]/g, '');

  // Window zone, dashed.
  page.drawRectangle({
    x: ZONE.left * MM,
    y: y(ZONE.bottom),
    width: (ZONE.right - ZONE.left) * MM,
    height: (ZONE.bottom - ZONE.top) * MM,
    borderColor: red,
    borderWidth: 0.8,
    borderDashArray: [4, 3],
  });
  page.drawText(safe(texts.zone), { x: ZONE.left * MM, y: y(ZONE.bottom) - 10, size: 7.5, font, color: red });

  // Sample address where the documents print it.
  let ay = y(WINDOW_ADDRESS_TOP_MM + offsetYmm) - 10.5;
  for (const line of texts.sampleAddress) {
    page.drawText(safe(line), { x: (WINDOW_ADDRESS_LEFT_MM + offsetXmm) * MM, y: ay, size: 10.5, font, color: ink });
    ay -= 13;
  }

  // Fold marks on both edges.
  for (const f of FOLDS) {
    const fy = y(f.mm);
    page.drawLine({ start: { x: 0, y: fy }, end: { x: 8 * MM, y: fy }, thickness: 0.6, color: muted });
    page.drawLine({ start: { x: W - 8 * MM, y: fy }, end: { x: W, y: fy }, thickness: 0.6, color: muted });
    page.drawText(f.label, { x: 9 * MM, y: fy - 3, size: 7, font, color: muted });
  }

  // Instructions on the left, below the window zone.
  let ty = y(108);
  page.drawText(safe(texts.title), { x: 20 * MM, y: ty, size: 13, font: bold, color: ink });
  ty -= 22;
  for (const step of texts.steps) {
    for (const line of wrap(safe(step), font, 9.5, 165 * MM)) {
      page.drawText(line, { x: 20 * MM, y: ty, size: 9.5, font, color: ink });
      ty -= 13;
    }
    ty -= 4;
  }
  ty -= 6;
  for (const line of [texts.foldThirds, texts.foldHalf, texts.offsets]) {
    page.drawText(safe(line), { x: 20 * MM, y: ty, size: 8.5, font, color: muted });
    ty -= 12;
  }
  return doc.save();
}

function wrap(text: string, font: any, size: number, max: number): string[] {
  const out: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > max && line) {
      out.push(line);
      line = word;
    } else line = next;
  }
  if (line) out.push(line);
  return out;
}

// Web: the PDF is saved (a new tab is unreliable in some browsers).
export async function downloadWindowTestPage(offsetXmm: number, offsetYmm: number, texts: WindowTestTexts, filename: string): Promise<{ error: string | null }> {
  if (Platform.OS !== 'web') return { error: null };
  try {
    const bytes = await buildWindowTestPdf(offsetXmm, offsetYmm, texts);
    const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}
