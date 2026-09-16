-- Per-organization breakdown behind admin_feature_usage_overview()'s
-- aggregate rows — "which company used this, how many times" for the
-- Utilisation screen's expandable dropdown. Same table mapping as the
-- overview function, just grouped by organization instead of summed
-- across all of them.
create or replace function public.admin_feature_usage_by_org()
returns table(
  feature_key text,
  organization_id uuid,
  organization_name text,
  use_count bigint
)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  return query
  with orgs as (
    select id, name, logo_url, brand_color from public.organizations where not is_internal
  )
  select 'devis'::text as feature_key, o.id as organization_id, o.name as organization_name, count(*) as use_count
  from public.devis d join orgs o on o.id = d.organization_id
  group by o.id, o.name
  union all
  select 'factures', o.id, o.name, count(*)
  from public.factures f join orgs o on o.id = f.organization_id
  group by o.id, o.name
  union all
  select 'chantiers', o.id, o.name, count(*)
  from public.projects p join orgs o on o.id = p.organization_id
  group by o.id, o.name
  union all
  select 'rapports', o.id, o.name, count(*)
  from public.reports r join orgs o on o.id = r.organization_id
  group by o.id, o.name
  union all
  select 'sous_traitants', o.id, o.name, count(*)
  from public.subcontractors s join orgs o on o.id = s.organization_id
  group by o.id, o.name
  union all
  select 'travaux_sup', o.id, o.name, count(*)
  from public.extra_works e join orgs o on o.id = e.organization_id
  group by o.id, o.name
  union all
  select 'planning', o.id, o.name, count(*)
  from public.planning_assignments pa join orgs o on o.id = pa.organization_id
  group by o.id, o.name
  union all
  select 'catalogue', o.id, o.name, count(*)
  from public.catalog_items c join orgs o on o.id = c.organization_id
  group by o.id, o.name
  union all
  select 'devis_trames', o.id, o.name, count(*)
  from public.devis_trames dt join orgs o on o.id = dt.organization_id
  group by o.id, o.name
  union all
  select 'clients', o.id, o.name, count(*)
  from public.clients cl join orgs o on o.id = cl.organization_id
  group by o.id, o.name
  union all
  select 'heures', o.id, o.name, count(*)
  from public.payroll_time_entries t join orgs o on o.id = t.organization_id
  group by o.id, o.name
  union all
  select 'salaires', o.id, o.name, count(*)
  from public.payroll_runs pr join orgs o on o.id = pr.organization_id
  group by o.id, o.name
  union all
  select 'employes_rh', o.id, o.name, count(*)
  from public.payroll_ghost_employees pg join orgs o on o.id = pg.organization_id
  group by o.id, o.name
  union all
  select 'tresorerie', o.id, o.name, count(*)
  from public.expenses ex join orgs o on o.id = ex.organization_id
  group by o.id, o.name
  union all
  select 'compta', o.id, o.name, count(*)
  from public.accounting_entries ae join orgs o on o.id = ae.organization_id
  group by o.id, o.name
  union all
  select 'banque', o.id, o.name, count(*)
  from public.bank_accounts ba join orgs o on o.id = ba.organization_id
  group by o.id, o.name
  union all
  select 'bexio', o.id, o.name, count(*)
  from public.integration_sync_logs isl join orgs o on o.id = isl.organization_id
  group by o.id, o.name
  union all
  select 'dictee_vocale', o.id, o.name, count(*)
  from public.ai_usage_log au join orgs o on o.id = au.organization_id
  group by o.id, o.name
  union all
  select 'logo_perso', o.id, o.name, 1::bigint
  from orgs o where o.logo_url is not null
  union all
  select 'couleur_perso', o.id, o.name, 1::bigint
  from orgs o where o.brand_color is distinct from '#1F3D3A'
  order by feature_key, use_count desc;
end;
$$;

revoke execute on function public.admin_feature_usage_by_org() from public;
grant execute on function public.admin_feature_usage_by_org() to authenticated;
