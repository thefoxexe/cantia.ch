-- §6.4's explicit requirement for auto_post rules: "l'auto-comptabilisation
-- ne doit être activée qu'explicitement avec un journal d'audit". The
-- booking itself is already traced (the dépense insert, the entry the
-- trigger posts, the match event link_bank_transaction_to_entry_line
-- writes) — this adds the one thing those don't capture: WHICH rule
-- decided to act without a human confirming it.
create or replace function public.record_bank_rule_application(p_transaction_id uuid, p_rule_id uuid, p_expense_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
begin
  select organization_id into v_org_id from public.bank_transactions where id = p_transaction_id;
  if v_org_id is null then
    raise exception 'Transaction bancaire introuvable';
  end if;
  if auth.uid() is not null and not public.can_validate_org_bank_reconciliations(v_org_id) then
    raise exception 'Accès refusé';
  end if;

  insert into public.accounting_audit_events (organization_id, user_id, action, entity_type, entity_id, new_values, source)
  values (v_org_id, auth.uid(), 'auto_reconcile_rule', 'bank_transaction', p_transaction_id, jsonb_build_object('rule_id', p_rule_id, 'expense_id', p_expense_id), 'import_bancaire');
end;
$$;
revoke all on function public.record_bank_rule_application(uuid, uuid, uuid) from public;
revoke execute on function public.record_bank_rule_application(uuid, uuid, uuid) from anon;
grant execute on function public.record_bank_rule_application(uuid, uuid, uuid) to authenticated;

notify pgrst, 'reload schema';
