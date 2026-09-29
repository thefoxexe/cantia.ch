-- Cantia Fiduciaires, the working tools (what fiduciary portals are used
-- for day to day, beyond reading the books):
--
-- 1. Document requests: the firm asks a client for missing pieces (bank
--    statements, receipts, a contract...); the client answers in the app
--    (Paramètres › Fiduciaire) with files and a message.
-- 2. Deadlines per client: VAT returns, salary declarations, salary
--    certificates, tax return, annual closing. Generated from a small
--    profile per client (VAT method, payroll, fiscal year end), each one
--    tracked to done.
-- 3. Internal notes per client (never visible to the client).
--
-- Same rules as the foundation (20260929210000_accounting_foundation.sql):
-- nothing without an ACTIVE access, every write through a function,
-- everything logged in fiduciary_audit_log.

-- ---------------------------------------------------------------------------
-- Tables

create table public.fiduciary_client_profiles (
  firm_id uuid not null references public.fiduciary_firms(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  vat_method text not null default 'effective_quarterly'
    check (vat_method in ('none', 'effective_quarterly', 'effective_monthly', 'tdfn_semester', 'effective_annual')),
  has_payroll boolean not null default true,
  legal_form text not null default 'sarl' check (legal_form in ('individual', 'sarl', 'sa', 'other')),
  fiscal_year_end text not null default '12-31' check (fiscal_year_end ~ '^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$'),
  tax_return_due text not null default '03-31' check (tax_return_due ~ '^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$'),
  assigned_to uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (firm_id, organization_id)
);

create table public.fiduciary_deadline_status (
  firm_id uuid not null references public.fiduciary_firms(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  kind text not null check (kind in ('vat', 'salary_declaration', 'salary_certificates', 'tax_return', 'closing')),
  period_key text not null check (length(period_key) between 4 and 16),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  note text check (length(note) <= 500),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (firm_id, organization_id, kind, period_key)
);

create table public.fiduciary_requests (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.fiduciary_firms(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null check (length(trim(title)) between 2 and 160),
  details text check (length(details) <= 2000),
  due_date date,
  status text not null default 'open' check (status in ('open', 'answered', 'done', 'cancelled')),
  client_message text check (length(client_message) <= 2000),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  answered_at timestamptz,
  answered_by uuid references auth.users(id) on delete set null,
  closed_at timestamptz,
  last_reminded_at timestamptz
);
create index fiduciary_requests_firm_idx on public.fiduciary_requests (firm_id, status, due_date);
create index fiduciary_requests_org_idx on public.fiduciary_requests (organization_id, status, created_at desc);

create table public.fiduciary_request_files (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.fiduciary_requests(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  file_path text not null unique,
  file_name text not null check (length(file_name) <= 255),
  size_bytes bigint,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index fiduciary_request_files_request_idx on public.fiduciary_request_files (request_id);

create table public.fiduciary_client_notes (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.fiduciary_firms(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 4000),
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index fiduciary_client_notes_idx on public.fiduciary_client_notes (firm_id, organization_id, created_at desc);

alter table public.fiduciary_client_profiles enable row level security;
alter table public.fiduciary_deadline_status enable row level security;
alter table public.fiduciary_requests enable row level security;
alter table public.fiduciary_request_files enable row level security;
alter table public.fiduciary_client_notes enable row level security;

-- Reads. The firm: only its own rows, only for clients it currently has
-- access to. The client: its requests and files (never the firm's notes,
-- profiles or deadline tracking).
create policy "firm reads its client profiles" on public.fiduciary_client_profiles
  for select using (firm_id = public.my_fiduciary_firm_id() and organization_id in (select public.fiduciary_org_ids(null)));
create policy "firm reads its deadline tracking" on public.fiduciary_deadline_status
  for select using (firm_id = public.my_fiduciary_firm_id() and organization_id in (select public.fiduciary_org_ids(null)));
create policy "firm reads its requests" on public.fiduciary_requests
  for select using (firm_id = public.my_fiduciary_firm_id() and organization_id in (select public.fiduciary_org_ids(null)));
create policy "client reads requests addressed to it" on public.fiduciary_requests
  for select using (public.can_view_org_finances(organization_id));
create policy "firm reads request files" on public.fiduciary_request_files
  for select using (exists (
    select 1 from public.fiduciary_requests r
    where r.id = request_id and r.firm_id = public.my_fiduciary_firm_id() and r.organization_id in (select public.fiduciary_org_ids(null))
  ));
create policy "client reads its request files" on public.fiduciary_request_files
  for select using (public.can_view_org_finances(organization_id));
create policy "firm reads its notes" on public.fiduciary_client_notes
  for select using (firm_id = public.my_fiduciary_firm_id() and organization_id in (select public.fiduciary_org_ids(null)));

-- Files answered to a request: the client uploads them to its own folder
-- ({org}/fiduciary-requests/{request}/...), the firm may download exactly
-- those files, nothing else of the client's storage.
create policy "fiduciaries download request files" on storage.objects
  for select using (
    bucket_id = 'opus-storage'
    and public.is_uuid_like((storage.foldername(name))[1])
    and (storage.foldername(name))[2] = 'fiduciary-requests'
    and ((storage.foldername(name))[1])::uuid in (select public.fiduciary_org_ids(null))
    and exists (
      select 1 from public.fiduciary_request_files f
      join public.fiduciary_requests r on r.id = f.request_id
      where f.file_path = objects.name and r.firm_id = public.my_fiduciary_firm_id()
    )
  );

-- Notification types used below.
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in (
  'devis_stale_draft', 'devis_expiring_soon', 'facture_overdue',
  'recurring_expense_due', 'extra_work_accepted', 'feed_message', 'devis_accepted',
  'join_request_received', 'payslip_ready', 'devis_bounced', 'devis_viewed',
  'fiduciary_access_request', 'fiduciary_access_update', 'fiduciary_request',
  'email_bounced', 'email_replied', 'facture_viewed'
)) not valid;

-- ---------------------------------------------------------------------------
-- Helpers

-- The current user's firm, when it may work on this client right now.
create or replace function public.acc_assert_client(p_org uuid)
returns uuid
language plpgsql stable security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
begin
  if v_firm is null or p_org is null or not (p_org in (select public.fiduciary_org_ids(null))) then
    raise exception 'Accès refusé';
  end if;
  return v_firm;
end;
$$;
revoke execute on function public.acc_assert_client(uuid) from public, anon, authenticated;

-- People of the client who handle the money (they receive the requests).
create or replace function public.fiduciary_client_finance_people(p_org uuid)
returns table (user_id uuid, email text, locale text)
language sql stable security definer set search_path = public as $$
  select fm.user_id, u.email::text, coalesce(m.locale, o.locale, 'fr')
  from public.finance_member_user_ids(p_org) as fm(user_id)
  join auth.users u on u.id = fm.user_id
  join public.organizations o on o.id = p_org
  left join public.organization_members m on m.organization_id = p_org and m.user_id = fm.user_id;
$$;
revoke execute on function public.fiduciary_client_finance_people(uuid) from public, anon, authenticated;

create or replace function public.fiduciary_request_notify_client(p_request uuid, p_email_kind text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_r public.fiduciary_requests%rowtype;
  v_firm_name text;
  v_org_name text;
  p record;
begin
  select * into v_r from public.fiduciary_requests where id = p_request;
  select name into v_firm_name from public.fiduciary_firms where id = v_r.firm_id;
  select name into v_org_name from public.organizations where id = v_r.organization_id;
  for p in select * from public.fiduciary_client_finance_people(v_r.organization_id) loop
    perform public.fiduciary_queue_email(p_email_kind, p.email, p.locale, jsonb_build_object(
      'firm_name', v_firm_name, 'organization_name', v_org_name, 'title', v_r.title,
      'details', v_r.details, 'due_date', v_r.due_date
    ));
    begin
      insert into public.notifications (organization_id, user_id, type, title, body, link, source_table, source_id)
      values (
        v_r.organization_id, p.user_id, 'fiduciary_request',
        case when p_email_kind = 'request_reminder' then 'Rappel de votre fiduciaire' else 'Votre fiduciaire vous demande un document' end,
        coalesce(v_firm_name, 'Votre fiduciaire') || ' : ' || v_r.title,
        '/(app)/compte/fiduciaire', 'fiduciary_requests', v_r.id
      );
    exception when others then
      null;
    end;
  end loop;
end;
$$;
revoke execute on function public.fiduciary_request_notify_client(uuid, text) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Firm side

create or replace function public.acc_client_profile(p_org uuid)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.acc_assert_client(p_org);
  v_p public.fiduciary_client_profiles%rowtype;
begin
  select * into v_p from public.fiduciary_client_profiles where firm_id = v_firm and organization_id = p_org;
  if not found then
    return jsonb_build_object('vat_method', 'effective_quarterly', 'has_payroll', true, 'legal_form', 'sarl', 'fiscal_year_end', '12-31', 'tax_return_due', '03-31', 'assigned_to', null, 'saved', false);
  end if;
  return to_jsonb(v_p) - 'firm_id' - 'organization_id' || jsonb_build_object('saved', true);
end;
$$;
revoke execute on function public.acc_client_profile(uuid) from public, anon;
grant execute on function public.acc_client_profile(uuid) to authenticated;

create or replace function public.acc_set_client_profile(
  p_org uuid, p_vat_method text, p_has_payroll boolean, p_legal_form text, p_fiscal_year_end text, p_tax_return_due text, p_assigned_to uuid default null
)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.acc_assert_client(p_org);
begin
  if p_assigned_to is not null and not exists (select 1 from public.fiduciary_members where firm_id = v_firm and user_id = p_assigned_to) then
    raise exception 'Collaborateur inconnu';
  end if;
  insert into public.fiduciary_client_profiles (firm_id, organization_id, vat_method, has_payroll, legal_form, fiscal_year_end, tax_return_due, assigned_to, updated_by, updated_at)
  values (v_firm, p_org, p_vat_method, p_has_payroll, p_legal_form, p_fiscal_year_end, p_tax_return_due, p_assigned_to, auth.uid(), now())
  on conflict (firm_id, organization_id) do update set
    vat_method = excluded.vat_method, has_payroll = excluded.has_payroll, legal_form = excluded.legal_form,
    fiscal_year_end = excluded.fiscal_year_end, tax_return_due = excluded.tax_return_due, assigned_to = excluded.assigned_to,
    updated_by = auth.uid(), updated_at = now();
  perform public.fiduciary_audit(v_firm, p_org, 'profile_updated', jsonb_build_object('vat_method', p_vat_method, 'has_payroll', p_has_payroll));
end;
$$;
revoke execute on function public.acc_set_client_profile(uuid, text, boolean, text, text, text, uuid) from public, anon;
grant execute on function public.acc_set_client_profile(uuid, text, boolean, text, text, text, uuid) to authenticated;

-- Everything the firm needs to compute its deadline calendar in one call:
-- one row per active client with its profile (defaults when never set) and
-- what was already tracked.
create or replace function public.acc_deadline_data()
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
begin
  if v_firm is null then raise exception 'Accès refusé'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'organization_id', o.id,
      'name', o.name,
      'profile', coalesce(to_jsonb(p) - 'firm_id' - 'organization_id', jsonb_build_object(
        'vat_method', 'effective_quarterly', 'has_payroll', true, 'legal_form', 'sarl', 'fiscal_year_end', '12-31', 'tax_return_due', '03-31', 'assigned_to', null
      )) || jsonb_build_object('saved', p.firm_id is not null),
      'statuses', coalesce((
        select jsonb_agg(jsonb_build_object('kind', s.kind, 'period_key', s.period_key, 'status', s.status, 'note', s.note, 'updated_at', s.updated_at))
        from public.fiduciary_deadline_status s where s.firm_id = v_firm and s.organization_id = o.id
      ), '[]'::jsonb)
    ) order by o.name)
    from public.organizations o
    left join public.fiduciary_client_profiles p on p.firm_id = v_firm and p.organization_id = o.id
    where o.id in (select public.fiduciary_org_ids(null))
  ), '[]'::jsonb);
end;
$$;
revoke execute on function public.acc_deadline_data() from public, anon;
grant execute on function public.acc_deadline_data() to authenticated;

create or replace function public.acc_set_deadline(p_org uuid, p_kind text, p_period text, p_status text, p_note text default null)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.acc_assert_client(p_org);
begin
  insert into public.fiduciary_deadline_status (firm_id, organization_id, kind, period_key, status, note, updated_by, updated_at)
  values (v_firm, p_org, p_kind, p_period, p_status, nullif(trim(coalesce(p_note, '')), ''), auth.uid(), now())
  on conflict (firm_id, organization_id, kind, period_key) do update set
    status = excluded.status, note = coalesce(excluded.note, fiduciary_deadline_status.note), updated_by = auth.uid(), updated_at = now();
  perform public.fiduciary_audit(v_firm, p_org, 'deadline_' || p_status, jsonb_build_object('kind', p_kind, 'period', p_period));
end;
$$;
revoke execute on function public.acc_set_deadline(uuid, text, text, text, text) from public, anon;
grant execute on function public.acc_set_deadline(uuid, text, text, text, text) to authenticated;

create or replace function public.acc_requests(p_org uuid default null)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
begin
  if v_firm is null then raise exception 'Accès refusé'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', r.id, 'organization_id', r.organization_id, 'organization_name', o.name,
      'title', r.title, 'details', r.details, 'due_date', r.due_date, 'status', r.status,
      'client_message', r.client_message, 'created_at', r.created_at, 'answered_at', r.answered_at,
      'closed_at', r.closed_at, 'last_reminded_at', r.last_reminded_at,
      'created_by_name', nullif(trim(coalesce(fm.first_name, '') || ' ' || coalesce(fm.last_name, '')), ''),
      'files', coalesce((
        select jsonb_agg(jsonb_build_object('id', f.id, 'file_path', f.file_path, 'file_name', f.file_name, 'size_bytes', f.size_bytes, 'created_at', f.created_at) order by f.created_at)
        from public.fiduciary_request_files f where f.request_id = r.id
      ), '[]'::jsonb)
    ) order by (r.status in ('done', 'cancelled')), r.due_date nulls last, r.created_at desc)
    from public.fiduciary_requests r
    join public.organizations o on o.id = r.organization_id
    left join public.fiduciary_members fm on fm.firm_id = r.firm_id and fm.user_id = r.created_by
    where r.firm_id = v_firm
      and r.organization_id in (select public.fiduciary_org_ids(null))
      and (p_org is null or r.organization_id = p_org)
  ), '[]'::jsonb);
