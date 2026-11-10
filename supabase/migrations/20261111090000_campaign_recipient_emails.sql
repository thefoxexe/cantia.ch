-- Newsletter / one-off campaigns (send-newsletter-campaign and
-- dispatch-scheduled-newsletter-send): the recipients' e-mails in one query
-- instead of one auth call per person, and the outcome kept with the
-- campaign. On 26.10.2026 a scheduled send found no address at all and was
-- recorded as "32 ignorés, 0 envoyés" with status "sent", without a reason.

create or replace function public.service_user_emails(p_ids uuid[])
returns table (id uuid, email text)
language sql
stable
security definer
set search_path = public, auth
as $$
  select u.id, u.email::text
  from auth.users u
  where u.id = any (p_ids) and u.email is not null;
$$;

revoke all on function public.service_user_emails(uuid[]) from public, anon, authenticated;
grant execute on function public.service_user_emails(uuid[]) to service_role;

alter table public.newsletter_campaigns
  add column if not exists failed_count integer not null default 0,
  add column if not exists error text;
