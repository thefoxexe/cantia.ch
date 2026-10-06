\set ON_ERROR_STOP 0
reset role;
grant all on all tables in schema public to authenticated;
grant execute on all functions in schema public to authenticated;
revoke insert, update, delete on public.schedule_audit from authenticated;
update organizations set trade = 'Construction & bâtiment' where id = '00000000-0000-0000-0000-00000000000a';
set role authenticated;
set test.uid = '00000000-0000-0000-0000-0000000000f1';
\echo '--- S1. owner creates the schedule, a phase, a task in it, a milestone; a line under a task is refused'
insert into site_schedules (id, organization_id, project_id) values ('00000000-0000-0000-0000-00000000d001', '00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-0000000000a1');
insert into schedule_items (id, schedule_id, organization_id, kind, name, sort_order) values ('00000000-0000-0000-0000-00000000d101', '00000000-0000-0000-0000-00000000d001', '00000000-0000-0000-0000-00000000000a', 'phase', 'Gros œuvre', 1);
insert into schedule_items (id, schedule_id, organization_id, parent_id, kind, name, start_date, end_date, duration, sort_order) values ('00000000-0000-0000-0000-00000000d102', '00000000-0000-0000-0000-00000000d001', '00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000d101', 'task', 'Fondations', '2026-10-12', '2026-10-16', 5, 2);
insert into schedule_items (id, schedule_id, organization_id, parent_id, kind, name, start_date, sort_order) values ('00000000-0000-0000-0000-00000000d103', '00000000-0000-0000-0000-00000000d001', '00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000d101', 'milestone', 'Hors d''eau', '2026-10-19', 3);
insert into schedule_items (schedule_id, organization_id, parent_id, kind, name) values ('00000000-0000-0000-0000-00000000d001', '00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000d102', 'task', 'Sous une tâche');
select name, kind, duration, start_date, end_date from schedule_items order by sort_order;
\echo '--- S2. link Fondations -> Hors d eau, the reverse is circular'
insert into schedule_links (schedule_id, from_item, to_item) values ('00000000-0000-0000-0000-00000000d001', '00000000-0000-0000-0000-00000000d102', '00000000-0000-0000-0000-00000000d103');
insert into schedule_links (schedule_id, from_item, to_item) values ('00000000-0000-0000-0000-00000000d001', '00000000-0000-0000-0000-00000000d103', '00000000-0000-0000-0000-00000000d102');
\echo '--- S3. started then done: real dates, plan kept, 100 %'
update schedule_items set status = 'in_progress' where id = '00000000-0000-0000-0000-00000000d102';
update schedule_items set start_date = '2026-10-13', end_date = '2026-10-19', status = 'done' where id = '00000000-0000-0000-0000-00000000d102';
select status, progress, baseline_start, baseline_end, actual_start is not null as started, actual_end is not null as ended, start_date from schedule_items where id = '00000000-0000-0000-0000-00000000d102';
select field, old_value, new_value from schedule_audit where field in ('status', 'start_date', 'dependency') order by id;
\echo '--- S4. another company sees nothing and cannot write'
set test.uid = '00000000-0000-0000-0000-0000000000f3';
select count(*) as other_company_sees from schedule_items;
update schedule_items set name = 'x';
select count(*) as renamed from schedule_items where name = 'x';
\echo '--- S5. not a building company any more: read yes, write no'
reset role;
update organizations set trade = 'Finance, comptabilité & assurances' where id = '00000000-0000-0000-0000-00000000000a';
set role authenticated;
set test.uid = '00000000-0000-0000-0000-0000000000f1';
select count(*) as still_reads from schedule_items;
insert into schedule_items (schedule_id, organization_id, kind, name) values ('00000000-0000-0000-0000-00000000d001', '00000000-0000-0000-0000-00000000000a', 'task', 'Refusée');
\echo '--- S6. the admin deletes the whole schedule'
delete from site_schedules where id = '00000000-0000-0000-0000-00000000d001';
reset role;
select (select count(*) from schedule_items) items, (select count(*) from schedule_audit) audit;
