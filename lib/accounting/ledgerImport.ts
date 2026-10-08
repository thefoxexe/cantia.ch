// The books of a client outside Cantia (supabase/migrations/20261009090000_fiduciary_ledger.sql):
// reading the files of the client's old software (Banana, Abacus, Winbiz,
// any CSV / Excel journal), its chart of accounts and its opening balances,
// and building the lines of a quick entry with Swiss VAT. Pure functions
// (Node tests in scripts/ext-ledger.test.mjs); the screen reads the file.

export interface LedgerLine {
  account_code: string;
  debit: number;
  credit: number;
  label?: string | null;
  vat_code?: string | null;
  account_label?: string | null;
}

export interface LedgerEntryInput {
  date: string; // YYYY-MM-DD
  reference: string | null;
  label: string;
  lines: LedgerLine[];
}

export interface ParsedJournal {
  entries: LedgerEntryInput[];
  errors: { row: number; message: string }[];
  skipped: number;
  layout: 'two-accounts' | 'one-account' | null;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const pad = (n: number) => String(n).padStart(2, '0');

// ── cells ──────────────────────────────────────────────────────────────

export function normalizeHeader(v: unknown): string {
  return String(v ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// Date object, Excel serial, ISO, Swiss "31.12.2026" / "31.12.26", "31/12/2026".
export function toIsoDate(v: unknown): string | null {
  if (v == null || v === '') return null;
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    const d = new Date(v.getTime() + 12 * 3600_000);
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  }
  if (typeof v === 'number' && v > 20000 && v < 80000) {
    const d = new Date(Date.UTC(1899, 11, 30) + Math.round(v) * 86400_000);
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  }
  const s = String(v).trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return valid(Number(m[1]), Number(m[2]), Number(m[3]));
  m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2}|\d{4})$/);
  if (m) {
    const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
    return valid(y, Number(m[2]), Number(m[1]));
  }
  return null;
}

function valid(y: number, mo: number, d: number): string | null {
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCMonth() !== mo - 1 || y < 1990 || y > 2100) return null;
  return `${y}-${pad(mo)}-${pad(d)}`;
}

// 1'234.50 · 1 234,50 · 1.234,50 · -12.3 · (12.30) · 12.30- → number
export function parseAmount(v: unknown): number | null {
  if (v == null || v === '') return null;
  if (typeof v === 'number') return Number.isFinite(v) ? round2(v) : null;
  let s = String(v).trim().replace(/[’'\s ]/g, '').replace(/^CHF/i, '').replace(/CHF$/i, '');
  if (!s) return null;
  let neg = false;
  if (/^\(.*\)$/.test(s)) {
    neg = true;
    s = s.slice(1, -1);
  }
  if (s.endsWith('-')) {
    neg = true;
    s = s.slice(0, -1);
  }
  if (s.startsWith('-')) {
    neg = !neg;
    s = s.slice(1);
  }
  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');
  if (lastComma > -1 && lastDot > -1) s = lastComma > lastDot ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  else if (lastComma > -1) s = /,\d{3}$/.test(s) && s.indexOf(',') !== lastComma ? s.replace(/,/g, '') : s.replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  const n = round2(Number(s));
  return neg ? -n : n;
}

const cleanAccount = (v: unknown) => String(v ?? '').trim().replace(/\s+/g, '');

// ── delimited text ─────────────────────────────────────────────────────

// Tab (Banana), semicolon (Abacus, Winbiz, Swiss Excel) or comma CSV,
// with quoted fields. A BOM is dropped.
export function splitDelimited(text: string): string[][] {
  const src = text.replace(/^﻿/, '');
  const firstLine = src.split(/\r?\n/, 1)[0] ?? '';
  const count = (c: string) => firstLine.split(c).length - 1;
  const sep = count('\t') > 0 ? '\t' : count(';') >= count(',') ? ';' : ',';
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += ch;
      continue;
    }
    if (ch === '"' && cell === '') quoted = true;
    else if (ch === sep) {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += ch;
  }
  if (cell !== '' || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => String(c).trim() !== ''));
}

// ── journal ────────────────────────────────────────────────────────────

