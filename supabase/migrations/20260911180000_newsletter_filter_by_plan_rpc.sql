-- Powers the newsletter composer's quick-add filters ("+ Plan Essentiel",
-- "+ Abonnés", "+ Non-abonnés") — returns every matching user_id in one
-- shot (unpaginated, unlike admin_list_users) so a filter button can add
-- potentially hundreds of ids to the client's selection in a single call.
create or replace function public.admin_filter_user_ids(p_plan_ids text[] default null, p_subscribed boolean default null)
returns table(user_id uuid)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  return query
  select distinct m.user_id
  from public.organization_members m
  join public.organizations o on o.id = m.organization_id
  left join public.newsletter_subscriptions ns on ns.user_id = m.user_id
  where (p_plan_ids is null or o.plan_id = any(p_plan_ids))
    and (p_subscribed is null or coalesce(ns.subscribed, true) = p_subscribed);
end;
$$;

revoke all on function public.admin_filter_user_ids(text[], boolean) from public;
revoke execute on function public.admin_filter_user_ids(text[], boolean) from anon;
grant execute on function public.admin_filter_user_ids(text[], boolean) to authenticated;

-- Also surface plan_id on admin_list_users so the manual-search rows can
-- show which plan a user's organization is on. Return shape changed
-- (new plan_id column), so the old signature must be dropped first.
drop function if exists public.admin_list_users(text, int, int);

create function public.admin_list_users(search text default null, limit_n int default 50, offset_n int default 0)
returns table(
  user_id uuid, email text, full_name text, organization_id uuid, organization_name text,
  role org_role, plan_id text, created_at timestamptz, last_sign_in_at timestamptz, total_count bigint
)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  return query
  select
    u.id, u.email::text, m.full_name, o.id, o.name, m.role, o.plan_id, u.created_at, u.last_sign_in_at,
    count(*) over ()
  from auth.users u
  join public.organization_members m on m.user_id = u.id
  join public.organizations o on o.id = m.organization_id
  where search is null or search = '' or u.email ilike '%' || search || '%' or m.full_name ilike '%' || search || '%'
  order by u.created_at desc
  limit limit_n offset offset_n;
end;
$$;

revoke all on function public.admin_list_users(text, int, int) from public;
revoke execute on function public.admin_list_users(text, int, int) from anon;
grant execute on function public.admin_list_users(text, int, int) to authenticated;
notify pgrst, 'reload schema';
