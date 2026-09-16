-- Once a day, sweep chantiers with auto_daily_report_enabled — see
-- auto-daily-reports edge function. 17:00 UTC lands around 18:00-19:00
-- Europe/Zurich local time depending on daylight saving; pg_cron itself
-- always runs in UTC so this is a fixed year-round approximation of "end
-- of the workday", same trade-off already accepted by the other cron jobs
-- in this project.
select cron.schedule(
  'auto-daily-reports',
  '0 17 * * *',
  $$
  select net.http_post(
    url := 'https://krijilwxhdlzflvnvrtl.supabase.co/functions/v1/auto-daily-reports',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Dispatch-Secret', coalesce((select decrypted_secret from vault.decrypted_secrets where name = 'dispatch_secret'), '')
    ),
    body := '{}'::jsonb
  );
  $$
);
