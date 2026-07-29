-- Admin-facing listing of pending join requests, including the requester's
-- name/email pulled from auth.users (which RLS on organization_join_requests
-- alone can't expose, since the requester isn't an org member yet).
create or replace function public.list_join_requests_for_org(org_id uuid)
returns table(
  id uuid,
  user_id uuid,
  requester_name text,
  requester_email text,
  requested_at timestamptz
)
language sql security definer stable set search_path = public as $$
  select
    r.id,
    r.user_id,
    coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), u.email, '') as requester_name,
    u.email as requester_email,
    r.requested_at
  from public.organization_join_requests r
  join auth.users u on u.id = r.user_id
  where r.organization_id = org_id
    and r.status = 'pending'
    and public.is_org_admin(org_id)
  order by r.requested_at asc;
$$;

grant execute on function public.list_join_requests_for_org(uuid) to authenticated;
