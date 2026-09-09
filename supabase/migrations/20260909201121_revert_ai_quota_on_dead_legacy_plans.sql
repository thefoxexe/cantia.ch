-- 'illimite' and 'custom' are both leftover "Sur mesure" rows from earlier
-- repricing iterations — 0 organizations on either, and excluded from
-- every plan-selection screen (choose-plan.tsx, PricingSection.tsx) same
-- as 'free'. Only 3 plans are actually sold/assigned today: solo
-- (Essentiel), equipe (Équipe), pro (Entreprise) — plus 'decouverte', the
-- live trial state (8 real orgs) rather than a purchasable tier. Undoing
-- the previous migration's change on these two dead rows; 'free' was
-- already null-free before that migration and is left untouched.
update public.plans set max_ai_uses_per_month = null where id in ('illimite', 'custom');