end;
$$;
revoke execute on function public.acc_requests(uuid) from public, anon;
grant execute on function public.acc_requests(uuid) to authenticated;

create or replace function public.acc_create_request(p_org uuid, p_title text, p_details text default null, p_due date default null)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.acc_assert_client(p_org);
  v_id uuid;
begin
  if (select count(*) from public.fiduciary_requests where firm_id = v_firm and created_at > now() - interval '1 day') >= 200 then
    raise exception 'Trop de demandes aujourd''hui';
  end if;
  insert into public.fiduciary_requests (firm_id, organization_id, title, details, due_date, created_by)
  values (v_firm, p_org, trim(p_title), nullif(trim(coalesce(p_details, '')), ''), p_due, auth.uid())
  returning id into v_id;
  perform public.fiduciary_audit(v_firm, p_org, 'request_created', jsonb_build_object('title', trim(p_title)));
  perform public.fiduciary_request_notify_client(v_id, 'request_new');
  return v_id;
end;
$$;
revoke execute on function public.acc_create_request(uuid, text, text, date) from public, anon;
grant execute on function public.acc_create_request(uuid, text, text, date) to authenticated;

-- done / cancelled / open (reopen, e.g. an incomplete answer), or a reminder.
create or replace function public.acc_update_request(p_id uuid, p_action text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_r public.fiduciary_requests%rowtype;
begin
  select * into v_r from public.fiduciary_requests where id = p_id;
  if not found or v_r.firm_id is distinct from public.acc_assert_client(v_r.organization_id) then
    raise exception 'Demande introuvable';
  end if;
  if p_action = 'remind' then
    if v_r.status not in ('open') then raise exception 'Demande déjà traitée'; end if;
    if v_r.last_reminded_at > now() - interval '20 hours' then raise exception 'Un rappel a déjà été envoyé aujourd''hui'; end if;
    update public.fiduciary_requests set last_reminded_at = now() where id = p_id;
    perform public.fiduciary_request_notify_client(p_id, 'request_reminder');
  elsif p_action in ('done', 'cancelled') then
    update public.fiduciary_requests set status = p_action, closed_at = now() where id = p_id;
  elsif p_action = 'open' then
    update public.fiduciary_requests set status = 'open', closed_at = null where id = p_id;
    perform public.fiduciary_request_notify_client(p_id, 'request_reminder');
  else
    raise exception 'Action inconnue';
  end if;
  perform public.fiduciary_audit(v_r.firm_id, v_r.organization_id, 'request_' || p_action, jsonb_build_object('title', v_r.title));
end;
$$;
revoke execute on function public.acc_update_request(uuid, text) from public, anon;
grant execute on function public.acc_update_request(uuid, text) to authenticated;

create or replace function public.acc_notes(p_org uuid)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_firm uuid := public.acc_assert_client(p_org);
begin
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', n.id, 'body', n.body, 'created_at', n.created_at, 'mine', n.author_id = auth.uid(),
      'author_name', nullif(trim(coalesce(m.first_name, '') || ' ' || coalesce(m.last_name, '')), '')
    ) order by n.created_at desc)
    from public.fiduciary_client_notes n
    left join public.fiduciary_members m on m.firm_id = n.firm_id and m.user_id = n.author_id
    where n.firm_id = v_firm and n.organization_id = p_org
  ), '[]'::jsonb);