const H = {
  date: ['date', 'datum', 'data', 'buchungsdatum', 'date ecriture'],
  doc: ['doc', 'beleg', 'belegnr', 'beleg nr', 'piece', 'no piece', 'n piece', 'document', 'numero', 'nr', 'no', 'ref', 'reference', 'documento'],
  text: ['description', 'text', 'buchungstext', 'libelle', 'texte', 'testo', 'descrizione', 'label', 'designation', 'bezeichnung'],
  debitAccount: ['accountdebit', 'account debit', 'compte debit', 'cpte debit', 'soll', 'ktsoll', 'kt soll', 'sollkonto', 'konto soll', 'conto dare', 'dare', 'debit account', 'compte au debit'],
  creditAccount: ['accountcredit', 'account credit', 'compte credit', 'cpte credit', 'haben', 'kthaben', 'kt haben', 'habenkonto', 'konto haben', 'conto avere', 'avere', 'credit account', 'compte au credit'],
  amount: ['amount', 'montant', 'betrag', 'importo', 'amount chf', 'montant chf', 'betrag chf', 'importo chf', 'amountcurrency'],
  vat: ['vatcode', 'vat code', 'code tva', 'tva', 'mwst code', 'mwst', 'mwstcode', 'codice iva', 'iva', 'vat'],
  account: ['account', 'compte', 'konto', 'conto', 'kontonummer', 'no compte', 'numero de compte'],
  debitAmount: ['debit', 'debit chf', 'soll chf', 'montant debit', 'dare chf', 'sollbetrag'],
  creditAmount: ['credit', 'credit chf', 'haben chf', 'montant credit', 'avere chf', 'habenbetrag'],
};

function findCol(head: string[], names: string[], taken: Set<number>): number {
  for (const n of names) {
    const i = head.findIndex((h, j) => !taken.has(j) && h === n);
    if (i > -1) return i;
  }
  return -1;
}

export function detectJournalColumns(header: unknown[]) {
  const head = header.map(normalizeHeader);
  const taken = new Set<number>();
  const pick = (names: string[]) => {
    const i = findCol(head, names, taken);
    if (i > -1) taken.add(i);
    return i;
  };
  const date = pick(H.date);
  const amount = pick(H.amount);
  const debitAccount = pick(H.debitAccount);
  const creditAccount = pick(H.creditAccount);
  const vat = pick(H.vat);
  const text = pick(H.text);
  const doc = pick(H.doc);
  if (date > -1 && amount > -1 && debitAccount > -1 && creditAccount > -1) {
    return { layout: 'two-accounts' as const, date, doc, text, debitAccount, creditAccount, amount, vat, account: -1, debitAmount: -1, creditAmount: -1 };
  }
  // One account per row with debit / credit amount columns ("Soll"/"Haben"
  // are then amounts, not accounts).
  taken.clear();
  [date, doc, text, vat].forEach((i) => i > -1 && taken.add(i));
  const account = pick(H.account);
  const debitAmount = pick([...H.debitAmount, 'soll', 'dare']);
  const creditAmount = pick([...H.creditAmount, 'haben', 'avere']);
  if (date > -1 && account > -1 && (debitAmount > -1 || creditAmount > -1 || amount > -1)) {
    return { layout: 'one-account' as const, date, doc, text, debitAccount: -1, creditAccount: -1, amount, vat, account, debitAmount, creditAmount };
  }
  return null;
}

