-- downgrade_expired_trials() was callable by anon/authenticated via
-- /rest/v1/rpc/downgrade_expired_trials (advisor-flagged, pre-existing gap
-- predating this migration) — harmless on its own since it only ever
-- touches orgs whose trial has genuinely already expired, but now that it
-- also dispatches the trial-ended e-mail via pg_net, it's tightened to
-- pg_cron-only like the rest of this file's internal-only functions.
revoke execute on function public.downgrade_expired_trials() from public;
revoke execute on function public.downgrade_expired_trials() from anon;
revoke execute on function public.downgrade_expired_trials() from authenticated;
