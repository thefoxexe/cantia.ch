-- The advisor flagged initiate/cancel/confirm_ownership_transfer as
-- callable by anon — PostgreSQL grants EXECUTE to PUBLIC by default on a
-- new function, and `grant ... to authenticated` alone doesn't remove
-- that. Each function already no-ops safely for an unauthenticated caller
-- (auth.uid() is null, every check fails), but there's no reason to leave
-- the anon path reachable at all for an owner-only/member-only action.
revoke execute on function public.initiate_ownership_transfer(uuid) from public;
revoke execute on function public.cancel_ownership_transfer(uuid) from public;
revoke execute on function public.confirm_ownership_transfer(text) from public;

grant execute on function public.initiate_ownership_transfer(uuid) to authenticated;
grant execute on function public.cancel_ownership_transfer(uuid) to authenticated;
grant execute on function public.confirm_ownership_transfer(text) to authenticated;

-- Supabase's default privileges also grant EXECUTE on every new
-- public-schema function to anon/authenticated/service_role directly (a
-- separate, explicit grant — not just inherited via PUBLIC), so the
-- revoke-from-PUBLIC above alone leaves anon still able to call these.
revoke execute on function public.initiate_ownership_transfer(uuid) from anon;
revoke execute on function public.cancel_ownership_transfer(uuid) from anon;
revoke execute on function public.confirm_ownership_transfer(text) from anon;
