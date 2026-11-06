-- Devis et factures :
-- 1. adresse du client à gauche (comme avant) ou à droite, à la place de la
--    fenêtre d'une enveloppe suisse (fenêtre à droite), avec un réglage fin
--    en millimètres pour l'imprimante et l'enveloppe de chacun ;
-- 2. numérotation libre par entreprise (format et prochain numéro) ;
-- 3. référence du client (son n° de chantier, de commande…) imprimée sur
--    le document.

-- 1. Adresse
alter table public.organizations
  add column if not exists client_address_position text not null default 'left',
  add column if not exists client_address_offset_x_mm numeric not null default 0,
  add column if not exists client_address_offset_y_mm numeric not null default 0;
alter table public.organizations drop constraint if exists organizations_client_address_position_check;
alter table public.organizations add constraint organizations_client_address_position_check check (client_address_position in ('left', 'right'));
alter table public.organizations drop constraint if exists organizations_client_address_offset_check;
alter table public.organizations add constraint organizations_client_address_offset_check
  check (client_address_offset_x_mm between -30 and 30 and client_address_offset_y_mm between -30 and 30);

-- 3. Référence client
alter table public.devis add column if not exists client_reference text;
alter table public.factures add column if not exists client_reference text;
alter table public.devis drop constraint if exists devis_client_reference_length;
alter table public.devis add constraint devis_client_reference_length check (client_reference is null or char_length(client_reference) <= 120);
alter table public.factures drop constraint if exists factures_client_reference_length;
alter table public.factures add constraint factures_client_reference_length check (client_reference is null or char_length(client_reference) <= 120);

-- A facture made from a devis (conversion, acompte, situation) keeps the
-- client's reference of that devis unless one was given.
create or replace function public.copy_devis_client_reference()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.client_reference is null and new.devis_id is not null then
    select d.client_reference into new.client_reference from public.devis d where d.id = new.devis_id;
  end if;
  return new;
end;
$$;
drop trigger if exists factures_copy_devis_client_reference on public.factures;
create trigger factures_copy_devis_client_reference before insert on public.factures
for each row execute function public.copy_devis_client_reference();