// Rows of a journal (first row with a date column is the header) → entries.
// Two-account rows are entries of their own; one-sided rows sharing a date
// and a document number (or, without number, until they balance) form one
// collective entry, the way Banana, Abacus and Winbiz write them.
export function parseJournal(rows: unknown[][]): ParsedJournal {
  const errors: ParsedJournal['errors'] = [];
  let headerAt = -1;
  let cols: ReturnType<typeof detectJournalColumns> = null;
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    cols = detectJournalColumns(rows[i] ?? []);
    if (cols) {
      headerAt = i;
      break;
    }
  }
  if (!cols) return { entries: [], errors: [{ row: 1, message: 'header' }], skipped: 0, layout: null };
  const c = cols;
  const entries: LedgerEntryInput[] = [];
  let skipped = 0;
  let group: { key: string; doc: string; entry: LedgerEntryInput; row: number } | null = null;

  const flush = () => {
    if (!group) return;
    const d = round2(group.entry.lines.reduce((s, l) => s + l.debit, 0));
    const cr = round2(group.entry.lines.reduce((s, l) => s + l.credit, 0));
    if (group.entry.lines.length < 2 || d !== cr) errors.push({ row: group.row, message: `unbalanced:${d}:${cr}` });
    else entries.push(group.entry);
    group = null;
  };
  const cell = (r: unknown[], i: number) => (i > -1 ? r[i] : null);
  const str = (v: unknown) => (v == null ? '' : String(v).trim());

  for (let i = headerAt + 1; i < rows.length; i++) {
    const r = rows[i] ?? [];
    const rowNo = i + 1;
    const date = toIsoDate(cell(r, c.date));
    const doc = str(cell(r, c.doc));
    const text = str(cell(r, c.text));
    const vat = str(cell(r, c.vat)) || null;
    if (!date) {
      if (r.some((v) => str(v) !== '')) skipped++;
      continue;
    }

    let account = '';
    let debit = 0;
    let credit = 0;
    if (c.layout === 'two-accounts') {
      const da = cleanAccount(cell(r, c.debitAccount));
      const ca = cleanAccount(cell(r, c.creditAccount));
      let amount = parseAmount(cell(r, c.amount));
      if (amount == null || amount === 0 || (!da && !ca)) {
        skipped++;
        continue;
      }
      if (da && ca) {
        flush();
        let [dAcc, cAcc] = [da, ca];
        if (amount < 0) {
          [dAcc, cAcc] = [ca, da];
          amount = -amount;
        }
        if (dAcc === cAcc) {
          skipped++;
          continue;
        }
        entries.push({
          date,
          reference: doc || null,
          label: text || doc || 'Écriture',
          lines: [
            { account_code: dAcc, debit: amount, credit: 0, label: null, vat_code: vat },
            { account_code: cAcc, debit: 0, credit: amount, label: null, vat_code: null },
          ],
        });
        continue;
      }
      account = da || ca;
      if ((da && amount > 0) || (ca && amount < 0)) debit = Math.abs(amount);
      else credit = Math.abs(amount);
    } else {
      account = cleanAccount(cell(r, c.account));
      const dAmt = parseAmount(cell(r, c.debitAmount)) ?? 0;
      const cAmt = parseAmount(cell(r, c.creditAmount)) ?? 0;
      const net = c.debitAmount > -1 || c.creditAmount > -1 ? round2(dAmt - cAmt) : parseAmount(cell(r, c.amount)) ?? 0;
      if (!account || net === 0) {
        skipped++;
        continue;
      }
      if (net > 0) debit = net;
      else credit = -net;
    }

    const key = `${date}|${doc}`;
    const g = group as { key: string; doc: string; entry: LedgerEntryInput; row: number } | null;
    const balanced = g ? round2(g.entry.lines.reduce((s, l) => s + l.debit - l.credit, 0)) === 0 && g.entry.lines.length >= 2 : false;
    if (!g || g.key !== key || (!doc && balanced)) {
      flush();
      group = { key, doc, row: rowNo, entry: { date, reference: doc || null, label: text || doc || 'Écriture', lines: [] } };
    }
    group!.entry.lines.push({ account_code: account, debit, credit, label: text && text !== group!.entry.label ? text : null, vat_code: vat });
  }
  flush();
  return { entries, errors, skipped, layout: c.layout };
}

// ── chart of accounts and opening balances ─────────────────────────────

const CODE = ['account', 'compte', 'konto', 'conto', 'no', 'nr', 'numero', 'kontonummer', 'code', 'group', 'gruppe'];
const LABEL = ['description', 'libelle', 'bezeichnung', 'descrizione', 'designation', 'text', 'name', 'nom', 'label', 'intitule'];
const BALANCE = ['opening', 'balance', 'solde', 'saldo', 'eroffnung', 'eroffnungssaldo', 'solde d ouverture', 'solde au', 'saldo am'];

