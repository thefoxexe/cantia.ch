-- Part 2 of the RH/Heures/Salaires plan: the actual module data — hours
-- logged per member/chantier, professional expenses (km indemnity), and a
-- per-member salary profile (rate + brut/net deductions) that only
-- secretary/admin can see and edit. Plan/permission groundwork was laid in
-- 20260817000000_payroll_plan_and_permissions.sql.

-- ==========================================================================
-- Module availability by plan — same has_X convention as has_planning/
-- has_profitability (client-side gate on the module toggle, see
-- compte/modules.tsx), not enforced again at the RLS layer.
-- ==========================================================================
alter table public.plans add column has_payroll boolean not null default false;

update public.plans set has_payroll = false where id in ('free', 'solo');
update public.plans set has_payroll = true where id in ('equipe', 'pro', 'custom');

-- Company-wide, admin-editable mileage indemnity rate — used to turn a
-- logged km expense into a CHF amount. Swiss market-standard default.
alter table public.organizations add column payroll_km_rate_chf numeric(5,2) not null default 0.70;

-- ==========================================================================
-- Hours logged per member, per day, optionally tied to a chantier.
-- ==========================================================================
create table public.payroll_time_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  hours numeric(5,2) not null check (hours > 0 and hours <= 24),
  note text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.payroll_time_entries (organization_id, user_id, entry_date);
create index on public.payroll_time_entries (project_id);

create trigger payroll_time_entries_set_updated_at before update on public.payroll_time_entries
for each row execute function public.set_updated_at();

alter table public.payroll_time_entries enable row level security;

create policy "members can view own or managed time entries" on public.payroll_time_entries
  for select using (
    public.is_org_member(organization_id)
    and (user_id = auth.uid() or public.can_manage_org_payroll(organization_id))
  );
create policy "members can create own or managed time entries" on public.payroll_time_entries
  for insert with check (
    public.is_org_member(organization_id)
    and (user_id = auth.uid() or public.can_manage_org_payroll(organization_id))
    and created_by = auth.uid()
  );
create policy "members can update own or managed time entries" on public.payroll_time_entries
  for update using (
    public.is_org_member(organization_id)
    and (user_id = auth.uid() or public.can_manage_org_payroll(organization_id))
  );
create policy "members can delete own or managed time entries" on public.payroll_time_entries
  for delete using (
    public.is_org_member(organization_id)
    and (user_id = auth.uid() or public.can_manage_org_payroll(organization_id))
  );

-- ==========================================================================
-- Professional expenses (mileage or other), same visibility rule as hours.
-- ==========================================================================
create table public.payroll_expenses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  expense_date date not null,
  category text not null default 'km' check (category in ('km', 'autre')),
  km numeric(7,1),
  amount_chf numeric(10,2) not null check (amount_chf >= 0),
  note text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index on public.payroll_expenses (organization_id, user_id, expense_date);

alter table public.payroll_expenses enable row level security;

create policy "members can view own or managed expenses" on public.payroll_expenses
  for select using (
    public.is_org_member(organization_id)
    and (user_id = auth.uid() or public.can_manage_org_payroll(organization_id))
  );
create policy "members can create own or managed expenses" on public.payroll_expenses
  for insert with check (
    public.is_org_member(organization_id)
    and (user_id = auth.uid() or public.can_manage_org_payroll(organization_id))
    and created_by = auth.uid()
  );
create policy "members can update own or managed expenses" on public.payroll_expenses
  for update using (
    public.is_org_member(organization_id)
    and (user_id = auth.uid() or public.can_manage_org_payroll(organization_id))
  );
create policy "members can delete own or managed expenses" on public.payroll_expenses
  for delete using (
    public.is_org_member(organization_id)
    and (user_id = auth.uid() or public.can_manage_org_payroll(organization_id))
  );

-- ==========================================================================
-- Salary profile per member — the "fiche" only secretary/admin can see or
-- edit. A plain member never sees this table at all (unlike hours/expenses,
-- which they see their own rows of): rate, brut/net deduction settings are
-- management-only information. Deduction rates default to typical 2026
-- AVS/AC employee-share percentages but stay fully editable — LPP is a flat
-- CHF amount (it depends on the pension fund and coordinated salary, not a
-- clean percentage) and source tax defaults to 0 (only relevant for some
-- employees) since both vary too much to assume a default confidently.
-- ==========================================================================
create table public.payroll_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  salary_type text not null default 'hourly' check (salary_type in ('hourly', 'monthly')),
  hourly_rate_chf numeric(8,2),
  monthly_salary_chf numeric(10,2),
  avs_rate_percent numeric(5,3) not null default 5.300,
  ac_rate_percent numeric(5,3) not null default 1.100,
  lpp_amount_chf numeric(10,2) not null default 0,
  laa_rate_percent numeric(5,3) not null default 0.500,
  source_tax_rate_percent numeric(5,3) not null default 0,
  notes text,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create trigger payroll_profiles_set_updated_at before update on public.payroll_profiles
for each row execute function public.set_updated_at();

alter table public.payroll_profiles enable row level security;

create policy "payroll managers can view profiles" on public.payroll_profiles
  for select using (public.can_manage_org_payroll(organization_id));
create policy "payroll managers can create profiles" on public.payroll_profiles
  for insert with check (public.can_manage_org_payroll(organization_id) and updated_by = auth.uid());
create policy "payroll managers can update profiles" on public.payroll_profiles
  for update using (public.can_manage_org_payroll(organization_id));
create policy "payroll managers can delete profiles" on public.payroll_profiles
  for delete using (public.can_manage_org_payroll(organization_id));
