-- Two-tier private module access: a platform admin makes a module
-- AVAILABLE to an org (organization_modules.enabled, unchanged — set via
-- admin_set_organization_module), but the org's own admin decides whether
-- their team actually ACTIVATES it. Without this, "enabled" meant both
-- "granted" and "on" at once, so the company never got a say — and the
-- admin panel's "Nouveau module" button implied self-service module
-- *creation*, which is misleading since a registry row with no matching
-- feature code does nothing. Module creation stays a Claude/dev-session
-- action (admin_upsert_module, called directly via migration/SQL when a
-- real feature is built) — the client-facing "create" button is removed.
alter table public.organization_modules add column if not exists activated boolean not null default false;

create or replace function public.list_my_private_modules()
returns table(key text, name text, description text, visibility text, activated boolean)
language sql stable security definer set search_path = public
as $$
  select mo.key, mo.name, mo.description, mo.visibility, om.activated
  from public.organization_modules om
  join public.modules mo on mo.id = om.module_id
  join public.organization_members m on m.organization_id = om.organization_id
  where m.user_id = auth.uid() and om.enabled = true and mo.visibility != 'standard'
  order by mo.name asc;
$$;

create or replace function public.toggle_organization_module_activation(module_key text, activated boolean)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  target_org_id uuid;
  target_module_id uuid;
begin
  select m.organization_id into target_org_id
  from public.organization_members m
  where m.user_id = auth.uid()
  limit 1;

  if target_org_id is null or not public.is_org_admin(target_org_id) then
    raise exception 'access denied: not an admin of your organization';
  end if;

  select id into target_module_id from public.modules where key = module_key;
  if target_module_id is null then
    raise exception 'unknown module key: %', module_key;
  end if;

  update public.organization_modules
  set activated = toggle_organization_module_activation.activated, updated_at = now()
  where organization_id = target_org_id and module_id = target_module_id and enabled = true;

  if not found then
    raise exception 'module not available for your organization';
  end if;
end;
$$;

revoke execute on function public.list_my_private_modules() from anon;
revoke execute on function public.toggle_organization_module_activation(text, boolean) from anon;
notify pgrst, 'reload schema';
