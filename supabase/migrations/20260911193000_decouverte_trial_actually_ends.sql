-- Until now, downgrade_expired_trials() cleared trial_ends_at and marked
-- subscription_status = 'trial_expired' but never touched plan_id — so an
-- org whose local 'découverte' trial ran out kept plan_id = 'decouverte'
-- forever, and app/_layout.tsx's redirect gate only ever checks whether
-- plan_id is null, not subscription_status. Net effect: the "X jours
-- restants" banner quietly disappeared and the account kept full,
-- unlimited, free access — exactly the gap flagged in chat. Nulling
-- plan_id here is what actually sends them through the same
-- !organization.plan_id redirect every other plan-less account already
-- hits, straight to choose-plan.
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

-- Two organizations (Debonneville, Devanthéry stores) already had their
-- trial silently expired by the pre-email version of this function before
-- today — trial_ends_at is already null for them, so they'd never be
-- picked up by the loop above again. Route them through the exact same
-- real code path once: give them a just-past trial_ends_at, run the
-- (now-fixed) function, which nulls plan_id and sends the trial-ended
-- e-mail neither of them ever got.
update public.organizations
set trial_ends_at = now() - interval '1 hour'
where plan_id = 'decouverte' and trial_ends_at is null;

select public.downgrade_expired_trials();
