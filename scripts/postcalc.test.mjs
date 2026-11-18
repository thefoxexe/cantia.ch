// Post-calcul (module Métrés): billable = quantity executed × price of the
// soumission; real = quantity executed × real cost; profit = billable - real.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareTenders } from '../lib/tenders/postcalcCompare.ts';

const tender = (id, extra = {}) => ({ id, discount_percent: 0, escompte_percent: 0, vat_rate: 8.1, metadata: {}, ...extra });
const node = (tid, id, parent, type, ref, title, sort) => ({ id: `${tid}-${id}`, tender_id: tid, parent_id: parent ? `${tid}-${parent}` : null, node_type: type, sort_order: sort, depth: parent ? 1 : 0, display_reference: ref, position_path: ref, raw_number: ref, title });
const pos = (tid, id, nodeId, qty, unit = 'm2') => ({ id: `${tid}-p${id}`, tender_id: tid, node_id: `${tid}-${nodeId}`, unit, raw_unit: unit, quantity_original: qty, quantity_measured: null, quantity_manual: null, quantity_selected_source: 'original', excluded: false });
const price = (tid, id, unitPrice) => ({ position_id: `${tid}-p${id}`, tender_id: tid, unit_price: unitPrice, amount: null });

function bundle(tid, positions, prices, extra) {
  return {
    tender: tender(tid, extra),
    nodes: [
      node(tid, 'c1', null, 'chapter', '211', 'Maçonnerie', 1),
      node(tid, 'a', 'c1', 'billable_position', '211.100', 'Mur béton', 1),
      node(tid, 'b', 'c1', 'billable_position', '211.200', 'Crépi', 2),
      ...(tid === 'real' ? [node(tid, 'x', 'c1', 'billable_position', '211.900', 'Travail ajouté', 3)] : []),
    ],
    positions,
    breakdowns: [],
    prices,
    zoneLabels: [],
    pricesVisible: true,
  };
}

test('compares billable and real cost per position and in total', () => {
  // Sold: 100 m2 × 50 + 20 m2 × 30, 10 % rabais.
  const base = bundle('base', [pos('base', 1, 'a', 100), pos('base', 2, 'b', 20)], [price('base', 1, 50), price('base', 2, 30)], { discount_percent: 10 });
  // Executed: 110 m2 at a cost of 40, crépi not done, 5 h added at 80.
  const real = bundle('real', [pos('real', 1, 'a', 110), pos('real', 2, 'b', 0), pos('real', 3, 'x', 5, 'h')], [price('real', 1, 40), price('real', 2, 25), price('real', 3, 80)]);
  const c = compareTenders(base, real);
  assert.equal(c.offerNet, 5040); // (5000 + 600) × 0.9
  assert.equal(c.billableNet, 4950); // 110 × 50 × 0.9
  assert.equal(c.real, 4800); // 4400 + 0 + 400
  assert.equal(c.profit, 150);
  assert.equal(c.marginPercent, 3);
  const lines = c.chapters[0].lines;
  assert.equal(lines.length, 3);
  assert.deepEqual(
    lines.map((l) => [l.ref, l.billable, l.real, l.profit, l.only]),
    [
      ['211.100', 5500, 4400, 1100, null],
      ['211.200', 0, 0, 0, null],
      ['211.900', null, 400, -400, 'real'],
    ],
  );
  assert.equal(c.missingCosts, 0);
});

test('counts positions still without a real cost and does not invent a profit for them', () => {
  const base = bundle('base', [pos('base', 1, 'a', 100), pos('base', 2, 'b', 20)], [price('base', 1, 50), price('base', 2, 30)]);
  const real = bundle('real', [pos('real', 1, 'a', 100), pos('real', 2, 'b', 20)], [price('real', 1, 45)]);
  const c = compareTenders(base, real);
  assert.equal(c.missingCosts, 1);
  const crepi = c.chapters[0].lines.find((l) => l.ref === '211.200');
  assert.equal(crepi.profit, null);
});
