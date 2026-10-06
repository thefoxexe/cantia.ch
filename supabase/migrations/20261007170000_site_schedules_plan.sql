-- Planning de chantier: from the Équipe plan up (Équipe, Entreprise, Sur
-- mesure), and only for building companies. Data made on a higher plan stays
-- readable after a downgrade; writing needs the plan again.
alter table public.plans add column if not exists has_site_schedule boolean not null default false;
update public.plans set has_site_schedule = true where id in ('equipe', 'pro', 'illimite', 'custom', 'custom-besson');

create or replace function public.org_has_site_schedule(org_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select coalesce((
    select p.has_site_schedule from public.organizations o join public.plans p on p.id = o.plan_id where o.id = org_id
  ), false) and public.org_fills_soumissions(org_id);
$$;
grant execute on function public.org_has_site_schedule(uuid) to authenticated;

create or replace function public.can_edit_schedule(s_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.site_schedules s
    where s.id = s_id and public.is_org_member(s.organization_id) and public.has_project_access(s.project_id)
      and public.org_has_site_schedule(s.organization_id)
  );
$$;

alter policy "schedule: create" on public.site_schedules with check (
  public.is_org_member(organization_id) and public.has_project_access(project_id) and public.org_has_site_schedule(organization_id)
  and organization_id = (select p.organization_id from public.projects p where p.id = project_id)
);
alter policy "schedule trades: add" on public.schedule_trades with check (public.is_org_member(organization_id) and public.org_has_site_schedule(organization_id));
