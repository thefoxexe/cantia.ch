import { test } from 'node:test';
import assert from 'node:assert/strict';
import { historyInit, historyPush, historyRedo, historyUndo, impliedScale, isComplete, measure, metersPerPt, parseScale, snapOrtho } from '../lib/tenders/geometry.ts';

// Same cases as supabase/tests/tenders/30_plans.sql, so client and server agree.
const page = { width_pt: 1000, height_pt: 500 };

test('calibration by scale and by a known dimension', () => {
  const s = metersPerPt({ method: 'scale', scale: 100 }, page);
  assert.equal(measure('distance', [[0, 0], [0.5, 0]], page, s).length_m, 17.6389);
  assert.equal(impliedScale(s), 100);
  const two = metersPerPt({ method: 'two_points', a: [0.1, 0.1], b: [0.6, 0.1], real_m: 10 }, page);
  assert.equal(two, 0.02);
  assert.equal(measure('distance', [[0, 0], [0.25, 0]], page, two).length_m, 5);
  assert.equal(metersPerPt({ method: 'two_points', a: [0.1, 0.1], b: [0.1, 0.1], real_m: 10 }, page), null);
});

test('surface, perimeter, polyline, count', () => {
  const mpp = 0.02;
  const square = [[0.1, 0.2], [0.3, 0.2], [0.3, 0.6], [0.1, 0.6]];
  const poly = measure('polygon', square, page, mpp);
  assert.equal(poly.area_m2, 16);
  assert.equal(poly.perimeter_m, 16);
  assert.equal(measure('polygon', [...square].reverse(), page, mpp).area_m2, 16);
  assert.equal(measure('perimeter', square, page, mpp).perimeter_m, 16);
  assert.equal(measure('polyline', square, page, mpp).length_m, 12);
  assert.equal(measure('count', [[0.1, 0.1], [0.2, 0.2]], page, null).count, 2);
  assert.equal(measure('distance', [[0, 0], [0.5, 0]], page, null).length_m, null);
});

test('scale input, completion, ortho snap', () => {
  assert.equal(parseScale('1:50'), 50);
  assert.equal(parseScale('1/100'), 100);
  assert.equal(parseScale('200'), 200);
  assert.equal(parseScale('abc'), null);
  assert.equal(isComplete('distance', [[0, 0]]), false);
  assert.equal(isComplete('polygon', [[0, 0], [1, 0], [1, 1]]), true);
  assert.deepEqual(snapOrtho([0.1, 0.1], [0.5, 0.12], page), [0.5, 0.1]);
  assert.deepEqual(snapOrtho([0.1, 0.1], [0.11, 0.5], page), [0.1, 0.5]);
});

test('undo / redo', () => {
  let h = historyInit([]);
  h = historyPush(h, [1]);
  h = historyPush(h, [1, 2]);
  h = historyUndo(h);
  assert.deepEqual(h.present, [1]);
  h = historyRedo(h);
  assert.deepEqual(h.present, [1, 2]);
  h = historyUndo(historyUndo(h));
  assert.deepEqual(h.present, []);
  assert.deepEqual(historyUndo(h).present, []);
});
