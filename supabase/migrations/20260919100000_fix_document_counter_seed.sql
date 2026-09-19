-- Fixes a real bug in 20260919090000's seed: it set each org's starting
-- counter to their DOCUMENT COUNT this year + 1, assuming their own
-- historical numbers were roughly 1..count. That's false — under the old
-- platform-wide shared sequence, an org's own numbers were scattered
-- across the whole range (e.g. an org with 18 factures this year could
-- already hold "...0230", because 200+ other organizations' factures
-- consumed sequence values in between). Seeding from count+1 collided
-- head-on with the same org's own pre-existing higher numbers the moment
-- they created a new devis or facture — confirmed happening in production
-- (unique constraint violation converting a devis to a facture).
--
-- The correct seed is the actual MAX numeric suffix each org has already
-- used this year, not how many documents they have. GREATEST(...) never
-- lowers a counter that may have already advanced correctly since
-- yesterday's migration.

update public.document_number_counters c
set next_number = greatest(c.next_number, m.max_number + 1)
from (
  select organization_id, extract(year from created_at)::integer as year,
         max((regexp_match(number, '-(\d+)$'))[1]::integer) as max_number
  from public.devis
  where number ~ '^DEV-\d{4}-\d+$'
  group by organization_id, extract(year from created_at)::integer
) m
where c.organization_id = m.organization_id
  and c.doc_type = 'devis'
  and c.year = m.year;

update public.document_number_counters c
set next_number = greatest(c.next_number, m.max_number + 1)
from (
  select organization_id, extract(year from created_at)::integer as year,
         max((regexp_match(number, '-(\d+)$'))[1]::integer) as max_number
  from public.factures
  where number ~ '^FAC-\d{4}-\d+$'
  group by organization_id, extract(year from created_at)::integer
) m
where c.organization_id = m.organization_id
  and c.doc_type = 'facture'
  and c.year = m.year;

-- Orgs that had zero documents at yesterday's seed time (no counter row
-- exists yet) but do have real historical numbers this year for some
-- other reason (e.g. a document created between the two migrations) —
-- insert their row now from the same max-based logic instead of letting
-- them fall back to the unsafe default of starting at 0001.
insert into public.document_number_counters (organization_id, doc_type, year, next_number)
select organization_id, 'devis', extract(year from created_at)::integer, max((regexp_match(number, '-(\d+)$'))[1]::integer) + 1
from public.devis
where number ~ '^DEV-\d{4}-\d+$'
group by organization_id, extract(year from created_at)::integer
on conflict (organization_id, doc_type, year)
do update set next_number = greatest(document_number_counters.next_number, excluded.next_number);

insert into public.document_number_counters (organization_id, doc_type, year, next_number)
select organization_id, 'facture', extract(year from created_at)::integer, max((regexp_match(number, '-(\d+)$'))[1]::integer) + 1
from public.factures
where number ~ '^FAC-\d{4}-\d+$'
group by organization_id, extract(year from created_at)::integer
on conflict (organization_id, doc_type, year)
do update set next_number = greatest(document_number_counters.next_number, excluded.next_number);
