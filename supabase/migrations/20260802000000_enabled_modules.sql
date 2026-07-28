-- Lets each organization hide the modules it doesn't need (documents,
-- photos, devis, survey, metre) instead of showing every tool to everyone.
-- "reports" is core and always available, so it's not part of this list.
alter table public.organizations
  add column enabled_modules text[] not null default array['documents', 'photos', 'devis', 'survey', 'metre'];
