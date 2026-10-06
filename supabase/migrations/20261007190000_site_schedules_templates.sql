-- Planning de chantier — company templates (shown in the Catalogue).
-- A template keeps the structure only: phases, tasks, milestones, trades,
-- durations, the gap of each start from the beginning (in working days) and
-- the "after" links. No real dates, companies, people or progress.
--
-- data = { "items": [{ "key", "parent", "kind", "name", "trade", "duration", "offset" }],
--          "links": [["fromKey", "toKey"], ...] }

create table if not exists public.schedule_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 120),
  description text,
  data jsonb not null default '{"items":[],"links":[]}'::jsonb check (jsonb_typeof(data -> 'items') = 'array'),
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists schedule_templates_org on public.schedule_templates (organization_id, name);

alter table public.schedule_templates enable row level security;
create policy "schedule templates: read" on public.schedule_templates for select using (public.is_org_member(organization_id));
create policy "schedule templates: create" on public.schedule_templates for insert with check (
  public.is_org_member(organization_id) and public.org_has_site_schedule(organization_id)
);
create policy "schedule templates: edit (author or admins)" on public.schedule_templates for update
  using (public.is_org_member(organization_id) and (created_by = auth.uid() or public.is_org_admin(organization_id)))
  with check (public.is_org_member(organization_id) and public.org_has_site_schedule(organization_id));
create policy "schedule templates: delete (author or admins)" on public.schedule_templates for delete
  using (public.is_org_member(organization_id) and (created_by = auth.uid() or public.is_org_admin(organization_id)));

grant select, insert, update, delete on public.schedule_templates to authenticated;
