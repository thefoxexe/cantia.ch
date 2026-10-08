\set ON_ERROR_STOP 0
\pset footer off
-- People: f1 owner of firm A, f2 member of A, f3 owner of firm B, u1 owner of client X.
insert into auth.users values
 ('00000000-0000-0000-0000-0000000000f1', 'f1@fidu-a.ch'), ('00000000-0000-0000-0000-0000000000f2', 'f2@fidu-a.ch'),
 ('00000000-0000-0000-0000-0000000000f3', 'f3@fidu-b.ch'), ('00000000-0000-0000-0000-0000000000a1', 'u1@client-x.ch');
insert into public.fiduciary_firms (id, name, locale) values ('00000000-0000-0000-0000-00000000aaaa', 'Fidu A', 'fr'), ('00000000-0000-0000-0000-00000000bbbb', 'Fidu B', 'de');
insert into public.fiduciary_members (firm_id, user_id, role, first_name, last_name, email) values
 ('00000000-0000-0000-0000-00000000aaaa', '00000000-0000-0000-0000-0000000000f1', 'OWNER', 'Anne', 'Fidu', 'f1@fidu-a.ch'),
 ('00000000-0000-0000-0000-00000000aaaa', '00000000-0000-0000-0000-0000000000f2', 'MEMBER', 'Marc', 'Aide', 'f2@fidu-a.ch'),
 ('00000000-0000-0000-0000-00000000bbbb', '00000000-0000-0000-0000-0000000000f3', 'OWNER', 'Bea', 'Other', 'f3@fidu-b.ch');
insert into public.organizations (id, name) values ('00000000-0000-0000-0000-00000000c001', 'Client X SA');
insert into public.organization_members values ('00000000-0000-0000-0000-00000000c001', '00000000-0000-0000-0000-0000000000a1', 'owner', 'fr', null);
insert into public.fiduciary_client_access (firm_id, organization_id, status, permissions, source)
values ('00000000-0000-0000-0000-00000000aaaa', '00000000-0000-0000-0000-00000000c001', 'ACTIVE', public.fiduciary_standard_permissions(), 'FIRM_REQUEST');
-- Client X ledger: fiscal year 2026, OD journal, a few accounts.
insert into public.accounting_fiscal_years (id, organization_id, start_date, end_date) values ('00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-00000000c001', '2026-01-01', '2026-12-31');
insert into public.accounting_fiscal_years (id, organization_id, start_date, end_date) values ('00000000-0000-0000-0000-0000000000e0', '00000000-0000-0000-0000-00000000c001', '2025-01-01', '2025-12-31');
insert into public.accounting_journals (organization_id, code, label) values ('00000000-0000-0000-0000-00000000c001', 'OD', 'Opérations diverses');
insert into public.accounting_accounts (organization_id, code, label, type) values
 ('00000000-0000-0000-0000-00000000c001', '1020', 'Banque', 'actif'), ('00000000-0000-0000-0000-00000000c001', '1100', 'Débiteurs', 'actif'),
 ('00000000-0000-0000-0000-00000000c001', '2000', 'Créanciers', 'passif'), ('00000000-0000-0000-0000-00000000c001', '2800', 'Capital', 'passif'),
 ('00000000-0000-0000-0000-00000000c001', '3400', 'Ventes', 'produit'), ('00000000-0000-0000-0000-00000000c001', '4000', 'Matériel', 'charge'),
 ('00000000-0000-0000-0000-00000000c001', '5000', 'Salaires', 'charge'), ('00000000-0000-0000-0000-00000000c001', '6500', 'Frais admin', 'charge'),
 ('00000000-0000-0000-0000-00000000c001', '6800', 'Amortissements', 'charge'), ('00000000-0000-0000-0000-00000000c001', '8900', 'Impôts', 'charge');
grant usage on schema public, auth, storage to authenticated, anon, service_role;
grant all on all tables in schema public to service_role;
grant select on storage.objects to authenticated;
create policy "test read all organizations" on public.organizations for select using (true);

