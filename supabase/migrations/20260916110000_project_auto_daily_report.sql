-- "Rapport journalier automatique" — activable par chantier : si des
-- membres postent des notes ou messages vocaux dans le fil du jour, un
-- rapport est compilé et généré tout seul en fin de journée, sans repasser
-- par la création manuelle. Un jour sans aucune activité ne génère rien —
-- ce n'est pas un rappel, juste une compilation automatique de ce qui a
-- réellement été saisi sur le terrain.
alter table public.projects add column auto_daily_report_enabled boolean not null default false;
