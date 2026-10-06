-- Planning de chantier (Gantt) — docs: cahier des charges « Planning de
-- chantier Cantia » v1.0. One schedule per chantier; phases, sub-phases,
-- tasks and milestones; working-day durations; finish-to-start links.
-- Building companies only (org_fills_soumissions), like the soumissions.
-- Anyone who can open the chantier can read it; editing needs the same
-- access plus the building sector. Important changes are logged.

create table if not exists public.site_schedules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null unique references public.projects(id) on delete cascade,
  -- ISO weekdays worked (1 = Monday … 7 = Sunday); holidays come later
  workdays smallint[] not null default '{1,2,3,4,5}' check (cardinality(workdays) between 1 and 7),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.schedule_items (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.site_schedules(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  parent_id uuid references public.schedule_items(id) on delete cascade,
  kind text not null check (kind in ('phase', 'task', 'milestone')),
  name text not null check (char_length(name) between 1 and 200),
  trade text check (trade is null or char_length(trade) <= 80),
  company text check (company is null or char_length(company) <= 120),
  responsible_user_id uuid references auth.users(id) on delete set null,
  team_size smallint check (team_size is null or team_size between 0 and 999),
  status text not null default 'todo' check (status in ('todo', 'planned', 'in_progress', 'done', 'blocked')),
  progress smallint not null default 0 check (progress between 0 and 100),
  -- phase: progress typed by hand instead of computed from its tasks
  progress_manual boolean not null default false,
  start_date date,
  end_date date,
  duration smallint check (duration is null or duration between 0 and 3650), -- working days
  -- kept when an upstream task moves: Cantia flags the conflict instead
  fixed boolean not null default false,
  baseline_start date,
  baseline_end date,
  actual_start date,
  actual_end date,
  notes text check (notes is null or char_length(notes) <= 4000),
  sort_order double precision not null default 0,
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (start_date is null or end_date is null or end_date >= start_date),
  check (kind <> 'milestone' or duration is null or duration = 0)
);
create index if not exists schedule_items_schedule on public.schedule_items (schedule_id, sort_order);
create index if not exists schedule_items_parent on public.schedule_items (parent_id);

-- Finish-to-start: « to » starts after « from » ends.
create table if not exists public.schedule_links (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.site_schedules(id) on delete cascade,
  from_item uuid not null references public.schedule_items(id) on delete cascade,
  to_item uuid not null references public.schedule_items(id) on delete cascade,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (from_item, to_item),
  check (from_item <> to_item)
);

-- The company's own corps de métier, on top of the base list in the app.
create table if not exists public.schedule_trades (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table if not exists public.schedule_audit (
  id bigint generated always as identity primary key,
  schedule_id uuid not null references public.site_schedules(id) on delete cascade,
  item_id uuid,
  item_name text,
  field text not null,
  old_value text,
  new_value text,
  user_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists schedule_audit_schedule on public.schedule_audit (schedule_id, created_at desc);

-- Access ------------------------------------------------------------------
create or replace function public.can_view_schedule(s_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.site_schedules s
    where s.id = s_id and public.is_org_member(s.organization_id) and public.has_project_access(s.project_id)
  );
$$;
create or replace function public.can_edit_schedule(s_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.site_schedules s
    where s.id = s_id and public.is_org_member(s.organization_id) and public.has_project_access(s.project_id)
      and public.org_fills_soumissions(s.organization_id)
  );
$$;
grant execute on function public.can_view_schedule(uuid), public.can_edit_schedule(uuid) to authenticated;

alter table public.site_schedules enable row level security;
create policy "schedule: read" on public.site_schedules for select using (public.is_org_member(organization_id) and public.has_project_access(project_id));
create policy "schedule: create" on public.site_schedules for insert with check (
  public.is_org_member(organization_id) and public.has_project_access(project_id) and public.org_fills_soumissions(organization_id)
  and organization_id = (select p.organization_id from public.projects p where p.id = project_id)
);
create policy "schedule: settings" on public.site_schedules for update using (public.can_edit_schedule(id)) with check (public.can_edit_schedule(id));
create policy "schedule: delete (admins)" on public.site_schedules for delete using (public.is_org_admin(organization_id));

alter table public.schedule_items enable row level security;
create policy "schedule items: read" on public.schedule_items for select using (public.can_view_schedule(schedule_id));
create policy "schedule items: write" on public.schedule_items for all using (public.can_edit_schedule(schedule_id)) with check (
  public.can_edit_schedule(schedule_id)
  and organization_id = (select s.organization_id from public.site_schedules s where s.id = schedule_id)
);

alter table public.schedule_links enable row level security;
create policy "schedule links: read" on public.schedule_links for select using (public.can_view_schedule(schedule_id));
create policy "schedule links: write" on public.schedule_links for all using (public.can_edit_schedule(schedule_id)) with check (public.can_edit_schedule(schedule_id));

alter table public.schedule_trades enable row level security;
create policy "schedule trades: read" on public.schedule_trades for select using (public.is_org_member(organization_id));
create policy "schedule trades: add" on public.schedule_trades for insert with check (public.is_org_member(organization_id) and public.org_fills_soumissions(organization_id));
create policy "schedule trades: remove (admins)" on public.schedule_trades for delete using (public.is_org_admin(organization_id));

alter table public.schedule_audit enable row level security;
create policy "schedule audit: read" on public.schedule_audit for select using (public.can_view_schedule(schedule_id));
-- written by the triggers below only
revoke insert, update, delete on public.schedule_audit from authenticated, anon;

-- Integrity ---------------------------------------------------------------
-- Same schedule for a parent and its child, and for both ends of a link;
-- a phase cannot sit under a task; no circular dependency.
create or replace function public.schedule_items_check()
returns trigger language plpgsql set search_path = public as $$
declare
  p record;
begin
  if new.parent_id is not null then
    select schedule_id, kind into p from public.schedule_items where id = new.parent_id;
    if p.schedule_id is distinct from new.schedule_id then raise exception 'Parent hors du planning'; end if;
    if p.kind <> 'phase' then raise exception 'Seule une phase peut contenir des lignes'; end if;
    if new.id = new.parent_id or exists (
      with recursive up as (select id, parent_id from public.schedule_items where id = new.parent_id
        union all select i.id, i.parent_id from public.schedule_items i join up on i.id = up.parent_id)
      select 1 from up where up.id = new.id
    ) then raise exception 'Une phase ne peut pas se contenir elle-même'; end if;
  end if;
  if new.kind = 'milestone' then
    new.duration := 0;
    if new.start_date is not null then new.end_date := new.start_date; end if;
  end if;
  -- the plan as it stood when work started, then the real dates
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    if new.status = 'in_progress' then
      new.actual_start := coalesce(new.actual_start, current_date);
      new.baseline_start := coalesce(new.baseline_start, old.start_date);
      new.baseline_end := coalesce(new.baseline_end, old.end_date);
    elsif new.status = 'done' then
      new.actual_start := coalesce(new.actual_start, old.start_date, current_date);
      new.actual_end := coalesce(new.actual_end, current_date);
      new.progress := 100;
      new.baseline_start := coalesce(new.baseline_start, old.start_date);
      new.baseline_end := coalesce(new.baseline_end, old.end_date);
    end if;
  end if;
  new.updated_at := now();
  new.updated_by := coalesce(auth.uid(), new.updated_by);
  return new;
end;
$$;
create or replace trigger schedule_items_check before insert or update on public.schedule_items
  for each row execute function public.schedule_items_check();

create or replace function public.schedule_links_check()
returns trigger language plpgsql set search_path = public as $$
begin
  if (select schedule_id from public.schedule_items where id = new.from_item) is distinct from new.schedule_id
     or (select schedule_id from public.schedule_items where id = new.to_item) is distinct from new.schedule_id then
    raise exception 'Lien hors du planning';
  end if;
  if exists (
    with recursive after as (
      select to_item from public.schedule_links where from_item = new.to_item
      union select l.to_item from public.schedule_links l join after a on l.from_item = a.to_item
    ) select 1 from after where to_item = new.from_item
  ) or new.to_item = new.from_item then
    raise exception 'Dépendance circulaire';
  end if;
  new.created_by := coalesce(new.created_by, auth.uid());
  return new;
end;
$$;
create or replace trigger schedule_links_check before insert or update on public.schedule_links
  for each row execute function public.schedule_links_check();

-- Audit: dates, duration, status, progress, dependencies, attribution.
create or replace function public.schedule_items_audit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  f text;
  o jsonb := to_jsonb(old);
  n jsonb := to_jsonb(new);
begin
  if tg_op = 'DELETE' then
    -- the whole schedule is being deleted: nothing to log
    if not exists (select 1 from public.site_schedules where id = old.schedule_id) then return old; end if;
    insert into public.schedule_audit (schedule_id, item_id, item_name, field, old_value, user_id) values (old.schedule_id, old.id, old.name, 'deleted', old.kind, auth.uid());
    return old;
  end if;
  if tg_op = 'INSERT' then
    insert into public.schedule_audit (schedule_id, item_id, item_name, field, new_value, user_id) values (new.schedule_id, new.id, new.name, 'created', new.kind, auth.uid());
    return new;
  end if;
  foreach f in array array['start_date', 'end_date', 'duration', 'status', 'progress', 'company', 'responsible_user_id', 'trade', 'name'] loop
    if o -> f is distinct from n -> f then
      insert into public.schedule_audit (schedule_id, item_id, item_name, field, old_value, new_value, user_id)
      values (new.schedule_id, new.id, new.name, f, o ->> f, n ->> f, auth.uid());
    end if;
  end loop;
  return new;
end;
$$;
create or replace trigger schedule_items_audit after insert or update or delete on public.schedule_items
  for each row execute function public.schedule_items_audit();

create or replace function public.schedule_links_audit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  r record := coalesce(new, old);
begin
  if not exists (select 1 from public.site_schedules where id = r.schedule_id) then return r; end if;
  insert into public.schedule_audit (schedule_id, item_id, item_name, field, old_value, new_value, user_id)
  values (r.schedule_id, r.to_item, (select name from public.schedule_items where id = r.to_item), 'dependency',
    case when tg_op = 'DELETE' then (select name from public.schedule_items where id = r.from_item) end,
    case when tg_op = 'INSERT' then (select name from public.schedule_items where id = r.from_item) end, auth.uid());
  return r;
end;
$$;
create or replace trigger schedule_links_audit after insert or delete on public.schedule_links
  for each row execute function public.schedule_links_audit();
