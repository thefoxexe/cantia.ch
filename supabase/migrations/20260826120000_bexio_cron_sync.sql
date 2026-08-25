-- Hourly automated Bexio invoice-status pull (cahier des charges section
-- 47), scoped to organizations that have both connected Bexio and turned
-- auto_sync_enabled on. Same pg_cron + net.http_post + shared-secret-header
-- pattern already used for notification dispatch in this project.
select cron.schedule(
  'bexio-cron-sync',
  '0 * * * *',
  $$
  select net.http_post(
    url := 'https://krijilwxhdlzflvnvrtl.supabase.co/functions/v1/bexio-cron-sync',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Dispatch-Secret', 'b7f0e4c1a9d84f2c9a3e6b5d1f7c8e2a4d6b9c0e3f5a7b1d8c2e4f6a9b3d5c7e'
    ),
    body := '{}'::jsonb
  );
  $$
);
