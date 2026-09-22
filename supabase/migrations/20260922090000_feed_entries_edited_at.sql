-- Marks a note/voice entry as edited without touching the report-linking
-- update in generateReportFromFeed (that call only ever sets report_id, so
-- it never sets this column). Nullable: absent means never edited.
alter table public.feed_entries add column if not exists edited_at timestamptz;