function chartColumns(header: unknown[]) {
  const head = header.map(normalizeHeader);
  const taken = new Set<number>();
  const pick = (names: string[], prefix = false) => {
    let i = findCol(head, names, taken);
    if (i < 0 && prefix) i = head.findIndex((h, j) => !taken.has(j) && names.some((n) => h.startsWith(n)));
    if (i > -1) taken.add(i);
    return i;
  };
  const code = pick(CODE);
  const label = pick(LABEL);
  const balance = pick(BALANCE, true);
  const debit = pick(['debit', 'soll', 'dare']);
  const credit = pick(['credit', 'haben', 'avere']);
  const bclass = pick(['bclass', 'klasse', 'classe', 'type', 'typ']);
  return code > -1 ? { code, label, balance, debit, credit, bclass } : null;
}

export type AccountType = 'actif' | 'passif' | 'produit' | 'charge';

// Banana BClass: 1 assets, 2 liabilities, 3 expenses, 4 revenue.
function typeFrom(v: unknown): AccountType | undefined {
  const s = normalizeHeader(v);
  if (s === '1' || s === 'actif' || s === 'aktiv' || s === 'asset' || s === 'assets') return 'actif';
  if (s === '2' || s === 'passif' || s === 'passiv' || s === 'liability' || s === 'liabilities') return 'passif';
  if (s === '3' || s === 'charge' || s === 'aufwand' || s === 'expense' || s === 'expenses') return 'charge';
  if (s === '4' || s === 'produit' || s === 'ertrag' || s === 'revenue' || s === 'income') return 'produit';
  return undefined;
}

export function parseChart(rows: unknown[][]): { accounts: { code: string; label: string; type?: AccountType }[]; skipped: number } {
  let at = rows.findIndex((r) => chartColumns(r ?? []) != null);
  const cols = at > -1 ? chartColumns(rows[at]) : { code: 0, label: 1, balance: -1, debit: -1, credit: -1, bclass: -1 };
  if (at < 0) at = -1;
  const seen = new Set<string>();
  const accounts: { code: string; label: string; type?: AccountType }[] = [];
  let skipped = 0;
  for (let i = at + 1; i < rows.length; i++) {
    const r = rows[i] ?? [];
    const code = cleanAccount(r[cols!.code]);
    const label = String(r[cols!.label] ?? '').trim();
    if (!/^[0-9A-Za-z.]{1,12}$/.test(code) || !label || seen.has(code) || !/\d/.test(code)) {
      if (code || label) skipped++;
      continue;
    }
    seen.add(code);
    const type = cols!.bclass > -1 ? typeFrom(r[cols!.bclass]) : undefined;
    accounts.push(type ? { code, label: label.slice(0, 120), type } : { code, label: label.slice(0, 120) });
  }
  return { accounts, skipped };
}

// Opening balances: account, label, balance (signed debit − credit, or two
// debit / credit columns). When liabilities come as positive figures (the
// file only balances with classes 2 inverted), they are turned around.
export function parseOpening(rows: unknown[][]): { balances: { code: string; label: string; balance: number }[]; skipped: number; inverted: boolean } {
  const at = rows.findIndex((r) => {
    const c = chartColumns(r ?? []);
    return c != null && (c.balance > -1 || c.debit > -1 || c.credit > -1);
  });
  const cols = at > -1 ? chartColumns(rows[at])! : { code: 0, label: 1, balance: 2, debit: -1, credit: -1, bclass: -1 };
  const out: { code: string; label: string; balance: number }[] = [];
  let skipped = 0;
  for (let i = at + 1; i < rows.length; i++) {
    const r = rows[i] ?? [];
    const code = cleanAccount(r[cols.code]);
    if (!/^[0-9A-Za-z.]{1,12}$/.test(code) || !/\d/.test(code)) {
      if (r.some((v) => String(v ?? '').trim())) skipped++;
      continue;
    }
    const b = cols.balance > -1 ? parseAmount(r[cols.balance]) : round2((parseAmount(r[cols.debit]) ?? 0) - (parseAmount(r[cols.credit]) ?? 0));
    if (b == null || b === 0) continue;
    out.push({ code, label: String(cols.label > -1 ? r[cols.label] ?? '' : '').trim(), balance: b });
  }
  const sum = (list: typeof out) => round2(list.reduce((s, x) => s + x.balance, 0));
  let inverted = false;
  if (sum(out) !== 0) {
    const flipped = out.map((x) => (x.code.startsWith('2') ? { ...x, balance: -x.balance } : x));
    if (sum(flipped) === 0 || (out.every((x) => x.balance > 0) && Math.abs(sum(flipped)) < Math.abs(sum(out)))) {
      inverted = true;
      return { balances: flipped, skipped, inverted };
    }
  }
  return { balances: out, skipped, inverted };
}

