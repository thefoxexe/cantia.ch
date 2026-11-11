-- Super Admin › Nouvelles entreprises: companies newly entered in the
-- commercial register (FOSC / SHAB, sub-rubric HR01), to find businesses
-- that just started and contact them.
--
-- Everything runs in the database, without any key: pg_net calls the public
-- SHAB API (https://www.shab.ch/api/v1), the answers are read here.
--   1. registry_queue(cantons, days) asks for the list of HR publications of
--      each canton over the last days (the API returns new entries,
--      changes and deletions together, only HR01 is kept).
--   2. registry_process(), every minute, reads the answers that arrived:
--      for each new entry not stored yet it asks for its XML, and stores
--      each XML that came back (name, IDE, address, purpose, people
--      registered), with the trades guessed from the name and purpose.
--   3. Every morning the last 3 days of the French-speaking cantons are
--      queued; the admin page can queue other cantons or a longer period.
-- The register holds no e-mail: the admin finds it on the company's site
-- and keeps it here with a status (à traiter, contactée, ignorée).

create table if not exists public.registry_companies (
  id uuid primary key,                -- SHAB publication id
  publication_date date not null,
  canton text not null,
  language text,
  name text not null,
  uid text,
  legal_form text,
  seat text,
  street text,
  zip text,
  town text,
  purpose text,
  persons text,
  trades text[] not null default '{}',
  status text not null default 'new' check (status in ('new', 'contacted', 'ignored')),
  email text,
  website text,
  phone text,
  note text,
  contacted_at timestamptz,
  fetched_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists registry_companies_date_idx on public.registry_companies (publication_date desc);
create index if not exists registry_companies_canton_idx on public.registry_companies (canton, publication_date desc);
alter table public.registry_companies enable row level security;
drop policy if exists "platform admins read registry companies" on public.registry_companies;
create policy "platform admins read registry companies" on public.registry_companies
  for select using (public.is_platform_admin());
-- Writes go through admin_registry_update (security definer) and the
-- processing below.

-- Requests sent with pg_net and not processed yet.
create table if not exists public.registry_requests (
  request_id bigint primary key,
  kind text not null check (kind in ('list', 'detail')),
  canton text,
  publication_id uuid,
  page int not null default 0,
  start_date date,
  end_date date,
  created_at timestamptz not null default now()
);
alter table public.registry_requests enable row level security;

-- Text of an XML node, entities decoded.
create or replace function public.registry_xtext(x xml, path text)
returns text
language sql
immutable
as $$
  select nullif(trim(
    replace(replace(replace(replace(replace(
      (xpath(path, x))[1]::text,
      '&lt;', '<'), '&gt;', '>'), '&quot;', '"'), '&apos;', ''''), '&amp;', '&')
  ), '')
$$;

-- Trades guessed from the name and purpose (French, German, Italian).
create or replace function public.registry_trades(p_text text)
returns text[]
language sql
stable
as $$
  with t as (select lower(public.unaccent(coalesce(p_text, ''))) s)
  select coalesce(array_agg(k order by k), '{}') from (
    select 'bois' k from t where s ~ '(charpent|menuis|ebenist|agencement|zimmerei|schreiner|holzbau|falegnam|carpenter)'
    union all select 'peinture' from t where s ~ '(peintur|platre|plâtr|gypserie|gipser|maler|pittur|tapiss|facade|fassade)'
    union all select 'electricite' from t where s ~ '(electric|elektr|impianti elettric)'
    union all select 'sanitaire' from t where s ~ '(sanitair|chauffag|ventilation|climatisation|heizung|sanitar|lueftung|idraulic|riscaldament|ferblant|spengler)'
    union all select 'maconnerie' from t where s ~ '(maconn|gros oeuvre|genie civil|terrassement|beton|baumeister|bauunternehm|tiefbau|hochbau|edil|murator|costruzion)'
    union all select 'carrelage' from t where s ~ '(carrel|plattenle|piastrell|parquet|revetement(s)? de sol|bodenbel)'
    union all select 'toiture' from t where s ~ '(toitur|couvreur|couverture|etancheit|dachdeck|bedachung|copertur)'
    union all select 'renovation' from t where s ~ '(renovation|transformation(s)? de batiment|second oeuvre|umbau|ristruttur)'
    union all select 'construction' from t where s ~ '(construction|entreprise generale|bauleistung|bauarbeit)'
    union all select 'nettoyage' from t where s ~ '(nettoy|conciergerie|reinigung|hauswart|pulizi)'
    union all select 'paysagisme' from t where s ~ '(paysag|jardin|garten|giardin|horticult|elagage)'
    union all select 'fiduciaire' from t where s ~ '(fiduciair|comptabilit|treuhand|buchhaltung|fiduciari|contabilit)'
    union all select 'ingenieur' from t where s ~ '(ingenieur|architect|geometre|bureau d.etudes|planungsbuero|ingegner|architett)'
  ) x
$$;

-- Queue the HR list of each canton over the last p_days days.
create or replace function public.registry_queue(p_cantons text[], p_days int default 3)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  c text;
  v_n int := 0;
  v_start date := (current_date - greatest(least(coalesce(p_days, 3), 31), 1));
  v_end date := current_date;
  v_id bigint;
begin
  foreach c in array coalesce(p_cantons, '{}') loop
    if c !~ '^[A-Z]{2}$' then continue; end if;
    v_id := net.http_get(
      url := 'https://www.shab.ch/api/v1/publications',
      params := jsonb_build_object(
        'publicationStates', 'PUBLISHED', 'rubrics', 'HR', 'subRubrics', 'HR01', 'cantons', c,
        'publicationDate.start', v_start::text, 'publicationDate.end', v_end::text,
        'pageRequest.page', '0', 'pageRequest.size', '1000'),
      headers := '{"Accept":"application/json"}'::jsonb,
      timeout_milliseconds := 60000
    );
    insert into public.registry_requests (request_id, kind, canton, page, start_date, end_date)
    values (v_id, 'list', c, 0, v_start, v_end);
    v_n := v_n + 1;
  end loop;
  return v_n;
end;
$$;
revoke all on function public.registry_queue(text[], int) from public, anon, authenticated;

-- Read the answers that arrived (called every minute).
create or replace function public.registry_process()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  item jsonb;
  v_json jsonb;
  v_xml xml;
  v_pub uuid;
  v_id bigint;
  v_done int := 0;
  v_detail_budget int := 60;  -- XML asked per run, to stay gentle with the API
  v_text text;
  v_name text;
  v_purpose text;
begin
  -- Lists.
  for r in
    select q.*, h.status_code, h.content
      from public.registry_requests q
      join net._http_response h on h.id = q.request_id
     where q.kind = 'list'
     order by q.created_at
     limit 10
  loop
    if r.status_code = 200 then
      begin
        v_json := r.content::jsonb;
      exception when others then
        v_json := null;
      end;
      if v_json is not null then
        for item in select * from jsonb_array_elements(coalesce(v_json->'content', '[]'::jsonb)) loop
          continue when item->'meta'->>'subRubric' is distinct from 'HR01';
          v_pub := (item->'meta'->>'id')::uuid;
          continue when exists (select 1 from public.registry_companies where id = v_pub)
                     or exists (select 1 from public.registry_requests where publication_id = v_pub);
          exit when v_detail_budget <= 0;
          v_id := net.http_get(url := 'https://www.shab.ch/api/v1/publications/' || v_pub || '/xml', timeout_milliseconds := 60000);
          insert into public.registry_requests (request_id, kind, canton, publication_id) values (v_id, 'detail', r.canton, v_pub);
          v_detail_budget := v_detail_budget - 1;
        end loop;
        -- Next page of a long list.
        if (v_json->>'total')::int > (r.page + 1) * 1000 then
          v_id := net.http_get(
            url := 'https://www.shab.ch/api/v1/publications',
            params := jsonb_build_object(
              'publicationStates', 'PUBLISHED', 'rubrics', 'HR', 'subRubrics', 'HR01', 'cantons', r.canton,
              'publicationDate.start', r.start_date::text, 'publicationDate.end', r.end_date::text,
              'pageRequest.page', (r.page + 1)::text, 'pageRequest.size', '1000'),
            headers := '{"Accept":"application/json"}'::jsonb,
            timeout_milliseconds := 60000
          );
          insert into public.registry_requests (request_id, kind, canton, page, start_date, end_date)
          values (v_id, 'list', r.canton, r.page + 1, r.start_date, r.end_date);
        end if;
      end if;
      -- A list cut short by the detail budget is asked again next run.
      if v_detail_budget <= 0 then
        perform public.registry_queue(array[r.canton], greatest(current_date - r.start_date, 1));
      end if;
    end if;
    delete from public.registry_requests where request_id = r.request_id;
    v_done := v_done + 1;
  end loop;

  -- Details.
  for r in
    select q.*, h.status_code, h.content
      from public.registry_requests q
      join net._http_response h on h.id = q.request_id
     where q.kind = 'detail'
     limit 200
  loop
    if r.status_code = 200 and r.content is not null then
      begin
        v_xml := xmlparse(document r.content);
        v_name := public.registry_xtext(v_xml, '/*/content/commonsNew/company/name/text()');
        v_text := public.registry_xtext(v_xml, '/*/content/publicationText/text()');
        v_purpose := public.registry_xtext(v_xml, '/*/content/commonsNew/purpose/text()');
        if v_name is not null then
          insert into public.registry_companies (id, publication_date, canton, language, name, uid, legal_form, seat, street, zip, town, purpose, persons, trades)
          values (
            r.publication_id,
            coalesce(public.registry_xtext(v_xml, '/*/meta/publicationDate/text()')::date, current_date),
            coalesce(public.registry_xtext(v_xml, '/*/meta/cantons/text()'), r.canton),
            public.registry_xtext(v_xml, '/*/meta/language/text()'),
            v_name,
            public.registry_xtext(v_xml, '/*/content/commonsNew/company/uid/text()'),
            public.registry_xtext(v_xml, '/*/content/commonsNew/company/legalForm/text()'),
            public.registry_xtext(v_xml, '/*/content/commonsNew/company/seat/text()'),
            nullif(concat_ws(' ', public.registry_xtext(v_xml, '/*/content/commonsNew/company/address/street/text()'),
                                  public.registry_xtext(v_xml, '/*/content/commonsNew/company/address/houseNumber/text()')), ''),
            public.registry_xtext(v_xml, '/*/content/commonsNew/company/address/swissZipCode/text()'),
            public.registry_xtext(v_xml, '/*/content/commonsNew/company/address/town/text()'),
            v_purpose,
            nullif(trim(trailing '.' from substring(v_text from '(?:Personne\(s\) inscrite\(s\)|Eingetragene Personen|Persone iscritte)\s*:\s*(.*)$')), ''),
            public.registry_trades(v_name || ' ' || coalesce(v_purpose, ''))
          )
          on conflict (id) do nothing;
        end if;
      exception when others then
        null;  -- an unreadable notice is skipped
      end;
    end if;
    delete from public.registry_requests where request_id = r.request_id;
    v_done := v_done + 1;
  end loop;

  -- Requests that never got an answer.
  delete from public.registry_requests q
   where q.created_at < now() - interval '1 hour'
     and not exists (select 1 from net._http_response h where h.id = q.request_id);
  return v_done;
end;
$$;
revoke all on function public.registry_process() from public, anon, authenticated;

-- Admin: look for new entries now (cantons chosen on the page).
create or replace function public.admin_registry_refresh(p_cantons text[], p_days int default 7)
returns jsonb
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
  v_n := public.registry_queue(p_cantons, p_days);
  return jsonb_build_object('queued', v_n, 'pending', (select count(*) from public.registry_requests));
end;
$$;
revoke all on function public.admin_registry_refresh(text[], int) from public, anon;
grant execute on function public.admin_registry_refresh(text[], int) to authenticated;

-- Admin: requests still waiting for an answer (the page shows « recherche en cours »).
create or replace function public.admin_registry_pending()
returns int
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;
  return (select count(*) from public.registry_requests);
end;
$$;
revoke all on function public.admin_registry_pending() from public, anon;
grant execute on function public.admin_registry_pending() to authenticated;

-- Admin: e-mail, site, phone, note and status of one company.
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

-- Every minute: read the answers. Every morning (06:12 Swiss time in
-- winter): the last 3 days of the French-speaking cantons.
select cron.unschedule(jobid) from cron.job where jobname in ('registry-process', 'registry-daily');
select cron.schedule('registry-process', '* * * * *', $$select public.registry_process()$$);
select cron.schedule('registry-daily', '12 5 * * *', $$select public.registry_queue(array['VS','VD','FR','GE','NE','JU'], 3)$$);

notify pgrst, 'reload schema';
