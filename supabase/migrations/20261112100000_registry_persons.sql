-- The people registered are written differently from one cantonal
-- register to another: « Personne(s) inscrite(s): Lugon, Nils, … » in
-- Valais, « Titulaire: Houenou Isabelle, … », « Gérants: … »,
-- « Administrateur: … » elsewhere (and in German and Italian). One function
-- reads them all; notices already stored without people are read again.

create or replace function public.registry_persons(p_text text)
returns text
language sql
immutable
as $$
  select nullif(trim(trailing '.' from trim(coalesce(
    substring(p_text from '(?:Personne\(s\) inscrite\(s\)|Eingetragene Personen|Persone iscritte)\s*:\s*(.*)$'),
    substring(p_text from '(?:Titulaire|Gérante?s?|Administrat(?:eur|rice)s?|Associée?s? gérante?s?|Inhaber(?:in)?|Geschäftsführer(?:in)?|Gesellschafter(?:in)?|Mitglied(?:er)? des Verwaltungsrates|Titolare|Gerente|Amministrator[ei])\s*:\s*([^.]+)')
  ))), '')
$$;

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
            public.registry_persons(v_text),
            public.registry_trades(v_name || ' ' || coalesce(v_purpose, ''))
          )
          on conflict (id) do update set persons = coalesce(public.registry_companies.persons, excluded.persons);
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

-- Read again the notices stored without people.
do $$
declare
  r record;
  v_id bigint;
begin
  for r in select id, canton from public.registry_companies where persons is null loop
    v_id := net.http_get(url := 'https://www.shab.ch/api/v1/publications/' || r.id || '/xml', timeout_milliseconds := 60000);
    insert into public.registry_requests (request_id, kind, canton, publication_id) values (v_id, 'detail', r.canton, r.id);
  end loop;
end $$;