// One opening entry; a difference goes to 9100 (opening balance account).
export function openingEntry(balances: { code: string; label?: string; balance: number }[], date: string, label: string): LedgerEntryInput {
  const lines: LedgerLine[] = balances
    .filter((b) => b.balance !== 0)
    .map((b) => ({ account_code: b.code, debit: b.balance > 0 ? round2(b.balance) : 0, credit: b.balance < 0 ? round2(-b.balance) : 0, account_label: b.label || null }));
  const diff = round2(lines.reduce((s, l) => s + l.debit - l.credit, 0));
  if (diff !== 0) lines.push({ account_code: '9100', debit: diff < 0 ? -diff : 0, credit: diff > 0 ? diff : 0 });
  return { date, reference: null, label, lines };
}

// ── quick entry with Swiss VAT ─────────────────────────────────────────

// V = sales (VAT due, 2200), M = material / services (input tax 1170),
// I = investments and other costs (input tax 1171). Rates from 2024.
// Sales without VAT, for the AFC form: E0 exempt (exports, ch. 220),
// A0 abroad (ch. 221), X0 excluded from VAT (art. 21, ch. 230).
export const VAT_CODES = ['V81', 'V26', 'V38', 'M81', 'M26', 'M38', 'I81', 'I26', 'I38', 'E0', 'A0', 'X0'] as const;
export type VatCode = (typeof VAT_CODES)[number];

export function vatRate(code: string): number | null {
  const m = code.match(/^[VMI](81|26|38)$/);
  return m ? Number(m[1]) / 10 : null;
}

// VAT included in a gross amount, to the centime.
export function vatIncluded(gross: number, rate: number): number {
  return round2((gross * rate) / (100 + rate));
}

// Debit / credit / gross amount (+ VAT code) → the lines of the entry.
export function quickLines(input: { debit: string; credit: string; amount: number; vat?: string | null; label?: string | null }): LedgerLine[] {
  const amount = round2(Math.abs(input.amount));
  const rate = input.vat ? vatRate(input.vat) : null;
  if (!rate) {
    // A sale without VAT carries its code on the revenue (credit) line.
    const onCredit = !!input.vat && /^[EAX]0$/.test(input.vat);
    return [
      { account_code: input.debit, debit: amount, credit: 0, label: input.label ?? null, vat_code: onCredit ? null : input.vat ?? null },
      { account_code: input.credit, debit: 0, credit: amount, label: input.label ?? null, vat_code: onCredit ? input.vat : null },
    ];
  }
  const vat = vatIncluded(amount, rate);
  const net = round2(amount - vat);
  if (input.vat!.startsWith('V')) {
    return [
      { account_code: input.debit, debit: amount, credit: 0, label: input.label ?? null },
      { account_code: input.credit, debit: 0, credit: net, label: input.label ?? null, vat_code: input.vat },
      { account_code: '2200', debit: 0, credit: vat, label: `TVA ${rate} %` },
    ];
  }
  return [
    { account_code: input.debit, debit: net, credit: 0, label: input.label ?? null, vat_code: input.vat },
    { account_code: input.vat!.startsWith('I') ? '1171' : '1170', debit: vat, credit: 0, label: `TVA ${rate} %` },
    { account_code: input.credit, debit: 0, credit: amount, label: input.label ?? null },
  ];
}

// Next document number: "F101" → "F102", "2026-009" → "2026-010".
export function nextReference(ref: string | null | undefined): string {
  if (!ref) return '';
  const m = ref.match(/^(.*?)(\d+)$/);
  if (!m) return ref;
  const n = String(Number(m[2]) + 1).padStart(m[2].length, '0');
  return `${m[1]}${n}`;
}
