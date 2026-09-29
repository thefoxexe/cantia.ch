-- Cantia Partners: attribution that does not get lost.
--
-- Before: the partner code lived only in a browser cookie and was sent by
-- the app right after create_organization. A signup confirmed on another
-- device, a cleared cookie or a failed request lost the attribution.
--
-- Now:
-- 1. The code is copied into the user's metadata (auth.users
--    raw_user_meta_data.referral) at sign-up and again just before the
--    company is created (lib/auth-context.tsx), or typed by hand in the
--    "Code partenaire" field of the company creation screen.
-- 2. A trigger on the owner membership row attributes the company in the
--    same transaction as create_organization: no second request to lose.
-- 3. partners.admin can attach (or, before any commission, move) a company
--    to a partner by hand, with a reason in the audit log.
--
-- All three paths share partners_attribute_core(). It never raises: a bad
-- code must never block a signup.

alter table public.referral_attributions
  add column if not exists source text not null default 'link'
    check (source in ('link', 'code', 'admin'));

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

  insert into public.referral_attributions (organization_id, partner_id, code, visitor_id, first_click_at, public_ref, source)
  values (p_organization_id, v_partner.id, v_code, left(p_visitor_id, 64), p_first_click_at, v_ref, p_source)
  on conflict (organization_id) do nothing;
  return jsonb_build_object('attributed', found);
exception when others then
  return jsonb_build_object('attributed', false, 'reason', 'error');
end;
$$;
revoke execute on function public.partners_attribute_core(uuid, uuid, text, text, timestamptz, text) from public, anon, authenticated;

-- Same RPC as before for the app (kept as a second chance after the
-- trigger), now on the shared core.
create or replace function public.attribute_referral(
  p_organization_id uuid,
  p_code text,
  p_visitor_id text default null,
  p_first_click_at timestamptz default null
)
returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from public.organization_members
    where organization_id = p_organization_id and user_id = auth.uid() and role = 'owner'
  ) then
    return jsonb_build_object('attributed', false, 'reason', 'not_owner');
  end if;
  return public.partners_attribute_core(
    p_organization_id, auth.uid(), p_code, p_visitor_id, p_first_click_at,
    case when p_first_click_at is null then 'code' else 'link' end
  );
end;
$$;
revoke execute on function public.attribute_referral(uuid, text, text, timestamptz) from public, anon;
grant execute on function public.attribute_referral(uuid, text, text, timestamptz) to authenticated;

-- Attribution in the same transaction as the company creation, from the
-- referral stored on the user (metadata.referral = { code, visitor_id,
-- first_click_at, source }).
create or replace function public.partners_attribute_new_owner()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_ref jsonb;
  v_first timestamptz;
begin
  if new.role <> 'owner' then
    return new;
  end if;
  select raw_user_meta_data -> 'referral' into v_ref from auth.users where id = new.user_id;
  if v_ref is null or jsonb_typeof(v_ref) <> 'object' or coalesce(v_ref ->> 'code', '') = '' then
    return new;
  end if;
  begin
    v_first := (v_ref ->> 'first_click_at')::timestamptz;
  exception when others then
    v_first := null;
  end;
  perform public.partners_attribute_core(
    new.organization_id, new.user_id, v_ref ->> 'code', v_ref ->> 'visitor_id', v_first,
    case when v_ref ->> 'source' = 'code' then 'code' else 'link' end
  );
  return new;
end;
$$;
revoke execute on function public.partners_attribute_new_owner() from public, anon, authenticated;

drop trigger if exists partners_attribute_new_owner on public.organization_members;
create trigger partners_attribute_new_owner
  after insert on public.organization_members
  for each row execute function public.partners_attribute_new_owner();

-- ---------------------------------------------------------------------------
-- Admin: find a company and attach it to a partner by hand.

create or replace function public.partners_admin_find_organizations(p_query text)
returns table (
  id uuid,
  name text,
  plan_name text,
  subscription_status text,
  created_at timestamptz,
  partner_name text,
  public_ref text,
  has_commissions boolean
)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.partners_assert_admin();
  if length(trim(coalesce(p_query, ''))) < 2 then
    return;
  end if;
  return query
  select o.id, o.name, pl.name, o.subscription_status, o.created_at,
         nullif(trim(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, '')), ''),
         a.public_ref,
         exists (select 1 from public.partner_commissions c where c.organization_id = o.id)
  from public.organizations o
  left join public.plans pl on pl.id = o.plan_id
  left join public.referral_attributions a on a.organization_id = o.id
  left join public.partner_profiles p on p.id = a.partner_id
  where o.name ilike '%' || trim(p_query) || '%'
  order by o.created_at desc
  limit 20;
end;
$$;
revoke execute on function public.partners_admin_find_organizations(text) from public, anon;
grant execute on function public.partners_admin_find_organizations(text) to authenticated;

create or replace function public.partners_admin_attribute(p_organization_id uuid, p_partner_id uuid, p_reason text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_old public.referral_attributions%rowtype;
  v_code text;
  v_owner uuid;
  v_result jsonb;
begin
  perform public.partners_assert_admin();
  if length(trim(coalesce(p_reason, ''))) < 3 then
    raise exception 'Indiquez la raison du rattachement.';
  end if;
  select code into v_code from public.partner_referral_codes where partner_id = p_partner_id order by is_default desc, created_at limit 1;
  if v_code is null then
    raise exception 'Ce partenaire n''a pas de code.';
  end if;
  select user_id into v_owner from public.organization_members
   where organization_id = p_organization_id and role = 'owner' order by created_at limit 1;

  select * into v_old from public.referral_attributions where organization_id = p_organization_id;
  if found then
    if v_old.partner_id = p_partner_id then
      return jsonb_build_object('attributed', true, 'unchanged', true);
    end if;
    if exists (select 1 from public.partner_commissions where organization_id = p_organization_id) then
      raise exception 'Des commissions existent déjà pour cette entreprise : le rattachement ne peut plus changer.';
    end if;
    delete from public.referral_attributions where organization_id = p_organization_id;
  end if;

  v_result := public.partners_attribute_core(p_organization_id, v_owner, v_code, null, null, 'admin');
  if not coalesce((v_result ->> 'attributed')::boolean, false) then
    raise exception 'Rattachement impossible (%).', coalesce(v_result ->> 'reason', 'inconnu');
  end if;
  -- Already paying: the 12 months run from the first payment rattached.
  insert into public.partner_audit_log (actor_id, action, entity_type, entity_id, old_value, new_value, reason)
  values (
    auth.uid(), 'admin_attribution', 'organization', p_organization_id,
    case when v_old.organization_id is null then null else jsonb_build_object('partner_id', v_old.partner_id) end,
    jsonb_build_object('partner_id', p_partner_id),
    trim(p_reason)
  );
  return v_result;
end;
$$;
revoke execute on function public.partners_admin_attribute(uuid, uuid, text) from public, anon;
grant execute on function public.partners_admin_attribute(uuid, uuid, text) to authenticated;

-- "Code partenaire" field of the company creation screen: tells the user
-- right away when a typed code does not exist. Partner codes are public
-- (they are in every partner link), so this reveals nothing.
create or replace function public.partners_code_is_valid(p_code text)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.partner_referral_codes c
    join public.partner_profiles p on p.id = c.partner_id
    where c.code = upper(trim(coalesce(p_code, ''))) and p.status = 'ACTIVE'
  );
$$;
revoke execute on function public.partners_code_is_valid(text) from public, anon;
grant execute on function public.partners_code_is_valid(text) to authenticated;
