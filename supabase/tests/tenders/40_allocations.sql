\set ON_ERROR_STOP 0
reset role;
grant all on all tables in schema public to authenticated;
set role authenticated;
set test.uid = '00000000-0000-0000-0000-0000000000f1';
\echo '--- A1. a 10 m wall (scale page 0.02 m/pt) → formwork 2 faces h 2.60 = 52 m2'
insert into measured_objects (id, plan_page_id, kind, geometry) values ('00000000-0000-0000-0000-0000000000a9','00000000-0000-0000-0000-0000000000d3','polyline','[[0.1,0.9],[0.6,0.9]]') returning length_m;
insert into quantity_allocations (position_id, measured_object_id, formula, params) select id, '00000000-0000-0000-0000-0000000000a9', 'wall_formwork', '{"height":2.6}' from tender_positions where quantity_original = 820 returning calculated_quantity, final_quantity, tender_id is not null as tender_set;
\echo '--- A2. second link with a deduction → measured = 52 + (5.2 - 2) ; selected follows when source = measured'
insert into quantity_allocations (position_id, measured_object_id, formula, params, manual_adjustment) select id, '00000000-0000-0000-0000-0000000000a9', 'wall_area', '{"height":2.6,"factor":0.2}', -2 from tender_positions where quantity_original = 820 returning final_quantity;
select quantity_original, quantity_measured, quantity_selected_source, quantity_selected from tender_positions where quantity_original = 820;
\echo '--- A3. redraw the wall (5 m) → links and position recomputed'
update measured_objects set geometry = '[[0.1,0.9],[0.35,0.9]]' where id = '00000000-0000-0000-0000-0000000000a9';
select quantity_measured, quantity_selected from tender_positions where quantity_original = 820;
\echo '--- A4. forged quantity ignored; missing parameter → no quantity'
insert into quantity_allocations (position_id, measured_object_id, formula, params, final_quantity) select id, '00000000-0000-0000-0000-0000000000a9', 'wall_volume', '{"height":2.6}', 999 from tender_positions where quantity_original = 820 returning calculated_quantity, final_quantity;
\echo '--- A5. delete the measure → its links drop out of the sum'
update measured_objects set deleted_at = now() where id = '00000000-0000-0000-0000-0000000000a9';
select quantity_measured from tender_positions where quantity_original = 820;
\echo '--- A6. org B cannot read or write allocations'
set test.uid = '00000000-0000-0000-0000-0000000000f3';
select count(*) as b_allocs from quantity_allocations;
insert into quantity_allocations (position_id, formula, manual_adjustment) select id, 'manual', 1 from tender_positions limit 1;
\echo '--- A7. same formulas as allocation.ts'
select tender_alloc_quantity('wall_rebar','polyline',13.15,null,null,null,'{"height":2.6,"thickness":0.2,"rate":85}') r, tender_alloc_quantity('slab_volume','polygon',null,75.6,35.6,null,'{"thickness":0.25}') s, tender_alloc_quantity('edge_formwork','polygon',null,75.6,35.6,null,'{"height":0.25}') e, tender_alloc_quantity('area','polygon',null,75.6,35.6,null,'{"factor":7}') f;
reset role;
