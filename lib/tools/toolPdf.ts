import { SimplePdf, downloadPdf, type Rgb } from '../pdf/simplePdf';

// One-page PDF for the free tools on cantia.ch/outils: title, the inputs,
// the results (one highlighted), notes and the Cantia call to action.

export interface PdfRow {
  label: string;
  value: string;
  strong?: boolean;
}

const INK: Rgb = [35, 26, 18];
const MUTED: Rgb = [110, 97, 83];
const BRAND: Rgb = [169, 92, 48];
const DARK: Rgb = [124, 59, 33];

export function downloadToolPdf(opts: {
  title: string;
  url: string; // cantia.ch/outils/…
  inputs: PdfRow[];
  results: PdfRow[];
  highlight?: PdfRow;
  notes?: string[];
  cta: string;
  file: string;
}) {
  const doc = new SimplePdf();
  const L = 48;
  const R = doc.width - 48;
  const W = R - L;
  doc.rect(0, 0, doc.width, 6, BRAND);
  doc.text('CANTIA', L, 40, { size: 11, bold: true, color: BRAND });
  doc.text(opts.title, L, 66, { size: 19, bold: true });
  const date = new Date().toLocaleDateString('fr-CH');
  doc.text(`${date} · ${opts.url}`, L, 82, { size: 8.5, color: MUTED });

  let y = 108;
  const section = (title: string, rows: PdfRow[]) => {
    doc.text(title.toUpperCase(), L, y, { size: 7.5, bold: true, color: MUTED });
    y += 8;
    for (const r of rows) {
      y += 17;
      doc.line(L, y - 12, R, y - 12);
      doc.text(r.label, L, y, { size: 9.5, bold: r.strong });
      doc.text(r.value, R, y, { size: 9.5, bold: r.strong, align: 'right' });
    }
    y += 22;
  };
  section('Données', opts.inputs);
  if (opts.highlight) {
    doc.rect(L, y - 6, W, 46, INK);
    doc.text(opts.highlight.label.toUpperCase(), L + 14, y + 10, { size: 7.5, bold: true, color: [232, 201, 168] });
    doc.text(opts.highlight.value, L + 14, y + 31, { size: 18, bold: true, color: [251, 246, 238] });
    y += 60;
  }
  section('Résultat', opts.results);
  for (const n of opts.notes ?? []) y = doc.paragraph(n, L, y, W, { size: 8.5, color: MUTED, leading: 11.5 }) + 4;

  const ctaY = Math.max(y + 16, doc.height - 92);
  doc.rect(L, ctaY, W, 34, DARK);
  doc.text(opts.cta, L + 14, ctaY + 21, { size: 9.5, bold: true, color: [251, 246, 238] });
  doc.link(L, ctaY, W, 34, 'https://cantia.ch');
  doc.paragraph('Résultat indicatif, calculé avec les règles suisses en vigueur. Vérifiez les cas particuliers avec votre fiduciaire.', L, ctaY + 50, W, { size: 7, color: MUTED, leading: 9 });
  downloadPdf(doc.build(opts.title), opts.file);
}

export function chf(n: number, decimals = 2): string {
  const [int, dec] = Math.abs(n).toFixed(decimals).split('.');
  return `${n < 0 ? '−' : ''}${int.replace(/\B(?=(\d{3})+(?!\d))/g, '’')}${dec ? `.${dec}` : ''}`;
}

export function num(s: string): number {
  const n = Number(String(s).replace(/[’'\s]/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

export const pct = (n: number, d = 2) => `${Number(n.toFixed(d)).toString().replace('.', ',')} %`;
