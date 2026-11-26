-- Black Friday 2026: lifetime prices for the three public plans, only for
-- a checkout opened from cantia.ch/black-friday (offer code BF2026), from
-- now until Monday 30 November 2026 at midnight, Zurich time.
--
-- The Stripe prices were created on the plans' existing products
-- (lookup keys bf2026_<plan>_<interval>), so a subscription on them is
-- still that plan. stripe-checkout reads this table to swap the price;
-- stripe-webhook reads it to map a price back to its plan. The price stays
-- on the subscription for as long as it lives, which is the "à vie".

create table if not exists public.price_offers (
  code text not null,
  plan_id text not null references public.plans(id),
  price_chf_monthly numeric(10,2) not null,
  price_chf_yearly numeric(10,2) not null,
  stripe_price_id text not null,
  stripe_price_id_yearly text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (code, plan_id)
);

alter table public.price_offers enable row level security;
-- No policy: only the service role (edge functions) and the RPC below read it.

insert into public.price_offers (code, plan_id, price_chf_monthly, price_chf_yearly, stripe_price_id, stripe_price_id_yearly, starts_at, ends_at) values
  ('BF2026', 'solo',   25.00, 240.00, 'price_1Ug5LOD8Ba3GEHSnuTtzFfmN', 'price_1Ug5LmD8Ba3GEHSnTVVeTXiN', '2026-11-26 00:00:00 Europe/Zurich', '2026-12-01 00:00:00 Europe/Zurich'),
  ('BF2026', 'equipe', 45.00, 432.00, 'price_1Ug5MCD8Ba3GEHSn1FsFpAnZ', 'price_1Ug5MHD8Ba3GEHSnKRK7ZzWY', '2026-11-26 00:00:00 Europe/Zurich', '2026-12-01 00:00:00 Europe/Zurich'),
  ('BF2026', 'pro',    59.00, 566.40, 'price_1Ug5MUD8Ba3GEHSnvtueBenY', 'price_1Ug5MhD8Ba3GEHSn97usdzUo', '2026-11-26 00:00:00 Europe/Zurich', '2026-12-01 00:00:00 Europe/Zurich')
on conflict (code, plan_id) do update set
  price_chf_monthly = excluded.price_chf_monthly,
  price_chf_yearly = excluded.price_chf_yearly,
  stripe_price_id = excluded.stripe_price_id,
  stripe_price_id_yearly = excluded.stripe_price_id_yearly,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at;

-- The offer's prices for the plan screen, only while it runs (empty after).
create or replace function public.price_offer_preview(p_code text)
returns table (plan_id text, price_chf_monthly numeric, price_chf_yearly numeric, ends_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select o.plan_id, o.price_chf_monthly, o.price_chf_yearly, o.ends_at
    from public.price_offers o
   where o.code = upper(trim(p_code))
     and o.starts_at <= now()
     and o.ends_at > now()
$$;
revoke all on function public.price_offer_preview(text) from public;
grant execute on function public.price_offer_preview(text) to anon, authenticated;

notify pgrst, 'reload schema';