-- 2. Numérotation
-- Format: free text with tokens {AAAA} (year), {AA} (2-digit year), {MM}
-- (month) and exactly one {N…} (the counter, as many digits as N's).
-- With a year token the counter restarts every year; without, it runs on.
create table if not exists public.document_number_formats (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  doc_type text not null check (doc_type in ('devis', 'facture')),
  format text not null,
  updated_at timestamptz not null default now(),
  primary key (organization_id, doc_type)
);
alter table public.document_number_formats enable row level security;
-- Read and written through the functions below only.
revoke all on public.document_number_formats from anon, authenticated;

create or replace function public.document_number_default_format(p_doc_type text)
returns text language sql immutable as $$
  select case p_doc_type when 'devis' then 'DEV-{AAAA}-{NNNN}' else 'FAC-{AAAA}-{NNNN}' end;
$$;

create or replace function public.document_number_format_valid(p_format text)
returns boolean language sql immutable as $$
  select p_format is not null
    and char_length(p_format) between 1 and 40
    and (select count(*) from regexp_matches(p_format, '\{N{1,8}\}', 'g')) = 1
    and regexp_replace(p_format, '\{(AAAA|AA|MM|N{1,8})\}', '', 'g') ~ '^[A-Za-z0-9 ._/#-]*$';
$$;

-- Dates in Swiss time: the year turns at midnight in Switzerland.
create or replace function public.format_document_number(p_format text, p_number integer, p_at timestamptz)
returns text language plpgsql stable as $$
declare
  v text := p_format;
  v_digits integer;
  v_local timestamp := p_at at time zone 'Europe/Zurich';
begin
  v := replace(v, '{AAAA}', to_char(v_local, 'YYYY'));
  v := replace(v, '{AA}', to_char(v_local, 'YY'));
  v := replace(v, '{MM}', to_char(v_local, 'MM'));
  v_digits := char_length(substring(v from '\{(N+)\}'));
  return regexp_replace(v, '\{N+\}', lpad(p_number::text, greatest(v_digits, char_length(p_number::text)), '0'));
end;
$$;

-- Counter key: the year when the format has one, 0 when it runs on.
create or replace function public.document_number_counter_year(p_format text, p_at timestamptz)
returns integer language sql stable as $$
  select case when p_format ~ '\{AA(AA)?\}' then extract(year from p_at at time zone 'Europe/Zurich')::integer else 0 end;
$$;

create or replace function public.next_document_number(p_organization_id uuid, p_doc_type text, p_prefix text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_format text;
  v_key integer;
  v_number integer;
  v_text text;
  v_taken boolean;
  v_guard integer := 0;
begin
  select f.format into v_format from public.document_number_formats f
  where f.organization_id = p_organization_id and f.doc_type = p_doc_type;
  v_format := coalesce(v_format, p_prefix || '-{AAAA}-{NNNN}');
  v_key := public.document_number_counter_year(v_format, now());
  loop
    insert into public.document_number_counters (organization_id, doc_type, year, next_number)
    values (p_organization_id, p_doc_type, v_key, 2)
    on conflict (organization_id, doc_type, year)
    do update set next_number = document_number_counters.next_number + 1
    returning next_number - 1 into v_number;
    v_text := public.format_document_number(v_format, v_number, now());
    -- A number already used (set back by hand, or an old format) is skipped.
    if p_doc_type = 'devis' then
      select exists (select 1 from public.devis where organization_id = p_organization_id and number = v_text) into v_taken;
    else
      select exists (select 1 from public.factures where organization_id = p_organization_id and number = v_text) into v_taken;
    end if;
    exit when not v_taken;
    v_guard := v_guard + 1;
    if v_guard > 10000 then
      raise exception 'Numérotation : aucun numéro libre trouvé';
    end if;
  end loop;
  return v_text;
end;
$$;
revoke all on function public.next_document_number(uuid, text, text) from public, anon, authenticated;

-- Current settings and the next number, for the settings screen.
create or replace function public.get_document_numbering(p_organization_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_out jsonb := '{}'::jsonb;
  v_type text;
  v_format text;
  v_next integer;
begin
  if not public.can_manage_org_devis(p_organization_id) then
    raise exception 'Accès refusé';
  end if;
  foreach v_type in array array['devis', 'facture'] loop
    select f.format into v_format from public.document_number_formats f where f.organization_id = p_organization_id and f.doc_type = v_type;
    v_format := coalesce(v_format, public.document_number_default_format(v_type));
    select c.next_number into v_next from public.document_number_counters c
    where c.organization_id = p_organization_id and c.doc_type = v_type and c.year = public.document_number_counter_year(v_format, now());
    v_next := coalesce(v_next, 1);
    v_out := v_out || jsonb_build_object(v_type, jsonb_build_object(
      'format', v_format,
      'next_number', v_next,
      'preview', public.format_document_number(v_format, v_next, now())
    ));
    v_format := null;
    v_next := null;
  end loop;
  return v_out;
end;
$$;
revoke all on function public.get_document_numbering(uuid) from public, anon;
grant execute on function public.get_document_numbering(uuid) to authenticated;

create or replace function public.set_document_numbering(p_organization_id uuid, p_doc_type text, p_format text, p_next_number integer)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_format text := btrim(p_format);
begin
  -- Changing the numbering is an administrator's decision.
  if not public.is_org_admin(p_organization_id) then
    raise exception 'Accès refusé';
  end if;
  if p_doc_type not in ('devis', 'facture') then
    raise exception 'Type de document inconnu';
  end if;
  if not public.document_number_format_valid(v_format) then
    raise exception 'Format invalide : il faut exactement un {N…} (par exemple {NNNN}), 40 caractères au plus, lettres, chiffres et - _ / . # seulement';
  end if;
  if p_next_number is null or p_next_number < 1 or p_next_number > 99999999 then
    raise exception 'Le prochain numéro doit être compris entre 1 et 99 999 999';
  end if;
  insert into public.document_number_formats (organization_id, doc_type, format, updated_at)
  values (p_organization_id, p_doc_type, v_format, now())
  on conflict (organization_id, doc_type) do update set format = excluded.format, updated_at = now();
  insert into public.document_number_counters (organization_id, doc_type, year, next_number)
  values (p_organization_id, p_doc_type, public.document_number_counter_year(v_format, now()), p_next_number)
  on conflict (organization_id, doc_type, year) do update set next_number = excluded.next_number;
  return public.format_document_number(v_format, p_next_number, now());
end;
$$;
revoke all on function public.set_document_numbering(uuid, text, text, integer) from public, anon;
grant execute on function public.set_document_numbering(uuid, text, text, integer) to authenticated;
