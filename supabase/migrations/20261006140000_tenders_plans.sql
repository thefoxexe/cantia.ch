-- Métrés & Soumissions — phase D : plans et mesures (docs/metres-soumissions/phase-0.md §4).
--
-- A chantier holds plans (A-102…), each with revisions that are never
-- deleted; every page of a revision carries its own calibration. Measured
-- objects store their points normalized 0..1 on the page, so they stay right
-- at any zoom, and their lengths / areas are always recomputed here from the
-- geometry and the calibration — the client figure is only for display.
--
-- Named site_plans because public.plans is the subscription catalogue.

-- ---------------------------------------------------------------------------
-- Access: same gates as the métrés, keyed on the chantier.
-- ---------------------------------------------------------------------------
create or replace function public.can_access_site_plans(p_project uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.projects p
    where p.id = p_project
      and public.is_org_member(p.organization_id)
      and public.has_project_access(p.id)
      and public.can_view_org_metre(p.organization_id)
  );
$$;
create or replace function public.can_edit_site_plans(p_project uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select public.can_access_site_plans(p_project)
    and exists (select 1 from public.projects p where p.id = p_project and public.org_has_tenders(p.organization_id));
$$;
grant execute on function public.can_access_site_plans(uuid), public.can_edit_site_plans(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.site_plans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  number text check (number is null or char_length(number) <= 60),
  active_revision_id uuid,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index site_plans_project_idx on public.site_plans (project_id, sort_order);
create trigger site_plans_set_updated_at before update on public.site_plans for each row execute function public.set_updated_at();

create table public.site_plan_revisions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  plan_id uuid not null references public.site_plans(id) on delete cascade,
  label text not null default 'Rev A' check (char_length(label) between 1 and 60),
  file_id uuid not null references public.files(id) on delete restrict,
  file_name text check (file_name is null or char_length(file_name) <= 300),
  page_count integer not null default 1 check (page_count between 1 and 500),
  uploaded_by uuid references auth.users(id) default auth.uid(),
  uploaded_at timestamptz not null default now()
);
create index site_plan_revisions_plan_idx on public.site_plan_revisions (plan_id, uploaded_at);
alter table public.site_plans
  add constraint site_plans_active_revision_fk foreign key (active_revision_id) references public.site_plan_revisions(id) on delete set null;

create table public.site_plan_pages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  revision_id uuid not null references public.site_plan_revisions(id) on delete cascade,
  page_index integer not null check (page_index >= 1),
  -- Size of the page as displayed (pdf.js viewport at scale 1, rotation applied).
  width_pt numeric(10, 3) not null check (width_pt > 0),
  height_pt numeric(10, 3) not null check (height_pt > 0),
  rotation integer not null default 0 check (rotation in (0, 90, 180, 270)),
  -- {"method":"scale","scale":50} or {"method":"two_points","a":[x,y],"b":[x,y],"real_m":5}
  calibration jsonb,
  -- Derived from calibration by trigger, never sent by the client.
  meters_per_pt numeric(18, 12),
  label text check (label is null or char_length(label) <= 120),
  unique (revision_id, page_index)
);

create table public.measured_objects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  plan_page_id uuid not null references public.site_plan_pages(id) on delete cascade,
  name text check (name is null or char_length(name) <= 40),
  kind text not null check (kind in ('distance', 'polyline', 'polygon', 'perimeter', 'count')),
  -- [[x, y], …] normalized 0..1 on the displayed page
  geometry jsonb not null,
  length_m numeric(14, 4),
  area_m2 numeric(14, 4),
  perimeter_m numeric(14, 4),
  count integer,
  params jsonb not null default '{}'::jsonb,
  zone text check (zone is null or char_length(zone) <= 40),
  floor text check (floor is null or char_length(floor) <= 40),
  color text check (color is null or color ~ '^#[0-9a-fA-F]{6}$'),
  note text check (note is null or char_length(note) <= 500),
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index measured_objects_page_idx on public.measured_objects (plan_page_id) where deleted_at is null;
create index measured_objects_project_idx on public.measured_objects (project_id);
create trigger measured_objects_set_updated_at before update on public.measured_objects for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- organization_id / project_id always derived from the parent row
-- ---------------------------------------------------------------------------
create or replace function public.site_plans_derive()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_table_name = 'site_plans' then
    select p.organization_id, p.id into new.organization_id, new.project_id from public.projects p where p.id = new.project_id;
  elsif tg_table_name = 'site_plan_revisions' then
    select s.organization_id, s.project_id into new.organization_id, new.project_id from public.site_plans s where s.id = new.plan_id;
  elsif tg_table_name = 'site_plan_pages' then
    select r.organization_id, r.project_id into new.organization_id, new.project_id from public.site_plan_revisions r where r.id = new.revision_id;
  else
    select g.organization_id, g.project_id into new.organization_id, new.project_id from public.site_plan_pages g where g.id = new.plan_page_id;
  end if;
  if new.organization_id is null then
    raise exception 'Élément parent introuvable';
  end if;
  return new;
