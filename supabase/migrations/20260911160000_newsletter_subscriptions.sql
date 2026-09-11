-- Newsletter opt-in: a signup-time checkbox (checked by default), a
-- personal settings toggle to opt out later, and the data the admin
-- bulk-email composer reads from. Absence-of-row-means-default is the
-- pattern used elsewhere in this schema (notification_preferences), but
-- here every existing user is backfilled with an explicit row instead —
-- product decision was to grandfather everyone in, recorded rather than
-- left implicit.
create table public.newsletter_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  subscribed boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.newsletter_subscriptions enable row level security;

create policy "users manage own newsletter subscription" on public.newsletter_subscriptions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "platform admins can view newsletter subscriptions" on public.newsletter_subscriptions
  for select using (public.is_platform_admin());

-- Grandfather every existing account in as subscribed.
insert into public.newsletter_subscriptions (user_id, subscribed)
select id, true from auth.users
on conflict (user_id) do nothing;

-- New signups: the checkbox's choice travels in raw_user_meta_data (same
-- mechanism already used for full_name/locale at signUp()) since a
-- session doesn't necessarily exist yet client-side to write this row
-- directly (email confirmation may still be pending) — this trigger
-- captures it the moment the auth.users row itself is created. OAuth
-- signups (Google/Microsoft) never set this meta key, so they default to
-- subscribed — same as the checkbox's own default state.
create or replace function public.handle_new_user_newsletter_pref()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.newsletter_subscriptions (user_id, subscribed)
  values (new.id, coalesce((new.raw_user_meta_data->>'newsletter_opt_in')::boolean, true))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created_newsletter_pref
  after insert on auth.users
  for each row execute function public.handle_new_user_newsletter_pref();

notify pgrst, 'reload schema';
