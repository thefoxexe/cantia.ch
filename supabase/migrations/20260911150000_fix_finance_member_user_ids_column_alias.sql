-- Real pre-existing bug found while testing ownership transfer: both
-- cleanup_member_finance_notifications() and
-- cleanup_role_finance_notifications() (20260821130000) call
-- finance_member_user_ids(...) — which returns `setof uuid`, a single
-- unnamed column — as `fm` with no explicit column alias. Postgres then
-- names that column after the function itself
-- (fm.finance_member_user_ids), not fm.user_id, so every reference to
-- fm.user_id below raised "column fm.user_id does not exist" and aborted
-- the whole UPDATE. This fired on every AFTER UPDATE OF role, role_id ON
-- organization_members (any role change, anywhere in the app — équipe.tsx
-- promotions/demotions, custom-role assignment, and now ownership
-- transfer) and every AFTER UPDATE OF can_view_finances ON
-- organization_roles. Fixed by giving the function's output column its
-- name explicitly, `as fm(user_id)`, matching every other call site of
-- finance_member_user_ids in this codebase.
create or replace function public.cleanup_member_finance_notifications()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.finance_member_user_ids(new.organization_id) as fm(user_id) where fm.user_id = new.user_id) then
    delete from public.notifications
    where organization_id = new.organization_id and user_id = new.user_id
      and type in ('devis_stale_draft', 'devis_expiring_soon', 'facture_overdue', 'recurring_expense_due', 'extra_work_accepted');
  end if;
  return new;
end;
$$;

create or replace function public.cleanup_role_finance_notifications()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.can_view_finances = false and old.can_view_finances is not false then
    delete from public.notifications n
    where n.type in ('devis_stale_draft', 'devis_expiring_soon', 'facture_overdue', 'recurring_expense_due', 'extra_work_accepted')
      and exists (
        select 1 from public.organization_members m
        where m.role_id = new.id and m.organization_id = n.organization_id and m.user_id = n.user_id
      )
      and not exists (
        select 1 from public.finance_member_user_ids(n.organization_id) as fm(user_id) where fm.user_id = n.user_id
      );
  end if;
  return new;
end;
$$;
