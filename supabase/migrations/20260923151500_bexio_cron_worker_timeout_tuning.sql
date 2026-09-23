-- Follow-up to 20260923150000_bexio_cron_dispatcher_timeout.sql: that
-- migration raised net.http_post's timeout from the 5s default to 120s,
-- but a real manual trigger afterwards showed the dispatcher itself can
-- legitimately take close to Supabase's own 150s request idle-timeout to
-- finish waiting on its slowest per-org worker call (see
-- bexio-cron-sync/index.ts's WORKER_TIMEOUT_MS, now 130s to leave the
-- dispatcher itself room to respond inside its own 150s ceiling). Raise
-- pg_cron's patience past that so it doesn't give up on the dispatcher
-- before Supabase's own idle-timeout would.
select cron.alter_job(
  job_id := jobid,
  command := $cmd$
    select net.http_post(
      url := 'https://krijilwxhdlzflvnvrtl.supabase.co/functions/v1/bexio-cron-sync',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'X-Dispatch-Secret', coalesce((select decrypted_secret from vault.decrypted_secrets where name = 'dispatch_secret'), '')
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 155000
    );
  $cmd$
)
from cron.job
where jobname = 'bexio-cron-sync';
