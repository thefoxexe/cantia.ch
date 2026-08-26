-- "Sur mesure" (illimite) has no self-serve Stripe checkout on the landing
-- page — the CTA is a "Nous contacter" mailto, negotiated per organization
-- — so this only changes the indicative price shown, not any live billing
-- (stripe_price_id is left untouched, unused by this plan's checkout flow).
update public.plans
set price_chf_monthly = 99.00, price_chf_yearly = 1188.00
where id = 'illimite';
