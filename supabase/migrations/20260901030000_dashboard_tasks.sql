-- Lightweight shared task list shown on the dashboard: any org member can
-- create/check off/reclassify a task, so the whole team sees the same list
-- rather than each person keeping a private one.
create table public.dashboard_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  category text not null default 'general',
  done boolean not null default false,
  done_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index dashboard_tasks_org_idx on public.dashboard_tasks (organization_id, done, created_at desc);

alter table public.dashboard_tasks enable row level security;

create policy "members can view tasks" on public.dashboard_tasks
  for select using (public.is_org_member(organization_id));
create policy "members can create tasks" on public.dashboard_tasks
  for insert with check (public.is_org_member(organization_id));
create policy "members can update tasks" on public.dashboard_tasks
  for update using (public.is_org_member(organization_id));
create policy "creators and admins can delete tasks" on public.dashboard_tasks
  for delete using (created_by = auth.uid() or public.is_org_admin(organization_id));
