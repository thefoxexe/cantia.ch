-- The "Case 15 — Remarque" option added to the deduction-type settings
-- screen (CertificateBox TS union, generate-lohnausweis-pdf) was never
-- mirrored onto the actual DB check constraint, which still only allowed
-- box9/box10_1/box10_2/box12 — caught by the standard-catalog migration's
-- own "Cotisation IJM" backfill failing against it.
alter table public.payroll_deduction_types
  drop constraint payroll_deduction_types_certificate_box_check;

alter table public.payroll_deduction_types
  add constraint payroll_deduction_types_certificate_box_check
  check (certificate_box is null or certificate_box = any (array['box9', 'box10_1', 'box10_2', 'box12', 'box15']));

notify pgrst, 'reload schema';
