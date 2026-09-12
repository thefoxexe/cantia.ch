-- Cahier des charges V2, Lot 4 §7.1 "Rubriques de salaire" — earnings
-- beyond the base salary/hours figure: 13e salaire, heures supplémentaires,
-- bonus/prime, avance sur salaire, indemnité vacances. Mirrors the exact
-- catalog + per-employee-override architecture already used for
-- deductions (payroll_deduction_types / payroll_profile_deductions)
-- rather than inventing a new mechanism.
--
-- Two independent dimensions:
--   kind — 'addition' adds to gross BEFORE cotisations are computed (13e,
--     heures sup, bonus, indemnité vacances: all genuinely extra pay,
--     subject to the same AVS/AC/etc as ordinary salary). 'net_adjustment'
--     applies AFTER cotisations, directly on net (an avance sur salaire:
--     cotisations were already computed on the full month's gross, the
--     advance is simply cash already received, recovered from this
--     month's net pay — never treated as extra taxable income again).
--   mode — 'recurring_rate' is computed automatically every slip from an
--     org default rate/amount + optional per-employee override, exactly
--     like a deduction type (indemnité vacances: a percentage of gross,
--     applies to every payslip for as long as it's enabled). 'manual_entry'
--     has no default — the payroll manager adds a one-off CHF amount to a
--     specific employee's specific period before calculating it (13e,
--     heures sup, bonus, avance: none of these recur identically every
--     month, so there is nothing to default).
create table public.payroll_wage_types (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  label text not null,
  kind text not null check (kind in ('addition', 'net_adjustment')),
  mode text not null check (mode in ('recurring_rate', 'manual_entry')),
  default_rate_percent numeric(6, 4),
  default_fixed_amount_chf numeric(10, 2),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index on public.payroll_wage_types (organization_id, sort_order);
alter table public.payroll_wage_types enable row level security;

-- Manager-only even to read, same rationale as payroll_deduction_types:
-- seeing the catalog reveals how pay is structured.
create policy "payroll managers can view wage types" on public.payroll_wage_types
  for select using (public.can_manage_org_payroll(organization_id));
create policy "payroll managers can manage wage types" on public.payroll_wage_types
  for all using (public.can_manage_org_payroll(organization_id)) with check (public.can_manage_org_payroll(organization_id));

-- Per-employee override of a recurring_rate wage type — same shape and
-- same "absent row = org default applies, enabled" rule as
-- payroll_profile_deductions. Rows for a manual_entry wage type are
-- meaningless (nothing to override) but not prevented at the schema
-- level, same restraint as the deduction side.
create table public.payroll_profile_wage_rates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  ghost_employee_id uuid references public.payroll_ghost_employees(id) on delete cascade,
  owner_key uuid generated always as (coalesce(user_id, ghost_employee_id)) stored,
  wage_type_id uuid not null references public.payroll_wage_types(id) on delete cascade,
  rate_percent numeric(6, 4),
  fixed_amount_chf numeric(10, 2),
  enabled boolean not null default true,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  check ((user_id is not null and ghost_employee_id is null) or (user_id is null and ghost_employee_id is not null)),
  unique (organization_id, owner_key, wage_type_id)
);
create trigger payroll_profile_wage_rates_set_updated_at before update on public.payroll_profile_wage_rates
for each row execute function public.set_updated_at();
alter table public.payroll_profile_wage_rates enable row level security;
create policy "payroll managers can view profile wage rates" on public.payroll_profile_wage_rates
  for select using (public.can_manage_org_payroll(organization_id));
create policy "payroll managers can manage profile wage rates" on public.payroll_profile_wage_rates
  for all using (public.can_manage_org_payroll(organization_id)) with check (public.can_manage_org_payroll(organization_id));

-- One-off amount for a manual_entry wage type, for one employee's one
-- period — entered by the payroll manager before calculating that
-- period's slip (e.g. "CHF 350 heures supplémentaires, novembre 2026").
-- Keyed by organization+owner+year+month directly rather than by
-- run_id/slip_id so a line can be added before a payroll_run/slip for
-- that period even exists yet.
create table public.payroll_slip_wage_lines (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  ghost_employee_id uuid references public.payroll_ghost_employees(id) on delete cascade,
  owner_key uuid generated always as (coalesce(user_id, ghost_employee_id)) stored,
  year integer not null,
  month integer not null check (month between 1 and 12),
  wage_type_id uuid not null references public.payroll_wage_types(id) on delete cascade,
  amount_chf numeric(10, 2) not null,
  note text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  check ((user_id is not null and ghost_employee_id is null) or (user_id is null and ghost_employee_id is not null))
);
create index on public.payroll_slip_wage_lines (organization_id, owner_key, year, month);
alter table public.payroll_slip_wage_lines enable row level security;
create policy "payroll managers can view slip wage lines" on public.payroll_slip_wage_lines
  for select using (public.can_manage_org_payroll(organization_id));
create policy "payroll managers can manage slip wage lines" on public.payroll_slip_wage_lines
  for all using (public.can_manage_org_payroll(organization_id)) with check (public.can_manage_org_payroll(organization_id));

-- A validée/payée slip's figures can never be silently changed (§7.6) —
-- adding, editing or removing a wage line for a period whose slip is
-- already past 'calculee' would otherwise sit there unapplied with no
-- visible reason why, since upsert_payroll_slip already refuses to
-- recalculate that slip. Surface the same invariant here instead of
-- letting it look like a silent no-op.
create or replace function public.trg_guard_payroll_slip_wage_line()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_key uuid := coalesce(new.user_id, new.ghost_employee_id, old.user_id, old.ghost_employee_id);
  v_org uuid := coalesce(new.organization_id, old.organization_id);
  v_year integer := coalesce(new.year, old.year);
  v_month integer := coalesce(new.month, old.month);
  v_status text;
begin
  select status into v_status from public.payroll_slips
  where organization_id = v_org and owner_key = v_owner_key and year = v_year and month = v_month and status <> 'extournee';

  if found and v_status not in ('brouillon', 'calculee') then
    raise exception 'La fiche de cette période est % — extournez-la avant de modifier ses rubriques', v_status;
  end if;
  return coalesce(new, old);
end;
$$;
create trigger payroll_slip_wage_lines_guard before insert or update or delete on public.payroll_slip_wage_lines
for each row execute function public.trg_guard_payroll_slip_wage_line();

-- §7.5 "Soldes horaires" groundwork — hire_date lets vacation entitlement
-- be prorated for a partial year; vacation_days_per_year and
-- weekly_contract_hours are the two figures needed to compute a vacation
-- balance and an hours balance respectively. All three stay null until
-- set: none has a single safe org-wide default (a contract can grant more
-- than the legal minimum, and a work week's contractual hours are pure
-- contract data), except vacation_days_per_year which the app suggests —
-- never silently assumes — from the one figure that IS legally fixed
-- (Art. 329a CO minimum), computed client-side from birth_date.
alter table public.payroll_profiles
  add column hire_date date,
  add column vacation_days_per_year numeric(4, 1),
  add column weekly_contract_hours numeric(5, 2);

-- Standard manual-entry wage types every org gets automatically, same
-- "idempotent by label" seeding as the deduction catalog. None carries a
-- guessed rate — each is an empty vessel the payroll manager fills in per
-- period. Indemnité vacances (recurring_rate) is deliberately NOT
-- auto-seeded: it only applies to hourly employees without paid vacation
-- days, and its rate depends on the employee's actual vacation
-- entitlement — offered instead via the optional catalog picker, same
-- treatment as LPP/impôt à la source.
create or replace function public.seed_standard_payroll_wage_types(p_organization_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.payroll_wage_types (organization_id, label, kind, mode, sort_order)
  select p_organization_id, x.label, x.kind, 'manual_entry', x.ord
  from (
    values
      ('13e salaire', 'addition', 0),
      ('Heures supplémentaires', 'addition', 1),
      ('Bonus / prime', 'addition', 2),
      ('Avance sur salaire', 'net_adjustment', 3),
      -- Used exclusively by the §7.7 correction rétroactive workflow
      -- (apply_payroll_correction) to post the net difference of a
      -- recalculated past period into a currently open one — never
      -- created directly from the wage-lines UI like the other four.
      ('Régularisation rétroactive', 'net_adjustment', 4)
  ) as x(label, kind, ord)
  where not exists (
    select 1 from public.payroll_wage_types wt
    where wt.organization_id = p_organization_id and wt.label = x.label
  );
end;
$$;
revoke all on function public.seed_standard_payroll_wage_types(uuid) from public;

create or replace function public.trg_seed_standard_payroll_wage_types()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.seed_standard_payroll_wage_types(new.id);
  return new;
end;
$$;
create trigger organizations_seed_standard_payroll_wage_types
  after insert on public.organizations
  for each row execute function public.trg_seed_standard_payroll_wage_types();

-- Manual path for orgs that predate this migration, alongside the
-- existing "restaurer les cotisations standards" action.
create or replace function public.rpc_seed_standard_payroll_wage_types(p_organization_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.can_manage_org_payroll(p_organization_id) then
    raise exception 'access denied: cannot manage payroll for this organization';
  end if;
  perform public.seed_standard_payroll_wage_types(p_organization_id);
end;
$$;
revoke all on function public.rpc_seed_standard_payroll_wage_types(uuid) from public;
revoke execute on function public.rpc_seed_standard_payroll_wage_types(uuid) from anon;
grant execute on function public.rpc_seed_standard_payroll_wage_types(uuid) to authenticated;

-- Backfill for every organization that already exists.
do $$
declare v_org record;
begin
  for v_org in select id from public.organizations loop
    perform public.seed_standard_payroll_wage_types(v_org.id);
  end loop;
end $$;

notify pgrst, 'reload schema';
