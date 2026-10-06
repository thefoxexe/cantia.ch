// Spreadsheet export of a métré (Excel). Rows follow the tree order; the
// document's references, R positions and zones are kept as written.

import * as XLSX from 'xlsx';
import { Platform } from 'react-native';
import { lineAmount, tenderTotals } from './calc.ts';
import { unitLabel } from './units.ts';
import type { TenderBundle } from './api';

export function tenderSheetRows(b: TenderBundle): (string | number | null)[][] {
  const posByNode = new Map(b.positions.map((p) => [p.node_id, p]));
  const priceByPos = new Map(b.prices.map((p) => [p.position_id, p]));
  const zones = new Map<string, string>();
  for (const z of b.breakdowns) zones.set(z.position_id, `${zones.get(z.position_id) ? `${zones.get(z.position_id)} · ` : ''}${z.code} ${z.quantity_original ?? ''}`.trim());
  const head = ['Chapitre', 'Position', 'R', 'Désignation', 'Unité', 'Qté soumission', 'Qté mesurée', 'Qté manuelle', 'Qté retenue', 'Zones', ...(b.pricesVisible ? ['PU', 'Montant'] : []), 'Page'];
  const rows: (string | number | null)[][] = [head];
  const sorted = [...b.nodes].sort((x, y) => x.sort_order - y.sort_order);
  const amounts: (number | null)[] = [];
  for (const n of sorted) {
    const p = posByNode.get(n.id);
    if (!p) {
      if (['contract', 'chapter', 'section'].includes(n.node_type)) rows.push([n.can_chapter ?? '', n.position_path ?? n.raw_number ?? '', '', (n.title ?? '').toUpperCase()]);
      continue;
    }
    const price = priceByPos.get(p.id);
    const amount = lineAmount(p.quantity_selected, price?.unit_price ?? null, p.excluded);
    amounts.push(amount);
    rows.push([
      n.can_chapter ?? '',
      n.position_path ?? n.raw_number ?? '',
      n.is_reserved ? 'R' : '',
      (n.description || n.title || '').replace(/\s*\n\s*/g, ' '),
      unitLabel(p.unit),
      p.quantity_original,
      p.quantity_measured,
      p.quantity_manual,
      p.excluded ? null : p.quantity_selected,
      zones.get(p.id) ?? '',
      ...(b.pricesVisible ? [price?.unit_price ?? null, amount] : []),
      n.source_page,
    ]);
  }
  if (b.pricesVisible) {
    const t = tenderTotals(amounts, b.tender);
    const pad = (label: string, v: number) => [...Array(head.length - 3).fill(''), label, v, ''];
    rows.push([]);
    rows.push(pad('Brut', t.brut));
    if (t.discount) rows.push(pad(`Rabais ${b.tender.discount_percent} %`, -t.discount));
    if (t.escompte) rows.push(pad(`Escompte ${b.tender.escompte_percent} %`, -t.escompte));
    rows.push(pad(`TVA ${b.tender.vat_rate} %`, t.vat));
    rows.push(pad('Net', t.net));
  }
  return rows;
}

export function exportTenderXlsx(b: TenderBundle) {
  const ws = XLSX.utils.aoa_to_sheet(tenderSheetRows(b));
  ws['!cols'] = [{ wch: 8 }, { wch: 12 }, { wch: 3 }, { wch: 70 }, { wch: 7 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 28 }, { wch: 11 }, { wch: 13 }, { wch: 6 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Métré');
  const name = `${b.tender.name.replace(/[^\w\- ]+/g, '').trim() || 'metre'}.xlsx`;
  if (Platform.OS !== 'web') return { error: 'Export disponible sur ordinateur.' };
  const data = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  const url = URL.createObjectURL(new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return { error: null };
}
