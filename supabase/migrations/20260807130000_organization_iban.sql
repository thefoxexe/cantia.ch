-- Creditor account for the Swiss QR-bill payment slip generated_devis-pdf
-- attaches to devis PDFs when set. Nullable/opt-in: no IBAN means no
-- QR-bill section (existing behavior for every org, unchanged).
alter table public.organizations
  add column iban text;
