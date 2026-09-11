-- Logs a 'canceled' event into organization_subscription_events when a
-- 'découverte' trial actually ends — this path never touches Stripe, so
-- without this the org detail page's subscription timeline (built for
-- Stripe-driven events) would show nothing for it, the one lifecycle event
-- that actually explains why the account lost access.
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
    set plan_id = null, plan_selected = false, trial_ends_at = null, subscription_status = 'trial_expired'
    where id = v_org.id;

    -- was_trialing: true reuses the same detail shape the org detail page's
    -- describeEvent() already renders as "Résilié pendant la période
    -- d'essai" for a Stripe-driven cancellation — accurate here too.
    insert into public.organization_subscription_events (organization_id, event_type, detail)
    values (v_org.id, 'canceled', jsonb_build_object('was_trialing', true));

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

-- Backfill the event for the two organizations already processed just now
-- (Debonneville, Devanthéry stores), so their timeline isn't missing it.
insert into public.organization_subscription_events (organization_id, event_type, detail)
select id, 'canceled', jsonb_build_object('was_trialing', true)
from public.organizations
where name in ('Debonneville', 'Devanthéry stores') and plan_id is null;
