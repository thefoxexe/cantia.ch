-- Devis and facture numbers were drawn from ONE shared sequence across the
-- entire platform (devis_number_seq / facture_number_seq) — every
-- organization's documents were interleaved in the same DEV-2026-00NN /
-- FAC-2026-00NN counter, so an organization's own numbering looked
-- arbitrary (a "02" next to someone else's "07"). Numbering is now scoped
-- per organization, per document type, per year: each org's own devis and
-- factures count 0001, 0002, 0003... independently.
--
-- Historical documents keep the numbers they were already issued with —
-- renumbering an already-sent devis or a legally-tracked facture would be
-- wrong, not just cosmetic. Only documents created from now on use the new
-- per-org counter, seeded below to continue right after each org's own
-- count for the current year (so nobody's next document collides with one
-- they already have).

create table public.document_number_counters (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  doc_type text not null check (doc_type in ('devis', 'facture')),
  year integer not null,
  next_number integer not null default 1,
  primary key (organization_id, doc_type, year)
);

alter table public.document_number_counters enable row level security;
-- No self-service policy — only ever touched internally by
-- next_document_number() below, itself only called from the devis/facture
-- BEFORE INSERT triggers, never directly by client code.

create or replace function public.next_document_number(p_organization_id uuid, p_doc_type text, p_prefix text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_year integer := extract(year from now())::integer;
  v_number integer;
begin
  insert into public.document_number_counters (organization_id, doc_type, year, next_number)
  values (p_organization_id, p_doc_type, v_year, 2)
  on conflict (organization_id, doc_type, year)
  do update set next_number = document_number_counters.next_number + 1
  returning next_number - 1 into v_number;

  return p_prefix || '-' || v_year || '-' || lpad(v_number::text, 4, '0');
end;
$$;

revoke all on function public.next_document_number(uuid, text, text) from public;

create or replace function public.set_devis_number()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.number is null then
    new.number := public.next_document_number(new.organization_id, 'devis', 'DEV');
  end if;
  return new;
end;
$$;

create or replace function public.set_facture_number()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.number is null then
    new.number := public.next_document_number(new.organization_id, 'facture', 'FAC');
  end if;
  return new;
end;
$$;

-- Uniqueness moves from "unique across the whole platform" to "unique
-- within this organization" — every org's numbering legitimately restarts
-- at 0001 now, so two different orgs sharing a number string is expected.
alter table public.devis drop constraint devis_number_key;
alter table public.devis add constraint devis_number_org_unique unique (organization_id, number);

alter table public.factures drop constraint factures_number_key;
alter table public.factures add constraint factures_number_org_unique unique (organization_id, number);

drop sequence if exists public.devis_number_seq;
drop sequence if exists public.facture_number_seq;

-- Seed this year's counter per organization from what they've already
-- issued in the current year under the old shared numbering, so their
-- next devis/facture continues cleanly (e.g. their 3rd this year becomes
-- "0003") instead of colliding with one of their own existing numbers by
-- resetting to 0001.
insert into public.document_number_counters (organization_id, doc_type, year, next_number)
select organization_id, 'devis', extract(year from now())::integer, count(*) + 1
from public.devis
where extract(year from created_at) = extract(year from now())
group by organization_id;

insert into public.document_number_counters (organization_id, doc_type, year, next_number)
select organization_id, 'facture', extract(year from now())::integer, count(*) + 1
from public.factures
where extract(year from created_at) = extract(year from now())
group by organization_id;
