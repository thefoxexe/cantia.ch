// Tests of the Swiss payroll engine (lib/payroll/swissEngine.ts).
// Run: npm run test:payroll   (Node's built-in test runner, no dependency)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeSwissPayroll } from '../lib/payroll/swissEngine.ts';
import { isSubjectToWht, monthlyFamilyAllowance, whtCode, whtRate } from '../lib/payroll/swissReferences.ts';

const base = {
  birthDate: '1996-05-10', // 30 in 2026
  permit: 'swiss',
  maritalStatus: 'single',
  spouseIsSwissOrC: false,
  spouseWorks: false,
  livesWithChildren: false,
  childrenUnder16: 0,
  childrenInTraining: 0,
  church: false,
  residenceCountry: 'CH',
  residenceCanton: 'GE',
  workCanton: 'GE',
  lppInsured: true,
  receivesFamilyAllowances: true,
};
const amount = (lines, key) => lines.find((l) => l.key === key)?.amount ?? 0;

test('AVS 5.3 % and AC 1.1 % on both sides', () => {
  const p = computeSwissPayroll(base, 2000, 2026);
  assert.equal(amount(p.employee, 'avs'), 106);
  assert.equal(amount(p.employer, 'avs'), 106);
  assert.equal(amount(p.employee, 'ac'), 22);
  assert.equal(amount(p.employer, 'ac'), 22);
});

test('LPP on the minimum coordinated salary just above the entry threshold', () => {
  // 24'000/yr ≥ 22'680 → coordinated = max(24'000 − 26'460, 3'780) = 3'780/yr = 315/month; age 30 → 7 %, half each.
  const p = computeSwissPayroll(base, 2000, 2026);
  assert.equal(p.lpp.applies, true);
  assert.equal(p.lpp.coordinatedMonthly, 315);
  assert.equal(amount(p.employee, 'lpp'), 11.05); // 315 × 3.5 % = 11.025 → 5 centimes
  assert.equal(amount(p.employer, 'lpp'), 11.05);
});

test('LPP by age: 15 % at 45, on the coordinated salary', () => {
  const p = computeSwissPayroll({ ...base, birthDate: '1981-01-01' }, 6000, 2026);
  // 72'000 − 26'460 = 45'540/yr = 3'795/month × 7.5 % = 284.625
  assert.equal(p.lpp.creditPercent, 15);
  assert.equal(amount(p.employee, 'lpp'), 284.65);
});

test('No LPP below the entry threshold, nor before 25', () => {
  assert.equal(amount(computeSwissPayroll(base, 1500, 2026).employee, 'lpp'), 0);
  const young = computeSwissPayroll({ ...base, birthDate: '2004-01-01' }, 5000, 2026);
  assert.equal(young.lpp.applies, false);
  assert.equal(amount(young.employee, 'lpp'), 0);
});

test('AC and LAA stop at the monthly ceiling (148\'200 / 12)', () => {
  const p = computeSwissPayroll(base, 15000, 2026);
  assert.equal(amount(p.employee, 'ac'), 135.85); // 12'350 × 1.1 %
  assert.equal(p.employee.find((l) => l.key === 'aanp').base, 12350);
  assert.equal(amount(p.employee, 'avs'), 795); // AVS has no ceiling
});

test('Family allowances 2026: the 3rd child gets the higher amount (GE, VD)', () => {
  assert.equal(monthlyFamilyAllowance('GE', 3, 0), 311 + 311 + 411);
  // VD: the two in training count first, the youngest is the 3rd child.
  assert.equal(monthlyFamilyAllowance('VD', 1, 2), 425 + 425 + 365);
  assert.equal(monthlyFamilyAllowance('BE', 2, 0), 500);
  const p = computeSwissPayroll({ ...base, childrenUnder16: 2 }, 5000, 2026);
  assert.equal(p.familyAllowance, 622);
  assert.equal(p.net, Math.round((5000 - p.totalDeductions + 622) * 100) / 100);
});

test('Family allowance fund: employer rate by canton, employee share in VS', () => {
  const ge = computeSwissPayroll(base, 5000, 2026);
  assert.equal(amount(ge.employer, 'caf'), 111); // 2.22 %
  const vs = computeSwissPayroll({ ...base, workCanton: 'VS', residenceCanton: 'VS' }, 5000, 2026);
  assert.equal(amount(vs.employee, 'caf'), 6.5); // 0.13 %
});

test('Withholding tax: who is subject', () => {
  const s = { permit: 'B', maritalStatus: 'single', spouseIsSwissOrC: false, spouseWorks: false, livesWithChildren: false, children: 0, church: false, residenceCountry: 'CH' };
  assert.equal(isSubjectToWht(s, 'GE').subject, true);
  assert.equal(isSubjectToWht({ ...s, permit: 'C' }, 'GE').subject, false);
  assert.equal(isSubjectToWht({ ...s, permit: 'swiss' }, 'GE').subject, false);
  assert.equal(isSubjectToWht({ ...s, maritalStatus: 'married', spouseIsSwissOrC: true }, 'GE').subject, false);
  // Cross-border from France: taxed at source in GE, in France for VD (1983 agreement).
  assert.equal(isSubjectToWht({ ...s, permit: 'G', residenceCountry: 'FR' }, 'GE').subject, true);
  assert.equal(isSubjectToWht({ ...s, permit: 'G', residenceCountry: 'FR' }, 'VD').subject, false);
});

