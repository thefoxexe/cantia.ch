-- A Stripe event retried after a partial refund must not cut the
-- commission twice: every handled event leaves an audit row carrying its
-- id, checked here as well as the adjustment rows.
create or replace function public.partners_record_refund(
  p_payment_intent text,
  p_event_id text,
  p_share numeric,
  p_reason text,
  p_reinstate boolean default false
)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_c public.partner_commissions%rowtype;
  v_cut numeric;
begin
  if p_payment_intent is null then
    return jsonb_build_object('handled', false, 'reason', 'no payment intent');
  end if;
  select * into v_c from public.partner_commissions
   where stripe_payment_intent = p_payment_intent and kind = 'commission'
   order by created_at limit 1;
  if not found then
    return jsonb_build_object('handled', false, 'reason', 'no commission for this payment');
  end if;
  if exists (select 1 from public.partner_commissions where stripe_event_id = p_event_id)
     or exists (select 1 from public.partner_audit_log where new_value ->> 'event' = p_event_id) then
    return jsonb_build_object('handled', false, 'reason', 'already handled');
  end if;

  if p_reinstate then
    if v_c.status = 'CANCELLED' then
      update public.partner_commissions set status = 'PENDING', cancelled_reason = null where id = v_c.id;
    else
      -- Undo the negative adjustments created for this payment.
      update public.partner_commissions set status = 'CANCELLED', cancelled_reason = 'dispute won'
       where kind = 'adjustment' and stripe_payment_intent = p_payment_intent and status in ('PENDING', 'AVAILABLE');
    end if;
    insert into public.partner_audit_log (action, entity_type, entity_id, new_value, reason)
    values ('commission_reinstated', 'commission', v_c.id, jsonb_build_object('event', p_event_id), p_reason);
    return jsonb_build_object('handled', true, 'action', 'reinstated');
  end if;

  v_cut := round(v_c.amount_chf * least(greatest(coalesce(p_share, 1), 0), 1), 2);
  if v_c.status in ('PENDING', 'AVAILABLE') then
    if v_cut >= v_c.amount_chf then
      update public.partner_commissions set status = 'CANCELLED', cancelled_reason = p_reason where id = v_c.id;
    else
      update public.partner_commissions set amount_chf = amount_chf - v_cut where id = v_c.id;
    end if;
    insert into public.partner_audit_log (action, entity_type, entity_id, new_value, reason)
    values ('commission_reduced', 'commission', v_c.id, jsonb_build_object('cut', v_cut, 'event', p_event_id), p_reason);
    return jsonb_build_object('handled', true, 'action', 'reduced', 'cut', v_cut);
  end if;
  if v_c.status = 'PAID' then
    insert into public.partner_commissions (
      partner_id, organization_id, public_ref, kind, stripe_invoice_id, stripe_payment_intent, stripe_event_id,
      base_amount_chf, rate, amount_chf, billing, status, paid_at, available_at, cancelled_reason
    ) values (
      v_c.partner_id, v_c.organization_id, v_c.public_ref, 'adjustment', v_c.stripe_invoice_id, p_payment_intent, p_event_id,
      0, v_c.rate, -v_cut, v_c.billing, 'AVAILABLE', now(), now(), p_reason
    );
    return jsonb_build_object('handled', true, 'action', 'adjustment', 'cut', v_cut);
  end if;
  return jsonb_build_object('handled', false, 'reason', 'commission already cancelled');
end;
$$;
