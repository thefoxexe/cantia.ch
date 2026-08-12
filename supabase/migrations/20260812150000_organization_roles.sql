-- Generalizes the single can_view_finances flag added on organization_members
-- (20260812130000) into named, colored, reusable roles — "Secrétaire",
-- "Finance", etc. — an admin creates once and assigns to any number of
-- standard members, instead of toggling a bare switch per person one at a
-- time. Each role bundles one or more permission flags; today that's just
-- can_view_finances (the only gate that actually exists in the app), but the
-- table is shaped to grow more boolean columns the same way plans.* already
-- does for plan-gated features, rather than a free-form permissions blob
-- that would let the UI offer toggles nothing actually enforces.
--
-- The structural role enum (owner/admin/member) is untouched — it still
-- drives org management, invites, billing (is_org_admin() and everything
-- built on it). Custom roles are a purely additive tag layered on top,
-- meaningful only for 'member' rows; owner/admin always have full access
-- regardless of any role assignment.
create table public.organization_roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  color text not null default '#BC5A31',
  can_view_finances boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index organization_roles_org_name_idx on public.organization_roles (organization_id, name);
create index on public.organization_roles (organization_id);

alter table public.organization_members
  add column role_id uuid references public.organization_roles(id) on delete set null;

-- Preserve access for anyone already opted in via the plain per-member
-- toggle: one "Accès devis & factures" role per affected org, auto-created
-- and assigned, so nobody silently loses access when the column is dropped.
do $$
declare
  v_org record;
  v_role_id uuid;
begin
  for v_org in
    select distinct organization_id from public.organization_members
    where role = 'member' and can_view_finances
  loop
    insert into public.organization_roles (organization_id, name, color, can_view_finances)
    values (v_org.organization_id, 'Accès devis & factures', '#BC5A31', true)
    returning id into v_role_id;

    update public.organization_members
    set role_id = v_role_id
    where organization_id = v_org.organization_id and role = 'member' and can_view_finances;
  end loop;
end $$;

alter table public.organization_members drop column can_view_finances;

create or replace function public.can_view_org_finances(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select
    public.is_org_admin(org_id)
    or exists (
      select 1
      from public.organization_members m
      join public.organization_roles r on r.id = m.role_id
      where m.organization_id = org_id and m.user_id = auth.uid() and r.can_view_finances
    );
$$;

alter table public.organization_roles enable row level security;

-- Everyone in the org can see role names/colors (they're shown as pills next
-- to every member) — only admins can create/edit/delete them.
create policy "members can view org roles" on public.organization_roles
  for select using (public.is_org_member(organization_id));
create policy "admins can create org roles" on public.organization_roles
  for insert with check (public.is_org_admin(organization_id));
create policy "admins can update org roles" on public.organization_roles
  for update using (public.is_org_admin(organization_id));
create policy "admins can delete org roles" on public.organization_roles
  for delete using (public.is_org_admin(organization_id));