end;
$$;
revoke execute on function public.acc_notes(uuid) from public, anon;
grant execute on function public.acc_notes(uuid) to authenticated;

create or replace function public.acc_add_note(p_org uuid, p_body text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.acc_assert_client(p_org);
begin
  insert into public.fiduciary_client_notes (firm_id, organization_id, body, author_id) values (v_firm, p_org, trim(p_body), auth.uid());
end;
$$;
revoke execute on function public.acc_add_note(uuid, text) from public, anon;
grant execute on function public.acc_add_note(uuid, text) to authenticated;

create or replace function public.acc_delete_note(p_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  delete from public.fiduciary_client_notes
  where id = p_id and firm_id = public.my_fiduciary_firm_id()
    and (author_id = auth.uid() or public.my_fiduciary_role() in ('OWNER', 'ADMIN'));
end;
$$;
revoke execute on function public.acc_delete_note(uuid) from public, anon;
grant execute on function public.acc_delete_note(uuid) to authenticated;

-- Figures of one client for the overview, computed in the database from
-- what the firm may see (each block only with its permission).
create or replace function public.acc_client_insights(p_org uuid)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_firm uuid := public.acc_assert_client(p_org);
  v_year_start date := date_trunc('year', current_date)::date;
  v_out jsonb := '{}'::jsonb;
begin
  if public.fiduciary_can(p_org, 'VIEW_INVOICES') then
    v_out := v_out || (
      select jsonb_build_object(
        'invoiced_ytd', coalesce(sum(t.total) filter (where f.created_at >= v_year_start), 0),
        'open_amount', coalesce(sum(greatest(t.total - t.paid, 0)) filter (where f.status in ('sent', 'partial', 'ready')), 0),
        'overdue_amount', coalesce(sum(greatest(t.total - t.paid, 0)) filter (where f.status in ('sent', 'partial') and f.due_date < current_date), 0),
        'overdue_count', count(*) filter (where f.status in ('sent', 'partial') and f.due_date < current_date and t.total - t.paid > 0.004),
        'invoices_ytd', count(*) filter (where f.created_at >= v_year_start),
        'monthly', coalesce((
          select jsonb_agg(jsonb_build_object('month', to_char(mm, 'YYYY-MM'), 'amount', coalesce((
            select sum(public.acc_facture_total(f2.id)) from public.factures f2
            where f2.organization_id = p_org and f2.status not in ('draft', 'cancelled')
              and f2.created_at >= mm and f2.created_at < mm + interval '1 month'
          ), 0)) order by mm)
          from generate_series(date_trunc('month', current_date) - interval '11 months', date_trunc('month', current_date), interval '1 month') mm
        ), '[]'::jsonb)
      )
      from public.factures f
      cross join lateral (
        select public.acc_facture_total(f.id) as total,
               coalesce((select sum(amount) from public.facture_payments p where p.facture_id = f.id), 0) as paid
      ) t
      where f.organization_id = p_org and f.status not in ('draft', 'cancelled')
    );
  end if;
  if public.fiduciary_can(p_org, 'VIEW_PAYMENT_STATUS') then
    v_out := v_out || jsonb_build_object(
      'collected_ytd', coalesce((
        select sum(p.amount) from public.facture_payments p join public.factures f on f.id = p.facture_id
        where f.organization_id = p_org and p.paid_at >= v_year_start
      ), 0)
    );
  end if;
  if public.fiduciary_can(p_org, 'VIEW_ACCOUNTING_DOCUMENTS') then
    v_out := v_out || jsonb_build_object(
      'expenses_ytd', coalesce((select sum(amount_chf) from public.expenses where organization_id = p_org and expense_date >= v_year_start), 0),
      'expenses_count_ytd', (select count(*) from public.expenses where organization_id = p_org and expense_date >= v_year_start),
      'entries_draft', (select count(*) from public.accounting_entries where organization_id = p_org and status = 'brouillon'),
      'entries_without_receipt_90d', (
        select count(*) from public.accounting_entries e
        where e.organization_id = p_org and e.status in ('validee', 'comptabilisee') and e.entry_date >= current_date - 90
          and e.source in ('facture_fournisseur', 'manuelle')
          and not exists (select 1 from public.accounting_attachments a where a.entry_id = e.id)
      ),
      'last_entry_date', (select max(entry_date) from public.accounting_entries where organization_id = p_org)
    );
  end if;
  if public.fiduciary_can(p_org, 'VIEW_PAYROLL_DATA') then
    v_out := v_out || jsonb_build_object(
      'payroll_runs_ytd', (select count(*) from public.payroll_runs where organization_id = p_org and year = extract(year from current_date)),
      'payroll_last', (select max(make_date(year, month, 1)) from public.payroll_runs where organization_id = p_org and status = 'validee')
    );
  end if;
  v_out := v_out || jsonb_build_object(
    'requests_open', (select count(*) from public.fiduciary_requests where firm_id = v_firm and organization_id = p_org and status = 'open'),
    'requests_answered', (select count(*) from public.fiduciary_requests where firm_id = v_firm and organization_id = p_org and status = 'answered')
  );
  return v_out;
end;
$$;
revoke execute on function public.acc_client_insights(uuid) from public, anon;
grant execute on function public.acc_client_insights(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Client side (app › Paramètres › Fiduciaire)

create or replace function public.org_fiduciary_requests(p_org uuid)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.can_view_org_finances(p_org) then raise exception 'Accès refusé'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', r.id, 'firm_name', fi.name, 'title', r.title, 'details', r.details, 'due_date', r.due_date,
      'status', r.status, 'client_message', r.client_message, 'created_at', r.created_at, 'answered_at', r.answered_at,
      'files', coalesce((
        select jsonb_agg(jsonb_build_object('id', f.id, 'file_path', f.file_path, 'file_name', f.file_name, 'created_at', f.created_at) order by f.created_at)
        from public.fiduciary_request_files f where f.request_id = r.id
      ), '[]'::jsonb)
    ) order by (r.status in ('done', 'cancelled')), r.due_date nulls last, r.created_at desc)
    from public.fiduciary_requests r join public.fiduciary_firms fi on fi.id = r.firm_id
    where r.organization_id = p_org and r.status <> 'cancelled'
      and exists (select 1 from public.fiduciary_client_access a where a.firm_id = r.firm_id and a.organization_id = p_org and a.status = 'ACTIVE')
  ), '[]'::jsonb);
