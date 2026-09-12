-- Cahier des charges V2, Lot 4 §7.4 "Absences" + §7.5 "Soldes horaires" —
-- a real employee-facing leave request (self-service, manager approval),
-- unlike payroll_profiles/deductions which are manager-only end to end.
-- Same visibility split as payroll_time_entries: a member sees and creates
-- their own rows, a payroll manager sees and manages everyone's.
create table public.payroll_absences (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  ghost_employee_id uuid references public.payroll_ghost_employees(id) on delete cascade,
  owner_key uuid generated always as (coalesce(user_id, ghost_employee_id)) stored,
  -- 'jour_ferie' exists for record-keeping only — Cantia does not know any
  -- canton's public-holiday calendar (they differ by canton and even by
  -- commune), so nothing here is auto-populated; a manager logs the
  -- specific date themselves when it matters for an hourly employee's pay.
  absence_type text not null check (absence_type in (
    'vacances', 'maladie', 'accident', 'conge_paye', 'conge_non_paye',
    'jour_ferie', 'militaire', 'maternite_paternite', 'autre'
  )),
  start_date date not null,
  end_date date not null,
  days numeric(5, 2) not null check (days > 0),
  paid boolean not null default true,
  note text,
  status text not null default 'demandee' check (status in ('demandee', 'validee', 'refusee')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  validated_by uuid references auth.users(id),
  validated_at timestamptz,
  check (end_date >= start_date)
);
create index on public.payroll_absences (organization_id, owner_key, start_date);
alter table public.payroll_absences enable row level security;

create policy "members can view own or managed absences" on public.payroll_absences
  for select using (
    public.is_org_member(organization_id)
    and (user_id = auth.uid() or public.can_manage_org_payroll(organization_id))
  );

-- A member can only ever self-insert as 'demandee' (a request); creating
-- an already-'validee' row (or one for someone else, or for a ghost
-- employee) requires payroll-manager rights.
create policy "members can request own absences, managers any" on public.payroll_absences
  for insert with check (
    public.is_org_member(organization_id)
    and created_by = auth.uid()
    and (
      (user_id = auth.uid() and status = 'demandee')
      or public.can_manage_org_payroll(organization_id)
    )
  );

-- No WITH CHECK given: Postgres reuses USING as the check on the new row
-- too, which is exactly what's needed here — a requester editing their
-- own still-pending request can only keep it 'demandee' (setting
-- status='validee' themselves makes the new row fail the same
-- condition, since it's evaluated against the row AFTER the edit), while
-- a payroll manager can freely validate/refuse/edit any row.
create policy "managers or the requester (while pending) can update" on public.payroll_absences
  for update using (
    public.can_manage_org_payroll(organization_id)
    or (user_id = auth.uid() and status = 'demandee')
  );

create policy "managers or the requester (while pending) can delete" on public.payroll_absences
  for delete using (
    public.can_manage_org_payroll(organization_id)
    or (user_id = auth.uid() and status = 'demandee')
  );

notify pgrst, 'reload schema';
