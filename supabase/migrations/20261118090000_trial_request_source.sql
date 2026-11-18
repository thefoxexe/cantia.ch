-- Where a request for the 3 months came from: the placement of the offer
-- (components/site/StarterOffer.tsx) that brought the visitor to the page,
-- as « ref / cta » (e.g. « home / box »). Null when the page was opened
-- directly.
alter table public.trial_requests add column if not exists source text;
