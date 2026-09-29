-- Cantia Partners, step 2: commissions and payouts.
--
-- Stripe is the source of truth: stripe-webhook calls
-- partners_record_payment() on invoice.paid and partners_record_refund() on
-- charge.refunded / charge.dispute.*. Every write is idempotent on Stripe
-- ids. A commission is 25% of the amount paid excluding VAT, for invoices
-- paid within 12 months of the organization's first payment, and becomes
-- available 30 days after payment (refund window). Payouts are prepared and
-- marked paid by a partners.admin in the admin area of partners.cantia.ch.

create table public.partner_payouts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partner_profiles(id) on delete restrict,
  period date not null,
  amount_chf numeric(12, 2) not null,
  commission_count integer not null default 0,
  status text not null default 'TO_PAY' check (status in ('TO_PAY', 'PAID', 'CANCELLED')),
  -- Snapshot of the bank details used for this transfer.
  account_holder text,
  iban text,
  reference text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  paid_at timestamptz,
  paid_by uuid references auth.users(id)
);
create index on public.partner_payouts (partner_id, created_at desc);
create index on public.partner_payouts (status);
alter table public.partner_payouts enable row level security;
create policy "partners admins read payouts" on public.partner_payouts
  for select using (public.has_platform_permission('partners.admin'));

create table public.partner_commissions (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partner_profiles(id) on delete restrict,
  organization_id uuid references public.organizations(id) on delete set null,
  public_ref text,
  kind text not null default 'commission' check (kind in ('commission', 'adjustment')),
  stripe_invoice_id text,
  stripe_payment_intent text,
  stripe_event_id text unique,
  base_amount_chf numeric(12, 2) not null,
  rate numeric(5, 4) not null,
  amount_chf numeric(12, 2) not null,
  billing text,
  status text not null default 'PENDING' check (status in ('PENDING', 'AVAILABLE', 'PAID', 'CANCELLED')),
  paid_at timestamptz not null,
  available_at timestamptz not null,
  payout_id uuid references public.partner_payouts(id) on delete set null,
  cancelled_reason text,
  created_at timestamptz not null default now()
);
create unique index partner_commissions_invoice_key on public.partner_commissions (stripe_invoice_id) where kind = 'commission';
create index on public.partner_commissions (partner_id, paid_at desc);
create index on public.partner_commissions (stripe_payment_intent);
create index on public.partner_commissions (status, available_at);
alter table public.partner_commissions enable row level security;
create policy "partners admins read commissions" on public.partner_commissions
  for select using (public.has_platform_permission('partners.admin'));

-- ---------------------------------------------------------------------------
-- Stripe side (service role only)

create or replace function public.partners_record_payment(
  p_organization_id uuid,
  p_invoice_id text,
  p_payment_intent text,
  p_net_amount_chf numeric,
  p_paid_at timestamptz,
  p_billing text default null
)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_attr public.referral_attributions%rowtype;
  v_cfg public.partners_config%rowtype;
  v_partner public.partner_profiles%rowtype;
  v_amount numeric;
  v_id uuid;
begin
  if p_organization_id is null or p_invoice_id is null or coalesce(p_net_amount_chf, 0) <= 0 then
    return jsonb_build_object('recorded', false, 'reason', 'nothing to record');
  end if;
  select * into v_attr from public.referral_attributions where organization_id = p_organization_id;
  if not found then
    return jsonb_build_object('recorded', false, 'reason', 'not referred');
  end if;
  select * into v_cfg from public.partners_config limit 1;
  select * into v_partner from public.partner_profiles where id = v_attr.partner_id;

  -- The 12-month window starts with the first real payment.
  if v_attr.first_paid_at is null then
    update public.referral_attributions
       set first_paid_at = p_paid_at,
           commission_eligible_until = p_paid_at + make_interval(months => v_cfg.commission_months)
     where organization_id = p_organization_id
     returning * into v_attr;
  end if;
  if p_paid_at > v_attr.commission_eligible_until then
    return jsonb_build_object('recorded', false, 'reason', 'outside the commission window');
  end if;
  -- Blocked partners earn nothing; suspended ones keep what their existing
  -- clients pay (a suspension only stops new attributions).
  if v_partner.status = 'BLOCKED' then
    return jsonb_build_object('recorded', false, 'reason', 'partner blocked');
  end if;

  v_amount := round(p_net_amount_chf * v_cfg.commission_rate, 2);
  insert into public.partner_commissions (
    partner_id, organization_id, public_ref, kind, stripe_invoice_id, stripe_payment_intent,
    base_amount_chf, rate, amount_chf, billing, status, paid_at, available_at
  ) values (
    v_attr.partner_id, p_organization_id, v_attr.public_ref, 'commission', p_invoice_id, p_payment_intent,
    round(p_net_amount_chf, 2), v_cfg.commission_rate, v_amount, p_billing, 'PENDING', p_paid_at,
    p_paid_at + make_interval(days => v_cfg.validation_days)
  )
  on conflict (stripe_invoice_id) where kind = 'commission' do nothing
  returning id into v_id;

  if v_id is null then
    return jsonb_build_object('recorded', false, 'reason', 'already recorded');
  end if;
  return jsonb_build_object('recorded', true, 'commission_id', v_id, 'amount_chf', v_amount);
