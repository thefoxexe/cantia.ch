-- The original migration only did `revoke all ... from public` before
-- granting to `authenticated` — that revokes the PUBLIC pseudo-role's own
-- grant, but Supabase projects have a standing `alter default privileges
-- in schema public grant execute on functions to anon, authenticated`
-- rule that fires independently at CREATE FUNCTION time. Every admin_* RPC
-- (and is_platform_admin itself) ended up executable by anon as a result —
-- anon calls would still fail their internal is_platform_admin() check,
-- but there's no reason to leave the surface open. Revoke explicitly.
revoke execute on function public.is_platform_admin() from anon;
revoke execute on function public.admin_dashboard_stats() from anon;
revoke execute on function public.admin_list_organizations(text, int, int) from anon;
revoke execute on function public.admin_get_organization_detail(uuid) from anon;
revoke execute on function public.admin_set_organization_module(uuid, text, boolean) from anon;
revoke execute on function public.admin_upsert_module(text, text, text, text, text, text) from anon;
revoke execute on function public.admin_list_modules() from anon;
revoke execute on function public.admin_list_users(text, int, int) from anon;
revoke execute on function public.admin_list_audit_logs(int, int) from anon;
