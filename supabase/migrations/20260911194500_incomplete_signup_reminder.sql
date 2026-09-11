-- Reminds an org that signed up but never picked a plan (plan_id null,
-- plan_selected false — the same 'incomplete' bucket lib/adminStatus.ts
-- already labels "Inscription incomplète") that their 14-day trial is
-- still waiting for them, 3 days after they created the account.
alter table public.organizations add column signup_reminder_email_sent_at timestamptz;

create or replace function public.send_incomplete_signup_reminders()
returns void
language plpgsql security definer set search_path = public, vault as $$
declare
  v_org record;
  v_secret text;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'dispatch_secret';

  for v_org in
    select id from public.organizations
    where plan_id is null
      and plan_selected = false
      and created_at < now() - interval '3 days'
      and signup_reminder_email_sent_at is null
  loop
    perform net.http_post(
      url := 'https://krijilwxhdlzflvnvrtl.supabase.co/functions/v1/send-signup-reminder-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'X-Dispatch-Secret', coalesce(v_secret, '')
      ),
      body := jsonb_build_object('organization_id', v_org.id)
    );
  end loop;
end;
$$;

revoke all on function public.send_incomplete_signup_reminders() from public;
revoke execute on function public.send_incomplete_signup_reminders() from anon, authenticated;

-- NOT scheduled yet — deliberately left for a follow-up migration once the
-- test send has been reviewed (see chat). Scheduling this now would
-- immediately email every real organization already >3 days incomplete.
