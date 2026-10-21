// The files a fiduciary takes out of Cantia, built from the journal of the
// end-to-end check on the live database (lib/accounting/sampleBooks.ts).
// Set ACCOUNTING_PROOF_DIR to also write them to disk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { formatEntries } from '../lib/accounting/exports.ts';
import { extVatRows, ech0217Report } from '../lib/accounting/extVat.ts';
import { parseJournal, splitDelimited } from '../lib/accounting/ledgerImport.ts';
import { buildAfcForm } from '../lib/vat/afcForm.ts';
import { buildEch0217Xml } from '../lib/vat/ech0217.ts';
import { CLIENT, JOURNAL, VAT_SUMMARY_Q3_2026 } from '../lib/accounting/sampleBooks.ts';

const OUT = process.env.ACCOUNTING_PROOF_DIR;
const save = (name, content) => {
  if (!OUT) return;
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, name), content);
};
const r2 = (n) => Math.round(n * 100) / 100;

test('every entry of the journal balances', () => {
  for (const e of JOURNAL) {
    const d = r2(e.lines.reduce((s, l) => s + l.debit, 0));
    const c = r2(e.lines.reduce((s, l) => s + l.credit, 0));
    assert.equal(d, c, `entry ${e.entry_number}`);
  }
});

test('AFC form of Q3 2026: 200 / 303 / 400 / 405 / 500 from the VAT codes of the books', () => {
  const { rows, unknown } = extVatRows(VAT_SUMMARY_Q3_2026);
  assert.deepEqual(unknown, []);
  const form = buildAfcForm(rows, 'effective', {}, false);
  const fig = Object.fromEntries([...form.turnover, ...form.tax, ...form.other].map((l) => [l.figure, l.tax ?? l.amount ?? l.turnover]));
  assert.equal(fig['200'], 12000);
  assert.equal(form.totalTax, 972);
  assert.equal(form.totalInputTax, 405);
  assert.equal(form.payable, 567);
  // The booked VAT accounts agree with the form (controls of the screen).
  assert.equal(VAT_SUMMARY_Q3_2026.vat_due, form.totalTax);
  assert.equal(VAT_SUMMARY_Q3_2026.input_tax, form.totalInputTax);
  const csv = [['Chiffre', 'Montant CHF'].join(';'), ...[...form.turnover, ...form.tax, ...form.other].map((l) => [l.figure, (l.tax ?? l.amount ?? 0).toFixed(2)].join(';'))].join('\r\n');
  save('formulaire-tva-T3-2026.csv', '﻿' + csv + '\r\n');
});

test('eCH-0217 v2.0.0 file for the AFC portal', () => {
  const { rows } = extVatRows(VAT_SUMMARY_Q3_2026);
  const settings = { vatLiable: true, vatMethod: 'effective', vatBasisDefault: 'invoiced', vatPeriodicity: 'trimestrielle', vatLiableSince: null, vatRounding: 'aucun', ideNumber: CLIENT.ide_number };
  const { xml, warnings } = buildEch0217Xml(CLIENT, '2026-07-01', '2026-10-01', 'cantia-bonvin-2026-Q3', settings, ech0217Report(rows));
  assert.deepEqual(warnings, []);
  assert.match(xml, /<VATDeclaration xmlns="http:\/\/www\.ech\.ch\/xmlns\/eCH-0217\/2"/);
  assert.match(xml, /<eCH-0108:uidOrganisationId>123456788<\/eCH-0108:uidOrganisationId>/);
  assert.match(xml, /<reportingPeriodFrom>2026-07-01<\/reportingPeriodFrom>/);
  assert.match(xml, /<reportingPeriodTill>2026-09-30<\/reportingPeriodTill>/);
  assert.match(xml, /<totalConsideration>12000\.00<\/totalConsideration>/);
  assert.match(xml, /<taxRate>8\.10<\/taxRate>\s*<turnover>12000\.00<\/turnover>/);
  assert.match(xml, /<inputTaxMaterialAndServices>243\.00<\/inputTaxMaterialAndServices>/);
  assert.match(xml, /<inputTaxInvestments>162\.00<\/inputTaxInvestments>/);
  assert.match(xml, /<payableTax>567\.00<\/payableTax>/);
  save('tva-T3-2026-eCH-0217.xml', xml.replace(/<generationTime>[^<]+</, '<generationTime>2026-10-21T21:18:53<'));
});

test('Banana, Abacus and Winbiz files read back to the same journal', () => {
  for (const format of ['banana', 'abacus', 'winbiz']) {
    const out = formatEntries(format, JOURNAL);
    save(`journal-${format}.${out.extension}`, out.content);
    const parsed = parseJournal(splitDelimited(out.content.replace(/^﻿/, '')));
    assert.deepEqual(parsed.errors ?? [], [], format);
    assert.equal(parsed.entries.length, JOURNAL.length, format);
    // Same accounts, same amounts, same VAT codes, entry by entry.
    const shape = (e) => e.lines.map((l) => `${l.account_code}:${r2(Number(l.debit))}:${r2(Number(l.credit))}:${l.vat_code ?? ''}`).sort().join(' ');
    assert.deepEqual(parsed.entries.map(shape), JOURNAL.map(shape), format);
  }
});

test('an invoice with VAT is one row, amount including VAT, with its VAT code', () => {
  const banana = formatEntries('banana', JOURNAL).content.split('\r\n');
  assert.ok(banana.includes('2026-07-05\t8\tFacture 212 · Cuisine Dupuis\t1100\t3400\t12972.00\tV81'));
  assert.ok(banana.includes('2026-07-20\t9\tPanneaux et quincaillerie · Bois Valais SA\t4000\t2000\t3243.00\tM81'));
  assert.ok(banana.includes('2026-08-12\t10\tOrdinateur portable atelier\t1520\t1020\t2162.00\tI81'));
  // The VAT return entry itself has no code: it stays a collective booking.
  assert.equal(banana.filter((l) => l.includes('\t12\tDécompte TVA')).length, 4);
});

test('an invoice posted by Cantia (code V-NORM on the VAT line) is exported with the standard code', () => {
  const posted = [{ entry_number: 41, entry_date: '2026-10-02', label: 'Facture F-2026-041', lines: [
    { account_code: '1100', debit: 5405, credit: 0, vat_code: null },
    { account_code: '3200', debit: 0, credit: 5000, vat_code: null },
    { account_code: '2200', debit: 0, credit: 405, vat_code: 'V-NORM' },
  ] }];
  assert.equal(formatEntries('banana', posted).content.split('\r\n')[1], '2026-10-02\t41\tFacture F-2026-041\t1100\t3200\t5405.00\tV81');
  const old = [{ entry_number: 7, entry_date: '2023-05-02', label: 'Facture 2023', lines: [
    { account_code: '1100', debit: 1077, credit: 0 }, { account_code: '3200', debit: 0, credit: 1000 }, { account_code: '2200', debit: 0, credit: 77, vat_code: 'V-NORM' },
  ] }];
  assert.match(formatEntries('abacus', old).content, /02\.05\.2023;7;1100;3200;1077\.00;Facture 2023;V77/);
});

