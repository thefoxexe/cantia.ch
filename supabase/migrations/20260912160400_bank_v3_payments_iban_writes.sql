-- Completes the previous migration's fix: reading a subcontractor/employee
-- IBAN through the new RPCs works for a can_generate_payments-only
-- custom role, but FIXING a missing one (setSubcontractorIban,
-- setEmployeeIban in lib/api/payments.ts) still went straight through
-- direct table UPDATEs gated by can_view_org_subcontractors /
-- can_manage_org_payroll — permissions that role doesn't have either.
-- Two narrow write RPCs, same scoping as the read side.
create or replace function public.payments_set_subcontractor_iban(p_organization_id uuid, p_subcontractor_id uuid, p_iban text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.can_generate_org_payments(p_organization_id) then
    raise exception 'Accès refusé';
  end if;
  update public.subcontractors
  set iban = p_iban
  where id = p_subcontractor_id and organization_id = p_organization_id;
end;
$$;
revoke all on function public.payments_set_subcontractor_iban(uuid, uuid, text) from public;
revoke execute on function public.payments_set_subcontractor_iban(uuid, uuid, text) from anon;
grant execute on function public.payments_set_subcontractor_iban(uuid, uuid, text) to authenticated;

create or replace function public.payments_set_employee_iban(p_organization_id uuid, p_user_id uuid, p_iban text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.can_generate_org_payments(p_organization_id) then
    raise exception 'Accès refusé';
  end if;
  update public.payroll_profiles
  set iban = p_iban
  where organization_id = p_organization_id and user_id = p_user_id;
end;
$$;
revoke all on function public.payments_set_employee_iban(uuid, uuid, text) from public;
revoke execute on function public.payments_set_employee_iban(uuid, uuid, text) from anon;
grant execute on function public.payments_set_employee_iban(uuid, uuid, text) to authenticated;

notify pgrst, 'reload schema';
