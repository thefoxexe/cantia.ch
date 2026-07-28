-- ==========================================================================
-- Survey points (levés) — per chantier point cloud, manual entry or import
-- ==========================================================================
create table public.survey_points (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  code text not null,
  description text,
  latitude double precision not null,
  longitude double precision not null,
  elevation double precision,
  lv95_e double precision,
  lv95_n double precision,
  source text not null default 'manual',
  sort_order integer not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index on public.survey_points (project_id);

alter table public.survey_points enable row level security;

create policy "members can view survey points" on public.survey_points
  for select using (public.is_org_member(organization_id));
create policy "members can add survey points" on public.survey_points
  for insert with check (public.is_org_member(organization_id));
create policy "members can update survey points" on public.survey_points
  for update using (public.is_org_member(organization_id));
create policy "members can delete survey points" on public.survey_points
  for delete using (public.is_org_member(organization_id));

-- ==========================================================================
-- Métré (quantity / measurement sheet) — per chantier, feeds into devis
-- ==========================================================================
create table public.metre_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  reference text,
  description text not null,
  quantity numeric(12,2) not null default 0,
  unit text default 'pce',
  sort_order integer not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.metre_items (project_id);

create trigger metre_items_set_updated_at before update on public.metre_items
for each row execute function public.set_updated_at();

alter table public.metre_items enable row level security;

create policy "members can view metre items" on public.metre_items
  for select using (public.is_org_member(organization_id));
create policy "members can add metre items" on public.metre_items
  for insert with check (public.is_org_member(organization_id));
create policy "members can update metre items" on public.metre_items
  for update using (public.is_org_member(organization_id));
create policy "members can delete metre items" on public.metre_items
  for delete using (public.is_org_member(organization_id));
