// Posted entries of a Cantia client, in the import formats of the
// fiduciary's own software. Pure functions (Node tests in
// scripts/accounting-exports.test.mjs).
//
// A two-line entry (one debit, one credit) is one row with both accounts.
// A split entry (more lines) becomes one row per line, each with only its
// debit OR credit account and the same document number: the "collective
// booking" every one of these programs reads.

export interface ExportLine {
  account_code: string;
  debit: number;
  credit: number;
  label?: string | null;
  vat_code?: string | null;
}

export interface ExportEntry {
  entry_number: number | null;
  entry_date: string; // YYYY-MM-DD
  label: string;
  external_reference?: string | null;
  lines: ExportLine[];
}

export type ExportFormat = 'banana' | 'abacus' | 'winbiz';

export interface ExportRow {
  date: string;
  doc: string;
  text: string;
  debit: string;
  credit: string;
  amount: number;
  vat: string;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function entryRows(entries: ExportEntry[]): ExportRow[] {
  const rows: ExportRow[] = [];
  const sorted = [...entries].sort((a, b) => a.entry_date.localeCompare(b.entry_date) || (a.entry_number ?? 0) - (b.entry_number ?? 0));
  for (const e of sorted) {
    const doc = e.entry_number != null ? String(e.entry_number) : e.external_reference ?? '';
    const lines = e.lines.filter((l) => Number(l.debit) > 0 || Number(l.credit) > 0);
    const debits = lines.filter((l) => Number(l.debit) > 0);
    const credits = lines.filter((l) => Number(l.credit) > 0);
    if (debits.length === 1 && credits.length === 1 && round2(Number(debits[0].debit)) === round2(Number(credits[0].credit))) {
      const vat = debits[0].vat_code || credits[0].vat_code || '';
      rows.push({ date: e.entry_date, doc, text: e.label, debit: debits[0].account_code, credit: credits[0].account_code, amount: round2(Number(debits[0].debit)), vat });
      continue;
    }
    for (const l of lines) {
      const isDebit = Number(l.debit) > 0;
      rows.push({
        date: e.entry_date,
        doc,
        text: l.label ? `${e.label} – ${l.label}` : e.label,
        debit: isDebit ? l.account_code : '',
        credit: isDebit ? '' : l.account_code,
        amount: round2(isDebit ? Number(l.debit) : Number(l.credit)),
        vat: l.vat_code ?? '',
      });
    }
  }
  return rows;
}

const swissDate = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;
const csv = (v: string) => (/[;"\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
const tsv = (v: string) => v.replace(/[\t\r\n]+/g, ' ');

export function formatEntries(format: ExportFormat, entries: ExportEntry[]): { content: string; extension: 'txt' | 'csv'; mime: string } {
  const rows = entryRows(entries);
  if (format === 'banana') {
    // Banana: Actions › Importer dans la comptabilité › Écritures (texte séparé par tabulations)
    const head = ['Date', 'Doc', 'Description', 'AccountDebit', 'AccountCredit', 'Amount', 'VatCode'];
    const body = rows.map((r) => [r.date, r.doc, tsv(r.text), r.debit, r.credit, r.amount.toFixed(2), r.vat].join('\t'));
    return { content: [head.join('\t'), ...body].join('\r\n') + '\r\n', extension: 'txt', mime: 'text/tab-separated-values;charset=utf-8' };
  }
  if (format === 'abacus') {
    // Abacus FIBU: import des écritures (CSV), à mapper une fois dans la définition d’import.
    const head = ['Datum', 'Beleg', 'Soll', 'Haben', 'Betrag', 'Text', 'MWST-Code'];
    const body = rows.map((r) => [swissDate(r.date), r.doc, r.debit, r.credit, r.amount.toFixed(2), csv(r.text), r.vat].join(';'));
    return { content: '﻿' + [head.join(';'), ...body].join('\r\n') + '\r\n', extension: 'csv', mime: 'text/csv;charset=utf-8' };
  }
  // Winbiz: Comptabilité › Importer des écritures (CSV)
  const head = ['Date', 'Pièce', 'Compte débit', 'Compte crédit', 'Libellé', 'Montant', 'Code TVA'];
  const body = rows.map((r) => [swissDate(r.date), r.doc, r.debit, r.credit, csv(r.text), r.amount.toFixed(2), r.vat].join(';'));
  return { content: '﻿' + [head.join(';'), ...body].join('\r\n') + '\r\n', extension: 'csv', mime: 'text/csv;charset=utf-8' };
}

// Account balances at a date (opening balances in the other software).
export function formatBalances(format: ExportFormat, rows: { code: string; label: string; balance: number }[], date: string): string {
  const live = rows.filter((r) => Math.abs(r.balance) >= 0.005);
  if (format === 'banana') {
    return ['Account\tDescription\tOpening', ...live.map((r) => [r.code, tsv(r.label), r.balance.toFixed(2)].join('\t'))].join('\r\n') + '\r\n';
  }
  const head = format === 'abacus' ? ['Konto', 'Bezeichnung', `Saldo ${swissDate(date)}`] : ['Compte', 'Libellé', `Solde au ${swissDate(date)}`];
  return '﻿' + [head.join(';'), ...live.map((r) => [r.code, csv(r.label), r.balance.toFixed(2)].join(';'))].join('\r\n') + '\r\n';
}
