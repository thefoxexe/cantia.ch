-- bexio-cron-sync stopped running the sync inline for every org in one
-- shared invocation (that's what caused the two-day outage: Besson's 1140
-- contacts plus two other orgs' thousands of historical records blew past
-- the edge function's memory budget — WORKER_RESOURCE_LIMIT — killing the
-- sweep for every org sharing the tick, not just Besson's). It is now a
-- thin dispatcher that fans out one request per org to bexio-sync-worker
-- and awaits them all before responding.
--
-- net.http_post defaults to a 5000ms timeout, which was already too short
-- for even the old inline sweep and is far too short for the dispatcher to
-- wait on every org's worker call to finish. Raise it generously — the
-- dispatcher's own per-worker timeout (90s, see bexio-cron-sync/index.ts)
-- is the real ceiling; this just needs to be comfortably above that.
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
      timeout_milliseconds := 120000
    );
  $cmd$
)
from cron.job
where jobname = 'bexio-cron-sync';
