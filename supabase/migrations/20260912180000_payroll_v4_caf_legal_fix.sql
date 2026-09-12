-- Legal correctness fix, found while auditing employer-side contributions
-- for Lot 4 §7.3/§7.8: "Cotisation CAF" was seeded as a 0.13% EMPLOYEE-side
-- deduction. Under Swiss law (LAFam), family allowances are funded
-- entirely by the EMPLOYER via a caisse de compensation — there is no
-- legal basis for any employee-side CAF deduction at all. This has been
-- silently reducing net pay on every payslip computed for orgs that had
-- this default active.
--
-- Fix, in order: (1) new organizations never get this line seeded again;
-- (2) the 6 organizations that already have it, verified live to have no
-- per-employee override disabling it, are corrected — archived (active =
-- false, matching the "archive, never delete" convention already used
-- for accounting_accounts) and zeroed, so it stops affecting any future
-- payslip computation without deleting the row (payroll_profile_deductions
-- rows referencing it, and any past on-demand payslip PDF someone already
-- generated using it, are historical facts this cannot and should not
-- silently rewrite — this only stops it from being wrong going forward).
create or replace function public.seed_standard_payroll_catalog(p_organization_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_year integer := extract(year from now())::integer;
  v_rates record;
begin
  select * into v_rates from public.swiss_social_insurance_rates where year = v_year;
  if not found then
    select * into v_rates from public.swiss_social_insurance_rates order by year desc limit 1;
  end if;

  insert into public.payroll_deduction_types
    (organization_id, label, default_rate_percent, certificate_box, certificate_box_reviewed, sort_order)
  select p_organization_id, x.label, x.rate, x.box, true, x.ord
  from (
    values
      ('Cotisation AVS/AI/APG', coalesce(v_rates.avs_ai_apg_employee_percent, 5.300), 'box9'::text, 0),
      ('Cotisation AC', coalesce(v_rates.ac_employee_percent, 1.100), 'box9', 1),
      -- Cotisation CAF removed here — see this migration's own header
      -- comment. It never belonged in the employee-side catalog: family
      -- allowances are 100% employer-funded under Swiss law (LAFam).
      ('Cotisation AANP', 0.890, 'box9', 3),
      ('Cotisation LAAC', 0.243, null, 4),
      ('Cotisation IJM', 0.435, 'box15', 5)
  ) as x(label, rate, box, ord)
  where not exists (
    select 1 from public.payroll_deduction_types dt
    where dt.organization_id = p_organization_id and dt.label = x.label
  );

  insert into public.payroll_expense_types
    (organization_id, label, unit, rate_chf, certificate_subbox, certificate_subbox_reviewed, sort_order)
  select p_organization_id, 'Kilométrage', 'km', 0.70, '13_2_2', true, 0
  where not exists (
    select 1 from public.payroll_expense_types et
    where et.organization_id = p_organization_id and et.label = 'Kilométrage'
  );
end;
$$;

-- Corrects the organizations that already got the wrong default.
update public.payroll_deduction_types
set active = false, default_rate_percent = 0
where label = 'Cotisation CAF' and default_rate_percent > 0;

notify pgrst, 'reload schema';
