-- The single-composite return type above yields an all-NULL row (not a
-- genuine empty result) when no code matches, which PostgREST serializes as
-- a non-null object with every field null — truthy on the client, so a
-- wrong code would have looked like a match. setof + LIMIT 1 makes "no
-- match" an actual empty result set instead, which .maybeSingle() turns
-- into a real null client-side.
drop function public.redeem_plan_code(text);

create function public.redeem_plan_code(p_code text)
returns setof public.plans
language plpgsql security definer stable set search_path = public as $$
begin
  return query
  select p.*
  from public.plan_access_codes c
  join public.plans p on p.id = c.plan_id
  where lower(c.code) = lower(trim(p_code))
  limit 1;
end;
$$;

revoke all on function public.redeem_plan_code(text) from public;
grant execute on function public.redeem_plan_code(text) to authenticated;
