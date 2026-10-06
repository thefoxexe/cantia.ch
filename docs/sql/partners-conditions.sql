-- À coller dans Supabase > SQL Editor > New query, puis Run.
-- Cantia Partners : taux personnel par partenaire, e-mail d'inscription, vitrine des logos.
begin;
alter table public.partner_profiles
  add column if not exists commission_rate numeric(5, 4) check (commission_rate is null or (commission_rate >= 0 and commission_rate <= 0.6)),
  add column if not exists commission_months integer check (commission_months is null or commission_months between 1 and 120),
  add column if not exists terms_set_at timestamptz,
  add column if not exists terms_note text,
  add column if not exists admin_notified_at timestamptz,
  add column if not exists contact_requested_at timestamptz,
  add column if not exists logo_path text,
  add column if not exists website text check (website is null or char_length(website) <= 200),
  add column if not exists showcase_tagline text check (showcase_tagline is null or char_length(showcase_tagline) <= 120),
  add column if not exists showcase_status text not null default 'NONE' check (showcase_status in ('NONE', 'PENDING', 'APPROVED', 'REJECTED'));

-- Terms and showcase approval are admin-only (direct API writes).
create or replace function public.partner_profiles_guard()
returns trigger
language plpgsql security invoker set search_path = public as $$
begin
  if current_user in ('authenticated', 'anon') and not public.has_platform_permission('partners.admin') then
    new.status := old.status;
    new.payouts_frozen := old.payouts_frozen;
    new.user_id := old.user_id;
    new.iban_masked := old.iban_masked;
    new.payout_account_holder := old.payout_account_holder;
    new.commission_rate := old.commission_rate;
    new.commission_months := old.commission_months;
    new.terms_set_at := old.terms_set_at;
    new.terms_note := old.terms_note;
    new.admin_notified_at := old.admin_notified_at;
    new.contact_requested_at := old.contact_requested_at;
    new.showcase_status := old.showcase_status;
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Commissions at the partner's own rate (0 until negotiated).

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
  v_rate numeric;
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

  if v_attr.first_paid_at is null then
    update public.referral_attributions
       set first_paid_at = p_paid_at,
           commission_eligible_until = p_paid_at + make_interval(months => coalesce(v_partner.commission_months, v_cfg.commission_months))
     where organization_id = p_organization_id
     returning * into v_attr;
  end if;
  if p_paid_at > v_attr.commission_eligible_until then
    return jsonb_build_object('recorded', false, 'reason', 'outside the commission window');
  end if;
  if v_partner.status = 'BLOCKED' then
    return jsonb_build_object('recorded', false, 'reason', 'partner blocked');
  end if;

  v_rate := coalesce(v_partner.commission_rate, 0);
  v_amount := round(p_net_amount_chf * v_rate, 2);
  insert into public.partner_commissions (
    partner_id, organization_id, public_ref, kind, stripe_invoice_id, stripe_payment_intent,
    base_amount_chf, rate, amount_chf, billing, status, paid_at, available_at
  ) values (
    v_attr.partner_id, p_organization_id, v_attr.public_ref, 'commission', p_invoice_id, p_payment_intent,
    round(p_net_amount_chf, 2), v_rate, v_amount, p_billing, 'PENDING', p_paid_at,
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

-- The partner's own figures + terms (null rate = still to negotiate).
create or replace function public.my_partner_summary()
returns jsonb
language sql stable security definer set search_path = public as $$
  with me as (select * from public.partner_profiles where user_id = auth.uid()),
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
    'payout_day', (select payout_day from cfg),
    'commission_rate', (select commission_rate from me),
    'commission_months', (select coalesce(commission_months, (select commission_months from cfg)) from me),
    'terms_set_at', (select terms_set_at from me),
    'contact_requested_at', (select contact_requested_at from me),
    'awaiting_terms_base_chf', coalesce((select sum(base_amount_chf) from c where kind = 'commission' and rate = 0 and status in ('PENDING', 'AVAILABLE')), 0)
  );
$$;

-- ---------------------------------------------------------------------------
-- Admin: set a partner's terms; unpaid commissions recorded at 0 are
-- recalculated at the new rate, and the commission window of the partner's
-- clients follows the agreed duration.

create or replace function public.partners_admin_set_terms(
  p_partner_id uuid,
  p_rate_percent numeric,
  p_months integer default null,
  p_note text default null
)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_old public.partner_profiles%rowtype;
  v_rate numeric;
  v_months integer;
  v_recalculated integer;
begin
  perform public.partners_assert_admin();
  select * into v_old from public.partner_profiles where id = p_partner_id;
  if not found then
    raise exception 'Partenaire introuvable';
  end if;
  if p_rate_percent is not null and (p_rate_percent < 0 or p_rate_percent > 60) then
    raise exception 'Taux entre 0 et 60 %%';
  end if;
  v_rate := case when p_rate_percent is null then null else round(p_rate_percent / 100, 4) end;
  v_months := coalesce(p_months, v_old.commission_months, (select commission_months from public.partners_config limit 1));

  update public.partner_profiles
     set commission_rate = v_rate,
         commission_months = v_months,
         terms_set_at = case when v_rate is null then null else now() end,
         terms_note = nullif(trim(coalesce(p_note, terms_note, '')), ''),
         updated_at = now()
   where id = p_partner_id;

  v_recalculated := 0;
  if v_rate is not null then
    update public.partner_commissions
       set rate = v_rate, amount_chf = round(base_amount_chf * v_rate, 2)
     where partner_id = p_partner_id and kind = 'commission' and rate = 0
       and status in ('PENDING', 'AVAILABLE') and payout_id is null;
    get diagnostics v_recalculated = row_count;
  end if;

  update public.referral_attributions
     set commission_eligible_until = first_paid_at + make_interval(months => v_months)
   where partner_id = p_partner_id and first_paid_at is not null;

  insert into public.partner_audit_log (actor_id, action, entity_type, entity_id, old_value, new_value, reason)
  values (auth.uid(), 'terms_set', 'partner', p_partner_id,
          jsonb_build_object('commission_rate', v_old.commission_rate, 'commission_months', v_old.commission_months),
          jsonb_build_object('commission_rate', v_rate, 'commission_months', v_months, 'recalculated', v_recalculated),
          p_note);
  return jsonb_build_object('updated', true, 'recalculated', v_recalculated);
