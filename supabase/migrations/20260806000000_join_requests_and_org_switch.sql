-- Self-service "search a company and request to join" flow, and allow
-- switching companies via an invite link when the caller only ever created
-- their own (empty) organization by mistake.

-- ==========================================================================
-- Join requests
-- ==========================================================================
create table public.organization_join_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references auth.users(id),
  unique (organization_id, user_id)
);

create index on public.organization_join_requests (organization_id);
create index on public.organization_join_requests (user_id);

alter table public.organization_join_requests enable row level security;

create policy "requester can view own requests" on public.organization_join_requests
  for select using (user_id = auth.uid());
create policy "admins can view requests for their org" on public.organization_join_requests
  for select using (public.is_org_admin(organization_id));
create policy "members can request to join" on public.organization_join_requests
  for insert with check (
    user_id = auth.uid()
    and not exists (select 1 from public.organization_members where user_id = auth.uid())
  );
create policy "requester can cancel own pending request" on public.organization_join_requests
  for delete using (user_id = auth.uid() and status = 'pending');
create policy "admins can decide requests for their org" on public.organization_join_requests
  for update using (public.is_org_admin(organization_id));

-- Public-safe directory search: name + member count only, callable by any
-- authenticated user (including one with no organization yet — RLS on
-- `organizations` itself would otherwise hide every row from them).
create or replace function public.search_organizations(search_query text)
returns table(id uuid, name text, member_count bigint)
language sql security definer stable set search_path = public as $$
  select o.id, o.name, count(om.id) as member_count
  from public.organizations o
  left join public.organization_members om on om.organization_id = o.id
  where length(trim(search_query)) >= 2 and o.name ilike '%' || trim(search_query) || '%'
  group by o.id, o.name
  order by o.name
  limit 20;
$$;

grant execute on function public.search_organizations(text) to authenticated;

-- Accept or reject a pending join request. Only callable by an admin of the
-- target organization.
create or replace function public.respond_to_join_request(request_id uuid, approve boolean)
returns void
language plpgsql security definer set search_path = public as $$
declare
  req public.organization_join_requests%rowtype;
  member_count integer;
  plan_max_members integer;
  requester_name text;
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
    if member_count >= plan_max_members then
      raise exception 'Cette entreprise a atteint le nombre maximum de membres de son plan';
    end if;

    select coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), u.email, '') into requester_name
      from auth.users u where u.id = req.user_id;

    insert into public.organization_members (organization_id, user_id, role, full_name)
    values (req.organization_id, req.user_id, 'member', requester_name);

    update public.organization_join_requests set status = 'accepted', decided_at = now(), decided_by = auth.uid() where id = request_id;
  else
    update public.organization_join_requests set status = 'rejected', decided_at = now(), decided_by = auth.uid() where id = request_id;
  end if;
end;
$$;

grant execute on function public.respond_to_join_request(uuid, boolean) to authenticated;

-- ==========================================================================
-- Allow switching companies via an invite link
-- ==========================================================================
-- Replaces the earlier version: if the caller already belongs to an
-- organization, switching is only permitted (and only with explicit
-- confirmation) when they are its sole member — i.e. they created it
-- themselves and never invited anyone. That organization and all its data
-- is then deleted. If other people depend on it, the switch is refused so
-- one member's stray link click can never orphan a shared team.
-- The old single-argument signature must go first: adding a defaulted
-- second parameter would otherwise leave both overloads resolvable for a
-- one-argument call, which Postgres rejects as ambiguous.
drop function if exists public.accept_invite(text);

create or replace function public.accept_invite(invite_token text, confirm_leave_current boolean default false)
returns public.organizations
language plpgsql security definer set search_path = public as $$
declare
  inv public.organization_invites%rowtype;
  member_count integer;
  plan_max_members integer;
  new_org public.organizations%rowtype;
  current_org_id uuid;
  current_org_member_count integer;
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
    -- Sole member: safe to delete, cascades away all of that org's data.
    delete from public.organizations where id = current_org_id;
  end if;

  select count(*) into member_count from public.organization_members where organization_id = inv.organization_id;
  select p.max_members into plan_max_members
    from public.organizations o join public.plans p on p.id = o.plan_id
    where o.id = inv.organization_id;

  if member_count >= plan_max_members then
    raise exception 'Cette entreprise a atteint le nombre maximum de membres de son plan';
  end if;

  insert into public.organization_members (organization_id, user_id, role, full_name)
  values (
    inv.organization_id,
    auth.uid(),
    inv.role,
    coalesce(nullif(auth.jwt() -> 'user_metadata' ->> 'full_name', ''), auth.jwt() ->> 'email', '')
  );

  update public.organization_invites set used_by = auth.uid(), used_at = now() where id = inv.id;

  select * into new_org from public.organizations where id = inv.organization_id;
  return new_org;
end;
$$;

grant execute on function public.accept_invite(text, boolean) to authenticated;
