-- stripe-checkout never actually applies the promo code as a Stripe
-- discount (it only borrows the code's trial_days metadata — see the
-- comment in supabase/functions/stripe-checkout/index.ts), so Stripe itself
-- has no redemption record to query. This column is the only place "which
-- promo code did this org use" is tracked, written by stripe-checkout at
-- session-creation time.
alter table public.organizations add column if not exists promo_code_used text;
