-- Lets a user who submitted a join request see which company it targets,
-- even though they aren't a member yet and can't read `organizations`
-- directly under RLS.
create or replace function public.get_my_join_request()
returns table(
  id uuid,
  organization_id uuid,
  organization_name text,
  status text,
  requested_at timestamptz
)
language sql security definer stable set search_path = public as $$
  select r.id, r.organization_id, o.name, r.status, r.requested_at
  from public.organization_join_requests r
  join public.organizations o on o.id = r.organization_id
  where r.user_id = auth.uid() and r.status = 'pending'
  limit 1;
$$;

grant execute on function public.get_my_join_request() to authenticated;
