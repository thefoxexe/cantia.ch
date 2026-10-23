-- « Remplir une soumission » (beta): from the Équipe plan, 3 soumissions a
-- month; unlimited on Entreprise and custom plans. A soumission is one PDF
-- import (tender_import_jobs), counted per company and calendar month
-- (Zurich time); failed imports don't count.

alter table public.plans add column if not exists max_tenders_per_month integer;

update public.plans set has_tenders = false where id in ('free', 'solo');
update public.plans set has_tenders = true, max_tenders_per_month = 3 where id in ('equipe', 'decouverte');
update public.plans set has_tenders = true, max_tenders_per_month = null where id in ('pro', 'illimite', 'custom');

create or replace function public.org_tender_quota(p_org uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'allowed', public.org_has_tenders(p_org),
    'limit', p.max_tenders_per_month,
    'used', (
      select count(*)
        from public.tender_import_jobs j
       where j.organization_id = p_org
         and j.status <> 'failed'
         and j.created_at >= (date_trunc('month', now() at time zone 'Europe/Zurich') at time zone 'Europe/Zurich')
    )
  )
  from public.organizations o
  left join public.plans p on p.id = o.plan_id
  where o.id = p_org
    and (public.is_org_member(p_org) or public.is_platform_admin());
$$;
revoke execute on function public.org_tender_quota(uuid) from public, anon;
grant execute on function public.org_tender_quota(uuid) to authenticated;

-- Used by the insert policy: plan allows it and the month's quota isn't used up.
create or replace function public.org_can_import_tender(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.org_has_tenders(p_org) and coalesce((
    select p.max_tenders_per_month is null or (
      select count(*)
        from public.tender_import_jobs j
       where j.organization_id = p_org
         and j.status <> 'failed'
         and j.created_at >= (date_trunc('month', now() at time zone 'Europe/Zurich') at time zone 'Europe/Zurich')
    ) < p.max_tenders_per_month
    from public.organizations o
    join public.plans p on p.id = o.plan_id
    where o.id = p_org
  ), false);
$$;
revoke execute on function public.org_can_import_tender(uuid) from public, anon;
grant execute on function public.org_can_import_tender(uuid) to authenticated;

alter policy "import job creators" on public.tender_import_jobs
  with check (is_org_member(organization_id) and has_project_access(project_id) and can_view_org_metre(organization_id) and org_can_import_tender(organization_id));
