-- Notification when a devis is accepted/signed by the client through the
-- public portal (accept_public_devis) — requested explicitly: "un devis a
-- été signé genre depuis le portail client". Same shape as
-- notify_extra_work_accepted, targeting finance members.

alter table public.notifications drop constraint notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in (
  'devis_stale_draft', 'devis_expiring_soon', 'facture_overdue',
  'recurring_expense_due', 'extra_work_accepted', 'feed_message', 'devis_accepted'
));

create or replace function public.notify_devis_accepted()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
    insert into public.notifications (organization_id, user_id, type, title, body, link, source_table, source_id)
    select new.organization_id, fm.user_id, 'devis_accepted',
           'Devis signé — ' || coalesce(new.number, ''),
           coalesce(new.client_name, 'Le client') || ' a accepté et signé ce devis depuis le portail client.',
           '/(app)/devis/' || new.id,
           'devis', new.id
    from public.finance_member_user_ids(new.organization_id) as fm(user_id)
    where public.notif_in_app_enabled(fm.user_id, 'devis_accepted')
    on conflict (user_id, type, source_id) do nothing;
  end if;
  return new;
end;
$$;

create trigger devis_notify_accepted after update of status on public.devis
for each row execute function public.notify_devis_accepted();
