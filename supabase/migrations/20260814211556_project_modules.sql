-- Modules propres à chaque chantier (documents, photos, levés, métré,
-- sous-traitants, rentabilité) au lieu d'un seul réglage par organisation
-- appliqué à tous les chantiers. Devis et Planning restent des réglages
-- d'organisation (ils gèrent des sections de la navigation principale, pas
-- un outil dans un chantier précis) — inchangés.
alter table public.projects
  add column enabled_modules text[] not null default array['documents', 'photos', 'survey', 'metre'];

update public.projects p
set enabled_modules = coalesce((
  select array_agg(m) from unnest(o.enabled_modules) as m
  where m in ('documents', 'photos', 'survey', 'metre', 'subcontractors', 'profitability')
), array[]::text[])
from public.organizations o
where o.id = p.organization_id;
