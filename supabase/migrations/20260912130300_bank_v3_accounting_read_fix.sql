-- Lot 3's reconciliation screens (findEntryLineCandidates,
-- findAutoPostedEntryLine, the vat_codes lookup behind auto_post rules)
-- all read accounting_entries / accounting_entry_lines / vat_codes, whose
-- RLS SELECT policies are keyed on can_view_org_accounting — a narrower,
-- differently-scoped check than the can_import_org_bank_statements /
-- can_validate_org_bank_reconciliations floor those screens are actually
-- gated on (both OR can_view_org_finances, not any accounting-specific
-- role flag). A member granted only bank access, with none of the three
-- accounting role flags, could open the reconciliation screen but have
-- every ledger read silently return empty under RLS — not a permission
-- error, just candidates and rates that never appear. Reconciling
-- inherently requires reading the ledger, so can_view_org_accounting
-- widens to also recognize bank access — this single change is enough
-- because every affected table's read policy already keys on this one
-- function.
create or replace function public.can_view_org_accounting(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select
    public.is_org_admin(org_id)
    or public.can_import_org_bank_statements(org_id)
    or public.can_validate_org_bank_reconciliations(org_id)
    or exists (
      select 1 from public.organization_members m
      join public.organization_roles r on r.id = m.role_id
      where m.organization_id = org_id and m.user_id = auth.uid()
        and (r.can_view_accounting or r.can_manage_accounting_drafts or r.can_post_accounting_entries)
    );
$$;

notify pgrst, 'reload schema';
