-- Security audit fix: both compte/modules.tsx (org-wide modules: planning,
-- payroll, treasury) and chantiers/[id]/settings.tsx (per-project module:
-- profitability) only check the org's plan client-side before letting an
-- admin flip a switch — the actual write (`update({enabled_modules: ...})`)
-- has no server-side check at all, so a direct API call can enable a
-- plan-gated module regardless of the organization's actual plan.
--
-- Rather than reject the write outright (which would need new client-side
-- error handling for a case that should never legitimately happen), these
-- triggers silently strip any module the org's plan doesn't grant — a
-- bypass attempt becomes a no-op instead of privilege escalation, and
-- legitimate toggles (already pre-filtered by the UI) are unaffected.

create or replace function public.enforce_org_module_plan_gate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan public.plans%rowtype;
begin
  select * into v_plan from public.plans where id = new.plan_id;
  if not found then
    return new;
  end if;
  if not coalesce(v_plan.has_planning, true) then
    new.enabled_modules := array_remove(new.enabled_modules, 'planning');
  end if;
  if not coalesce(v_plan.has_payroll, false) then
    new.enabled_modules := array_remove(new.enabled_modules, 'payroll');
  end if;
  if not coalesce(v_plan.has_treasury, false) then
    new.enabled_modules := array_remove(new.enabled_modules, 'treasury');
  end if;
  return new;
end;
$$;

drop trigger if exists organizations_enforce_module_plan_gate on public.organizations;
create trigger organizations_enforce_module_plan_gate
  before insert or update of enabled_modules, plan_id on public.organizations
  for each row execute function public.enforce_org_module_plan_gate();

create or replace function public.enforce_project_module_plan_gate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_has_profitability boolean;
begin
  select p.has_profitability into v_has_profitability
  from public.organizations o
  join public.plans p on p.id = o.plan_id
  where o.id = new.organization_id;

  if not coalesce(v_has_profitability, false) then
    new.enabled_modules := array_remove(new.enabled_modules, 'profitability');
  end if;
  return new;
end;
$$;

drop trigger if exists projects_enforce_module_plan_gate on public.projects;
create trigger projects_enforce_module_plan_gate
  before insert or update of enabled_modules on public.projects
  for each row execute function public.enforce_project_module_plan_gate();

-- Apply the gate retroactively so an org already sitting on a bypassed
-- module (from before this fix) doesn't keep silent access to it.
update public.organizations set enabled_modules = enabled_modules where true;
update public.projects set enabled_modules = enabled_modules where true;
