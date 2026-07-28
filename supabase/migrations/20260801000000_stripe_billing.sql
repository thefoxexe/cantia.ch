alter table public.plans add column stripe_price_id text;

alter table public.organizations add column stripe_customer_id text;
alter table public.organizations add column stripe_subscription_id text;
alter table public.organizations add column subscription_status text;

create index on public.organizations (stripe_customer_id);
create index on public.organizations (stripe_subscription_id);
