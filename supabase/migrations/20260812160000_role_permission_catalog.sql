-- Generalizes the single can_view_finances checkbox on organization_roles
-- into a full permission catalog, one checkbox per real, cleanly-isolated
-- feature area: Finance (devis + factures + rentabilité — grouped together
-- per explicit request), Levés, Métré, Planning, Documents. "Photos" is
-- deliberately left out: the in-chantier Photos tab and the Carte tab are
-- just filtered views over the same report_photos rows the always-open
-- Rapports tab shows, so gating it per-role would either also lock people
-- out of Rapports (not asked for) or require restructuring how photos are
-- stored — out of scope here.
--
-- can_view_finances keeps its existing semantics: a plain member with no
-- role assigned has NO access (opt-in only). The four new columns default
-- true instead, and their can_view_org_* functions treat "no role
-- assigned" as full access too — so creating a role and only touching the
-- Finance checkbox doesn't silently strip a member's existing access to
-- everything else; an admin has to explicitly uncheck what they want to
-- restrict.
alter table public.organization_roles
  add column can_view_survey boolean not null default true,
  add column can_view_metre boolean not null default true,
  add column can_view_planning boolean not null default true,
  add column can_view_documents boolean not null default true;

create or replace function public.can_view_org_survey(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select
    public.is_org_admin(org_id)
    or exists (
      select 1 from public.organization_members m
      left join public.organization_roles r on r.id = m.role_id
      where m.organization_id = org_id and m.user_id = auth.uid()
        and (m.role_id is null or r.can_view_survey)
    );
$$;

create or replace function public.can_view_org_metre(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select
    public.is_org_admin(org_id)
    or exists (
      select 1 from public.organization_members m
      left join public.organization_roles r on r.id = m.role_id
      where m.organization_id = org_id and m.user_id = auth.uid()
        and (m.role_id is null or r.can_view_metre)
    );
$$;

create or replace function public.can_view_org_planning(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select
    public.is_org_admin(org_id)
    or exists (
      select 1 from public.organization_members m
      left join public.organization_roles r on r.id = m.role_id
      where m.organization_id = org_id and m.user_id = auth.uid()
        and (m.role_id is null or r.can_view_planning)
    );
$$;

create or replace function public.can_view_org_documents(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select
    public.is_org_admin(org_id)
    or exists (
      select 1 from public.organization_members m
      left join public.organization_roles r on r.id = m.role_id
      where m.organization_id = org_id and m.user_id = auth.uid()
        and (m.role_id is null or r.can_view_documents)
    );
$$;

-- ==========================================================================
-- Finance: also cover project_expenses (the raw cost lines behind
-- Rentabilité) — devis/factures themselves were already covered by
-- 20260812130000.
-- ==========================================================================
drop policy "members can view project expenses" on public.project_expenses;
drop policy "members can create project expenses" on public.project_expenses;
drop policy "members can update project expenses" on public.project_expenses;

create policy "finance-permitted members can view project expenses" on public.project_expenses
  for select using (public.can_view_org_finances(organization_id));
create policy "finance-permitted members can create project expenses" on public.project_expenses
  for insert with check (public.can_view_org_finances(organization_id) and created_by = auth.uid());
create policy "finance-permitted members can update project expenses" on public.project_expenses
  for update using (public.can_view_org_finances(organization_id));
-- delete policy ("authors and admins can delete project expenses") is
-- unchanged — an author who later loses finance access keeps the right to
-- remove their own already-existing entries; only admins can remove others'.

-- ==========================================================================
-- Planning
-- ==========================================================================
drop policy "members can view planning assignments" on public.planning_assignments;
drop policy "members can create planning assignments" on public.planning_assignments;
drop policy "members can update planning assignments" on public.planning_assignments;

create policy "planning-permitted members can view planning assignments" on public.planning_assignments
  for select using (public.can_view_org_planning(organization_id));
create policy "planning-permitted members can create planning assignments" on public.planning_assignments
  for insert with check (public.can_view_org_planning(organization_id) and created_by = auth.uid());
create policy "planning-permitted members can update planning assignments" on public.planning_assignments
  for update using (public.can_view_org_planning(organization_id));
-- delete policy unchanged, same reasoning as project_expenses above.

-- ==========================================================================
-- Levés (survey_points) — layered on top of the existing chantier-level
-- has_project_access whitelist, not replacing it.
-- ==========================================================================
drop policy "members can view accessible survey points" on public.survey_points;
drop policy "members can add survey points on accessible projects" on public.survey_points;
drop policy "members can update accessible survey points" on public.survey_points;
drop policy "members can delete accessible survey points" on public.survey_points;

create policy "survey-permitted members can view survey points" on public.survey_points
  for select using (public.is_org_member(organization_id) and public.has_project_access(project_id) and public.can_view_org_survey(organization_id));
create policy "survey-permitted members can add survey points" on public.survey_points
  for insert with check (public.is_org_member(organization_id) and public.has_project_access(project_id) and public.can_view_org_survey(organization_id));
create policy "survey-permitted members can update survey points" on public.survey_points
  for update using (public.is_org_member(organization_id) and public.has_project_access(project_id) and public.can_view_org_survey(organization_id));
create policy "survey-permitted members can delete survey points" on public.survey_points
  for delete using (public.is_org_member(organization_id) and public.has_project_access(project_id) and public.can_view_org_survey(organization_id));

-- ==========================================================================
-- Métré (metre_items)
-- ==========================================================================
drop policy "members can view accessible metre items" on public.metre_items;
drop policy "members can add metre items on accessible projects" on public.metre_items;
drop policy "members can update accessible metre items" on public.metre_items;
drop policy "members can delete accessible metre items" on public.metre_items;

create policy "metre-permitted members can view metre items" on public.metre_items
  for select using (public.is_org_member(organization_id) and public.has_project_access(project_id) and public.can_view_org_metre(organization_id));
create policy "metre-permitted members can add metre items" on public.metre_items
  for insert with check (public.is_org_member(organization_id) and public.has_project_access(project_id) and public.can_view_org_metre(organization_id));
create policy "metre-permitted members can update metre items" on public.metre_items
  for update using (public.is_org_member(organization_id) and public.has_project_access(project_id) and public.can_view_org_metre(organization_id));
create policy "metre-permitted members can delete metre items" on public.metre_items
  for delete using (public.is_org_member(organization_id) and public.has_project_access(project_id) and public.can_view_org_metre(organization_id));

-- ==========================================================================
-- Documents (files, folders) — files.project_id is nullable (org-wide
-- files bypass the project whitelist, same as before); the new permission
-- check applies regardless of that.
-- ==========================================================================
drop policy "members can view accessible files" on public.files;
drop policy "members can upload accessible files" on public.files;
drop policy "members can delete accessible files" on public.files;

create policy "documents-permitted members can view files" on public.files
  for select using (public.is_org_member(organization_id) and (project_id is null or public.has_project_access(project_id)) and public.can_view_org_documents(organization_id));
create policy "documents-permitted members can upload files" on public.files
  for insert with check (public.is_org_member(organization_id) and (project_id is null or public.has_project_access(project_id)) and public.can_view_org_documents(organization_id));
create policy "documents-permitted members can delete files" on public.files
  for delete using (public.is_org_member(organization_id) and (project_id is null or public.has_project_access(project_id)) and public.can_view_org_documents(organization_id));

drop policy "members can view accessible folders" on public.folders;
drop policy "members can create folders on accessible projects" on public.folders;
drop policy "members can rename accessible folders" on public.folders;
drop policy "members can delete accessible folders" on public.folders;

create policy "documents-permitted members can view folders" on public.folders
  for select using (public.is_org_member(organization_id) and public.has_project_access(project_id) and public.can_view_org_documents(organization_id));
create policy "documents-permitted members can create folders" on public.folders
  for insert with check (public.is_org_member(organization_id) and public.has_project_access(project_id) and public.can_view_org_documents(organization_id));
create policy "documents-permitted members can rename folders" on public.folders
  for update using (public.is_org_member(organization_id) and public.has_project_access(project_id) and public.can_view_org_documents(organization_id));
create policy "documents-permitted members can delete folders" on public.folders
  for delete using (public.is_org_member(organization_id) and public.has_project_access(project_id) and public.can_view_org_documents(organization_id));
