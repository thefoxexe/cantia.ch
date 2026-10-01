import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildAfcForm, periodsFor, roundInTaxpayerFavour } from '../lib/vat/afcForm.ts';

const fig = (form, f) => [...form.turnover, ...form.tax, ...form.other].find((l) => l.figure === f);

const ledger = [
  { code: 'V-NORM', category: 'vente_normal', rate: 8.1, base: 100000, amount: 8100 },
  { code: 'V-RED', category: 'vente_reduit', rate: 2.6, base: 1000, amount: 26 },
  { code: 'V-EXO', category: 'vente_exoneree', rate: 0, base: 5000, amount: 0 },
  { code: 'P-MAT', category: 'achat_materiel', rate: 8.1, base: 40000, amount: 3240 },
  { code: 'P-INV', category: 'achat_investissement', rate: 8.1, base: 10000, amount: 810 },
];

test('effective method: figures 200 to 500', () => {
  const f = buildAfcForm(ledger, 'effective', {});
  assert.equal(fig(f, '200').amount, 106000);
  assert.equal(fig(f, '220').amount, 5000);
  assert.equal(fig(f, '289').amount, 5000);
  assert.equal(fig(f, '299').amount, 101000);
  assert.equal(fig(f, '303').tax, 8100);
  assert.equal(fig(f, '313').tax, 26);
  assert.equal(fig(f, '399').tax, 8126);
  assert.equal(fig(f, '400').tax, 3240);
  assert.equal(fig(f, '405').tax, 810);
  assert.equal(fig(f, '479').tax, 4050);
  assert.equal(fig(f, '500').tax, 4076);
  assert.deepEqual(f.warnings, []);
});

test('effective method: discounts, acquisition tax and corrections', () => {
  const f = buildAfcForm(ledger, 'effective', { f235: 1000, f383Base: 2000, f415: 100, f420: 50 });
  assert.equal(fig(f, '299').amount, 100000);
  assert.equal(fig(f, '303').turnover, 99000);
  assert.equal(fig(f, '383').tax, 162);
  assert.equal(fig(f, '479').tax, 3900);
  assert.deepEqual(f.warnings, []);
});

test('TDFN: turnover including VAT times the approved rate', () => {
  const f = buildAfcForm(ledger, 'tdfn', { tdfnRate1: 5.3 });
  assert.equal(fig(f, '299').amount, 109126);
  assert.equal(fig(f, '322').tax, 5783.68);
  assert.equal(fig(f, '500').tax, 5783.68);
});

test('credit in favour of the taxpayer goes to 510, rounded in their favour', () => {
  const f = buildAfcForm([{ code: 'P-MAT', category: 'achat_materiel', rate: 8.1, base: 1000, amount: 81.03 }], 'effective', {}, true);
  assert.equal(fig(f, '510').tax, 81.05);
  assert.equal(roundInTaxpayerFavour(950.54), 950.5);
});

test('quarters and their 60-day deadlines', () => {
  const q = periodsFor(2026, 'trimestrielle');
  assert.equal(q.length, 4);
  assert.deepEqual([q[0].start, q[0].end, q[0].due], ['2026-01-01', '2026-03-31', '2026-05-30']);
  assert.equal(q[3].due, '2027-03-01');
  assert.equal(periodsFor(2026, 'semestrielle')[1].due, '2027-03-01');
});
