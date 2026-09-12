create policy "org members can view bank accounts" on public.bank_accounts
  for select using (public.can_import_org_bank_statements(organization_id) or public.can_validate_org_bank_reconciliations(organization_id));
create policy "authorized members manage bank accounts" on public.bank_accounts
  for insert with check (public.can_import_org_bank_statements(organization_id));
create policy "authorized members update bank accounts" on public.bank_accounts
  for update using (public.can_import_org_bank_statements(organization_id));
-- No delete policy — a bank account that already has imports/transactions
-- attached must be archived (is_active = false), never removed, so the
-- audit trail behind every past reconciliation stays intact.

notify pgrst, 'reload schema';
