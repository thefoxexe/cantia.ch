-- trial_used was flipped to true at Checkout Session *creation* time (the
-- bug fixed alongside this migration — see stripe-checkout/stripe-webhook),
-- so any org that opened checkout at least once but never actually
-- completed a subscription had its one free trial burned for nothing.
-- Reset it for every org caught in that state so their next real checkout
-- gets the 14-day trial they never actually used.
update public.organizations
set trial_used = false
where trial_used = true
  and plan_id is null
  and stripe_subscription_id is null;
