-- Database check of the health endpoint (supabase/functions/health): the
-- lightest possible round trip through PostgREST to Postgres. Callable by
-- the service role only.
create or replace function public.health_ping()
returns integer
language sql
stable
set search_path = public
as $$ select 1 $$;

revoke all on function public.health_ping() from public, anon, authenticated;
grant execute on function public.health_ping() to service_role;
