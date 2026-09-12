create policy "org members can view bank imports" on public.bank_statement_imports
  for select using (public.can_import_org_bank_statements(organization_id) or public.can_validate_org_bank_reconciliations(organization_id));
create policy "authorized members create bank imports" on public.bank_statement_imports
  for insert with check (public.can_import_org_bank_statements(organization_id));
-- No update/delete — an import is an evidentiary record of what was
-- uploaded and when (§3.3 traçabilité); correcting a mistaken import means
-- ignoring or re-matching its transactions, not editing the import itself.

create policy "org members can view bank transactions" on public.bank_transactions
  for select using (public.can_import_org_bank_statements(organization_id) or public.can_validate_org_bank_reconciliations(organization_id));
create policy "authorized members create bank transactions" on public.bank_transactions
  for insert with check (public.can_import_org_bank_statements(organization_id));
-- No update policy on the table itself — status/matched_* only ever change
-- through the SECURITY DEFINER functions below, which validate the match
-- (amount, sign, ownership) before touching a row. Letting the client
-- UPDATE bank_transactions directly would let it mark anything "matched"
-- to anything, with no invariant enforced.

notify pgrst, 'reload schema';
