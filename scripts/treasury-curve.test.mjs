import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildHistory, buildProjection, cashStart, niceTicks } from '../lib/treasury/curve.ts';

test('bank history is rebuilt backwards from the imported balance', () => {
  const bank = { lastImportedBalance: 10000, lastImportedAt: '2026-10-03T08:00:00Z', transactions: [
    { bookingDate: '2026-10-01', amount: 3000 }, // payment received
    { bookingDate: '2026-10-02', amount: -500 },
  ] };
  const h = buildHistory([bank], [], '2026-09-29', '2026-10-03');
  const at = Object.fromEntries(h.map((p) => [p.date, p.balance]));
  assert.equal(at['2026-10-03'], 10000);
  assert.equal(at['2026-10-02'], 10000);
  assert.equal(at['2026-10-01'], 10500);
  assert.equal(at['2026-09-30'], 7500);
  assert.equal(at['2026-09-29'], undefined); // before the first known movement
});

test('without a bank, typed-in balances are held until the next one', () => {
  const h = buildHistory([], [{ balance: 5000, recordedAt: '2026-09-01T10:00:00Z' }, { balance: 8000, recordedAt: '2026-09-03T10:00:00Z' }], '2026-09-02', '2026-09-04');
  assert.deepEqual(h.map((p) => p.balance), [5000, 8000, 8000]);
});

test('the most recent source starts the projection', () => {
  const s = cashStart([{ lastImportedBalance: 100, lastImportedAt: '2026-10-01T00:00:00Z', transactions: [] }], [{ balance: 50, recordedAt: '2026-10-02T00:00:00Z' }]);
  assert.deepEqual(s, { balance: 50, asOf: '2026-10-02', source: 'snapshot' });
});

test('projection: overdue counts today, cautious ignores inflows, first negative day', () => {
  const p = buildProjection(1000, [
    { amount: 2000, date: '2026-09-20', overdue: true },
    { amount: -2500, date: '2026-10-05', overdue: false },
    { amount: -1000, date: '2026-10-10', overdue: false },
    { amount: 500, date: null, overdue: false },
  ], '2026-10-03', 10);
  assert.equal(p.expected[0].balance, 3000);
  assert.equal(p.expected.at(-1).balance, -500);
  assert.equal(p.cautious.at(-1).balance, -2500);
  assert.equal(p.firstNegative, '2026-10-10');
  assert.deepEqual(p.lowest, { date: '2026-10-10', balance: -500 });
  assert.equal(p.inflow, 2000);
  assert.equal(p.outflow, -3500);
});

test('nice ticks cover the range with round steps', () => {
  const t = niceTicks(-1200, 48700);
  assert.ok(t[0] <= -1200 && t.at(-1) >= 48700);
  assert.ok(t.every((v) => v % 1000 === 0));
});
