-- Nouvelles entreprises: an e-mail is only trusted when the site proves it
-- belongs to the company of the register. The site is guessed from the name
-- (« Lugon Bois Sàrl » → lugonbois.ch), so it is often an older company with
-- the same name, a namesake abroad or a parked domain. Each page read (home,
-- the legal and contact pages it links to, /impressum, /mentions-legales…)
-- is now compared with the register:
--   confirmed  the site shows the company's IDE (CHE-…) or its registered
--              street and number;
--   probable   the site shows the company's name and its NPA and town;
--   doubtful   none of this (namesake, parked page, site built in JS);
--   manual     address typed by the admin.
-- Only a confirmed (or manual) address may be written to automatically.
-- A company without a confirmed address is tried again 7 and 21 days after
-- the first try: a new company often puts its site online a few weeks
-- after being registered.

alter table public.registry_companies add column if not exists email_check text
  check (email_check in ('confirmed', 'probable', 'doubtful', 'manual'));
alter table public.registry_companies add column if not exists email_evidence text;
alter table public.registry_companies add column if not exists email_checked_at timestamptz;
alter table public.registry_companies add column if not exists site_checks int not null default 0;

-- What each page read showed (kept until the company is decided).
create table if not exists public.registry_site_evidence (
  id bigserial primary key,
  registry_id uuid not null references public.registry_companies(id) on delete cascade,
  domain text not null,
  url text not null,
  emails text[] not null default '{}',
  has_uid boolean not null default false,
  has_street boolean not null default false,
  has_zip_town boolean not null default false,
  has_name boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists registry_site_evidence_reg_idx on public.registry_site_evidence (registry_id);
alter table public.registry_site_evidence enable row level security;

alter table public.registry_site_requests add column if not exists url text;

-- Plain text of a page: no tags, no accents, letters and digits only
-- (« CHE-289.391.200 » → « che 289 391 200 », « Rte des Grèves, 41 » →
-- « rte des greves 41 »), the usual street abbreviations unified.
create or replace function public.registry_addr_norm(p text)
returns text
language sql
stable
as $$
  select trim(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(
    regexp_replace(lower(public.unaccent(coalesce(p, ''))), '[^a-z0-9]+', ' ', 'g'),
    '\m(avenue|av)\M', 'av', 'g'),
    '\m(chemin|ch)\M', 'ch', 'g'),
    '\m(route|rte)\M', 'rte', 'g'),
    '\m(boulevard|bd|blvd)\M', 'bd', 'g'),
    '\m(place|pl)\M', 'pl', 'g'),
    '(strasse|str)\M', 'str', 'g'),
    '\s+', ' ', 'g'))
$$;

create or replace function public.registry_page_text(p_html text)
returns text
language sql
stable
as $$
  select public.registry_addr_norm(
    replace(replace(replace(regexp_replace(regexp_replace(regexp_replace(coalesce(p_html, ''),
      '<script[^>]*>.*?</script>', ' ', 'gi'),
      '<style[^>]*>.*?</style>', ' ', 'gi'),
      '<[^>]+>', ' ', 'g'),
      '&nbsp;', ' '), '&#160;', ' '), '&amp;', '&'))
$$;

-- The name without its legal form and owner part (« Swissforestry - Castro
-- Guinez » → swissforestry, « PHYSIO CHATEL Sàrl » → physio chatel).
create or replace function public.registry_name_core(p_name text)
returns text
language sql
stable
as $$
  select trim(regexp_replace(regexp_replace(
    public.registry_addr_norm(split_part(split_part(coalesce(p_name, ''), ' - ', 1), ',', 1)),
    '\m(sarl|sa|ag|gmbh|sagl|snc|sas|ltd|llc|klg|kig|succursale de|succursale di|zweigniederlassung)\M', ' ', 'g'),
    '\s+', ' ', 'g'))
$$;

-- Compare one page with the register.
create or replace function public.registry_page_signals(p_html text, c public.registry_companies)
returns table (has_uid boolean, has_street boolean, has_zip_town boolean, has_name boolean)
language plpgsql
stable
as $$
declare
  t text := ' ' || public.registry_page_text(p_html) || ' ';
  v_uid text := regexp_replace(coalesce(c.uid, ''), '\D', '', 'g');
  v_street text := public.registry_addr_norm(c.street);
  v_street_name text;
  v_street_no text;
  v_town text := split_part(public.registry_addr_norm(c.town), ' ', 1);
  v_core text := public.registry_name_core(c.name);
begin
  v_street_name := trim(regexp_replace(v_street, '\s*\d.*$', ''));
  v_street_no := substring(v_street from '\d+');
  has_uid := length(v_uid) = 9 and t ~ (substr(v_uid, 1, 3) || ' ?' || substr(v_uid, 4, 3) || ' ?' || substr(v_uid, 7, 3));
  has_street := length(v_street_name) > 3 and v_street_no is not null
    and position(' ' || v_street_name || ' ' || v_street_no || ' ' in t) > 0;
  has_zip_town := coalesce(c.zip, '') <> '' and length(v_town) > 1
    and position(' ' || c.zip || ' ' in t) > 0 and position(' ' || v_town in t) > 0;
  has_name := length(v_core) > 2 and position(' ' || v_core || ' ' in t) > 0;
  return next;
