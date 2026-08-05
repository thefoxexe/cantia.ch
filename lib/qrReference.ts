// Client-side mirror of the payment-reference logic in
// supabase/functions/_shared/qrbill.ts — duplicated rather than imported
// because that file lives in a Deno edge function bundle, not something
// this RN app can import from. Kept byte-for-byte identical (same tables,
// same derivation from the document id) so the reference shown here always
// matches the one printed on the actual QR-bill.
export function isValidSwissIban(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const iban = raw.replace(/\s+/g, '').toUpperCase();
  if (!/^(CH|LI)\d{19}$/.test(iban)) return false;
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (ch) => String(ch.charCodeAt(0) - 55));
  return mod97(numeric) === 1;
}

export function isQrIban(raw: string | null | undefined): boolean {
  if (!isValidSwissIban(raw)) return false;
  const iban = (raw ?? '').replace(/\s+/g, '').toUpperCase();
  const iid = Number(iban.slice(4, 9));
  return iid >= 30000 && iid <= 31999;
}

// ISO 7064 MOD97-10 — the checksum shared by IBAN validation and the ISO
// 11649 structured creditor reference (SCOR) below. Digit-by-digit so it
// never needs a big-integer type for a 20+ digit number.
function mod97(digits: string): number {
  let remainder = 0;
  for (const ch of digits) {
    remainder = (remainder * 10 + Number(ch)) % 97;
  }
  return remainder;
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

// 27-digit QRR reference — only valid when the creditor has a QR-IBAN
// (bank-issued, a normal IBAN can't carry this reference type).
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

// ISO 11649 structured creditor reference ("SCOR") — the reference type
// used on a QR-bill when the org's IBAN is a regular IBAN rather than a
// QR-IBAN (the common case: a QR-IBAN has to be specifically requested
// from the bank). Unlike QRR, SCOR works with any valid IBAN, so this is
// what guarantees every facture gets a real, bank-recognized reference
// even without one.
export function generateScorReference(documentId: string): string {
  const hex = documentId.replace(/-/g, '');
  const body = hex
    .split('')
    .map((ch) => String(parseInt(ch, 16) % 10))
    .join('')
    .slice(0, 18);
  // Check digit: append literal "RF00" (letters converted to digits per
  // ISO 11649: R=27, F=15) to the body, then 98 minus the MOD97-10
  // remainder of the whole thing — the same rearrange-and-mod97 pattern
  // used for IBAN validation above, just run in the "generate" direction.
  const checkDigits = String(98 - mod97(`${body}271500`)).padStart(2, '0');
  return `RF${checkDigits}${body}`;
}

export interface PaymentReference {
  type: 'QRR' | 'SCOR';
  reference: string;
}

// Picks QRR when the org has a QR-IBAN, otherwise falls back to SCOR —
// which works with any valid Swiss/Liechtenstein IBAN — so a facture
// always gets a searchable payment reference instead of silently having
// none. Returns null only when the IBAN itself isn't valid.
export function generatePaymentReference(
  iban: string | null | undefined,
  documentId: string,
): PaymentReference | null {
  if (isQrIban(iban)) return { type: 'QRR', reference: generateQrrReference(documentId) };
  if (isValidSwissIban(iban)) return { type: 'SCOR', reference: generateScorReference(documentId) };
  return null;
}

export function formatReferenceForDisplay(ref: string, type: 'QRR' | 'SCOR' = 'QRR'): string {
  if (type === 'SCOR') return ref.replace(/(.{4})/g, '$1 ').trim();
  return ref.replace(/(.{2})(.{5})(.{5})(.{5})(.{5})(.{5})/, '$1 $2 $3 $4 $5 $6');
}
