-- Lets the composer (app/(admin)/newsletter) pick a future send time
-- instead of sending immediately. The recipient list is frozen at
-- scheduling time (same array of user_ids the immediate-send path already
-- builds client-side) rather than re-evaluated at send time, so a
-- "résiliés" filter picked today still means today's list even if it's
-- sent Monday.
create table public.scheduled_newsletter_sends (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  html text not null,
  from_persona text not null check (from_persona in ('newsletter', 'info')),
  user_ids uuid[] not null,
  include_unsubscribed boolean not null default false,
  scheduled_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'canceled')),
  error text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
create index scheduled_newsletter_sends_due_idx on public.scheduled_newsletter_sends (scheduled_at) where status = 'pending';
alter table public.scheduled_newsletter_sends enable row level security;
create policy "platform admins can view scheduled newsletter sends" on public.scheduled_newsletter_sends
  for select using (public.is_platform_admin());
-- No insert/update/delete policy — only security-definer RPCs below and the
-- dispatcher (service role) write here, same as newsletter_campaigns.

create or replace function public.admin_schedule_newsletter_send(
  p_subject text,
  p_html text,
  p_user_ids uuid[],
  p_from_persona text,
  p_include_unsubscribed boolean,
  p_scheduled_at timestamptz
)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_id uuid;
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;
  if p_scheduled_at <= now() then
    raise exception 'scheduled_at must be in the future';
  end if;

  insert into public.scheduled_newsletter_sends
    (subject, html, from_persona, user_ids, include_unsubscribed, scheduled_at, created_by)
  values
    (p_subject, p_html, case when p_from_persona = 'info' then 'info' else 'newsletter' end, p_user_ids, p_include_unsubscribed, p_scheduled_at, auth.uid())
  returning id into v_id;

  return v_id;
end;
$$;
revoke all on function public.admin_schedule_newsletter_send(text, text, uuid[], text, boolean, timestamptz) from public;
revoke execute on function public.admin_schedule_newsletter_send(text, text, uuid[], text, boolean, timestamptz) from anon;
grant execute on function public.admin_schedule_newsletter_send(text, text, uuid[], text, boolean, timestamptz) to authenticated;

create or replace function public.admin_list_scheduled_newsletter_sends()
returns setof public.scheduled_newsletter_sends
language plpgsql security definer stable set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;
  return query
    select * from public.scheduled_newsletter_sends
    where status = 'pending'
    order by scheduled_at asc;
end;
$$;
revoke all on function public.admin_list_scheduled_newsletter_sends() from public;
revoke execute on function public.admin_list_scheduled_newsletter_sends() from anon;
grant execute on function public.admin_list_scheduled_newsletter_sends() to authenticated;

create or replace function public.admin_cancel_scheduled_newsletter_send(p_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;
  update public.scheduled_newsletter_sends
  set status = 'canceled'
  where id = p_id and status = 'pending';
end;
$$;
revoke all on function public.admin_cancel_scheduled_newsletter_send(uuid) from public;
revoke execute on function public.admin_cancel_scheduled_newsletter_send(uuid) from anon;
grant execute on function public.admin_cancel_scheduled_newsletter_send(uuid) to authenticated;

-- Runs every 5 minutes (finer-grained than the hourly trial/signup crons —
-- "Monday at 8am" should actually fire close to 8am, not up to 55 minutes
-- late) and hands each due row to the dispatch edge function one at a
-- time, same net.http_post + dispatch-secret pattern as
-- downgrade_expired_trials / send_incomplete_signup_reminders.
create or replace function public.dispatch_scheduled_newsletter_sends()
returns void
language plpgsql security definer set search_path = public, vault as $$
declare
  v_row record;
  v_secret text;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'dispatch_secret';

  for v_row in
    select id from public.scheduled_newsletter_sends
    where status = 'pending' and scheduled_at <= now()
  loop
    perform net.http_post(
      url := 'https://krijilwxhdlzflvnvrtl.supabase.co/functions/v1/dispatch-scheduled-newsletter-send',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'X-Dispatch-Secret', coalesce(v_secret, '')
      ),
      body := jsonb_build_object('schedule_id', v_row.id)
    );
  end loop;
end;
$$;
revoke all on function public.dispatch_scheduled_newsletter_sends() from public;
revoke execute on function public.dispatch_scheduled_newsletter_sends() from anon, authenticated;

select cron.schedule('dispatch-scheduled-newsletter-sends', '*/5 * * * *', $$select public.dispatch_scheduled_newsletter_sends()$$);

notify pgrst, 'reload schema';
