-- ==========================================================================
-- Reference table for the Swiss social-insurance figures that ARE a single
-- fixed national percentage/amount every year (AVS/AI/APG, AC, the LPP
-- coordination deduction & entry threshold) — as opposed to LPP's actual
-- contribution rate, LAA/LAAC/IJM premiums, or source-tax withholding,
-- which depend on the employer's own pension fund, insurer and canton and
-- can never be safely auto-filled here.
--
-- This is what "point 4" (mise à jour annuelle des barèmes) actually means
-- for a product without a live government API to poll: keeping this table
-- current is a one-migration-per-year job (insert next year's row) instead
-- of a code-wide hunt for hardcoded percentages. See the
-- "cantia-swiss-rates-yearly-review" scheduled Routine, which pings each
-- December to research and add the following year's row before it's
-- needed on a January payslip.
-- ==========================================================================
create table public.swiss_social_insurance_rates (
  year integer primary key,
  avs_ai_apg_employee_percent numeric(5, 3) not null,
  ac_employee_percent numeric(5, 3) not null,
  ac_cap_chf numeric(10, 2) not null,
  ac_solidarity_employee_percent numeric(5, 3) not null,
  lpp_entry_threshold_chf numeric(10, 2) not null,
  lpp_coordination_deduction_chf numeric(10, 2) not null,
  lpp_max_insured_salary_chf numeric(10, 2) not null,
  notes text,
  updated_at timestamptz not null default now()
);

-- Public read-only reference catalog, same pattern as "plans" (init
-- schema): no sensitive data, freely readable, only ever written by a
-- migration (no insert/update/delete policy for clients).
alter table public.swiss_social_insurance_rates enable row level security;

create policy "anyone can view swiss social insurance rates" on public.swiss_social_insurance_rates
  for select using (true);

insert into public.swiss_social_insurance_rates
  (year, avs_ai_apg_employee_percent, ac_employee_percent, ac_cap_chf, ac_solidarity_employee_percent, lpp_entry_threshold_chf, lpp_coordination_deduction_chf, lpp_max_insured_salary_chf, notes)
values
  (2025, 5.300, 1.100, 148200, 0.500, 22680, 26460, 90720, 'AVS/AI/APG et AC inchangés depuis 2024. Sources : ahv-iv.ch (2.01), ocas.ch.'),
  (2026, 5.300, 1.100, 148200, 0.500, 22680, 26460, 90720, 'Taux inchangés vs 2025. Sources : ahv-iv.ch (2.01), bpk.ch Aide-mémoire A3015.');

notify pgrst, 'reload schema';
