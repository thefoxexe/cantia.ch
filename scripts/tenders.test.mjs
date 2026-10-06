import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatChf, formatQuantity, parseSwissNumber } from '../lib/tenders/numbers.ts';
import { normalizeUnit, unitLabel } from '../lib/tenders/units.ts';
import { checkBreakdownSum, checkLineAmount, lineAmount, quantityGap, selectedQuantity, subtotalsByNode, tenderTotals } from '../lib/tenders/calc.ts';

test('Swiss numbers as printed in soumissions', () => {
  assert.equal(parseSwissNumber("8'000"), 8000);
  assert.equal(parseSwissNumber("7'200.00"), 7200);
  assert.equal(parseSwissNumber('0,30'), 0.3);
  assert.equal(parseSwissNumber('0.90'), 0.9);
  assert.equal(parseSwissNumber('1 234.5'), 1234.5);
  assert.equal(parseSwissNumber('1’250'), 1250);
  assert.equal(parseSwissNumber('1,250.50'), 1250.5);
  assert.equal(parseSwissNumber('-14.65'), -14.65);
  assert.equal(parseSwissNumber('108'), 108);
  assert.equal(parseSwissNumber('......................'), null);
  assert.equal(parseSwissNumber('m2'), null);
  assert.equal(parseSwissNumber('121.111.2'), null);
  assert.equal(parseSwissNumber(''), null);
});

test('formatting', () => {
  assert.equal(formatChf(1234.5), "1'234.50");
  assert.equal(formatChf(-7200), "-7'200.00");
  assert.equal(formatQuantity(820), '820');
  assert.equal(formatQuantity(5.852), '5.852');
  assert.equal(formatQuantity(12345.6789), "12'345.679");
});

test('units: normalized, raw kept, unknown never guessed', () => {
  assert.deepEqual(normalizeUnit('m2'), { unit: 'm2', known: true });
  assert.deepEqual(normalizeUnit('m²'), { unit: 'm2', known: true });
  assert.deepEqual(normalizeUnit('p'), { unit: 'pce', known: true });
  assert.deepEqual(normalizeUnit('Stk'), { unit: 'pce', known: true });
  assert.deepEqual(normalizeUnit('gl'), { unit: 'gl', known: true });
  assert.deepEqual(normalizeUnit('up'), { unit: 'up', known: true });
  assert.deepEqual(normalizeUnit('ml'), { unit: 'm', known: true });
  assert.deepEqual(normalizeUnit('Lfm.'), { unit: 'm', known: true });
  assert.deepEqual(normalizeUnit('palettes'), { unit: 'palettes', known: false });
  assert.equal(unitLabel('m3'), 'm³');
});

test('selected quantity never touches the original', () => {
  const p = { quantity_original: 820, quantity_measured: 834.65, quantity_manual: 830, quantity_selected_source: 'original' };
  assert.equal(selectedQuantity(p), 820);
  assert.equal(selectedQuantity({ ...p, quantity_selected_source: 'measured' }), 834.65);
  assert.equal(selectedQuantity({ ...p, quantity_selected_source: 'manual' }), 830);
  assert.equal(p.quantity_original, 820);
  assert.deepEqual(quantityGap(820, 834.65), { delta: 14.65, percent: 1.79 });
  assert.equal(quantityGap(null, 3), null);
});

test('line amounts and document checks', () => {
  assert.equal(lineAmount(5.852, 280), 1638.56);
  assert.equal(lineAmount(10, null), null);
  assert.equal(lineAmount(10, 5, true), null);
  // Régie line of the reference soumission: 8'000 up × 0.90 = 7'200.00
  assert.equal(checkLineAmount(8000, 0.9, 7200), true);
  assert.equal(checkLineAmount(8000, 0.9, 7300), false);
  assert.equal(checkLineAmount(8000, null, 7200), null);
});

test('breakdowns must add up to the printed total', () => {
  assert.deepEqual(checkBreakdownSum([650, 70, 100], 820), { ok: true, sum: 820, total: 820, difference: 0 });
  assert.equal(checkBreakdownSum([40, 40, 28], 108).ok, true);
  const bad = checkBreakdownSum([650, 70, 90], 820);
  assert.equal(bad.ok, false);
  assert.equal(bad.difference, -10);
  // rounding tolerance
  assert.equal(checkBreakdownSum([33.333, 33.333, 33.334], 100).ok, true);
  assert.equal(checkBreakdownSum([1, 2], null).ok, true);
});

test('totals: brut, rabais, escompte, TVA, net', () => {
  const t = tenderTotals([1000, 500, null], { discount_percent: 10, escompte_percent: 2, vat_rate: 8.1 });
  assert.deepEqual(t, { brut: 1500, discount: 150, subtotal1: 1350, escompte: 27, subtotal2: 1323, vat: 107.16, net: 1430.16 });
  assert.equal(tenderTotals([], { discount_percent: 0, escompte_percent: 0, vat_rate: 8.1 }).net, 0);
});

test('subtotals roll up through any depth', () => {
  const nodes = [
    { id: 'ch', parent_id: null, node_type: 'chapter' },
    { id: 'g1', parent_id: 'ch', node_type: 'section' },
    { id: 'p1', parent_id: 'g1', node_type: 'billable_position' },
    { id: 'p2', parent_id: 'g1', node_type: 'billable_position' },
    { id: 'p3', parent_id: 'ch', node_type: 'billable_position' },
    { id: 'ch2', parent_id: null, node_type: 'chapter' },
  ];
  const s = subtotalsByNode(nodes, new Map([['p1', 100.1], ['p2', 0.2], ['p3', 50], ['ch2', null]]));
  assert.equal(s.get('g1'), 100.3);
  assert.equal(s.get('ch'), 150.3);
  assert.equal(s.get('ch2'), 0);
});
