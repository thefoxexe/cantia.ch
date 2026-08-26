-- Reverts the no-card 14-day "Découverte" auto-trial introduced in
-- 20260821150000_trial_plan_and_tighter_limits.sql. Business decision: new
-- signups should not get full features for free without ever entering a
-- card — instead they're routed to choose-plan.tsx (already built, already
-- pre-fills the ESSAI30 promo code) where picking any plan requires a real
-- Stripe Checkout with a card on file; ESSAI30 gives 30 trial days via
-- Stripe itself (subscription_data.trial_period_days in stripe-checkout),
-- so the card is charged automatically after 30 days unless cancelled.
--
-- Only the column defaults change here — existing organizations already on
-- 'decouverte' are left untouched and keep draining normally via the
-- existing hourly downgrade_expired_trials() cron.
alter table public.organizations alter column plan_id set default 'free';
alter table public.organizations alter column trial_ends_at set default null;
alter table public.organizations alter column enabled_modules set default
  array['documents', 'photos', 'devis', 'survey', 'metre'];
