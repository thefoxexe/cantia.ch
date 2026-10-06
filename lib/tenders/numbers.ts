// Numbers as Swiss soumissions print them: "8'000", "7'200.00", "0,30",
// "1 234.50", "1’250", "-14.65". Pure functions, shared by the import
// parser, the editor and the tests.

const THOUSANDS = /['’   ]/g;

// null when the text is not a number at all (dotted price fields, words…).
export function parseSwissNumber(raw: string | null | undefined): number | null {
  if (raw == null) return null;
  let s = String(raw).trim();
  if (!s || /^\.{2,}$/.test(s)) return null;
  s = s.replace(THOUSANDS, '');
  const negative = /^[-−]/.test(s);
  s = s.replace(/^[-−+]/, '');
  if (!/^\d+([.,]\d+)?$|^\d{1,3}(,\d{3})+(\.\d+)?$|^[.,]\d+$/.test(s)) return null;
  // "1,250.50" (comma thousands) vs "0,30" (comma decimal).
  if (/^\d{1,3}(,\d{3})+\.\d+$/.test(s)) s = s.replace(/,/g, '');
  else s = s.replace(',', '.');
  const n = Number(s.startsWith('.') ? `0${s}` : s);
  if (!Number.isFinite(n)) return null;
  return negative ? -n : n;
}

export function round(n: number, decimals = 2): number {
  const f = 10 ** decimals;
  return Math.round((n + Number.EPSILON) * f) / f;
}

// 1234.5 → "1'234.50" (Swiss business notation, as in the soumission).
export function formatChf(n: number | null | undefined, decimals = 2): string {
  if (n == null || !Number.isFinite(n)) return '';
  const fixed = Math.abs(n).toFixed(decimals);
  const [int, dec] = fixed.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return `${n < 0 ? '-' : ''}${grouped}${dec ? `.${dec}` : ''}`;
}

// Quantities keep up to 3 decimals but drop trailing zeros: 820 → "820",
// 5.852 → "5.852", 58.5 → "58.50" is NOT forced (quantities are not money).
export function formatQuantity(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '';
  const r = round(n, 3);
  const [int, dec] = String(Math.abs(r)).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return `${r < 0 ? '-' : ''}${grouped}${dec ? `.${dec}` : ''}`;
}
