-- Real voice messages in the project feed: a playable audio bubble (like
-- WhatsApp), with a live-transcribed text captured alongside so report
-- generation can read it without needing a separate cloud transcription
-- call (the on-device speech recognizer already produced the text at
-- record time).

alter table public.feed_entries
  add column transcript text,
  add column duration_seconds integer;

alter table public.feed_entries drop constraint feed_entries_type_check;
alter table public.feed_entries add constraint feed_entries_type_check
  check (type in ('note', 'photo', 'voice'));

alter table public.feed_entries drop constraint feed_entries_content_check;
alter table public.feed_entries add constraint feed_entries_content_check check (
  (type = 'note' and body is not null) or
  (type = 'photo' and storage_path is not null) or
  (type = 'voice' and storage_path is not null)
);
