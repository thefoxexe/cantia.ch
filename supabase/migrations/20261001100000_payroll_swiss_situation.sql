-- The employee's situation, filled in by the employer in « Ajouter un
-- employé » / « Situation & charges », from which lib/payroll/swissEngine.ts
-- computes the charges each month (AVS, AC, LPP by age, LAA, IJM, family
-- allowance fund, withholding tax, family allowances). swiss_auto = the
-- engine replaces the standard catalog lines for this employee;
-- payroll_overrides = the "avancé" rates (SwissOverrides), which win over
-- the computed ones.
alter table public.payroll_profiles
  add column if not exists swiss_auto boolean not null default false,
  add column if not exists nationality text check (nationality is null or char_length(nationality) <= 60),
  add column if not exists permit text check (permit in ('swiss', 'C', 'B', 'L', 'G', 'F', 'N', 'S', 'other')),
  add column if not exists marital_status text check (marital_status in ('single', 'married', 'registered', 'divorced', 'separated', 'widowed')),
  add column if not exists spouse_is_swiss_or_c boolean not null default false,
  add column if not exists spouse_works boolean not null default false,
  add column if not exists lives_with_children boolean not null default false,
  add column if not exists children_under_16 smallint not null default 0 check (children_under_16 between 0 and 20),
  add column if not exists children_in_training smallint not null default 0 check (children_in_training between 0 and 20),
  add column if not exists church_tax boolean not null default false,
  add column if not exists residence_country text not null default 'CH' check (residence_country in ('CH', 'FR', 'DE', 'IT', 'AT', 'other')),
  add column if not exists lpp_insured boolean not null default true,
  add column if not exists receives_family_allowances boolean not null default true,
  add column if not exists payroll_overrides jsonb not null default '{}'::jsonb;
