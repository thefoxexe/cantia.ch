import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterEntries, ledgerCsv, summarize, vatIncluded } from '../lib/admin/ledgerCalc.ts';

const E = (id, date, kind, category, amount, extra = {}) => ({ id, entry_date: date, kind, category, label: `L${id}`, counterparty: null, amount_chf: amount, vat_rate: 0, payment_method: null, reference: null, receipt_path: null, notes: null, source: 'manuel', source_id: null, ...extra });
const data = [
  E('1', '2026-01-15', 'recette', 'ventes', 1290),
  E('2', '2026-01-20', 'depense', 'logiciels', 80.1, { receipt_path: 'x' }),
  E('3', '2026-02-03', 'recette', 'ventes', 2580),
  E('4', '2026-02-28', 'depense', 'frais_financiers', 45.2),
  E('5', '2026-03-10', 'depense', 'materiel', 1081, { vat_rate: 8.1, counterparty: 'Digitec' }),
];

test('summary: income, expenses, profit, months and categories', () => {
  const s = summarize(data, 2026);
  assert.equal(s.income, 3870);
  assert.equal(s.expenses, 1206.3);
  assert.equal(s.profit, 2663.7);
  assert.equal(s.byMonth.length, 12);
  assert.equal(s.byMonth[0].profit, 1209.9);
  assert.equal(s.byMonth[2].cumulative, 2663.7);
  assert.equal(s.expensesVat, 81);
  assert.equal(s.missingReceipts, 2);
  assert.equal(s.byCategory[0].category, 'ventes');
});

test('filters', () => {
  assert.equal(filterEntries(data, { kind: 'depense' }).length, 3);
  assert.equal(filterEntries(data, { from: '2026-02-01', to: '2026-02-28' }).length, 2);
  assert.equal(filterEntries(data, { search: 'digitec' }).length, 1);
  assert.equal(filterEntries(data, { missingReceipt: true, kind: 'depense' }).length, 2);
  assert.equal(filterEntries(data, { categories: ['ventes', 'materiel'] }).length, 3);
});

test('VAT included and CSV', () => {
  assert.equal(vatIncluded(1081, 8.1), 81);
  const csv = ledgerCsv(data).split('\n');
  assert.equal(csv.length, 6);
  assert.ok(csv[2].includes('-80.1'));
});

test('periods: months between, full year, presets', async () => {
  const { monthsBetween, fullYearOf, periodPresets } = await import('../lib/admin/ledgerCalc.ts');
  assert.deepEqual(monthsBetween('2025-11-15', '2026-02-03'), ['2025-11', '2025-12', '2026-01', '2026-02']);
  assert.equal(fullYearOf('2026-01-01', '2026-12-31'), 2026);
  assert.equal(fullYearOf('2026-01-01', '2026-06-30'), null);
  const p = periodPresets('2026-10-03');
  const byKey = Object.fromEntries(p.map((x) => [x.key, x]));
  assert.deepEqual([byKey['prev-month'].from, byKey['prev-month'].to], ['2026-09-01', '2026-09-30']);
  assert.deepEqual([byKey.q3.from, byKey.q3.to], ['2026-07-01', '2026-09-30']);
  assert.ok(byKey.q4 && byKey.h2);
  assert.deepEqual([byKey['12m'].from, byKey['12m'].to], ['2025-11-01', '2026-10-31']);
  const jan = Object.fromEntries(periodPresets('2026-01-10').map((x) => [x.key, x]));
  assert.deepEqual([jan['prev-month'].from, jan['prev-month'].to], ['2025-12-01', '2025-12-31']);
  assert.ok(jan['q4-prev']);
  const s = summarize(data, { from: '2025-12-01', to: '2026-03-31' });
  assert.equal(s.byMonth.length, 4);
  assert.equal(s.byMonth[0].month, '2025-12');
});
