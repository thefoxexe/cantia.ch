// Client-side mirror of the QRR reference logic in
// supabase/functions/_shared/qrbill.ts — duplicated rather than imported
// because that file lives in a Deno edge function bundle, not something
// this RN app can import from. Kept byte-for-byte identical (same MOD10
// table, same derivation from the facture id) so the reference shown here
// always matches the one printed on the actual QR-bill.
export function isValidSwissIban(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const iban = raw.replace(/\s+/g, '').toUpperCase();
  if (!/^(CH|LI)\d{19}$/.test(iban)) return false;
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (ch) => String(ch.charCodeAt(0) - 55));
  let remainder = 0;
  for (const digit of numeric) {
    remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder === 1;
}

export function isQrIban(raw: string | null | undefined): boolean {
  if (!isValidSwissIban(raw)) return false;
  const iban = (raw ?? '').replace(/\s+/g, '').toUpperCase();
  const iid = Number(iban.slice(4, 9));
  return iid >= 30000 && iid <= 31999;
}

const MOD10_TABLE = [
  [0, 9, 4, 6, 8, 2, 7, 1, 3, 5],
  [9, 4, 6, 8, 2, 7, 1, 3, 5, 0],
  [4, 6, 8, 2, 7, 1, 3, 5, 0, 9],
  [6, 8, 2, 7, 1, 3, 5, 0, 9, 4],
  [8, 2, 7, 1, 3, 5, 0, 9, 4, 6],
  [2, 7, 1, 3, 5, 0, 9, 4, 6, 8],
  [7, 1, 3, 5, 0, 9, 4, 6, 8, 2],
  [1, 3, 5, 0, 9, 4, 6, 8, 2, 7],
  [3, 5, 0, 9, 4, 6, 8, 2, 7, 1],
  [5, 0, 9, 4, 6, 8, 2, 7, 1, 3],
];
function mod10CheckDigit(digits: string): number {
  let carry = 0;
  for (const ch of digits) carry = MOD10_TABLE[carry][Number(ch)];
  return (10 - carry) % 10;
}

export function generateQrrReference(documentId: string): string {
  const hex = documentId.replace(/-/g, '');
  const digits = hex
    .split('')
    .map((ch) => String(parseInt(ch, 16) % 10))
    .join('')
    .padStart(26, '0')
    .slice(-26);
  return digits + mod10CheckDigit(digits);
}

export function formatReferenceForDisplay(ref: string): string {
  return ref.replace(/(.{2})(.{5})(.{5})(.{5})(.{5})(.{5})/, '$1 $2 $3 $4 $5 $6');
}
