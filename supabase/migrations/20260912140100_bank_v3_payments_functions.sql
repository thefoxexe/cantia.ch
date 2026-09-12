-- §6.5 "Marquer les éléments comme « paiement préparé », puis « payé »
-- uniquement après confirmation ou rapprochement bancaire" — this session
-- implements the manual-confirmation half (a human confirms the payment
-- actually left the bank, e.g. after seeing it on a later statement).
-- Marks the batch, every one of its items, and propagates to the source
-- rows that carry their own paid flag (subcontractor_invoices,
-- payroll_expenses) so existing screens reading those tables stay
-- accurate without needing to know payment_batches exists.
create or replace function public.mark_payment_batch_paid(p_batch_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_batch record;
  v_item record;
begin
  select * into v_batch from public.payment_batches where id = p_batch_id for update;
  if not found then
    raise exception 'Ordre de paiement introuvable';
  end if;
  if auth.uid() is not null and not public.can_generate_org_payments(v_batch.organization_id) then
    raise exception 'Accès refusé : vous ne pouvez pas confirmer de paiements pour cette organisation';
  end if;
  if v_batch.status <> 'prepare' then
    raise exception 'Cet ordre de paiement a déjà été marqué comme payé';
  end if;

  update public.payment_batches set status = 'paye', paid_at = now() where id = p_batch_id;

  for v_item in select * from public.payment_batch_items where batch_id = p_batch_id loop
    if v_item.source_type = 'subcontractor_invoice' then
      update public.subcontractor_invoices set paid = true, paid_at = now() where id = v_item.source_id;
    elsif v_item.source_type = 'payroll_expense' then
      update public.payroll_expenses set paid = true, paid_at = now() where id = v_item.source_id;
    end if;
  end loop;

  insert into public.accounting_audit_events (organization_id, user_id, action, entity_type, entity_id, new_values, source)
  values (v_batch.organization_id, auth.uid(), 'payment_batch_paid', 'payment_batch', p_batch_id, jsonb_build_object('kind', v_batch.kind, 'control_sum', v_batch.control_sum), 'import_bancaire');
end;
$$;
revoke all on function public.mark_payment_batch_paid(uuid) from public;
revoke execute on function public.mark_payment_batch_paid(uuid) from anon;
grant execute on function public.mark_payment_batch_paid(uuid) to authenticated;

notify pgrst, 'reload schema';
