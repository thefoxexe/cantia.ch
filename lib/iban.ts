// Only CH/LI IBANs are accepted — that's what the Swiss QR-bill (the
// creditor account on generated devis PDFs) requires; other countries use a
// different payment rail entirely.
export function isValidSwissIban(raw: string): boolean {
  const iban = raw.replace(/\s+/g, '').toUpperCase();
  if (!/^(CH|LI)\d{19}$/.test(iban)) return false;
  // ISO 7064 MOD97-10: move the first 4 chars to the end, map letters to
  // numbers (A=10..Z=35), then the whole string must be ≡ 1 (mod 97).
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (ch) => String(ch.charCodeAt(0) - 55));
  let remainder = 0;
  for (const digit of numeric) {
    remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder === 1;
}

// Display grouping, e.g. "CH44 3199 9123 0008 8901 2" — cosmetic only, the
// stored/validated value stays unspaced.
export function formatIban(raw: string): string {
  const iban = raw.replace(/\s+/g, '').toUpperCase();
  return iban.replace(/(.{4})/g, '$1 ').trim();
}
