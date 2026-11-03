-- Résumé du lundi (supabase/functions/weekly-admin-summary) : chaque lundi
-- à 06:43 UTC (07:43 en hiver, 08:43 en été à Zurich). Destinataire : le
-- secret WEEKLY_REPORT_EMAIL de la fonction.
select cron.unschedule('weekly-admin-summary') where exists (select 1 from cron.job where jobname = 'weekly-admin-summary');
select cron.schedule(
  'weekly-admin-summary',
  '43 6 * * 1',
  $$
  select net.http_post(
    url := 'https://krijilwxhdlzflvnvrtl.supabase.co/functions/v1/weekly-admin-summary',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Dispatch-Secret', coalesce((select decrypted_secret from vault.decrypted_secrets where name = 'dispatch_secret'), '')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
  $$
);
