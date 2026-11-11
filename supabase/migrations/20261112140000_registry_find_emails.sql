-- Nouvelles entreprises: find the e-mail by itself. The register gives the
-- name only, so the likely sites are tried (« Lugon Bois Sàrl » →
-- lugonbois.ch, lugon-bois.ch); when one answers, its home, contact and
-- legal pages are read and an address is kept only when it is on that same
-- domain (no address of a host, of a directory or of a parked domain).
-- 20 companies tried per minute, without any key.

alter table public.registry_companies add column if not exists email_source text;
alter table public.registry_companies add column if not exists site_checked_at timestamptz;

-- Sites asked with pg_net and not read yet.
create table if not exists public.registry_site_requests (
  request_id bigint primary key,
  kind text not null check (kind in ('site', 'page')),
  domain text not null,             -- the company's domain (addresses must be on it)
  host text not null,               -- the host asked (www.… after a redirect)
  hops int not null default 0,
  registry_id uuid not null,
  created_at timestamptz not null default now()
);
alter table public.registry_site_requests enable row level security;

-- Likely .ch domains of a company name.
create or replace function public.registry_domains(p_name text)
returns text[]
language sql
stable
as $$
  with n as (
    -- The whole name, and its part before a comma (« Garage Fipa, Minguez & Glassey »).
    select distinct lower(public.unaccent(x)) s
      from unnest(array[split_part(coalesce(p_name, ''), ' - ', 1), split_part(split_part(coalesce(p_name, ''), ' - ', 1), ',', 1)]) x
  ), c as (
    select regexp_replace(s, '\m(sarl|sa|ag|gmbh|sagl|snc|sas|ltd|llc|klg|kig|en liquidation|in liquidation|in liquidazione|succursale de|succursale di|zweigniederlassung)\M', ' ', 'g') s from n
  ), w as (
    select array_remove(regexp_split_to_array(trim(regexp_replace(regexp_replace(s, '[^a-z0-9]+', ' ', 'g'), '\s+', ' ', 'g')), ' '), '') a from c
  )
  select coalesce(array(
    select distinct d from (
      select array_to_string(a, '') || '.ch' d from w where coalesce(array_length(a, 1), 0) between 1 and 4
      union all
      select array_to_string(a, '-') || '.ch' from w where coalesce(array_length(a, 1), 0) between 2 and 4
    ) x where length(d) between 6 and 40
  ), '{}')
$$;

-- E-mail addresses of a page that belong to its domain (or a subdomain).
create or replace function public.registry_page_emails(p_html text, p_domain text)
returns text[]
language sql
immutable
as $$
  with t as (
    select regexp_replace(regexp_replace(regexp_replace(lower(coalesce(p_html, '')),
      '&#0*64;|&#x40;|\s*[\[\(]\s*(at|ät|arobase)\s*[\]\)]\s*', '@', 'g'),
      '&#0*46;|\s*[\[\(]\s*(dot|point|punkt)\s*[\]\)]\s*', '.', 'g'),
      'mailto:', ' ', 'g') s
  )
  select coalesce(array(
    select distinct m[1] from t, regexp_matches(t.s, '([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})', 'g') m
    where (m[1] like '%@' || p_domain or m[1] like '%.' || p_domain)
      and m[1] !~ '\.(png|jpe?g|gif|webp|svg)$'
      and m[1] !~ '^(noreply|no-reply|webmaster|postmaster|abuse|hostmaster)@'
  ), '{}')
$$;

-- The best address of a list: info@, contact@, bureau@, office@ first.
create or replace function public.registry_best_email(p_emails text[])
returns text
language sql
immutable
as $$
  select e from unnest(p_emails) e
  order by case
    when e like 'info@%' then 0 when e like 'contact@%' then 1 when e like 'bureau@%' then 2
    when e like 'office@%' then 3 when e like 'admin@%' then 4 else 5 end, length(e)
  limit 1
$$;

create or replace function public.registry_find_emails()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  d text;
  v_id bigint;
  v_emails text[];
  v_loc text;
  v_host text;
  v_n int := 0;
begin
  -- Answers of the sites tried.
  for r in
    select q.*, h.status_code, h.content, h.headers
      from public.registry_site_requests q
      join net._http_response h on h.id = q.request_id
     limit 200
  loop
    if r.status_code between 300 and 399 and r.hops = 0 then
      -- One redirect followed (to https, to www., to /contact/…).
      v_loc := coalesce(r.headers->>'Location', r.headers->>'location');
      if v_loc like '/%' then v_loc := 'https://' || r.host || v_loc; end if;
      v_host := lower(substring(v_loc from '^https?://([^/:?#]+)'));
      if v_host is not null and (v_host = r.domain or v_host like '%.' || r.domain) then
        v_id := net.http_get(url := v_loc, timeout_milliseconds := 15000);
        insert into public.registry_site_requests (request_id, kind, domain, host, hops, registry_id)
        values (v_id, r.kind, r.domain, v_host, 1, r.registry_id);
      end if;
    elsif r.status_code between 200 and 299 then
      v_emails := public.registry_page_emails(r.content, r.domain);
      if array_length(v_emails, 1) > 0 then
        update public.registry_companies
           set email = coalesce(email, public.registry_best_email(v_emails)),
               email_source = coalesce(email_source, 'site:' || r.domain),
               website = coalesce(website, 'https://' || r.host),
               updated_at = now()
         where id = r.registry_id;
      elsif r.kind = 'site' then
        -- The site exists: its contact and legal pages often carry the address.
        -- (No website kept without an address: the domain may belong to
        -- someone else or be parked.)
        foreach d in array array['/contact', '/kontakt', '/impressum', '/mentions-legales', '/contatti'] loop
          v_id := net.http_get(url := 'https://' || r.host || d, timeout_milliseconds := 15000);
          insert into public.registry_site_requests (request_id, kind, domain, host, registry_id)
          values (v_id, 'page', r.domain, r.host, r.registry_id);
        end loop;
      end if;
    end if;
    delete from public.registry_site_requests where request_id = r.request_id;
    v_n := v_n + 1;
  end loop;

  -- Next companies to try: the newest without an e-mail.
  for r in
    select c.id, c.name
      from public.registry_companies c
     where c.email is null and c.site_checked_at is null and c.status <> 'ignored'
     order by c.publication_date desc
     limit 20
  loop
    foreach d in array public.registry_domains(r.name) loop
      v_id := net.http_get(url := 'https://' || d, timeout_milliseconds := 15000);
      insert into public.registry_site_requests (request_id, kind, domain, host, registry_id) values (v_id, 'site', d, d, r.id);
    end loop;
    update public.registry_companies set site_checked_at = now() where id = r.id;
  end loop;

  -- Sites that never answered (unknown domain, timeout).
  delete from public.registry_site_requests q
   where q.created_at < now() - interval '30 minutes'
     and not exists (select 1 from net._http_response h where h.id = q.request_id);
  return v_n;
end;
$$;
revoke all on function public.registry_find_emails() from public, anon, authenticated;

select cron.schedule('registry-find-emails', '* * * * *', $$select public.registry_find_emails()$$);

notify pgrst, 'reload schema';
