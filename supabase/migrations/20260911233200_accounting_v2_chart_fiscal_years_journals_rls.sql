create policy "org members can view chart of accounts" on public.accounting_accounts
  for select using (public.can_view_org_accounting(organization_id));
create policy "authorized members manage chart of accounts" on public.accounting_accounts
  for insert with check (public.can_manage_org_chart_of_accounts(organization_id));
create policy "authorized members update chart of accounts" on public.accounting_accounts
  for update using (public.can_manage_org_chart_of_accounts(organization_id));
-- No delete policy — §4.1 "un compte utilisé ne peut plus être supprimé,
-- seulement archivé" (is_active = false via the update policy above); an
-- unused account can still be hard-deleted by a platform admin via SQL if
-- ever truly needed, but never through the app.

create policy "org members can view fiscal years" on public.accounting_fiscal_years
  for select using (public.can_view_org_accounting(organization_id));
create policy "authorized members manage fiscal years" on public.accounting_fiscal_years
  for insert with check (public.can_close_org_fiscal_year(organization_id));
create policy "authorized members update fiscal years" on public.accounting_fiscal_years
  for update using (public.can_close_org_fiscal_year(organization_id));

create policy "org members can view journals" on public.accounting_journals
  for select using (public.can_view_org_accounting(organization_id));
create policy "authorized members manage journals" on public.accounting_journals
  for insert with check (public.can_manage_org_chart_of_accounts(organization_id));
create policy "authorized members update journals" on public.accounting_journals
  for update using (public.can_manage_org_chart_of_accounts(organization_id));

notify pgrst, 'reload schema';