end;
$$;
revoke execute on function public.partners_record_payment(uuid, text, text, numeric, timestamptz, text) from public, anon, authenticated;
grant execute on function public.partners_record_payment(uuid, text, text, numeric, timestamptz, text) to service_role;

-- A refund or a dispute on a paid invoice. p_share is the refunded share of
-- the payment (0..1). A commission not yet paid out is cancelled (or
-- reduced); one already paid out gets a negative adjustment, deducted from
-- the partner's next payout. A dispute won afterwards reinstates it
-- (p_share = 0 with p_reinstate = true).
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
  if exists (select 1 from public.partner_commissions where stripe_event_id = p_event_id) then
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
revoke execute on function public.partners_record_refund(text, text, numeric, text, boolean) from public, anon, authenticated;
grant execute on function public.partners_record_refund(text, text, numeric, text, boolean) to service_role;

-- Daily: commissions past their 30 days become available.
create or replace function public.partners_release_commissions()
returns integer
language sql security definer set search_path = public as $$
  with released as (
    update public.partner_commissions set status = 'AVAILABLE'
     where status = 'PENDING' and available_at <= now()
    returning 1
  )
  select count(*)::int from released;
$$;
revoke execute on function public.partners_release_commissions() from public, anon, authenticated;

select cron.schedule('partners-release-commissions', '15 2 * * *', $$select public.partners_release_commissions()$$);

-- ---------------------------------------------------------------------------
-- Partner side

-- Levels follow the number of paying customers; thresholds live here so
-- the app and the admin read the same rule.
create or replace function public.partner_level(p_paying integer)
returns text
language sql immutable as $$
  select case when p_paying >= 15 then 'PREMIUM' when p_paying >= 5 then 'CONFIRMED' else 'MEMBER' end;
$$;

create or replace function public.my_partner_summary()
returns jsonb
language sql stable security definer set search_path = public as $$
  with me as (select id from public.partner_profiles where user_id = auth.uid()),
  c as (select pc.* from public.partner_commissions pc, me where pc.partner_id = me.id),
  paying as (
    select count(*)::int n from public.referral_attributions a
    join public.organizations o on o.id = a.organization_id, me
    where a.partner_id = me.id and a.first_paid_at is not null and o.subscription_status = 'active'
  ),
  cfg as (select * from public.partners_config limit 1)
  select jsonb_build_object(
    'pending_chf', coalesce((select sum(amount_chf) from c where status = 'PENDING'), 0),
    'available_chf', coalesce((select sum(amount_chf) from c where status = 'AVAILABLE' and payout_id is null), 0),
    'in_payout_chf', coalesce((select sum(amount_chf) from c where status = 'AVAILABLE' and payout_id is not null), 0),
    'paid_chf', coalesce((select sum(amount_chf) from c where status = 'PAID'), 0),
    'lifetime_chf', coalesce((select sum(amount_chf) from c where status in ('PENDING', 'AVAILABLE', 'PAID')), 0),
    'next_available_at', (select min(available_at) from c where status = 'PENDING'),
    'paying_customers', (select n from paying),
    'level', public.partner_level((select n from paying)),
    'min_payout_chf', (select min_payout_chf from cfg),
    'payout_day', (select payout_day from cfg)
  );
$$;
revoke execute on function public.my_partner_summary() from public, anon;
grant execute on function public.my_partner_summary() to authenticated;

create or replace function public.my_partner_commissions()
returns table (
  id uuid, public_ref text, kind text, base_amount_chf numeric, amount_chf numeric, billing text,
  status text, paid_at timestamptz, available_at timestamptz, cancelled_reason text
)
language sql stable security definer set search_path = public as $$
  select c.id, c.public_ref, c.kind, c.base_amount_chf, c.amount_chf, c.billing, c.status, c.paid_at, c.available_at, c.cancelled_reason
  from public.partner_commissions c
  join public.partner_profiles p on p.id = c.partner_id and p.user_id = auth.uid()
  order by c.paid_at desc
  limit 500;
