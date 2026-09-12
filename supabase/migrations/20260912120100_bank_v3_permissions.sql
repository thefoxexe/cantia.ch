-- §13: "importer la banque" and "valider les rapprochements" as separate
-- permissions. Non-regressive on purpose: the existing statement-import
-- screen (app/(app)/devis/factures/import-releve.tsx) has shipped with no
-- dedicated gate beyond ordinary finance access, and real orgs already use
-- it — can_view_org_finances (the per-member flag) stays a valid floor for
-- both new checks below so nobody who could import/reconcile yesterday
-- loses that ability today. Custom roles can additionally grant either
-- capability more narrowly going forward via the two new flags.
alter table public.organization_roles
  add column can_import_bank_statements boolean not null default false,
  add column can_validate_bank_reconciliations boolean not null default false;

create or replace function public.can_import_org_bank_statements(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select
    public.is_org_admin(org_id)
    or public.can_view_org_finances(org_id)
    or exists (
      select 1 from public.organization_members m
      join public.organization_roles r on r.id = m.role_id
      where m.organization_id = org_id and m.user_id = auth.uid() and r.can_import_bank_statements
    );
$$;

create or replace function public.can_validate_org_bank_reconciliations(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select
    public.is_org_admin(org_id)
    or public.can_view_org_finances(org_id)
    or exists (
      select 1 from public.organization_members m
      join public.organization_roles r on r.id = m.role_id
      where m.organization_id = org_id and m.user_id = auth.uid() and r.can_validate_bank_reconciliations
    );
$$;

notify pgrst, 'reload schema';
