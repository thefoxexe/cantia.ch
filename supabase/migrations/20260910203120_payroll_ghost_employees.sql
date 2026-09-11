-- A payroll-only "employee" that isn't a real app user account — for
-- people who only need to exist for salary/accounting purposes (e.g. a
-- fiduciary only wants their payroll numbers, not full app access), not
-- someone who logs into Cantia to track hours. Kept as a separate table
-- rather than relaxing organization_members.user_id (NOT NULL and load-
-- bearing across nearly every RLS policy in the app) so nothing about the
-- existing permission model changes.
create table public.payroll_ghost_employees (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  full_name text not null,
  street text,
  postal_code text,
  locality text,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.payroll_ghost_employees enable row level security;

create policy "payroll managers can view ghost employees" on public.payroll_ghost_employees
  for select using (can_manage_org_payroll(organization_id));

create policy "payroll managers can create ghost employees" on public.payroll_ghost_employees
  for insert with check (can_manage_org_payroll(organization_id) and created_by = auth.uid());

create policy "payroll managers can update ghost employees" on public.payroll_ghost_employees
  for update using (can_manage_org_payroll(organization_id));

create policy "payroll managers can delete ghost employees" on public.payroll_ghost_employees
  for delete using (can_manage_org_payroll(organization_id));

-- payroll_profiles: a profile now belongs to EITHER a real app user OR a
-- ghost employee, never both, never neither. RLS on this table already
-- gates entirely on can_manage_org_payroll(organization_id) — it never
-- inspects user_id for authorization — so ghost-owned rows need no policy
-- changes at all.
alter table public.payroll_profiles alter column user_id drop not null;
alter table public.payroll_profiles add column ghost_employee_id uuid references public.payroll_ghost_employees(id) on delete cascade;
alter table public.payroll_profiles add constraint payroll_profiles_owner_xor_check check (
  (user_id is not null and ghost_employee_id is null) or (user_id is null and ghost_employee_id is not null)
);
alter table public.payroll_profiles add constraint payroll_profiles_organization_id_ghost_employee_id_key unique (organization_id, ghost_employee_id);

-- payroll_profile_deductions: same per-employee override table, same
-- either/or ownership. Its RLS (checked earlier this session) is also
-- can_manage_org_payroll-only, so unaffected by the nullable user_id.
alter table public.payroll_profile_deductions alter column user_id drop not null;
alter table public.payroll_profile_deductions add column ghost_employee_id uuid references public.payroll_ghost_employees(id) on delete cascade;
alter table public.payroll_profile_deductions add constraint payroll_profile_deductions_owner_xor_check check (
  (user_id is not null and ghost_employee_id is null) or (user_id is null and ghost_employee_id is not null)
);
alter table public.payroll_profile_deductions drop constraint payroll_profile_deductions_organization_id_user_id_deductio_key;
create unique index payroll_profile_deductions_user_unique on public.payroll_profile_deductions (organization_id, user_id, deduction_type_id) where user_id is not null;
create unique index payroll_profile_deductions_ghost_unique on public.payroll_profile_deductions (organization_id, ghost_employee_id, deduction_type_id) where ghost_employee_id is not null;
