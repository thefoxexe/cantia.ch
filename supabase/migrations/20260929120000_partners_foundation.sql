-- Cantia Partners, step 1: partner profiles, referral codes, clicks,
-- attributions, audit log and the partners.admin permission.
--
-- One identity: a partner is a regular auth.users account with a
-- partner_profiles row. Becoming a partner never creates an organization.
-- Everything a partner reads is derived from auth.uid() server-side; no
-- function trusts a partner id sent by the browser.
--
-- Business settings live in partners_config (one row) rather than only in
-- edge function env vars, because SQL functions (click validation,
-- attribution window) need them too. Edge functions read the same row.

-- ---------------------------------------------------------------------------
-- Settings
create table public.partners_config (
  id boolean primary key default true check (id),
  commission_rate numeric(5,4) not null default 0.25,
  commission_months integer not null default 12,
  validation_days integer not null default 30,
  min_payout_chf numeric(10,2) not null default 30,
  attribution_days integer not null default 90,
  payout_day integer not null default 5,
  admin_reminder_day integer not null default 4,
  updated_at timestamptz not null default now()
);
insert into public.partners_config (id) values (true);
alter table public.partners_config enable row level security;
create policy "anyone can read partners config" on public.partners_config for select using (true);

-- ---------------------------------------------------------------------------
-- Platform permissions (partners.admin, later accounting.admin…)
create table public.platform_permissions (
  user_id uuid not null references auth.users(id) on delete cascade,
  permission text not null check (permission in ('partners.admin')),
  granted_by uuid references auth.users(id),
  granted_at timestamptz not null default now(),
  primary key (user_id, permission)
);
alter table public.platform_permissions enable row level security;
create policy "users can see their own permissions" on public.platform_permissions
  for select using (user_id = auth.uid());

create or replace function public.has_platform_permission(p_permission text)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.platform_permissions where user_id = auth.uid() and permission = p_permission);
$$;

-- Existing Cantia platform admins get partners.admin; later grants go
-- through this table (never through an email check in code).
insert into public.platform_permissions (user_id, permission)
select user_id, 'partners.admin' from public.platform_admins
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Partner profiles
create table public.partner_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'SUSPENDED', 'BLOCKED')),
  first_name text not null,
  last_name text not null,
  company_name text,
  partner_type text not null default 'OTHER' check (partner_type in (
    'WEB_AGENCY', 'CONSULTANT', 'SOFTWARE_INTEGRATOR', 'CANTIA_CUSTOMER', 'BUSINESS', 'CONTENT_CREATOR', 'OTHER'
  )),
  address text,
  postal_code text,
  city text,
  country text not null default 'CH',
  phone text,
  locale text not null default 'fr' check (locale in ('fr', 'de', 'it')),
  -- Masked for display (CH•• •••• •••• •••• 1234); the full IBAN lives in
  -- partner_payout_accounts, readable by partners admins only.
  payout_account_holder text,
  iban_masked text,
  payouts_frozen boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger partner_profiles_set_updated_at before update on public.partner_profiles
for each row execute function public.set_updated_at();
alter table public.partner_profiles enable row level security;
create policy "partners see their own profile" on public.partner_profiles
  for select using (user_id = auth.uid() or public.has_platform_permission('partners.admin'));
-- Partners edit their own contact fields; status and freezes are admin-only
-- (enforced by the trigger below, since RLS can't restrict columns).
create policy "partners update their own profile" on public.partner_profiles
  for update using (user_id = auth.uid() or public.has_platform_permission('partners.admin'));

create or replace function public.partner_profiles_guard()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not public.has_platform_permission('partners.admin') then
    new.status := old.status;
    new.payouts_frozen := old.payouts_frozen;
    new.user_id := old.user_id;
    new.iban_masked := old.iban_masked;
    new.payout_account_holder := old.payout_account_holder;
  end if;
  return new;
end;
$$;
create trigger partner_profiles_guard before update on public.partner_profiles
for each row execute function public.partner_profiles_guard();

-- Full payout details, admins only. Partners write through
-- set_partner_payout_account() (validation + audit).
create table public.partner_payout_accounts (
  partner_id uuid primary key references public.partner_profiles(id) on delete cascade,
  account_holder text not null,
  iban text not null,
  updated_at timestamptz not null default now()
);
alter table public.partner_payout_accounts enable row level security;
create policy "partners admins read payout accounts" on public.partner_payout_accounts
  for select using (public.has_platform_permission('partners.admin'));

-- ---------------------------------------------------------------------------
-- Referral codes (several per partner possible later: campaigns)
create table public.partner_referral_codes (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partner_profiles(id) on delete cascade,
  code text not null unique check (code ~ '^[A-Z0-9]{6,12}$'),
  label text,
  is_default boolean not null default true,
  created_at timestamptz not null default now()
);
create index on public.partner_referral_codes (partner_id);
alter table public.partner_referral_codes enable row level security;
create policy "partners see their own codes" on public.partner_referral_codes
  for select using (
    public.has_platform_permission('partners.admin')
    or exists (select 1 from public.partner_profiles p where p.id = partner_id and p.user_id = auth.uid())
  );

-- Random, non-sequential, no ambiguous characters (0/O, 1/I).
create or replace function public.generate_referral_code()
returns text
language plpgsql volatile set search_path = public as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text;
begin
  loop
    candidate := '';
    for i in 1..6 loop
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.partner_referral_codes where code = candidate);
  end loop;
  return candidate;
