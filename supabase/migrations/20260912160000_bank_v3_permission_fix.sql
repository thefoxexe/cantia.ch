-- Self-review fix: 20260912130300_bank_v3_accounting_read_fix widened
-- can_view_org_accounting to also accept can_import_org_bank_statements /
-- can_validate_org_bank_reconciliations — but those two both already
-- fall back to the broad, older can_view_org_finances (kept for Lot 3a
-- non-regression, see 20260912120100's own comment). Transitively, that
-- migration made can_view_org_accounting true for EVERY member with
-- can_view_finances — the flag that only ever meant "can see devis and
-- factures" — handing them read access to the full ledger, VAT codes,
-- fiscal years and account mappings the Lot 1/2 permission model
-- deliberately kept behind its own, narrower, dedicated flags. That is a
-- real over-widening, not the fix it was meant to be. Reverted here.
--
-- The actual, narrower problem — reconciliation screens needing to read
-- ledger rows a bank-only permission holder can act on — is solved
-- instead with three SECURITY DEFINER functions below, each gated
-- directly on the bank permissions and nothing broader, so no RLS
-- policy anyone else depends on changes shape.
create or replace function public.can_view_org_accounting(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select
    public.is_org_admin(org_id)
    or exists (
      select 1 from public.organization_members m
      join public.organization_roles r on r.id = m.role_id
      where m.organization_id = org_id and m.user_id = auth.uid()
        and (r.can_view_accounting or r.can_manage_accounting_drafts or r.can_post_accounting_entries)
    );
$$;

create or replace function public.bank_find_entry_line_candidates(p_transaction_id uuid)
returns table (entry_line_id uuid, entry_id uuid, entry_number integer, entry_date date, label text, source text, debit numeric, credit numeric)
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_tx record;
  v_account record;
begin
  select * into v_tx from public.bank_transactions where id = p_transaction_id;
  if not found then return; end if;
  if auth.uid() is not null and not (public.can_import_org_bank_statements(v_tx.organization_id) or public.can_validate_org_bank_reconciliations(v_tx.organization_id)) then
    raise exception 'Accès refusé';
  end if;

  select ba.* into v_account from public.bank_accounts ba where ba.id = v_tx.bank_account_id;
  if v_account.accounting_account_id is null then return; end if;

  return query
    select l.id, e.id, e.entry_number, e.entry_date, coalesce(nullif(l.label, ''), e.label), e.source, l.debit, l.credit
    from public.accounting_entry_lines l
    join public.accounting_entries e on e.id = l.entry_id
    where l.account_id = v_account.accounting_account_id
      and e.organization_id = v_tx.organization_id
      and e.status = 'comptabilisee'
      and e.entry_date between (v_tx.booking_date - interval '45 days')::date and (v_tx.booking_date + interval '45 days')::date
      and not exists (select 1 from public.bank_transactions bt where bt.matched_entry_line_id = l.id)
      and (
        (v_tx.amount > 0 and l.debit > 0 and abs(l.debit - v_tx.amount) < 0.01)
        or
        (v_tx.amount < 0 and l.credit > 0 and abs(l.credit - abs(v_tx.amount)) < 0.01)
      )
    order by abs(extract(epoch from (e.entry_date - v_tx.booking_date)));
end;
$$;
revoke all on function public.bank_find_entry_line_candidates(uuid) from public;
revoke execute on function public.bank_find_entry_line_candidates(uuid) from anon;
grant execute on function public.bank_find_entry_line_candidates(uuid) to authenticated;

create or replace function public.bank_find_auto_posted_entry_line(p_organization_id uuid, p_source text, p_source_id uuid, p_accounting_account_id uuid)
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select l.id
  from public.accounting_entry_lines l
  join public.accounting_entries e on e.id = l.entry_id
  where l.account_id = p_accounting_account_id
    and e.organization_id = p_organization_id
    and e.source = p_source
    and e.source_id = p_source_id
    and e.status = 'comptabilisee'
    and (
      auth.uid() is null
      or public.can_import_org_bank_statements(p_organization_id)
      or public.can_validate_org_bank_reconciliations(p_organization_id)
    )
  limit 1;
$$;
revoke all on function public.bank_find_auto_posted_entry_line(uuid, text, uuid, uuid) from public;
revoke execute on function public.bank_find_auto_posted_entry_line(uuid, text, uuid, uuid) from anon;
grant execute on function public.bank_find_auto_posted_entry_line(uuid, text, uuid, uuid) to authenticated;

create or replace function public.bank_vat_rate_for_code(p_organization_id uuid, p_code text, p_at_date date)
returns numeric
language sql
security definer
stable
set search_path = public
as $$
  select rate
  from public.vat_codes
  where organization_id = p_organization_id
    and code = p_code
    and valid_from <= p_at_date
    and (valid_to is null or valid_to >= p_at_date)
    and (auth.uid() is null or public.can_import_org_bank_statements(p_organization_id))
  limit 1;
$$;
revoke all on function public.bank_vat_rate_for_code(uuid, text, date) from public;
revoke execute on function public.bank_vat_rate_for_code(uuid, text, date) from anon;
grant execute on function public.bank_vat_rate_for_code(uuid, text, date) to authenticated;

notify pgrst, 'reload schema';
