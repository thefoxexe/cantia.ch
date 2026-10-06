-- Answering soumissions faster: the company's catalogue remembers its prices
-- by CAN reference ("241.121.111" = chapter 241, article 121, sub .111), so
-- the same position in the next soumission gets the same price — matched on
-- the number, not on a text that may be worded differently.
--
-- Reserved positions (R) are the author's own texts: their number means
-- nothing from one soumission to another, they are never stored by number.

alter table public.catalog_items add column if not exists can_ref text
  check (can_ref is null or can_ref ~ '^\d{3}\.\d{3}\.\d{3}$');
create unique index if not exists catalog_items_org_can_ref on public.catalog_items (organization_id, can_ref) where can_ref is not null;

-- "241" + "121.111" → "241.121.111"; null for anything else.
create or replace function public.tender_can_ref(p_chapter text, p_path text)
returns text language sql immutable as $$
  select case when p_chapter ~ '^\d{3}$' and p_path ~ '^\d{3}\.\d{3}$' then p_chapter || '.' || p_path end;
$$;

-- Explicit action from the métré ("Enregistrer au catalogue"): every priced,
-- non-reserved CAN position goes into the catalogue under its number. An
-- existing entry takes the new price (the user chose it in this offer).
create or replace function public.save_tender_prices_to_catalog(p_tender uuid)
returns integer
language plpgsql security definer set search_path = public as $$
declare
  v_org uuid;
  v_count integer := 0;
  r record;
  v_ref text;
  v_desc text;
begin
  if not (public.can_edit_tender(p_tender) and public.can_price_tender(p_tender)) then
    raise exception 'Accès refusé';
  end if;
  select organization_id into v_org from public.tenders where id = p_tender;
  for r in
    select n.can_chapter, n.position_path, n.title, n.description, n.is_reserved, p.unit, pr.unit_price
    from public.tender_positions p
    join public.tender_nodes n on n.id = p.node_id
    join public.tender_position_prices pr on pr.position_id = p.id
    where p.tender_id = p_tender and pr.unit_price is not null and pr.unit_price > 0 and not p.excluded
  loop
    v_ref := public.tender_can_ref(r.can_chapter, r.position_path);
    if v_ref is null or r.is_reserved then continue; end if;
    v_desc := left(regexp_replace(coalesce(nullif(r.description, ''), r.title, ''), '\s+', ' ', 'g'), 300);
    insert into public.catalog_items (organization_id, description, description_key, unit, unit_price, use_count, last_used_at, can_ref)
    values (v_org, 'CAN ' || v_ref || ' — ' || v_desc, 'can ' || v_ref, coalesce(nullif(r.unit, ''), 'pce'), r.unit_price, 1, now(), v_ref)
    on conflict (organization_id, description_key) do update set
      unit_price = excluded.unit_price,
      unit = excluded.unit,
      can_ref = excluded.can_ref,
      use_count = public.catalog_items.use_count + 1,
      last_used_at = now();
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;
grant execute on function public.save_tender_prices_to_catalog(uuid), public.tender_can_ref(text, text) to authenticated;
