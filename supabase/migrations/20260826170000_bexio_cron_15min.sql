-- Bexio pull sweep tightened from hourly to every 15 minutes — a product or
-- client created directly in Bexio used to take up to an hour to reach
-- Cantia; the push direction (Cantia -> Bexio) is instant regardless (see
-- bexio-push-client), this only affects how fast the other direction is
-- noticed.
select cron.alter_job(job_id := jobid, schedule := '*/15 * * * *')
from cron.job
where jobname = 'bexio-cron-sync';
