-- New orgs go through a richer post-payment setup wizard (company details +
-- module selection) before landing in the app; existing orgs that already
-- have an active plan are backfilled to true so current customers are never
-- forced through it retroactively.
alter table public.organizations
  add column if not exists onboarding_completed boolean not null default false;

update public.organizations
set onboarding_completed = true
where plan_id is not null;
