-- Opus-Flow rebrand: drop the Entreprise plan, rename Solo to "Indépendant",
-- and gate new organizations behind an explicit plan-selection step.

-- Move any organization still on the removed "entreprise" plan back to free
-- before dropping the row (FK on organizations.plan_id).
update public.organizations set plan_id = 'free' where plan_id = 'entreprise';

delete from public.plans where id = 'entreprise';

update public.plans set name = 'Indépendant' where id = 'solo';

-- Existing organizations already went through onboarding in the old flow —
-- backfill them as "selected" so only new signups see the plan-selection
-- screen. New rows default to false.
alter table public.organizations add column plan_selected boolean not null default true;
alter table public.organizations alter column plan_selected set default false;
