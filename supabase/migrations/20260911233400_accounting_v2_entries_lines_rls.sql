create policy "org members can view accounting entries" on public.accounting_entries
  for select using (public.can_view_org_accounting(organization_id));
create policy "authorized members create draft entries" on public.accounting_entries
  for insert with check (status = 'brouillon' and public.can_manage_org_accounting_drafts(organization_id));
-- Direct client updates only ever touch a still-draft entry — the
-- brouillon -> comptabilisee/extournee transitions happen exclusively
-- inside the security-definer posting/reversal functions (table-owner
-- writes, which bypass RLS by design, same as every other state-machine
-- RPC in this project e.g. downgrade_expired_trials()).
create policy "authorized members edit draft entries" on public.accounting_entries
  for update using (status = 'brouillon' and public.can_manage_org_accounting_drafts(organization_id))
  with check (status = 'brouillon');
create policy "authorized members delete draft entries" on public.accounting_entries
  for delete using (status = 'brouillon' and public.can_manage_org_accounting_drafts(organization_id));

create policy "org members can view entry lines" on public.accounting_entry_lines
  for select using (exists (
    select 1 from public.accounting_entries e
    where e.id = entry_id and public.can_view_org_accounting(e.organization_id)
  ));
create policy "authorized members manage draft entry lines" on public.accounting_entry_lines
  for insert with check (exists (
    select 1 from public.accounting_entries e
    where e.id = entry_id and e.status = 'brouillon' and public.can_manage_org_accounting_drafts(e.organization_id)
  ));
create policy "authorized members update draft entry lines" on public.accounting_entry_lines
  for update using (exists (
    select 1 from public.accounting_entries e
    where e.id = entry_id and e.status = 'brouillon' and public.can_manage_org_accounting_drafts(e.organization_id)
  ));
create policy "authorized members delete draft entry lines" on public.accounting_entry_lines
  for delete using (exists (
    select 1 from public.accounting_entries e
    where e.id = entry_id and e.status = 'brouillon' and public.can_manage_org_accounting_drafts(e.organization_id)
  ));

create policy "org members can view attachments" on public.accounting_attachments
  for select using (exists (
    select 1 from public.accounting_entries e
    where e.id = entry_id and public.can_view_org_accounting(e.organization_id)
  ));
create policy "authorized members add attachments" on public.accounting_attachments
  for insert with check (exists (
    select 1 from public.accounting_entries e
    where e.id = entry_id and public.can_manage_org_accounting_drafts(e.organization_id)
  ));
create policy "authorized members remove draft attachments" on public.accounting_attachments
  for delete using (exists (
    select 1 from public.accounting_entries e
    where e.id = entry_id and e.status = 'brouillon' and public.can_manage_org_accounting_drafts(e.organization_id)
  ));

create policy "org members can view audit events" on public.accounting_audit_events
  for select using (public.can_view_org_accounting(organization_id));
-- No insert/update/delete policy — written exclusively by security-definer
-- functions (table-owner bypass), never directly by a client.

notify pgrst, 'reload schema';
