\set ON_ERROR_STOP 0
\pset footer off
-- Annual closing and VAT returns of an external client (20261009120000_fiduciary_ledger_closing_vat.sql).
-- f1 owner of firm A, f2 member of A, f3 owner of firm B (10_pro.sql). Today is after 31.12.2025.

set role authenticated;
set test.uid = '00000000-0000-0000-0000-0000000000f1';
\echo '--- C1. a client with a 2025 year and a running 2026'
select public.acc_save_external_client(null, '{"name":"Atelier Clôture Sàrl","software":"none","fiscal_year_end":"12-31"}') is not null as created;
select id as ext_c from fiduciary_external_clients where name = 'Atelier Clôture Sàrl' \gset
select public.acc_ext_ledger_init(:'ext_c') > 80 as chart;
select public.acc_ext_import_entries(:'ext_c', '[
  {"date":"2025-01-02","label":"Capital","lines":[{"account_code":"1020","debit":20000},{"account_code":"2800","credit":20000}]},
  {"date":"2025-03-10","reference":"F1","label":"Facture F1","lines":[{"account_code":"1100","debit":10810},{"account_code":"3400","credit":10000,"vat_code":"V81"},{"account_code":"2200","credit":810}]},
  {"date":"2025-06-30","reference":"L1","label":"Loyer","lines":[{"account_code":"6000","debit":4000},{"account_code":"1020","credit":4000}]},
  {"date":"2026-02-10","reference":"F2","label":"Facture F2","lines":[{"account_code":"1100","debit":5405},{"account_code":"3400","credit":5000,"vat_code":"V81"},{"account_code":"2200","credit":405}]},
  {"date":"2026-02-20","reference":"A1","label":"Achat matériel","lines":[{"account_code":"4000","debit":1000,"vat_code":"M81"},{"account_code":"1170","debit":81},{"account_code":"2000","credit":1081}]},
  {"date":"2026-03-05","reference":"I1","label":"Ordinateur","lines":[{"account_code":"1520","debit":2000,"vat_code":"I81"},{"account_code":"1171","debit":162},{"account_code":"1020","credit":2162}]}
]') as imported;
select x ->> 'start' as start, x ->> 'end' as "end", x ->> 'entries' as entries, x ->> 'result' as result, x ->> 'closed' as closed, x ->> 'finished' as finished
from jsonb_array_elements(public.acc_ext_years(:'ext_c')) x;

\echo '--- C2. closing: not before the end, not with drafts, lock only by admins; then 2025 is closed and carried forward'
select public.acc_ext_close_year(:'ext_c', '2026-12-31');
select public.acc_ext_close_year(:'ext_c', '2025-06-30');
select public.acc_ext_save_entry(:'ext_c', null, '2025-12-15', 'Oubli', null, '[{"account_code":"6500","debit":10},{"account_code":"1020","credit":10}]', false) ->> 'id' as forgotten \gset
select public.acc_ext_close_year(:'ext_c', '2025-12-31');
select public.acc_ext_entry_action(:'forgotten', 'discard') is not null as discarded;
set test.uid = '00000000-0000-0000-0000-0000000000f2';
select public.acc_ext_close_year(:'ext_c', '2025-12-31', true, true);
set test.uid = '00000000-0000-0000-0000-0000000000f1';
select public.acc_ext_close_year(:'ext_c', '2025-12-31', true, true) as closing;
select public.acc_ext_close_year(:'ext_c', '2025-12-31');
select ledger_locked_until from fiduciary_external_clients where id = :'ext_c';
select status from fiduciary_external_deadline_status where external_client_id = :'ext_c' and kind = 'closing';

\echo '--- C3. statements: 2025 still shows its income statement; 2026 opens with the profit in 2970; always balanced'
select s ->> 'result' as result_2025, s ->> 'year_result' as year_result, s ->> 'prior_results' as prior, s ->> 'closed' as closed,
  (select string_agg((a ->> 'code') || '=' || (a ->> 'amount'), ' ' order by a ->> 'code') from jsonb_array_elements(s -> 'liabilities') a) as liabilities,
  (select sum((a ->> 'amount')::numeric) from jsonb_array_elements(s -> 'assets') a) as assets
from (select public.acc_ext_statements(:'ext_c', '2025-12-31') as s) t;
select s ->> 'prior_results' as prior_2026, s ->> 'year_result' as year_2026,
  (select string_agg((a ->> 'code') || '=' || (a ->> 'amount'), ' ' order by a ->> 'code') from jsonb_array_elements(s -> 'liabilities') a) as liabilities,
  (select sum((a ->> 'amount')::numeric) from jsonb_array_elements(s -> 'assets') a) as assets
