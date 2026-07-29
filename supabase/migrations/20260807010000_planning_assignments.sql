-- Planning d'équipe: who's on which chantier and when, the module Kraaft
-- calls "Planning" — a lightweight schedule, not a full calendar/resource
-- planner. Any member can create/edit (no approval step), matching the
-- "updates happen in real time without needing to validate each change"
-- behavior the feature is meant to replicate.

create table public.planning_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  member_user_id uuid not null references auth.users(id) on delete cascade,
  starts_on date not null,
  ends_on date not null,
  note text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint planning_assignments_range_check check (ends_on >= starts_on)
);

create index on public.planning_assignments (organization_id, starts_on);
create index on public.planning_assignments (project_id);
create index on public.planning_assignments (member_user_id);

create trigger planning_assignments_set_updated_at before update on public.planning_assignments
for each row execute function public.set_updated_at();

alter table public.planning_assignments enable row level security;

create policy "members can view planning assignments" on public.planning_assignments
  for select using (public.is_org_member(organization_id));
create policy "members can create planning assignments" on public.planning_assignments
  for insert with check (public.is_org_member(organization_id) and created_by = auth.uid());
create policy "members can update planning assignments" on public.planning_assignments
  for update using (public.is_org_member(organization_id));
create policy "authors and admins can delete planning assignments" on public.planning_assignments
  for delete using (created_by = auth.uid() or public.is_org_admin(organization_id));
