-- Security audit fix: feed_entries' only RLS restriction on UPDATE was org
-- membership — any teammate (not just the author) could rewrite a photo's
-- latitude/longitude/taken_at/storage_path/body after publication, with no
-- history kept anywhere. These fields are the exact data the app relies on
-- as legal proof of chantier progress in a dispute, so silently editable
-- metadata defeats that purpose entirely.
--
-- The only legitimate client-side UPDATE on this table (confirmed against
-- every `.from('feed_entries').update(...)` call in the app) is attaching a
-- set of entries to a generated report via `report_id` — captions/body are
-- set once at creation and never edited afterward in the UI. So instead of
-- a blanket lock that would need a new "edit" feature to work around later,
-- this restricts the column, not the row: any org member can still update
-- report_id, nobody can touch the content/metadata columns after the fact.
revoke update on public.feed_entries from authenticated;
grant update (report_id) on public.feed_entries to authenticated;

notify pgrst, 'reload schema';
