-- Live Stripe price IDs for the paid plans (products created via the Stripe
-- account connected to this project).
update public.plans set stripe_price_id = 'price_1TyF5bD8Ba3GEHSnSpkw76Sj' where id = 'solo';
update public.plans set stripe_price_id = 'price_1TyF67D8Ba3GEHSnk6NgXn67' where id = 'pro';
update public.plans set stripe_price_id = 'price_1TyF6HD8Ba3GEHSnR5KjtXqD' where id = 'entreprise';
