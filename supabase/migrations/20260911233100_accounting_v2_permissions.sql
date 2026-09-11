-- §13: separate accounting permissions, same extensible pattern as
-- can_view_finances / can_manage_payroll (organization_roles boolean
-- columns + a can_*_org_* security-definer function per permission).
-- owner/admin always pass regardless of role assignment, same as every
-- other permission built on this table.
alter table public.organization_roles
  add column can_view_accounting boolean not null default false,
  add column can_manage_accounting_drafts boolean not null default false,
  add column can_post_accounting_entries boolean not null default false,
  add column can_reverse_accounting_entries boolean not null default false,
  add column can_manage_chart_of_accounts boolean not null default false,
  add column can_close_fiscal_year boolean not null default false;

create or replace function public.can_view_org_accounting(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select
    public.is_org_admin(org_id)
    or exists (
      select 1 from public.organization_members m
      join public.organization_roles r on r.id = m.role_id
      where m.organization_id = org_id and m.user_id = auth.uid()
        and (r.can_view_accounting or r.can_manage_accounting_drafts or r.can_post_accounting_entries)
    );
$$;

create or replace function public.can_manage_org_accounting_drafts(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select
    public.is_org_admin(org_id)
    or exists (
      select 1 from public.organization_members m
      join public.organization_roles r on r.id = m.role_id
      where m.organization_id = org_id and m.user_id = auth.uid() and r.can_manage_accounting_drafts
    );
$$;

create or replace function public.can_post_org_accounting_entries(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select
    public.is_org_admin(org_id)
    or exists (
      select 1 from public.organization_members m
      join public.organization_roles r on r.id = m.role_id
      where m.organization_id = org_id and m.user_id = auth.uid() and r.can_post_accounting_entries
    );
$$;

create or replace function public.can_reverse_org_accounting_entries(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select
    public.is_org_admin(org_id)
    or exists (
      select 1 from public.organization_members m
      join public.organization_roles r on r.id = m.role_id
      where m.organization_id = org_id and m.user_id = auth.uid() and r.can_reverse_accounting_entries
    );
$$;

create or replace function public.can_manage_org_chart_of_accounts(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select
    public.is_org_admin(org_id)
    or exists (
      select 1 from public.organization_members m
      join public.organization_roles r on r.id = m.role_id
      where m.organization_id = org_id and m.user_id = auth.uid() and r.can_manage_chart_of_accounts
    );
$$;

create or replace function public.can_close_org_fiscal_year(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select
    public.is_org_admin(org_id)
    or exists (
      select 1 from public.organization_members m
      join public.organization_roles r on r.id = m.role_id
      where m.organization_id = org_id and m.user_id = auth.uid() and r.can_close_fiscal_year
    );
$$;

notify pgrst, 'reload schema';
