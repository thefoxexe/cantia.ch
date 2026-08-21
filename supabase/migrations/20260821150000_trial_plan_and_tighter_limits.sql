-- "Découverte" : essai de 14 jours auto-assigné à toute nouvelle
-- organisation, avec tout débloqué (même profil que Équipe). Le but : que
-- les gens voient vraiment ce que Cantia permet avant de retomber sur
-- Gratuit — le contraste est ce qui donne envie de passer à un plan payant,
-- pas une fonctionnalité jamais vue. À l'expiration, downgrade_expired_trials()
-- (planifiée via pg_cron, déjà actif sur ce projet) repasse l'org sur
-- 'free' et vide trial_ends_at.
insert into public.plans (
  id, name, storage_quota_mb, max_members, price_chf_monthly, price_chf_yearly,
  has_survey, has_customization, has_email_sending, has_planning, has_profitability,
  has_payroll, has_treasury, max_devis_factures_per_month, max_trames, max_ai_uses_per_month,
  is_contact_only
) values (
  'decouverte', 'Découverte', 8192, 5, 0, 0,
  true, true, true, true, true,
  true, true, null, null, null,
  false
)
on conflict (id) do nothing;

alter table public.organizations add column trial_ends_at timestamptz;

-- New orgs land on the trial by default, 14 days, with the org-level
-- modules that need a deliberate toggle already on so the trial actually
-- surfaces Planning/RH/Trésorerie instead of hiding them behind a switch
-- nobody knows to flip.
alter table public.organizations alter column plan_id set default 'decouverte';
alter table public.organizations alter column trial_ends_at set default (now() + interval '14 days');
alter table public.organizations alter column enabled_modules set default
  array['documents', 'photos', 'devis', 'survey', 'metre', 'planning', 'payroll', 'treasury'];

create or replace function public.downgrade_expired_trials()
returns void
language sql security definer set search_path = public as $$
  update public.organizations
  set plan_id = 'free', trial_ends_at = null
  where plan_id = 'decouverte' and trial_ends_at is not null and trial_ends_at < now();
$$;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'downgrade-expired-trials') then
    perform cron.unschedule('downgrade-expired-trials');
  end if;
end $$;

select cron.schedule('downgrade-expired-trials', '0 * * * *', $$select public.downgrade_expired_trials()$$);

-- Resserre Gratuit et Indépendant pour que le saut vers Équipe (tout
-- illimité) reste net, maintenant que la découverte du produit se fait via
-- l'essai plutôt qu'en tâtonnant sur Gratuit.
update public.plans set max_devis_factures_per_month = 3, max_ai_uses_per_month = 5 where id = 'free';
update public.plans set storage_quota_mb = 2048, max_trames = 20, max_ai_uses_per_month = 50 where id = 'solo';
