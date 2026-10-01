-- À coller dans Supabase > SQL Editor > New query, puis Run.
-- Regroupe 3 migrations (barèmes impôt à la source, situation employé, planning).
begin;

-- ===== 20261001090000_swiss_wht_tariffs
-- Swiss withholding tax (impôt à la source) scales, imported from the
-- official ESTV files (estv2.admin.ch/qst/<year>/loehne/tarYYxx.zip) by the
-- import-wht-tariffs function. One row per canton + tariff code (e.g.
-- "A0N": single, 0 children, no church tax): steps = [[income_from_chf,
-- rate_percent, min_tax_chf], ...] sorted by income, for the monthly
-- taxable income. Public data: readable by every signed-in user.
create table if not exists public.swiss_wht_tariffs (
  year int not null,
  canton text not null check (canton ~ '^[A-Z]{2}$'),
  code text not null check (char_length(code) between 2 and 10),
  valid_from date,
  steps jsonb not null,
  imported_at timestamptz not null default now(),
  primary key (year, canton, code)
);
alter table public.swiss_wht_tariffs enable row level security;
drop policy if exists "signed-in users read wht tariffs" on public.swiss_wht_tariffs;
create policy "signed-in users read wht tariffs" on public.swiss_wht_tariffs for select to authenticated using (true);
grant select on public.swiss_wht_tariffs to authenticated;

insert into supabase_migrations.schema_migrations(version, name) values ('20261001090000', 'swiss_wht_tariffs') on conflict do nothing;

-- ===== 20261001100000_payroll_swiss_situation
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

insert into supabase_migrations.schema_migrations(version, name) values ('20261001100000', 'payroll_swiss_situation') on conflict do nothing;

-- ===== 20261001110000_planning_events
-- Planning: any event, not only a chantier assignment.
--   title       what it is (required in the app: « Séance de chantier »,
--               « Absent », « Rendez-vous client »…); a chantier is optional
--   start_time / end_time   hours within the day; both null = all day
--   is_private  only the person concerned and the author see it; everyone
--               else (owner included) sees « Rendez-vous privé » and nothing
--               more, through planning_busy_blocks() below.
-- An employee creates only for themself; owners / admins for any member.
alter table public.planning_assignments
  add column if not exists title text check (title is null or char_length(title) <= 200),
  add column if not exists start_time time,
  add column if not exists end_time time,
  add column if not exists is_private boolean not null default false;

alter table public.planning_assignments drop constraint if exists planning_assignments_time_check;
alter table public.planning_assignments add constraint planning_assignments_time_check
  check (start_time is null or end_time is null or ends_on > starts_on or end_time > start_time);

drop policy if exists "planning-permitted members can view planning assignments" on public.planning_assignments;
drop policy if exists "planning-permitted members can create planning assignments" on public.planning_assignments;
drop policy if exists "planning-permitted members can update planning assignments" on public.planning_assignments;
drop policy if exists "authors and admins can delete planning assignments" on public.planning_assignments;

-- Private rows are never readable by others, even admins: their details
-- don't leave the database (planning_busy_blocks returns only the slot).
create policy "planning: view shared events and own private ones" on public.planning_assignments
  for select using (
    public.can_view_org_planning(organization_id)
    and (not is_private or member_user_id = auth.uid() or created_by = auth.uid())
  );
create policy "planning: create for oneself, admins for anyone" on public.planning_assignments
  for insert with check (
    public.can_view_org_planning(organization_id)
    and created_by = auth.uid()
    and (member_user_id = auth.uid() or public.is_org_admin(organization_id))
  );
create policy "planning: edit own events, admins shared ones" on public.planning_assignments
  for update using (
    public.can_view_org_planning(organization_id)
    and (member_user_id = auth.uid() or created_by = auth.uid() or (public.is_org_admin(organization_id) and not is_private))
  ) with check (
    public.can_view_org_planning(organization_id)
    and (member_user_id = auth.uid() or public.is_org_admin(organization_id))
  );
create policy "planning: delete own events, admins shared ones" on public.planning_assignments
  for delete using (
    member_user_id = auth.uid() or created_by = auth.uid() or (public.is_org_admin(organization_id) and not is_private)
  );

-- Other people's private events, reduced to « busy »: who and when, no
-- title, note or chantier.
create or replace function public.planning_busy_blocks(p_organization_id uuid, p_start date, p_end date)
returns table (id uuid, member_user_id uuid, starts_on date, ends_on date, start_time time, end_time time)
language sql stable security definer set search_path = public as $$
  select a.id, a.member_user_id, a.starts_on, a.ends_on, a.start_time, a.end_time
  from public.planning_assignments a
  where a.organization_id = p_organization_id
    and public.can_view_org_planning(p_organization_id)
    and a.is_private
    and a.member_user_id <> auth.uid()
    and coalesce(a.created_by, '00000000-0000-0000-0000-000000000000'::uuid) <> auth.uid()
    and a.starts_on <= p_end
    and a.ends_on >= p_start;
$$;
revoke all on function public.planning_busy_blocks(uuid, date, date) from public, anon;
grant execute on function public.planning_busy_blocks(uuid, date, date) to authenticated;

insert into supabase_migrations.schema_migrations(version, name) values ('20261001110000', 'planning_events') on conflict do nothing;

commit;
