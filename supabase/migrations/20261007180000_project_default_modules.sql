-- Site tools as chantier modules. Building companies get « Remplir une
-- soumission » (metre) and « Planning de chantier » (gantt) on every chantier
-- by default; each chantier can switch them off in its settings. The company
-- keeps the tools new chantiers start with (sign-up, Paramètres › Modules).

alter table public.organizations add column if not exists default_project_modules text[];
grant update (default_project_modules) on public.organizations to authenticated;

-- existing building companies: both tools on, everywhere
update public.projects p
set enabled_modules = (select array(select distinct x from unnest(coalesce(p.enabled_modules, '{}') || array['metre', 'gantt']) as x))
where public.org_fills_soumissions(p.organization_id)
  and not (coalesce(p.enabled_modules, '{}') @> array['metre', 'gantt']);

update public.organizations o
set default_project_modules = array['documents', 'photos', 'metre', 'gantt']
where o.default_project_modules is null and public.org_fills_soumissions(o.id);
