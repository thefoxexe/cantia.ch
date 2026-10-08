-- Cantia Accounting, books of clients outside Cantia (on top of
-- 20261009090000_fiduciary_ledger.sql): the annual closing and the VAT
-- returns.
--
-- Closing a fiscal year books one entry dated its last day that brings
-- every income and expense account to zero against 2979 (profit / loss of
-- the year), optionally carries it forward to 2970 on the first day of the
-- next year, and locks the year. The income statement of that year stays
-- readable: closing entries are left out of the income figures and kept in
-- the balance sheet. Reopening keeps both entries (status 'replaced').
--
-- Filing a VAT return stores the AFC figures and books the settlement
-- entry (2200 / 1170 / 1171 → 2201), marks the deadline done and may lock
-- the period. Cancelling keeps everything (status 'cancelled' / 'replaced').
--
-- Nothing is ever removed.

alter table public.fiduciary_ext_entries
  add column if not exists closing_fy_end date,
  add column if not exists vat_return_id uuid;

create table if not exists public.fiduciary_ext_closings (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.fiduciary_firms(id) on delete cascade,
  external_client_id uuid not null references public.fiduciary_external_clients(id) on delete cascade,
  fy_start date not null,
  fy_end date not null,
  result numeric(14, 2) not null default 0,
  entry_id uuid references public.fiduciary_ext_entries(id) on delete set null,
  carry_entry_id uuid references public.fiduciary_ext_entries(id) on delete set null,
  status text not null default 'closed' check (status in ('closed', 'reopened')),
  closed_by uuid references auth.users(id) on delete set null default auth.uid(),
  closed_at timestamptz not null default now(),
  reopened_by uuid references auth.users(id) on delete set null,
  reopened_at timestamptz
);
create unique index if not exists fiduciary_ext_closings_one on public.fiduciary_ext_closings (external_client_id, fy_end) where status = 'closed';

create table if not exists public.fiduciary_ext_vat_returns (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.fiduciary_firms(id) on delete cascade,
  external_client_id uuid not null references public.fiduciary_external_clients(id) on delete cascade,
  period_start date not null,
  period_end date not null check (period_end >= period_start),
  period_key text not null check (length(period_key) between 4 and 16),
  method text not null default 'effective' check (method in ('effective', 'tdfn')),
  figures jsonb not null default '{}'::jsonb,
  adjustments jsonb not null default '{}'::jsonb,
  payable numeric(14, 2) not null default 0,
  entry_id uuid references public.fiduciary_ext_entries(id) on delete set null,
  status text not null default 'filed' check (status in ('filed', 'cancelled')),
  filed_by uuid references auth.users(id) on delete set null default auth.uid(),
  filed_at timestamptz not null default now(),
  cancelled_by uuid references auth.users(id) on delete set null,
  cancelled_at timestamptz
);
create unique index if not exists fiduciary_ext_vat_returns_one on public.fiduciary_ext_vat_returns (external_client_id, period_start) where status = 'filed';

alter table public.fiduciary_ext_closings enable row level security;
alter table public.fiduciary_ext_vat_returns enable row level security;
create policy "firm reads its client closings" on public.fiduciary_ext_closings
  for select using (firm_id = public.my_fiduciary_firm_id());
create policy "firm reads its client vat returns" on public.fiduciary_ext_vat_returns
  for select using (firm_id = public.my_fiduciary_firm_id());
grant select on public.fiduciary_ext_closings, public.fiduciary_ext_vat_returns to authenticated;

