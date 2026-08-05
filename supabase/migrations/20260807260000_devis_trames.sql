-- "Trame" = a reusable set of devis line items (description/unit/price, no
-- quantity) saved under a name — e.g. a tiler saves their usual "Pose
-- carrelage" positions once, then starts every future carrelage devis from
-- that trame instead of retyping every line. Deliberately named "trame"
-- rather than "modèle": that word is already taken in this app by
-- pdf_templates (the *visual/PDF design* picker) — reusing it here for a
-- *content* library would collide in the UI ("choisir un modèle" would mean
-- two different things on the same devis creation screen).
create table public.devis_trames (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.devis_trames (organization_id);

create trigger devis_trames_set_updated_at before update on public.devis_trames
for each row execute function public.set_updated_at();

alter table public.devis_trames enable row level security;

create policy "members can view trames" on public.devis_trames
  for select using (public.is_org_member(organization_id));
create policy "members can create trames" on public.devis_trames
  for insert with check (public.is_org_member(organization_id));
create policy "members can update trames" on public.devis_trames
  for update using (public.is_org_member(organization_id));
create policy "admins can delete trames" on public.devis_trames
  for delete using (public.is_org_admin(organization_id));

create table public.devis_trame_items (
  id uuid primary key default gen_random_uuid(),
  trame_id uuid not null references public.devis_trames(id) on delete cascade,
  description text not null,
  unit text default 'pce',
  unit_price numeric(10,2) not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index on public.devis_trame_items (trame_id);

alter table public.devis_trame_items enable row level security;

create policy "members can view trame items" on public.devis_trame_items
  for select using (exists (
    select 1 from public.devis_trames t where t.id = devis_trame_items.trame_id and public.is_org_member(t.organization_id)
  ));
create policy "members can create trame items" on public.devis_trame_items
  for insert with check (exists (
    select 1 from public.devis_trames t where t.id = devis_trame_items.trame_id and public.is_org_member(t.organization_id)
  ));
create policy "members can update trame items" on public.devis_trame_items
  for update using (exists (
    select 1 from public.devis_trames t where t.id = devis_trame_items.trame_id and public.is_org_member(t.organization_id)
  ));
create policy "members can delete trame items" on public.devis_trame_items
  for delete using (exists (
    select 1 from public.devis_trames t where t.id = devis_trame_items.trame_id and public.is_org_member(t.organization_id)
  ));
