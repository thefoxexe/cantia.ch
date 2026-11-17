-- Super Admin › Modules: a module opens on the list of the companies it is
-- assigned to, where companies are added or removed; the company's own page
-- keeps its switches. Both go through admin_set_organization_module.
--
-- Assigning a module now switches it on as well (activated), so it works at
-- once without the company's admin having to turn it on in Compte › Modules;
-- removing it switches it off. The company's admin can still turn it off.

create or replace function public.admin_set_organization_module(org_id uuid, module_key text, enabled boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_module_id uuid;
  target_module_name text;
  target_org_name text;
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  select id, name into target_module_id, target_module_name from public.modules where key = module_key;
  if target_module_id is null then
    raise exception 'unknown module key: %', module_key;
  end if;

  select name into target_org_name from public.organizations where id = org_id;
  if target_org_name is null then
    raise exception 'organization not found';
  end if;

  insert into public.organization_modules (organization_id, module_id, enabled, activated)
  values (org_id, target_module_id, enabled, enabled)
  on conflict (organization_id, module_id)
  do update set enabled = excluded.enabled, activated = excluded.activated, updated_at = now();

  insert into public.admin_audit_logs (admin_user_id, action, organization_id, module_id, metadata)
  values (
    auth.uid(),
    case when enabled then 'module_enabled' else 'module_disabled' end,
    org_id,
    target_module_id,
    jsonb_build_object('module_key', module_key, 'module_name', target_module_name, 'organization_name', target_org_name)
  );
end;
$$;
revoke execute on function public.admin_set_organization_module(uuid, text, boolean) from public, anon;
grant execute on function public.admin_set_organization_module(uuid, text, boolean) to authenticated;

-- The companies a module is assigned to.
create or replace function public.admin_module_organizations(p_module_key text)
returns table (
  organization_id uuid,
  name text,
  plan_id text,
  subscription_status text,
  activated boolean,
  assigned_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;
  return query
  select o.id, o.name, o.plan_id, o.subscription_status, om.activated, om.updated_at
    from public.organization_modules om
    join public.modules mo on mo.id = om.module_id
    join public.organizations o on o.id = om.organization_id
   where mo.key = p_module_key
     and om.enabled
   order by o.name;
end;
$$;
revoke execute on function public.admin_module_organizations(text) from public, anon;
grant execute on function public.admin_module_organizations(text) to authenticated;

notify pgrst, 'reload schema';
