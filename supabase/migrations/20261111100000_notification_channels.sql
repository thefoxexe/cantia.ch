-- Notification settings (app/(app)/compte/notifications): each channel is
-- now independent. Before, switching "Dans l'app" off stopped the row from
-- being created at all, so the e-mail and the push went with it, and a few
-- senders (e-mail events, portal views, fiduciary requests) ignored the
-- settings entirely.
--
-- Now: a notification is created as long as one channel is on; its
-- in_app flag says whether the bell shows it; dispatch-notification keeps
-- reading email_enabled / push_enabled. Everything off: nothing is created.

alter table public.notifications add column if not exists in_app boolean not null default true;

create or replace function public.notif_in_app_enabled(p_user_id uuid, p_type text)
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select in_app_enabled or email_enabled or push_enabled
       from public.notification_preferences where user_id = p_user_id and type = p_type),
    true
  );
$$;

create or replace function public.notifications_apply_preferences()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  p record;
begin
  select in_app_enabled, email_enabled, push_enabled into p
    from public.notification_preferences where user_id = new.user_id and type = new.type;
  if found then
    if not (p.in_app_enabled or p.email_enabled or p.push_enabled) then
      return null;
    end if;
    new.in_app := p.in_app_enabled;
  end if;
  return new;
end;
$$;

drop trigger if exists notifications_apply_preferences on public.notifications;
create trigger notifications_apply_preferences
  before insert on public.notifications
  for each row execute function public.notifications_apply_preferences();
