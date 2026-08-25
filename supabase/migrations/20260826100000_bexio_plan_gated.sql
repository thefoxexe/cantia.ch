-- Bexio was gated as an admin-granted private module for Phase 1 testing.
-- The user now wants it available to every organization on the Entreprise
-- plan and above (not a per-org grant), with the Intégrations screen itself
-- always visible — Bexio just shows locked if the plan doesn't include it.
-- Retiring the private-module mechanism for it: the grant made for testing
-- is removed, and the registry entry is dropped so the admin panel's module
-- list doesn't show a stale, no-longer-functional "Bexio" entry.

alter table public.plans add column has_bexio_integration boolean not null default false;

update public.plans set has_bexio_integration = true where id in ('pro', 'illimite', 'custom');

delete from public.organization_modules
where module_id in (select id from public.modules where key = 'bexio_integration');

delete from public.modules where key = 'bexio_integration';

notify pgrst, 'reload schema';
