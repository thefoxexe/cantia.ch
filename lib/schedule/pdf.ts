// Planning de chantier → PDF (cahier des charges §4.9): A3 landscape, the
// chantier and period on top, then the lines (phase, task, trade, company,
// dates, duration, progress) with their bars on a time scale, a legend and
// the generation date. Pages follow each other when the lines don't fit.
// pdf-lib is passed in (browser: loaded from cdnjs; tests: the npm package).

import { addDays, daysBetween, type Rolled, type ScheduleItem } from './calc.ts';
import { fill, shortDate, type ScheduleCopy } from './copy.ts';

export interface PdfRow {
  item: ScheduleItem;
  depth: number;
}

const W = 1190.55;
const H = 841.89;
const M = 28;
const ROW_H = 15;
const TABLE = { name: 210, trade: 92, company: 92, start: 46, end: 46, dur: 34, prog: 34 };
const TABLE_W = Object.values(TABLE).reduce((a, b) => a + b, 0);

function hex(pdf: any, h: string) {
  const n = parseInt(h.slice(1), 16);
  return pdf.rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

const PALETTE = ['#B4532A', '#2F6F8F', '#5B7F3A', '#8A5A9E', '#C08A1E', '#3E8C84', '#A0465C', '#4F6BB5', '#7A6A4F', '#2E7D5B'];
function tradeHex(trade: string | null): string {
  if (!trade) return '#7C8A86';
  let h = 0;
  for (const ch of trade) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export async function buildSchedulePdf(
  pdf: any,
  opts: { c: ScheduleCopy; project: string; rows: PdfRow[]; rolled: Map<string, Rolled>; from: string; to: string; today: string; generatedAt: string },
): Promise<Uint8Array> {
  const { c, rows, rolled, from, to, today } = opts;
  const doc = await pdf.PDFDocument.create();
  const font = await doc.embedFont(pdf.StandardFonts.Helvetica);
  const bold = await doc.embedFont(pdf.StandardFonts.HelveticaBold);
  const ink = hex(pdf, '#1F2624');
  const muted = hex(pdf, '#6B7672');
  const line = hex(pdf, '#DCE1DF');
  const red = hex(pdf, '#C0392B');
  const green = hex(pdf, '#2E7D5B');
  const dark = hex(pdf, '#3B4441');

  // Helvetica only knows WinAnsi: an unknown character loses its accent, or
  // goes — only that one, not the whole line.
  const safe = (f: any, t: string) => {
    const s = t.replace(/→/g, '–');
    try {
      f.widthOfTextAtSize(s, 8);
      return s;
    } catch {
      return [...s]
        .map((ch) => {
          try {
            f.widthOfTextAtSize(ch, 8);
            return ch;
          } catch {
            return ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7e]/g, '');
          }
        })
        .join('');
    }
  };
  const fit = (f: any, t: string, size: number, max: number) => {
    let s = safe(f, t);
    while (s.length > 1 && f.widthOfTextAtSize(s, size) > max) s = s.slice(0, -2) + '…';
    return safe(f, s);
  };
  const text = (page: any, t: string, x: number, y: number, size: number, f = font, color = ink, max?: number) =>
    page.drawText(max ? fit(f, t, size, max) : safe(f, t), { x, y, size, font: f, color });

  const days = Math.max(1, daysBetween(from, to) + 1);
  const chartX = M + TABLE_W + 8;
  const chartW = W - M - chartX;
  const px = chartW / days;
  const xOf = (d: string) => chartX + Math.max(0, Math.min(days, daysBetween(from, d))) * px;

  const top = H - M - 54; // below the title block
  const perPage = Math.floor((top - 34 - M - 40) / ROW_H);
  const pages = Math.max(1, Math.ceil(rows.length / perPage));

  for (let p = 0; p < pages; p++) {
    const page = doc.addPage([W, H]);
    // title block
    text(page, `${c.pdfTitle} — ${opts.project}`, M, H - M - 16, 16, bold);
    text(page, `${c.pdfPeriod} : ${shortDate(from)} → ${shortDate(to)}`, M, H - M - 34, 9.5, font, muted);
    const gen = fill(c.pdfGenerated, { date: opts.generatedAt });
    text(page, `${gen}   ·   ${p + 1} / ${pages}`, W - M - font.widthOfTextAtSize(safe(font, `${gen}   ·   ${p + 1} / ${pages}`), 9) , H - M - 34, 9, font, muted);

    // column heads + time scale
    const hy = top - 12;
    let cx = M;
    for (const [k, w] of Object.entries(TABLE)) {
      const label = { name: c.colName, trade: c.colTrade, company: c.company, start: c.colStart, end: c.colEnd, dur: c.colDuration, prog: '%' }[k]!;
      text(page, label.toUpperCase(), cx + 2, hy, 6.5, bold, muted, w - 4);
      cx += w;
    }
    // months and weeks
    for (let i = 0; i < days; i++) {
      const d = addDays(from, i);
      const x = chartX + i * px;
      // the first month only when it shows long enough not to collide
      if ((i === 0 && daysBetween(d, `${d.slice(0, 8)}28`) > 7) || d.endsWith('-01')) text(page, `${c.months[Number(d.slice(5, 7)) - 1]} ${d.slice(0, 4)}`, x + 2, top - 2, 7.5, bold, ink, 120);
      if (new Date(`${d}T00:00:00Z`).getUTCDay() === 1) {
        page.drawLine({ start: { x, y: top - 20 }, end: { x, y: M + 40 }, thickness: 0.3, color: line });
        if (px * 7 > 22) text(page, `${Number(d.slice(8, 10))}.${Number(d.slice(5, 7))}`, x + 1.5, hy, 6, font, muted);
      }
    }
    page.drawLine({ start: { x: M, y: top - 20 }, end: { x: W - M, y: top - 20 }, thickness: 0.8, color: ink });

    // rows
    const slice = rows.slice(p * perPage, (p + 1) * perPage);
    slice.forEach(({ item, depth }, i) => {
      const y = top - 20 - (i + 1) * ROW_H;
      const r = rolled.get(item.id);
      const phase = item.kind === 'phase';
      if (phase) page.drawRectangle({ x: M, y, width: W - 2 * M, height: ROW_H, color: hex(pdf, '#F4F1EC') });
      page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.3, color: line });
      const ty = y + 4.5;
      let x = M;
      text(page, item.name, x + 3 + depth * 9, ty, 7.5, phase ? bold : font, ink, TABLE.name - 6 - depth * 9);
      x += TABLE.name;
      text(page, item.trade ?? '', x + 2, ty, 7, font, ink, TABLE.trade - 4);
      x += TABLE.trade;
      text(page, item.company ?? '', x + 2, ty, 7, font, ink, TABLE.company - 4);
      x += TABLE.company;
      text(page, shortDate(r?.start ?? null), x + 2, ty, 7, font, ink);
      x += TABLE.start;
      text(page, shortDate(r?.end ?? null), x + 2, ty, 7, font, r?.late ? red : ink);
      x += TABLE.end;
      text(page, item.kind === 'task' && item.duration != null ? `${item.duration} ${c.days}` : '', x + 2, ty, 7, font, ink);
      x += TABLE.dur;
      text(page, item.kind === 'milestone' ? '' : `${r?.progress ?? 0}`, x + 2, ty, 7, font, ink);

      // bar
      if (!r?.start || !r.end || r.end < from || r.start > to) return;
      const bx = xOf(r.start);
      const bw = Math.max(1.5, xOf(addDays(r.end, 1)) - bx);
      if (item.kind === 'milestone') {
        const cx2 = bx + px / 2;
        const cy = y + ROW_H / 2;
        page.drawSvgPath(`M ${cx2} ${-cy - 4} L ${cx2 + 4} ${-cy} L ${cx2} ${-cy + 4} L ${cx2 - 4} ${-cy} Z`, { x: 0, y: 0, color: r.late ? red : item.status === 'done' ? green : dark });
        return;
      }
      if (phase) {
        page.drawRectangle({ x: bx, y: y + 5, width: bw, height: 4.5, color: dark });
        page.drawRectangle({ x: bx, y: y + 5, width: (bw * (r.progress ?? 0)) / 100, height: 4.5, color: green });
        return;
      }
      const col = hex(pdf, tradeHex(item.trade));
      page.drawRectangle({ x: bx, y: y + 3, width: bw, height: ROW_H - 6, color: col, opacity: 0.25, borderColor: r.late ? red : col, borderWidth: r.late ? 1.2 : 0.6 });
      const prog = item.status === 'done' ? 100 : r.progress;
      if (prog) page.drawRectangle({ x: bx, y: y + 3, width: (bw * prog) / 100, height: ROW_H - 6, color: col, opacity: 0.85 });
    });

    // today
    if (today >= from && today <= to) {
      const tx = xOf(today) + px / 2;
      page.drawLine({ start: { x: tx, y: top - 20 }, end: { x: tx, y: M + 40 }, thickness: 1, color: red, opacity: 0.7 });
    }

    // legend
    const ly = M + 16;
    text(page, `${c.pdfLegend} :`, M, ly, 7.5, bold);
    let lx = M + 50;
    const item = (draw: () => void, label: string) => {
      draw();
      text(page, label, lx + 16, ly, 7.5);
      lx += 26 + font.widthOfTextAtSize(safe(font, label), 7.5) + 14;
    };
    item(() => page.drawRectangle({ x: lx, y: ly - 1, width: 12, height: 7, color: hex(pdf, '#2F6F8F'), opacity: 0.3, borderColor: hex(pdf, '#2F6F8F'), borderWidth: 0.6 }), c.kind.task);
    item(() => page.drawRectangle({ x: lx, y: ly - 1, width: 12, height: 7, color: hex(pdf, '#2F6F8F'), opacity: 0.85 }), c.progress);
    item(() => page.drawRectangle({ x: lx, y: ly + 1, width: 12, height: 4, color: dark }), c.kind.phase);
    item(() => page.drawSvgPath(`M ${lx + 6} ${-ly - 6.5} L ${lx + 10} ${-ly - 2.5} L ${lx + 6} ${-ly + 1.5} L ${lx + 2} ${-ly - 2.5} Z`, { x: 0, y: 0, color: dark }), c.pdfMilestone);
    item(() => page.drawRectangle({ x: lx, y: ly - 1, width: 12, height: 7, borderColor: red, borderWidth: 1.2 }), c.pdfLate);
    item(() => page.drawLine({ start: { x: lx + 6, y: ly - 2 }, end: { x: lx + 6, y: ly + 8 }, thickness: 1, color: red }), c.today);
  }
  return doc.save();
}