end;
$$;
revoke execute on function public.org_fiduciary_requests(uuid) from public, anon;
grant execute on function public.org_fiduciary_requests(uuid) to authenticated;

-- A file the client uploaded to {org}/fiduciary-requests/{request}/...
create or replace function public.org_add_request_file(p_request uuid, p_path text, p_name text, p_size bigint default null)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_r public.fiduciary_requests%rowtype;
begin
  select * into v_r from public.fiduciary_requests where id = p_request;
  if not found or not public.can_view_org_finances(v_r.organization_id) or v_r.status not in ('open', 'answered') then
    raise exception 'Demande introuvable';
  end if;
  if p_path not like v_r.organization_id::text || '/fiduciary-requests/' || v_r.id::text || '/%' then
    raise exception 'Chemin invalide';
  end if;
  insert into public.fiduciary_request_files (request_id, organization_id, file_path, file_name, size_bytes, uploaded_by)
  values (p_request, v_r.organization_id, p_path, left(p_name, 255), p_size, auth.uid());
end;
$$;
revoke execute on function public.org_add_request_file(uuid, text, text, bigint) from public, anon;
grant execute on function public.org_add_request_file(uuid, text, text, bigint) to authenticated;

create or replace function public.org_remove_request_file(p_file uuid)
returns text
language plpgsql security definer set search_path = public as $$
declare
  v_path text;