set role authenticated;
set test.uid = '00000000-0000-0000-0000-0000000000f1';
\echo '--- P1. firm A creates an external client; firm B neither sees it nor can change it'
select public.acc_save_external_client(null, '{"name":"Menuiserie Hors Cantia","email":"Patron@Menuiserie.ch","software":"banana","has_payroll":true,"hourly_rate":"140"}') is not null as created;
select name, email, software, has_payroll, hourly_rate from fiduciary_external_clients;
select id as ext_a, portal_token as token_a from fiduciary_external_clients \gset
set test.uid = '00000000-0000-0000-0000-0000000000f3';
select count(*) as b_sees from fiduciary_external_clients;
select public.acc_save_external_client(:'ext_a', '{"name":"pirate"}');
select public.acc_ext_create_request(:'ext_a', 'Intrus', null, null);
reset role;
select name as still_named from fiduciary_external_clients;

set role authenticated;
set test.uid = '00000000-0000-0000-0000-0000000000f2';
\echo '--- P2. a member asks the external client for a document: e-mail with the private link'
select public.acc_ext_create_request(:'ext_a', 'Relevés bancaires T3', 'PostFinance', '2026-10-31') is not null as request;
reset role;
select kind, to_email, payload ->> 'company_name' as company, (payload ->> 'portal_token') is not null as has_link from fiduciary_email_outbox order by created_at;

\echo '--- P3. the private link (service role): sees the request, uploads, answers; wrong token gets nothing'
set role service_role;
select (public.fiduciary_portal_get(:'token_a') -> 'firm' ->> 'name') as firm,
       jsonb_array_length(public.fiduciary_portal_get(:'token_a') -> 'requests') as requests;
select public.fiduciary_portal_get(gen_random_uuid()) is null as unknown_token_null;
select public.fiduciary_portal_upload_prefix(:'token_a', (select id from public.fiduciary_external_requests limit 1)) like 'fiduciary/00000000-0000-0000-0000-00000000aaaa/ext/%' as prefix_ok;
select public.fiduciary_portal_add_file(:'token_a', (select id from public.fiduciary_external_requests limit 1), 'fiduciary/00000000-0000-0000-0000-00000000bbbb/x.pdf', 'x.pdf', 10);
select public.fiduciary_portal_add_file(:'token_a', (select id from public.fiduciary_external_requests limit 1),
  public.fiduciary_portal_upload_prefix(:'token_a', (select id from public.fiduciary_external_requests limit 1)) || 'releve.pdf', 'releve.pdf', 2048);
select public.fiduciary_portal_answer(:'token_a', (select id from public.fiduciary_external_requests limit 1), 'Voici le relevé');
reset role;
select status, client_message, (select count(*) from fiduciary_external_request_files) as files from fiduciary_external_requests;
select kind, to_email from fiduciary_email_outbox where kind = 'request_answered' order by to_email;

\echo '--- P4. the firm sees requests of both kinds together, and the deadlines of the external client'
set role authenticated;
set test.uid = '00000000-0000-0000-0000-0000000000f1';
select x ->> 'organization_name' as client, x ->> 'status' as status, jsonb_array_length(x -> 'files') as files from jsonb_array_elements(public.acc_requests()) x;
select x ->> 'name' as name, (x ->> 'external_client_id') is not null as external from jsonb_array_elements(public.acc_deadline_data()) x;
set test.uid = '00000000-0000-0000-0000-0000000000f3';
select jsonb_array_length(public.acc_requests()) as b_requests;

\echo '--- P5. work: a closing checklist; steps move the status; firm B sees nothing'
set test.uid = '00000000-0000-0000-0000-0000000000f1';
select public.acc_save_process_template(null, 'Bouclement annuel', 'closing', array['Relevés reçus', 'Rapprochement bancaire', '  ', 'Bilan']) is not null as template;
select name, steps from fiduciary_process_templates;
select public.acc_create_work_item('00000000-0000-0000-0000-00000000c001', null, 'Bouclement 2025', 'closing', '2025', '2026-06-30', '00000000-0000-0000-0000-0000000000f2',
  (select steps from public.fiduciary_process_templates limit 1), (select id from public.fiduciary_process_templates limit 1)) is not null as work;
