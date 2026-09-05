-- Real support ask: "enlève ceux qui ont un code promo à vie du calcul du
-- MRR" — admin-billing-overview already excluded 100%-off lifetime-free
-- subscriptions from mrr_active_chf/active_count (it detects the Stripe
-- coupon live), but that detection never made it back to the organizations
-- table. So every OTHER admin screen — the dashboard's paid_subscriptions_
-- count, the signup funnel, the "Payant" status pill on Entreprises/
-- Abonnements — kept counting these orgs as real paying customers (their
-- Stripe subscription_status genuinely is 'active', just at 0 CHF), while
-- the Abonnements revenue view silently excluded them from money. Same
-- number meant two different things depending on which screen you were on.
--
-- is_complimentary is the persisted version of that live Stripe check —
-- synced by admin-billing-overview on every load — so every screen (SQL
-- RPC and client alike) can agree on who is actually a paying customer
-- without each doing its own Stripe round-trip.
alter table public.organizations add column if not exists is_complimentary boolean not null default false;

-- Return type is gaining a column (is_complimentary) — plain "create or
-- replace" refuses that ("cannot change return type of existing
-- function"), so the old signature has to be dropped first.
drop function if exists public.admin_list_organizations(text, int, int);

create function public.admin_list_organizations(search text default null, limit_n int default 50, offset_n int default 0)
returns table(
  id uuid, name text, plan_id text, plan_name text, subscription_status text,
  trial_ends_at timestamptz, plan_selected boolean, created_at timestamptz,
  member_count bigint, owner_email text, private_modules_count bigint,
  is_internal boolean, internal_label text, is_complimentary boolean, total_count bigint
)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  return query
  select
    o.id, o.name, o.plan_id, p.name, o.subscription_status, o.trial_ends_at,
    o.plan_selected, o.created_at,
    (select count(*) from public.organization_members m where m.organization_id = o.id),
    (select u.email::text from public.organization_members m join auth.users u on u.id = m.user_id
       where m.organization_id = o.id and m.role = 'owner' order by m.created_at asc limit 1),
    (select count(*) from public.organization_modules om where om.organization_id = o.id and om.enabled),
    o.is_internal, o.internal_label, o.is_complimentary,
    count(*) over ()
  from public.organizations o
  left join public.plans p on p.id = o.plan_id
  where search is null or search = '' or o.name ilike '%' || search || '%'
  order by o.is_internal asc, o.created_at desc
  limit limit_n offset offset_n;
end;
$$;

revoke execute on function public.admin_list_organizations(text, int, int) from anon;

-- Every count here now excludes internal (Cantia's own test/demo)
-- organizations — admin-billing-overview already did this for MRR, but the
-- dashboard's headline "combien d'entreprises" never matched the money
-- view's "combien de vrais clients" for the same underlying reason.
-- paid_subscriptions_count also excludes is_complimentary, and a new
-- complimentary_count surfaces them as their own honest bucket instead of
-- disappearing or being miscounted as "payant".
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
    'organizations_count', (select count(*) from public.organizations where is_internal = false),
    'users_count', (select count(*) from auth.users),
    'active_trials_count', (
      select count(*) from public.organizations
      where is_internal = false
        and (subscription_status = 'trialing'
             or (trial_ends_at is not null and trial_ends_at > now() and subscription_status is distinct from 'active'))
    ),
    'paid_subscriptions_count', (
      select count(*) from public.organizations
      where is_internal = false and subscription_status = 'active' and is_complimentary = false
    ),
    'complimentary_count', (
      select count(*) from public.organizations
      where is_internal = false and subscription_status = 'active' and is_complimentary = true
    ),
    'incomplete_signups_count', (
      select count(*) from public.organizations
      where is_internal = false
        and subscription_status is null
        and plan_selected = false
        and (trial_ends_at is null or trial_ends_at <= now())
    ),
    'signups_today_count', (select count(*) from auth.users where created_at >= date_trunc('day', now())),
    'organizations_created_today_count', (
      select count(*) from public.organizations where is_internal = false and created_at >= date_trunc('day', now())
    )
  ) into result;

  return result;
end;
$$;