end;
$$;

-- ---------------------------------------------------------------------------
-- Clicks
create table public.referral_clicks (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partner_profiles(id) on delete cascade,
  code text not null,
  visitor_id text not null,
  landing_page text,
  referrer text,
  utm jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index on public.referral_clicks (partner_id, created_at desc);
create index on public.referral_clicks (visitor_id, created_at desc);
alter table public.referral_clicks enable row level security;
-- Partners see their own clicks (no visitor data beyond an anonymous id).
create policy "partners see their own clicks" on public.referral_clicks
  for select using (
    public.has_platform_permission('partners.admin')
    or exists (select 1 from public.partner_profiles p where p.id = partner_id and p.user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- Attributions: from the organization's signup on, the database is the
-- source of truth (never the cookie again).
create table public.referral_attributions (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  partner_id uuid not null references public.partner_profiles(id) on delete restrict,
  code text not null,
  visitor_id text,
  first_click_at timestamptz,
  attributed_at timestamptz not null default now(),
  first_paid_at timestamptz,
  commission_eligible_until timestamptz,
  -- Short public reference shown to the partner instead of any client data.
  public_ref text not null unique,
  created_at timestamptz not null default now()
);
create index on public.referral_attributions (partner_id);
alter table public.referral_attributions enable row level security;
create policy "partners admins see attributions" on public.referral_attributions
  for select using (public.has_platform_permission('partners.admin'));

-- ---------------------------------------------------------------------------
-- Audit log
create table public.partner_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_value jsonb,
  new_value jsonb,
  reason text,
  created_at timestamptz not null default now()
);
create index on public.partner_audit_log (entity_type, entity_id, created_at desc);
alter table public.partner_audit_log enable row level security;
create policy "partners admins read the audit log" on public.partner_audit_log
  for select using (public.has_platform_permission('partners.admin'));

-- ---------------------------------------------------------------------------
-- RPCs

-- Signed-in user becomes a partner (idempotent): profile + default code.
create or replace function public.become_partner(
  p_first_name text,
  p_last_name text,
  p_company_name text default null,
  p_partner_type text default 'OTHER',
  p_phone text default null,
  p_address text default null,
  p_postal_code text default null,
  p_city text default null,
  p_country text default 'CH',
  p_locale text default 'fr'
)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_profile public.partner_profiles%rowtype;
  v_code text;
begin
  if v_uid is null then
    raise exception 'Connexion requise';
  end if;
  if coalesce(trim(p_first_name), '') = '' or coalesce(trim(p_last_name), '') = '' then
    raise exception 'Prénom et nom requis';
  end if;

  select * into v_profile from public.partner_profiles where user_id = v_uid;
  if not found then
    insert into public.partner_profiles (user_id, first_name, last_name, company_name, partner_type, phone, address, postal_code, city, country, locale)
    values (v_uid, trim(p_first_name), trim(p_last_name), nullif(trim(p_company_name), ''),
            coalesce(p_partner_type, 'OTHER'), nullif(trim(p_phone), ''), nullif(trim(p_address), ''),
            nullif(trim(p_postal_code), ''), nullif(trim(p_city), ''), coalesce(nullif(p_country, ''), 'CH'),
            case when p_locale in ('fr', 'de', 'it') then p_locale else 'fr' end)
    returning * into v_profile;
    insert into public.partner_referral_codes (partner_id, code) values (v_profile.id, public.generate_referral_code());
  end if;

  select code into v_code from public.partner_referral_codes where partner_id = v_profile.id and is_default order by created_at limit 1;
  return jsonb_build_object('partner_id', v_profile.id, 'code', v_code, 'status', v_profile.status);
end;
$$;
revoke execute on function public.become_partner(text, text, text, text, text, text, text, text, text, text) from public, anon;
grant execute on function public.become_partner(text, text, text, text, text, text, text, text, text, text) to authenticated;

-- Swiss/LI IBAN check: format + mod-97.
create or replace function public.is_valid_iban(p_iban text)
returns boolean
language plpgsql immutable as $$
declare
  s text := upper(regexp_replace(coalesce(p_iban, ''), '\s', '', 'g'));
  rearranged text;
  digits text := '';
  ch text;
  remainder integer := 0;
begin
  if s !~ '^(CH|LI)[0-9]{2}[0-9A-Z]{17}$' then
    return false;
  end if;
  rearranged := substr(s, 5) || substr(s, 1, 4);
  for i in 1..length(rearranged) loop
    ch := substr(rearranged, i, 1);
    if ch ~ '[A-Z]' then
      digits := digits || (ascii(ch) - 55)::text;
    else
      digits := digits || ch;
    end if;
  end loop;
  for i in 1..length(digits) loop
    remainder := (remainder * 10 + substr(digits, i, 1)::int) % 97;
  end loop;
  return remainder = 1;
end;
$$;

-- Partner sets or changes their payout account: validated, masked, audited.
create or replace function public.set_partner_payout_account(p_account_holder text, p_iban text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_profile public.partner_profiles%rowtype;
  v_iban text := upper(regexp_replace(coalesce(p_iban, ''), '\s', '', 'g'));
  v_masked text;
  v_old record;
begin
  select * into v_profile from public.partner_profiles where user_id = auth.uid();
  if not found then
    raise exception 'Profil partenaire introuvable';
  end if;
  if coalesce(trim(p_account_holder), '') = '' then
    raise exception 'Titulaire requis';
  end if;
  if not public.is_valid_iban(v_iban) then
    raise exception 'IBAN invalide';
  end if;
  v_masked := substr(v_iban, 1, 2) || '•• •••• •••• •••• ' || right(v_iban, 4);

  select account_holder, iban into v_old from public.partner_payout_accounts where partner_id = v_profile.id;

  insert into public.partner_payout_accounts (partner_id, account_holder, iban, updated_at)
  values (v_profile.id, trim(p_account_holder), v_iban, now())
  on conflict (partner_id) do update set account_holder = excluded.account_holder, iban = excluded.iban, updated_at = now();

  update public.partner_profiles set payout_account_holder = trim(p_account_holder), iban_masked = v_masked where id = v_profile.id;

  insert into public.partner_audit_log (actor_id, action, entity_type, entity_id, old_value, new_value)
  values (auth.uid(), 'iban_changed', 'partner', v_profile.id,
          case when v_old.iban is null then null else jsonb_build_object('holder', v_old.account_holder, 'iban_last4', right(v_old.iban, 4)) end,
          jsonb_build_object('holder', trim(p_account_holder), 'iban_last4', right(v_iban, 4)));

  return jsonb_build_object('iban_masked', v_masked);
end;
$$;
revoke execute on function public.set_partner_payout_account(text, text) from public, anon;
grant execute on function public.set_partner_payout_account(text, text) to authenticated;

-- Public: a visitor landed on cantia.ch with ?ref=CODE. Records the click
-- (reloads by the same visitor within 30 minutes don't count) and tells
-- the page whether the code is valid, so it only keeps valid codes.
create or replace function public.record_referral_click(
  p_code text,
  p_visitor_id text,
  p_landing_page text default null,
  p_referrer text default null,
  p_utm jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_code text := upper(trim(coalesce(p_code, '')));
  v_partner_id uuid;
begin
  if v_code !~ '^[A-Z0-9]{6,12}$' or coalesce(p_visitor_id, '') = '' or length(p_visitor_id) > 64 then
    return jsonb_build_object('valid', false);
  end if;
  select c.partner_id into v_partner_id
  from public.partner_referral_codes c
  join public.partner_profiles p on p.id = c.partner_id
  where c.code = v_code and p.status = 'ACTIVE';
  if v_partner_id is null then
    return jsonb_build_object('valid', false);
  end if;

  if not exists (
    select 1 from public.referral_clicks
    where visitor_id = p_visitor_id and code = v_code and created_at > now() - interval '30 minutes'
  ) then
    insert into public.referral_clicks (partner_id, code, visitor_id, landing_page, referrer, utm)
    values (v_partner_id, v_code, p_visitor_id, left(p_landing_page, 300), left(p_referrer, 300),
            coalesce(p_utm, '{}'::jsonb));
  end if;
  return jsonb_build_object('valid', true, 'code', v_code);
end;
$$;
grant execute on function public.record_referral_click(text, text, text, text, jsonb) to anon, authenticated;

-- Called by the app right after create_organization() with the referral
-- remembered in the browser (first valid click, 90-day window). First
-- attribution wins; no self-referral; only the organization's owner.
create or replace function public.attribute_referral(
  p_organization_id uuid,
  p_code text,
  p_visitor_id text default null,
  p_first_click_at timestamptz default null
)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_code text := upper(trim(coalesce(p_code, '')));
  v_partner public.partner_profiles%rowtype;
  v_window integer;
  v_ref text;
begin
  if not exists (
    select 1 from public.organization_members
    where organization_id = p_organization_id and user_id = auth.uid() and role = 'owner'
  ) then
    return jsonb_build_object('attributed', false, 'reason', 'not_owner');
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
  if v_partner.user_id = auth.uid() then
    insert into public.partner_audit_log (actor_id, action, entity_type, entity_id, new_value)
    values (auth.uid(), 'self_referral_blocked', 'partner', v_partner.id, jsonb_build_object('organization_id', p_organization_id));
    return jsonb_build_object('attributed', false, 'reason', 'self_referral');
  end if;

  select attribution_days into v_window from public.partners_config;
  if p_first_click_at is not null and p_first_click_at < now() - make_interval(days => v_window) then
    return jsonb_build_object('attributed', false, 'reason', 'expired');
  end if;

  loop
    v_ref := 'CNT-' || lpad((floor(random() * 9000) + 1000)::int::text, 4, '0');
    exit when not exists (select 1 from public.referral_attributions where public_ref = v_ref);
  end loop;

  insert into public.referral_attributions (organization_id, partner_id, code, visitor_id, first_click_at, public_ref)
  values (p_organization_id, v_partner.id, v_code, left(p_visitor_id, 64), p_first_click_at, v_ref);
  return jsonb_build_object('attributed', true);
end;
$$;
revoke execute on function public.attribute_referral(uuid, text, text, timestamptz) from public, anon;
grant execute on function public.attribute_referral(uuid, text, text, timestamptz) to authenticated;

-- What a partner sees about the companies they brought: an anonymous
-- reference, dates, status and plan. Never names, emails or any content.
create or replace function public.my_partner_referrals()
returns table (
  public_ref text,
  attributed_at timestamptz,
  status text,
  plan_name text,
  billing text,
  first_paid_at timestamptz,
  commission_eligible_until timestamptz
)
language sql stable security definer set search_path = public as $$
  select a.public_ref,
         a.attributed_at,
         case
           when o.subscription_status in ('canceled', 'cancelled') then 'CANCELLED'
           when a.first_paid_at is not null and o.subscription_status = 'active' then 'ACTIVE'
           when o.subscription_status = 'trialing' or o.plan_id = 'decouverte' then 'TRIAL'
           else 'SIGNED_UP'
         end,
         pl.name,
         -- Monthly/annual: recorded with the first payment (step 2, Stripe).
         null::text,
         a.first_paid_at,
         a.commission_eligible_until
  from public.referral_attributions a
  join public.partner_profiles p on p.id = a.partner_id and p.user_id = auth.uid()
  join public.organizations o on o.id = a.organization_id
  left join public.plans pl on pl.id = o.plan_id
  order by a.attributed_at desc;
$$;
revoke execute on function public.my_partner_referrals() from public, anon;
grant execute on function public.my_partner_referrals() to authenticated;

-- Funnel counts for the signed-in partner.
create or replace function public.my_partner_stats()
returns jsonb
language sql stable security definer set search_path = public as $$
  with me as (select id from public.partner_profiles where user_id = auth.uid())
  select jsonb_build_object(
    'clicks', (select count(*) from public.referral_clicks c, me where c.partner_id = me.id),
    'unique_visitors', (select count(distinct visitor_id) from public.referral_clicks c, me where c.partner_id = me.id),
    'signups', (select count(*) from public.referral_attributions a, me where a.partner_id = me.id),
    'active_customers', (
      select count(*) from public.referral_attributions a
      join public.organizations o on o.id = a.organization_id, me
      where a.partner_id = me.id and a.first_paid_at is not null and o.subscription_status = 'active'
    ),
    'trials', (
      select count(*) from public.referral_attributions a
      join public.organizations o on o.id = a.organization_id, me
      where a.partner_id = me.id and a.first_paid_at is null and (o.subscription_status = 'trialing' or o.plan_id = 'decouverte')
    )
  );
$$;
revoke execute on function public.my_partner_stats() from public, anon;
grant execute on function public.my_partner_stats() to authenticated;
