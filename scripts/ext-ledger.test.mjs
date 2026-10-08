import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatBalances, formatEntries } from '../lib/accounting/exports.ts';
import {
  nextReference,
  openingEntry,
  parseAmount,
  parseChart,
  parseJournal,
  parseOpening,
  quickLines,
  splitDelimited,
  toIsoDate,
  vatIncluded,
} from '../lib/accounting/ledgerImport.ts';

const entries = [
  { entry_number: 1, entry_date: '2026-03-01', label: 'Facture 101', lines: [{ account_code: '1100', debit: 1081, credit: 0 }, { account_code: '3400', debit: 0, credit: 1000, vat_code: 'V81' }, { account_code: '2200', debit: 0, credit: 81 }] },
  { entry_number: 2, entry_date: '2026-03-15', label: 'Loyer; "mars"', lines: [{ account_code: '6000', debit: 2000, credit: 0 }, { account_code: '1020', debit: 0, credit: 2000 }] },
];
const sum = (lines, k) => Math.round(lines.reduce((s, l) => s + l[k], 0) * 100) / 100;

test('amounts and dates in Swiss, German and Excel writings', () => {
  assert.equal(parseAmount("1'234.50"), 1234.5);
  assert.equal(parseAmount('1 234,50'), 1234.5);
  assert.equal(parseAmount('1.234,50'), 1234.5);
  assert.equal(parseAmount('1,234.50'), 1234.5);
  assert.equal(parseAmount('12,5'), 12.5);
  assert.equal(parseAmount('(12.30)'), -12.3);
  assert.equal(parseAmount('12.30-'), -12.3);
  assert.equal(parseAmount('CHF 80'), 80);
  assert.equal(parseAmount('abc'), null);
  assert.equal(toIsoDate('31.12.2026'), '2026-12-31');
  assert.equal(toIsoDate('1.3.26'), '2026-03-01');
  assert.equal(toIsoDate('2026-03-01'), '2026-03-01');
  assert.equal(toIsoDate(46082), '2026-03-01');
  assert.equal(toIsoDate('31.02.2026'), null);
});

test('our own Banana / Abacus / Winbiz exports read back to the same entries', () => {
  for (const format of ['banana', 'abacus', 'winbiz']) {
    const out = formatEntries(format, entries);
    const parsed = parseJournal(splitDelimited(out.content));
    assert.equal(parsed.errors.length, 0, format);
    assert.equal(parsed.entries.length, 2, format);
    const [sale, rent] = parsed.entries;
    assert.equal(sale.date, '2026-03-01');
    assert.equal(sale.reference, '1');
    assert.equal(sale.lines.length, 3);
    assert.equal(sum(sale.lines, 'debit'), 1081);
    assert.equal(sum(sale.lines, 'credit'), 1081);
    assert.equal(sale.lines.find((l) => l.account_code === '3400').vat_code, 'V81');
    assert.equal(rent.label, 'Loyer; "mars"');
    assert.deepEqual(rent.lines.map((l) => [l.account_code, l.debit, l.credit]), [['6000', 2000, 0], ['1020', 0, 2000]]);
  }
});

test('a journal with one account per row (debit / credit amounts) and a negative amount', () => {
  const rows = splitDelimited('Datum;Beleg;Konto;Text;Soll;Haben\n05.01.2026;B1;1020;Einlage;20000.00;\n05.01.2026;B1;2800;Einlage;;20000.00\n06.01.2026;B2;6500;Büro;45.00;\n06.01.2026;B2;1000;Büro;;45.00\nTotal;;;;20045;20045\n');
  const parsed = parseJournal(rows);
  assert.equal(parsed.layout, 'one-account');
  assert.equal(parsed.entries.length, 2);
  assert.equal(parsed.skipped, 1);
  assert.deepEqual(parsed.entries[1].lines.map((l) => [l.account_code, l.debit, l.credit]), [['6500', 45, 0], ['1000', 0, 45]]);
  const neg = parseJournal([['Date', 'Doc', 'Description', 'AccountDebit', 'AccountCredit', 'Amount'], ['2026-02-01', '9', 'Correction', '6500', '1020', '-30']]);
  assert.deepEqual(neg.entries[0].lines.map((l) => [l.account_code, l.debit, l.credit]), [['1020', 30, 0], ['6500', 0, 30]]);
});

