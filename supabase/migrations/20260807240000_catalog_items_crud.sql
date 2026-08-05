-- Inventaire (catalog_items) was read-only from the client except for the
-- single price-update RPC — no way to create an entry by hand, edit its
-- description, or bulk-import a price list. Adds the three RPCs that make
-- the inventory screen a real CRUD surface, all security-definer since
-- catalog_items still has no direct insert/update RLS policy (writes only
-- ever go through an explicit, audited path).

create or replace function public.create_catalog_item(
  p_organization_id uuid,
  p_description text,
  p_unit text,
  p_unit_price numeric
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key text;
  v_id uuid;
begin
  if not public.is_org_member(p_organization_id) then
    raise exception 'Accès refusé';
  end if;
  v_key := public.normalize_catalog_key(p_description);
  if v_key = '' then
    raise exception 'Description requise';
  end if;
  if exists (select 1 from public.catalog_items where organization_id = p_organization_id and description_key = v_key) then
    raise exception 'Cette prestation existe déjà dans l''inventaire';
  end if;

  insert into public.catalog_items (organization_id, description, description_key, unit, unit_price, use_count)
  values (p_organization_id, p_description, v_key, coalesce(nullif(trim(p_unit), ''), 'pce'), p_unit_price, 0)
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.update_catalog_item(
  p_catalog_item_id uuid,
  p_description text,
  p_unit text,
  p_unit_price numeric
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_key text;
begin
  select organization_id into v_org_id from public.catalog_items where id = p_catalog_item_id;
  if v_org_id is null then
    raise exception 'Position de catalogue introuvable';
  end if;
  if not public.is_org_member(v_org_id) then
    raise exception 'Accès refusé';
  end if;
  v_key := public.normalize_catalog_key(p_description);
  if v_key = '' then
    raise exception 'Description requise';
  end if;
  if exists (
    select 1 from public.catalog_items
    where organization_id = v_org_id and description_key = v_key and id <> p_catalog_item_id
  ) then
    raise exception 'Une autre prestation utilise déjà cette description';
  end if;

  update public.catalog_items
  set description = p_description, description_key = v_key, unit = coalesce(nullif(trim(p_unit), ''), 'pce'), unit_price = p_unit_price
  where id = p_catalog_item_id;
end;
$$;

-- Bulk CSV import: upserts on the same (organization_id, description_key)
-- key the auto-add trigger uses, so re-importing a refreshed price list
-- updates existing rows in place instead of duplicating them. use_count is
-- deliberately left untouched on conflict (only description/unit/price come
-- from the file) so import doesn't reset real usage history.
create or replace function public.import_catalog_items(p_organization_id uuid, p_items jsonb)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item jsonb;
  v_key text;
  v_count integer := 0;
begin
  if not public.is_org_member(p_organization_id) then
    raise exception 'Accès refusé';
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_key := public.normalize_catalog_key(v_item->>'description');
    if v_key = '' then
      continue;
    end if;

    insert into public.catalog_items (organization_id, description, description_key, unit, unit_price, use_count)
    values (
      p_organization_id,
      v_item->>'description',
      v_key,
      coalesce(nullif(trim(v_item->>'unit'), ''), 'pce'),
      coalesce((v_item->>'unit_price')::numeric, 0),
      0
    )
    on conflict (organization_id, description_key)
    do update set
      description = excluded.description,
      unit = excluded.unit,
      unit_price = excluded.unit_price;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;
