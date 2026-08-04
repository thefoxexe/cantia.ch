-- Structured address (street / postal code / locality) for organizations,
-- required to emit Swiss QR-bill SPC creditor address type "S" (structured)
-- instead of "K" (combined free text). Legacy `address` column is kept as
-- a fallback for orgs that haven't filled in the structured fields yet.
alter table public.organizations
  add column street text,
  add column postal_code text,
  add column locality text;
