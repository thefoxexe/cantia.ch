-- Approved in chat — schedule the incomplete-signup reminder to run
-- hourly, same cadence as downgrade-expired-trials, and immediately catch
-- up every organization already >3 days incomplete.
select cron.schedule('send-incomplete-signup-reminders', '0 * * * *', $$select public.send_incomplete_signup_reminders()$$);

select public.send_incomplete_signup_reminders();