select public.acc_toggle_work_step((select id from public.fiduciary_work_steps order by sort_order limit 1), true) as after_first;
select public.acc_toggle_work_step(id, true) as after_each from public.fiduciary_work_steps order by sort_order offset 1;
select status, completed_at is not null as completed from fiduciary_work_items;
select public.acc_toggle_work_step((select id from public.fiduciary_work_steps order by sort_order limit 1), false) as after_uncheck;
select x ->> 'title' as title, x ->> 'assigned_name' as who, jsonb_array_length(x -> 'steps') as steps from jsonb_array_elements(public.acc_work_items()) x;
set test.uid = '00000000-0000-0000-0000-0000000000f3';
select count(*) as b_sees_work from fiduciary_work_items;
select public.acc_create_work_item('00000000-0000-0000-0000-00000000c001', null, 'Intrus', 'other', null, null, null, '{}', null);

\echo '--- P6. time: rate of the client (external 140, Cantia → firm default 120); only admins mark billed'
reset role;
update fiduciary_firms set default_hourly_rate = 120 where id = '00000000-0000-0000-0000-00000000aaaa';
set role authenticated;
set test.uid = '00000000-0000-0000-0000-0000000000f2';
select public.acc_add_time(null, :'ext_a', '2026-10-05', 90, 'Saisie T3', true, null) is not null as t1;
select public.acc_add_time('00000000-0000-0000-0000-00000000c001', null, '2026-10-06', 45, 'Bouclement', true, (select id from public.fiduciary_work_items limit 1)) is not null as t2;
select client_name, minutes, rate_chf from (select x ->> 'client_name' as client_name, (x ->> 'minutes')::int as minutes, (x ->> 'rate_chf')::numeric as rate_chf from jsonb_array_elements(public.acc_time_entries()) x) t order by client_name;
select public.acc_time_action(array(select id from public.fiduciary_time_entries), 'billed');
set test.uid = '00000000-0000-0000-0000-0000000000f1';
select public.acc_time_action(array(select id from public.fiduciary_time_entries), 'billed') as billed;
select public.acc_update_time((select id from public.fiduciary_time_entries limit 1), '{"minutes": 10}');

\echo '--- P7. approvals: Cantia client signs in the app, external client through the link'
select public.acc_create_approval('00000000-0000-0000-0000-00000000c001', null, 'annual_accounts', 'Comptes annuels 2025', 'Merci de valider', 'fiduciary/00000000-0000-0000-0000-00000000aaaa/approvals/1/comptes.pdf', 'comptes.pdf', repeat('a', 64), null) is not null as sent_org;
select public.acc_create_approval('00000000-0000-0000-0000-00000000c001', null, 'other', 'Fichier d''une autre fiduciaire', null, 'fiduciary/00000000-0000-0000-0000-00000000bbbb/approvals/1/x.pdf', 'x.pdf', null, null);
select public.acc_create_approval(null, :'ext_a', 'tax_return', 'Déclaration 2025', null, null, null, null, null) is not null as sent_ext;
reset role;
select kind, to_email from fiduciary_email_outbox where kind = 'approval_new' order by to_email;
set role authenticated;
set test.uid = '00000000-0000-0000-0000-0000000000a1';
select x ->> 'title' as title, x ->> 'status' as status from jsonb_array_elements(public.org_fiduciary_approvals('00000000-0000-0000-0000-00000000c001')) x;
select public.org_decide_approval((select id from public.fiduciary_approvals where organization_id is not null), true, 'Ueli Client', null);
select public.org_decide_approval((select id from public.fiduciary_approvals where organization_id is not null), true, 'Ueli Client', 'data:image/png;base64,iVBOR');
reset role;
set role service_role;
select public.fiduciary_portal_decide(:'token_a', (select id from public.fiduciary_approvals where external_client_id is not null), false, 'Patron', null, 'Il manque les frais de véhicule', '203.0.113.7');
reset role;
select title, status, signer_name, rejection_reason, decided_ip from fiduciary_approvals order by title;
select count(*) as decided_mails from fiduciary_email_outbox where kind = 'approval_decided';

