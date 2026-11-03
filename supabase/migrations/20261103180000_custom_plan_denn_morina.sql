-- Formule sur mesure pour Denn Morina SARL (org 8e5fd900-…-42f4ebe9c514) :
-- exactement Essentiel, avec les soumissions illimitées (au lieu d'une à
-- l'essai). Privée (is_contact_only), donc absente des tarifs publics ;
-- débloquée par le code MORINA2026 dans « Plan personnalisé » ou en changeant
-- le prix de l'abonnement Stripe existant (metadata plan_id = custom-morina).
-- Les identifiants de prix Stripe sont ajoutés une fois les prix créés.
insert into public.plans
select (jsonb_populate_record(
  null::public.plans,
  to_jsonb(p) || jsonb_build_object(
    'id', 'custom-morina',
    'name', 'Denn Morina SARL',
    'price_chf_monthly', 59.00,
    'price_chf_yearly', 566.40,
    'stripe_price_id', null,
    'stripe_price_id_yearly', null,
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

insert into public.plan_access_codes (plan_id, code) values ('custom-morina', 'MORINA2026')
on conflict (code) do nothing;
