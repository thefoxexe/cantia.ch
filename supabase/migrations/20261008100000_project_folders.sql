-- Chantiers: a number (n° de chantier / mandat), folders to file them like
-- a file explorer (e.g. « 2026 » › « Villas »), the full card (client from
-- Contacts, on-site contact, planned dates, notes) and per-user favourites
-- shown first on the dashboard.

alter table public.projects
  add column if not exists reference text,
  add column if not exists folder_id uuid,
  add column if not exists client_id uuid references public.clients(id) on delete set null,
  add column if not exists contact_name text,
  add column if not exists contact_phone text,
  add column if not exists contact_email text,
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists notes text;

create table if not exists public.project_folders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  -- a folder inside a folder; deleting the parent moves it to the top
  parent_id uuid references public.project_folders(id) on delete set null,
  name text not null check (length(trim(name)) between 1 and 80),
  color text,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists project_folders_org on public.project_folders (organization_id, parent_id);

do $$ begin
  alter table public.projects add constraint projects_folder_fk foreign key (folder_id) references public.project_folders(id) on delete set null;
exception when duplicate_object then null; end $$;
create index if not exists projects_folder on public.projects (folder_id);

-- same company, and no folder inside itself
create or replace function public.project_folders_check()
returns trigger language plpgsql set search_path = public as $$
declare
  p uuid := new.parent_id;
  n int := 0;
begin
  if p is null then return new; end if;
  if (select organization_id from project_folders where id = p) is distinct from new.organization_id then
    raise exception 'Dossier parent introuvable';
  end if;
  while p is not null and n < 50 loop
    if p = new.id then raise exception 'Un dossier ne peut pas être rangé dans lui-même'; end if;
    select parent_id into p from project_folders where id = p;
    n := n + 1;
  end loop;
  return new;
end $$;
create trigger project_folders_check before insert or update of parent_id, organization_id on public.project_folders
  for each row execute function public.project_folders_check();

create or replace function public.projects_folder_check()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.folder_id is not null and (select organization_id from project_folders where id = new.folder_id) is distinct from new.organization_id then
    raise exception 'Dossier introuvable';
  end if;
  if new.client_id is not null and (select organization_id from clients where id = new.client_id) is distinct from new.organization_id then
    raise exception 'Contact introuvable';
  end if;
  return new;
end $$;
create trigger projects_folder_check before insert or update of folder_id, client_id on public.projects
  for each row execute function public.projects_folder_check();

alter table public.project_folders enable row level security;
create policy "project folders: read" on public.project_folders for select using (public.is_org_member(organization_id));
create policy "project folders: create" on public.project_folders for insert with check (public.can_create_org_projects(organization_id));
create policy "project folders: edit" on public.project_folders for update
  using (public.can_create_org_projects(organization_id)) with check (public.can_create_org_projects(organization_id));
create policy "project folders: delete" on public.project_folders for delete
  using (public.is_org_admin(organization_id) or (created_by = auth.uid() and public.can_create_org_projects(organization_id)));
grant select, insert, update, delete on public.project_folders to authenticated;

-- favourites: each person stars their own
create table if not exists public.project_favorites (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, project_id)
);
alter table public.project_favorites enable row level security;
create policy "project favorites: own" on public.project_favorites for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and public.has_project_access(project_id));
grant select, insert, delete on public.project_favorites to authenticated;