from (select public.acc_ext_statements(:'ext_c', '2026-03-31') as s) t;
select k -> 'current' ->> 'revenue' as revenue_2025, k -> 'current' ->> 'opex' as opex_2025 from (select public.acc_ext_kpis(:'ext_c', '2025-12-31') as k) t;

\echo '--- C4. closing entries are protected; the closed year refuses entries'
select public.acc_ext_entry_action((select id from fiduciary_ext_entries where external_client_id = :'ext_c' and closing_fy_end is not null and entry_date = '2025-12-31'), 'reverse', '2026-01-05');
select public.acc_ext_save_entry(:'ext_c', null, '2025-11-30', 'Tard', null, '[{"account_code":"6500","debit":10},{"account_code":"1020","credit":10}]');
select x ->> 'system' as system, x ->> 'label' as label from jsonb_array_elements(public.acc_ext_entries(:'ext_c', '2025-12-31', '2026-01-01') -> 'rows') x order by 2;

\echo '--- C5. reopening: admins only, entries kept as replaced, lock removed, prior result back'
set test.uid = '00000000-0000-0000-0000-0000000000f2';
select public.acc_ext_reopen_year(:'ext_c', '2025-12-31');
set test.uid = '00000000-0000-0000-0000-0000000000f1';
select public.acc_ext_reopen_year(:'ext_c', '2025-12-31');
select status, count(*) from fiduciary_ext_entries where external_client_id = :'ext_c' and closing_fy_end is not null group by status;
select ledger_locked_until is null as unlocked from fiduciary_external_clients where id = :'ext_c';
select (public.acc_ext_statements(:'ext_c', '2026-03-31')) ->> 'prior_results' as prior_back;
select public.acc_ext_close_year(:'ext_c', '2025-12-31', false, false) ->> 'carry_number' is null as closed_again_without_carry;

\echo '--- C6. VAT Q1 2026: summary, filing with the settlement entry, no double filing, cancel and file again'
select public.acc_ext_vat_summary(:'ext_c', '2026-01-01', '2026-03-31') as vat;
select public.acc_ext_file_vat_return(:'ext_c', '2026-01-01', '2026-03-31', '2026-Q1', 'effective', '{"299":5000,"303":405,"400":81,"405":162,"500":162}', '{}', 162) ->> 'entry_number' is not null as filed;
select x ->> 'code' as code, x ->> 'closing' as closing from jsonb_array_elements(public.acc_ext_trial_balance(:'ext_c', '2026-01-01', '2026-03-31')) x where x ->> 'code' in ('2200', '1170', '1171', '2201');
select public.acc_ext_vat_summary(:'ext_c', '2026-01-01', '2026-03-31') ->> 'vat_due' as due_still_reported;
select status from fiduciary_external_deadline_status where external_client_id = :'ext_c' and kind = 'vat' and period_key = '2026-Q1';
select public.acc_ext_file_vat_return(:'ext_c', '2026-01-01', '2026-03-31', '2026-Q1', 'effective', '{}', '{}', 0);
select public.acc_ext_entry_action((select id from fiduciary_ext_entries where external_client_id = :'ext_c' and vat_return_id is not null and status = 'posted'), 'reverse');
select public.acc_ext_cancel_vat_return((select id from fiduciary_ext_vat_returns where external_client_id = :'ext_c' and status = 'filed'));
select x ->> 'code' as code, x ->> 'closing' as closing_after_cancel from jsonb_array_elements(public.acc_ext_trial_balance(:'ext_c', '2026-01-01', '2026-03-31')) x where x ->> 'code' in ('2200', '2201');
select public.acc_ext_file_vat_return(:'ext_c', '2026-01-01', '2026-03-31', '2026-Q1', 'effective', '{}', '{}', 162, true, true) ->> 'id' is not null as filed_again;
select ledger_locked_until from fiduciary_external_clients where id = :'ext_c';
select x ->> 'status' as status, x ->> 'payable' as payable from jsonb_array_elements(public.acc_ext_vat_returns(:'ext_c')) x order by 1;

\echo '--- C7. firm B reads and writes nothing'
set test.uid = '00000000-0000-0000-0000-0000000000f3';
select count(*) as b_closings from fiduciary_ext_closings;
select count(*) as b_returns from fiduciary_ext_vat_returns;
select public.acc_ext_years(:'ext_c');
select public.acc_ext_close_year(:'ext_c', '2025-12-31');
reset role;
