-- Two fixes to admin_dashboard_stats(), surfaced by a real support
-- conversation: "adn cloisons et faux plafonds sarl" and "Entreprise Roch
-- SA" are real customers mid-Stripe-trial (subscription_status = 'trialing',
-- written straight from the Stripe subscription object by stripe-webhook)
-- but active_trials_count only ever counted organizations.trial_ends_at
-- (the separate, plan-local trial field used by the 'decouverte' plan) —
-- so real trialing customers were silently missing from the dashboard's
-- own "Essais actifs" tile, the same class of bug as the admin org-list
-- status pills fixed in lib/adminStatus.ts.
--
-- Also adds incomplete_signups_count: organizations with no plan, no
-- trial and no Stripe status at all — someone created an account and
-- abandoned onboarding before ever picking a plan. Same definition as
-- lib/adminStatus.ts's "Inscription incomplète" bucket, so the dashboard
-- number and the badge always agree.
create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql security definer stable set search_path = public as $$
declare
  result jsonb;
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  select jsonb_build_object(
    'organizations_count', (select count(*) from public.organizations),
    'users_count', (select count(*) from auth.users),
    'active_trials_count', (
      select count(*) from public.organizations
      where subscription_status = 'trialing'
         or (trial_ends_at is not null and trial_ends_at > now() and subscription_status is distinct from 'active')
    ),
    'paid_subscriptions_count', (select count(*) from public.organizations where subscription_status = 'active'),
    'incomplete_signups_count', (
      select count(*) from public.organizations
      where subscription_status is null
        and plan_selected = false
        and (trial_ends_at is null or trial_ends_at <= now())
    ),
    'signups_today_count', (select count(*) from auth.users where created_at >= date_trunc('day', now())),
    'organizations_created_today_count', (select count(*) from public.organizations where created_at >= date_trunc('day', now()))
  ) into result;

  return result;
end;
$$;
