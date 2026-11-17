-- « Soumissions illimitées » : un module que le Super Admin accorde à une
-- entreprise, quel que soit son plan. Avec lui, « Remplir une soumission »
-- est ouvert sans limite, même en Essentiel (1 à l'essai sinon).
-- Le plan et la facturation ne changent pas : l'entreprise reste en
-- Essentiel, CHF 39.–.
--
-- Comme tout module privé (lib/modules.ts), il agit quand il est accordé
-- (organization_modules.enabled) et activé (organization_modules.activated).
-- Super Admin › Modules permet de le retirer plus tard.
--
-- Accordé et activé ici pour Denn Morina SARL, dont l'essai avec soumissions
-- illimitées a pris fin le 17 novembre 2026
-- (voir 20261104090000_morina_trial_unlimited_tenders.sql).

insert into public.modules (key, name, description, category, visibility, status)
values (
  'soumissions-illimitees',
  'Soumissions illimitées',
  'Remplir une soumission sans limite, quel que soit le plan de l’entreprise.',
  'plan',
  'private',
  'active'
)
on conflict (key) do nothing;

-- True when the module is granted and switched on for this company.
create or replace function public.org_has_unlimited_tenders(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.organization_modules om
      join public.modules mo on mo.id = om.module_id
     where om.organization_id = p_org
       and mo.key = 'soumissions-illimitees'
       and mo.status <> 'disabled'
       and om.enabled
       and om.activated
  );
$$;
revoke execute on function public.org_has_unlimited_tenders(uuid) from public, anon;
grant execute on function public.org_has_unlimited_tenders(uuid) to authenticated;

-- Every gate of the module (RLS, import, edge functions) goes through this:
-- the plan, or the module.
create or replace function public.org_has_tenders(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select (
    coalesce((
      select p.has_tenders from public.organizations o join public.plans p on p.id = o.plan_id where o.id = org_id
    ), false)
    or public.org_has_unlimited_tenders(org_id)
  ) and public.org_fills_soumissions(org_id);
$$;
grant execute on function public.org_has_tenders(uuid) to authenticated;

create or replace function public.org_tender_quota(p_org uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select case
    when public.org_has_unlimited_tenders(p_org) then jsonb_build_object(
      'allowed', public.org_has_tenders(p_org),
      'limit', null,
      'period', 'month',
      'used', public.org_tenders_used(p_org, false)
    )
    else jsonb_build_object(
      'allowed', public.org_has_tenders(p_org),
      'limit', coalesce(p.max_tenders_total, p.max_tenders_per_month),
      'period', case when p.max_tenders_total is not null then 'total' else 'month' end,
      'used', public.org_tenders_used(p_org, p.max_tenders_total is not null)
    )
  end
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
  select public.org_has_tenders(p_org) and (
    public.org_has_unlimited_tenders(p_org)
    or coalesce((
      select case
        when p.max_tenders_total is not null then public.org_tenders_used(p_org, true) < p.max_tenders_total
        when p.max_tenders_per_month is not null then public.org_tenders_used(p_org, false) < p.max_tenders_per_month
        else true
      end
      from public.organizations o
      join public.plans p on p.id = o.plan_id
      where o.id = p_org
    ), false)
  );
$$;
revoke execute on function public.org_can_import_tender(uuid) from public, anon;
grant execute on function public.org_can_import_tender(uuid) to authenticated;

-- Denn Morina SARL: granted and switched on.
insert into public.organization_modules (organization_id, module_id, enabled, activated)
select '8e5fd900-7463-4525-8d85-42f4ebe9c514', mo.id, true, true
  from public.modules mo
 where mo.key = 'soumissions-illimitees'
   and exists (select 1 from public.organizations where id = '8e5fd900-7463-4525-8d85-42f4ebe9c514')
on conflict (organization_id, module_id) do update set enabled = true, activated = true, updated_at = now();

notify pgrst, 'reload schema';
