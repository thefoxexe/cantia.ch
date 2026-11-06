// Pure part of lib/documentNumbering.ts (tested by
// scripts/document-numbering.test.mjs): mirrors public.format_document_number
// and public.document_number_format_valid.
export const NUMBER_TOKENS = ['{AAAA}', '{AA}', '{MM}', '{NNNN}'] as const;

export function isValidNumberFormat(format: string): boolean {
  const f = format.trim();
  if (!f || f.length > 40) return false;
  if ((f.match(/\{N{1,8}\}/g) ?? []).length !== 1) return false;
  return /^[A-Za-z0-9 ._/#-]*$/.test(f.replace(/\{(AAAA|AA|MM|N{1,8})\}/g, ''));
}

// Same as public.format_document_number, in Swiss time.
export function formatDocumentNumber(format: string, n: number, at = new Date()): string {
  const parts = new Intl.DateTimeFormat('fr-CH', { timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit' }).formatToParts(at);
  const year = parts.find((p) => p.type === 'year')?.value ?? String(at.getFullYear());
  const month = parts.find((p) => p.type === 'month')?.value ?? String(at.getMonth() + 1).padStart(2, '0');
  return format
    .trim()
    .replace('{AAAA}', year)
    .replace('{AA}', year.slice(-2))
    .replace('{MM}', month)
    .replace(/\{(N+)\}/, (_, ns: string) => String(n).padStart(ns.length, '0'));
}
