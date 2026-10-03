import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hourlyRate, lateInterest, marginFromCost, marginFromPrice, vacationPay, vacationPercent, vat } from '../lib/tools/calcs.ts';

test('VAT both ways, 5-cent rounding', () => {
  assert.deepEqual(vat(1000, 8.1, 'ht'), { ht: 1000, vat: 81, ttc: 1081 });
  assert.deepEqual(vat(1081, 8.1, 'ttc'), { ht: 1000, vat: 81, ttc: 1081 });
  assert.equal(vat(123.45, 8.1, 'ht', true).vat, 10);
  assert.equal(vat(100, 2.6, 'ht').ttc, 102.6);
});

test('hourly rate covers salaries, charges, overheads and margin', () => {
  const r = hourlyRate({ monthlySalary: 5500, salariesPerYear: 13, employees: 4, chargesPercent: 16, billableHours: 1600, overhead: 120000, marginPercent: 10 });
  assert.equal(r.payroll, 286000);
  assert.equal(r.cost, 286000 * 1.16 + 120000);
  assert.equal(r.costPerHour, Math.round(((286000 * 1.16 + 120000) / 6400) * 100) / 100);
  assert.ok(r.rate > r.costPerHour);
});

test('margin vs markup', () => {
  const a = marginFromCost(100, 20);
  assert.equal(a.price, 125);
  assert.equal(a.markupPercent, 25);
  assert.equal(a.coefficient, 1.25);
  assert.equal(marginFromPrice(100, 150).marginPercent, 33.33);
});

test('late interest at 5 % per year', () => {
  const r = lateInterest(10000, '2026-01-31', '2026-04-01');
  assert.equal(r.days, 60);
  assert.equal(r.interest, 82.2); // 10000 × 5 % × 60 / 365 = 82.19 → 82.20
  assert.equal(lateInterest(1000, '2026-05-01', '2026-04-01').days, 0);
});

test('vacation supplement', () => {
  assert.equal(vacationPercent(4), 8.33);
  assert.equal(vacationPercent(5), 10.64);
  assert.equal(vacationPercent(6), 13.04);
  assert.equal(vacationPay(30, 5, 170).supplement, 3.19);
});
