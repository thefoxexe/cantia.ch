-- Business decision (reverts 20260901000000_repricing_no_free_plan_and_role_limits.sql's
-- "automatic 14-day trial" default): a brand-new organization must no
-- longer get a real plan_id/trial/enabled_modules for free at creation
-- time. The intended flow is signup -> verify email -> create or join an
-- organization -> choose-plan.tsx (mandatory) -> Stripe Checkout with a
-- card on file, CHF 0 due today, billed automatically after the trial
-- Stripe itself grants (subscription_data.trial_period_days in
-- stripe-checkout, already gated to once per org via org.trial_used).
--
-- Only new organizations are affected — existing ones already on
-- 'decouverte' are left untouched, same policy the prior migrations in
-- this area have followed.

-- ==========================================================================
-- organizations: plan_id/trial_ends_at no longer get a default value.
-- plan_id becomes nullable — NULL means "hasn't completed a real Stripe
-- checkout yet", which app/_layout.tsx's existing redirect-to-choose-plan
-- gate now checks directly instead of the client-settable plan_selected
-- flag (see the grant revocation below for why that flag was a bypass).
-- ==========================================================================
alter table public.organizations alter column plan_id drop not null;
alter table public.organizations alter column plan_id drop default;
alter table public.organizations alter column trial_ends_at drop default;
alter table public.organizations alter column enabled_modules set default '{}';

-- ==========================================================================
-- plan_selected was client-writable (20260828100000_lock_billing_and_
-- ownership_columns.sql's own comment called this safe because it only
-- unlocked the free plan that existed at the time) — with plan_id now the
-- real gate and no free plan to land on, self-flipping this flag is a
-- straight bypass of the redirect. It moves to service-role-only,
-- alongside plan_id/subscription_status, set for real only by
-- stripe-webhook once Stripe confirms checkout.
-- ==========================================================================
revoke update on public.organizations from authenticated;
grant update (
  name, trade, logo_url, signature_url, address, ide_number,
  phone, email, website, default_vat_rate, devis_validity_days, devis_terms,
  devis_template, payroll_payday, payroll_km_rate_chf, enabled_modules
) on public.organizations to authenticated;

-- ==========================================================================
-- accept_invite / respond_to_join_request: both look up the inviting org's
-- max_members via an inner join on plans, so member_count >= plan_max_members
-- silently evaluates to NULL (never true) when plan_id is NULL — letting
-- someone join an organization that has no active plan at all, unbounded.
-- Both now reject explicitly instead. In practice this join request/invite
-- can't exist yet for a brand-new unpaid org (its owner is stuck on
-- choose-plan and has no UI to create one), but it's a real reachable state
-- for an org whose subscription was cancelled while an old invite link
-- still works.
-- ==========================================================================
create or replace function public.accept_invite(invite_token text, confirm_leave_current boolean default false)
returns organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  inv public.organization_invites%rowtype;
  member_count integer;
  plan_max_members integer;
  new_org public.organizations%rowtype;
  current_org_id uuid;
  current_org_member_count integer;
  invitee_full_name text;
  invitee_locale text;
begin
  if auth.uid() is null then
    raise exception 'Authentification requise';
  end if;

  select * into inv from public.organization_invites where token = invite_token for update;
  if inv.id is null then
    raise exception 'Invitation introuvable';
  end if;
  if inv.used_at is not null then
    raise exception 'Cette invitation a déjà été utilisée';
  end if;
  if inv.revoked then
    raise exception 'Cette invitation a été révoquée';
  end if;
  if inv.expires_at < now() then
    raise exception 'Cette invitation a expiré';
  end if;

  select organization_id into current_org_id from public.organization_members where user_id = auth.uid();

  if current_org_id is not null then
    if current_org_id = inv.organization_id then
      raise exception 'Vous êtes déjà membre de cette entreprise';
    end if;
    if not confirm_leave_current then
      raise exception 'Confirmation requise pour quitter votre entreprise actuelle';
    end if;
    select count(*) into current_org_member_count from public.organization_members where organization_id = current_org_id;
    if current_org_member_count > 1 then
      raise exception 'Votre entreprise actuelle a d''autres membres : elle ne peut pas être quittée automatiquement. Un administrateur doit vous retirer avant que vous puissiez en rejoindre une autre.';
    end if;
    delete from public.organizations where id = current_org_id;
  end if;

  select count(*) into member_count from public.organization_members where organization_id = inv.organization_id;
  select p.max_members into plan_max_members
    from public.organizations o join public.plans p on p.id = o.plan_id
    where o.id = inv.organization_id;

  if plan_max_members is null then
    raise exception 'Cette entreprise n''a pas d''abonnement actif';
  end if;
  if member_count >= plan_max_members then
    raise exception 'Cette entreprise a atteint le nombre maximum de membres de son plan';
  end if;

  select coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), u.email, ''),
         coalesce(nullif(u.raw_user_meta_data ->> 'locale', ''), 'fr')
    into invitee_full_name, invitee_locale
    from auth.users u
    where u.id = auth.uid();

  insert into public.organization_members (organization_id, user_id, role, full_name, locale)
  values (inv.organization_id, auth.uid(), inv.role, invitee_full_name, invitee_locale);

  update public.organization_invites set used_by = auth.uid(), used_at = now() where id = inv.id;

  select * into new_org from public.organizations where id = inv.organization_id;
  return new_org;
