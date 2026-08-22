// Minimal camt.053 (ISO 20022 "Bank-to-Customer Statement") reader — the
// format every Swiss bank's e-banking exports statements in (UBS,
// PostFinance, Raiffeisen, banques cantonales...), used here to bulk
// reconcile incoming payments against unpaid factures instead of checking
// each QR reference by hand.
//
// Deliberately a small regex-based reader rather than a full XML parser:
// this app runs on web, iOS and Android from one codebase and none of them
// ship a built-in DOMParser usable identically everywhere. camt.053 entries
// (<Ntry>) don't nest, so scanning for entry-level tags by simple regex is
// reliable for the fields this needs (amount, direction, date, reference) —
// it doesn't aim to be a general ISO 20022 parser.
export interface BankStatementEntry {
  date: string; // ISO yyyy-mm-dd
  amount: number;
  currency: string;
  direction: 'credit' | 'debit';
  reference: string | null; // structured creditor reference (QRR/SCOR), whitespace-stripped
  debtorName: string | null;
  info: string | null; // unstructured remittance info / additional entry info, for display when no reference matched
}

function firstMatch(block: string, re: RegExp): string | null {
  const m = block.match(re);
  return m ? m[1] : null;
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

export interface ParseResult {
  entries: BankStatementEntry[];
  error: string | null;
}

export function parseCamt053(xml: string): ParseResult {
  if (!/<Ntry>/.test(xml)) {
    return { entries: [], error: "Ce fichier ne ressemble pas à un relevé camt.053 (aucune écriture <Ntry> trouvée)." };
  }

  const entries: BankStatementEntry[] = [];
  const blocks = xml.match(/<Ntry>[\s\S]*?<\/Ntry>/g) ?? [];

  for (const block of blocks) {
    const amtMatch = block.match(/<Amt\s+Ccy="([A-Z]{3})"[^>]*>([\d.,]+)<\/Amt>/);
    if (!amtMatch) continue;
    const currency = amtMatch[1];
    const amount = Number(amtMatch[2].replace(',', '.'));
    if (Number.isNaN(amount)) continue;

    const dirMatch = firstMatch(block, /<CdtDbtInd>(CRDT|DBIT)<\/CdtDbtInd>/);
    if (!dirMatch) continue;
    const direction: 'credit' | 'debit' = dirMatch === 'CRDT' ? 'credit' : 'debit';

    const date = firstMatch(block, /<BookgDt>[\s\S]*?<Dt>([\d-]+)<\/Dt>/) ?? firstMatch(block, /<ValDt>[\s\S]*?<Dt>([\d-]+)<\/Dt>/);
    if (!date) continue;

    const rawRef = firstMatch(block, /<CdtrRefInf>[\s\S]*?<Ref>([^<]+)<\/Ref>/);
    const reference = rawRef ? decodeXmlEntities(rawRef).replace(/\s+/g, '').toUpperCase() : null;

    const debtorName = firstMatch(block, /<Dbtr>[\s\S]*?<Nm>([^<]+)<\/Nm>/);
    const ustrd = firstMatch(block, /<Ustrd>([^<]*)<\/Ustrd>/);
    const addtl = firstMatch(block, /<AddtlNtryInf>([^<]*)<\/AddtlNtryInf>/);
    const info = decodeXmlEntities((ustrd ?? addtl ?? '').trim()) || null;

    entries.push({
      date,
      amount,
      currency,
      direction,
      reference,
      debtorName: debtorName ? decodeXmlEntities(debtorName) : null,
      info,
    });
  }

  if (entries.length === 0) {
    return { entries: [], error: 'Aucune écriture exploitable trouvée dans ce relevé.' };
  }
  return { entries, error: null };
}
