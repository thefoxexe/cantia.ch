-- Prefer the name captured at signup (auth user_metadata.full_name) over
-- the e-mail address when stamping a member's display name.

create or replace function public.create_organization(org_name text, org_trade text default null)
returns public.organizations
language plpgsql security definer set search_path = public as $$
declare
  new_org public.organizations;
begin
  insert into public.organizations (name, trade) values (org_name, org_trade)
  returning * into new_org;

  insert into public.organization_members (organization_id, user_id, role, full_name)
  values (
    new_org.id,
    auth.uid(),
    'owner',
    coalesce(nullif(auth.jwt() -> 'user_metadata' ->> 'full_name', ''), auth.jwt() ->> 'email', '')
  );

  insert into public.report_templates (organization_id, name, description) values
    (new_org.id, 'Rapport de chantier standard', 'Notes, photos géoréférencées et signature');

  return new_org;
end;
$$;

create or replace function public.accept_invite(invite_token text)
returns public.organizations
language plpgsql security definer set search_path = public as $$
declare
  inv public.organization_invites%rowtype;
  member_count integer;
  plan_max_members integer;
  new_org public.organizations%rowtype;
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
  if exists (select 1 from public.organization_members where user_id = auth.uid()) then
    raise exception 'Vous appartenez déjà à une entreprise';
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
