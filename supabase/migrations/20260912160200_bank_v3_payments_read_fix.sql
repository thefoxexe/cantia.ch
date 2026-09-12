-- Same class of gap the previous two migrations closed for bank
-- permissions, found by re-checking payments.ts against the same
-- question: can_generate_org_payments was deliberately kept admin-only
-- (not OR'd with a broader floor, unlike the bank permissions) — correct
-- for not over-widening, but it means a custom role granted ONLY
-- can_generate_payments has no access to subcontractor_invoices
-- (gated by can_view_org_subcontractors), payroll_expenses or
-- payroll_profiles (gated by can_manage_org_payroll): listPayableInvoices/
-- listPayableExpenseReimbursements would silently return empty for such
-- a role. Fails closed rather than open (an admin is unaffected, this
-- only limits a narrower custom grant), but still a real functional gap
-- for the permission model §13 describes. Two narrow read RPCs, same
-- pattern as the bank fixes.
create or replace function public.payments_list_payable_subcontractor_invoices(p_organization_id uuid)
returns table (id uuid, amount numeric, invoice_date date, company_name text, iban text)
language sql
security definer
stable
set search_path = public
as $$
  select si.id, si.amount, si.invoice_date, s.company_name, s.iban
  from public.subcontractor_invoices si
  left join public.project_subcontractors ps on ps.id = si.project_subcontractor_id
  left join public.subcontractors s on s.id = ps.subcontractor_id
  where si.organization_id = p_organization_id
    and si.paid = false
    and (auth.uid() is null or public.can_generate_org_payments(p_organization_id))
    and not exists (
      select 1 from public.payment_batch_items pbi
      where pbi.organization_id = p_organization_id and pbi.source_type = 'subcontractor_invoice' and pbi.source_id = si.id
    );
$$;
revoke all on function public.payments_list_payable_subcontractor_invoices(uuid) from public;
revoke execute on function public.payments_list_payable_subcontractor_invoices(uuid) from anon;
grant execute on function public.payments_list_payable_subcontractor_invoices(uuid) to authenticated;

create or replace function public.payments_list_payable_expense_reimbursements(p_organization_id uuid)
returns table (id uuid, amount_chf numeric, expense_date date, note text, user_id uuid, employee_name text, iban text)
language sql
security definer
stable
set search_path = public
as $$
  select pe.id, pe.amount_chf, pe.expense_date, pe.note, pe.user_id, om.full_name, pp.iban
  from public.payroll_expenses pe
  left join public.organization_members om on om.organization_id = p_organization_id and om.user_id = pe.user_id
  left join public.payroll_profiles pp on pp.organization_id = p_organization_id and pp.user_id = pe.user_id
  where pe.organization_id = p_organization_id
    and pe.paid = false
    and (auth.uid() is null or public.can_generate_org_payments(p_organization_id))
    and not exists (
      select 1 from public.payment_batch_items pbi
      where pbi.organization_id = p_organization_id and pbi.source_type = 'payroll_expense' and pbi.source_id = pe.id
    );
$$;
revoke all on function public.payments_list_payable_expense_reimbursements(uuid) from public;
revoke execute on function public.payments_list_payable_expense_reimbursements(uuid) from anon;
grant execute on function public.payments_list_payable_expense_reimbursements(uuid) to authenticated;

notify pgrst, 'reload schema';