end;
$$;

create or replace function public.respond_to_join_request(request_id uuid, approve boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  req public.organization_join_requests%rowtype;
  member_count integer;
  plan_max_members integer;
  requester_name text;
  requester_locale text;
begin
  select * into req from public.organization_join_requests where id = request_id for update;
  if req.id is null then
    raise exception 'Demande introuvable';
  end if;
  if not public.is_org_admin(req.organization_id) then
    raise exception 'Accès refusé';
  end if;
  if req.status <> 'pending' then
    raise exception 'Cette demande a déjà été traitée';
  end if;

  if approve then
    if exists (select 1 from public.organization_members where user_id = req.user_id) then
      update public.organization_join_requests set status = 'rejected', decided_at = now(), decided_by = auth.uid() where id = request_id;
      raise exception 'Cette personne appartient déjà à une entreprise';
    end if;

    select count(*) into member_count from public.organization_members where organization_id = req.organization_id;
    select p.max_members into plan_max_members
      from public.organizations o join public.plans p on p.id = o.plan_id
      where o.id = req.organization_id;
    if plan_max_members is null then
      raise exception 'Cette entreprise n''a pas d''abonnement actif';
    end if;
    if member_count >= plan_max_members then
      raise exception 'Cette entreprise a atteint le nombre maximum de membres de son plan';
    end if;

    select coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), u.email, ''),
           coalesce(nullif(u.raw_user_meta_data ->> 'locale', ''), 'fr')
      into requester_name, requester_locale
      from auth.users u where u.id = req.user_id;

    insert into public.organization_members (organization_id, user_id, role, full_name, locale)
    values (req.organization_id, req.user_id, 'member', requester_name, requester_locale);

    update public.organization_join_requests set status = 'accepted', decided_at = now(), decided_by = auth.uid() where id = request_id;
  else
    update public.organization_join_requests set status = 'rejected', decided_at = now(), decided_by = auth.uid() where id = request_id;
  end if;
end;
$$;

-- ==========================================================================
-- Admin panel: both admin_list_organizations and admin_get_organization_
-- detail inner-joined plans, so an organization stuck at choose-plan
-- (plan_id null) either silently vanished from the Entreprises list or made
-- the detail view raise "organization not found" — exactly the visibility
-- Bastien needs to spot signups that never finished paying.
-- ==========================================================================
create or replace function public.admin_list_organizations(search text default null, limit_n int default 50, offset_n int default 0)
returns table(
  id uuid, name text, plan_id text, plan_name text, subscription_status text,
  trial_ends_at timestamptz, plan_selected boolean, created_at timestamptz,
  member_count bigint, owner_email text, private_modules_count bigint,
  is_internal boolean, internal_label text, total_count bigint
)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  return query
  select
    o.id, o.name, o.plan_id, p.name, o.subscription_status, o.trial_ends_at,
    o.plan_selected, o.created_at,
    (select count(*) from public.organization_members m where m.organization_id = o.id),
    (select u.email::text from public.organization_members m join auth.users u on u.id = m.user_id
       where m.organization_id = o.id and m.role = 'owner' order by m.created_at asc limit 1),
    (select count(*) from public.organization_modules om where om.organization_id = o.id and om.enabled),
    o.is_internal, o.internal_label,
    count(*) over ()
  from public.organizations o
  left join public.plans p on p.id = o.plan_id
  where search is null or search = '' or o.name ilike '%' || search || '%'
  order by o.is_internal asc, o.created_at desc
  limit limit_n offset offset_n;
end;
$$;

revoke execute on function public.admin_list_organizations(text, int, int) from anon;

create or replace function public.admin_get_organization_detail(org_id uuid)
returns jsonb
language plpgsql security definer stable set search_path = public as $$
declare
  result jsonb;
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  select jsonb_build_object(
    'organization', to_jsonb(o) || jsonb_build_object('plan_name', p.name),
    'members', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'user_id', m.user_id,
        'full_name', m.full_name,
        'email', u.email,
        'role', m.role,
        'last_sign_in_at', u.last_sign_in_at,
        'created_at', m.created_at
      ) order by m.created_at asc), '[]'::jsonb)
      from public.organization_members m
      join auth.users u on u.id = m.user_id
      where m.organization_id = o.id
    ),
    'standard_modules', to_jsonb(o.enabled_modules),
    'private_modules', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'module_id', mod.id,
        'key', mod.key,
        'name', mod.name,
        'description', mod.description,
        'visibility', mod.visibility,
        'status', mod.status,
        'enabled', om.enabled
      ) order by mod.name asc), '[]'::jsonb)
      from public.organization_modules om
      join public.modules mod on mod.id = om.module_id
      where om.organization_id = o.id
    )
  ) into result
  from public.organizations o
  left join public.plans p on p.id = o.plan_id
  where o.id = org_id;

  if result is null then
    raise exception 'organization not found';
  end if;

  return result;
end;
$$;

notify pgrst, 'reload schema';