$$;
revoke execute on function public.my_partner_commissions() from public, anon;
grant execute on function public.my_partner_commissions() to authenticated;

create or replace function public.my_partner_payouts()
returns table (id uuid, period date, amount_chf numeric, commission_count integer, status text, iban_last4 text, reference text, created_at timestamptz, paid_at timestamptz)
language sql stable security definer set search_path = public as $$
  select o.id, o.period, o.amount_chf, o.commission_count, o.status, right(o.iban, 4), o.reference, o.created_at, o.paid_at
  from public.partner_payouts o
  join public.partner_profiles p on p.id = o.partner_id and p.user_id = auth.uid()
  where o.status <> 'CANCELLED'
  order by o.created_at desc;
$$;
revoke execute on function public.my_partner_payouts() from public, anon;
grant execute on function public.my_partner_payouts() to authenticated;

-- ---------------------------------------------------------------------------
-- Admin side (partners.admin)

create or replace function public.partners_assert_admin()
returns void
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.has_platform_permission('partners.admin') then
    raise exception 'Accès réservé à l''administration Cantia Partners';
  end if;
end;
$$;

create or replace function public.partners_admin_overview()
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_cfg public.partners_config%rowtype;
  v_period date := date_trunc('month', now() at time zone 'Europe/Zurich')::date;
  v_eligible integer;
  v_available numeric;
begin
  perform public.partners_assert_admin();
  select * into v_cfg from public.partners_config limit 1;

  select count(*), coalesce(sum(total), 0) into v_eligible, v_available from (
    select c.partner_id, sum(c.amount_chf) total
    from public.partner_commissions c
    join public.partner_profiles p on p.id = c.partner_id
    where c.status = 'AVAILABLE' and c.payout_id is null and p.status <> 'BLOCKED' and not p.payouts_frozen
    group by c.partner_id
    having sum(c.amount_chf) >= v_cfg.min_payout_chf
  ) t;

  return jsonb_build_object(
    'period', v_period,
    'payout_day', v_cfg.payout_day,
    'reminder_day', v_cfg.admin_reminder_day,
    'min_payout_chf', v_cfg.min_payout_chf,
    'partners', (select count(*) from public.partner_profiles),
    'partners_active', (select count(*) from public.partner_profiles where status = 'ACTIVE'),
    'partners_new_30d', (select count(*) from public.partner_profiles where created_at > now() - interval '30 days'),
    'clicks_30d', (select count(*) from public.referral_clicks where created_at > now() - interval '30 days'),
    'signups_30d', (select count(*) from public.referral_attributions where attributed_at > now() - interval '30 days'),
    'signups_total', (select count(*) from public.referral_attributions),
    'paying_customers', (
      select count(*) from public.referral_attributions a join public.organizations o on o.id = a.organization_id
      where a.first_paid_at is not null and o.subscription_status = 'active'
    ),
    'pending_chf', coalesce((select sum(amount_chf) from public.partner_commissions where status = 'PENDING'), 0),
    'available_chf', coalesce((select sum(amount_chf) from public.partner_commissions where status = 'AVAILABLE' and payout_id is null), 0),
    'paid_chf', coalesce((select sum(amount_chf) from public.partner_commissions where status = 'PAID'), 0),
    'eligible_partners', v_eligible,
    'eligible_chf', v_available,
    'missing_iban', (
      select count(distinct c.partner_id) from public.partner_commissions c
      join public.partner_profiles p on p.id = c.partner_id
      where c.status = 'AVAILABLE' and c.payout_id is null and p.iban_masked is null
    ),
    'to_pay_count', (select count(*) from public.partner_payouts where status = 'TO_PAY'),
    'to_pay_chf', coalesce((select sum(amount_chf) from public.partner_payouts where status = 'TO_PAY'), 0),
    'paid_this_period', (select count(*) from public.partner_payouts where status = 'PAID' and period = v_period),
    'prepared_this_period', (select count(*) from public.partner_payouts where status <> 'CANCELLED' and period = v_period)
  );
end;
$$;
revoke execute on function public.partners_admin_overview() from public, anon;
grant execute on function public.partners_admin_overview() to authenticated;

