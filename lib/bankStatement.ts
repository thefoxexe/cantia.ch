// camt.053 ("Bank-to-Customer Statement") and camt.054 ("Bank-to-Customer
// Debit/Credit Notification") reader — the ISO 20022 formats every Swiss
// bank's e-banking exports (UBS, PostFinance, Raiffeisen, banques
// cantonales...), used here to bulk reconcile bank transactions against
// Cantia's own records (factures, dépenses, écritures) instead of checking
// each payment by hand.
//
// Built on fast-xml-parser (pure JS, works identically on web/iOS/Android —
// no dependency on a platform DOMParser). NOT verified against the official
// ISO 20022 XSD or the Swiss SIX "Implementation Guidelines for the camt.05x"
// PDF (neither was available while building this) — the structure below
// reflects the internationally standard, extremely stable camt.05x message
// shape used worldwide, not a Swiss-only reading. Real Swiss bank exports
// should be tested against this parser before relying on it for anything
// beyond suggestions a human confirms — which is exactly how it's used here
// (see the reconciliation functions' own comments: a suggested match is
// never booked automatically).
import { XMLParser } from 'fast-xml-parser';

export interface BankStatementEntry {
  date: string; // booking date, ISO yyyy-mm-dd
  valueDate: string | null;
  amount: number; // unsigned — direction carries the sign
  currency: string;
  direction: 'credit' | 'debit';
  reference: string | null; // structured creditor reference (QRR/SCOR/ISR), whitespace-stripped
  bankReference: string | null; // AcctSvcrRef — the bank's own id for this entry, when present
  endToEndId: string | null;
  debtorName: string | null;
  creditorName: string | null;
  counterpartyIban: string | null;
  info: string | null; // unstructured remittance info / additional entry info
}

export interface ParsedCamtStatement {
  format: 'camt053' | 'camt054';
  accountIban: string | null;
  currency: string;
  statementFrom: string | null;
  statementTo: string | null;
  openingBalance: number | null;
  closingBalance: number | null;
  entries: BankStatementEntry[];
  error: string | null;
}

export interface ParseResult {
  entries: BankStatementEntry[];
  error: string | null;
}

