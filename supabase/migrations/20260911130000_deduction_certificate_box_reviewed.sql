-- Fixes generate-lohnausweis-pdf's blocking "unmapped deduction" error
-- firing for essentially every organization on their very first attempt:
-- the 6 deduction types every org was seeded with
-- (20260818120000_payroll_configurable_types.sql) were never given a
-- certificate_box, and both "never configured" and "deliberately excluded
-- from the certificate" were stored the same way (certificate_box: null),
-- so the edge function had no way to tell them apart and always blocked.
--
-- certificate_box_reviewed makes that distinction explicit: true once an
-- admin has saved this type's box choice at least once (see
-- lib/api/payroll.ts createDeductionType/updateDeductionType), regardless
-- of which box — including "Aucune". generate-lohnausweis-pdf now checks
-- this flag instead of the box value itself.
alter table public.payroll_deduction_types
  add column certificate_box_reviewed boolean not null default false;

-- Anything already explicitly mapped to a box is obviously reviewed.
update public.payroll_deduction_types
set certificate_box_reviewed = true
where certificate_box is not null;

-- Ziffer 9 of the official Lohnausweis (Wegleitung zum Ausfüllen des
-- Lohnausweises) explicitly covers AHV/IV/EO/ALV *and* NBUV (accidents non
-- professionnels) contributions borne by the employee, so these three of
-- the seeded defaults map there with no real ambiguity.
update public.payroll_deduction_types
set certificate_box = 'box9', certificate_box_reviewed = true
where certificate_box is null
  and label in ('Cotisation AVS/AI/APG', 'Cotisation AC', 'Cotisation AANP');

-- CAF (allocations familiales), LAAC (accidents complémentaire) and IJM
-- (indemnités journalières maladie) have no standard Ziffer of their own —
-- they generally aren't itemized on the certificate. Rather than invent a
-- box for them, they're marked reviewed with no box: the same "excluded
-- from the certificate" choice the settings screen already offers as
-- "Aucune". An admin whose caisse/canton disagrees can still change this
-- from Compte -> RH & Salaires.
update public.payroll_deduction_types
set certificate_box_reviewed = true
where certificate_box is null
  and label in ('Cotisation CAF', 'Cotisation LAAC', 'Cotisation IJM');
