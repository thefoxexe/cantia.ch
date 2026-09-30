-- Subtotals (sum of quantity x unit price) of many devis / factures in one
-- call, for the lists and dashboards that show an amount per document.
--
-- The screens used to read every line (devis_items / facture_items) with
-- `.in(id, [...])`: the ids went into the URL (500 factures = 19 KB), the
-- response was capped at 1000 rows (totals silently wrong past that), and
-- the row-level policies ran their permission functions once per line.
-- Here the ids travel in the request body, the sum is done in the
-- database, and the permission is checked once per organization, with the
-- same rules as the SELECT policies on the line tables.

create or replace function public.facture_subtotals(p_ids uuid[])
returns table (facture_id uuid, subtotal numeric)
language sql
stable
security definer
set search_path = public
as $$
  with docs as (
    select f.id, f.organization_id from public.factures f where f.id = any (p_ids)
  ),
  allowed as (
    select o.organization_id
    from (select distinct organization_id from docs) o
    where public.can_manage_org_devis(o.organization_id)
       or o.organization_id in (select public.fiduciary_org_ids('VIEW_INVOICES'))
  )
  select d.id, coalesce(sum(i.quantity * i.unit_price), 0)
  from docs d
  join allowed a on a.organization_id = d.organization_id
  left join public.facture_items i on i.facture_id = d.id
  group by d.id;
$$;

create or replace function public.devis_subtotals(p_ids uuid[])
returns table (devis_id uuid, subtotal numeric)
language sql
stable
security definer
set search_path = public
as $$
  with docs as (
    select d.id, d.organization_id from public.devis d where d.id = any (p_ids)
  ),
  allowed as (
    select o.organization_id
    from (select distinct organization_id from docs) o
    where public.can_manage_org_devis(o.organization_id)
       or o.organization_id in (select public.fiduciary_org_ids('VIEW_QUOTES'))
  )
  select d.id, coalesce(sum(i.quantity * i.unit_price), 0)
  from docs d
  join allowed a on a.organization_id = d.organization_id
  left join public.devis_items i on i.devis_id = d.id
  group by d.id;
$$;

revoke all on function public.facture_subtotals(uuid[]) from public, anon;
revoke all on function public.devis_subtotals(uuid[]) from public, anon;
grant execute on function public.facture_subtotals(uuid[]) to authenticated;
grant execute on function public.devis_subtotals(uuid[]) to authenticated;