create or replace function public.partners_admin_partners()
returns table (
  id uuid, email text, first_name text, last_name text, company_name text, partner_type text, status text,
  payouts_frozen boolean, iban_masked text, code text, created_at timestamptz,
  clicks integer, signups integer, paying integer, pending_chf numeric, available_chf numeric, paid_chf numeric
)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.partners_assert_admin();
  return query
  select p.id, u.email::text, p.first_name, p.last_name, p.company_name, p.partner_type, p.status,
         p.payouts_frozen, p.iban_masked,
         (select rc.code from public.partner_referral_codes rc where rc.partner_id = p.id order by rc.is_default desc, rc.created_at limit 1),
         p.created_at,
         (select count(*)::int from public.referral_clicks c where c.partner_id = p.id),
         (select count(*)::int from public.referral_attributions a where a.partner_id = p.id),
         (select count(*)::int from public.referral_attributions a join public.organizations o on o.id = a.organization_id
           where a.partner_id = p.id and a.first_paid_at is not null and o.subscription_status = 'active'),
         coalesce((select sum(c.amount_chf) from public.partner_commissions c where c.partner_id = p.id and c.status = 'PENDING'), 0),
         coalesce((select sum(c.amount_chf) from public.partner_commissions c where c.partner_id = p.id and c.status = 'AVAILABLE' and c.payout_id is null), 0),
         coalesce((select sum(c.amount_chf) from public.partner_commissions c where c.partner_id = p.id and c.status = 'PAID'), 0)
  from public.partner_profiles p
  join auth.users u on u.id = p.user_id
  order by p.created_at desc;
end;
$$;
revoke execute on function public.partners_admin_partners() from public, anon;
grant execute on function public.partners_admin_partners() to authenticated;

-- Creates this month's payouts: one per partner whose available balance
-- reaches the minimum, with bank details on file and payouts not frozen.
-- Safe to run several times.
create or replace function public.partners_admin_prepare_payouts()
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_cfg public.partners_config%rowtype;
  v_period date := date_trunc('month', now() at time zone 'Europe/Zurich')::date;
  r record;
  v_payout uuid;
  v_created integer := 0;
  v_skipped_iban integer := 0;
begin
  perform public.partners_assert_admin();
  select * into v_cfg from public.partners_config limit 1;
  for r in
    select c.partner_id, sum(c.amount_chf) total, count(*) n
    from public.partner_commissions c
    join public.partner_profiles p on p.id = c.partner_id
    where c.status = 'AVAILABLE' and c.payout_id is null and p.status <> 'BLOCKED' and not p.payouts_frozen
    group by c.partner_id
    having sum(c.amount_chf) >= v_cfg.min_payout_chf
  loop
    if not exists (select 1 from public.partner_payout_accounts where partner_id = r.partner_id) then
      v_skipped_iban := v_skipped_iban + 1;
      continue;
    end if;
    insert into public.partner_payouts (partner_id, period, amount_chf, commission_count, account_holder, iban, created_by, reference)
    select r.partner_id, v_period, r.total, r.n, a.account_holder, a.iban, auth.uid(),
           'CANTIA-P-' || to_char(v_period, 'YYYYMM') || '-' || upper(substr(replace(r.partner_id::text, '-', ''), 1, 6))
    from public.partner_payout_accounts a where a.partner_id = r.partner_id
    returning id into v_payout;
    update public.partner_commissions set payout_id = v_payout
     where partner_id = r.partner_id and status = 'AVAILABLE' and payout_id is null;
    insert into public.partner_audit_log (actor_id, action, entity_type, entity_id, new_value)
    values (auth.uid(), 'payout_prepared', 'payout', v_payout, jsonb_build_object('amount_chf', r.total, 'period', v_period));
    v_created := v_created + 1;
  end loop;
  return jsonb_build_object('created', v_created, 'skipped_missing_iban', v_skipped_iban);
end;
$$;
revoke execute on function public.partners_admin_prepare_payouts() from public, anon;
grant execute on function public.partners_admin_prepare_payouts() to authenticated;

create or replace function public.partners_admin_payouts(p_status text default null)
returns table (
  id uuid, partner_id uuid, partner_name text, company_name text, email text, period date, amount_chf numeric,
  commission_count integer, status text, account_holder text, iban text, reference text, created_at timestamptz, paid_at timestamptz
)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.partners_assert_admin();
  return query
  select o.id, o.partner_id, trim(p.first_name || ' ' || p.last_name), p.company_name, u.email::text, o.period, o.amount_chf,
         o.commission_count, o.status, o.account_holder, o.iban, o.reference, o.created_at, o.paid_at
  from public.partner_payouts o
  join public.partner_profiles p on p.id = o.partner_id
  join auth.users u on u.id = p.user_id
  where p_status is null or o.status = p_status
  order by o.created_at desc
  limit 300;
