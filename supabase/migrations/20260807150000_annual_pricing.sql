-- Annual billing: -20% vs. paying monthly for 12 months, as a separate
-- Stripe price per plan (Stripe prices are immutable, so the discount can't
-- just be a flag on the existing monthly price).
alter table public.plans add column if not exists price_chf_yearly numeric(10,2);
alter table public.plans add column if not exists stripe_price_id_yearly text;

update public.plans set price_chf_yearly = 86.40, stripe_price_id_yearly = 'price_1U0jLjD8Ba3GEHSnk5DAsiZf' where id = 'solo';
update public.plans set price_chf_yearly = 230.40, stripe_price_id_yearly = 'price_1U0jLkD8Ba3GEHSn5NG2ofZv' where id = 'equipe';
update public.plans set price_chf_yearly = 470.40, stripe_price_id_yearly = 'price_1U0jLlD8Ba3GEHSnLVRyOiCC' where id = 'pro';
update public.plans set price_chf_yearly = 0 where id = 'free';