end;
$$;

-- Legal and contact pages linked from a home page, on the same site.
create or replace function public.registry_legal_links(p_html text, p_host text, p_domain text)
returns text[]
language sql
immutable
as $$
  select coalesce(array(
    select distinct u from (
      select case
        when h ~* '^https?://' then h
        when h like '//%' then 'https:' || h
        when h like '/%' then 'https://' || p_host || h
        else 'https://' || p_host || '/' || h
      end u
      from (select (regexp_matches(coalesce(p_html, ''), 'href=["'']([^"''#?]+)', 'gi'))[1] h) x
      where h ~* '(impressum|mentions|legal|imprint|contact|kontakt|contatti|colophon|a-propos|about|ueber-uns|chi-siamo)'
        and h !~* '^(mailto|tel|javascript):'
        and h !~* '\.(pdf|jpe?g|png|webp|svg|css|js)$'
    ) y
    where lower(substring(u from '^https?://([^/:?#]+)')) in (p_domain, 'www.' || p_domain)
    limit 6
  ), '{}')
$$;

create or replace function public.registry_find_emails()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  c public.registry_companies;
  s record;
  d text;
  u text;
  v_id bigint;
  v_loc text;
  v_host text;
  v_best record;
  v_n int := 0;
begin
  -- Answers of the sites tried.
  for r in
    select q.*, h.status_code, h.content, h.headers
      from public.registry_site_requests q
      join net._http_response h on h.id = q.request_id
     limit 200
  loop
    select * into c from public.registry_companies where id = r.registry_id;
    if found then
      if r.status_code between 300 and 399 and r.hops = 0 then
        -- One redirect followed (to https, to www., to /contact/…), on the same domain only.
        v_loc := coalesce(r.headers->>'Location', r.headers->>'location');
        if v_loc like '/%' then v_loc := 'https://' || r.host || v_loc; end if;
        v_host := lower(substring(v_loc from '^https?://([^/:?#]+)'));
        if v_host is not null and (v_host = r.domain or v_host like '%.' || r.domain) then
          v_id := net.http_get(url := v_loc, timeout_milliseconds := 15000);
          insert into public.registry_site_requests (request_id, kind, domain, host, hops, registry_id, url)
          values (v_id, r.kind, r.domain, v_host, 1, r.registry_id, v_loc);
        end if;
      elsif r.status_code between 200 and 299 then
        select * into s from public.registry_page_signals(r.content, c);
        insert into public.registry_site_evidence (registry_id, domain, url, emails, has_uid, has_street, has_zip_town, has_name)
        values (r.registry_id, r.domain, coalesce(r.url, 'https://' || r.host),
                public.registry_page_emails(r.content, r.domain), s.has_uid, s.has_street, s.has_zip_town, s.has_name);
        if r.kind = 'site' then
          -- The legal and contact pages say who runs the site: always read them.
          foreach u in array (
            public.registry_legal_links(r.content, r.host, r.domain)
            || array['https://' || r.host || '/impressum', 'https://' || r.host || '/mentions-legales',
                     'https://' || r.host || '/contact', 'https://' || r.host || '/kontakt']
          ) loop
            exit when (select count(*) from public.registry_site_requests q2 where q2.registry_id = r.registry_id and q2.kind = 'page') >= 8;
            if not exists (select 1 from public.registry_site_requests q2 where q2.registry_id = r.registry_id and q2.url = u) then
              v_id := net.http_get(url := u, timeout_milliseconds := 15000);
              insert into public.registry_site_requests (request_id, kind, domain, host, registry_id, url)
              values (v_id, 'page', r.domain, r.host, r.registry_id, u);
            end if;
          end loop;
        end if;
      end if;
    end if;
    delete from public.registry_site_requests where request_id = r.request_id;
    v_n := v_n + 1;
  end loop;

  -- Sites that never answered (unknown domain, timeout).
  delete from public.registry_site_requests q
   where q.created_at < now() - interval '30 minutes'
     and not exists (select 1 from net._http_response h where h.id = q.request_id);

  -- Companies whose pages are all read: decide.
  for r in
    select c2.id
      from public.registry_companies c2
     where c2.site_checked_at is not null
       and c2.site_checked_at > coalesce(c2.email_checked_at, '-infinity'::timestamptz)
       and c2.site_checked_at < now() - interval '2 minutes'
       and not exists (select 1 from public.registry_site_requests q where q.registry_id = c2.id)
     limit 100
  loop
    select e.domain,
           bool_or(e.has_uid) uid, bool_or(e.has_street) street,
           bool_or(e.has_zip_town) zip_town, bool_or(e.has_name) nm,
           array(select distinct x from public.registry_site_evidence e2, unnest(e2.emails) x
                  where e2.registry_id = r.id and e2.domain = e.domain) emails,
           case when bool_or(e.has_uid) or bool_or(e.has_street) then 0
                when bool_or(e.has_zip_town) and bool_or(e.has_name) then 1 else 2 end rank
      into v_best
      from public.registry_site_evidence e
     where e.registry_id = r.id
     group by e.domain
     order by 7, 1
     limit 1;

    if v_best.domain is null then
      update public.registry_companies set email_checked_at = now() where id = r.id;
    else
      update public.registry_companies c3 set
        email = case
          when c3.email_check = 'manual' then c3.email
          when array_length(v_best.emails, 1) > 0 then public.registry_best_email(v_best.emails)
          else c3.email end,
        email_source = case
          when c3.email_check = 'manual' then c3.email_source
          when array_length(v_best.emails, 1) > 0 then 'site:' || v_best.domain
          else c3.email_source end,
        website = case
          when c3.email_check = 'manual' then c3.website
          when v_best.rank < 2 or array_length(v_best.emails, 1) > 0 then 'https://' || v_best.domain
          else c3.website end,
        email_check = case
          when c3.email_check = 'manual' then 'manual'
          when array_length(v_best.emails, 1) is null and c3.email is null then null
          when v_best.rank = 0 then 'confirmed' when v_best.rank = 1 then 'probable' else 'doubtful' end,
        email_evidence = concat_ws(' · ',
          case when v_best.uid then 'IDE sur le site' end,
          case when v_best.street then 'adresse du registre sur le site' end,
          case when v_best.zip_town then 'NPA et localité sur le site' end,
          case when v_best.nm then 'nom sur le site' end,
          case when not (v_best.uid or v_best.street or v_best.zip_town or v_best.nm) then 'rien ne relie le site à l’entreprise' end
        ) || ' (' || v_best.domain || ')',
        email_checked_at = now(),
        updated_at = now()
      where c3.id = r.id;
    end if;
    delete from public.registry_site_evidence where registry_id = r.id;
  end loop;

  -- Next companies to try: never tried, or tried 7 / 21 days ago without a
  -- confirmed address (sites of new companies often come later).
  for r in
    select c4.id, c4.name
      from public.registry_companies c4
     where c4.status <> 'ignored'
       and coalesce(c4.email_check, '') not in ('confirmed', 'manual')
       and (c4.site_checked_at is null
         or (c4.site_checks = 1 and c4.site_checked_at < now() - interval '7 days')
         or (c4.site_checks = 2 and c4.site_checked_at < now() - interval '14 days'))
       and c4.publication_date > current_date - 45
     order by c4.site_checked_at nulls first, c4.publication_date desc
     limit 20
  loop
    foreach d in array public.registry_domains(r.name) loop
      v_id := net.http_get(url := 'https://' || d, timeout_milliseconds := 15000);
      insert into public.registry_site_requests (request_id, kind, domain, host, registry_id, url)
      values (v_id, 'site', d, d, r.id, 'https://' || d);
    end loop;
    update public.registry_companies set site_checked_at = now(), site_checks = site_checks + 1 where id = r.id;
  end loop;

  return v_n;