end;
$$;
revoke execute on function public.partners_admin_set_terms(uuid, numeric, integer, text) from public, anon;
grant execute on function public.partners_admin_set_terms(uuid, numeric, integer, text) to authenticated;

create or replace function public.partners_admin_set_showcase(p_partner_id uuid, p_status text)
returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform public.partners_assert_admin();
  if p_status not in ('NONE', 'PENDING', 'APPROVED', 'REJECTED') then
    raise exception 'Statut inconnu';
  end if;
  update public.partner_profiles set showcase_status = p_status, updated_at = now() where id = p_partner_id;
  insert into public.partner_audit_log (actor_id, action, entity_type, entity_id, new_value)
  values (auth.uid(), 'showcase_set', 'partner', p_partner_id, jsonb_build_object('showcase_status', p_status));
  return jsonb_build_object('updated', true);
end;
$$;
revoke execute on function public.partners_admin_set_showcase(uuid, text) from public, anon;
grant execute on function public.partners_admin_set_showcase(uuid, text) to authenticated;

drop function if exists public.partners_admin_partners();
create function public.partners_admin_partners()
returns table(
  id uuid, email text, first_name text, last_name text, company_name text, partner_type text, status text,
  payouts_frozen boolean, iban_masked text, code text, created_at timestamptz, clicks integer, signups integer,
  paying integer, pending_chf numeric, available_chf numeric, paid_chf numeric,
  phone text, city text, commission_rate numeric, commission_months integer, terms_set_at timestamptz, terms_note text,
  contact_requested_at timestamptz, logo_path text, website text, showcase_tagline text, showcase_status text
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
         coalesce((select sum(c.amount_chf) from public.partner_commissions c where c.partner_id = p.id and c.status = 'PAID'), 0),
         p.phone, p.city, p.commission_rate, p.commission_months, p.terms_set_at, p.terms_note,
         p.contact_requested_at, p.logo_path, p.website, p.showcase_tagline, p.showcase_status
  from public.partner_profiles p
  join auth.users u on u.id = p.user_id
  order by (p.commission_rate is null) desc, p.created_at desc;
end;
$$;
revoke execute on function public.partners_admin_partners() from public, anon;
grant execute on function public.partners_admin_partners() to authenticated;

-- ---------------------------------------------------------------------------
-- Logo wall: the partner uploads a logo and asks to appear; an admin
-- approves. Public list of approved partners for partners.cantia.ch.

create or replace function public.partner_request_showcase(p_website text, p_tagline text, p_logo_path text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_profile public.partner_profiles%rowtype;
begin
  select * into v_profile from public.partner_profiles where user_id = auth.uid();
  if not found then
    raise exception 'Profil partenaire introuvable';
  end if;
  if p_logo_path is null or split_part(p_logo_path, '/', 1) <> auth.uid()::text then
    raise exception 'Logo requis';
  end if;
  update public.partner_profiles
     set logo_path = p_logo_path,
         website = nullif(trim(coalesce(p_website, '')), ''),
         showcase_tagline = nullif(trim(coalesce(p_tagline, '')), ''),
         showcase_status = 'PENDING',
         updated_at = now()
   where id = v_profile.id;
  return jsonb_build_object('status', 'PENDING');
end;
$$;
revoke execute on function public.partner_request_showcase(text, text, text) from public, anon;
grant execute on function public.partner_request_showcase(text, text, text) to authenticated;

create or replace function public.partner_withdraw_showcase()
returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  update public.partner_profiles set showcase_status = 'NONE', updated_at = now() where user_id = auth.uid();
  return jsonb_build_object('status', 'NONE');
end;
$$;
revoke execute on function public.partner_withdraw_showcase() from public, anon;
grant execute on function public.partner_withdraw_showcase() to authenticated;

create or replace function public.partners_showcase()
returns table(name text, logo_path text, website text, tagline text, city text, partner_type text)
language sql stable security definer set search_path = public as $$
  select coalesce(p.company_name, p.first_name || ' ' || p.last_name), p.logo_path, p.website, p.showcase_tagline, p.city, p.partner_type
  from public.partner_profiles p
  where p.showcase_status = 'APPROVED' and p.status = 'ACTIVE' and p.logo_path is not null
  order by p.terms_set_at nulls last, p.created_at;
$$;
grant execute on function public.partners_showcase() to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('partner-logos', 'partner-logos', true, 2097152, array['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "partners upload their logo" on storage.objects;
create policy "partners upload their logo" on storage.objects
  for insert to authenticated with check (bucket_id = 'partner-logos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "partners replace their logo" on storage.objects;
create policy "partners replace their logo" on storage.objects
  for update to authenticated using (bucket_id = 'partner-logos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "partners remove their logo" on storage.objects;
create policy "partners remove their logo" on storage.objects
  for delete to authenticated using (bucket_id = 'partner-logos' and (storage.foldername(name))[1] = auth.uid()::text);
commit;
