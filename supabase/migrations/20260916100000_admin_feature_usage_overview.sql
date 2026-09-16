-- "Qu'est-ce que les gens utilisent vraiment" — real usage question from the
-- product owner: which features actually get used, across all real
-- (non-internal) organizations, so marketing can lean on what genuinely
-- converts instead of guessing from feature-list copy. Rather than bolting
-- on new client-side event tracking (new instrumentation everywhere, risk of
-- gaps), this reads the real rows every feature already writes when someone
-- actually uses it — a devis row IS "used the devis feature". Cheaper, more
-- reliable, and needs zero new tracking code.
create or replace function public.admin_feature_usage_overview()
returns table(
  feature_key text,
  label text,
  category text,
  total_count bigint,
  orgs_using bigint,
  orgs_total bigint,
  last_30d_count bigint
)
language plpgsql stable security definer set search_path = public
as $$
declare
  v_orgs_total bigint;
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  select count(*) into v_orgs_total from public.organizations where not is_internal;

  return query
  with orgs as (
    select id, logo_url, brand_color from public.organizations where not is_internal
  )
  -- Column aliases here (only) matter: a UNION's output column names come
  -- from its first branch, and the trailing ORDER BY below needs those
  -- names — without them "orgs_using"/"total_count" don't resolve to
  -- anything and Postgres rejects the whole query with "invalid
  -- UNION/INTERSECT/EXCEPT ORDER BY clause".
  select 'devis'::text as feature_key, 'Devis créés'::text as label, 'coeur_metier'::text as category,
    count(*) as total_count, count(distinct d.organization_id) as orgs_using, v_orgs_total as orgs_total,
    count(*) filter (where d.created_at > now() - interval '30 days') as last_30d_count
  from public.devis d join orgs o on o.id = d.organization_id
  union all
  select 'factures', 'Factures créées', 'coeur_metier',
    count(*), count(distinct f.organization_id), v_orgs_total,
    count(*) filter (where f.created_at > now() - interval '30 days')
  from public.factures f join orgs o on o.id = f.organization_id
  union all
  select 'chantiers', 'Chantiers créés', 'coeur_metier',
    count(*), count(distinct p.organization_id), v_orgs_total,
    count(*) filter (where p.created_at > now() - interval '30 days')
  from public.projects p join orgs o on o.id = p.organization_id
  union all
  select 'rapports', 'Rapports de chantier', 'coeur_metier',
    count(*), count(distinct r.organization_id), v_orgs_total,
    count(*) filter (where r.created_at > now() - interval '30 days')
  from public.reports r join orgs o on o.id = r.organization_id
  union all
  select 'sous_traitants', 'Sous-traitants ajoutés', 'coeur_metier',
    count(*), count(distinct s.organization_id), v_orgs_total,
    count(*) filter (where s.created_at > now() - interval '30 days')
  from public.subcontractors s join orgs o on o.id = s.organization_id
  union all
  select 'travaux_sup', 'Travaux supplémentaires', 'coeur_metier',
    count(*), count(distinct e.organization_id), v_orgs_total,
    count(*) filter (where e.created_at > now() - interval '30 days')
  from public.extra_works e join orgs o on o.id = e.organization_id
  union all
  select 'planning', 'Assignations planning', 'coeur_metier',
    count(*), count(distinct pa.organization_id), v_orgs_total,
    count(*) filter (where pa.created_at > now() - interval '30 days')
  from public.planning_assignments pa join orgs o on o.id = pa.organization_id
  union all
  select 'catalogue', 'Articles de catalogue', 'coeur_metier',
    count(*), count(distinct c.organization_id), v_orgs_total,
    count(*) filter (where c.created_at > now() - interval '30 days')
  from public.catalog_items c join orgs o on o.id = c.organization_id
  union all
  select 'devis_trames', 'Modèles de devis créés', 'coeur_metier',
    count(*), count(distinct dt.organization_id), v_orgs_total,
    count(*) filter (where dt.created_at > now() - interval '30 days')
  from public.devis_trames dt join orgs o on o.id = dt.organization_id
  union all
  select 'clients', 'Clients enregistrés', 'coeur_metier',
    count(*), count(distinct cl.organization_id), v_orgs_total,
    count(*) filter (where cl.created_at > now() - interval '30 days')
  from public.clients cl join orgs o on o.id = cl.organization_id
  union all
  select 'heures', 'Heures pointées', 'rh',
    count(*), count(distinct t.organization_id), v_orgs_total,
    count(*) filter (where t.created_at > now() - interval '30 days')
  from public.payroll_time_entries t join orgs o on o.id = t.organization_id
  union all
  select 'salaires', 'Salaires générés', 'rh',
    count(*), count(distinct pr.organization_id), v_orgs_total,
    count(*) filter (where pr.created_at > now() - interval '30 days')
  from public.payroll_runs pr join orgs o on o.id = pr.organization_id
  union all
  select 'employes_rh', 'Employés (sans compte) ajoutés', 'rh',
    count(*), count(distinct pg.organization_id), v_orgs_total,
    count(*) filter (where pg.created_at > now() - interval '30 days')
  from public.payroll_ghost_employees pg join orgs o on o.id = pg.organization_id
  union all
  select 'tresorerie', 'Dépenses suivies', 'finance',
    count(*), count(distinct ex.organization_id), v_orgs_total,
    count(*) filter (where ex.created_at > now() - interval '30 days')
  from public.expenses ex join orgs o on o.id = ex.organization_id
  union all
  select 'compta', 'Écritures comptables', 'finance',
    count(*), count(distinct ae.organization_id), v_orgs_total,
    count(*) filter (where ae.created_at > now() - interval '30 days')
  from public.accounting_entries ae join orgs o on o.id = ae.organization_id
  union all
  select 'banque', 'Comptes bancaires connectés', 'finance',
    count(*), count(distinct ba.organization_id), v_orgs_total,
    count(*) filter (where ba.created_at > now() - interval '30 days')
  from public.bank_accounts ba join orgs o on o.id = ba.organization_id
  union all
  select 'bexio', 'Synchronisations Bexio', 'integrations',
    count(*), count(distinct isl.organization_id), v_orgs_total,
    count(*) filter (where isl.created_at > now() - interval '30 days')
  from public.integration_sync_logs isl join orgs o on o.id = isl.organization_id
  union all
  select 'dictee_vocale', 'Dictée vocale / IA', 'ia',
    count(*), count(distinct au.organization_id), v_orgs_total,
    count(*) filter (where au.created_at > now() - interval '30 days')
  from public.ai_usage_log au join orgs o on o.id = au.organization_id
  union all
  select 'logo_perso', 'Logo personnalisé uploadé', 'personnalisation',
    count(*) filter (where o.logo_url is not null),
    count(*) filter (where o.logo_url is not null),
    v_orgs_total,
    null::bigint
  from orgs o
  union all
  select 'couleur_perso', 'Couleur de marque personnalisée', 'personnalisation',
    count(*) filter (where o.brand_color is distinct from '#1F3D3A'),
    count(*) filter (where o.brand_color is distinct from '#1F3D3A'),
    v_orgs_total,
    null::bigint
  from orgs o
  order by orgs_using desc, total_count desc;
end;
$$;

-- revoke from public (not just anon) — Postgres grants EXECUTE to PUBLIC by
-- default at CREATE FUNCTION time, and anon inherits that unless revoked at
-- the PUBLIC level itself.
revoke execute on function public.admin_feature_usage_overview() from public;
grant execute on function public.admin_feature_usage_overview() to authenticated;
