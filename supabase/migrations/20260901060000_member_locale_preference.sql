-- Per-user language preference, same storage philosophy as full_name/
-- avatar_url/signature_url already on this table (personal, not
-- org-wide — see the comment in app/(app)/compte/profil.tsx that already
-- anticipated this: "name/photo/language belong to the person, not the
-- org"). Captured at signup the same way full_name is (passed into
-- auth.users.raw_user_meta_data, then copied here by the same three RPCs
-- that already copy full_name), so a visitor who signed up from the
-- German site defaults to German from their very first login.

alter table public.organization_members
  add column locale text not null default 'fr' check (locale in ('fr', 'de'));

create or replace function public.create_organization(org_name text, org_trade text default null)
returns organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org public.organizations;
  owner_full_name text;
  owner_locale text;
begin
  select coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), u.email, ''),
         coalesce(nullif(u.raw_user_meta_data ->> 'locale', ''), 'fr')
    into owner_full_name, owner_locale
    from auth.users u
    where u.id = auth.uid();

  insert into public.organizations (name, trade) values (org_name, org_trade)
  returning * into new_org;

  insert into public.organization_members (organization_id, user_id, role, full_name, locale)
  values (new_org.id, auth.uid(), 'owner', owner_full_name, owner_locale);

  insert into public.pdf_templates (organization_id, name, kind, base_layout, is_default, sections) values
    (new_org.id, 'Rapport de chantier standard', 'report', 'classic', true, '["intro","photos","signature"]'::jsonb),
    (new_org.id, 'Classique', 'devis', 'classic', true, '[]'::jsonb),
    (new_org.id, 'Moderne', 'devis', 'moderne', false, '[]'::jsonb),
    (new_org.id, 'Minimal', 'devis', 'minimal', false, '[]'::jsonb),
    (new_org.id, 'Structuré', 'devis', 'structure', false, '[]'::jsonb);

  return new_org;
end;
$$;

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