test('an unbalanced collective entry is reported with its row, the rest is kept', () => {
  const parsed = parseJournal([
    ['Date', 'Doc', 'Description', 'AccountDebit', 'AccountCredit', 'Amount'],
    ['2026-02-01', '7', 'Achat', '4000', '', '100'],
    ['2026-02-01', '7', 'Achat', '', '2000', '90'],
    ['2026-02-02', '8', 'Ok', '6500', '1020', '10'],
  ]);
  assert.equal(parsed.entries.length, 1);
  assert.deepEqual(parsed.errors, [{ row: 2, message: 'unbalanced:100:90' }]);
});

test('chart of accounts (Banana with classes) and opening balances, liabilities positive or signed', () => {
  const chart = parseChart([['Group', 'Account', 'Description', 'BClass'], ['', '1020', 'Banque', '1'], ['', '2800', 'Capital', '2'], ['10', '', 'Liquidités', ''], ['', '4000', 'Matériel', '3']]);
  assert.deepEqual(chart.accounts, [{ code: '1020', label: 'Banque', type: 'actif' }, { code: '2800', label: 'Capital', type: 'passif' }, { code: '4000', label: 'Matériel', type: 'charge' }]);
  assert.equal(chart.skipped, 1);

  const signed = parseOpening(splitDelimited(formatBalances('abacus', [{ code: '1020', label: 'Bank', balance: 15000 }, { code: '1100', label: 'Debitoren', balance: 5000 }, { code: '2800', label: 'Kapital', balance: -20000 }], '2025-12-31')));
  assert.equal(signed.inverted, false);
  assert.deepEqual(signed.balances.map((b) => b.balance), [15000, 5000, -20000]);

  const positive = parseOpening([['Compte', 'Libellé', 'Solde'], ['1020', 'Banque', "15'000.00"], ['2000', 'Créanciers', '3000'], ['2800', 'Capital', '12000']]);
  assert.equal(positive.inverted, true);
  assert.deepEqual(positive.balances.map((b) => b.balance), [15000, -3000, -12000]);

  const entry = openingEntry([{ code: '1020', balance: 15000 }, { code: '2800', balance: -12000 }], '2026-01-01', 'Soldes d’ouverture');
  assert.equal(sum(entry.lines, 'debit'), sum(entry.lines, 'credit'));
  assert.deepEqual(entry.lines.at(-1), { account_code: '9100', debit: 0, credit: 3000 });
});

test('quick entry with VAT: sales to 2200, purchases to 1170 / 1171, balanced', () => {
  assert.equal(vatIncluded(1081, 8.1), 81);
  const sale = quickLines({ debit: '1100', credit: '3400', amount: 1081, vat: 'V81', label: 'F 101' });
  assert.deepEqual(sale.map((l) => [l.account_code, l.debit, l.credit]), [['1100', 1081, 0], ['3400', 0, 1000], ['2200', 0, 81]]);
  const buy = quickLines({ debit: '4000', credit: '2000', amount: 102.6, vat: 'M26' });
  assert.deepEqual(buy.map((l) => [l.account_code, l.debit, l.credit]), [['4000', 100, 0], ['1170', 2.6, 0], ['2000', 0, 102.6]]);
  const invest = quickLines({ debit: '1520', credit: '1020', amount: 1500, vat: 'I81' });
  assert.equal(invest[1].account_code, '1171');
  assert.equal(sum(invest, 'debit'), sum(invest, 'credit'));
  assert.deepEqual(quickLines({ debit: '6500', credit: '1020', amount: 20 }).map((l) => [l.account_code, l.debit, l.credit]), [['6500', 20, 0], ['1020', 0, 20]]);
  assert.equal(nextReference('F101'), 'F102');
  assert.equal(nextReference('2026-009'), '2026-010');
  assert.equal(nextReference('Q'), 'Q');
});
