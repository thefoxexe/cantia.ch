-- Part 1 of the RH/Heures/Salaires plan (see
-- /root/.claude/plans/module-rh-salaire-heures.md): the "Sur devis" tier
-- for orgs beyond the Entreprise plan's 10-seat cap, plus two new opt-in
-- role permissions (can_create_projects, can_manage_payroll) needed before
-- any payroll UI can gate on them. Payroll data itself (hours, expenses,
-- salary profiles) is a later migration — this one only lays the plan/
-- permission groundwork.

-- ==========================================================================
-- "Sur devis" plan: contact-only, no Stripe self-service checkout. price_
-- chf_monthly becomes nullable so this row can carry no fixed price (shown
-- as "tarif sur mesure" client-side) without special-casing every other
-- plan's arithmetic.
-- ==========================================================================
alter table public.plans
  add column is_contact_only boolean not null default false,
  alter column price_chf_monthly drop not null;

insert into public.plans (
  id, name, storage_quota_mb, max_members, price_chf_monthly, price_chf_yearly,
  has_rtk, has_customization, has_email_sending, has_planning, has_profitability,
  max_trames, max_ai_uses_per_month, max_devis_factures_per_month, is_contact_only
) values (
  'custom', 'Sur devis', 512000, 9999, null, null,
  true, true, true, true, true,
  null, null, null, true
)
on conflict (id) do nothing;

-- ==========================================================================
-- New role permissions: creating a chantier and managing payroll are both
-- opt-in-only (default false), same semantics as can_view_finances — a
-- plain member with no role assigned has neither until an admin grants it
-- via a custom role.
-- ==========================================================================
alter table public.organization_roles
  add column can_create_projects boolean not null default false,
  add column can_manage_payroll boolean not null default false;

create or replace function public.can_create_org_projects(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select
    public.is_org_admin(org_id)
    or exists (
      select 1
      from public.organization_members m
      join public.organization_roles r on r.id = m.role_id
      where m.organization_id = org_id and m.user_id = auth.uid() and r.can_create_projects
    );
$$;

create or replace function public.can_manage_org_payroll(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select
    public.is_org_admin(org_id)
    or exists (
      select 1
      from public.organization_members m
      join public.organization_roles r on r.id = m.role_id
      where m.organization_id = org_id and m.user_id = auth.uid() and r.can_manage_payroll
    );
$$;

-- ==========================================================================
-- Gate chantier creation on the new permission — every other projects
-- policy (view/update/delete) is unchanged.
-- ==========================================================================
drop policy "members can create projects" on public.projects;
create policy "graded members can create projects" on public.projects
  for insert with check (public.can_create_org_projects(organization_id));
