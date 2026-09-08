-- Support ask: a clean CSV export of the Entreprises list (name + address,
-- to target specific segments — incomplete signups, trials, etc. — for
-- outreach) needs the org's own contact/address fields, which
-- admin_list_organizations never exposed (only owner_email, the login
-- identity, was available). Adds street/postal_code/locality/email/phone
-- straight from organizations — same "drop first" requirement as the
-- previous column addition, since the return shape is changing again.
drop function if exists public.admin_list_organizations(text, int, int);

create function public.admin_list_organizations(search text default null, limit_n int default 50, offset_n int default 0)
returns table(
  id uuid, name text, plan_id text, plan_name text, subscription_status text,
  trial_ends_at timestamptz, plan_selected boolean, created_at timestamptz,
  member_count bigint, owner_email text, private_modules_count bigint,
  is_internal boolean, internal_label text, is_complimentary boolean,
  street text, postal_code text, locality text, email text, phone text,
  total_count bigint
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
    o.is_internal, o.internal_label, o.is_complimentary,
    o.street, o.postal_code, o.locality, o.email, o.phone,
    count(*) over ()
  from public.organizations o
  left join public.plans p on p.id = o.plan_id
  where search is null or search = '' or o.name ilike '%' || search || '%'
  order by o.is_internal asc, o.created_at desc
  limit limit_n offset offset_n;
end;
$$;

revoke execute on function public.admin_list_organizations(text, int, int) from anon;
