-- §7.1 follow-up: 13e salaire had no per-employee configuration — the
-- manager had to remember to add it by hand every time, on whichever
-- month they thought of it. Adds an explicit per-employee mode so the
-- app can compute it automatically once configured, exactly like it
-- already does for indemnité vacances (recurring_rate wage types).
--
-- 'inclus_taux_horaire': nothing automatic — the employee's rate already
--   has their 13e folded in (e.g. a summer-only hourly worker whose rate
--   was set higher to account for it). Same as leaving it unset.
-- 'reparti_mensuel': 1/12 of that period's gross-before-recurring is
--   added automatically every month, same mechanism as indemnité
--   vacances (computeWageAdditions in lib/api/payroll.ts).
-- 'lump_sum_month': the whole 13e is added automatically, but only in
--   treizieme_mois — for a monthly salary, that's exactly
--   monthly_salary_chf (one extra month's pay, standard CH practice);
--   for an hourly salary, it's that month's own gross as an estimate
--   (no per-employee annual-average tracking exists yet) — the manager
--   is expected to review/adjust it like any other automatic line
--   before validating the slip.
alter table public.payroll_profiles
  add column if not exists treizieme_mode text check (treizieme_mode in ('inclus_taux_horaire', 'reparti_mensuel', 'lump_sum_month')),
  add column if not exists treizieme_mois integer check (treizieme_mois between 1 and 12);

notify pgrst, 'reload schema';
