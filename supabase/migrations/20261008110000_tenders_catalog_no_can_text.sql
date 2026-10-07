-- The catalogue keeps only the CAN number, the unit and the company's own
-- price — never the CAN text (CRB's copyrighted wording). The full text
-- stays in the soumission it came from. The price is still found again by
-- number in the next soumission (see 20261007100000_tenders_catalog_can).
create or replace function public.save_tender_prices_to_catalog(p_tender uuid)
returns integer
language plpgsql security definer set search_path = public as $$
declare
  v_org uuid;
  v_count integer := 0;
  r record;
  v_ref text;
begin
  if not (public.can_edit_tender(p_tender) and public.can_price_tender(p_tender)) then
    raise exception 'Accès refusé';
  end if;
  select organization_id into v_org from public.tenders where id = p_tender;
  for r in
    select n.can_chapter, n.position_path, n.is_reserved, p.unit, pr.unit_price
    from public.tender_positions p
    join public.tender_nodes n on n.id = p.node_id
    join public.tender_position_prices pr on pr.position_id = p.id
    where p.tender_id = p_tender and pr.unit_price is not null and pr.unit_price > 0 and not p.excluded
  loop
    v_ref := public.tender_can_ref(r.can_chapter, r.position_path);
    if v_ref is null or r.is_reserved then continue; end if;
    insert into public.catalog_items (organization_id, description, description_key, unit, unit_price, use_count, last_used_at, can_ref)
    values (v_org, 'CAN ' || v_ref, 'can ' || v_ref, coalesce(nullif(r.unit, ''), 'pce'), r.unit_price, 1, now(), v_ref)
    on conflict (organization_id, description_key) do update set
      description = excluded.description,
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
grant execute on function public.save_tender_prices_to_catalog(uuid) to authenticated;

-- Entries saved before: drop the copied text, keep number, unit and price.
update public.catalog_items set description = 'CAN ' || can_ref
where can_ref is not null and description is distinct from 'CAN ' || can_ref;
