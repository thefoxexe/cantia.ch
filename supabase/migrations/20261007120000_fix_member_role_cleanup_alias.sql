-- Changing a member's role (or a role's permissions) failed with "column
-- fm.user_id does not exist": 20260916180000_can_manage_devis_permission
-- rewrote both cleanup triggers without the explicit column alias that
-- 20260911150000 had added. devis_member_user_ids / finance_member_user_ids
-- return SETOF uuid, so the column must be named: `as fm(user_id)`.

create or replace function public.cleanup_member_finance_notifications()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if not exists (select 1 from public.devis_member_user_ids(new.organization_id) as fm(user_id) where fm.user_id = new.user_id) then
    delete from public.notifications
    where organization_id = new.organization_id and user_id = new.user_id
      and type in ('devis_stale_draft', 'devis_expiring_soon', 'facture_overdue', 'extra_work_accepted');
  end if;
  if not exists (select 1 from public.finance_member_user_ids(new.organization_id) as fm(user_id) where fm.user_id = new.user_id) then
    delete from public.notifications
    where organization_id = new.organization_id and user_id = new.user_id
      and type = 'recurring_expense_due';
  end if;
  return new;
end;
$$;

create or replace function public.cleanup_role_finance_notifications()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  delete from public.notifications n
  where n.type in ('devis_stale_draft', 'devis_expiring_soon', 'facture_overdue', 'extra_work_accepted')
    and exists (
      select 1 from public.organization_members m
      where m.role_id = new.id and m.organization_id = n.organization_id and m.user_id = n.user_id
    )
    and not exists (
      select 1 from public.devis_member_user_ids(n.organization_id) as fm(user_id) where fm.user_id = n.user_id
    );

  delete from public.notifications n
  where n.type = 'recurring_expense_due'
    and exists (
      select 1 from public.organization_members m
      where m.role_id = new.id and m.organization_id = n.organization_id and m.user_id = n.user_id
    )
    and not exists (
      select 1 from public.finance_member_user_ids(n.organization_id) as fm(user_id) where fm.user_id = n.user_id
    );

  return new;
end;
$$;