end;
$$;
create trigger site_plans_derive before insert or update of project_id, organization_id on public.site_plans
for each row execute function public.site_plans_derive();
create trigger site_plan_revisions_derive before insert or update of plan_id, project_id, organization_id on public.site_plan_revisions
for each row execute function public.site_plans_derive();
create trigger site_plan_pages_derive before insert or update of revision_id, project_id, organization_id on public.site_plan_pages
for each row execute function public.site_plans_derive();
create trigger measured_objects_derive before insert or update of plan_page_id, project_id, organization_id on public.measured_objects
for each row execute function public.site_plans_derive();

-- A revision's file must belong to the same organisation.
create or replace function public.site_plan_revisions_check_file()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.files f where f.id = new.file_id and f.organization_id = new.organization_id) then
    raise exception 'Fichier introuvable';
  end if;
  return new;
end;
$$;
create trigger site_plan_revisions_z_check_file before insert or update of file_id on public.site_plan_revisions
for each row execute function public.site_plan_revisions_check_file();

-- The active revision must be one of the plan's own.
create or replace function public.site_plans_check_active()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.active_revision_id is not null
     and not exists (select 1 from public.site_plan_revisions r where r.id = new.active_revision_id and r.plan_id = new.id) then
    raise exception 'Révision d’un autre plan';
  end if;
  return new;
end;
$$;
create trigger site_plans_check_active before update of active_revision_id on public.site_plans
for each row execute function public.site_plans_check_active();

-- ---------------------------------------------------------------------------
-- Calibration and geometry (same formulas as lib/tenders/geometry.ts)
-- ---------------------------------------------------------------------------
-- 1 pt = 1/72 inch = 0.0254/72 m on paper.
create or replace function public.site_plan_meters_per_pt(p_cal jsonb, p_width numeric, p_height numeric)
returns numeric language plpgsql immutable as $$
declare
  dx numeric;
  dy numeric;
  d numeric;
begin
  if p_cal is null then return null; end if;
  if p_cal->>'method' = 'scale' then
    if coalesce((p_cal->>'scale')::numeric, 0) <= 0 then raise exception 'Échelle invalide'; end if;
    return (p_cal->>'scale')::numeric * 0.0254 / 72;
  elsif p_cal->>'method' = 'two_points' then
    dx := ((p_cal->'b'->>0)::numeric - (p_cal->'a'->>0)::numeric) * p_width;
    dy := ((p_cal->'b'->>1)::numeric - (p_cal->'a'->>1)::numeric) * p_height;
    d := sqrt(dx * dx + dy * dy);
    if d < 1 or coalesce((p_cal->>'real_m')::numeric, 0) <= 0 then raise exception 'Cote de calibration invalide'; end if;
    return (p_cal->>'real_m')::numeric / d;
  end if;
  raise exception 'Méthode de calibration inconnue';
end;
$$;

create or replace function public.site_plan_pages_calibrate()
returns trigger language plpgsql as $$
begin
  new.meters_per_pt := public.site_plan_meters_per_pt(new.calibration, new.width_pt, new.height_pt);
  return new;
end;
$$;
create trigger site_plan_pages_calibrate before insert or update of calibration, width_pt, height_pt on public.site_plan_pages
for each row execute function public.site_plan_pages_calibrate();

-- Lengths in pt on the page; area in pt².
create or replace function public.measure_geometry(p_kind text, p_geom jsonb, p_width numeric, p_height numeric, p_mpp numeric,
  out length_m numeric, out area_m2 numeric, out perimeter_m numeric, out count integer)
language plpgsql immutable as $$
declare
  n integer := jsonb_array_length(p_geom);
  i integer;
  x0 numeric; y0 numeric; x1 numeric; y1 numeric;
  open_len numeric := 0;
  closing numeric := 0;
  shoelace numeric := 0;
