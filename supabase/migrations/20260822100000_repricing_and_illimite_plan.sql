-- Repricing suite à l'audit tarification du 22 août 2026 : la grille était
-- 3 à 10x moins chère que tout repère comparable (Bexio, Craftnote, Batappli,
-- Obat...) au point de lire comme pas sérieux plutôt que généreux. Les coûts
-- d'infra réels (Supabase encore sur le palier gratuit, ~50 Mo de stockage
-- total, 12 appels IA depuis le lancement) confirment que ce n'est pas un
-- problème de couverture de coûts — juste un prix mal calibré.
--
-- Les nouveaux prix Stripe ont déjà été créés et mis en défaut sur chaque
-- produit (Indépendant/Équipe/Entreprise/nouveau produit Illimité), et les
-- anciens prix ont été archivés (active=false) — donc plus utilisables pour
-- un nouveau checkout, mais toujours valides pour les abonnements existants
-- (les 2 essais Stripe en cours notamment, qui gardent leur prix d'origine
-- sans aucune action ici : Stripe pin chaque abonnement à son price_id, un
-- prix archivé continue de facturer normalement).
update public.plans set
  price_chf_monthly = 19,
  price_chf_yearly = 182.40,
  stripe_price_id = 'price_1U7BjmD8Ba3GEHSnZ87Bvq3j',
  stripe_price_id_yearly = 'price_1U7BjoD8Ba3GEHSna2cjWKKL'
where id = 'solo';

update public.plans set
  price_chf_monthly = 49,
  price_chf_yearly = 470.40,
  stripe_price_id = 'price_1U7BjqD8Ba3GEHSnw08tKlLE',
  stripe_price_id_yearly = 'price_1U7BjrD8Ba3GEHSnIrzFMMmv'
where id = 'equipe';

update public.plans set
  price_chf_monthly = 89,
  price_chf_yearly = 854.40,
  stripe_price_id = 'price_1U7BjsD8Ba3GEHSn3fARUmW0',
  stripe_price_id_yearly = 'price_1U7BjuD8Ba3GEHSnAiBijDhM'
where id = 'pro';

-- Nouveau palier public au-dessus d'Entreprise : sert d'ancrage (rend 89
-- CHF concret par comparaison) et donne un vrai prix visible avant de
-- basculer sur "Sur devis" pour le sur-mesure complet. Mêmes fonctionnalités
-- qu'Entreprise, limites nettement plus hautes.
insert into public.plans (
  id, name, storage_quota_mb, max_members, price_chf_monthly, price_chf_yearly,
  has_survey, has_customization, has_email_sending, has_planning, has_profitability,
  has_payroll, has_treasury, max_devis_factures_per_month, max_trames, max_ai_uses_per_month,
  is_contact_only, stripe_price_id, stripe_price_id_yearly
) values (
  'illimite', 'Illimité', 102400, 9999, 149, 1430.40,
  true, true, true, true, true,
  true, true, null, null, null,
  false, 'price_1U7BjwD8Ba3GEHSn96Zc5gRq', 'price_1U7BjxD8Ba3GEHSnwhfZuNyi'
)
on conflict (id) do nothing;
