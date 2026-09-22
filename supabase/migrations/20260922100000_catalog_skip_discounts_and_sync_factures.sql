-- A rabais/remise on a devis is represented as one more ordinary devis_items
-- row with a negative unit_price (see app/(app)/devis/new.tsx) — no
-- separate "type" column exists to tell it apart. The auto-sync trigger
-- below used to capture every inserted row indiscriminately, so every
-- discount line ("Rabais 10%", -85.00) polluted the catalogue as if it
-- were a real, reusable position. Skip negative-price rows.
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
  if new.unit_price < 0 then
    return new;
  end if;

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

-- Mirrors sync_catalog_from_devis_item() for factures created directly
-- (not from a devis) — those lines never went through devis_items, so they
-- never reached the catalogue at all. Reuses the exact same dedup (the
-- catalog_items_org_key unique index + on conflict) rather than a fresh
-- existence check, so a position typed on a facture and later reused on a
-- devis (or vice versa) collapses into the same catalogue row instead of
-- creating a near-duplicate.
create or replace function public.sync_catalog_from_facture_item()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_key text;
begin
  if new.unit_price < 0 then
    return new;
  end if;

  select organization_id into v_org_id from public.factures where id = new.facture_id;
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

create trigger facture_items_sync_catalog after insert on public.facture_items
for each row execute function public.sync_catalog_from_facture_item();
