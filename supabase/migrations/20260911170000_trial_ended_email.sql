-- Automated e-mail when a 14-day trial ends without ever converting to a
-- paid plan — tells the owner the trial is over, that reactivating is a
-- click away, and asks for feedback. Two distinct places an org's trial
-- ends without conversion (see supabase/functions/send-trial-ended-email
-- for the actual send):
--   - legacy no-card orgs: downgrade_expired_trials() below, unchanged
--     detection logic, now also notifies once per org via pg_net.
--   - current card-required flow: supabase/functions/stripe-webhook's
--     customer.subscription.deleted handler (see that file's diff) calls
--     the same edge function directly when the org's subscription_status
--     was 'trialing' right before Stripe cancelled it.
-- trial_ended_email_sent_at is the single idempotency guard for both paths
-- (checked and set inside the edge function itself, not here) so a retried
-- webhook delivery or a re-run cron tick can never double-send.
alter table public.organizations add column trial_ended_email_sent_at timestamptz;

create or replace function public.downgrade_expired_trials()
returns void
language plpgsql security definer set search_path = public, vault as $$
declare
  v_org record;
  v_secret text;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'dispatch_secret';

  for v_org in
    select id from public.organizations
    where plan_id = 'decouverte' and trial_ends_at is not null and trial_ends_at < now()
  loop
    update public.organizations
    set plan_selected = false, trial_ends_at = null, subscription_status = 'trial_expired'
    where id = v_org.id;

    perform net.http_post(
      url := 'https://krijilwxhdlzflvnvrtl.supabase.co/functions/v1/send-trial-ended-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'X-Dispatch-Secret', coalesce(v_secret, '')
      ),
      body := jsonb_build_object('organization_id', v_org.id)
    );
  end loop;
end;
$$;
