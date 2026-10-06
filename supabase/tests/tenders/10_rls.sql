\set ON_ERROR_STOP 0
grant usage on schema public, auth to authenticated;
grant all on all tables in schema public to authenticated;
grant execute on all functions in schema public, auth to authenticated;
insert into auth.users values ('00000000-0000-0000-0000-0000000000f1'),('00000000-0000-0000-0000-0000000000f2'),('00000000-0000-0000-0000-0000000000f3');
insert into public.organization_roles (id, organization_id, can_view_finances) values ('00000000-0000-0000-0000-0000000000e1','00000000-0000-0000-0000-00000000000a', false);
insert into public.organization_members values
 ('00000000-0000-0000-0000-00000000000a','00000000-0000-0000-0000-0000000000f1','owner',null),
 ('00000000-0000-0000-0000-00000000000a','00000000-0000-0000-0000-0000000000f2','member','00000000-0000-0000-0000-0000000000e1'),
 ('00000000-0000-0000-0000-00000000000b','00000000-0000-0000-0000-0000000000f3','owner',null);
set role authenticated;
\echo '--- 1. owner A sees tender, B owner does not'
set test.uid = '00000000-0000-0000-0000-0000000000f1'; select count(*) as owner_a_tenders from tenders;
set test.uid = '00000000-0000-0000-0000-0000000000f3'; select count(*) as owner_b_tenders, (select count(*) from tender_positions) b_pos from tenders;
\echo '--- 2. member without Finances: positions yes, prices no'
set test.uid = '00000000-0000-0000-0000-0000000000f2'; select (select count(*) from tender_positions) pos, (select count(*) from tender_position_prices) prices;
\echo '--- 3. member edits quantity -> amount recomputed + audit'
update tender_positions set quantity_manual = 14 where quantity_manual = 12.5;
set test.uid = '00000000-0000-0000-0000-0000000000f1'; select quantity_selected, amount from tender_positions p join tender_position_prices pr on pr.position_id=p.id where p.quantity_manual=14;
select field, old_value, new_value, actor from tender_audit_log order by id;
\echo '--- 4. org B (solo plan) cannot create a tender'
set test.uid = '00000000-0000-0000-0000-0000000000f3'; insert into tenders (project_id, name) values ('00000000-0000-0000-0000-0000000000b1','X');
\echo '--- 5. forged organization_id is replaced by the chantier one'
set test.uid = '00000000-0000-0000-0000-0000000000f1'; insert into tenders (project_id, organization_id, name) values ('00000000-0000-0000-0000-0000000000a1','00000000-0000-0000-0000-00000000000b','Soumission CFC 211') returning organization_id;
\echo '--- 6. owner A cannot insert into org B chantier'
insert into tenders (project_id, name) values ('00000000-0000-0000-0000-0000000000b1','Intrus');
\echo '--- 7. duplicate'
select duplicate_tender((select id from tenders where name='Métré interne'), 'Variante 01') is not null as dup_ok;
select t.name, count(n.*) nodes, (select count(*) from tender_position_prices pr where pr.tender_id=t.id) prices from tenders t left join tender_nodes n on n.tender_id=t.id group by t.id, t.name order by t.name;
\echo '--- 8. parent from another tender is refused'
insert into tender_nodes (tender_id, parent_id, node_type, title) values ((select id from tenders where name='Variante 01'), (select id from tender_nodes where title='Gros œuvre' and tender_id=(select id from tenders where name='Métré interne')), 'note', 'x');
\echo '--- 9. original quantity untouched by measured/manual'
insert into tender_nodes (tender_id, node_type, title) select id,'billable_position','Coffrage parois' from tenders where name='Soumission CFC 211';
insert into tender_positions (tender_id,node_id,unit,quantity_original) select tender_id,id,'m2',820 from tender_nodes where title='Coffrage parois';
update tender_positions set quantity_measured=834.65, quantity_selected_source='measured' where quantity_original=820;
select quantity_original, quantity_measured, quantity_selected from tender_positions where quantity_original=820;
\echo '--- 10. non-finance member cannot write prices'
set test.uid = '00000000-0000-0000-0000-0000000000f2'; insert into tender_position_prices (position_id, tender_id, unit_price) select id, tender_id, 99 from tender_positions where quantity_original=820;
