\set ON_ERROR_STOP 0
reset role;
grant all on all tables in schema public to authenticated;
grant execute on all functions in schema public to authenticated;
set role authenticated;
\echo '--- 11. import a draft (owner with Finances)'
set test.uid = '00000000-0000-0000-0000-0000000000f1';
insert into tender_import_jobs (project_id, file_name, page_count, status, draft) values ('00000000-0000-0000-0000-0000000000a1', '01_BA.pdf', 50, 'ready_for_review', '{
 "parserVersion": "tenders-parser/1.0.0", "classification": "CAN",
 "meta": {"cfcCode": "211", "cfcLabel": "BETON ARME", "tenderNumber": "1", "zoneCodes": ["PG","A-B"], "owner": "TOBO"},
 "answers": {"zone:A-B": "Villas A et B", "unit:palettes": "pce"},
 "nodes": [
  {"key": "n1", "parentKey": null, "nodeType": "chapter", "depth": 0, "rawNumber": "241", "displayReference": "CAN 241", "title": "Béton", "description": "Béton", "certainty": "certain"},
  {"key": "n2", "parentKey": "n1", "nodeType": "article", "depth": 1, "rawNumber": "121", "positionPath": "121", "title": "Béton maigre", "description": "Béton maigre\nsuite", "certainty": "certain"},
  {"key": "n3", "parentKey": "n2", "nodeType": "billable_position", "depth": 2, "rawNumber": ".111", "positionPath": "121.111", "displayReference": "241 / 121.111", "title": "Ep. 50", "rawUnit": "m2", "unit": "m2", "quantity": 820, "breakdowns": [{"code":"PG","quantity":650,"page":24},{"code":"A-B","quantity":70,"page":24},{"code":"C-D","quantity":100,"page":24}], "page": 24, "bbox": {"x":0.1,"y":0.2,"w":0.5,"h":0.02}, "certainty": "certain"},
  {"key": "n4", "parentKey": "n2", "nodeType": "billable_position", "depth": 2, "rawNumber": "R .903", "isReserved": true, "title": "Trous", "rawUnit": "palettes", "unit": "palettes", "quantity": 5, "breakdowns": [], "certainty": "uncertain"},
  {"key": "n5", "parentKey": "n1", "nodeType": "billable_position", "depth": 1, "rawNumber": ".001", "title": "Régie", "rawUnit": "up", "unit": "up", "quantity": 8000, "documentUnitPrice": 0.9, "documentAmount": 7200, "breakdowns": [], "certainty": "certain"}
 ]}');
select import_tender_draft((select id from tender_import_jobs where file_name = '01_BA.pdf'), 'Béton armé', 'soumission') is not null as imported;
select t.name, t.source_type, t.cfc_code, t.classification_type, t.metadata ->> 'owner' owner from tenders t where t.name = 'Béton armé';
select n.raw_number, n.node_type, n.is_reserved, n.needs_review, p.unit, p.raw_unit, p.quantity_original, p.quantity_selected, p.status, pr.unit_price, pr.price_source, pr.amount
  from tender_nodes n left join tender_positions p on p.node_id = n.id left join tender_position_prices pr on pr.position_id = p.id
  where n.tender_id = (select id from tenders where name = 'Béton armé') order by n.sort_order;
select code, quantity_original from position_breakdowns where tender_id = (select id from tenders where name = 'Béton armé') order by sort_order;
select code, label from tender_zone_labels where tender_id = (select id from tenders where name = 'Béton armé');
select status, tender_id is not null as linked from tender_import_jobs where file_name = '01_BA.pdf';
\echo '--- 12. a second import of the same job is refused'
select import_tender_draft((select id from tender_import_jobs where file_name = '01_BA.pdf'), 'x', 'soumission');
\echo '--- 13. org B cannot import a job of org A'
set test.uid = '00000000-0000-0000-0000-0000000000f3';
select count(*) as b_sees_jobs from tender_import_jobs;
\echo '--- 14. a member without Finances imports without document prices'
set test.uid = '00000000-0000-0000-0000-0000000000f2';
insert into tender_import_jobs (project_id, file_name, status, draft) values ('00000000-0000-0000-0000-0000000000a1', 'regie.pdf', 'ready_for_review', '{"classification":"CAN","nodes":[{"key":"a","parentKey":null,"nodeType":"billable_position","title":"Régie","rawUnit":"up","unit":"up","quantity":8000,"documentUnitPrice":0.9,"documentAmount":7200,"certainty":"certain"}]}');
select import_tender_draft((select id from tender_import_jobs where file_name = 'regie.pdf'), 'Régie', 'soumission') is not null as imported;
reset role;
select count(*) as prices_for_non_finance_import from tender_position_prices where tender_id = (select id from tenders where name = 'Régie');
set role authenticated;
\echo '--- 15. a malformed draft is refused as a whole'
set test.uid = '00000000-0000-0000-0000-0000000000f1';
insert into tender_import_jobs (project_id, file_name, status, draft) values ('00000000-0000-0000-0000-0000000000a1', 'bad.pdf', 'ready_for_review', '{"nodes":[{"key":"a","nodeType":"chapter","title":"ok"},{"key":"b","nodeType":"drop table","title":"x"}]}');
select import_tender_draft((select id from tender_import_jobs where file_name = 'bad.pdf'), 'Bad', 'soumission');
select count(*) as bad_tenders from tenders where name = 'Bad';
