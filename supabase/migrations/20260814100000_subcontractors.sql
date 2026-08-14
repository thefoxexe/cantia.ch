-- Sous-traitants: répertoire d'entreprises sous-traitées par organisation,
-- affectées à un ou plusieurs chantiers avec un suivi de statut/dates et,
-- optionnellement, une attestation d'assurance RC. Suit le même patron de
-- gating par rôle que Levés/Métré/Planning/Documents (20260812160000).

create table public.subcontractors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  company_name text not null,
  trade text,
  contact_name text,
  phone text,
  email text,
  notes text,
  insurance_doc_path text,
  insurance_expires_on date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index subcontractors_organization_id_idx on public.subcontractors(organization_id);

create table public.project_subcontractors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  subcontractor_id uuid not null references public.subcontractors(id) on delete cascade,
  task text,
  status text not null default 'planifie' check (status in ('planifie', 'en_cours', 'termine', 'annule')),
  start_date date,
  end_date date,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index project_subcontractors_project_id_idx on public.project_subcontractors(project_id);
create index project_subcontractors_subcontractor_id_idx on public.project_subcontractors(subcontractor_id);

alter table public.subcontractors enable row level security;
alter table public.project_subcontractors enable row level security;

alter table public.organization_roles
  add column can_view_subcontractors boolean not null default true;

create or replace function public.can_view_org_subcontractors(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select
    public.is_org_admin(org_id)
    or exists (
      select 1 from public.organization_members m
      left join public.organization_roles r on r.id = m.role_id
      where m.organization_id = org_id and m.user_id = auth.uid()
        and (m.role_id is null or r.can_view_subcontractors)
    );
$$;

create policy "subcontractors-permitted members can view subcontractors" on public.subcontractors
  for select using (public.is_org_member(organization_id) and public.can_view_org_subcontractors(organization_id));
create policy "subcontractors-permitted members can create subcontractors" on public.subcontractors
  for insert with check (public.is_org_member(organization_id) and public.can_view_org_subcontractors(organization_id) and created_by = auth.uid());
create policy "subcontractors-permitted members can update subcontractors" on public.subcontractors
  for update using (public.is_org_member(organization_id) and public.can_view_org_subcontractors(organization_id));
create policy "subcontractors-permitted members can delete subcontractors" on public.subcontractors
  for delete using (public.is_org_member(organization_id) and public.can_view_org_subcontractors(organization_id));

create policy "subcontractors-permitted members can view project subcontractors" on public.project_subcontractors
  for select using (public.is_org_member(organization_id) and public.has_project_access(project_id) and public.can_view_org_subcontractors(organization_id));
create policy "subcontractors-permitted members can create project subcontractors" on public.project_subcontractors
  for insert with check (public.is_org_member(organization_id) and public.has_project_access(project_id) and public.can_view_org_subcontractors(organization_id) and created_by = auth.uid());
create policy "subcontractors-permitted members can update project subcontractors" on public.project_subcontractors
  for update using (public.is_org_member(organization_id) and public.has_project_access(project_id) and public.can_view_org_subcontractors(organization_id));
create policy "subcontractors-permitted members can delete project subcontractors" on public.project_subcontractors
  for delete using (public.is_org_member(organization_id) and public.has_project_access(project_id) and public.can_view_org_subcontractors(organization_id));
