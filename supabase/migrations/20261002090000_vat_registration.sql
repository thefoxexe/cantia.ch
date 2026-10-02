-- VAT only applies to companies that are VAT-registered AND have a valid
-- IDE number (lib/vat/vatStatus.ts).
--
-- 1. The VAT settings (Comptabilité › TVA and the onboarding question)
--    could never be saved: organizations only grants UPDATE column by
--    column and these columns were missing, so the update failed silently
--    and every company stayed "not registered". Rows are still limited to
--    the company's admins by the existing RLS policy.
grant update (vat_liable, vat_method, vat_basis_default, vat_periodicity, vat_liable_since, vat_rounding)
  on public.organizations to authenticated;

-- 2. Companies that already entered a valid IDE number keep charging VAT
--    (they're the ones that are registered). Everyone else: no VAT on their
--    future documents until they declare it. Existing documents untouched.
update public.organizations
  set vat_liable = true
  where not vat_liable
    and ide_number ~* 'CHE'
    and length(regexp_replace(ide_number, '\D', '', 'g')) = 9;
