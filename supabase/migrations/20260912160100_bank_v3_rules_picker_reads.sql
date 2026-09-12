-- Same gap as the previous migration, one screen over: regles-bancaires.tsx
-- lets a bank-permission holder create/manage bank_rules (gated on
-- can_import_org_bank_statements, correctly, per its own RLS) but its
-- account/vat-code pickers called listAccounts/listVatCodes directly,
-- which are can_view_org_accounting-gated — a narrower permission bank
-- access alone doesn't (and shouldn't) grant. Two narrow read RPCs, same
-- shape as the previous migration's, scoped to exactly what configuring
-- a rule needs.
create or replace function public.bank_list_charge_accounts(p_organization_id uuid)
returns table (id uuid, code text, label text)
language sql
security definer
stable
set search_path = public
as $$
  select a.id, a.code, a.label
  from public.accounting_accounts a
  where a.organization_id = p_organization_id
    and a.type = 'charge'
    and a.is_active
    and (auth.uid() is null or public.can_import_org_bank_statements(p_organization_id))
  order by a.code;
$$;
revoke all on function public.bank_list_charge_accounts(uuid) from public;
revoke execute on function public.bank_list_charge_accounts(uuid) from anon;
grant execute on function public.bank_list_charge_accounts(uuid) to authenticated;

create or replace function public.bank_list_deductible_vat_codes(p_organization_id uuid)
returns table (id uuid, code text, label text, rate numeric)
language sql
security definer
stable
set search_path = public
as $$
  select v.id, v.code, v.label, v.rate
  from public.vat_codes v
  where v.organization_id = p_organization_id
    and v.category like 'achat%'
    and v.is_active
    and (auth.uid() is null or public.can_import_org_bank_statements(p_organization_id))
  order by v.category, v.valid_from desc;
$$;
revoke all on function public.bank_list_deductible_vat_codes(uuid) from public;
revoke execute on function public.bank_list_deductible_vat_codes(uuid) from anon;
grant execute on function public.bank_list_deductible_vat_codes(uuid) to authenticated;

notify pgrst, 'reload schema';
