\set ON_ERROR_STOP 0
reset role;
grant all on all tables in schema public to authenticated;
set role authenticated;
set test.uid = '00000000-0000-0000-0000-0000000000f1';
\echo '--- F1. folders 2026 › Villas, a chantier filed with a number; a folder cannot go inside itself'
insert into project_folders (id, organization_id, name) values ('00000000-0000-0000-0000-00000000f001', '00000000-0000-0000-0000-00000000000a', '2026');
insert into project_folders (id, organization_id, parent_id, name) values ('00000000-0000-0000-0000-00000000f002', '00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000f001', 'Villas');
update projects set folder_id = '00000000-0000-0000-0000-00000000f002', reference = '2026-014' where id = '00000000-0000-0000-0000-0000000000a1';
select reference, (select name from project_folders where id = folder_id) as folder from projects where id = '00000000-0000-0000-0000-0000000000a1';
update project_folders set parent_id = '00000000-0000-0000-0000-00000000f002' where id = '00000000-0000-0000-0000-00000000f001';
\echo '--- F2. favourite: own only; org B cannot see A folders nor file into them'
insert into project_favorites (project_id) values ('00000000-0000-0000-0000-0000000000a1');
select count(*) as my_favs from project_favorites;
set test.uid = '00000000-0000-0000-0000-0000000000f3';
select count(*) as b_sees_folders from project_folders;
select count(*) as b_sees_favs from project_favorites;
reset role;
update projects set folder_id = '00000000-0000-0000-0000-00000000f001' where id = '00000000-0000-0000-0000-0000000000b1';
\echo '--- F3. deleting 2026 moves Villas to the top, the chantier stays in Villas'
delete from project_folders where id = '00000000-0000-0000-0000-00000000f001';
select name, parent_id from project_folders;
select (select name from project_folders where id = folder_id) as folder from projects where id = '00000000-0000-0000-0000-0000000000a1';
