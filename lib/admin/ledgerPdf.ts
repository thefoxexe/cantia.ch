import { SimplePdf, downloadPdf, textWidth, type Rgb } from '../pdf/simplePdf.ts';
import { categoryLabel, summarize, vatIncluded, type LedgerEntry } from './ledgerCalc.ts';

// Yearly report of admin › Comptabilité: the income statement of a
// self-employed person keeping « recettes et dépenses » books (art. 957
// al. 2 CO), with the result by category, by month, the full journal (every
// entry numbered, with its receipt status) and a signed statement. What the
// AVS compensation office or the tax office can be given to justify the
// profit declared.

export interface LedgerHolder {
  name: string;
  address: string;
  activity: string;
  avsNumber: string;
  vatNumber: string;
}

const INK: Rgb = [35, 26, 18];
const MUTED: Rgb = [110, 97, 83];
const BRAND: Rgb = [169, 92, 48];
const RULE: Rgb = [216, 200, 176];
const GREEN: Rgb = [46, 107, 79];
const RED: Rgb = [171, 51, 39];
const SOFT: Rgb = [247, 241, 230];

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

function chf(n: number): string {
  const [int, dec] = Math.abs(n).toFixed(2).split('.');
  return `${n < 0 ? '-' : ''}${int.replace(/\B(?=(\d{3})+(?!\d))/g, '’')}.${dec}`;
}

const swiss = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;

function fit(text: string, size: number, max: number, bold = false): string {
  if (textWidth(text, size, bold) <= max) return text;
  let t = text;
  while (t.length > 1 && textWidth(`${t}…`, size, bold) > max) t = t.slice(0, -1);
  return `${t}…`;
}

export interface LedgerReportOptions {
  entries: LedgerEntry[];
  from: string;
  to: string;
  year: number | null;
  holder: LedgerHolder;
  filtered: boolean;
}

export function downloadLedgerReport(opts: LedgerReportOptions) {
  const { pdf, file } = buildLedgerReport(opts);
  downloadPdf(pdf, file);
}