begin
  if p_kind = 'count' then
    count := n;
    return;
  end if;
  if p_mpp is null then return; end if; -- not calibrated: no length
  for i in 0 .. n - 2 loop
    x0 := (p_geom->i->>0)::numeric * p_width;  y0 := (p_geom->i->>1)::numeric * p_height;
    x1 := (p_geom->(i + 1)->>0)::numeric * p_width;  y1 := (p_geom->(i + 1)->>1)::numeric * p_height;
    open_len := open_len + sqrt((x1 - x0) ^ 2 + (y1 - y0) ^ 2);
    shoelace := shoelace + (x0 * y1 - x1 * y0);
  end loop;
  if n >= 3 then
    x0 := (p_geom->(n - 1)->>0)::numeric * p_width;  y0 := (p_geom->(n - 1)->>1)::numeric * p_height;
    x1 := (p_geom->0->>0)::numeric * p_width;  y1 := (p_geom->0->>1)::numeric * p_height;
    closing := sqrt((x1 - x0) ^ 2 + (y1 - y0) ^ 2);
    shoelace := shoelace + (x0 * y1 - x1 * y0);
  end if;
  if p_kind in ('distance', 'polyline') then
    length_m := round(open_len * p_mpp, 4);
  elsif p_kind = 'perimeter' then
    perimeter_m := round((open_len + closing) * p_mpp, 4);
    length_m := perimeter_m;
  elsif p_kind = 'polygon' then
    area_m2 := round(abs(shoelace) / 2 * p_mpp * p_mpp, 4);
    perimeter_m := round((open_len + closing) * p_mpp, 4);
  end if;
end;
$$;

create or replace function public.measured_objects_compute()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  g public.site_plan_pages%rowtype;
  n integer;
  m record;
  seq integer;
begin
  if jsonb_typeof(new.geometry) <> 'array' then raise exception 'Géométrie invalide'; end if;
  n := jsonb_array_length(new.geometry);
  if n > 2000 then raise exception 'Trop de points'; end if;
  if exists (
    select 1 from jsonb_array_elements(new.geometry) pt
    where jsonb_typeof(pt) <> 'array' or jsonb_array_length(pt) <> 2
       or jsonb_typeof(pt->0) <> 'number' or jsonb_typeof(pt->1) <> 'number'
       or (pt->>0)::numeric not between -0.05 and 1.05 or (pt->>1)::numeric not between -0.05 and 1.05
  ) then
    raise exception 'Point hors de la page';
  end if;
  if (new.kind = 'distance' and n <> 2)
     or (new.kind = 'polyline' and n < 2)
     or (new.kind in ('polygon', 'perimeter') and n < 3)
     or (new.kind = 'count' and n < 1) then
    raise exception 'Nombre de points insuffisant pour %', new.kind;
  end if;
  select * into g from public.site_plan_pages where id = new.plan_page_id;
  select * into m from public.measure_geometry(new.kind, new.geometry, g.width_pt, g.height_pt, g.meters_per_pt);
  new.length_m := m.length_m;
  new.area_m2 := m.area_m2;
  new.perimeter_m := m.perimeter_m;
  new.count := m.count;
  if tg_op = 'INSERT' and new.name is null then
    select coalesce(max(substring(o.name from '^M-(\d+)$')::integer), 0) + 1 into seq
    from public.measured_objects o where o.project_id = new.project_id;
    new.name := 'M-' || lpad(seq::text, 3, '0');
  end if;
  return new;
end;
$$;
-- Same-timing triggers fire by name: measured_objects_derive runs first, so
-- project_id is already set when the name is numbered.
create trigger measured_objects_z_compute before insert or update of geometry, kind, plan_page_id on public.measured_objects
for each row execute function public.measured_objects_compute();

-- Recalibrating a page recomputes every measure on it.
create or replace function public.site_plan_pages_remeasure()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.measured_objects o set
    (length_m, area_m2, perimeter_m, count) = (
      select m.length_m, m.area_m2, m.perimeter_m, m.count
      from public.measure_geometry(o.kind, o.geometry, new.width_pt, new.height_pt, new.meters_per_pt) m
    )
  where o.plan_page_id = new.id;
  return null;
end;
$$;
create trigger site_plan_pages_remeasure after update on public.site_plan_pages
for each row when (old.meters_per_pt is distinct from new.meters_per_pt)
execute function public.site_plan_pages_remeasure();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
do $$
declare tbl text;
begin
  foreach tbl in array array['site_plans', 'site_plan_revisions', 'site_plan_pages', 'measured_objects'] loop
    execute format('alter table public.%I enable row level security', tbl);
    execute format('create policy "plan readers" on public.%I for select using (public.can_access_site_plans(project_id))', tbl);
    execute format('create policy "plan writers insert" on public.%I for insert with check (public.can_edit_site_plans(project_id))', tbl);
    execute format('create policy "plan writers update" on public.%I for update using (public.can_edit_site_plans(project_id))', tbl);
    -- Revisions are history: they are never deleted from the app.
    if tbl <> 'site_plan_revisions' then
      execute format('create policy "plan writers delete" on public.%I for delete using (public.can_edit_site_plans(project_id))', tbl);
    end if;
  end loop;
end $$;
