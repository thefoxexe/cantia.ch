-- Cantia Partners: one company, one attribution.
--
-- Attribution is per company (referral_attributions is keyed on the
-- organization), never per user: colleagues who join through an invite are
-- members, not new companies, and are never counted. Levels count paying
-- companies. The remaining case is an owner who re-creates a company (new
-- account for the same business): the new company inherits the commission
-- window already running, so the 12 months never restart.

create or replace function public.partners_attribute_core(
  p_organization_id uuid,
  p_owner_id uuid,
  p_code text,
  p_visitor_id text,
  p_first_click_at timestamptz,
  p_source text
)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_code text := upper(trim(coalesce(p_code, '')));
  v_partner public.partner_profiles%rowtype;
  v_window integer;
  v_ref text;
  v_first_paid timestamptz;
  v_until timestamptz;
begin
  if v_code !~ '^[A-Z0-9]{6,12}$' then
    return jsonb_build_object('attributed', false, 'reason', 'invalid_code');
  end if;
  if exists (select 1 from public.referral_attributions where organization_id = p_organization_id) then
    return jsonb_build_object('attributed', false, 'reason', 'already_attributed');
  end if;

  select p.* into v_partner
  from public.partner_referral_codes c
  join public.partner_profiles p on p.id = c.partner_id
  where c.code = v_code and p.status = 'ACTIVE';
  if not found then
    return jsonb_build_object('attributed', false, 'reason', 'invalid_code');
  end if;
  if v_partner.user_id = p_owner_id then
    insert into public.partner_audit_log (actor_id, action, entity_type, entity_id, new_value)
    values (p_owner_id, 'self_referral_blocked', 'partner', v_partner.id, jsonb_build_object('organization_id', p_organization_id));
    return jsonb_build_object('attributed', false, 'reason', 'self_referral');
  end if;

  -- The 90-day window applies to a clicked link. A code typed by the
  -- client is a deliberate choice and has no window.
  select attribution_days into v_window from public.partners_config;
  if p_source = 'link' and p_first_click_at is not null and p_first_click_at < now() - make_interval(days => v_window) then
    return jsonb_build_object('attributed', false, 'reason', 'expired');
  end if;

  loop
    v_ref := 'CNT-' || lpad((floor(random() * 9000) + 1000)::int::text, 4, '0');
    exit when not exists (select 1 from public.referral_attributions where public_ref = v_ref);
  end loop;

  -- Same company, second account: when this owner already brought a
  -- company to this partner, the new one inherits its commission window
  -- (a company that re-creates its account does not restart the 12 months).
  select min(a.first_paid_at), min(a.commission_eligible_until)
    into v_first_paid, v_until
  from public.referral_attributions a
  join public.organization_members m on m.organization_id = a.organization_id and m.user_id = p_owner_id and m.role = 'owner'
  where a.partner_id = v_partner.id and a.first_paid_at is not null;

  insert into public.referral_attributions (organization_id, partner_id, code, visitor_id, first_click_at, public_ref, source, first_paid_at, commission_eligible_until)
  values (p_organization_id, v_partner.id, v_code, left(p_visitor_id, 64), p_first_click_at, v_ref, p_source, v_first_paid, v_until)
  on conflict (organization_id) do nothing;
  return jsonb_build_object('attributed', found);
exception when others then
  return jsonb_build_object('attributed', false, 'reason', 'error');
end;
$$;
revoke execute on function public.partners_attribute_core(uuid, uuid, text, text, timestamptz, text) from public, anon, authenticated;
