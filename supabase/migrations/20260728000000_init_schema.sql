-- Opus platform: initial schema
-- Multi-tenant model: everything is scoped to an "organization" (compte entreprise/artisan)

create extension if not exists pgcrypto;

-- ==========================================================================
-- Plans
-- ==========================================================================
create table public.plans (
  id text primary key,
  name text not null,
  storage_quota_mb integer not null,
  max_members integer not null,
  price_chf_monthly numeric(10,2) not null,
  created_at timestamptz not null default now()
);

insert into public.plans (id, name, storage_quota_mb, max_members, price_chf_monthly) values
  ('solo', 'Artisan Solo', 2048, 1, 29),
  ('pro', 'Pro', 20480, 10, 89),
  ('entreprise', 'Entreprise', 204800, 50, 249);

-- ==========================================================================
-- Organizations (comptes)
-- ==========================================================================
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trade text,
  logo_url text,
  signature_url text,
  address text,
  ide_number text,
  plan_id text not null references public.plans(id) default 'solo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type public.org_role as enum ('owner', 'admin', 'member');

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.org_role not null default 'member',
  full_name text,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index on public.organization_members (user_id);

-- ==========================================================================
-- Helper functions (security definer, used by RLS policies)
-- ==========================================================================
create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = org_id and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_org_admin(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = org_id and m.user_id = auth.uid() and m.role in ('owner', 'admin')
  );
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create an organization + make the caller its owner in one atomic call.
create or replace function public.create_organization(org_name text, org_trade text default null)
returns public.organizations
language plpgsql security definer set search_path = public as $$
declare
  new_org public.organizations;
begin
  insert into public.organizations (name, trade) values (org_name, org_trade)
  returning * into new_org;

  insert into public.organization_members (organization_id, user_id, role, full_name)
  values (new_org.id, auth.uid(), 'owner', coalesce(auth.jwt() ->> 'email', ''));

  insert into public.report_templates (organization_id, name, description) values
    (new_org.id, 'Rapport de chantier standard', 'Notes, photos géoréférencées et signature');

  return new_org;
end;
$$;

grant execute on function public.create_organization(text, text) to authenticated;

create trigger organizations_set_updated_at before update on public.organizations
for each row execute function public.set_updated_at();

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

create policy "members can view their organization" on public.organizations
  for select using (public.is_org_member(id));
create policy "admins can update their organization" on public.organizations
  for update using (public.is_org_admin(id));

create policy "members can view org membership" on public.organization_members
  for select using (public.is_org_member(organization_id));
create policy "admins can add members" on public.organization_members
  for insert with check (public.is_org_admin(organization_id));
create policy "admins can update members" on public.organization_members
  for update using (public.is_org_admin(organization_id));
create policy "admins can remove members" on public.organization_members
  for delete using (public.is_org_admin(organization_id));

-- ==========================================================================
-- Projects (chantiers)
-- ==========================================================================
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  client_name text,
  address text,
  status text not null default 'active',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.projects (organization_id);

create trigger projects_set_updated_at before update on public.projects
for each row execute function public.set_updated_at();

alter table public.projects enable row level security;

create policy "members can view projects" on public.projects
  for select using (public.is_org_member(organization_id));
create policy "members can create projects" on public.projects
  for insert with check (public.is_org_member(organization_id));
create policy "members can update projects" on public.projects
  for update using (public.is_org_member(organization_id));
create policy "admins can delete projects" on public.projects
  for delete using (public.is_org_admin(organization_id));

-- ==========================================================================
-- Report templates + Reports (rapports de chantier)
-- ==========================================================================
create table public.report_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

alter table public.report_templates enable row level security;

create policy "members can view templates" on public.report_templates
  for select using (public.is_org_member(organization_id));
create policy "members can manage templates" on public.report_templates
  for insert with check (public.is_org_member(organization_id));
create policy "members can update templates" on public.report_templates
  for update using (public.is_org_member(organization_id));
create policy "admins can delete templates" on public.report_templates
  for delete using (public.is_org_admin(organization_id));

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  template_id uuid references public.report_templates(id) on delete set null,
  title text not null,
  notes text,
  status text not null default 'draft',
  pdf_path text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.reports (organization_id);
create index on public.reports (project_id);

create trigger reports_set_updated_at before update on public.reports
for each row execute function public.set_updated_at();

alter table public.reports enable row level security;

create policy "members can view reports" on public.reports
  for select using (public.is_org_member(organization_id));
create policy "members can create reports" on public.reports
  for insert with check (public.is_org_member(organization_id));
create policy "members can update reports" on public.reports
  for update using (public.is_org_member(organization_id));
create policy "admins can delete reports" on public.reports
  for delete using (public.is_org_admin(organization_id));