end;
$$;
revoke execute on function public.partners_admin_payouts(text) from public, anon;
grant execute on function public.partners_admin_payouts(text) to authenticated;

create or replace function public.partners_admin_mark_paid(p_payout_id uuid, p_reference text default null)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_payout public.partner_payouts%rowtype;
begin
  perform public.partners_assert_admin();
  update public.partner_payouts
     set status = 'PAID', paid_at = now(), paid_by = auth.uid(), reference = coalesce(nullif(trim(p_reference), ''), reference)
   where id = p_payout_id and status = 'TO_PAY'
  returning * into v_payout;
  if not found then
    raise exception 'Versement introuvable ou déjà traité';
  end if;
  update public.partner_commissions set status = 'PAID' where payout_id = p_payout_id;
  insert into public.partner_audit_log (actor_id, action, entity_type, entity_id, new_value)
  values (auth.uid(), 'payout_paid', 'payout', p_payout_id, jsonb_build_object('amount_chf', v_payout.amount_chf, 'reference', v_payout.reference));
  return jsonb_build_object('paid', true);
end;
$$;
revoke execute on function public.partners_admin_mark_paid(uuid, text) from public, anon;
grant execute on function public.partners_admin_mark_paid(uuid, text) to authenticated;

create or replace function public.partners_admin_cancel_payout(p_payout_id uuid)
returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform public.partners_assert_admin();
  update public.partner_payouts set status = 'CANCELLED' where id = p_payout_id and status = 'TO_PAY';
  if not found then
    raise exception 'Versement introuvable ou déjà traité';
  end if;
  update public.partner_commissions set payout_id = null where payout_id = p_payout_id and status = 'AVAILABLE';
  insert into public.partner_audit_log (actor_id, action, entity_type, entity_id) values (auth.uid(), 'payout_cancelled', 'payout', p_payout_id);
  return jsonb_build_object('cancelled', true);
end;
$$;
revoke execute on function public.partners_admin_cancel_payout(uuid) from public, anon;
grant execute on function public.partners_admin_cancel_payout(uuid) to authenticated;

create or replace function public.partners_admin_set_partner(p_partner_id uuid, p_status text default null, p_frozen boolean default null, p_reason text default null)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_old public.partner_profiles%rowtype;
begin
  perform public.partners_assert_admin();
  if p_status is not null and p_status not in ('ACTIVE', 'SUSPENDED', 'BLOCKED') then
    raise exception 'Statut inconnu';
  end if;
  select * into v_old from public.partner_profiles where id = p_partner_id;
  if not found then
    raise exception 'Partenaire introuvable';
  end if;
  update public.partner_profiles
     set status = coalesce(p_status, status), payouts_frozen = coalesce(p_frozen, payouts_frozen), updated_at = now()
   where id = p_partner_id;
  insert into public.partner_audit_log (actor_id, action, entity_type, entity_id, old_value, new_value, reason)
  values (auth.uid(), 'partner_updated', 'partner', p_partner_id,
          jsonb_build_object('status', v_old.status, 'payouts_frozen', v_old.payouts_frozen),
          jsonb_build_object('status', coalesce(p_status, v_old.status), 'payouts_frozen', coalesce(p_frozen, v_old.payouts_frozen)),
          p_reason);
  return jsonb_build_object('updated', true);
end;
$$;
revoke execute on function public.partners_admin_set_partner(uuid, text, boolean, text) from public, anon;
grant execute on function public.partners_admin_set_partner(uuid, text, boolean, text) to authenticated;

create or replace function public.partners_admin_recent_commissions()
returns table (id uuid, partner_name text, public_ref text, kind text, base_amount_chf numeric, amount_chf numeric, status text, paid_at timestamptz, available_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.partners_assert_admin();
  return query
  select c.id, trim(p.first_name || ' ' || p.last_name), c.public_ref, c.kind, c.base_amount_chf, c.amount_chf, c.status, c.paid_at, c.available_at
  from public.partner_commissions c join public.partner_profiles p on p.id = c.partner_id
  order by c.created_at desc
  limit 50;
end;
$$;
revoke execute on function public.partners_admin_recent_commissions() from public, anon;
grant execute on function public.partners_admin_recent_commissions() to authenticated;

-- Tells the app whether to show the admin area.
create or replace function public.am_partners_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select public.has_platform_permission('partners.admin');
$$;
grant execute on function public.am_partners_admin() to authenticated;
