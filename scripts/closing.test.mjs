import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accruals, closingChecks, depreciation, ducroire, resultImpact, taxProvision, workInProgress } from '../lib/accounting/closing.ts';

const balanced = (e) => e.lines.reduce((s, l) => s + l.debit - l.credit, 0);

test('ducroire: 5 % CH + 10 % abroad, only the change is booked', () => {
  const r = ducroire({ swissReceivables: 80000, foreignReceivables: 10000, currentProvision: 3000 });
  assert.equal(r.target, 5000);
  assert.equal(r.change, 2000);
  assert.equal(balanced(r.entry), 0);
  assert.deepEqual(r.entry.lines.map((l) => l.account), ['3805', '1109']);
  const down = ducroire({ swissReceivables: 20000, foreignReceivables: 0, currentProvision: 3000 });
  assert.equal(down.change, -2000);
  assert.deepEqual(down.entry.lines.map((l) => l.account), ['1109', '3805']);
  assert.equal(ducroire({ swissReceivables: 0, foreignReceivables: 0, currentProvision: 0 }).entry, null);
});

test('depreciation: declining balance per category, rounded to 5 cts', () => {
  const r = depreciation([{ key: 'vehicules', bookValue: 45000, rate: 40 }, { key: 'machines', bookValue: 12333, rate: 30 }, { key: 'mobilier', bookValue: 0, rate: 25 }]);
  assert.equal(r.total, 18000 + 3699.9);
  assert.equal(balanced(r.entry), 0);
});

test('accruals: the four kinds go to the right accounts', () => {
  const e = accruals([
    { kind: 'prepaid_expense', label: 'Assurance 2027', amount: 1200 },
    { kind: 'accrued_expense', label: 'Facture électricité décembre', amount: 450 },
    { kind: 'accrued_income', label: 'Régie non facturée', amount: 3000 },
    { kind: 'deferred_income', label: 'Acompte 2027', amount: 5000 },
    { kind: 'accrued_expense', label: '', amount: 99 },
  ]);
  assert.equal(e.length, 4);
  assert.deepEqual(e.map((x) => x.lines.map((l) => l.account).join('/')), ['1400/6500', '6500/2330', '1410/3200', '3200/2340']);
  assert.equal(resultImpact(e), 1200 - 450 + 3000 - 5000);
});

test('work in progress adjusts against the current balance', () => {
  assert.equal(workInProgress(18000, 10000).change, 8000);
  assert.deepEqual(workInProgress(4000, 10000).entry.lines.map((l) => l.account), ['3940', '1300']);
  assert.equal(workInProgress(500, 500).entry, null);
});

test('taxes: Sàrl provisions profit × rate; RI shows AVS instead', () => {
  const s = taxProvision({ legalForm: 'sarl', profitBeforeTax: 100000, ratePercent: 14, alreadyProvisioned: 4000 });
  assert.equal(s.tax, 14000);
  assert.equal(s.change, 10000);
  assert.equal(resultImpact([s.entry]), -10000);
  const ri = taxProvision({ legalForm: 'ri', profitBeforeTax: 90000, ratePercent: 14, alreadyProvisioned: 0 });
  assert.equal(ri.entry, null);
  assert.equal(ri.avsSelfEmployed, 9000);
  assert.equal(taxProvision({ legalForm: 'sa', profitBeforeTax: -5000, ratePercent: 14, alreadyProvisioned: 0 }).entry, null);
});

test('checks: drafts and an unbalanced trial balance block the closing', () => {
  const c = closingChecks({ draftEntries: 2, unmatchedBankTransactions: 0, trialDebit: 100, trialCredit: 100, bankLedgerBalance: 5000, bankStatementBalance: 5000, vatPeriodsOpen: 1, balanceSheetGap: 0 });
  const by = Object.fromEntries(c.map((x) => [x.key, x.status]));
  assert.equal(by.drafts, 'blocking');
  assert.equal(by.trial_balance, 'ok');
  assert.equal(by.vat, 'warning');
  assert.equal(by.bank_reconciliation, 'ok');
});
