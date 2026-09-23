-- The AI polish pass (polish-report-notes) used to return one flowing
-- paragraph, stored straight into reports.notes — the PDF then had nothing
-- to lay out but that single block plus a detached photo grid at the end.
-- structured_content carries the same content broken into what a report
-- actually is: a one-line summary, a set of labelled steps (each optionally
-- pointing at photos by their position in report_photos ordered by
-- sort_order), a set of flagged anomalies/points d'attention, and a next
-- step. Nullable and additive — reports.notes stays the flat fallback text
-- (used verbatim for older reports, manually-edited reports, and anywhere
-- that only ever wanted plain text), so generate-report-pdf can render the
-- richer layout when this is present and the exact same layout as before
-- when it isn't.
alter table public.reports add column structured_content jsonb;

comment on column public.reports.structured_content is
  'AI-structured report body: { summary, sections: [{label, text, photo_indexes}], attention: [{text, photo_indexes}], next_steps }. photo_indexes are positions into report_photos ordered by sort_order. Null falls back to the flat notes text.';
