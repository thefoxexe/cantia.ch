-- Company invite links (join an existing organization instead of creating
-- one) and per-chantier access restriction.

-- ==========================================================================
-- Organization invites
-- ==========================================================================
create table public.organization_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  token text not null default encode(gen_random_bytes(20), 'hex'),
  role public.org_role not null default 'member',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  used_by uuid references auth.users(id),
  used_at timestamptz,
  revoked boolean not null default false
);

create unique index on public.organization_invites (token);
create index on public.organization_invites (organization_id);

alter table public.organization_invites enable row level security;

create policy "admins can view their org invites" on public.organization_invites
  for select using (public.is_org_admin(organization_id));
create policy "admins can create invites" on public.organization_invites
  for insert with check (public.is_org_admin(organization_id) and created_by = auth.uid());
create policy "admins can revoke invites" on public.organization_invites
  for update using (public.is_org_admin(organization_id));
create policy "admins can delete invites" on public.organization_invites
  for delete using (public.is_org_admin(organization_id));

-- Public-safe lookup so an unauthenticated visitor can see which company
-- they're about to join before signing up.
create or replace function public.invite_preview(invite_token text)
returns table(organization_name text, valid boolean)
language plpgsql security definer set search_path = public as $$
declare
  inv public.organization_invites%rowtype;
begin
  select * into inv from public.organization_invites where token = invite_token;
  if inv.id is null or inv.used_at is not null or inv.revoked or inv.expires_at < now() then
    return query select null::text, false;
  else
    return query select o.name, true from public.organizations o where o.id = inv.organization_id;
  end if;
end;
$$;

grant execute on function public.invite_preview(text) to authenticated, anon;

-- Redeems an invite for the calling (already authenticated) user. A personal
-- account can belong to only one organization at a time, so this fails if
-- the caller is already a member somewhere.
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
  values (inv.organization_id, auth.uid(), inv.role, coalesce(auth.jwt() ->> 'email', ''));

  update public.organization_invites set used_by = auth.uid(), used_at = now() where id = inv.id;

  select * into new_org from public.organizations where id = inv.organization_id;
  return new_org;
end;
$$;

grant execute on function public.accept_invite(text) to authenticated;

-- ==========================================================================
-- Per-chantier access restriction
-- ==========================================================================
create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);

create index on public.project_members (project_id);

alter table public.project_members enable row level security;

create policy "org admins can view project access lists" on public.project_members
  for select using (
    exists (select 1 from public.projects p where p.id = project_members.project_id and public.is_org_admin(p.organization_id))
  );
create policy "org admins can grant project access" on public.project_members
  for insert with check (
    exists (select 1 from public.projects p where p.id = project_members.project_id and public.is_org_admin(p.organization_id))
  );
create policy "org admins can revoke project access" on public.project_members
  for delete using (
    exists (select 1 from public.projects p where p.id = project_members.project_id and public.is_org_admin(p.organization_id))
  );