test('Withholding tax codes', () => {
  const s = { permit: 'B', maritalStatus: 'single', spouseIsSwissOrC: false, spouseWorks: false, livesWithChildren: false, children: 0, church: false, residenceCountry: 'CH' };
  assert.equal(whtCode(s), 'A0N');
  assert.equal(whtCode({ ...s, maritalStatus: 'married', children: 2 }), 'B2N');
  assert.equal(whtCode({ ...s, maritalStatus: 'married', spouseWorks: true, children: 1, church: true }), 'C1Y');
  assert.equal(whtCode({ ...s, livesWithChildren: true, children: 2 }), 'H2N');
});

test('Withholding tax: rate of the step the income falls in', () => {
  const steps = [[0, 0, 0], [2450, 0.09, 0], [2500, 0.1, 0], [5000, 10, 0]];
  assert.equal(whtRate(steps, 2000), 0);
  assert.equal(whtRate(steps, 2450), 0.09);
  assert.equal(whtRate(steps, 4999.95), 0.1);
  assert.equal(whtRate(steps, 6000), 10);
  const p = computeSwissPayroll({ ...base, permit: 'B' }, 6000, 2026, { whtSteps: steps });
  assert.equal(p.wht.subject, true);
  assert.equal(p.wht.code, 'A0N');
  assert.equal(amount(p.employee, 'wht'), 600);
});

test('Withholding tax without an imported scale is flagged, not guessed', () => {
  const p = computeSwissPayroll({ ...base, permit: 'B' }, 6000, 2026);
  assert.equal(p.wht.missingScale, true);
  assert.equal(amount(p.employee, 'wht'), 0);
});

test('Overrides (advanced settings) win', () => {
  const p = computeSwissPayroll({ ...base, permit: 'B' }, 6000, 2026, {
    overrides: { aanpPercent: 0, aapPercent: 1.2, ijmEmployeePercent: 0.5, ijmEmployerPercent: 0.5, lppTotalPercent: 12, whtRatePercent: 8.5, cafEmployerPercent: 2 },
  });
  assert.equal(amount(p.employee, 'aanp'), 0);
  assert.equal(amount(p.employer, 'aap'), 72);
  assert.equal(amount(p.employee, 'ijm'), 30);
  assert.equal(p.lpp.creditPercent, 12);
  assert.equal(amount(p.employee, 'wht'), 510);
  assert.equal(amount(p.employer, 'caf'), 120);
});

test('Totals add up', () => {
  const p = computeSwissPayroll({ ...base, childrenUnder16: 1 }, 7300, 2026);
  const sum = (ls) => Math.round(ls.reduce((s, l) => s + l.amount, 0) * 100) / 100;
  assert.equal(p.totalDeductions, sum(p.employee));
  assert.equal(p.totalEmployer, sum(p.employer));
  assert.equal(p.totalCost, Math.round((7300 + p.totalEmployer) * 100) / 100);
});

test('Postcode → canton (swisstopo register)', async () => {
  const { cantonForNpa } = await import('../lib/payroll/npaCanton.ts');
  assert.equal(cantonForNpa('1201'), 'GE');
  assert.equal(cantonForNpa('1003'), 'VD');
  assert.equal(cantonForNpa('1950'), 'VS');
  assert.equal(cantonForNpa('2000'), 'NE');
  assert.equal(cantonForNpa('1700'), 'FR');
  assert.equal(cantonForNpa('2800'), 'JU');
  assert.equal(cantonForNpa('3011'), 'BE');
  assert.equal(cantonForNpa('8001'), 'ZH');
  assert.equal(cantonForNpa('6900'), 'TI');
  assert.equal(cantonForNpa('12'), null);
});

test('Family allowances = OFAS table 2026 (child / training, CHF per month)', async () => {
  const { FAMILY_ALLOWANCES } = await import('../lib/payroll/swissReferences.ts');
  // [child, training] as printed in « Genres et montants des allocations familiales 2026 » (état 12.12.2025)
  const official = {
    ZH: [215, 268], BE: [250, 310], LU: [215, 268], UR: [240, 290], SZ: [230, 280], OW: [220, 270], NW: [258, 311],
    GL: [215, 268], ZG: [330, 330], FR: [265, 325], SO: [215, 268], BS: [275, 325], BL: [215, 268], SH: [230, 290],
    AR: [230, 280], AI: [245, 298], SG: [245, 298], GR: [240, 290], AG: [225, 278], TG: [215, 280], TI: [215, 268],
    VD: [322, 425], VS: [327, 477], NE: [240, 320], GE: [311, 415], JU: [275, 325],
  };
  for (const [canton, [child, training]] of Object.entries(official)) {
    assert.equal(FAMILY_ALLOWANCES[canton].child[0], child, `${canton} child`);
    assert.equal(FAMILY_ALLOWANCES[canton].training[0], training, `${canton} training`);
  }
  // From the 3rd child.
  assert.deepEqual([FAMILY_ALLOWANCES.GE.child[1], FAMILY_ALLOWANCES.GE.training[1]], [411, 515]);
  assert.deepEqual([FAMILY_ALLOWANCES.VD.child[1], FAMILY_ALLOWANCES.VD.training[1]], [365, 468]);
  assert.deepEqual([FAMILY_ALLOWANCES.VS.child[1], FAMILY_ALLOWANCES.VS.training[1]], [435, 585]);
});
