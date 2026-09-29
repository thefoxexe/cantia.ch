-- What a company calls its jobs: "chantier" (construction, default),
-- "projet", "mandat" or "dossier". Asked at onboarding, editable in
-- Paramètres › Entreprise. Only the words change in the app
-- (lib/vocabulary.ts); the module works the same.
alter table public.organizations
  add column if not exists work_term text not null default 'chantier'
  check (work_term in ('chantier', 'projet', 'mandat', 'dossier'));

notify pgrst, 'reload schema';