-- An account of the client, created when missing (closing and VAT
-- settlement need 2979, 2970 and 2201 even with an imported chart).
create or replace function public.fiduciary_ext_account_id(p_ext uuid, p_firm uuid, p_code text, p_fr text, p_de text, p_it text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
  v_locale text;
begin
  select id into v_id from public.fiduciary_ext_accounts where external_client_id = p_ext and code = p_code;
  if v_id is null then
    select locale into v_locale from public.fiduciary_external_clients where id = p_ext;
    insert into public.fiduciary_ext_accounts (firm_id, external_client_id, code, label, type)
    values (p_firm, p_ext, p_code, case v_locale when 'de' then p_de when 'it' then p_it else p_fr end, public.fiduciary_ext_type_of(p_code))
    returning id into v_id;
  end if;
  return v_id;
end;
$$;
revoke execute on function public.fiduciary_ext_account_id(uuid, uuid, text, text, text, text) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Entries written by the closing or a VAT return are changed only by
-- reopening the year / cancelling the return.

create or replace function public.acc_ext_save_entry(
  p_ext uuid, p_id uuid, p_date date, p_label text, p_reference text, p_lines jsonb, p_post boolean default true
)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.fiduciary_ext_assert_open(p_ext, p_date);
  v_old public.fiduciary_ext_entries%rowtype;
  v_lines jsonb;
  v_id uuid;
  v_post boolean := coalesce(p_post, true);
begin
  if coalesce(trim(p_label), '') = '' then raise exception 'Libellé manquant'; end if;
  v_lines := public.fiduciary_ext_resolve_lines(p_ext, v_firm, p_lines, false);
  if p_id is not null then
    select * into v_old from public.fiduciary_ext_entries where id = p_id and external_client_id = p_ext for update;
    if not found then raise exception 'Écriture introuvable'; end if;
    if v_old.closing_fy_end is not null or v_old.vat_return_id is not null then
      raise exception 'Écriture passée par le bouclement ou le décompte TVA : rouvrez l''exercice ou annulez le décompte pour la changer';
    end if;
    if v_old.status not in ('draft', 'posted') then raise exception 'Cette écriture a déjà été modifiée'; end if;
    if v_old.status = 'posted' then
      perform public.fiduciary_ext_assert_open(p_ext, v_old.entry_date);
      if v_old.reversed_by_entry_id is not null or v_old.reverses_entry_id is not null then raise exception 'Une écriture extournée ne se modifie plus'; end if;
      v_post := true;
    end if;
    update public.fiduciary_ext_entries set status = case when status = 'draft' then 'discarded' else 'replaced' end where id = p_id;
    v_id := public.fiduciary_ext_insert_entry(p_ext, v_firm, p_date, p_label, p_reference, v_lines, v_old.source, v_post,
      case when v_old.status = 'posted' then v_old.entry_number end, p_id, null);
    if v_old.status = 'posted' then
      perform public.fiduciary_audit(v_firm, null, 'ledger_entry_changed', jsonb_build_object('external_client_id', p_ext, 'number', v_old.entry_number, 'old_entry_id', p_id, 'new_entry_id', v_id));
    end if;
  else
    v_id := public.fiduciary_ext_insert_entry(p_ext, v_firm, p_date, p_label, p_reference, v_lines, 'manual', v_post);
  end if;
  return jsonb_build_object('id', v_id, 'entry_number', (select entry_number from public.fiduciary_ext_entries where id = v_id));
end;
$$;
revoke execute on function public.acc_ext_save_entry(uuid, uuid, date, text, text, jsonb, boolean) from public, anon;
grant execute on function public.acc_ext_save_entry(uuid, uuid, date, text, text, jsonb, boolean) to authenticated;

create or replace function public.acc_ext_entry_action(p_id uuid, p_action text, p_date date default null)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_e public.fiduciary_ext_entries%rowtype;
  v_firm uuid;
  v_lines jsonb;
  v_new uuid;
  v_number int;
begin
  select * into v_e from public.fiduciary_ext_entries where id = p_id for update;
  if not found then raise exception 'Écriture introuvable'; end if;
  v_firm := public.acc_assert_ext(v_e.external_client_id);
  if v_e.closing_fy_end is not null or v_e.vat_return_id is not null then
    raise exception 'Écriture passée par le bouclement ou le décompte TVA : rouvrez l''exercice ou annulez le décompte pour la changer';
  end if;
  if p_action = 'post' then
    if v_e.status <> 'draft' then raise exception 'Seul un brouillon se comptabilise'; end if;
    perform public.fiduciary_ext_assert_open(v_e.external_client_id, v_e.entry_date);
    perform 1 from public.fiduciary_external_clients where id = v_e.external_client_id for update;
    select coalesce(max(entry_number), 0) + 1 into v_number from public.fiduciary_ext_entries where external_client_id = v_e.external_client_id and entry_number is not null;
    update public.fiduciary_ext_entries set status = 'posted', entry_number = v_number, posted_at = now(), posted_by = auth.uid() where id = p_id;
    return jsonb_build_object('id', p_id, 'entry_number', v_number);
  elsif p_action = 'discard' then
    if v_e.status <> 'draft' then raise exception 'Seul un brouillon se supprime ; extournez une écriture comptabilisée'; end if;
    update public.fiduciary_ext_entries set status = 'discarded' where id = p_id;
    return jsonb_build_object('id', p_id);
  elsif p_action = 'reverse' then
    if v_e.status <> 'posted' then raise exception 'Seule une écriture comptabilisée s''extourne'; end if;
    if v_e.reversed_by_entry_id is not null then raise exception 'Écriture déjà extournée'; end if;
    if v_e.reverses_entry_id is not null then raise exception 'Une extourne ne s''extourne pas'; end if;
    perform public.fiduciary_ext_assert_open(v_e.external_client_id, coalesce(p_date, v_e.entry_date));
    select coalesce(jsonb_agg(jsonb_build_object('account_id', l.account_id, 'debit', l.credit, 'credit', l.debit, 'label', l.label, 'vat_code', l.vat_code) order by l.sort_order), '[]'::jsonb)
    into v_lines from public.fiduciary_ext_entry_lines l where l.entry_id = p_id;
    v_new := public.fiduciary_ext_insert_entry(v_e.external_client_id, v_firm, coalesce(p_date, v_e.entry_date),
      left('Extourne : ' || v_e.label, 200), v_e.reference, v_lines, 'reversal', true, null, null, p_id);
    update public.fiduciary_ext_entries set reversed_by_entry_id = v_new where id = p_id;
    perform public.fiduciary_audit(v_firm, null, 'ledger_entry_reversed', jsonb_build_object('external_client_id', v_e.external_client_id, 'number', v_e.entry_number));
    return jsonb_build_object('id', v_new, 'entry_number', (select entry_number from public.fiduciary_ext_entries where id = v_new));
  end if;
  raise exception 'Action inconnue';
end;
$$;
revoke execute on function public.acc_ext_entry_action(uuid, text, date) from public, anon;
grant execute on function public.acc_ext_entry_action(uuid, text, date) to authenticated;

-- The journal, with 'system' = 'closing' / 'vat' for the entries written
-- by the closing or a VAT return.
create or replace function public.acc_ext_entries(
  p_ext uuid, p_from date default null, p_to date default null, p_status text default 'all', p_account text default null,
  p_search text default null, p_limit integer default 200, p_offset integer default 0
)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_firm uuid := public.acc_assert_ext(p_ext);
  v_total int;
  v_rows jsonb;
  v_q text := nullif(trim(coalesce(p_search, '')), '');
begin
  with base as (
    select e.* from public.fiduciary_ext_entries e
    where e.external_client_id = p_ext
      and (case coalesce(p_status, 'all') when 'all' then e.status in ('draft', 'posted') else e.status = p_status end)
      and (p_from is null or e.entry_date >= p_from) and (p_to is null or e.entry_date <= p_to)
      and (p_account is null or exists (select 1 from public.fiduciary_ext_entry_lines l join public.fiduciary_ext_accounts a on a.id = l.account_id where l.entry_id = e.id and a.code = p_account))
      and (v_q is null or e.label ilike '%' || v_q || '%' or coalesce(e.reference, '') ilike '%' || v_q || '%' or e.entry_number::text = v_q
           or exists (select 1 from public.fiduciary_ext_entry_lines l where l.entry_id = e.id and (coalesce(l.label, '') ilike '%' || v_q || '%' or to_char(greatest(l.debit, l.credit), 'FM999999999990.00') = replace(replace(v_q, '''', ''), ',', '.'))))
  )
  select (select count(*) from base),
    coalesce((select jsonb_agg(x order by (x ->> 'entry_date') desc, (x ->> 'entry_number')::int desc nulls first, x ->> 'created_at' desc) from (
      select jsonb_build_object(
        'id', b.id, 'entry_number', b.entry_number, 'entry_date', b.entry_date, 'label', b.label, 'reference', b.reference,
        'status', b.status, 'source', b.source, 'created_at', b.created_at, 'changed', b.replaces_entry_id is not null,
        'reverses_entry_id', b.reverses_entry_id, 'reversed_by_entry_id', b.reversed_by_entry_id,
        'system', case when b.closing_fy_end is not null then 'closing' when b.vat_return_id is not null then 'vat' end,
        'created_by_name', public.acc_member_name(v_firm, b.created_by),
        'amount', (select sum(l.debit) from public.fiduciary_ext_entry_lines l where l.entry_id = b.id),
        'lines', (select jsonb_agg(jsonb_build_object('account_code', a.code, 'account_label', a.label, 'debit', l.debit, 'credit', l.credit, 'label', l.label, 'vat_code', l.vat_code) order by l.sort_order)
                  from public.fiduciary_ext_entry_lines l join public.fiduciary_ext_accounts a on a.id = l.account_id where l.entry_id = b.id)
      ) as x
      from base b
      order by b.entry_date desc, b.entry_number desc nulls first, b.created_at desc
      limit least(greatest(coalesce(p_limit, 200), 1), 2000) offset greatest(coalesce(p_offset, 0), 0)
    ) t), '[]'::jsonb)
  into v_total, v_rows;
  return jsonb_build_object('total', v_total, 'rows', v_rows);
end;
$$;
revoke execute on function public.acc_ext_entries(uuid, date, date, text, text, text, integer, integer) from public, anon;
grant execute on function public.acc_ext_entries(uuid, date, date, text, text, text, integer, integer) to authenticated;

-- Balance sheet and income statement: closing entries count in the balance
-- sheet (2979 / 2970) and in year_result / prior_results, not in the income
-- and expense lines, so a closed year still shows its income statement.
create or replace function public.acc_ext_statements(p_ext uuid, p_to date, p_from date default null)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_fy date;
  v_from date;
begin
  perform public.acc_assert_ext(p_ext);
  v_fy := public.fiduciary_ext_fy_start(p_ext, p_to);
  v_from := greatest(coalesce(p_from, v_fy), v_fy);
  return (
    with bal as (
      select a.code, a.label, a.type,
        coalesce(sum(l.debit - l.credit) filter (where a.type in ('actif', 'passif')), 0) as bs,
        coalesce(sum(l.debit - l.credit) filter (where a.type in ('produit', 'charge') and e.entry_date between v_from and p_to and e.closing_fy_end is null), 0) as pl,
        coalesce(sum(l.debit - l.credit) filter (where a.type in ('produit', 'charge') and e.entry_date between v_fy and p_to), 0) as year_all,
        coalesce(sum(l.debit - l.credit) filter (where a.type in ('produit', 'charge') and e.entry_date < v_fy), 0) as prior
      from public.fiduciary_ext_accounts a
      join public.fiduciary_ext_entry_lines l on l.account_id = a.id
      join public.fiduciary_ext_entries e on e.id = l.entry_id and e.status = 'posted' and e.entry_date <= p_to
      where a.external_client_id = p_ext
      group by a.code, a.label, a.type
    )
    select jsonb_build_object(
      'from', v_from, 'to', p_to, 'fy_start', v_fy,
      'assets', coalesce((select jsonb_agg(jsonb_build_object('code', code, 'label', label, 'amount', bs) order by code) from bal where type = 'actif' and bs <> 0), '[]'::jsonb),
      'liabilities', coalesce((select jsonb_agg(jsonb_build_object('code', code, 'label', label, 'amount', -bs) order by code) from bal where type = 'passif' and bs <> 0), '[]'::jsonb),
      'income', coalesce((select jsonb_agg(jsonb_build_object('code', code, 'label', label, 'amount', -pl) order by code) from bal where type = 'produit' and pl <> 0), '[]'::jsonb),
      'expenses', coalesce((select jsonb_agg(jsonb_build_object('code', code, 'label', label, 'amount', pl) order by code) from bal where type = 'charge' and pl <> 0), '[]'::jsonb),
      'result', coalesce((select -sum(pl) from bal), 0),
      'year_result', coalesce((select -sum(year_all) from bal), 0),
      'prior_results', coalesce((select -sum(prior) from bal), 0),
      'closed', exists (select 1 from public.fiduciary_ext_closings c where c.external_client_id = p_ext and c.status = 'closed' and c.fy_end between v_fy and p_to)
    )
  );
end;
$$;
revoke execute on function public.acc_ext_statements(uuid, date, date) from public, anon;
grant execute on function public.acc_ext_statements(uuid, date, date) to authenticated;

-- VAT summary of a period, without the settlement entries of filed returns
-- nor the closing: net per VAT code, VAT due on 2200, input tax on 1170
-- (material, services) and 1171 (investments, other costs).
create or replace function public.acc_ext_vat_summary(p_ext uuid, p_from date, p_to date)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.acc_assert_ext(p_ext);
  return (
    with mv as (
      select a.code, a.type, l.debit, l.credit, l.vat_code
      from public.fiduciary_ext_entry_lines l
      join public.fiduciary_ext_entries e on e.id = l.entry_id and e.status = 'posted'
      join public.fiduciary_ext_accounts a on a.id = l.account_id
      where e.external_client_id = p_ext and e.entry_date between p_from and p_to
        and e.vat_return_id is null and e.closing_fy_end is null and e.source <> 'opening'
    )
    select jsonb_build_object(
      'codes', coalesce((
        select jsonb_agg(jsonb_build_object('vat_code', x.vat_code, 'net', x.net, 'lines', x.n) order by x.vat_code)
        from (
          select vat_code, round(sum(case when type in ('produit', 'passif') then credit - debit else debit - credit end), 2) as net, count(*) as n
          from mv where vat_code is not null and code not in ('2200', '1170', '1171')
          group by vat_code
        ) x
      ), '[]'::jsonb),
      'vat_due', coalesce((select round(sum(credit - debit), 2) from mv where code = '2200'), 0),
      'input_tax', coalesce((select round(sum(debit - credit), 2) from mv where code in ('1170', '1171')), 0),
      'input_material', coalesce((select round(sum(debit - credit), 2) from mv where code = '1170'), 0),
      'input_invest', coalesce((select round(sum(debit - credit), 2) from mv where code = '1171'), 0)
    )
  );
end;
$$;
revoke execute on function public.acc_ext_vat_summary(uuid, date, date) from public, anon;
grant execute on function public.acc_ext_vat_summary(uuid, date, date) to authenticated;

-- Indicators: income figures without the closing entries.
create or replace function public.fiduciary_ext_kpis(p_ext uuid, p_as_of date)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_from date := public.fiduciary_ext_fy_start(p_ext, p_as_of);
  v_prev_from date;
  v_prev_to date;
  v_cur jsonb;
  v_prev jsonb;
  v_bal jsonb;
  v_monthly jsonb;
begin
  v_prev_from := (v_from - interval '1 year')::date;
  v_prev_to := (p_as_of - interval '1 year')::date;

  with lines as (
    select a.code, e.entry_date, l.debit, l.credit
    from public.fiduciary_ext_entry_lines l
    join public.fiduciary_ext_entries e on e.id = l.entry_id
    join public.fiduciary_ext_accounts a on a.id = l.account_id
    where e.external_client_id = p_ext and e.status = 'posted' and e.entry_date <= p_as_of and e.closing_fy_end is null
  ),
  pl as (
    select (entry_date >= v_from) as cur,
      round(sum(credit - debit) filter (where code like '3%'), 2) as revenue,
      round(sum(debit - credit) filter (where code like '4%'), 2) as material,
      round(sum(debit - credit) filter (where code like '5%'), 2) as personnel,
      round(sum(debit - credit) filter (where code like '6%' and code not like '68%' and code not like '69%'), 2) as opex,
      round(sum(debit - credit) filter (where code like '68%'), 2) as depreciation,
      round(sum(debit - credit) filter (where code like '69%'), 2) as financial,
      round(sum(debit - credit) filter (where code like '7%' or (code like '8%' and code not like '89%')), 2) as other,
      round(sum(debit - credit) filter (where code like '89%'), 2) as taxes,
      count(*) as lines
    from lines
    where (entry_date between v_from and p_as_of) or (entry_date between v_prev_from and v_prev_to)
    group by 1
  )
  select
    (select to_jsonb(p) - 'cur' from pl p where cur),
    (select to_jsonb(p) - 'cur' from pl p where not cur)
  into v_cur, v_prev;

  with lines as (
    select a.code, l.debit, l.credit
    from public.fiduciary_ext_entry_lines l
    join public.fiduciary_ext_entries e on e.id = l.entry_id
    join public.fiduciary_ext_accounts a on a.id = l.account_id
    where e.external_client_id = p_ext and e.status = 'posted' and e.entry_date <= p_as_of
  )
  select jsonb_build_object(
    'liquid', round(coalesce(sum(debit - credit) filter (where code like '10%'), 0), 2),
    'receivables', round(coalesce(sum(debit - credit) filter (where code like '11%'), 0), 2),
    'inventory', round(coalesce(sum(debit - credit) filter (where code like '12%'), 0), 2),
    'current_assets', round(coalesce(sum(debit - credit) filter (where left(code, 2) in ('10', '11', '12', '13')), 0), 2),
    'total_assets', round(coalesce(sum(debit - credit) filter (where code like '1%'), 0), 2),
    'short_term_debt', round(coalesce(sum(credit - debit) filter (where left(code, 2) in ('20', '21', '22', '23')), 0), 2),
    'long_term_debt', round(coalesce(sum(credit - debit) filter (where left(code, 2) in ('24', '25', '26', '27')), 0), 2)
  ) into v_bal from lines;

  select coalesce(jsonb_agg(jsonb_build_object('month', to_char(mm, 'YYYY-MM'), 'revenue', coalesce(x.revenue, 0), 'result', coalesce(x.result, 0)) order by mm), '[]'::jsonb)
  into v_monthly
  from generate_series(date_trunc('month', p_as_of) - interval '11 months', date_trunc('month', p_as_of), interval '1 month') mm
  left join lateral (
    select round(sum(l.credit - l.debit) filter (where a.code like '3%'), 2) as revenue,
           round(sum(l.credit - l.debit) filter (where left(a.code, 1) in ('3', '4', '5', '6', '7', '8')), 2) as result
    from public.fiduciary_ext_entry_lines l
    join public.fiduciary_ext_entries e on e.id = l.entry_id
    join public.fiduciary_ext_accounts a on a.id = l.account_id
    where e.external_client_id = p_ext and e.status = 'posted' and e.closing_fy_end is null
      and e.entry_date >= mm and e.entry_date < mm + interval '1 month'
  ) x on true;

  return jsonb_build_object(
    'period', jsonb_build_object('from', v_from, 'to', p_as_of, 'prev_from', v_prev_from, 'prev_to', v_prev_to),
    'current', coalesce(v_cur, '{}'::jsonb),
    'previous', coalesce(v_prev, '{}'::jsonb),
    'balance', v_bal,
    'monthly', v_monthly,
    'last_entry_date', (select max(entry_date) from public.fiduciary_ext_entries where external_client_id = p_ext and status = 'posted')
  );
end;
$$;
revoke execute on function public.fiduciary_ext_kpis(uuid, date) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Fiscal years and the annual closing

-- Every fiscal year from the first entry to today, with its state.
create or replace function public.acc_ext_years(p_ext uuid)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_first date;
  v_start date;
  v_end date;
  v_out jsonb := '[]'::jsonb;
  v_lock date;
  v_c public.fiduciary_ext_closings%rowtype;
  v_i int := 0;
begin
  perform public.acc_assert_ext(p_ext);
  select ledger_locked_until into v_lock from public.fiduciary_external_clients where id = p_ext;
  select min(entry_date) into v_first from public.fiduciary_ext_entries where external_client_id = p_ext and status in ('draft', 'posted');
  v_start := public.fiduciary_ext_fy_start(p_ext, least(coalesce(v_first, current_date), current_date));
  while v_start <= current_date and v_i < 60 loop
    v_i := v_i + 1;
    v_end := public.fiduciary_ext_fy_start(p_ext, (v_start + interval '1 year')::date) - 1;
    select * into v_c from public.fiduciary_ext_closings where external_client_id = p_ext and fy_end = v_end and status = 'closed';
    v_out := jsonb_build_array(jsonb_build_object(
      'start', v_start, 'end', v_end,
      'entries', (select count(*) from public.fiduciary_ext_entries where external_client_id = p_ext and status = 'posted' and entry_date between v_start and v_end and closing_fy_end is null),
      'drafts', (select count(*) from public.fiduciary_ext_entries where external_client_id = p_ext and status = 'draft' and entry_date between v_start and v_end),
      'result', coalesce((select -sum(l.debit - l.credit) from public.fiduciary_ext_entry_lines l
        join public.fiduciary_ext_entries e on e.id = l.entry_id join public.fiduciary_ext_accounts a on a.id = l.account_id
        where e.external_client_id = p_ext and e.status = 'posted' and e.closing_fy_end is null and e.entry_date between v_start and v_end
          and a.type in ('produit', 'charge')), 0),
      'closed', v_c.id is not null,
      'closed_at', v_c.closed_at,
      'closed_by_name', public.acc_member_name(v_c.firm_id, v_c.closed_by),
      'closing_number', (select entry_number from public.fiduciary_ext_entries where id = v_c.entry_id),
      'locked', v_lock is not null and v_lock >= v_end,
      'finished', v_end < current_date
    )) || v_out;
    v_start := v_end + 1;
  end loop;
  return v_out;
end;
$$;
revoke execute on function public.acc_ext_years(uuid) from public, anon;
grant execute on function public.acc_ext_years(uuid) to authenticated;

-- Close the fiscal year ending p_end: income and expenses to 2979, then
-- (p_carry) 2979 to 2970 on the next day, then (p_lock, admins) lock it.
create or replace function public.acc_ext_close_year(p_ext uuid, p_end date, p_carry boolean default true, p_lock boolean default true)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.acc_assert_ext(p_ext);
  v_c public.fiduciary_external_clients%rowtype;
  v_start date;
  v_lines jsonb := '[]'::jsonb;
  v_result numeric := 0;
  v_r record;
  v_entry uuid;
  v_carry uuid;
  v_acc_2979 uuid;
  v_acc_2970 uuid;
  v_year text;
begin
  select * into v_c from public.fiduciary_external_clients where id = p_ext for update;
  if v_c.ledger_started_at is null then raise exception 'Ouvrez d''abord la comptabilité de ce mandant'; end if;
  if p_end is null or public.fiduciary_ext_fy_start(p_ext, p_end + 1) <> p_end + 1 then raise exception 'Date de fin d''exercice invalide'; end if;
  if p_end >= current_date then raise exception 'L''exercice n''est pas encore terminé'; end if;
  if p_lock and public.my_fiduciary_role() not in ('OWNER', 'ADMIN') then raise exception 'Réservé aux administrateurs (clôture de la période)'; end if;
  v_start := public.fiduciary_ext_fy_start(p_ext, p_end);
  v_year := case when extract(year from v_start) = extract(year from p_end) then to_char(p_end, 'YYYY') else to_char(v_start, 'YYYY') || '/' || to_char(p_end, 'YY') end;
  if exists (select 1 from public.fiduciary_ext_closings where external_client_id = p_ext and fy_end = p_end and status = 'closed') then
    raise exception 'Exercice déjà bouclé';
  end if;
  if exists (select 1 from public.fiduciary_ext_entries where external_client_id = p_ext and status = 'draft' and entry_date between v_start and p_end) then
    raise exception 'Des brouillons restent dans l''exercice : comptabilisez-les ou supprimez-les d''abord';
  end if;
  -- A later period may already be locked (VAT of the next quarter): the
  -- closing entries are written by the system and do not need it open.

  for v_r in
    select a.id, round(sum(l.debit - l.credit), 2) as bal
    from public.fiduciary_ext_entry_lines l
    join public.fiduciary_ext_entries e on e.id = l.entry_id
    join public.fiduciary_ext_accounts a on a.id = l.account_id
    where e.external_client_id = p_ext and e.status = 'posted' and e.closing_fy_end is null and e.entry_date between v_start and p_end
      and a.type in ('produit', 'charge')
    group by a.id, a.code
    having round(sum(l.debit - l.credit), 2) <> 0
    order by a.code
  loop
    v_lines := v_lines || jsonb_build_array(jsonb_build_object('account_id', v_r.id,
      'debit', case when v_r.bal < 0 then -v_r.bal else 0 end, 'credit', case when v_r.bal > 0 then v_r.bal else 0 end, 'label', null, 'vat_code', null));
    v_result := v_result - v_r.bal;
  end loop;

  if jsonb_array_length(v_lines) > 0 then
    v_acc_2979 := public.fiduciary_ext_account_id(p_ext, v_firm, '2979', 'Bénéfice / perte de l''exercice', 'Jahresgewinn / Jahresverlust', 'Utile / perdita d''esercizio');
    if v_result <> 0 then
      v_lines := v_lines || jsonb_build_array(jsonb_build_object('account_id', v_acc_2979,
        'debit', case when v_result < 0 then -v_result else 0 end, 'credit', case when v_result > 0 then v_result else 0 end, 'label', null, 'vat_code', null));
    end if;
    v_entry := public.fiduciary_ext_insert_entry(p_ext, v_firm, p_end,
      'Bouclement ' || v_year || ' : ' || case when v_result >= 0 then 'bénéfice' else 'perte' end || ' de l''exercice', 'BOUCL-' || v_year,
      v_lines, 'manual', true);
    update public.fiduciary_ext_entries set closing_fy_end = p_end where id = v_entry;

    if coalesce(p_carry, true) and v_result <> 0 then
      v_acc_2970 := public.fiduciary_ext_account_id(p_ext, v_firm, '2970', 'Bénéfice / perte reporté', 'Gewinnvortrag / Verlustvortrag', 'Utile / perdita riportato');
      v_carry := public.fiduciary_ext_insert_entry(p_ext, v_firm, p_end + 1, 'Report à nouveau du résultat ' || v_year, 'BOUCL-' || v_year,
        jsonb_build_array(
          jsonb_build_object('account_id', v_acc_2979, 'debit', case when v_result > 0 then v_result else 0 end, 'credit', case when v_result < 0 then -v_result else 0 end, 'label', null, 'vat_code', null),
          jsonb_build_object('account_id', v_acc_2970, 'debit', case when v_result < 0 then -v_result else 0 end, 'credit', case when v_result > 0 then v_result else 0 end, 'label', null, 'vat_code', null)
        ), 'manual', true);
      update public.fiduciary_ext_entries set closing_fy_end = p_end where id = v_carry;
    end if;
  end if;

  insert into public.fiduciary_ext_closings (firm_id, external_client_id, fy_start, fy_end, result, entry_id, carry_entry_id)
  values (v_firm, p_ext, v_start, p_end, v_result, v_entry, v_carry);

  if p_lock then
    update public.fiduciary_external_clients set ledger_locked_until = greatest(coalesce(ledger_locked_until, p_end), p_end), updated_at = now() where id = p_ext;
  end if;

  insert into public.fiduciary_external_deadline_status (firm_id, external_client_id, kind, period_key, status, updated_by, updated_at)
  values (v_firm, p_ext, 'closing', to_char(p_end, 'YYYY'), 'done', auth.uid(), now())
  on conflict (external_client_id, kind, period_key) do update set status = 'done', updated_by = auth.uid(), updated_at = now();

  perform public.fiduciary_audit(v_firm, null, 'ledger_year_closed', jsonb_build_object('external_client_id', p_ext, 'fy_end', p_end, 'result', v_result));
  return jsonb_build_object('result', v_result,
    'entry_number', (select entry_number from public.fiduciary_ext_entries where id = v_entry),
    'carry_number', (select entry_number from public.fiduciary_ext_entries where id = v_carry));
end;
$$;
revoke execute on function public.acc_ext_close_year(uuid, date, boolean, boolean) from public, anon;
grant execute on function public.acc_ext_close_year(uuid, date, boolean, boolean) to authenticated;

-- Reopen a closed year (admins): its closing entries are kept as
-- 'replaced', the lock goes back before the year.
create or replace function public.acc_ext_reopen_year(p_ext uuid, p_end date)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.acc_assert_ext(p_ext);
  v_c public.fiduciary_ext_closings%rowtype;
begin
  if public.my_fiduciary_role() not in ('OWNER', 'ADMIN') then raise exception 'Réservé aux administrateurs'; end if;
  select * into v_c from public.fiduciary_ext_closings where external_client_id = p_ext and fy_end = p_end and status = 'closed' for update;
  if not found then raise exception 'Exercice non bouclé'; end if;
  if exists (select 1 from public.fiduciary_ext_closings where external_client_id = p_ext and fy_end > p_end and status = 'closed') then
    raise exception 'Rouvrez d''abord l''exercice suivant';
  end if;
  update public.fiduciary_ext_entries set status = 'replaced' where external_client_id = p_ext and closing_fy_end = p_end and status = 'posted';
  update public.fiduciary_ext_closings set status = 'reopened', reopened_by = auth.uid(), reopened_at = now() where id = v_c.id;
  update public.fiduciary_external_clients
  -- back to the end of the last year still closed (or no lock at all)
  set ledger_locked_until = case when ledger_locked_until >= v_c.fy_start
        then (select max(fy_end) from public.fiduciary_ext_closings where external_client_id = p_ext and status = 'closed' and fy_end < p_end)
        else ledger_locked_until end,
      updated_at = now()
  where id = p_ext;
  update public.fiduciary_external_deadline_status set status = 'in_progress', updated_by = auth.uid(), updated_at = now()
  where external_client_id = p_ext and kind = 'closing' and period_key = to_char(p_end, 'YYYY');
  perform public.fiduciary_audit(v_firm, null, 'ledger_year_reopened', jsonb_build_object('external_client_id', p_ext, 'fy_end', p_end));
end;
$$;
revoke execute on function public.acc_ext_reopen_year(uuid, date) from public, anon;
grant execute on function public.acc_ext_reopen_year(uuid, date) to authenticated;

-- ---------------------------------------------------------------------------
-- VAT returns

create or replace function public.acc_ext_vat_returns(p_ext uuid)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_firm uuid := public.acc_assert_ext(p_ext);
begin
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', r.id, 'period_start', r.period_start, 'period_end', r.period_end, 'period_key', r.period_key, 'method', r.method,
      'figures', r.figures, 'adjustments', r.adjustments, 'payable', r.payable, 'status', r.status, 'filed_at', r.filed_at,
      'filed_by_name', public.acc_member_name(v_firm, r.filed_by), 'cancelled_at', r.cancelled_at,
      'entry_number', (select entry_number from public.fiduciary_ext_entries where id = r.entry_id)
    ) order by r.period_start desc, r.filed_at desc)
    from public.fiduciary_ext_vat_returns r where r.external_client_id = p_ext
  ), '[]'::jsonb);
end;
$$;
revoke execute on function public.acc_ext_vat_returns(uuid) from public, anon;
grant execute on function public.acc_ext_vat_returns(uuid) to authenticated;

-- File the return of a period: the figures computed on screen (AFC form)
-- are stored; p_book books the settlement of the VAT accounts to 2201 on
-- the last day; the VAT deadline is marked done; p_lock (admins) locks the
-- period.
create or replace function public.acc_ext_file_vat_return(
  p_ext uuid, p_start date, p_end date, p_key text, p_method text, p_figures jsonb, p_adjustments jsonb, p_payable numeric,
  p_book boolean default true, p_lock boolean default false
)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.acc_assert_ext(p_ext);
  v_id uuid;
  v_entry uuid;
  v_due numeric;
  v_mat numeric;
  v_inv numeric;
  v_net numeric;
  v_lines jsonb := '[]'::jsonb;
  v_label text;
begin
  if p_start is null or p_end is null or p_end < p_start or p_end - p_start > 366 then raise exception 'Période invalide'; end if;
  if exists (select 1 from public.fiduciary_ext_vat_returns where external_client_id = p_ext and period_start = p_start and status = 'filed') then
    raise exception 'Décompte déjà déposé pour cette période';
  end if;
  insert into public.fiduciary_ext_vat_returns (firm_id, external_client_id, period_start, period_end, period_key, method, figures, adjustments, payable)
  values (v_firm, p_ext, p_start, p_end, left(p_key, 16), coalesce(p_method, 'effective'), coalesce(p_figures, '{}'::jsonb), coalesce(p_adjustments, '{}'::jsonb), coalesce(p_payable, 0))
  returning id into v_id;

  if coalesce(p_book, true) then
    perform public.fiduciary_ext_assert_open(p_ext, p_end);
    select
      coalesce(round(sum(l.credit - l.debit) filter (where a.code = '2200'), 2), 0),
      coalesce(round(sum(l.debit - l.credit) filter (where a.code = '1170'), 2), 0),
      coalesce(round(sum(l.debit - l.credit) filter (where a.code = '1171'), 2), 0)
    into v_due, v_mat, v_inv
    from public.fiduciary_ext_entry_lines l
    join public.fiduciary_ext_entries e on e.id = l.entry_id and e.status = 'posted'
    join public.fiduciary_ext_accounts a on a.id = l.account_id
    where e.external_client_id = p_ext and e.entry_date between p_start and p_end
      and e.vat_return_id is null and e.closing_fy_end is null and e.source <> 'opening' and a.code in ('2200', '1170', '1171');
    v_net := v_due - v_mat - v_inv;
    if v_due <> 0 then
      v_lines := v_lines || jsonb_build_array(jsonb_build_object('account_id', public.fiduciary_ext_account_id(p_ext, v_firm, '2200', 'TVA due', 'Geschuldete MWST', 'IVA dovuta'),
        'debit', greatest(v_due, 0), 'credit', greatest(-v_due, 0), 'label', null, 'vat_code', null));
    end if;
    if v_mat <> 0 then
      v_lines := v_lines || jsonb_build_array(jsonb_build_object('account_id', public.fiduciary_ext_account_id(p_ext, v_firm, '1170', 'Impôt préalable TVA (matériel, prestations)', 'Vorsteuer MWST Material, Waren, Dienstleistungen', 'Imposta precedente IVA (materiale, prestazioni)'),
        'debit', greatest(-v_mat, 0), 'credit', greatest(v_mat, 0), 'label', null, 'vat_code', null));
    end if;
    if v_inv <> 0 then
      v_lines := v_lines || jsonb_build_array(jsonb_build_object('account_id', public.fiduciary_ext_account_id(p_ext, v_firm, '1171', 'Impôt préalable TVA (investissements, autres charges)', 'Vorsteuer MWST Investitionen, übriger Betriebsaufwand', 'Imposta precedente IVA (investimenti, altri costi)'),
        'debit', greatest(-v_inv, 0), 'credit', greatest(v_inv, 0), 'label', null, 'vat_code', null));
    end if;
    if v_net <> 0 then
      v_lines := v_lines || jsonb_build_array(jsonb_build_object('account_id', public.fiduciary_ext_account_id(p_ext, v_firm, '2201', 'Décompte TVA', 'MWST-Abrechnungskonto', 'Conteggio IVA'),
        'debit', greatest(-v_net, 0), 'credit', greatest(v_net, 0), 'label', null, 'vat_code', null));
    end if;
    if jsonb_array_length(v_lines) >= 2 then
      v_label := 'Décompte TVA ' || to_char(p_start, 'DD.MM.YYYY') || ' – ' || to_char(p_end, 'DD.MM.YYYY');
      v_entry := public.fiduciary_ext_insert_entry(p_ext, v_firm, p_end, v_label, 'TVA-' || left(p_key, 16), v_lines, 'manual', true);
      update public.fiduciary_ext_entries set vat_return_id = v_id where id = v_entry;
      update public.fiduciary_ext_vat_returns set entry_id = v_entry where id = v_id;
    end if;
  end if;

  insert into public.fiduciary_external_deadline_status (firm_id, external_client_id, kind, period_key, status, updated_by, updated_at)
  values (v_firm, p_ext, 'vat', left(p_key, 16), 'done', auth.uid(), now())
  on conflict (external_client_id, kind, period_key) do update set status = 'done', updated_by = auth.uid(), updated_at = now();

  if coalesce(p_lock, false) then
    perform public.acc_ext_set_lock(p_ext, greatest(p_end, coalesce((select ledger_locked_until from public.fiduciary_external_clients where id = p_ext), p_end)));
  end if;

  perform public.fiduciary_audit(v_firm, null, 'vat_return_filed', jsonb_build_object('external_client_id', p_ext, 'period', p_key, 'payable', p_payable));
  return jsonb_build_object('id', v_id, 'entry_number', (select entry_number from public.fiduciary_ext_entries where id = v_entry));
end;
$$;
revoke execute on function public.acc_ext_file_vat_return(uuid, date, date, text, text, jsonb, jsonb, numeric, boolean, boolean) from public, anon;
grant execute on function public.acc_ext_file_vat_return(uuid, date, date, text, text, jsonb, jsonb, numeric, boolean, boolean) to authenticated;

-- Cancel a filed return: kept as 'cancelled', its settlement entry kept as
-- 'replaced' (the period must be open), the deadline back to in progress.
create or replace function public.acc_ext_cancel_vat_return(p_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_r public.fiduciary_ext_vat_returns%rowtype;
  v_firm uuid;
begin
  select * into v_r from public.fiduciary_ext_vat_returns where id = p_id for update;
  if not found or v_r.status <> 'filed' then raise exception 'Décompte introuvable'; end if;
  v_firm := public.acc_assert_ext(v_r.external_client_id);
  if v_r.entry_id is not null then
    perform public.fiduciary_ext_assert_open(v_r.external_client_id, v_r.period_end);
    update public.fiduciary_ext_entries set status = 'replaced' where id = v_r.entry_id and status = 'posted';
  end if;
  update public.fiduciary_ext_vat_returns set status = 'cancelled', cancelled_by = auth.uid(), cancelled_at = now() where id = p_id;
  update public.fiduciary_external_deadline_status set status = 'in_progress', updated_by = auth.uid(), updated_at = now()
  where external_client_id = v_r.external_client_id and kind = 'vat' and period_key = v_r.period_key;
  perform public.fiduciary_audit(v_firm, null, 'vat_return_cancelled', jsonb_build_object('external_client_id', v_r.external_client_id, 'period', v_r.period_key));
end;
$$;
revoke execute on function public.acc_ext_cancel_vat_return(uuid) from public, anon;
grant execute on function public.acc_ext_cancel_vat_return(uuid) to authenticated;

notify pgrst, 'reload schema';
