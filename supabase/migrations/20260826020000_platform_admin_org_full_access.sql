-- Bastien tests Cantia from his own real account/org (Cantia.ch), not a
-- throwaway test tenant — that org must never hit a plan limit, a trial
-- expiry, or a missing private module while he's developing against it.
--
-- 1) Any org with a platform_admin member is upgraded to the top real plan
--    ('illimite' / "Sur mesure": every has_* flag true, unlimited quotas)
--    with an active subscription and no trial_ends_at — this specifically
--    takes it OFF plan_id='decouverte', which is what the hourly
--    downgrade_expired_trials() cron (see 20260821150000) would otherwise
--    silently demote to 'free' once trial_ends_at passes.
-- 2) Kept true going forward via two small triggers: promoting someone to
--    platform_admin upgrades every org they're already in; adding a
--    platform_admin to a (possibly brand new) org upgrades that org too.
-- 3) Every private/custom module registered through admin_upsert_module is
--    now auto-granted to platform-admin orgs — the registry a super admin
--    builds is also the sandbox they test it in, with no separate manual
--    toggle step.

create or replace function public.sync_platform_admin_org_access(target_org_id uuid)
returns void
language sql security definer set search_path = public
as $$
  update public.organizations o
  set plan_id = 'illimite', subscription_status = 'active', trial_ends_at = null
  where o.id = target_org_id
    and exists (
      select 1 from public.organization_members m
      join public.platform_admins pa on pa.user_id = m.user_id
      where m.organization_id = target_org_id
    );
$$;

-- Backfill: upgrade every org that already has a platform admin as a member.
do $$
declare
  org record;
begin
  for org in
    select distinct m.organization_id as id
    from public.organization_members m
    join public.platform_admins pa on pa.user_id = m.user_id
  loop
    perform public.sync_platform_admin_org_access(org.id);
  end loop;
end $$;

create or replace function public.on_org_member_added_upgrade_if_platform_admin()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if exists (select 1 from public.platform_admins where user_id = new.user_id) then
    perform public.sync_platform_admin_org_access(new.organization_id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_org_member_added_upgrade_platform_admin on public.organization_members;
create trigger trg_org_member_added_upgrade_platform_admin
  after insert on public.organization_members
  for each row execute function public.on_org_member_added_upgrade_if_platform_admin();

create or replace function public.on_platform_admin_added_upgrade_orgs()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  update public.organizations o
  set plan_id = 'illimite', subscription_status = 'active', trial_ends_at = null
  where o.id in (select organization_id from public.organization_members where user_id = new.user_id);
  return new;
end;
$$;

drop trigger if exists trg_platform_admin_added_upgrade_orgs on public.platform_admins;
create trigger trg_platform_admin_added_upgrade_orgs
  after insert on public.platform_admins
  for each row execute function public.on_platform_admin_added_upgrade_orgs();

-- admin_upsert_module: auto-grant every registered module to platform-admin
-- orgs on creation/update, so bastien never has to remember a manual toggle
-- to see what he just built. Existing manual grants/revokes for other orgs
-- are untouched — this only ever inserts, never overrides an existing row.
create or replace function public.admin_upsert_module(
  module_key text, module_name text, module_description text default null,
  module_category text default null, module_visibility text default 'private',
  module_status text default 'active'
)
returns modules
language plpgsql security definer set search_path = public
as $$
declare
  result public.modules;
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  insert into public.modules (key, name, description, category, visibility, status)
  values (module_key, module_name, module_description, module_category, module_visibility, module_status)
  on conflict (key) do update set
    name = excluded.name, description = excluded.description, category = excluded.category,
    visibility = excluded.visibility, status = excluded.status, updated_at = now()
  returning * into result;

  insert into public.admin_audit_logs (admin_user_id, action, module_id, metadata)
  values (auth.uid(), 'module_registered', result.id, jsonb_build_object('module_key', module_key, 'module_name', module_name));

  insert into public.organization_modules (organization_id, module_id, enabled)
  select distinct m.organization_id, result.id, true
  from public.organization_members m
  join public.platform_admins pa on pa.user_id = m.user_id
  on conflict (organization_id, module_id) do nothing;

  return result;
end;
$$;

revoke execute on function public.admin_upsert_module(text, text, text, text, text, text) from anon;
notify pgrst, 'reload schema';
