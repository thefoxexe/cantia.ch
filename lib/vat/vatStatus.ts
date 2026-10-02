// When a company charges VAT. One rule, used everywhere (new devis /
// factures / travaux supplémentaires, previews, the accounting VAT module):
// it declared itself VAT-registered AND has a valid IDE / UID number
// (CHE-123.456.789). Without both, documents carry no VAT and the VAT
// module stays locked — charging VAT without being registered isn't allowed.

export function hasValidIde(ide: string | null | undefined): boolean {
  if (!ide) return false;
  return /CHE/i.test(ide) && ide.replace(/\D/g, '').length === 9;
}

export function vatApplies(org: { vat_liable?: boolean | null; ide_number?: string | null } | null | undefined): boolean {
  return !!org?.vat_liable && hasValidIde(org.ide_number);
}

// VAT rate for a new document: the company's default rate, or 0.
export function documentVatRate(org: { vat_liable?: boolean | null; ide_number?: string | null; default_vat_rate?: number | null } | null | undefined): number {
  return vatApplies(org) ? Number(org?.default_vat_rate ?? 8.1) : 0;
}

// "CHE-123.456.789" from whatever was typed (spaces, no dashes, "TVA"/"MWST" suffix).
export function formatIde(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 9);
  if (!d) return /^c/i.test(raw.trim()) ? 'CHE-' : '';
  return `CHE-${d.slice(0, 3)}${d.length > 3 ? '.' + d.slice(3, 6) : ''}${d.length > 6 ? '.' + d.slice(6, 9) : ''}`;
}
