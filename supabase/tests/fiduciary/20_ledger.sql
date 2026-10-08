\set ON_ERROR_STOP 0
\pset footer off
-- The books of an external client kept by the firm (20261009090000_fiduciary_ledger.sql).
-- People and firms come from 10_pro.sql: f1 owner of A, f2 member of A, f3 owner of B.

set role authenticated;
set test.uid = '00000000-0000-0000-0000-0000000000f1';
\echo '--- L1. firm A opens the books of a new external client (German chart); firm B cannot'
select public.acc_save_external_client(null, '{"name":"Garage Ohne Cantia GmbH","software":"none","locale":"de","fiscal_year_end":"12-31"}') is not null as created;
select id as ext_l from fiduciary_external_clients where name = 'Garage Ohne Cantia GmbH' \gset
select public.acc_ext_save_entry(:'ext_l', null, '2026-02-01', 'Avant ouverture', null, '[{"account_code":"1020","debit":1},{"account_code":"2800","credit":1}]');
select public.acc_ext_ledger_init(:'ext_l') as accounts;
select code, label, type from fiduciary_ext_accounts where external_client_id = :'ext_l' and code in ('1020', '2200', '6950', '9100') order by code;
set test.uid = '00000000-0000-0000-0000-0000000000f3';
select public.acc_ext_ledger_init(:'ext_l');
select count(*) as b_sees_accounts from fiduciary_ext_accounts;

\echo '--- L2. entries: capital, a sale with VAT, last year revenue; unbalanced / unknown account refused'
set test.uid = '00000000-0000-0000-0000-0000000000f2';
select public.acc_ext_save_entry(:'ext_l', null, '2026-01-05', 'Apport en capital', 'B1',
  '[{"account_code":"1020","debit":"20''000"},{"account_code":"2800","credit":20000}]') ->> 'entry_number' as capital_no;
select public.acc_ext_save_entry(:'ext_l', null, '2026-02-10', 'Facture 101 Muster AG', 'F101',
  '[{"account_code":"1100","debit":10810},{"account_code":"3400","credit":10000,"vat_code":"V81"},{"account_code":"2200","credit":810}]') ->> 'entry_number' as sale_no;
select public.acc_ext_save_entry(:'ext_l', null, '2025-06-30', 'Chiffre 2025', null,
  '[{"account_code":"1100","debit":8000},{"account_code":"3400","credit":8000}]') ->> 'entry_number' as last_year_no;
select public.acc_ext_save_entry(:'ext_l', null, '2026-02-11', 'Faux', null, '[{"account_code":"1020","debit":100},{"account_code":"3400","credit":90}]');
select public.acc_ext_save_entry(:'ext_l', null, '2026-02-11', 'Faux', null, '[{"account_code":"1020","debit":100},{"account_code":"9999","credit":100}]');

\echo '--- L3. a draft has no number until posted; a posted entry changed keeps its number (old one kept as replaced)'
select public.acc_ext_save_entry(:'ext_l', null, '2026-02-15', 'Fournitures bureau', 'Q7',
  '[{"account_code":"6500","debit":120},{"account_code":"1020","credit":120}]', false) as draft \gset
select (:'draft'::jsonb ->> 'entry_number') is null as draft_without_number;
select public.acc_ext_entry_action((:'draft'::jsonb ->> 'id')::uuid, 'post') ->> 'entry_number' as posted_no;
select public.acc_ext_save_entry(:'ext_l', (:'draft'::jsonb ->> 'id')::uuid, '2026-02-15', 'Fournitures bureau', 'Q7',
  '[{"account_code":"6500","debit":150},{"account_code":"1020","credit":150}]') ->> 'entry_number' as changed_keeps_no;
select status, entry_number, (select sum(debit) from fiduciary_ext_entry_lines where entry_id = e.id) as amount
from fiduciary_ext_entries e where external_client_id = :'ext_l' and label = 'Fournitures bureau' order by created_at;

\echo '--- L4. reversal: new numbered entry with swapped lines; no second reversal, no change after'
select public.acc_ext_save_entry(:'ext_l', null, '2026-02-20', 'Erreur de saisie', null,
  '[{"account_code":"6500","debit":50},{"account_code":"1020","credit":50}]') ->> 'id' as wrong \gset
select public.acc_ext_entry_action(:'wrong', 'reverse') ->> 'entry_number' as reversal_no;
select public.acc_ext_entry_action(:'wrong', 'reverse');
select public.acc_ext_save_entry(:'ext_l', :'wrong', '2026-02-20', 'Erreur', null, '[{"account_code":"6500","debit":5},{"account_code":"1020","credit":5}]');
select r ->> 'label' as label, x ->> 'account_code' as account, x ->> 'debit' as debit, x ->> 'credit' as credit
from jsonb_array_elements(public.acc_ext_entries(:'ext_l', null, null, 'posted', '6500') -> 'rows') r, jsonb_array_elements(r -> 'lines') x
where r ->> 'label' like '%rreur%' order by label, account;