\echo '--- P8. entry proposals: refused without the permission, then checked (balance, accounts), accepted by the client → posted entry'
set role authenticated;
set test.uid = '00000000-0000-0000-0000-0000000000f1';
select public.acc_create_entry_proposal('00000000-0000-0000-0000-00000000c001', '2026-09-30', 'Correction frais', null, '[{"account_code":"6500","debit":100},{"account_code":"1020","credit":100}]');
reset role;
update fiduciary_client_access set permissions = permissions || 'PROPOSE_ENTRIES'::text where organization_id = '00000000-0000-0000-0000-00000000c001';
set role authenticated;
select public.acc_create_entry_proposal('00000000-0000-0000-0000-00000000c001', '2026-09-30', 'Déséquilibrée', null, '[{"account_code":"6500","debit":100},{"account_code":"1020","credit":90}]');
select public.acc_create_entry_proposal('00000000-0000-0000-0000-00000000c001', '2026-09-30', 'Compte inconnu', null, '[{"account_code":"9999","debit":100},{"account_code":"1020","credit":100}]');
select public.acc_create_entry_proposal('00000000-0000-0000-0000-00000000c001', '2026-09-30', 'Correction frais bancaires', 'Frais non saisis', '[{"account_code":"6500","debit":"35.50","label":"Frais T3"},{"account_code":"1020","credit":35.5}]') is not null as proposed;
set test.uid = '00000000-0000-0000-0000-0000000000a1';
select x ->> 'label' as label, jsonb_array_length(x -> 'lines') as lines, x -> 'lines' -> 0 ->> 'account_label' as first_account from jsonb_array_elements(public.org_entry_proposals('00000000-0000-0000-0000-00000000c001')) x;
select public.org_decide_entry_proposal((select id from public.fiduciary_entry_proposals limit 1), true, null) ->> 'posted' as posted;
reset role;
select e.label, e.status, e.entry_number, e.external_reference like 'FID-%' as ref, (select sum(debit) from accounting_entry_lines where entry_id = e.id) as total from accounting_entries e;
select status, posted from fiduciary_entry_proposals;

\echo '--- P9. indicators: revenue 10000, material 2000, personnel 3000, admin 535.50 (incl. proposal), depreciation 500, taxes 400; previous year 8000'
create or replace function pg_temp.post(p_date date, p_label text, p_debit text, p_credit text, p_amount numeric) returns void language plpgsql as $$
declare v uuid;
begin
  insert into public.accounting_entries (organization_id, fiscal_year_id, journal_id, entry_date, label, source, status)
  values ('00000000-0000-0000-0000-00000000c001', (select id from public.accounting_fiscal_years where p_date between start_date and end_date), (select id from public.accounting_journals limit 1), p_date, p_label, 'manuelle', 'comptabilisee') returning id into v;
  insert into public.accounting_entry_lines (entry_id, account_id, debit, credit) values
    (v, (select id from public.accounting_accounts where code = p_debit), p_amount, 0),
    (v, (select id from public.accounting_accounts where code = p_credit), 0, p_amount);