create table public.report_photos (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  storage_path text not null,
  caption text,
  latitude double precision,
  longitude double precision,
  taken_at timestamptz not null default now(),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index on public.report_photos (report_id);

alter table public.report_photos enable row level security;

create policy "members can view report photos" on public.report_photos
  for select using (exists (
    select 1 from public.reports r where r.id = report_photos.report_id and public.is_org_member(r.organization_id)
  ));
create policy "members can add report photos" on public.report_photos
  for insert with check (exists (
    select 1 from public.reports r where r.id = report_photos.report_id and public.is_org_member(r.organization_id)
  ));
create policy "members can delete report photos" on public.report_photos
  for delete using (exists (
    select 1 from public.reports r where r.id = report_photos.report_id and public.is_org_member(r.organization_id)
  ));

-- ==========================================================================
-- Devis (quotes)
-- ==========================================================================
create type public.devis_status as enum ('draft', 'sent', 'accepted', 'refused');

create sequence public.devis_number_seq;

create table public.devis (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  number text unique,
  client_name text not null,
  client_address text,
  client_email text,
  notes text,
  status public.devis_status not null default 'draft',
  vat_rate numeric(5,2) not null default 8.1,
  pdf_path text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.devis (organization_id);

create or replace function public.set_devis_number()
returns trigger language plpgsql as $$
begin
  if new.number is null then
    new.number := 'DEV-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.devis_number_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

create trigger devis_set_number before insert on public.devis
for each row execute function public.set_devis_number();

create trigger devis_set_updated_at before update on public.devis
for each row execute function public.set_updated_at();

create or replace function public.log_devis_status_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.devis_status_history (devis_id, status, changed_by)
    values (new.id, new.status, auth.uid());
  end if;
  return new;
end;
$$;

alter table public.devis enable row level security;

create policy "members can view devis" on public.devis
  for select using (public.is_org_member(organization_id));
create policy "members can create devis" on public.devis
  for insert with check (public.is_org_member(organization_id));
create policy "members can update devis" on public.devis
  for update using (public.is_org_member(organization_id));
create policy "admins can delete devis" on public.devis
  for delete using (public.is_org_admin(organization_id));

create table public.devis_items (
  id uuid primary key default gen_random_uuid(),
  devis_id uuid not null references public.devis(id) on delete cascade,
  description text not null,
  quantity numeric(10,2) not null default 1,
  unit text default 'pce',
  unit_price numeric(10,2) not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index on public.devis_items (devis_id);

alter table public.devis_items enable row level security;

create policy "members can view devis items" on public.devis_items
  for select using (exists (
    select 1 from public.devis d where d.id = devis_items.devis_id and public.is_org_member(d.organization_id)
  ));
create policy "members can manage devis items" on public.devis_items
  for insert with check (exists (
    select 1 from public.devis d where d.id = devis_items.devis_id and public.is_org_member(d.organization_id)
  ));
create policy "members can update devis items" on public.devis_items
  for update using (exists (
    select 1 from public.devis d where d.id = devis_items.devis_id and public.is_org_member(d.organization_id)
  ));
create policy "members can delete devis items" on public.devis_items
  for delete using (exists (
    select 1 from public.devis d where d.id = devis_items.devis_id and public.is_org_member(d.organization_id)
  ));

create table public.devis_status_history (
  id uuid primary key default gen_random_uuid(),
  devis_id uuid not null references public.devis(id) on delete cascade,
  status public.devis_status not null,
  changed_by uuid references auth.users(id),
  changed_at timestamptz not null default now()
);

create trigger devis_log_status_change after insert or update on public.devis
for each row execute function public.log_devis_status_change();

alter table public.devis_status_history enable row level security;

create policy "members can view devis status history" on public.devis_status_history
  for select using (exists (
    select 1 from public.devis d where d.id = devis_status_history.devis_id and public.is_org_member(d.organization_id)
  ));

-- ==========================================================================
-- Files (cloud sécurisé : plans, soumissions, documents divers)
-- ==========================================================================
create table public.files (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  name text not null,
  storage_path text not null,
  size_bytes bigint not null default 0,
  mime_type text,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index on public.files (organization_id);

alter table public.files enable row level security;

create policy "members can view files" on public.files
  for select using (public.is_org_member(organization_id));
create policy "members can upload files" on public.files
  for insert with check (public.is_org_member(organization_id));
create policy "members can delete files" on public.files
  for delete using (public.is_org_member(organization_id));

-- ==========================================================================
-- Storage usage helper (sums app-tracked files; used to enforce plan quotas)
-- ==========================================================================
create or replace function public.get_storage_usage_bytes(org_id uuid)
returns bigint
language sql security definer stable set search_path = public as $$
  select coalesce(sum(size_bytes), 0)::bigint from public.files where organization_id = org_id;
$$;

grant execute on function public.get_storage_usage_bytes(uuid) to authenticated;

-- ==========================================================================
-- Storage bucket + policies
-- ==========================================================================
insert into storage.buckets (id, name, public)
values ('opus-storage', 'opus-storage', false)
on conflict (id) do nothing;

create policy "org members can read their storage objects"
on storage.objects for select
using (bucket_id = 'opus-storage' and public.is_org_member((storage.foldername(name))[1]::uuid));

create policy "org members can upload storage objects"
on storage.objects for insert
with check (bucket_id = 'opus-storage' and public.is_org_member((storage.foldername(name))[1]::uuid));

create policy "org members can update their storage objects"
on storage.objects for update
using (bucket_id = 'opus-storage' and public.is_org_member((storage.foldername(name))[1]::uuid));

create policy "org admins can delete storage objects"
on storage.objects for delete
using (bucket_id = 'opus-storage' and public.is_org_admin((storage.foldername(name))[1]::uuid));

-- plans table RLS (public read-only catalog)
alter table public.plans enable row level security;

create policy "anyone can view plans" on public.plans
  for select using (true);
