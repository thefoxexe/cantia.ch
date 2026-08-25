-- "Illimité" devient "Sur mesure" : un prix d'entrée ("dès CHF 149"), plus
-- de remise -20% en facturation annuelle puisque ce palier est négocié au
-- cas par cas. price_chf_yearly passe donc à 12x le prix mensuel (aucune
-- remise, juste le calcul du montant sur l'année) et stripe_price_id_yearly
-- pointe désormais vers le même Price Stripe mensuel que stripe_price_id
-- (pas de nouveau Price annuel créé) — un client qui bascule le toggle
-- "annuel" pour ce plan est donc facturé exactement comme en mensuel,
-- 12 fois CHF 149, sans réduction.
update public.plans set
  name = 'Sur mesure',
  price_chf_yearly = price_chf_monthly * 12,
  stripe_price_id_yearly = stripe_price_id
where id = 'illimite';