end $$;
select pg_temp.post('2026-02-01', 'Capital', '1020', '2800', 20000);
select pg_temp.post('2026-03-01', 'Facture', '1100', '3400', 10000);
select pg_temp.post('2026-03-15', 'Matériel', '4000', '2000', 2000);
select pg_temp.post('2026-04-01', 'Salaires', '5000', '1020', 3000);
select pg_temp.post('2026-04-02', 'Admin', '6500', '1020', 500);
select pg_temp.post('2026-06-30', 'Amortissement', '6800', '1020', 500);
select pg_temp.post('2026-07-01', 'Impôts', '8900', '1020', 400);
select pg_temp.post('2025-05-01', 'Facture 2025', '1100', '3400', 8000);
set role authenticated;
set test.uid = '00000000-0000-0000-0000-0000000000f1';
select k -> 'current' ->> 'revenue' as revenue, k -> 'previous' ->> 'revenue' as prev_revenue, k -> 'current' ->> 'material' as material,
       k -> 'current' ->> 'personnel' as personnel, k -> 'current' ->> 'opex' as opex, k -> 'current' ->> 'depreciation' as amort,
       k -> 'balance' ->> 'liquid' as liquid, k -> 'balance' ->> 'receivables' as receivables, k -> 'balance' ->> 'short_term_debt' as st_debt
from (select public.acc_client_kpis('00000000-0000-0000-0000-00000000c001', '2026-10-01') k) t;
select x ->> 'name' as name, x ->> 'kind' as kind, jsonb_typeof(x -> 'kpis') = 'object' as has_kpis, x ->> 'work_open' as work, x ->> 'unbilled_minutes' as unbilled from jsonb_array_elements(public.acc_portfolio()) x;
set test.uid = '00000000-0000-0000-0000-0000000000f3';
select public.acc_client_kpis('00000000-0000-0000-0000-00000000c001');

\echo '--- P10. directory: hidden until the firm publishes it; anon reads it; a client asks to collaborate'
set role anon;
select jsonb_array_length(public.fiduciary_directory()) as before;
set role authenticated;
set test.uid = '00000000-0000-0000-0000-0000000000f3';
select public.acc_update_firm_profile(null, '#1F6F5C', 150, true, 'Fiduciaire du Valais central', array['TVA', 'Salaires', ' '], array['fr', 'de', 'xx'], array['VS', 'vaud'], 'contact@fidu-b.ch', true);
set role anon;
select x ->> 'name' as name, x -> 'services' as services, x -> 'languages' as languages, x -> 'cantons' as cantons from jsonb_array_elements(public.fiduciary_directory(null, 'VS')) x;
select jsonb_array_length(public.fiduciary_directory('sion', null)) as search_none;
set role authenticated;
set test.uid = '00000000-0000-0000-0000-0000000000a1';
select public.org_request_firm('00000000-0000-0000-0000-00000000c001', '00000000-0000-0000-0000-00000000bbbb') ->> 'kind' as kind;
select public.org_request_firm('00000000-0000-0000-0000-00000000c001', '00000000-0000-0000-0000-00000000bbbb');
reset role;
select status, source from fiduciary_client_access where firm_id = '00000000-0000-0000-0000-00000000bbbb';

\echo '--- P11. files: a firm reads only fiduciary/{its firm}/…; the client reads its approval document'
insert into storage.objects (bucket_id, name) values
 ('opus-storage', 'fiduciary/00000000-0000-0000-0000-00000000aaaa/approvals/1/comptes.pdf'),
 ('opus-storage', 'fiduciary/00000000-0000-0000-0000-00000000bbbb/approvals/9/secret.pdf');
set role authenticated;
set test.uid = '00000000-0000-0000-0000-0000000000f2';
select name from storage.objects order by name;
set test.uid = '00000000-0000-0000-0000-0000000000a1';
select name from storage.objects order by name;
reset role;

\echo '--- P12. archive and new link: the old link stops working'
set role authenticated;
set test.uid = '00000000-0000-0000-0000-0000000000f2';
select public.acc_external_client_action(:'ext_a', 'archive');
set test.uid = '00000000-0000-0000-0000-0000000000f1';
select (public.acc_external_client_action(:'ext_a', 'new_link') ->> 'portal_token') is not null as new_link;
reset role;
set role service_role;
select public.fiduciary_portal_get(:'token_a') is null as old_link_dead,
       public.fiduciary_portal_get((select portal_token from public.fiduciary_external_clients where id = :'ext_a')) is not null as new_link_works;
reset role;