end;
$$;
revoke all on function public.registry_find_emails() from public, anon, authenticated;

-- Addresses typed by the admin are trusted as such.
create or replace function public.admin_registry_update(
  p_id uuid,
  p_status text default null,
  p_email text default null,
  p_website text default null,
  p_phone text default null,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;
  update public.registry_companies set
    status = coalesce(p_status, status),
    email_check = case
      when p_email is null then email_check
      when nullif(trim(lower(p_email)), '') is null then null
      when nullif(trim(lower(p_email)), '') is distinct from email then 'manual'
      else email_check end,
    email_source = case
      when p_email is not null and nullif(trim(lower(p_email)), '') is distinct from email then null
      else email_source end,
    email_evidence = case
      when p_email is not null and nullif(trim(lower(p_email)), '') is distinct from email then null
      else email_evidence end,
    email = case when p_email is null then email else nullif(trim(lower(p_email)), '') end,
    website = case when p_website is null then website else nullif(trim(p_website), '') end,
    phone = case when p_phone is null then phone else nullif(trim(p_phone), '') end,
    note = case when p_note is null then note else nullif(trim(p_note), '') end,
    contacted_at = case when p_status = 'contacted' and status <> 'contacted' then now() else contacted_at end,
    updated_at = now()
  where id = p_id;
end;
$$;
revoke all on function public.admin_registry_update(uuid, text, text, text, text, text) from public, anon;
grant execute on function public.admin_registry_update(uuid, text, text, text, text, text) to authenticated;

-- Existing addresses: typed ones are manual; found ones are checked again
-- with the new rules (the address stays until the check decides).
update public.registry_companies set email_check = 'manual'
 where email is not null and email_source is null and email_check is null;
update public.registry_companies set site_checked_at = null, site_checks = 0
 where email_source like 'site:%' and email_check is null;
update public.registry_companies set site_checks = 1
 where site_checked_at is not null and site_checks = 0;

notify pgrst, 'reload schema';