function asArray<T>(v: T | T[] | undefined | null): T[] {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

// fast-xml-parser gives a plain value when an element has no attributes,
// or an object with the text under '#text' when it does (e.g. <Amt Ccy="CHF">1.00</Amt>).
function textOf(v: any): string | null {
  if (v == null) return null;
  if (typeof v === 'object') return v['#text'] != null ? String(v['#text']) : null;
  return String(v);
}

function numberOf(v: any): number | null {
  const s = textOf(v);
  if (s == null) return null;
  const n = Number(s.replace(',', '.'));
  return Number.isNaN(n) ? null : n;
}

function attrOf(v: any, name: string): string | null {
  if (v == null || typeof v !== 'object') return null;
  const val = v[`@_${name}`];
  return val != null ? String(val) : null;
}

function dateOf(v: any): string | null {
  // <BookgDt><Dt>2026-01-15</Dt></BookgDt> or <BookgDt><DtTm>2026-01-15T00:00:00</DtTm></BookgDt>
  if (v == null) return null;
  const raw = textOf(v.Dt) ?? textOf(v.DtTm);
  if (!raw) return null;
  return raw.slice(0, 10);
}

function parseEntryDetails(ntry: any): { endToEndId: string | null; bankReference: string | null; debtorName: string | null; creditorName: string | null; counterpartyIban: string | null; reference: string | null; info: string | null } {
  const txDtls = asArray(ntry?.NtryDtls).flatMap((d: any) => asArray(d?.TxDtls))[0];
  const refs = txDtls?.Refs ?? {};
  const rltdParties = txDtls?.RltdPties ?? {};
  const rmtInf = txDtls?.RmtInf ?? ntry?.RmtInf ?? {};

  const debtorName = textOf(rltdParties?.Dbtr?.Nm) ?? null;
  const creditorName = textOf(rltdParties?.Cdtr?.Nm) ?? null;
  const counterpartyIban = textOf(rltdParties?.DbtrAcct?.Id?.IBAN) ?? textOf(rltdParties?.CdtrAcct?.Id?.IBAN) ?? null;

  const strdRef = asArray(rmtInf?.Strd)
    .map((s: any) => textOf(s?.CdtrRefInf?.Ref))
    .find((r: string | null) => !!r);
  const ustrd = asArray(rmtInf?.Ustrd)
    .map((u: any) => textOf(u))
    .filter(Boolean)
    .join(' ');
  const addtl = textOf(ntry?.AddtlNtryInf);

  return {
    endToEndId: textOf(refs?.EndToEndId) ?? null,
    bankReference: textOf(refs?.AcctSvcrRef) ?? textOf(ntry?.AcctSvcrRef) ?? null,
    debtorName,
    creditorName,
    counterpartyIban,
    reference: strdRef ? strdRef.replace(/\s+/g, '').toUpperCase() : null,
    info: (ustrd || addtl || '').trim() || null,
  };
}

function parseEntries(ntries: any[]): BankStatementEntry[] {
  const entries: BankStatementEntry[] = [];
  for (const ntry of ntries) {
    const amtNode = ntry?.Amt;
    const amount = numberOf(amtNode);
    if (amount == null) continue;
    const currency = attrOf(amtNode, 'Ccy') ?? 'CHF';

    const dirRaw = textOf(ntry?.CdtDbtInd);
    if (dirRaw !== 'CRDT' && dirRaw !== 'DBIT') continue;
    const direction: 'credit' | 'debit' = dirRaw === 'CRDT' ? 'credit' : 'debit';

    const date = dateOf(ntry?.BookgDt) ?? dateOf(ntry?.ValDt);
    if (!date) continue;
    const valueDate = dateOf(ntry?.ValDt);

    const details = parseEntryDetails(ntry);
    const debtorOrCreditorName = direction === 'credit' ? details.debtorName : details.creditorName;

    entries.push({
      date,
      valueDate,
      amount,
      currency,
      direction,
      reference: details.reference,
      bankReference: details.bankReference,
      endToEndId: details.endToEndId,
      debtorName: debtorOrCreditorName,
      creditorName: details.creditorName,
      counterpartyIban: details.counterpartyIban,
      info: details.info,
    });
  }
  return entries;
}

export function parseCamtStatement(xml: string): ParsedCamtStatement {
  const empty = { format: 'camt053' as const, accountIban: null, currency: 'CHF', statementFrom: null, statementTo: null, openingBalance: null, closingBalance: null, entries: [] };
  let doc: any;
  try {
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', textNodeName: '#text', trimValues: true });
    doc = parser.parse(xml);
  } catch {
    return { ...empty, error: "Ce fichier n'est pas un XML valide." };
  }

  const document = doc?.Document;
  if (!document) {
    return { ...empty, error: "Ce fichier ne ressemble pas à un relevé bancaire ISO 20022 (élément racine <Document> introuvable)." };
  }

  const isStatement = !!document.BkToCstmrStmt;
  const isNotification = !!document.BkToCstmrDbtCdtNtfctn;
  if (!isStatement && !isNotification) {
    return { ...empty, error: "Ce fichier ne correspond ni à un camt.053 ni à un camt.054 (message racine reconnu introuvable)." };
  }

  const format: 'camt053' | 'camt054' = isStatement ? 'camt053' : 'camt054';
  const container = isStatement ? asArray(document.BkToCstmrStmt.Stmt)[0] : asArray(document.BkToCstmrDbtCdtNtfctn.Ntfctn)[0];
  if (!container) {
    return { ...empty, format, error: 'Aucun relevé exploitable trouvé dans ce fichier.' };
  }

  const accountIban = textOf(container.Acct?.Id?.IBAN) ?? null;
  const currency = textOf(container.Acct?.Ccy) ?? 'CHF';
  const statementFrom = dateOf(container.FrToDt?.FrDtTm) ?? textOf(container.FrToDt?.FrDtTm)?.slice(0, 10) ?? null;
  const statementTo = dateOf(container.FrToDt?.ToDtTm) ?? textOf(container.FrToDt?.ToDtTm)?.slice(0, 10) ?? null;

  let openingBalance: number | null = null;
  let closingBalance: number | null = null;
  for (const bal of asArray(container.Bal)) {
    const code = textOf(bal?.Tp?.CdOrPrtry?.Cd);
    const amount = numberOf(bal?.Amt);
    if (amount == null) continue;
    const signed = textOf(bal?.CdtDbtInd) === 'DBIT' ? -amount : amount;
    if (code === 'OPBD' || code === 'PRCD') openingBalance = signed;
    if (code === 'CLBD' || code === 'CLAV') closingBalance = signed;
  }

  const entries = parseEntries(asArray(container.Ntry));
  if (entries.length === 0) {
    return { format, accountIban, currency, statementFrom, statementTo, openingBalance, closingBalance, entries: [], error: 'Aucune écriture exploitable trouvée dans ce relevé.' };
  }

  return { format, accountIban, currency, statementFrom, statementTo, openingBalance, closingBalance, entries, error: null };
}

// Backward-compatible wrapper for existing callers that only need the flat
// entry list (kept so nothing else in the app needs to change).
export function parseCamt053(xml: string): ParseResult {
  const parsed = parseCamtStatement(xml);
  return { entries: parsed.entries, error: parsed.error };
}

// Cheap, non-cryptographic 64-bit FNV-1a fingerprint — good enough to spot
// "you already imported this exact file" without pulling in a crypto
// dependency for something that isn't a security boundary.
export function fingerprintText(text: string): string {
  let h1 = 0xcbf29ce4;
  let h2 = 0x84222325;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 = (h1 ^ c) >>> 0;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 = (h2 ^ c) >>> 0;
    h2 = Math.imul(h2, 0x01000197) >>> 0;
  }
  return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0') + text.length.toString(16);
}

// Deterministic per-transaction identity for the dedupe_key unique index:
// prefer the bank's own reference when it provided one (AcctSvcrRef or
// EndToEndId), otherwise fall back to a composite of the fields that
// together make a transaction unique in practice. Not a hash — a plain,
// legible string is easier to debug a "flagged as duplicate" report with.
export function buildDedupeKey(entry: BankStatementEntry): string {
  if (entry.bankReference) return `ref:${entry.bankReference}`;
  if (entry.endToEndId) return `e2e:${entry.endToEndId}`;
  return `c:${entry.date}|${entry.direction}|${entry.amount.toFixed(2)}|${entry.currency}|${(entry.info ?? '').slice(0, 80)}|${entry.debtorName ?? entry.creditorName ?? ''}`;
}