-- True when the caller may see a given project's content: org admins always
-- can, and members can unless the project has an explicit access list that
-- excludes them. No rows in project_members means the chantier is open to
-- the whole organization (the default, unchanged behaviour).
create or replace function public.has_project_access(proj_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select
    exists (
      select 1 from public.projects p
      where p.id = proj_id and public.is_org_admin(p.organization_id)
    )
    or not exists (
      select 1 from public.project_members pm where pm.project_id = proj_id
    )
    or exists (
      select 1 from public.project_members pm
      where pm.project_id = proj_id and pm.user_id = auth.uid()
    );
$$;

grant execute on function public.has_project_access(uuid) to authenticated;

-- ---- projects ----
drop policy "members can view projects" on public.projects;
create policy "members can view accessible projects" on public.projects
  for select using (public.is_org_member(organization_id) and public.has_project_access(id));

drop policy "members can update projects" on public.projects;
create policy "members can update accessible projects" on public.projects
  for update using (public.is_org_member(organization_id) and public.has_project_access(id));

-- ---- reports ----
drop policy "members can view reports" on public.reports;
create policy "members can view accessible reports" on public.reports
  for select using (public.is_org_member(organization_id) and public.has_project_access(project_id));

drop policy "members can create reports" on public.reports;
create policy "members can create reports on accessible projects" on public.reports
  for insert with check (public.is_org_member(organization_id) and public.has_project_access(project_id));

drop policy "members can update reports" on public.reports;
create policy "members can update accessible reports" on public.reports
  for update using (public.is_org_member(organization_id) and public.has_project_access(project_id));

-- ---- report_photos ----
drop policy "members can view report photos" on public.report_photos;
create policy "members can view accessible report photos" on public.report_photos
  for select using (exists (
    select 1 from public.reports r
    where r.id = report_photos.report_id and public.is_org_member(r.organization_id) and public.has_project_access(r.project_id)
  ));
drop policy "members can add report photos" on public.report_photos;
create policy "members can add accessible report photos" on public.report_photos
  for insert with check (exists (
    select 1 from public.reports r
    where r.id = report_photos.report_id and public.is_org_member(r.organization_id) and public.has_project_access(r.project_id)
  ));
drop policy "members can delete report photos" on public.report_photos;
create policy "members can delete accessible report photos" on public.report_photos
  for delete using (exists (
    select 1 from public.reports r
    where r.id = report_photos.report_id and public.is_org_member(r.organization_id) and public.has_project_access(r.project_id)
  ));

-- ---- feed_entries ----
drop policy "members can view feed entries" on public.feed_entries;
create policy "members can view accessible feed entries" on public.feed_entries
  for select using (public.is_org_member(organization_id) and public.has_project_access(project_id));
drop policy "members can add feed entries" on public.feed_entries;
create policy "members can add feed entries on accessible projects" on public.feed_entries
  for insert with check (public.is_org_member(organization_id) and created_by = auth.uid() and public.has_project_access(project_id));
drop policy "members can update feed entries" on public.feed_entries;
create policy "members can update accessible feed entries" on public.feed_entries
  for update using (public.is_org_member(organization_id) and public.has_project_access(project_id));

-- ---- files (project_id is nullable: org-wide files stay unrestricted) ----
drop policy "members can view files" on public.files;
create policy "members can view accessible files" on public.files
  for select using (public.is_org_member(organization_id) and (project_id is null or public.has_project_access(project_id)));
drop policy "members can upload files" on public.files;
create policy "members can upload accessible files" on public.files
  for insert with check (public.is_org_member(organization_id) and (project_id is null or public.has_project_access(project_id)));
drop policy "members can delete files" on public.files;
create policy "members can delete accessible files" on public.files
  for delete using (public.is_org_member(organization_id) and (project_id is null or public.has_project_access(project_id)));

-- ---- folders ----
drop policy "members can view folders" on public.folders;
create policy "members can view accessible folders" on public.folders
  for select using (public.is_org_member(organization_id) and public.has_project_access(project_id));
drop policy "members can create folders" on public.folders;
create policy "members can create folders on accessible projects" on public.folders
  for insert with check (public.is_org_member(organization_id) and public.has_project_access(project_id));
drop policy "members can rename folders" on public.folders;
create policy "members can rename accessible folders" on public.folders
  for update using (public.is_org_member(organization_id) and public.has_project_access(project_id));
drop policy "members can delete folders" on public.folders;
create policy "members can delete accessible folders" on public.folders
  for delete using (public.is_org_member(organization_id) and public.has_project_access(project_id));

-- ---- survey_points ----
drop policy "members can view survey points" on public.survey_points;
create policy "members can view accessible survey points" on public.survey_points
  for select using (public.is_org_member(organization_id) and public.has_project_access(project_id));
drop policy "members can add survey points" on public.survey_points;
create policy "members can add survey points on accessible projects" on public.survey_points
  for insert with check (public.is_org_member(organization_id) and public.has_project_access(project_id));
drop policy "members can update survey points" on public.survey_points;
create policy "members can update accessible survey points" on public.survey_points
  for update using (public.is_org_member(organization_id) and public.has_project_access(project_id));
drop policy "members can delete survey points" on public.survey_points;
create policy "members can delete accessible survey points" on public.survey_points
  for delete using (public.is_org_member(organization_id) and public.has_project_access(project_id));

-- ---- metre_items ----
drop policy "members can view metre items" on public.metre_items;
create policy "members can view accessible metre items" on public.metre_items
  for select using (public.is_org_member(organization_id) and public.has_project_access(project_id));
drop policy "members can add metre items" on public.metre_items;
create policy "members can add metre items on accessible projects" on public.metre_items
  for insert with check (public.is_org_member(organization_id) and public.has_project_access(project_id));
drop policy "members can update metre items" on public.metre_items;
create policy "members can update accessible metre items" on public.metre_items
  for update using (public.is_org_member(organization_id) and public.has_project_access(project_id));
drop policy "members can delete metre items" on public.metre_items;
create policy "members can delete accessible metre items" on public.metre_items
  for delete using (public.is_org_member(organization_id) and public.has_project_access(project_id));
