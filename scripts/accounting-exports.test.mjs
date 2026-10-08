import { test } from 'node:test';
import assert from 'node:assert/strict';
import { entryRows, formatEntries, formatBalances } from '../lib/accounting/exports.ts';

const entries = [
  { entry_number: 2, entry_date: '2026-03-15', label: 'Achat matériel; "spécial"', lines: [
    { account_code: '4000', debit: 1000, credit: 0, vat_code: 'VSF81' }, { account_code: '1170', debit: 81, credit: 0, label: 'TVA' }, { account_code: '2000', debit: 0, credit: 1081 },
  ] },
  { entry_number: 1, entry_date: '2026-03-01', label: 'Facture 2026-001', lines: [{ account_code: '1100', debit: 5405, credit: 0 }, { account_code: '3400', debit: 0, credit: 5405, vat_code: 'V81' }] },
];

test('two-line entries are one row, split entries one row per line, sorted by date', () => {
  const rows = entryRows(entries);
  assert.equal(rows.length, 4);
  assert.deepEqual(rows[0], { date: '2026-03-01', doc: '1', text: 'Facture 2026-001', debit: '1100', credit: '3400', amount: 5405, vat: 'V81' });
  assert.deepEqual(rows.slice(1).map((r) => [r.debit, r.credit, r.amount, r.doc]), [['4000', '', 1000, '2'], ['1170', '', 81, '2'], ['', '2000', 1081, '2']]);
  assert.equal(rows[2].text, 'Achat matériel; "spécial" – TVA');
});

test('Banana: tab separated, ISO dates; Abacus and Winbiz: semicolons, Swiss dates, quoted text, BOM', () => {
  const b = formatEntries('banana', entries).content.split('\r\n');
  assert.equal(b[0], 'Date\tDoc\tDescription\tAccountDebit\tAccountCredit\tAmount\tVatCode');
  assert.equal(b[1], '2026-03-01\t1\tFacture 2026-001\t1100\t3400\t5405.00\tV81');
  const a = formatEntries('abacus', entries);
  assert.ok(a.content.startsWith('﻿Datum;Beleg;Soll;Haben;Betrag;Text;MWST-Code'));
  assert.ok(a.content.includes('15.03.2026;2;4000;;1000.00;"Achat matériel; ""spécial""";VSF81'));
  const w = formatEntries('winbiz', entries).content.split('\r\n');
  assert.equal(w[1], '01.03.2026;1;1100;3400;Facture 2026-001;5405.00;V81');
  assert.equal(formatEntries('winbiz', entries).extension, 'csv');
});

test('balances skip zero accounts', () => {
  const out = formatBalances('abacus', [{ code: '1020', label: 'Banque', balance: 1500.5 }, { code: '1000', label: 'Caisse', balance: 0 }], '2026-12-31');
  assert.ok(out.includes('Konto;Bezeichnung;Saldo 31.12.2026'));
  assert.ok(out.includes('1020;Banque;1500.50'));
  assert.ok(!out.includes('Caisse'));
});
