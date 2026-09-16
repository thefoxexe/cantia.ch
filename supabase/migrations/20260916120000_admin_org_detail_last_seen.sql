-- admin_get_organization_detail() surfaced auth.users.last_sign_in_at as
-- "last used the app", but that column only moves on a fresh authentication
-- event (password/magic-link/OAuth login) — it does NOT move on the silent
-- token refreshes that keep a session alive across days of real usage. A
-- member who opens the app daily without ever fully logging out again shows
-- the same stale timestamp from their very first login. organization_members
-- .last_seen_at (touch_presence(), bumped every ~60s while the app is
-- foregrounded — see 20260807120000_member_presence.sql) is the actual
-- "were they in the app recently" signal, so it's added here alongside
-- last_sign_in_at rather than replacing it (the two answer different
-- questions: "last login" vs "last seen using it").
create or replace function public.admin_get_organization_detail(org_id uuid)
returns jsonb
language plpgsql security definer stable set search_path = public as $$
declare
  result jsonb;
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  select jsonb_build_object(
    'organization', to_jsonb(o) || jsonb_build_object('plan_name', p.name),
    'members', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'user_id', m.user_id,
        'full_name', m.full_name,
        'email', u.email,
        'role', m.role,
        'last_sign_in_at', u.last_sign_in_at,
        'last_seen_at', m.last_seen_at,
        'created_at', m.created_at
      ) order by m.created_at asc), '[]'::jsonb)
      from public.organization_members m
      join auth.users u on u.id = m.user_id
      where m.organization_id = o.id
    ),
    'standard_modules', to_jsonb(o.enabled_modules),
    'private_modules', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'module_id', mod.id,
        'key', mod.key,
        'name', mod.name,
        'description', mod.description,
        'visibility', mod.visibility,
        'status', mod.status,
        'enabled', om.enabled
      ) order by mod.name asc), '[]'::jsonb)
      from public.organization_modules om
      join public.modules mod on mod.id = om.module_id
      where om.organization_id = o.id
    )
  ) into result
  from public.organizations o
  left join public.plans p on p.id = o.plan_id
  where o.id = org_id;

  if result is null then
    raise exception 'organization not found';
  end if;

  return result;
end;
$$;

notify pgrst, 'reload schema';