begin
  delete from public.fiduciary_request_files f
  using public.fiduciary_requests r
  where f.id = p_file and r.id = f.request_id and r.status = 'open' and public.can_view_org_finances(f.organization_id)
  returning f.file_path into v_path;
  return v_path;
end;
$$;
revoke execute on function public.org_remove_request_file(uuid) from public, anon;
grant execute on function public.org_remove_request_file(uuid) to authenticated;

-- "Envoyer à ma fiduciaire": the request is answered (files and/or a message).
create or replace function public.org_answer_request(p_request uuid, p_message text default null)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_r public.fiduciary_requests%rowtype;
  v_org_name text;
begin
  select * into v_r from public.fiduciary_requests where id = p_request;
  if not found or not public.can_view_org_finances(v_r.organization_id) or v_r.status not in ('open', 'answered') then
    raise exception 'Demande introuvable';
  end if;
  if nullif(trim(coalesce(p_message, '')), '') is null and not exists (select 1 from public.fiduciary_request_files where request_id = p_request) then
    raise exception 'Ajoutez un fichier ou un message';
  end if;
  update public.fiduciary_requests set
    status = 'answered', answered_at = now(), answered_by = auth.uid(),
    client_message = coalesce(nullif(trim(coalesce(p_message, '')), ''), client_message)
  where id = p_request;
  select name into v_org_name from public.organizations where id = v_r.organization_id;
  insert into public.fiduciary_audit_log (firm_id, organization_id, actor_id, action, details)
  values (v_r.firm_id, v_r.organization_id, auth.uid(), 'request_answered', jsonb_build_object('title', v_r.title));
  -- The author of the request, and the firm's admins.
  perform public.fiduciary_queue_email('request_answered', coalesce(m.email, u.email::text), f.locale,
            jsonb_build_object('organization_name', v_org_name, 'title', v_r.title, 'organization_id', v_r.organization_id))
  from public.fiduciary_members m join auth.users u on u.id = m.user_id join public.fiduciary_firms f on f.id = m.firm_id
  where m.firm_id = v_r.firm_id and (m.user_id = v_r.created_by or m.role in ('OWNER', 'ADMIN'));
end;
$$;
revoke execute on function public.org_answer_request(uuid, text) from public, anon;
grant execute on function public.org_answer_request(uuid, text) to authenticated;

notify pgrst, 'reload schema';
