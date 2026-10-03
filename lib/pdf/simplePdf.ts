// A tiny, dependency-free PDF writer for one-page summaries generated in
// the browser (the public salary calculator's « Télécharger mon calcul »).
// Standard Helvetica / Helvetica-Bold with WinAnsi encoding, so French,
// German and Italian text renders without embedding a font. Strings are
// written as hex, which keeps the whole file ASCII and the xref offsets
// equal to string lengths. Coordinates are in points from the TOP-left
// corner (converted to PDF's bottom-left origin here).

export type Rgb = [number, number, number]; // 0-255

const A4: [number, number] = [595.28, 841.89];

// Helvetica advance widths (1/1000 em) for ASCII 32-126.
const HELV = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667,
  722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556,
  278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];
// Helvetica-Bold, same range.
const HELV_B = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, 975, 722, 722,
  722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556, 333, 556, 611, 556, 611, 556,
  333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,
];

// Characters outside Latin-1 that WinAnsi still has.
const WIN_ANSI_EXTRA: Record<string, number> = {
  '€': 0x80, '‚': 0x82, '„': 0x84, '…': 0x85, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97, 'Œ': 0x8c, 'œ': 0x9c,
};

function winAnsi(s: string): number[] {
  const out: number[] = [];
  for (const ch of s.normalize('NFC')) {
    if (WIN_ANSI_EXTRA[ch] != null) out.push(WIN_ANSI_EXTRA[ch]);
    else if (ch === '−') out.push(0x2d); // minus sign
    else if (ch === '→') out.push(0x3e);
    else if (ch === ' ' || ch === ' ') out.push(0x20); // (narrow) no-break spaces
    else {
      const c = ch.codePointAt(0)!;
      out.push(c < 256 ? c : 0x3f);
    }
  }
  return out;
}

// Accented letters take the width of their base letter.
function charWidth(code: number, bold: boolean): number {
  const table = bold ? HELV_B : HELV;
  if (code >= 32 && code <= 126) return table[code - 32];
  if (code === 0x92 || code === 0x91) return 222;
  if (code === 0x96) return 556;
  if (code === 0x97) return 1000;
  if (code === 0x85) return 1000;
  if (code === 0xa0) return 278;
  if (code === 0xb7) return 278;
  const base = String.fromCharCode(code).normalize('NFD')[0];
  const b = base.charCodeAt(0);
  return b >= 32 && b <= 126 ? table[b - 32] : 556;
}

export function textWidth(s: string, size: number, bold = false): number {
  return (winAnsi(s).reduce((w, c) => w + charWidth(c, bold), 0) * size) / 1000;
}

export function wrapText(s: string, size: number, maxWidth: number, bold = false): string[] {
  const words = s.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && textWidth(next, size, bold) > maxWidth) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

const f = (n: number) => (Math.round(n * 100) / 100).toString();
const col = (c: Rgb) => c.map((v) => f(v / 255)).join(' ');
const hex = (s: string) => `<${winAnsi(s).map((b) => b.toString(16).padStart(2, '0')).join('')}>`;

export class SimplePdf {
  readonly width = A4[0];
  readonly height = A4[1];
  private pages: { ops: string[]; links: { x: number; y: number; w: number; h: number; url: string }[] }[] = [{ ops: [], links: [] }];
  private current = 0;
  private get ops() {
    return this.pages[this.current].ops;
  }
  private get links() {
    return this.pages[this.current].links;
  }

  // Starts a new page; drawing calls go to it from now on.
  addPage() {
    this.pages.push({ ops: [], links: [] });
    this.current = this.pages.length - 1;
  }

  // Draw on an existing page again (e.g. « page 2 / 5 » once all pages exist).
  goToPage(index: number) {
    this.current = Math.max(0, Math.min(this.pages.length - 1, index));
  }

  get pageCount() {
    return this.pages.length;
  }

  text(s: string, x: number, y: number, opts: { size?: number; bold?: boolean; color?: Rgb; align?: 'left' | 'right' } = {}) {
    const size = opts.size ?? 10;
    const w = opts.align === 'right' ? textWidth(s, size, opts.bold) : 0;
    this.ops.push(`BT /${opts.bold ? 'F2' : 'F1'} ${f(size)} Tf ${col(opts.color ?? [35, 26, 18])} rg ${f(x - w)} ${f(this.height - y)} Td ${hex(s)} Tj ET`);
  }

  // Wrapped paragraph; returns the y below the last line.
  paragraph(s: string, x: number, y: number, maxWidth: number, opts: { size?: number; bold?: boolean; color?: Rgb; leading?: number } = {}): number {
    const size = opts.size ?? 10;
    const leading = opts.leading ?? size * 1.4;
    for (const line of wrapText(s, size, maxWidth, opts.bold)) {
      this.text(line, x, y, opts);
      y += leading;
    }
    return y;
  }

  rect(x: number, y: number, w: number, h: number, fill: Rgb) {
    this.ops.push(`${col(fill)} rg ${f(x)} ${f(this.height - y - h)} ${f(w)} ${f(h)} re f`);
  }

  line(x1: number, y1: number, x2: number, y2: number, color: Rgb = [216, 200, 176], width = 0.6) {
    this.ops.push(`${col(color)} RG ${f(width)} w ${f(x1)} ${f(this.height - y1)} m ${f(x2)} ${f(this.height - y2)} l S`);
  }

  link(x: number, y: number, w: number, h: number, url: string) {
    this.links.push({ x, y, w, h, url });
  }

  // The whole file as a string of ASCII characters.
  build(title: string): string {
    // Object numbers: 1 catalog, 2 pages, 3 font, 4 bold font, then per page
    // [page, content, ...links], then info.
    const objs: string[] = [];
    objs.push('<< /Type /Catalog /Pages 2 0 R >>');
    objs.push(''); // pages, filled in below
    objs.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    objs.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    const pageIds: number[] = [];
    for (const page of this.pages) {
      const pageId = objs.length + 1;
      const contentId = pageId + 1;
      const annotIds = page.links.map((_, i) => contentId + 1 + i);
      pageIds.push(pageId);
      objs.push(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${f(this.width)} ${f(this.height)}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R${
          annotIds.length ? ` /Annots [${annotIds.map((id) => `${id} 0 R`).join(' ')}]` : ''
        } >>`,
      );
      const content = page.ops.join('\n');
      objs.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
      for (const l of page.links) {
        const y1 = this.height - l.y - l.h;
        objs.push(`<< /Type /Annot /Subtype /Link /Rect [${f(l.x)} ${f(y1)} ${f(l.x + l.w)} ${f(y1 + l.h)}] /Border [0 0 0] /A << /S /URI /URI (${l.url.replace(/[()\\]/g, '')}) >> >>`);
      }
    }
    objs[1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
    objs.push(`<< /Title ${hex(title)} /Producer (Cantia) >>`);
    const infoId = objs.length;

    let out = '%PDF-1.4\n';
    const offsets: number[] = [];
    objs.forEach((o, i) => {
      offsets.push(out.length);
      out += `${i + 1} 0 obj\n${o}\nendobj\n`;
    });
    const xref = out.length;
    out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
    for (const off of offsets) out += `${String(off).padStart(10, '0')} 00000 n \n`;
    out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R /Info ${infoId} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
    return out;
  }
}

// Browser download of a built PDF. No-op outside the web.
export function downloadPdf(pdf: string, filename: string): boolean {
  if (typeof document === 'undefined') return false;
  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i) & 0xff;
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return true;
}
