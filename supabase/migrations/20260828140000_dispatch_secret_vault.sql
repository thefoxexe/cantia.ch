-- Security audit fix: the shared dispatch secret was hardcoded as a
-- plaintext literal in this trigger function (and, separately, in each of
-- bexio-cron-sync, dispatch-notification, send-prospect-email and
-- list-resend-contacts) — permanently visible in git history to anyone with
-- repo read access, and impossible to rotate without a code deploy.
--
-- This moves the value this Postgres trigger sends out of the function body
-- and into Supabase Vault, read by name at call time. The corresponding
-- edge functions now read the same value from the DISPATCH_SECRET
-- environment variable instead of a literal — see their diffs.
--
-- This migration only wires up the *mechanism*; it does not — and must
-- not — contain the actual secret value (that would just recreate the same
-- problem in a new file). A fresh secret still needs to be:
--   1. set as the `DISPATCH_SECRET` env var for the four edge functions
--      above (Supabase dashboard → Edge Functions → Secrets, or
--      `supabase secrets set DISPATCH_SECRET=...`), and
--   2. stored under the same value via:
--        select public.vault_upsert_secret('dispatch_secret', '<value>');
--      run once, directly, outside of any migration file.
-- Until step 2 is done this trigger sends an empty secret and every
-- dispatch-notification call will 401 — safe-by-default over silently
-- insecure.

-- vault_upsert_secret had no explicit grants (default PUBLIC execute),
-- letting any authenticated user overwrite a secret if they knew its name —
-- tighten it to match its sibling helpers (vault_create_secret etc.), which
-- are already service_role-only.
revoke execute on function public.vault_upsert_secret(text, text) from public, anon, authenticated;
grant execute on function public.vault_upsert_secret(text, text) to service_role;

-- Same secret, second hardcoded copy: the pg_cron job driving
-- bexio-cron-sync embedded the literal value directly in its scheduled SQL
-- command. Repoint it at the same vault entry instead.
select cron.alter_job(
  job_id := jobid,
  command := $cmd$
    select net.http_post(
      url := 'https://krijilwxhdlzflvnvrtl.supabase.co/functions/v1/bexio-cron-sync',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'X-Dispatch-Secret', coalesce((select decrypted_secret from vault.decrypted_secrets where name = 'dispatch_secret'), '')
      ),
      body := '{}'::jsonb
    );
  $cmd$
)
from cron.job
where jobname = 'bexio-cron-sync';

create or replace function public.dispatch_notification_http()
returns trigger
language plpgsql security definer set search_path = public, vault as $$
declare
  v_secret text;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'dispatch_secret';
  perform net.http_post(
    url := 'https://krijilwxhdlzflvnvrtl.supabase.co/functions/v1/dispatch-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Dispatch-Secret', coalesce(v_secret, '')
    ),
    body := jsonb_build_object('notification_id', new.id)
  );
  return new;
end;
$$;
