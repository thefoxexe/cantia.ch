-- Repricing: drop the always-free plan in favour of a single automatic
-- 14-day trial (card required up front, granted once per organization),
-- raise self-serve prices to match a broader feature set than the narrow
-- devis/facture competitors this used to be priced against (Bexio/Klara
-- start well above these for far less scope), and cap custom team roles
-- on the entry tier. New Stripe prices were created directly on the
-- existing products (prod_UyQVGz1eqPCuwP / prod_Uz9TTd08g8lk3F /
-- prod_UyQVKtjVGzCxmf) and the old prices archived — existing subscribers
-- keep billing at their original price, only new checkouts see the new
-- one.

-- ==========================================================================
-- plans: new prices/limits + a cap on custom team roles.
-- ==========================================================================
alter table public.plans add column if not exists max_org_roles integer;

update public.plans set
  name = 'Essentiel',
  price_chf_monthly = 39,
  price_chf_yearly = 374.40,
  storage_quota_mb = 10240,
  max_members = 3,
  max_trames = 40,
  max_ai_uses_per_month = 150,
  max_org_roles = 2,
  stripe_price_id = 'price_1UAmdVD8Ba3GEHSnpa0fTVi1',
  stripe_price_id_yearly = 'price_1UAmaDD8Ba3GEHSnnHR02bRQ'
where id = 'solo';

update public.plans set
  price_chf_monthly = 79,
  price_chf_yearly = 758.40,
  storage_quota_mb = 51200,
  max_members = 10,
  max_org_roles = null,
  stripe_price_id = 'price_1UAme7D8Ba3GEHSn8vfMZbWf',
  stripe_price_id_yearly = 'price_1UAmbED8Ba3GEHSn8Q8UgiIE'
where id = 'equipe';

update public.plans set
  price_chf_monthly = 129,
  price_chf_yearly = 1238.40,
  storage_quota_mb = 204800,
  max_members = 25,
  max_org_roles = null,
  stripe_price_id = 'price_1UAmevD8Ba3GEHSnFtML527m',
  stripe_price_id_yearly = 'price_1UAmcCD8Ba3GEHSnaeekcS84'
where id = 'pro';

-- "Sur mesure" self-serve (99 CHF, 3 active subscribers) is retired from
-- checkout — Entreprise now covers what used to justify it. is_contact_only
-- only hides a plan from choose-plan.tsx's self-serve query; it does not
-- touch existing subscriptions.
update public.plans set is_contact_only = true, max_org_roles = null where id = 'illimite';

-- "custom" becomes the single bespoke/contact-only tier, renamed to match
-- the "Sur mesure" language already used across the blog content.
update public.plans set name = 'Sur mesure', max_org_roles = null where id = 'custom';

update public.plans set max_org_roles = null where id = 'decouverte';
update public.plans set max_org_roles = 2 where id = 'free';

-- ==========================================================================
-- organizations: automatic one-time 14-day trial replaces the permanent
-- free plan. trial_used is intentionally left out of the authenticated
-- grant list in 20260828100000_lock_billing_and_ownership_columns.sql —
-- service-role only, so a client can never re-arm its own trial.
-- ==========================================================================
alter table public.organizations add column if not exists trial_used boolean not null default false;

-- Existing orgs (any plan) predate this policy — none of them should get a
-- fresh automatic trial the first time they go through checkout again.
update public.organizations set trial_used = true;

-- The orgs currently parked on the (now unmarketed) free plan get one
-- 14-day grace trial to pick a real plan, same as a new signup would.
update public.organizations
set plan_id = 'decouverte', trial_ends_at = now() + interval '14 days'
where plan_id = 'free';

alter table public.organizations alter column plan_id set default 'decouverte';
alter table public.organizations alter column trial_ends_at set default (now() + interval '14 days');

-- Trial expiry now locks the org out (plan_selected = false forces the
-- existing choose-plan.tsx redirect already wired in app/_layout.tsx)
-- instead of quietly dropping it onto a free plan that no longer exists.
create or replace function public.downgrade_expired_trials()
returns void
language sql security definer set search_path = public as $$
  update public.organizations
  set plan_selected = false, trial_ends_at = null, subscription_status = 'trial_expired'
  where plan_id = 'decouverte' and trial_ends_at is not null and trial_ends_at < now();
$$;

-- ==========================================================================
-- organization_roles: two built-in roles ("Administration", "Employé") for
-- every org, seeded going forward and backfilled for existing orgs.
-- Essentiel's max_org_roles = 2 means these two already are the cap — they
-- stay editable but a 3rd can't be created. Équipe/Entreprise/Sur mesure/
-- Découverte have max_org_roles = null (unlimited) and can add as many
-- more as they want.
-- ==========================================================================
create or replace function public.seed_default_org_roles()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.organization_roles (
    organization_id, name, color,
    can_view_finances, can_view_survey, can_view_metre, can_view_planning,
    can_view_documents, can_view_subcontractors, can_create_projects, can_manage_payroll
  ) values
    (new.id, 'Administration', '#BC5A31', true, true, true, true, true, true, true, true),
    (new.id, 'Employé', '#2E6B4F', false, true, true, true, true, false, false, false)
  on conflict (organization_id, name) do nothing;
  return new;
end;
$$;

drop trigger if exists seed_default_org_roles_trigger on public.organizations;
create trigger seed_default_org_roles_trigger
  after insert on public.organizations
  for each row execute function public.seed_default_org_roles();

-- Backfill: any existing org with zero custom roles gets the same two.
insert into public.organization_roles (
  organization_id, name, color,
  can_view_finances, can_view_survey, can_view_metre, can_view_planning,
  can_view_documents, can_view_subcontractors, can_create_projects, can_manage_payroll
)
select o.id, v.name, v.color, v.finances, true, true, true, true, v.subcontractors, v.projects, v.payroll
from public.organizations o
cross join (values
  ('Administration', '#BC5A31', true, true, true, true),
  ('Employé', '#2E6B4F', false, false, false, false)
) as v(name, color, finances, subcontractors, projects, payroll)
where not exists (select 1 from public.organization_roles r where r.organization_id = o.id);
