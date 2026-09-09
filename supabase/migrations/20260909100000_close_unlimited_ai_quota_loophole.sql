-- check_and_log_ai_usage() treats a null max_ai_uses_per_month as "no
-- limit at all" (see 20260807430000_plan_feature_gating.sql). That was
-- fine when the assistant only covered a couple of light AI actions, but
-- it now backs eight different edge functions (transcription, voice
-- routing, devis-line generation, the new create_devis/create_facture
-- flow, question-answering, receipt scanning, payroll-entry dictation,
-- report polishing, email translation) — a single voice command can
-- burn 2-3 calls by itself. 'decouverte' (the free trial, 0 CHF) and the
-- two highest self-serve/negotiated tiers ('equipe', 'pro', 'illimite',
-- 'custom') were all still null, i.e. genuinely unbounded API cost per
-- organization. Every plan now gets a real ceiling; the top tiers are
-- sized high enough that no legitimate usage pattern should ever reach
-- them, but a runaway loop or bad actor can no longer cost unbounded
-- money on a single organization.
update public.plans set max_ai_uses_per_month = 30 where id = 'decouverte';
update public.plans set max_ai_uses_per_month = 600 where id = 'equipe';
update public.plans set max_ai_uses_per_month = 2000 where id = 'pro';
update public.plans set max_ai_uses_per_month = 6000 where id in ('illimite', 'custom');