export function buildLedgerReport(opts: LedgerReportOptions): { pdf: string; file: string } {
  const entries = [...opts.entries].sort((a, b) => (a.entry_date < b.entry_date ? -1 : a.entry_date > b.entry_date ? 1 : a.kind < b.kind ? -1 : 1));
  const s = summarize(entries, opts.year ?? undefined);
  const doc = new SimplePdf();
  const L = 44;
  const R = doc.width - 44;
  const W = R - L;
  const BOTTOM = doc.height - 60;
  const period = `${swiss(opts.from)} – ${swiss(opts.to)}`;
  const title = opts.year ? `Compte de résultat ${opts.year}` : 'Compte de résultat';

  const header = (sub: string) => {
    doc.rect(0, 0, doc.width, 5, BRAND);
    doc.text(opts.holder.name || 'Titulaire', L, 30, { size: 8.5, bold: true, color: MUTED });
    doc.text(`${sub} · ${period}`, R, 30, { size: 8.5, color: MUTED, align: 'right' });
    doc.line(L, 38, R, 38, RULE);
  };

  // ---- Page 1: identity, result, categories ---------------------------------
  doc.rect(0, 0, doc.width, 5, BRAND);
  doc.text(title, L, 52, { size: 22, bold: true });
  doc.text('Comptabilité des recettes et des dépenses (art. 957 al. 2 CO)', L, 70, { size: 10, color: MUTED });

  let y = 96;
  const ident: [string, string][] = [
    ['Titulaire', opts.holder.name],
    ['Adresse', opts.holder.address],
    ['Activité', opts.holder.activity],
    ['N° AVS', opts.holder.avsNumber],
    ['N° IDE / TVA', opts.holder.vatNumber],
    ['Période', period],
    ['Édité le', swiss(new Date().toISOString().slice(0, 10))],
  ].filter(([, v]) => v && v.trim()) as [string, string][];
  doc.rect(L, y - 12, W, ident.length * 15 + 14, SOFT);
  for (const [k, v] of ident) {
    doc.text(k, L + 12, y + 2, { size: 8.5, color: MUTED });
    doc.text(fit(v, 9.5, W - 140), L + 120, y + 2, { size: 9.5, bold: true });
    y += 15;
  }
  y += 22;

  // Result box
  const boxes: [string, number, Rgb][] = [
    ['Recettes', s.income, GREEN],
    ['Dépenses', s.expenses, RED],
    [s.profit >= 0 ? 'Bénéfice' : 'Perte', s.profit, INK],
  ];
  const bw = (W - 20) / 3;
  boxes.forEach(([k, v, c], i) => {
    const x = L + i * (bw + 10);
    doc.rect(x, y, bw, 54, i === 2 ? INK : SOFT);
    doc.text(k.toUpperCase(), x + 12, y + 17, { size: 7.5, bold: true, color: i === 2 ? [232, 201, 168] : MUTED });
    doc.text(`CHF ${chf(v)}`, x + 12, y + 40, { size: 15, bold: true, color: i === 2 ? [251, 246, 238] : c });
  });
  y += 72;
  doc.text(`Marge bénéficiaire : ${s.marginPercent.toFixed(1).replace('.', ',')} % des recettes · ${s.count} écritures · ${s.missingReceipts} dépense(s) sans justificatif`, L, y, { size: 8.5, color: MUTED });
  y += 26;

  const table = (titleText: string, rows: { label: string; count: number; total: number; share: number }[], total: number, color: Rgb) => {
    doc.text(titleText, L, y, { size: 11.5, bold: true });
    y += 10;
    doc.text('CATÉGORIE', L, y + 8, { size: 7, bold: true, color: MUTED });
    doc.text('ÉCRITURES', R - 170, y + 8, { size: 7, bold: true, color: MUTED, align: 'right' });
    doc.text('PART', R - 100, y + 8, { size: 7, bold: true, color: MUTED, align: 'right' });
    doc.text('CHF', R, y + 8, { size: 7, bold: true, color: MUTED, align: 'right' });
    y += 12;
    for (const r of rows) {
      y += 15;
      doc.line(L, y - 11, R, y - 11, RULE);
      doc.text(fit(r.label, 9.5, W - 200), L, y, { size: 9.5 });
      doc.text(String(r.count), R - 170, y, { size: 9.5, align: 'right', color: MUTED });
      doc.text(`${r.share.toFixed(1).replace('.', ',')} %`, R - 100, y, { size: 9.5, align: 'right', color: MUTED });
      doc.text(chf(r.total), R, y, { size: 9.5, align: 'right' });
    }
    y += 16;
    doc.line(L, y - 11, R, y - 11, INK, 0.9);
    doc.text(`Total ${titleText.toLowerCase()}`, L, y, { size: 9.5, bold: true });
    doc.text(chf(total), R, y, { size: 9.5, bold: true, align: 'right', color });
    y += 26;
  };
  table('Recettes', s.byCategory.filter((c) => c.kind === 'recette'), s.income, GREEN);
  if (y > BOTTOM - 200) {
    doc.addPage();
    header(title);
    y = 64;
  }
  table('Dépenses', s.byCategory.filter((c) => c.kind === 'depense'), s.expenses, RED);

  if (s.incomeVat || s.expensesVat) {
    doc.paragraph(
      `Les montants sont ceux effectivement encaissés et payés, TVA comprise. TVA contenue dans les recettes : CHF ${chf(s.incomeVat)} ; dans les dépenses : CHF ${chf(s.expensesVat)}.`,
      L,
      y,
      W,
      { size: 8.5, color: MUTED, leading: 11.5 },
    );
    y += 28;
  }

  // ---- Page 2: by month -------------------------------------------------------
  doc.addPage();
  header(title);
  y = 66;
  doc.text('Évolution mensuelle', L, y, { size: 13, bold: true });
  y += 18;
  // Bar chart: income (green) and expenses (red) per month.
  const chartH = 150;
  const months = s.byMonth;
  const maxV = Math.max(1, ...months.map((m) => Math.max(m.income, m.expenses)));
  const slot = W / Math.max(1, months.length);
  doc.line(L, y + chartH, R, y + chartH, RULE);
  months.forEach((m, i) => {
    const x = L + i * slot + slot * 0.18;
    const bwm = slot * 0.3;
    const hi = (m.income / maxV) * chartH;
    const he = (m.expenses / maxV) * chartH;
    if (hi > 0) doc.rect(x, y + chartH - hi, bwm, hi, GREEN);
    if (he > 0) doc.rect(x + bwm + 2, y + chartH - he, bwm, he, RED);
    const idx = Number(m.month.slice(5, 7)) - 1;
    doc.text((MONTHS[idx] ?? m.month).slice(0, 3), L + i * slot + slot / 2 - 8, y + chartH + 12, { size: 7.5, color: MUTED });
  });
  doc.rect(L, y + chartH + 22, 8, 8, GREEN);
  doc.text('Recettes', L + 12, y + chartH + 29, { size: 8, color: MUTED });
  doc.rect(L + 70, y + chartH + 22, 8, 8, RED);
  doc.text('Dépenses', L + 82, y + chartH + 29, { size: 8, color: MUTED });
  y += chartH + 52;

  const cols = [L, R - 300, R - 200, R - 100, R];
  ['MOIS', 'RECETTES', 'DÉPENSES', 'RÉSULTAT', 'CUMUL'].forEach((h, i) => doc.text(h, cols[i], y, { size: 7, bold: true, color: MUTED, align: i ? 'right' : 'left' }));
  y += 4;
  for (const m of months) {
    y += 16;
    doc.line(L, y - 12, R, y - 12, RULE);
    const idx = Number(m.month.slice(5, 7)) - 1;
    doc.text(`${MONTHS[idx] ?? m.month} ${m.month.slice(0, 4)}`, L, y, { size: 9.5 });
    doc.text(chf(m.income), cols[1], y, { size: 9.5, align: 'right' });
    doc.text(chf(m.expenses), cols[2], y, { size: 9.5, align: 'right' });
    doc.text(chf(m.profit), cols[3], y, { size: 9.5, align: 'right', color: m.profit < 0 ? RED : INK });
    doc.text(chf(m.cumulative), cols[4], y, { size: 9.5, align: 'right', color: MUTED });
  }
  y += 17;
  doc.line(L, y - 12, R, y - 12, INK, 0.9);
  doc.text('Total', L, y, { size: 9.5, bold: true });
  doc.text(chf(s.income), cols[1], y, { size: 9.5, bold: true, align: 'right' });
  doc.text(chf(s.expenses), cols[2], y, { size: 9.5, bold: true, align: 'right' });
  doc.text(chf(s.profit), cols[3], y, { size: 9.5, bold: true, align: 'right' });

  // ---- Journal -----------------------------------------------------------------
  const jcols = { n: L, date: L + 26, cat: L + 80, label: L + 190, ref: R - 128, just: R - 78, amount: R };
  const journalHeader = () => {
    doc.text('Journal des recettes et dépenses', L, 64, { size: 13, bold: true });
    const hy = 84;
    doc.text('N°', jcols.n, hy, { size: 7, bold: true, color: MUTED });
    doc.text('DATE', jcols.date, hy, { size: 7, bold: true, color: MUTED });
    doc.text('CATÉGORIE', jcols.cat, hy, { size: 7, bold: true, color: MUTED });
    doc.text('LIBELLÉ · CONTREPARTIE', jcols.label, hy, { size: 7, bold: true, color: MUTED });
    doc.text('RÉF.', jcols.ref, hy, { size: 7, bold: true, color: MUTED });
    doc.text('PIÈCE', jcols.just, hy, { size: 7, bold: true, color: MUTED });
    doc.text('MONTANT', jcols.amount, hy, { size: 7, bold: true, color: MUTED, align: 'right' });
    return hy + 4;
  };
  doc.addPage();
  header(title);
  y = journalHeader();
  entries.forEach((e, i) => {
    if (y > BOTTOM - 10) {
      doc.addPage();
      header(title);
      y = journalHeader();
    }
    y += 15;
    doc.line(L, y - 11, R, y - 11, RULE, 0.4);
    const sign = e.kind === 'recette' ? 1 : -1;
    doc.text(String(i + 1), jcols.n, y, { size: 8, color: MUTED });
    doc.text(swiss(e.entry_date), jcols.date, y, { size: 8 });
    doc.text(fit(categoryLabel(e.kind, e.category), 8, jcols.label - jcols.cat - 8), jcols.cat, y, { size: 8, color: MUTED });
    const vat = e.vat_rate ? ` (TVA ${String(e.vat_rate).replace('.', ',')} % : ${chf(vatIncluded(Number(e.amount_chf), Number(e.vat_rate)))})` : '';
    const lbl = `${e.counterparty ? `${e.label} · ${e.counterparty}` : e.label}${vat}`;
    doc.text(fit(lbl, 8, jcols.ref - jcols.label - 8), jcols.label, y, { size: 8 });
    doc.text(fit(e.reference ?? '', 8, jcols.just - jcols.ref - 6), jcols.ref, y, { size: 8, color: MUTED });
    doc.text(e.receipt_path ? 'oui' : e.source === 'stripe' ? 'Stripe' : '—', jcols.just, y, { size: 8, color: e.receipt_path || e.source === 'stripe' ? GREEN : RED });
    doc.text(chf(sign * Number(e.amount_chf)), jcols.amount, y, { size: 8, align: 'right', color: sign < 0 ? RED : INK });
  });
  y += 17;
  doc.line(L, y - 12, R, y - 12, INK, 0.9);
  doc.text(`${entries.length} écritures`, L, y, { size: 9, bold: true });
  doc.text(`Résultat : CHF ${chf(s.profit)}`, R, y, { size: 9, bold: true, align: 'right' });

  // ---- Statement ---------------------------------------------------------------
  if (y > BOTTOM - 170) {
    doc.addPage();
    header(title);
    y = 60;
  } else y += 36;
  doc.text('Attestation', L, y, { size: 12, bold: true });
  y = doc.paragraph(
    `Le/la soussigné(e) atteste que le présent relevé des recettes et des dépenses de la période du ${period} est complet et conforme aux pièces justificatives, conservées pendant dix ans (art. 958f CO). Les montants correspondent aux encaissements et aux paiements effectifs de l’activité indépendante.`,
    L,
    y + 16,
    W,
    { size: 9, leading: 13 },
  );
  if (opts.filtered) y = doc.paragraph('Attention : ce document a été établi avec des filtres ; il ne présente pas l’ensemble des écritures de la période.', L, y + 6, W, { size: 8.5, bold: true, color: RED, leading: 12 });
  y += 36;
  doc.text('Lieu et date', L, y, { size: 8.5, color: MUTED });
  doc.text('Signature', L + W / 2, y, { size: 8.5, color: MUTED });
  doc.line(L, y + 30, L + W / 2 - 30, y + 30, INK, 0.6);
  doc.line(L + W / 2, y + 30, R, y + 30, INK, 0.6);

  // ---- Page numbers ---------------------------------------------------------------
  const total = doc.pageCount;
  for (let p = 0; p < total; p++) {
    doc.goToPage(p);
    doc.text(`Page ${p + 1} / ${total}`, R, doc.height - 26, { size: 7.5, color: MUTED, align: 'right' });
    doc.text('Établi avec Cantia', L, doc.height - 26, { size: 7.5, color: MUTED });
  }
  return { pdf: doc.build(title), file: `${title.toLowerCase().replace(/\s+/g, '-')}.pdf` };
}
