\set ON_ERROR_STOP 0
reset role;
insert into public.files (id, organization_id) values
 ('00000000-0000-0000-0000-0000000000c1','00000000-0000-0000-0000-00000000000a'),
 ('00000000-0000-0000-0000-0000000000c2','00000000-0000-0000-0000-00000000000b');
grant all on all tables in schema public to authenticated;
set role authenticated;
set test.uid = '00000000-0000-0000-0000-0000000000f1';
\echo '--- P1. plan + revision + page, org derived from the chantier'
insert into site_plans (id, project_id, organization_id, name, number) values ('00000000-0000-0000-0000-0000000000d1','00000000-0000-0000-0000-0000000000a1','00000000-0000-0000-0000-00000000000b','Rez-de-chaussée','A-102') returning organization_id;
insert into site_plan_revisions (id, plan_id, label, file_id, page_count) values ('00000000-0000-0000-0000-0000000000d2','00000000-0000-0000-0000-0000000000d1','Rev C','00000000-0000-0000-0000-0000000000c1',1);
update site_plans set active_revision_id = '00000000-0000-0000-0000-0000000000d2' where id = '00000000-0000-0000-0000-0000000000d1';
insert into site_plan_pages (id, revision_id, page_index, width_pt, height_pt) values ('00000000-0000-0000-0000-0000000000d3','00000000-0000-0000-0000-0000000000d2',1,1000,500);
\echo '--- P2. file of another org is refused'
insert into site_plan_revisions (plan_id, file_id) values ('00000000-0000-0000-0000-0000000000d1','00000000-0000-0000-0000-0000000000c2');
\echo '--- P3. not calibrated: distance stored without length, count works'
insert into measured_objects (plan_page_id, kind, geometry) values ('00000000-0000-0000-0000-0000000000d3','distance','[[0,0],[0.5,0]]') returning name, length_m;
insert into measured_objects (plan_page_id, kind, geometry) values ('00000000-0000-0000-0000-0000000000d3','count','[[0.1,0.1],[0.2,0.2],[0.3,0.3]]') returning name, count;
\echo '--- P4. scale 1:100 -> 500 pt = 17.6389 m, recomputed on the existing distance'
update site_plan_pages set calibration = '{"method":"scale","scale":100}' where id = '00000000-0000-0000-0000-0000000000d3';
select name, length_m from measured_objects where kind = 'distance';
\echo '--- P5. two-point calibration 500 pt = 10 m; 200x200 pt square = 16 m2, perimeter 16 m'
update site_plan_pages set calibration = '{"method":"two_points","a":[0.1,0.1],"b":[0.6,0.1],"real_m":10}' where id = '00000000-0000-0000-0000-0000000000d3';
select meters_per_pt from site_plan_pages;
insert into measured_objects (plan_page_id, kind, geometry, length_m, area_m2) values ('00000000-0000-0000-0000-0000000000d3','polygon','[[0.1,0.2],[0.3,0.2],[0.3,0.6],[0.1,0.6]]', 999, 999) returning name, area_m2, perimeter_m;
select name, length_m from measured_objects where kind = 'distance';
\echo '--- P6. forged length is recomputed on update'
update measured_objects set length_m = 1, geometry = '[[0,0],[0.25,0]]' where kind = 'distance' returning length_m;
\echo '--- P7. bad geometry refused'
insert into measured_objects (plan_page_id, kind, geometry) values ('00000000-0000-0000-0000-0000000000d3','polygon','[[0,0],[1,1]]');
insert into measured_objects (plan_page_id, kind, geometry) values ('00000000-0000-0000-0000-0000000000d3','distance','[[0,0],[3,0]]');
\echo '--- P8. org B owner sees nothing and cannot write'
set test.uid = '00000000-0000-0000-0000-0000000000f3';
select (select count(*) from site_plans) plans, (select count(*) from measured_objects) objects;
update measured_objects set geometry = '[[0,0],[0.9,0]]' where kind = 'distance';
reset role;
select length_m from measured_objects where kind = 'distance';
set role authenticated;
\echo '--- P9. org B (Essentiel) cannot create a plan on its own chantier'
insert into site_plans (project_id, name) values ('00000000-0000-0000-0000-0000000000b1','X');
\echo '--- P10. revisions cannot be deleted'
set test.uid = '00000000-0000-0000-0000-0000000000f1';
delete from site_plan_revisions returning id;
select count(*) as revisions from site_plan_revisions;
reset role;
