create table public.folders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  parent_id uuid references public.folders(id) on delete cascade,
  name text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index on public.folders (project_id);
create index on public.folders (parent_id);

alter table public.folders enable row level security;

create policy "members can view folders" on public.folders
  for select using (public.is_org_member(organization_id));
create policy "members can create folders" on public.folders
  for insert with check (public.is_org_member(organization_id));
create policy "members can rename folders" on public.folders
  for update using (public.is_org_member(organization_id));
create policy "members can delete folders" on public.folders
  for delete using (public.is_org_member(organization_id));

alter table public.files add column folder_id uuid references public.folders(id) on delete set null;
create index on public.files (folder_id);