\echo '--- L5. import (Banana-like): an unknown account is created; one bad entry and nothing is imported'
select public.acc_ext_import_entries(:'ext_l', '[
  {"date":"2026-03-01","reference":"I1","label":"Loyer mars","lines":[{"account_code":"6000","debit":2000},{"account_code":"1020","credit":2000}]},
  {"date":"2026-03-02","reference":"I2","label":"Abo logiciel","lines":[{"account_code":"6575","account_label":"Abonnements","debit":80},{"account_code":"1020","credit":80}]}
]') as imported;
select code, label, type from fiduciary_ext_accounts where external_client_id = :'ext_l' and code = '6575';
select public.acc_ext_import_entries(:'ext_l', '[
  {"date":"2026-03-03","label":"Bon","lines":[{"account_code":"6000","debit":10},{"account_code":"1020","credit":10}]},
  {"date":"2026-03-04","label":"Mauvais","lines":[{"account_code":"6000","debit":10},{"account_code":"1020","credit":9}]}
]');
select count(*) as entries_posted from fiduciary_ext_entries where external_client_id = :'ext_l' and status = 'posted';

\echo '--- L6. reports: trial balance Feb–Mar 2026, statements (balance sheet balances), VAT, indicators, portfolio'
select x ->> 'code' as code, x ->> 'opening' as opening, x ->> 'debit' as debit, x ->> 'credit' as credit, x ->> 'closing' as closing
from jsonb_array_elements(public.acc_ext_trial_balance(:'ext_l', '2026-02-01', '2026-03-31')) x;
select s ->> 'result' as result, s ->> 'year_result' as year_result, s ->> 'prior_results' as prior,
  (select sum((a ->> 'amount')::numeric) from jsonb_array_elements(s -> 'assets') a) as assets,
  (select sum((a ->> 'amount')::numeric) from jsonb_array_elements(s -> 'liabilities') a) as liabilities
from (select public.acc_ext_statements(:'ext_l', '2026-03-31') as s) t;
select public.acc_ext_vat_summary(:'ext_l', '2026-01-01', '2026-03-31') as vat;
select k -> 'current' ->> 'revenue' as revenue, k -> 'current' ->> 'opex' as opex, k -> 'previous' ->> 'revenue' as prev_revenue,
  k -> 'balance' ->> 'liquid' as liquid, k -> 'balance' ->> 'receivables' as receivables, k -> 'balance' ->> 'short_term_debt' as st_debt
from (select public.acc_ext_kpis(:'ext_l', '2026-03-31') as k) t;
select x ->> 'software' as software, (x -> 'kpis') is not null as has_kpis from jsonb_array_elements(public.acc_portfolio()) x where x ->> 'name' = 'Garage Ohne Cantia GmbH';
select x ->> 'opening' as opening_1020, jsonb_array_length(x -> 'rows') as moves_1020, x -> 'rows' -> -1 ->> 'balance' as end_1020
from (select public.acc_ext_account_ledger(:'ext_l', '1020', '2026-02-01', '2026-03-31') as x) t;

\echo '--- L7. lock: members cannot; drafts block it; locked period refuses entries and changes, reversal must be dated after'
select public.acc_ext_set_lock(:'ext_l', '2026-02-28');
set test.uid = '00000000-0000-0000-0000-0000000000f1';
select public.acc_ext_save_entry(:'ext_l', null, '2026-02-25', 'Brouillon oublié', null, '[{"account_code":"6500","debit":1},{"account_code":"1020","credit":1}]', false) ->> 'id' as forgotten \gset
select public.acc_ext_set_lock(:'ext_l', '2026-02-28');
select public.acc_ext_entry_action(:'forgotten', 'discard') ->> 'id' is not null as discarded;
select public.acc_ext_set_lock(:'ext_l', '2026-02-28');
select public.acc_ext_save_entry(:'ext_l', null, '2026-02-27', 'Trop tard', null, '[{"account_code":"6500","debit":1},{"account_code":"1020","credit":1}]');
select public.acc_ext_entry_action((select id from fiduciary_ext_entries where external_client_id = :'ext_l' and reference = 'F101'), 'reverse');
select public.acc_ext_entry_action((select id from fiduciary_ext_entries where external_client_id = :'ext_l' and reference = 'F101'), 'reverse', '2026-03-31') ->> 'entry_number' as reversal_after_lock;

\echo '--- L8. firm B reads nothing and writes nothing'
set test.uid = '00000000-0000-0000-0000-0000000000f3';
select count(*) as b_entries from fiduciary_ext_entries;
select public.acc_ext_entries(:'ext_l');
select public.acc_ext_trial_balance(:'ext_l', '2026-01-01', '2026-12-31');
select public.acc_ext_import_entries(:'ext_l', '[{"date":"2026-04-01","label":"x","lines":[{"account_code":"6000","debit":1},{"account_code":"1020","credit":1}]}]');
reset role;
