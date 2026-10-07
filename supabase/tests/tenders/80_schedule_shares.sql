\set ON_ERROR_STOP 0
reset role;
grant all on all tables in schema public to authenticated;
update organizations set trade = 'Construction & bâtiment', logo_url = 'org-a/logo.png' where id = '00000000-0000-0000-0000-00000000000a';
-- as in prod: Supabase's default grant is revoked by the migration
revoke execute on function get_shared_schedule(uuid) from authenticated;
insert into site_schedules (id, organization_id, project_id) values ('00000000-0000-0000-0000-00000000d801', '00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-0000000000a1');
insert into schedule_items (id, schedule_id, organization_id, kind, name, start_date, end_date, duration, notes, responsible_user_id) values
 ('00000000-0000-0000-0000-00000000d811', '00000000-0000-0000-0000-00000000d801', '00000000-0000-0000-0000-00000000000a', 'task', 'Fouilles', '2026-10-12', '2026-10-16', 5, 'Note interne', null),
 ('00000000-0000-0000-0000-00000000d812', '00000000-0000-0000-0000-00000000d801', '00000000-0000-0000-0000-00000000000a', 'milestone', 'Hors d''eau', '2026-10-19', '2026-10-19', 0, null, null);
insert into schedule_links (schedule_id, from_item, to_item) values ('00000000-0000-0000-0000-00000000d801', '00000000-0000-0000-0000-00000000d811', '00000000-0000-0000-0000-00000000d812');
set role authenticated;
set test.uid = '00000000-0000-0000-0000-0000000000f1';
\echo '--- H1. a member creates a link (notes hidden by default); another company sees nothing and cannot create one on A'
insert into schedule_shares (id, schedule_id, organization_id, token) values ('00000000-0000-0000-0000-00000000e001', '00000000-0000-0000-0000-00000000d801', '00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-0000000000aa');
select count(*) as a_sees from schedule_shares;
set test.uid = '00000000-0000-0000-0000-0000000000f3';
select count(*) as b_sees from schedule_shares;
insert into schedule_shares (schedule_id, organization_id) values ('00000000-0000-0000-0000-00000000d801', '00000000-0000-0000-0000-00000000000b');
insert into schedule_shares (schedule_id, organization_id) values ('00000000-0000-0000-0000-00000000d801', '00000000-0000-0000-0000-00000000000a');
\echo '--- H2. anon and members cannot call the RPC directly'
set role anon;
select get_shared_schedule('00000000-0000-0000-0000-0000000000aa');
reset role;
set role authenticated;
select get_shared_schedule('00000000-0000-0000-0000-0000000000aa');
reset role;
\echo '--- H3. the service role reads it: items, no notes, logo path, view counted'
set role service_role;
select (r->'project'->>'name') as project, jsonb_array_length(r->'items') as items, jsonb_array_length(r->'links') as links,
  (select count(*) from jsonb_array_elements(r->'items') e where e->>'notes' is not null) as with_notes,
  (select count(*) from jsonb_array_elements(r->'items') e where e ? 'responsible_user_id') as with_responsible,
  r->'organization'->>'logo_path' as logo
from (select get_shared_schedule('00000000-0000-0000-0000-0000000000aa') r) x;
reset role;
select view_count from schedule_shares where id = '00000000-0000-0000-0000-00000000e001';
\echo '--- H4. without brand: no name / logo; with notes: notes'
update schedule_shares set with_brand = false, show_notes = true where id = '00000000-0000-0000-0000-00000000e001';
set role service_role;
select r->'organization' as org, (select count(*) from jsonb_array_elements(r->'items') e where e->>'notes' is not null) as with_notes from (select get_shared_schedule('00000000-0000-0000-0000-0000000000aa') r) x;
reset role;
\echo '--- H5. expired, revoked, unknown -> null'
update schedule_shares set expires_at = now() - interval '1 day' where id = '00000000-0000-0000-0000-00000000e001';
set role service_role;
select get_shared_schedule('00000000-0000-0000-0000-0000000000aa') is null as expired_null;
reset role;
update schedule_shares set expires_at = now() + interval '30 days', revoked_at = now() where id = '00000000-0000-0000-0000-00000000e001';
set role service_role;
select get_shared_schedule('00000000-0000-0000-0000-0000000000aa') is null as revoked_null, get_shared_schedule(gen_random_uuid()) is null as unknown_null;
reset role;
