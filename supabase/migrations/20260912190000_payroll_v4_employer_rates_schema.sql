-- Cahier des charges V2, Lot 4 §7.3 "Assurances et cotisations" — adds the
-- employer-side rate alongside the existing employee-side one, needed for
-- §7.8 "Coût employeur". Mirrors the exact pattern already used for the
-- employee side (an org-level default on payroll_deduction_types, an
-- optional per-employee override on payroll_profile_deductions) rather
-- than inventing a new mechanism.
--
-- Only AVS/AI/APG, AC and AC solidarité get a real, non-null default
-- pre-filled — those three are the only ones legally fixed nationwide (the
-- employer pays exactly the same rate as the employee, mirrored 50/50,
-- with no discretion). Everything else (LPP, LAA professionnelle, LAAC,
-- IJM, CAF) genuinely depends on the employer's own insurer/pension
-- fund/canton — see the existing comment on buildOptionalDeductionCatalog
-- for AC/LPP's own citation of this same principle on the employee side.
-- Auto-filling those with a guessed number would be actively wrong for
-- some employers, exactly the mistake this session already found and
-- fixed once (Cotisation CAF) — left null, the organization sets its own
-- real rate.
alter table public.payroll_deduction_types
  add column employer_rate_percent numeric(6, 3),
  add column employer_fixed_amount_chf numeric(10, 2);

alter table public.payroll_profile_deductions
  add column employer_rate_percent numeric(6, 3),
  add column employer_fixed_amount_chf numeric(10, 2);

-- Backfill the two/three legally-mirrored rates for existing orgs' AVS/AC
-- types — matches whatever employee-side default_rate_percent they
-- already carry (itself sourced from swiss_social_insurance_rates), since
-- by law the employer pays the identical percentage.
update public.payroll_deduction_types
set employer_rate_percent = default_rate_percent
where label in ('Cotisation AVS/AI/APG', 'Cotisation AC', 'Cotisation AC solidarité')
  and employer_rate_percent is null;

-- AANP (accident non-professionnel) is 100% employee-funded by law —
-- employer_rate_percent = 0 is a known fact here, not "unconfigured".
update public.payroll_deduction_types
set employer_rate_percent = 0
where label = 'Cotisation AANP' and employer_rate_percent is null;

-- Same three defaults, now for organizations created from here on.
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
    (organization_id, label, default_rate_percent, employer_rate_percent, certificate_box, certificate_box_reviewed, sort_order)
  select p_organization_id, x.label, x.rate, x.employer_rate, x.box, true, x.ord
  from (
    values
      ('Cotisation AVS/AI/APG', coalesce(v_rates.avs_ai_apg_employee_percent, 5.300), coalesce(v_rates.avs_ai_apg_employee_percent, 5.300), 'box9'::text, 0),
      ('Cotisation AC', coalesce(v_rates.ac_employee_percent, 1.100), coalesce(v_rates.ac_employee_percent, 1.100), 'box9', 1),
      ('Cotisation AANP', 0.890, 0.000, 'box9', 3),
      ('Cotisation LAAC', 0.243, null, null, 4),
      ('Cotisation IJM', 0.435, null, 'box15', 5)
  ) as x(label, rate, employer_rate, box, ord)
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

notify pgrst, 'reload schema';
