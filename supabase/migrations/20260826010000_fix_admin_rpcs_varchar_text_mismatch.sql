-- auth.users.email is varchar(255); RETURN QUERY requires an exact type match
-- against the declared `text` output column (not just assignability), so every
-- real call to these three RPCs raised 42804 and was silently swallowed by the
-- client as "no rows" — the actual cause of the empty Entreprises/Utilisateurs
-- admin screens. Cast explicitly to text everywhere auth.users.email is selected.

create or replace function public.admin_list_organizations(search text default null, limit_n int default 50, offset_n int default 0)
returns table(
  id uuid, name text, plan_id text, plan_name text, subscription_status text,
  trial_ends_at timestamptz, plan_selected boolean, created_at timestamptz,
  member_count bigint, owner_email text, private_modules_count bigint, total_count bigint
)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  return query
  select
    o.id, o.name, o.plan_id, p.name, o.subscription_status, o.trial_ends_at,
    o.plan_selected, o.created_at,
    (select count(*) from public.organization_members m where m.organization_id = o.id),
    (select u.email::text from public.organization_members m join auth.users u on u.id = m.user_id
       where m.organization_id = o.id and m.role = 'owner' order by m.created_at asc limit 1),
    (select count(*) from public.organization_modules om where om.organization_id = o.id and om.enabled),
    count(*) over ()
  from public.organizations o
  join public.plans p on p.id = o.plan_id
  where search is null or search = '' or o.name ilike '%' || search || '%'
  order by o.created_at desc
  limit limit_n offset offset_n;
end;
$$;

create or replace function public.admin_list_users(search text default null, limit_n int default 50, offset_n int default 0)
returns table(
  user_id uuid, email text, full_name text, organization_id uuid, organization_name text,
  role org_role, created_at timestamptz, last_sign_in_at timestamptz, total_count bigint
)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  return query
  select
    u.id, u.email::text, m.full_name, o.id, o.name, m.role, u.created_at, u.last_sign_in_at,
    count(*) over ()
  from auth.users u
  join public.organization_members m on m.user_id = u.id
  join public.organizations o on o.id = m.organization_id
  where search is null or search = '' or u.email ilike '%' || search || '%' or m.full_name ilike '%' || search || '%'
  order by u.created_at desc
  limit limit_n offset offset_n;
end;
$$;

create or replace function public.admin_list_audit_logs(limit_n int default 50, offset_n int default 0)
returns table(
  id uuid, admin_email text, action text, organization_name text, module_name text,
  metadata jsonb, created_at timestamptz, total_count bigint
)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  return query
  select
    l.id, u.email::text, l.action, o.name, mo.name, l.metadata, l.created_at,
    count(*) over ()
  from public.admin_audit_logs l
  left join auth.users u on u.id = l.admin_user_id
  left join public.organizations o on o.id = l.organization_id
  left join public.modules mo on mo.id = l.module_id
  order by l.created_at desc
  limit limit_n offset offset_n;
end;
$$;

revoke execute on function public.admin_list_organizations(text, int, int) from anon;
revoke execute on function public.admin_list_users(text, int, int) from anon;
revoke execute on function public.admin_list_audit_logs(int, int) from anon;
notify pgrst, 'reload schema';
