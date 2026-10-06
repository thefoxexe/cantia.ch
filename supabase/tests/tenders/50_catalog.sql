\set ON_ERROR_STOP 0
reset role;
grant all on all tables in schema public to authenticated;
-- a priced CAN position + a reserved one
insert into tender_nodes (id, tender_id, node_type, title, can_chapter, position_path) select '00000000-0000-0000-0000-0000000000c7', id, 'billable_position', 'Coffrage de parois type 2', '241', '235.111' from tenders where name = 'Soumission CFC 211';
insert into tender_nodes (id, tender_id, node_type, title, can_chapter, position_path, is_reserved) select '00000000-0000-0000-0000-0000000000c8', id, 'billable_position', 'Texte R', '241', '235.191', true from tenders where name = 'Soumission CFC 211';
insert into tender_positions (id, tender_id, node_id, unit, quantity_original) select '00000000-0000-0000-0000-0000000000c9', tender_id, id, 'm2', 43 from tender_nodes where id = '00000000-0000-0000-0000-0000000000c7';
insert into tender_positions (id, tender_id, node_id, unit, quantity_original) select '00000000-0000-0000-0000-0000000000ca', tender_id, id, 'm2', 5 from tender_nodes where id = '00000000-0000-0000-0000-0000000000c8';
insert into tender_position_prices (position_id, tender_id, unit_price) select id, tender_id, 39 from tender_positions where id in ('00000000-0000-0000-0000-0000000000c9', '00000000-0000-0000-0000-0000000000ca');
set role authenticated;
\echo '--- C1. owner saves prices: 1 (R skipped)'
set test.uid = '00000000-0000-0000-0000-0000000000f1';
select save_tender_prices_to_catalog((select id from tenders where name = 'Soumission CFC 211')) as saved;
select can_ref, unit, unit_price, description from catalog_items;
\echo '--- C2. new price replaces it, no duplicate'
reset role;
update tender_position_prices set unit_price = 42 where position_id = '00000000-0000-0000-0000-0000000000c9';
set role authenticated;
select save_tender_prices_to_catalog((select id from tenders where name = 'Soumission CFC 211')) as saved;
select count(*), max(unit_price), max(use_count) from catalog_items;
\echo '--- C3. member without Finances refused'
set test.uid = '00000000-0000-0000-0000-0000000000f2';
select save_tender_prices_to_catalog((select id from tenders where name = 'Soumission CFC 211'));
reset role;
\echo '--- C4. imported soumission starts with the printed VAT rate (7.70), manual one with 8.1'
insert into tenders (project_id, name, kind, source_type, metadata) select project_id, 'Import TVA', 'soumission', 'pdf', '{"document_vat_rate": 7.7}' from tenders where name = 'Soumission CFC 211';
insert into tenders (project_id, name, kind, source_type, metadata) select project_id, 'Manuel TVA', 'soumission', 'manual', '{"document_vat_rate": 7.7}' from tenders where name = 'Soumission CFC 211';
select name, vat_rate from tenders where name in ('Import TVA', 'Manuel TVA') order by name;
\echo '--- C5. soumissions only for building companies: true, false for a fiduciaire, true for a building company in mandats'
reset role;
select org_has_tenders('00000000-0000-0000-0000-00000000000a') as building;
update organizations set trade = 'Finance, comptabilité & assurances' where id = '00000000-0000-0000-0000-00000000000a';
select org_has_tenders('00000000-0000-0000-0000-00000000000a') as services;
update organizations set trade = 'Construction & bâtiment', work_term = 'mandat' where id = '00000000-0000-0000-0000-00000000000a';
select org_has_tenders('00000000-0000-0000-0000-00000000000a') as mandats;
