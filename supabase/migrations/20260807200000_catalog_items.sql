-- Catalogue prix: a genuinely separate, persisted table instead of the
-- previous "derive from devis_items history" approach (lib/catalog.ts's
-- buildCatalog over the last 400 devis_items rows). A devis_items row
-- auto-adds itself to the org's catalogue the first time a given
-- description is used (via trigger below); re-using the exact same
-- description again never overwrites the stored price silently — that
-- only happens through update_catalog_item_price(), called once the user
-- explicitly confirms it in the app (the "price differs from catalogue,
-- update or keep as an exception for this devis?" prompt).
create extension if not exists unaccent;

-- Accent-fold + collapse punctuation/whitespace, mirroring lib/catalog.ts's
-- client-side normalize() closely enough that "Bétonnage" and "bétonnage "
-- collide into the same catalog row instead of creating near-duplicates.
create or replace function public.normalize_catalog_key(input text)
returns text
language sql
immutable
as $$
  select trim(regexp_replace(lower(unaccent(coalesce(input, ''))), '[^a-z0-9]+', ' ', 'g'));
$$;

create table public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  description text not null,
  description_key text not null,
  unit text not null default 'pce',
  unit_price numeric(10,2) not null default 0,
  use_count integer not null default 1,
  last_used_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index catalog_items_org_key on public.catalog_items (organization_id, description_key);
create index on public.catalog_items (organization_id);

create trigger catalog_items_set_updated_at before update on public.catalog_items
for each row execute function public.set_updated_at();

alter table public.catalog_items enable row level security;

create policy "members can view catalog items" on public.catalog_items
  for select using (public.is_org_member(organization_id));
create policy "admins can delete catalog items" on public.catalog_items
  for delete using (public.is_org_admin(organization_id));
-- Deliberately no direct insert/update policy for members: rows are only
-- ever written by the security-definer trigger/RPC below, never inserted
-- or edited straight from the client.

-- Auto-add: the first time an org uses a given description in a devis
-- line, it's captured into the catalogue with its price/unit. Re-using an
-- existing description only bumps use_count/last_used_at — the stored
-- price is left untouched on purpose (see comment above).
create or replace function public.sync_catalog_from_devis_item()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_key text;
begin
  select organization_id into v_org_id from public.devis where id = new.devis_id;
  if v_org_id is null then
    return new;
  end if;
  v_key := public.normalize_catalog_key(new.description);
  if v_key = '' then
    return new;
  end if;

  insert into public.catalog_items (organization_id, description, description_key, unit, unit_price)
  values (v_org_id, new.description, v_key, coalesce(new.unit, 'pce'), new.unit_price)
  on conflict (organization_id, description_key)
  do update set use_count = public.catalog_items.use_count + 1, last_used_at = now();

  return new;
end;
$$;

create trigger devis_items_sync_catalog after insert on public.devis_items
for each row execute function public.sync_catalog_from_devis_item();

-- Explicit opt-in price update — the only path that changes a catalogue
-- item's stored price/unit, called once the app's confirmation prompt is
-- accepted by the user.
create or replace function public.update_catalog_item_price(p_catalog_item_id uuid, p_unit_price numeric, p_unit text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
begin
  select organization_id into v_org_id from public.catalog_items where id = p_catalog_item_id;
  if v_org_id is null then
    raise exception 'Position de catalogue introuvable';
  end if;
  if not public.is_org_member(v_org_id) then
    raise exception 'Accès refusé';
  end if;

  update public.catalog_items
  set unit_price = p_unit_price, unit = coalesce(p_unit, unit)
  where id = p_catalog_item_id;
end;
$$;

-- One-time backfill from existing devis_items history, so orgs that
-- already have devis don't start with an empty catalogue. "latest" picks
-- one representative row (most recently used) per (org, key) so the
-- insert's own source set never has two rows for the same catalogue slot
-- in one command; "agg" supplies the true total use_count/last_used_at
-- across all historical uses of that key.
with agg as (
  select
    d.organization_id,
    public.normalize_catalog_key(di.description) as key,
    count(*) as use_count,
    max(di.created_at) as last_used_at
  from public.devis_items di
  join public.devis d on d.id = di.devis_id
  where public.normalize_catalog_key(di.description) <> ''
  group by d.organization_id, public.normalize_catalog_key(di.description)
),
latest as (
  select distinct on (d.organization_id, public.normalize_catalog_key(di.description))
    d.organization_id,
    public.normalize_catalog_key(di.description) as key,
    di.description,
    coalesce(di.unit, 'pce') as unit,
    di.unit_price
  from public.devis_items di
  join public.devis d on d.id = di.devis_id
  where public.normalize_catalog_key(di.description) <> ''
  order by d.organization_id, public.normalize_catalog_key(di.description), di.created_at desc
)
insert into public.catalog_items (organization_id, description, description_key, unit, unit_price, use_count, last_used_at)
select l.organization_id, l.description, l.key, l.unit, l.unit_price, a.use_count, a.last_used_at
from latest l
join agg a on a.organization_id = l.organization_id and a.key = l.key;
