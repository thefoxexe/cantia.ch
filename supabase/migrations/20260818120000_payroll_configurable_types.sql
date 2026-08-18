-- Reworks the RH/Heures/Salaires data model after user feedback on the
-- first version: fixed AVS/AC/LPP/LAA/source-tax columns don't match how
-- Swiss payslips actually look (more deduction lines: CAF, AANP, LAAC,
-- IJM…, all canton/caisse-specific), and hours/expenses need to be typed
-- by company-configured categories ("type de travail", "type de frais")
-- instead of a single free-form note and a hardcoded km/autre split.
--
-- Nothing here has any real production data yet (the module shipped in the
-- previous migration minutes ago, unreleased to end users), so this is a
-- clean rework rather than a careful backward-compatible migration:
-- payroll_expenses.category/km are dropped in favor of expense_type_id/
-- quantity, and payroll_profiles' fixed rate columns are dropped in favor
-- of the new payroll_deduction_types + payroll_profile_deductions tables.

-- ==========================================================================
-- Company-managed catalogs — every org gets its own list, editable only by
-- payroll managers, but readable by every member (they pick from these
-- lists when logging their own hours/expenses).
-- ==========================================================================
create table public.payroll_work_types (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  label text not null,
  hourly_rate_chf numeric(8,2),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.payroll_expense_types (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  label text not null,
  unit text not null default 'forfait' check (unit in ('km', 'forfait')),
  rate_chf numeric(8,2),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.payroll_deduction_types (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  label text not null,
  default_rate_percent numeric(6,4),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.payroll_work_types enable row level security;
alter table public.payroll_expense_types enable row level security;
alter table public.payroll_deduction_types enable row level security;

create policy "members can view work types" on public.payroll_work_types
  for select using (public.is_org_member(organization_id));
create policy "payroll managers can manage work types" on public.payroll_work_types
  for all using (public.can_manage_org_payroll(organization_id)) with check (public.can_manage_org_payroll(organization_id));

create policy "members can view expense types" on public.payroll_expense_types
  for select using (public.is_org_member(organization_id));
create policy "payroll managers can manage expense types" on public.payroll_expense_types
  for all using (public.can_manage_org_payroll(organization_id)) with check (public.can_manage_org_payroll(organization_id));

-- Deduction types are the one catalog kept manager-only even to read —
-- unlike work/expense types, seeing the list would reveal how salaries are
-- broken down, which is management-only information (same rationale as
-- payroll_profiles itself).
create policy "payroll managers can view deduction types" on public.payroll_deduction_types
  for select using (public.can_manage_org_payroll(organization_id));
create policy "payroll managers can manage deduction types" on public.payroll_deduction_types
  for all using (public.can_manage_org_payroll(organization_id)) with check (public.can_manage_org_payroll(organization_id));

-- ==========================================================================
-- Per-employee override of an org deduction type — a row only exists once
-- an admin has actually touched that line for that employee; absent a row,
-- the effective rate is the deduction type's own default_rate_percent and
-- the line is considered enabled. This means creating a new deduction type
-- doesn't require touching every employee's profile.
-- ==========================================================================
create table public.payroll_profile_deductions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  deduction_type_id uuid not null references public.payroll_deduction_types(id) on delete cascade,
  rate_percent numeric(6,4),
  fixed_amount_chf numeric(10,2),
  enabled boolean not null default true,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id, deduction_type_id)
);

create trigger payroll_profile_deductions_set_updated_at before update on public.payroll_profile_deductions
for each row execute function public.set_updated_at();

alter table public.payroll_profile_deductions enable row level security;

create policy "payroll managers can view profile deductions" on public.payroll_profile_deductions
  for select using (public.can_manage_org_payroll(organization_id));
create policy "payroll managers can manage profile deductions" on public.payroll_profile_deductions
  for all using (public.can_manage_org_payroll(organization_id)) with check (public.can_manage_org_payroll(organization_id));

-- ==========================================================================
-- payroll_profiles: drop the fixed AVS/AC/LPP/LAA/source-tax columns, now
-- superseded by payroll_deduction_types + payroll_profile_deductions.
-- ==========================================================================
alter table public.payroll_profiles
  drop column avs_rate_percent,
  drop column ac_rate_percent,
  drop column lpp_amount_chf,
  drop column laa_rate_percent,
  drop column source_tax_rate_percent;

-- ==========================================================================
-- payroll_time_entries: a chantier-scoped, typed hour entry can now record
-- either a plain hours figure or a start/end time range (the UI computes
-- hours from the range and still stores it in `hours`, so every existing
-- query/aggregate keeps working unchanged).
-- ==========================================================================
alter table public.payroll_time_entries
  add column work_type_id uuid references public.payroll_work_types(id) on delete set null,
  add column start_time time,
  add column end_time time;

-- ==========================================================================
-- payroll_expenses: category/km replaced by a reference to the org's own
-- expense-type catalog plus a generic quantity (km count for a 'km'-unit
-- type, unused for 'forfait').
-- ==========================================================================
alter table public.payroll_expenses
  add column expense_type_id uuid references public.payroll_expense_types(id) on delete set null,
  add column quantity numeric(9,2);

alter table public.payroll_expenses
  drop column category,
  drop column km;

-- ==========================================================================
-- Seed every organization with a realistic starting catalog — editable
-- immediately, not meant to be the final word. Deduction defaults mirror a
-- real Swiss payslip breakdown (Valais, employee share) shared by the
-- product owner; every rate varies by canton/caisse/branch in practice.
-- ==========================================================================
insert into public.payroll_expense_types (organization_id, label, unit, rate_chf, sort_order)
select id, 'Kilométrage', 'km', coalesce(payroll_km_rate_chf, 0.70), 0 from public.organizations;

insert into public.payroll_deduction_types (organization_id, label, default_rate_percent, sort_order)
select id, label, rate, ord
from public.organizations
cross join (values
  ('Cotisation AVS/AI/APG', 5.3000, 0),
  ('Cotisation AC', 1.1000, 1),
  ('Cotisation CAF', 0.1300, 2),
  ('Cotisation AANP', 0.8900, 3),
  ('Cotisation LAAC', 0.2430, 4),
  ('Cotisation IJM', 0.4350, 5)
) as defaults(label, rate, ord);
