-- Cahier des charges V2, Lot 4 §7.6 "Moteur de paie et snapshot" — the
-- foundation the rest of Lot 4 (wage types, retroactive corrections,
-- employer cost) needs underneath it. Today every payslip screen
-- (app/(app)/rh/[userId].tsx) recomputes gross/deductions/net live from
-- whatever payroll_deduction_types/payroll_profile_deductions say right
-- now — a rate change silently changes every past month's figures too,
-- the opposite of the cahier's explicit "une modification ultérieure
-- d'un taux ne doit pas changer une ancienne fiche validée". This
-- persists one row per employee per period with a full snapshot of what
-- was actually used, and a real lifecycle instead of "always live".
create table public.payroll_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  year integer not null,
  month integer not null check (month between 1 and 12),
  -- Grouping/period container for now — no function transitions this to
  -- 'validee' yet (a "close the whole month at once" action is a natural
  -- follow-up once every individual payroll_slips lifecycle below has
  -- been used in practice); the real per-employee lock that matters
  -- today is each slip's own status.
  status text not null default 'brouillon' check (status in ('brouillon', 'validee')),
  created_by uuid,
  created_at timestamptz not null default now(),
  validated_by uuid,
  validated_at timestamptz,
  unique (organization_id, year, month)
);
create index on public.payroll_runs (organization_id, year, month);
alter table public.payroll_runs enable row level security;

create table public.payroll_slips (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.payroll_runs(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  ghost_employee_id uuid references public.payroll_ghost_employees(id) on delete cascade,
  owner_key uuid generated always as (coalesce(user_id, ghost_employee_id)) stored,
  year integer not null,
  month integer not null check (month between 1 and 12),
  status text not null default 'brouillon' check (status in ('brouillon', 'calculee', 'validee', 'payee', 'extournee')),
  salary_type text not null check (salary_type in ('hourly', 'monthly')),
  hourly_rate_chf numeric(10, 2),
  monthly_salary_chf numeric(10, 2),
  total_hours numeric(8, 2),
  gross_chf numeric(12, 2) not null default 0,
  total_deductions_chf numeric(12, 2) not null default 0,
  net_chf numeric(12, 2) not null default 0,
  -- Employer-side cost is deliberately left null, not zero: no employer
  -- contribution rate exists anywhere in this schema yet (§7.3 is a
  -- separate, not-yet-built piece — see that migration's own comment
  -- when it lands), and 0 would misrepresent "not modeled" as "no cost".
  employer_cost_chf numeric(12, 2),
  -- Full record of what produced gross/net: every deduction line with the
  -- exact rate or fixed amount actually applied (not just the total), so
  -- a later change to payroll_deduction_types/payroll_profile_deductions
  -- can never retroactively alter what this slip shows.
  snapshot jsonb not null,
  calculated_at timestamptz,
  calculated_by uuid,
  validated_at timestamptz,
  validated_by uuid,
  paid_at timestamptz,
  reversed_slip_id uuid references public.payroll_slips(id),
  created_at timestamptz not null default now(),
  check ((user_id is not null and ghost_employee_id is null) or (user_id is null and ghost_employee_id is not null))
);
-- Partial, not plain unique: reverse_payroll_slip marks a corrected slip
-- 'extournee' and inserts a fresh 'brouillon' for the same run+employee to
-- redo — both rows must be able to coexist, only one "live" (non-extournee)
-- slip per run+employee at a time is the actual invariant.
create unique index payroll_slips_run_owner_idx on public.payroll_slips (run_id, owner_key) where status <> 'extournee';
create index on public.payroll_slips (organization_id, year, month);
alter table public.payroll_slips enable row level security;

-- Same single-tier permission the rest of payroll already uses (no
-- separate "consulter les salaires" flag exists yet in this app —
-- pre-existing scope, not introduced here).
create policy "payroll managers can view payroll runs" on public.payroll_runs
  for select using (public.can_manage_org_payroll(organization_id));
create policy "payroll managers can view payroll slips" on public.payroll_slips
  for select using (public.can_manage_org_payroll(organization_id));
-- No direct insert/update/delete policies on either table — every write
-- goes through the SECURITY DEFINER functions below, which enforce the
-- lifecycle (a validated/payee slip can never be silently recalculated).

notify pgrst, 'reload schema';
