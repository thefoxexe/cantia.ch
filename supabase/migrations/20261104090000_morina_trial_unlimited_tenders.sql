-- Denn Morina SARL (org 8e5fd900-…-42f4ebe9c514) : soumissions illimitées
-- pendant son essai, pour tester le principe sur plusieurs dossiers.
-- Formule privée identique à Essentiel (même nom, même prix, mêmes prix
-- Stripe), seules les soumissions sont sans limite : l'écran Facturation
-- continue d'afficher « Essentiel, CHF 39.– ».
-- Fin : à la fin de l'essai (17 novembre 2026, 08:00 UTC), le webhook Stripe
-- remet plan_id = 'solo' (metadata de l'abonnement) ; la tâche ci-dessous le
-- fait aussi au cas où, puis se supprime.
insert into public.plans
select (jsonb_populate_record(
  null::public.plans,
  to_jsonb(p) || jsonb_build_object(
    'id', 'solo-essai-soumissions',
    'is_contact_only', true,
    'has_tenders', true,
    'max_tenders_per_month', null,
    'max_tenders_total', null,
    'created_at', now()
  )
)).*
from public.plans p
where p.id = 'solo'
on conflict (id) do nothing;

update public.organizations
set plan_id = 'solo-essai-soumissions'
where id = '8e5fd900-7463-4525-8d85-42f4ebe9c514'
  and plan_id = 'solo'
  and subscription_status = 'trialing';

select cron.schedule(
  'morina-fin-essai-soumissions',
  '5 8 17 11 *',
  $$
    update public.organizations
    set plan_id = 'solo'
    where id = '8e5fd900-7463-4525-8d85-42f4ebe9c514'
      and plan_id = 'solo-essai-soumissions';
    select cron.unschedule('morina-fin-essai-soumissions');
  $$
);
