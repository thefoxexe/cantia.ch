-- « Remplir une soumission » (beta): one soumission to try on the Essentiel
-- plan, once for the life of the company (not per month). Équipe keeps 3 a
-- month, Entreprise and custom plans stay unlimited. A plan sets either
-- max_tenders_total (lifetime) or max_tenders_per_month; both null means
-- unlimited.

alter table public.plans add column if not exists max_tenders_total integer;

update public.plans set has_tenders = true, max_tenders_per_month = null, max_tenders_total = 1 where id = 'solo';

create or replace function public.org_tenders_used(p_org uuid, p_total boolean)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
    from public.tender_import_jobs j
   where j.organization_id = p_org
     and j.status <> 'failed'
     and (p_total or j.created_at >= (date_trunc('month', now() at time zone 'Europe/Zurich') at time zone 'Europe/Zurich'));
$$;
revoke execute on function public.org_tenders_used(uuid, boolean) from public, anon, authenticated;

create or replace function public.org_tender_quota(p_org uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'allowed', public.org_has_tenders(p_org),
    'limit', coalesce(p.max_tenders_total, p.max_tenders_per_month),
    'period', case when p.max_tenders_total is not null then 'total' else 'month' end,
    'used', public.org_tenders_used(p_org, p.max_tenders_total is not null)
  )
  from public.organizations o
  left join public.plans p on p.id = o.plan_id
  where o.id = p_org
    and (public.is_org_member(p_org) or public.is_platform_admin());
$$;
revoke execute on function public.org_tender_quota(uuid) from public, anon;
grant execute on function public.org_tender_quota(uuid) to authenticated;

create or replace function public.org_can_import_tender(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.org_has_tenders(p_org) and coalesce((
    select case
      when p.max_tenders_total is not null then public.org_tenders_used(p_org, true) < p.max_tenders_total
      when p.max_tenders_per_month is not null then public.org_tenders_used(p_org, false) < p.max_tenders_per_month
      else true
    end
    from public.organizations o
    join public.plans p on p.id = o.plan_id
    where o.id = p_org
  ), false);
$$;
revoke execute on function public.org_can_import_tender(uuid) from public, anon;
grant execute on function public.org_can_import_tender(uuid) to authenticated;
