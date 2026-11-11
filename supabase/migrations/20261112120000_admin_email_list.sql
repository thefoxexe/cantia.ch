-- Super Admin › E-mails: the outside addresses of the e-mail being prepared,
-- kept in the database instead of one browser, so the list built on a phone
-- (Nouvelles entreprises) is there on the computer too. Emptied once the
-- e-mail is sent; the companies of the register that were in it are then
-- marked « contactée ».

create table if not exists public.admin_email_list (
  email text primary key,
  name text,
  company text,
  locale text not null default 'fr' check (locale in ('fr', 'de', 'it')),
  registry_id uuid references public.registry_companies(id) on delete set null,
  added_by uuid references auth.users(id) on delete set null,
  added_at timestamptz not null default now()
);
alter table public.admin_email_list enable row level security;
create policy "platform admins manage the e-mail list" on public.admin_email_list
  for all using (public.is_platform_admin()) with check (public.is_platform_admin());
grant select, insert, update, delete on public.admin_email_list to authenticated;

-- After a send: the register companies whose address was sent to become
-- « contactée », and the list is emptied of those addresses.
create or replace function public.admin_email_list_sent(p_emails text[])
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_n int;
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;
  update public.registry_companies
     set status = 'contacted', contacted_at = coalesce(contacted_at, now()), updated_at = now()
   where lower(email) = any(select lower(x) from unnest(p_emails) x) and status <> 'contacted';
  get diagnostics v_n = row_count;
  delete from public.admin_email_list where lower(email) = any(select lower(x) from unnest(p_emails) x);
  return v_n;
end;
$$;
revoke all on function public.admin_email_list_sent(text[]) from public, anon;
grant execute on function public.admin_email_list_sent(text[]) to authenticated;

notify pgrst, 'reload schema';
