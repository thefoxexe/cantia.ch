-- Cantia Accounting, the tools of a full fiduciary workspace (on top of
-- 20260929210000_accounting_foundation.sql and 20260930120000_fiduciary_workspace.sql):
--
-- 1. Mandants outside Cantia (on Abacus, Banana, Winbiz…): a file per
--    client with its profile, deadlines, document requests, notes, and a
--    private link where the client sends files and signs, without account.
-- 2. Work items: the firm's process templates (closing, VAT, payroll…)
--    turned into checklists per client and period, assigned in the team.
-- 3. Time and fees per client, per collaborator.
-- 4. Approvals: a document the client validates and signs (annual
--    accounts, tax return…), with a timestamped proof.
-- 5. Entry proposals: the firm prepares a correcting entry, the client
--    accepts it in Cantia (new permission PROPOSE_ENTRIES).
-- 6. Financial indicators (EBITDA, EBIT, liquidity, quick ratio…) from the
--    client's ledger, per client and for the whole portfolio.
-- 7. The firm's brand (logo, colour) and the directory of fiduciaries.
--
-- Same rules as before: nothing without an ACTIVE access for Cantia
-- clients, every write through a function, every change logged. Nothing is
-- ever removed: a removed item is archived (status / archived_at).

-- ---------------------------------------------------------------------------
-- Permissions: the client may let its fiduciary propose entries.

create or replace function public.fiduciary_all_permissions()
returns text[]
language sql immutable as $$
  select array[
    'VIEW_INVOICES', 'VIEW_QUOTES', 'VIEW_CUSTOMERS', 'VIEW_PAYMENT_STATUS',
    'VIEW_ACCOUNTING_DOCUMENTS', 'DOWNLOAD_DOCUMENTS', 'VIEW_EXPORTS',
    'VIEW_WORK_HOURS', 'VIEW_PAYROLL_DATA', 'PROPOSE_ENTRIES'
  ]::text[];
$$;

-- ---------------------------------------------------------------------------
-- Firm: brand, default rate, directory profile.

alter table public.fiduciary_firms
  add column if not exists logo_data text check (logo_data is null or (logo_data like 'data:image/%' and length(logo_data) <= 400000)),
  add column if not exists brand_color text check (brand_color is null or brand_color ~ '^#[0-9A-Fa-f]{6}$'),
  add column if not exists default_hourly_rate numeric(8, 2) check (default_hourly_rate is null or default_hourly_rate between 0 and 2000),
  add column if not exists public_description text check (public_description is null or length(public_description) <= 600),
  add column if not exists public_services text[] not null default '{}',
  add column if not exists public_languages text[] not null default '{}',
  add column if not exists public_cantons text[] not null default '{}',
  add column if not exists public_email text check (public_email is null or public_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  add column if not exists accepts_new_clients boolean not null default true;

alter table public.fiduciary_client_profiles
  add column if not exists hourly_rate numeric(8, 2) check (hourly_rate is null or hourly_rate between 0 and 2000);

-- ---------------------------------------------------------------------------
-- Tables

create table if not exists public.fiduciary_external_clients (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.fiduciary_firms(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 160),
  legal_form text not null default 'sarl' check (legal_form in ('individual', 'sarl', 'sa', 'other')),
  contact_name text check (contact_name is null or length(contact_name) <= 120),
  email text check (email is null or email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text check (phone is null or length(phone) <= 40),
  address text check (address is null or length(address) <= 200),
  postal_code text check (postal_code is null or length(postal_code) <= 12),
  city text check (city is null or length(city) <= 80),
  ide_number text check (ide_number is null or length(ide_number) <= 30),
  software text not null default 'other' check (software in ('abacus', 'banana', 'winbiz', 'bexio', 'cresus', 'sage', 'klara', 'excel', 'other', 'none')),
  vat_method text not null default 'effective_quarterly'
    check (vat_method in ('none', 'effective_quarterly', 'effective_monthly', 'tdfn_semester', 'effective_annual')),
  has_payroll boolean not null default false,
  fiscal_year_end text not null default '12-31' check (fiscal_year_end ~ '^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$'),
  tax_return_due text not null default '03-31' check (tax_return_due ~ '^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$'),
  assigned_to uuid references auth.users(id) on delete set null,
  hourly_rate numeric(8, 2) check (hourly_rate is null or hourly_rate between 0 and 2000),
  locale text not null default 'fr' check (locale in ('fr', 'de', 'it')),
  -- The client's private link (accounting.cantia.ch/depot?t=…).
  portal_token uuid not null unique default gen_random_uuid(),
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'ARCHIVED')),
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists fiduciary_external_clients_firm on public.fiduciary_external_clients (firm_id, status, name);

create table if not exists public.fiduciary_external_deadline_status (
  firm_id uuid not null references public.fiduciary_firms(id) on delete cascade,
  external_client_id uuid not null references public.fiduciary_external_clients(id) on delete cascade,
  kind text not null check (kind in ('vat', 'salary_declaration', 'salary_certificates', 'tax_return', 'closing')),
  period_key text not null check (length(period_key) between 4 and 16),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  note text check (length(note) <= 500),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (external_client_id, kind, period_key)
);

create table if not exists public.fiduciary_external_requests (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.fiduciary_firms(id) on delete cascade,
  external_client_id uuid not null references public.fiduciary_external_clients(id) on delete cascade,
  title text not null check (length(trim(title)) between 2 and 160),
  details text check (length(details) <= 2000),
  due_date date,
  status text not null default 'open' check (status in ('open', 'answered', 'done', 'cancelled')),
  client_message text check (length(client_message) <= 2000),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  answered_at timestamptz,
  closed_at timestamptz,
  last_reminded_at timestamptz
);
create index if not exists fiduciary_external_requests_client on public.fiduciary_external_requests (external_client_id, status);
create index if not exists fiduciary_external_requests_firm on public.fiduciary_external_requests (firm_id, status);

create table if not exists public.fiduciary_external_request_files (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.fiduciary_external_requests(id) on delete cascade,
  external_client_id uuid not null references public.fiduciary_external_clients(id) on delete cascade,
  file_path text not null unique,
  file_name text not null check (length(file_name) between 1 and 255),
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create table if not exists public.fiduciary_external_notes (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.fiduciary_firms(id) on delete cascade,
  external_client_id uuid not null references public.fiduciary_external_clients(id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 4000),
  author_id uuid references auth.users(id) on delete set null,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

-- Work: templates, items (one per client and period), steps.
create table if not exists public.fiduciary_process_templates (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.fiduciary_firms(id) on delete cascade,
  name text not null check (length(trim(name)) between 2 and 120),
  kind text not null default 'other' check (kind in ('closing', 'vat', 'payroll', 'tax', 'onboarding', 'other')),
  steps text[] not null check (cardinality(steps) between 1 and 40),
  archived_at timestamptz,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fiduciary_work_items (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.fiduciary_firms(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  external_client_id uuid references public.fiduciary_external_clients(id) on delete cascade,
  title text not null check (length(trim(title)) between 2 and 160),
  kind text not null default 'other' check (kind in ('closing', 'vat', 'payroll', 'tax', 'onboarding', 'other')),
  period_label text check (period_label is null or length(period_label) <= 40),
  due_date date,
  assigned_to uuid references auth.users(id) on delete set null,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'waiting_client', 'review', 'done', 'cancelled')),
  template_id uuid references public.fiduciary_process_templates(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  check (num_nonnulls(organization_id, external_client_id) = 1)
);
create index if not exists fiduciary_work_items_firm on public.fiduciary_work_items (firm_id, status, due_date);

create table if not exists public.fiduciary_work_steps (
  id uuid primary key default gen_random_uuid(),
  work_item_id uuid not null references public.fiduciary_work_items(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 200),
  sort_order integer not null default 0,
  done_at timestamptz,
  done_by uuid references auth.users(id) on delete set null,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists fiduciary_work_steps_item on public.fiduciary_work_steps (work_item_id, sort_order);

-- Time and fees.
create table if not exists public.fiduciary_time_entries (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.fiduciary_firms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  external_client_id uuid references public.fiduciary_external_clients(id) on delete cascade,
  work_item_id uuid references public.fiduciary_work_items(id) on delete set null,
  entry_date date not null default current_date,
  minutes integer not null check (minutes between 1 and 1440),
  description text check (description is null or length(description) <= 500),
  billable boolean not null default true,
  rate_chf numeric(8, 2) check (rate_chf is null or rate_chf between 0 and 2000),
  status text not null default 'open' check (status in ('open', 'billed', 'void')),
  billed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (num_nonnulls(organization_id, external_client_id) = 1)
);
create index if not exists fiduciary_time_entries_firm on public.fiduciary_time_entries (firm_id, entry_date desc);

-- Approvals: a document to validate / sign.
create table if not exists public.fiduciary_approvals (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.fiduciary_firms(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  external_client_id uuid references public.fiduciary_external_clients(id) on delete cascade,
  kind text not null default 'other' check (kind in ('annual_accounts', 'tax_return', 'vat_return', 'payroll', 'engagement', 'other')),
  title text not null check (length(trim(title)) between 2 and 160),
  message text check (message is null or length(message) <= 2000),
  -- fiduciary/{firm}/approvals/{uuid}/{file}
  file_path text check (file_path is null or split_part(file_path, '/', 1) = 'fiduciary'),
  file_name text check (file_name is null or length(file_name) <= 255),
  file_sha256 text check (file_sha256 is null or file_sha256 ~ '^[0-9a-f]{64}$'),
  due_date date,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  signer_name text check (signer_name is null or length(signer_name) <= 120),
  signature_data text check (signature_data is null or (signature_data like 'data:image/%' and length(signature_data) <= 300000)),
  decided_by uuid references auth.users(id) on delete set null,
  decided_at timestamptz,
  decided_ip text check (decided_ip is null or length(decided_ip) <= 64),
  rejection_reason text check (rejection_reason is null or length(rejection_reason) <= 1000),
  last_reminded_at timestamptz,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  check (num_nonnulls(organization_id, external_client_id) = 1)
);
create index if not exists fiduciary_approvals_firm on public.fiduciary_approvals (firm_id, status);
create index if not exists fiduciary_approvals_org on public.fiduciary_approvals (organization_id, status);

-- Entry proposals (Cantia clients only: their ledger is in Cantia).
create table if not exists public.fiduciary_entry_proposals (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.fiduciary_firms(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  entry_date date not null,
  label text not null check (length(trim(label)) between 2 and 200),
  reason text check (reason is null or length(reason) <= 1000),
  -- [{ "account_code": "6500", "debit": 120.5, "credit": 0, "label": "…" }]
  lines jsonb not null check (jsonb_typeof(lines) = 'array'),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'cancelled')),
  entry_id uuid references public.accounting_entries(id) on delete set null,
  posted boolean not null default false,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  decided_by uuid references auth.users(id) on delete set null,
  decided_at timestamptz,
  rejection_reason text check (rejection_reason is null or length(rejection_reason) <= 1000)
);
create index if not exists fiduciary_entry_proposals_org on public.fiduciary_entry_proposals (organization_id, status);

-- ---------------------------------------------------------------------------
-- Row level security (reads only; writes go through the functions below).

alter table public.fiduciary_external_clients enable row level security;
alter table public.fiduciary_external_deadline_status enable row level security;
alter table public.fiduciary_external_requests enable row level security;
alter table public.fiduciary_external_request_files enable row level security;
alter table public.fiduciary_external_notes enable row level security;
alter table public.fiduciary_process_templates enable row level security;
alter table public.fiduciary_work_items enable row level security;
alter table public.fiduciary_work_steps enable row level security;
alter table public.fiduciary_time_entries enable row level security;
alter table public.fiduciary_approvals enable row level security;
alter table public.fiduciary_entry_proposals enable row level security;

create policy "firm reads its external clients" on public.fiduciary_external_clients
  for select using (firm_id = public.my_fiduciary_firm_id());
create policy "firm reads external deadlines" on public.fiduciary_external_deadline_status
  for select using (firm_id = public.my_fiduciary_firm_id());
create policy "firm reads external requests" on public.fiduciary_external_requests
  for select using (firm_id = public.my_fiduciary_firm_id());
create policy "firm reads external request files" on public.fiduciary_external_request_files
  for select using (exists (select 1 from public.fiduciary_external_requests r where r.id = request_id and r.firm_id = public.my_fiduciary_firm_id()));
create policy "firm reads external notes" on public.fiduciary_external_notes
  for select using (firm_id = public.my_fiduciary_firm_id() and archived_at is null);
create policy "firm reads its templates" on public.fiduciary_process_templates
  for select using (firm_id = public.my_fiduciary_firm_id());
create policy "firm reads its work items" on public.fiduciary_work_items
  for select using (firm_id = public.my_fiduciary_firm_id() and (organization_id is null or organization_id in (select public.fiduciary_org_ids(null))));
create policy "firm reads its work steps" on public.fiduciary_work_steps
  for select using (exists (select 1 from public.fiduciary_work_items w where w.id = work_item_id and w.firm_id = public.my_fiduciary_firm_id()));
create policy "firm reads its time" on public.fiduciary_time_entries
  for select using (firm_id = public.my_fiduciary_firm_id());
create policy "firm reads its approvals" on public.fiduciary_approvals
  for select using (firm_id = public.my_fiduciary_firm_id() and (organization_id is null or organization_id in (select public.fiduciary_org_ids(null))));
create policy "client reads approvals addressed to it" on public.fiduciary_approvals
  for select using (organization_id is not null and public.can_view_org_finances(organization_id));
create policy "firm reads its entry proposals" on public.fiduciary_entry_proposals
  for select using (firm_id = public.my_fiduciary_firm_id() and organization_id in (select public.fiduciary_org_ids(null)));
create policy "client reads entry proposals" on public.fiduciary_entry_proposals
  for select using (public.can_view_org_finances(organization_id));

grant select on public.fiduciary_external_clients, public.fiduciary_external_deadline_status, public.fiduciary_external_requests,
  public.fiduciary_external_request_files, public.fiduciary_external_notes, public.fiduciary_process_templates,
  public.fiduciary_work_items, public.fiduciary_work_steps, public.fiduciary_time_entries, public.fiduciary_approvals,
  public.fiduciary_entry_proposals to authenticated;

-- Files: fiduciary/{firm}/… belongs to the firm (uploads of approval
-- documents, files sent by external clients through their link); the
-- client of an approval may read its document.
create policy "fiduciary firm reads its files" on storage.objects
  for select to authenticated using (
    bucket_id = 'opus-storage' and split_part(name, '/', 1) = 'fiduciary'
    and split_part(name, '/', 2) = public.my_fiduciary_firm_id()::text
  );
create policy "fiduciary firm uploads approval documents" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'opus-storage' and split_part(name, '/', 1) = 'fiduciary'
    and split_part(name, '/', 2) = public.my_fiduciary_firm_id()::text
    and split_part(name, '/', 3) = 'approvals'
  );
create policy "clients read their approval documents" on storage.objects
  for select to authenticated using (
    bucket_id = 'opus-storage' and split_part(name, '/', 1) = 'fiduciary'
    and exists (
      select 1 from public.fiduciary_approvals a
      where a.file_path = objects.name and a.organization_id is not null and public.can_view_org_finances(a.organization_id)
    )
  );

-- ---------------------------------------------------------------------------
-- Helpers

-- The current user's firm, when this external client belongs to it and the
-- firm is active.
create or replace function public.acc_assert_ext(p_ext uuid)
returns uuid
language plpgsql stable security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
begin
  if v_firm is null or p_ext is null or not exists (
    select 1 from public.fiduciary_external_clients c join public.fiduciary_firms f on f.id = c.firm_id
    where c.id = p_ext and c.firm_id = v_firm and f.status = 'ACTIVE'
  ) then
    raise exception 'Accès refusé';
  end if;
  return v_firm;
end;
$$;
revoke execute on function public.acc_assert_ext(uuid) from public, anon, authenticated;

-- One of the two: a Cantia client (ACTIVE access) or an external client.
create or replace function public.acc_assert_target(p_org uuid, p_ext uuid)
returns uuid
language plpgsql stable security definer set search_path = public as $$
begin
  if num_nonnulls(p_org, p_ext) <> 1 then raise exception 'Choisissez un mandant'; end if;
  if p_org is not null then return public.acc_assert_client(p_org); end if;
  return public.acc_assert_ext(p_ext);
end;
$$;
revoke execute on function public.acc_assert_target(uuid, uuid) from public, anon, authenticated;

create or replace function public.acc_target_name(p_org uuid, p_ext uuid)
returns text
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select name from public.organizations where id = p_org),
    (select name from public.fiduciary_external_clients where id = p_ext)
  );
$$;
revoke execute on function public.acc_target_name(uuid, uuid) from public, anon, authenticated;

create or replace function public.acc_member_name(p_firm uuid, p_user uuid)
returns text
language sql stable security definer set search_path = public as $$
  select nullif(trim(coalesce(m.first_name, '') || ' ' || coalesce(m.last_name, '')), '')
  from public.fiduciary_members m where m.firm_id = p_firm and m.user_id = p_user;
$$;
revoke execute on function public.acc_member_name(uuid, uuid) from public, anon, authenticated;

-- Where a client's reply goes: the firm's public e-mail, else its owner.
create or replace function public.fiduciary_firm_reply_to(p_firm uuid)
returns text
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select public_email from public.fiduciary_firms where id = p_firm),
    (select coalesce(m.email, u.email::text) from public.fiduciary_members m join auth.users u on u.id = m.user_id where m.firm_id = p_firm and m.role = 'OWNER' limit 1)
  );
$$;
revoke execute on function public.fiduciary_firm_reply_to(uuid) from public, anon, authenticated;

-- Email to a member of the firm (the author of something) and its admins.
create or replace function public.fiduciary_notify_firm_people(p_firm uuid, p_user uuid, p_kind text, p_payload jsonb)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_locale text;
  v_email text;
begin
  select locale into v_locale from public.fiduciary_firms where id = p_firm;
  for v_email in
    select distinct coalesce(m.email, u.email::text)
    from public.fiduciary_members m join auth.users u on u.id = m.user_id
    where m.firm_id = p_firm and (m.user_id = p_user or m.role in ('OWNER', 'ADMIN'))
  loop
    perform public.fiduciary_queue_email(p_kind, v_email, v_locale, p_payload);
  end loop;
end;
$$;
revoke execute on function public.fiduciary_notify_firm_people(uuid, uuid, text, jsonb) from public, anon, authenticated;

-- People of a Cantia client who handle the money: email + in-app notification.
create or replace function public.fiduciary_notify_org_finance(p_org uuid, p_kind text, p_title text, p_body text, p_payload jsonb)
returns void
language plpgsql security definer set search_path = public as $$
declare
  p record;
begin
  for p in select * from public.fiduciary_client_finance_people(p_org) loop
    perform public.fiduciary_queue_email(p_kind, p.email, p.locale, p_payload);
    begin
      insert into public.notifications (organization_id, user_id, type, title, body, link, source_table, source_id)
      values (p_org, p.user_id, 'fiduciary_request', p_title, p_body, '/(app)/compte/fiduciaire', 'organizations', p_org);
    exception when others then
      null;
    end;
  end loop;
end;
$$;
revoke execute on function public.fiduciary_notify_org_finance(uuid, text, text, text, jsonb) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Firm profile: brand, rate, directory.

create or replace function public.acc_update_firm_profile(
  p_logo_data text, p_brand_color text, p_default_hourly_rate numeric, p_directory_visible boolean,
  p_description text, p_services text[], p_languages text[], p_cantons text[], p_public_email text, p_accepts_new_clients boolean
)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
begin
  if v_firm is null or public.my_fiduciary_role() not in ('OWNER', 'ADMIN') then raise exception 'Accès refusé'; end if;
  update public.fiduciary_firms set
    logo_data = nullif(p_logo_data, ''),
    brand_color = nullif(p_brand_color, ''),
    default_hourly_rate = p_default_hourly_rate,
    public_directory_visible = coalesce(p_directory_visible, false),
    public_description = nullif(trim(coalesce(p_description, '')), ''),
    public_services = coalesce((select array_agg(distinct left(trim(s), 60)) from unnest(coalesce(p_services, '{}')) s where trim(s) <> ''), '{}'),
    public_languages = coalesce((select array_agg(distinct l) from unnest(coalesce(p_languages, '{}')) l where l in ('fr', 'de', 'it', 'en')), '{}'),
    public_cantons = coalesce((select array_agg(distinct c) from unnest(coalesce(p_cantons, '{}')) c where c ~ '^[A-Z]{2}$'), '{}'),
    public_email = nullif(lower(trim(coalesce(p_public_email, ''))), ''),
    accepts_new_clients = coalesce(p_accepts_new_clients, true),
    updated_at = now()
  where id = v_firm;
  perform public.fiduciary_audit(v_firm, null, 'firm_profile_updated', jsonb_build_object('directory', coalesce(p_directory_visible, false)));
end;
$$;
revoke execute on function public.acc_update_firm_profile(text, text, numeric, boolean, text, text[], text[], text[], text, boolean) from public, anon;
grant execute on function public.acc_update_firm_profile(text, text, numeric, boolean, text, text[], text[], text[], text, boolean) to authenticated;

-- The public directory (cantia.ch, and Paramètres › Fiduciaire in the app).
create or replace function public.fiduciary_directory(p_search text default null, p_canton text default null)
returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', f.id, 'name', f.name, 'city', f.city, 'postal_code', f.postal_code, 'website', f.website, 'phone', f.phone,
    'email', f.public_email, 'verified', f.verified, 'logo_data', f.logo_data, 'brand_color', f.brand_color,
    'description', f.public_description, 'services', f.public_services, 'languages', f.public_languages,
    'cantons', f.public_cantons, 'accepts_new_clients', f.accepts_new_clients
  ) order by f.verified desc, f.name), '[]'::jsonb)
  from public.fiduciary_firms f
  where f.status = 'ACTIVE' and f.public_directory_visible
    and (p_canton is null or p_canton = any (f.public_cantons))
    and (coalesce(trim(p_search), '') = '' or f.name ilike '%' || trim(p_search) || '%' or coalesce(f.city, '') ilike '%' || trim(p_search) || '%'
         or coalesce(f.postal_code, '') like trim(p_search) || '%');
$$;
revoke execute on function public.fiduciary_directory(text, text) from public;
grant execute on function public.fiduciary_directory(text, text) to anon, authenticated;

-- A Cantia company asks a firm of the directory to become its fiduciary.
create or replace function public.org_request_firm(p_org uuid, p_firm uuid, p_permissions text[] default null)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_perms text[] := public.fiduciary_clean_permissions(coalesce(p_permissions, public.fiduciary_standard_permissions()));
  v_org_name text;
begin
  if not public.is_org_admin(p_org) then raise exception 'Accès refusé'; end if;
  if not exists (select 1 from public.fiduciary_firms where id = p_firm and status = 'ACTIVE' and public_directory_visible) then
    raise exception 'Fiduciaire introuvable';
  end if;
  if exists (select 1 from public.fiduciary_client_access where firm_id = p_firm and organization_id = p_org and status in ('ACTIVE', 'PENDING_FIRM', 'PENDING_CLIENT')) then
    raise exception 'Une demande ou un accès existe déjà avec cette fiduciaire.';
  end if;
  if (select count(*) from public.fiduciary_audit_log where organization_id = p_org and action = 'directory_request' and created_at > now() - interval '1 day') >= 5 then
    raise exception 'Limite quotidienne atteinte. Réessayez demain.';
  end if;
  select name into v_org_name from public.organizations where id = p_org;
  insert into public.fiduciary_client_access (firm_id, organization_id, status, permissions, source, requested_by, approved_by)
  values (p_firm, p_org, 'PENDING_FIRM', v_perms, 'CLIENT_INVITE', auth.uid(), auth.uid());
  perform public.fiduciary_audit(p_firm, p_org, 'directory_request', jsonb_build_object('permissions', v_perms));
  perform public.fiduciary_notify_firm(p_firm, 'client_invite_existing_firm', jsonb_build_object('organization_name', v_org_name));
  return jsonb_build_object('kind', 'pending_firm');
end;
$$;
revoke execute on function public.org_request_firm(uuid, uuid, text[]) from public, anon;
grant execute on function public.org_request_firm(uuid, uuid, text[]) to authenticated;

-- ---------------------------------------------------------------------------
-- External clients

create or replace function public.acc_external_clients(p_include_archived boolean default false)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
begin
  if v_firm is null then raise exception 'Accès refusé'; end if;
  return coalesce((
    select jsonb_agg(to_jsonb(c) - 'firm_id' || jsonb_build_object(
      'assigned_name', public.acc_member_name(v_firm, c.assigned_to),
      'requests_open', (select count(*) from public.fiduciary_external_requests r where r.external_client_id = c.id and r.status = 'open'),
      'requests_answered', (select count(*) from public.fiduciary_external_requests r where r.external_client_id = c.id and r.status = 'answered'),
      'work_open', (select count(*) from public.fiduciary_work_items w where w.external_client_id = c.id and w.status not in ('done', 'cancelled')),
      'approvals_pending', (select count(*) from public.fiduciary_approvals a where a.external_client_id = c.id and a.status = 'pending'),
      'unbilled_minutes', (select coalesce(sum(t.minutes), 0) from public.fiduciary_time_entries t where t.external_client_id = c.id and t.status = 'open' and t.billable)
    ) order by c.status, c.name)
    from public.fiduciary_external_clients c
    where c.firm_id = v_firm and (p_include_archived or c.status = 'ACTIVE')
  ), '[]'::jsonb);
end;
$$;
revoke execute on function public.acc_external_clients(boolean) from public, anon;
grant execute on function public.acc_external_clients(boolean) to authenticated;

create or replace function public.acc_external_client(p_ext uuid)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
begin
  if v_firm is null then raise exception 'Accès refusé'; end if;
  return (
    select to_jsonb(c) - 'firm_id' || jsonb_build_object('assigned_name', public.acc_member_name(v_firm, c.assigned_to))
    from public.fiduciary_external_clients c where c.id = p_ext and c.firm_id = v_firm
  );
end;
$$;
revoke execute on function public.acc_external_client(uuid) from public, anon;
grant execute on function public.acc_external_client(uuid) to authenticated;

-- Create (p_id null) or update an external client. p_data: name, legal_form,
-- contact_name, email, phone, address, postal_code, city, ide_number,
-- software, vat_method, has_payroll, fiscal_year_end, tax_return_due,
-- assigned_to, hourly_rate, locale.
create or replace function public.acc_save_external_client(p_id uuid, p_data jsonb)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
  v_id uuid;
  v_assigned uuid := nullif(p_data ->> 'assigned_to', '')::uuid;
begin
  if v_firm is null or not exists (select 1 from public.fiduciary_firms where id = v_firm and status = 'ACTIVE') then raise exception 'Accès refusé'; end if;
  if v_assigned is not null and not exists (select 1 from public.fiduciary_members where firm_id = v_firm and user_id = v_assigned) then
    raise exception 'Collaborateur inconnu';
  end if;
  if p_id is null then
    if (select count(*) from public.fiduciary_external_clients where firm_id = v_firm) >= 2000 then raise exception 'Limite de mandants atteinte'; end if;
    insert into public.fiduciary_external_clients (
      firm_id, name, legal_form, contact_name, email, phone, address, postal_code, city, ide_number, software,
      vat_method, has_payroll, fiscal_year_end, tax_return_due, assigned_to, hourly_rate, locale
    ) values (
      v_firm, trim(p_data ->> 'name'), coalesce(nullif(p_data ->> 'legal_form', ''), 'sarl'),
      nullif(trim(coalesce(p_data ->> 'contact_name', '')), ''), nullif(lower(trim(coalesce(p_data ->> 'email', ''))), ''),
      nullif(trim(coalesce(p_data ->> 'phone', '')), ''), nullif(trim(coalesce(p_data ->> 'address', '')), ''),
      nullif(trim(coalesce(p_data ->> 'postal_code', '')), ''), nullif(trim(coalesce(p_data ->> 'city', '')), ''),
      nullif(trim(coalesce(p_data ->> 'ide_number', '')), ''), coalesce(nullif(p_data ->> 'software', ''), 'other'),
      coalesce(nullif(p_data ->> 'vat_method', ''), 'effective_quarterly'), coalesce((p_data ->> 'has_payroll')::boolean, false),
      coalesce(nullif(p_data ->> 'fiscal_year_end', ''), '12-31'), coalesce(nullif(p_data ->> 'tax_return_due', ''), '03-31'),
      v_assigned, nullif(p_data ->> 'hourly_rate', '')::numeric, coalesce(nullif(p_data ->> 'locale', ''), 'fr')
    ) returning id into v_id;
    perform public.fiduciary_audit(v_firm, null, 'external_client_created', jsonb_build_object('external_client_id', v_id, 'name', trim(p_data ->> 'name')));
  else
    perform public.acc_assert_ext(p_id);
    update public.fiduciary_external_clients set
      name = coalesce(nullif(trim(coalesce(p_data ->> 'name', '')), ''), name),
      legal_form = coalesce(nullif(p_data ->> 'legal_form', ''), legal_form),
      contact_name = nullif(trim(coalesce(p_data ->> 'contact_name', '')), ''),
      email = nullif(lower(trim(coalesce(p_data ->> 'email', ''))), ''),
      phone = nullif(trim(coalesce(p_data ->> 'phone', '')), ''),
      address = nullif(trim(coalesce(p_data ->> 'address', '')), ''),
      postal_code = nullif(trim(coalesce(p_data ->> 'postal_code', '')), ''),
      city = nullif(trim(coalesce(p_data ->> 'city', '')), ''),
      ide_number = nullif(trim(coalesce(p_data ->> 'ide_number', '')), ''),
      software = coalesce(nullif(p_data ->> 'software', ''), software),
      vat_method = coalesce(nullif(p_data ->> 'vat_method', ''), vat_method),
      has_payroll = coalesce((p_data ->> 'has_payroll')::boolean, has_payroll),
      fiscal_year_end = coalesce(nullif(p_data ->> 'fiscal_year_end', ''), fiscal_year_end),
      tax_return_due = coalesce(nullif(p_data ->> 'tax_return_due', ''), tax_return_due),
      assigned_to = v_assigned,
      hourly_rate = nullif(p_data ->> 'hourly_rate', '')::numeric,
      locale = coalesce(nullif(p_data ->> 'locale', ''), locale),
      updated_at = now()
    where id = p_id;
    v_id := p_id;
    perform public.fiduciary_audit(v_firm, null, 'external_client_updated', jsonb_build_object('external_client_id', p_id));
  end if;
  return v_id;
end;
$$;
revoke execute on function public.acc_save_external_client(uuid, jsonb) from public, anon;
grant execute on function public.acc_save_external_client(uuid, jsonb) to authenticated;

-- archive / restore / new private link
create or replace function public.acc_external_client_action(p_id uuid, p_action text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
  v_token uuid;
begin
  if v_firm is null or not exists (select 1 from public.fiduciary_external_clients where id = p_id and firm_id = v_firm) then raise exception 'Accès refusé'; end if;
  if p_action = 'archive' then
    if public.my_fiduciary_role() not in ('OWNER', 'ADMIN') then raise exception 'Réservé aux administrateurs'; end if;
    update public.fiduciary_external_clients set status = 'ARCHIVED', updated_at = now() where id = p_id;
  elsif p_action = 'restore' then
    update public.fiduciary_external_clients set status = 'ACTIVE', updated_at = now() where id = p_id;
  elsif p_action = 'new_link' then
    update public.fiduciary_external_clients set portal_token = gen_random_uuid(), updated_at = now() where id = p_id returning portal_token into v_token;
  else
    raise exception 'Action inconnue';
  end if;
  perform public.fiduciary_audit(v_firm, null, 'external_client_' || p_action, jsonb_build_object('external_client_id', p_id));
  return jsonb_build_object('portal_token', v_token);
end;
$$;
revoke execute on function public.acc_external_client_action(uuid, text) from public, anon;
grant execute on function public.acc_external_client_action(uuid, text) to authenticated;

create or replace function public.acc_ext_set_deadline(p_ext uuid, p_kind text, p_period text, p_status text, p_note text default null)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.acc_assert_ext(p_ext);
begin
  insert into public.fiduciary_external_deadline_status (firm_id, external_client_id, kind, period_key, status, note, updated_by, updated_at)
  values (v_firm, p_ext, p_kind, p_period, p_status, nullif(trim(coalesce(p_note, '')), ''), auth.uid(), now())
  on conflict (external_client_id, kind, period_key) do update set
    status = excluded.status, note = coalesce(excluded.note, fiduciary_external_deadline_status.note), updated_by = auth.uid(), updated_at = now();
end;
$$;
revoke execute on function public.acc_ext_set_deadline(uuid, text, text, text, text) from public, anon;
grant execute on function public.acc_ext_set_deadline(uuid, text, text, text, text) to authenticated;

-- Deadline calendar data: Cantia clients and external clients together.
-- External rows carry external_client_id (organization_id is null).
create or replace function public.acc_deadline_data()
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
begin
  if v_firm is null then raise exception 'Accès refusé'; end if;
  return coalesce((
    select jsonb_agg(x order by x ->> 'name')
    from (
      select jsonb_build_object(
        'organization_id', o.id,
        'external_client_id', null,
        'name', o.name,
        'profile', coalesce(to_jsonb(p) - 'firm_id' - 'organization_id', jsonb_build_object(
          'vat_method', 'effective_quarterly', 'has_payroll', true, 'legal_form', 'sarl', 'fiscal_year_end', '12-31', 'tax_return_due', '03-31', 'assigned_to', null
        )) || jsonb_build_object('saved', p.firm_id is not null),
        'statuses', coalesce((
          select jsonb_agg(jsonb_build_object('kind', s.kind, 'period_key', s.period_key, 'status', s.status, 'note', s.note, 'updated_at', s.updated_at))
          from public.fiduciary_deadline_status s where s.firm_id = v_firm and s.organization_id = o.id
        ), '[]'::jsonb)
      ) as x
      from public.organizations o
      left join public.fiduciary_client_profiles p on p.firm_id = v_firm and p.organization_id = o.id
      where o.id in (select public.fiduciary_org_ids(null))
      union all
      select jsonb_build_object(
        'organization_id', null,
        'external_client_id', c.id,
        'name', c.name,
        'profile', jsonb_build_object(
          'vat_method', c.vat_method, 'has_payroll', c.has_payroll, 'legal_form', c.legal_form,
          'fiscal_year_end', c.fiscal_year_end, 'tax_return_due', c.tax_return_due, 'assigned_to', c.assigned_to, 'saved', true
        ),
        'statuses', coalesce((
          select jsonb_agg(jsonb_build_object('kind', s.kind, 'period_key', s.period_key, 'status', s.status, 'note', s.note, 'updated_at', s.updated_at))
          from public.fiduciary_external_deadline_status s where s.external_client_id = c.id
        ), '[]'::jsonb)
      )
      from public.fiduciary_external_clients c
      where c.firm_id = v_firm and c.status = 'ACTIVE'
    ) t
  ), '[]'::jsonb);
end;
$$;
revoke execute on function public.acc_deadline_data() from public, anon;
grant execute on function public.acc_deadline_data() to authenticated;

-- Requests: Cantia clients and external clients together (external rows
-- carry external_client_id and kind 'external').
create or replace function public.acc_requests(p_org uuid default null)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
begin
  if v_firm is null then raise exception 'Accès refusé'; end if;
  return coalesce((
    select jsonb_agg(x order by (x ->> 'status') in ('done', 'cancelled'), x ->> 'due_date' nulls last, x ->> 'created_at' desc)
    from (
      select jsonb_build_object(
        'id', r.id, 'organization_id', r.organization_id, 'external_client_id', null, 'organization_name', o.name,
        'title', r.title, 'details', r.details, 'due_date', r.due_date, 'status', r.status,
        'client_message', r.client_message, 'created_at', r.created_at, 'answered_at', r.answered_at,
        'closed_at', r.closed_at, 'last_reminded_at', r.last_reminded_at,
        'created_by_name', public.acc_member_name(r.firm_id, r.created_by),
        'files', coalesce((
          select jsonb_agg(jsonb_build_object('id', f.id, 'file_path', f.file_path, 'file_name', f.file_name, 'size_bytes', f.size_bytes, 'created_at', f.created_at) order by f.created_at)
          from public.fiduciary_request_files f where f.request_id = r.id
        ), '[]'::jsonb)
      ) as x
      from public.fiduciary_requests r
      join public.organizations o on o.id = r.organization_id
      where r.firm_id = v_firm
        and r.organization_id in (select public.fiduciary_org_ids(null))
        and (p_org is null or r.organization_id = p_org)
      union all
      select jsonb_build_object(
        'id', r.id, 'organization_id', null, 'external_client_id', r.external_client_id, 'organization_name', c.name,
        'title', r.title, 'details', r.details, 'due_date', r.due_date, 'status', r.status,
        'client_message', r.client_message, 'created_at', r.created_at, 'answered_at', r.answered_at,
        'closed_at', r.closed_at, 'last_reminded_at', r.last_reminded_at,
        'created_by_name', public.acc_member_name(r.firm_id, r.created_by),
        'files', coalesce((
          select jsonb_agg(jsonb_build_object('id', f.id, 'file_path', f.file_path, 'file_name', f.file_name, 'size_bytes', f.size_bytes, 'created_at', f.created_at) order by f.created_at)
          from public.fiduciary_external_request_files f where f.request_id = r.id
        ), '[]'::jsonb)
      )
      from public.fiduciary_external_requests r
      join public.fiduciary_external_clients c on c.id = r.external_client_id
      where r.firm_id = v_firm and p_org is null
    ) t
  ), '[]'::jsonb);
end;
$$;
revoke execute on function public.acc_requests(uuid) from public, anon;
grant execute on function public.acc_requests(uuid) to authenticated;

create or replace function public.acc_ext_requests(p_ext uuid)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
begin
  if v_firm is null or not exists (select 1 from public.fiduciary_external_clients where id = p_ext and firm_id = v_firm) then raise exception 'Accès refusé'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', r.id, 'organization_id', null, 'external_client_id', r.external_client_id, 'organization_name', c.name,
      'title', r.title, 'details', r.details, 'due_date', r.due_date, 'status', r.status,
      'client_message', r.client_message, 'created_at', r.created_at, 'answered_at', r.answered_at,
      'closed_at', r.closed_at, 'last_reminded_at', r.last_reminded_at,
      'created_by_name', public.acc_member_name(r.firm_id, r.created_by),
      'files', coalesce((
        select jsonb_agg(jsonb_build_object('id', f.id, 'file_path', f.file_path, 'file_name', f.file_name, 'size_bytes', f.size_bytes, 'created_at', f.created_at) order by f.created_at)
        from public.fiduciary_external_request_files f where f.request_id = r.id
      ), '[]'::jsonb)
    ) order by (r.status in ('done', 'cancelled')), r.due_date nulls last, r.created_at desc)
    from public.fiduciary_external_requests r
    join public.fiduciary_external_clients c on c.id = r.external_client_id
    where r.external_client_id = p_ext
  ), '[]'::jsonb);
end;
$$;
revoke execute on function public.acc_ext_requests(uuid) from public, anon;
grant execute on function public.acc_ext_requests(uuid) to authenticated;

create or replace function public.fiduciary_ext_request_notify(p_request uuid, p_kind text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_r public.fiduciary_external_requests%rowtype;
  v_c public.fiduciary_external_clients%rowtype;
  v_f public.fiduciary_firms%rowtype;
begin
  select * into v_r from public.fiduciary_external_requests where id = p_request;
  select * into v_c from public.fiduciary_external_clients where id = v_r.external_client_id;
  select * into v_f from public.fiduciary_firms where id = v_r.firm_id;
  if v_c.email is null then return; end if;
  perform public.fiduciary_queue_email(p_kind, v_c.email, v_c.locale, jsonb_build_object(
    'firm_name', v_f.name, 'company_name', v_c.name, 'contact_name', v_c.contact_name, 'title', v_r.title,
    'details', v_r.details, 'due_date', v_r.due_date, 'portal_token', v_c.portal_token, 'brand_color', v_f.brand_color,
    'reply_to', public.fiduciary_firm_reply_to(v_f.id)
  ));
end;
$$;
revoke execute on function public.fiduciary_ext_request_notify(uuid, text) from public, anon, authenticated;

create or replace function public.acc_ext_create_request(p_ext uuid, p_title text, p_details text default null, p_due date default null, p_notify boolean default true)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.acc_assert_ext(p_ext);
  v_id uuid;
begin
  if (select count(*) from public.fiduciary_external_requests where firm_id = v_firm and created_at > now() - interval '1 day') >= 300 then
    raise exception 'Trop de demandes aujourd''hui';
  end if;
  insert into public.fiduciary_external_requests (firm_id, external_client_id, title, details, due_date, created_by)
  values (v_firm, p_ext, trim(p_title), nullif(trim(coalesce(p_details, '')), ''), p_due, auth.uid())
  returning id into v_id;
  perform public.fiduciary_audit(v_firm, null, 'request_created', jsonb_build_object('external_client_id', p_ext, 'title', trim(p_title)));
  if p_notify then perform public.fiduciary_ext_request_notify(v_id, 'ext_request_new'); end if;
  return v_id;
end;
$$;
revoke execute on function public.acc_ext_create_request(uuid, text, text, date, boolean) from public, anon;
grant execute on function public.acc_ext_create_request(uuid, text, text, date, boolean) to authenticated;

create or replace function public.acc_ext_update_request(p_id uuid, p_action text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_r public.fiduciary_external_requests%rowtype;
begin
  select * into v_r from public.fiduciary_external_requests where id = p_id;
  if not found then raise exception 'Demande introuvable'; end if;
  perform public.acc_assert_ext(v_r.external_client_id);
  if p_action = 'remind' then
    if v_r.status <> 'open' then raise exception 'Demande déjà traitée'; end if;
    if v_r.last_reminded_at > now() - interval '20 hours' then raise exception 'Un rappel a déjà été envoyé aujourd''hui'; end if;
    update public.fiduciary_external_requests set last_reminded_at = now() where id = p_id;
    perform public.fiduciary_ext_request_notify(p_id, 'ext_request_reminder');
  elsif p_action in ('done', 'cancelled') then
    update public.fiduciary_external_requests set status = p_action, closed_at = now() where id = p_id;
  elsif p_action = 'open' then
    update public.fiduciary_external_requests set status = 'open', closed_at = null where id = p_id;
    perform public.fiduciary_ext_request_notify(p_id, 'ext_request_reminder');
  else
    raise exception 'Action inconnue';
  end if;
  perform public.fiduciary_audit(v_r.firm_id, null, 'request_' || p_action, jsonb_build_object('external_client_id', v_r.external_client_id, 'title', v_r.title));
end;
$$;
revoke execute on function public.acc_ext_update_request(uuid, text) from public, anon;
grant execute on function public.acc_ext_update_request(uuid, text) to authenticated;

create or replace function public.acc_ext_notes(p_ext uuid)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
begin
  if v_firm is null or not exists (select 1 from public.fiduciary_external_clients where id = p_ext and firm_id = v_firm) then raise exception 'Accès refusé'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', n.id, 'body', n.body, 'created_at', n.created_at, 'mine', n.author_id = auth.uid(),
      'author_name', public.acc_member_name(n.firm_id, n.author_id)
    ) order by n.created_at desc)
    from public.fiduciary_external_notes n where n.external_client_id = p_ext and n.archived_at is null
  ), '[]'::jsonb);
end;
$$;
revoke execute on function public.acc_ext_notes(uuid) from public, anon;
grant execute on function public.acc_ext_notes(uuid) to authenticated;

create or replace function public.acc_ext_add_note(p_ext uuid, p_body text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.acc_assert_ext(p_ext);
begin
  insert into public.fiduciary_external_notes (firm_id, external_client_id, body, author_id) values (v_firm, p_ext, trim(p_body), auth.uid());
end;
$$;
revoke execute on function public.acc_ext_add_note(uuid, text) from public, anon;
grant execute on function public.acc_ext_add_note(uuid, text) to authenticated;

create or replace function public.acc_ext_archive_note(p_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.fiduciary_external_notes set archived_at = now()
  where id = p_id and firm_id = public.my_fiduciary_firm_id()
    and (author_id = auth.uid() or public.my_fiduciary_role() in ('OWNER', 'ADMIN'));
end;
$$;
revoke execute on function public.acc_ext_archive_note(uuid) from public, anon;
grant execute on function public.acc_ext_archive_note(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Work: templates, items, steps.

create or replace function public.acc_process_templates()
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
begin
  if v_firm is null then raise exception 'Accès refusé'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name, 'kind', t.kind, 'steps', to_jsonb(t.steps), 'updated_at', t.updated_at) order by t.name)
    from public.fiduciary_process_templates t where t.firm_id = v_firm and t.archived_at is null
  ), '[]'::jsonb);
end;
$$;
revoke execute on function public.acc_process_templates() from public, anon;
grant execute on function public.acc_process_templates() to authenticated;

create or replace function public.acc_save_process_template(p_id uuid, p_name text, p_kind text, p_steps text[])
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
  v_steps text[] := (select array_agg(left(trim(s), 200) order by o) from unnest(coalesce(p_steps, '{}')) with ordinality as u(s, o) where trim(s) <> '');
  v_id uuid;
begin
  if v_firm is null then raise exception 'Accès refusé'; end if;
  if v_steps is null then raise exception 'Ajoutez au moins une étape'; end if;
  if p_id is null then
    insert into public.fiduciary_process_templates (firm_id, name, kind, steps) values (v_firm, trim(p_name), coalesce(p_kind, 'other'), v_steps) returning id into v_id;
  else
    update public.fiduciary_process_templates set name = trim(p_name), kind = coalesce(p_kind, kind), steps = v_steps, updated_at = now()
    where id = p_id and firm_id = v_firm returning id into v_id;
    if v_id is null then raise exception 'Modèle introuvable'; end if;
  end if;
  return v_id;
end;
$$;
revoke execute on function public.acc_save_process_template(uuid, text, text, text[]) from public, anon;
grant execute on function public.acc_save_process_template(uuid, text, text, text[]) to authenticated;

create or replace function public.acc_archive_process_template(p_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.fiduciary_process_templates set archived_at = now() where id = p_id and firm_id = public.my_fiduciary_firm_id();
end;
$$;
revoke execute on function public.acc_archive_process_template(uuid) from public, anon;
grant execute on function public.acc_archive_process_template(uuid) to authenticated;

-- Work items with their steps. Filters are optional.
create or replace function public.acc_work_items(p_org uuid default null, p_ext uuid default null, p_include_done boolean default true)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
begin
  if v_firm is null then raise exception 'Accès refusé'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', w.id, 'organization_id', w.organization_id, 'external_client_id', w.external_client_id,
      'client_name', public.acc_target_name(w.organization_id, w.external_client_id),
      'title', w.title, 'kind', w.kind, 'period_label', w.period_label, 'due_date', w.due_date,
      'assigned_to', w.assigned_to, 'assigned_name', public.acc_member_name(v_firm, w.assigned_to),
      'status', w.status, 'created_at', w.created_at, 'completed_at', w.completed_at,
      'minutes', (select coalesce(sum(t.minutes), 0) from public.fiduciary_time_entries t where t.work_item_id = w.id and t.status <> 'void'),
      'steps', coalesce((
        select jsonb_agg(jsonb_build_object('id', s.id, 'title', s.title, 'done', s.done_at is not null, 'done_at', s.done_at,
          'done_by_name', public.acc_member_name(v_firm, s.done_by)) order by s.sort_order, s.created_at)
        from public.fiduciary_work_steps s where s.work_item_id = w.id and s.archived_at is null
      ), '[]'::jsonb)
    ) order by (w.status in ('done', 'cancelled')), w.due_date nulls last, w.created_at)
    from public.fiduciary_work_items w
    where w.firm_id = v_firm
      and (w.organization_id is null or w.organization_id in (select public.fiduciary_org_ids(null)))
      and (w.external_client_id is null or exists (select 1 from public.fiduciary_external_clients c where c.id = w.external_client_id and c.status = 'ACTIVE'))
      and (p_org is null or w.organization_id = p_org)
      and (p_ext is null or w.external_client_id = p_ext)
      and w.status <> 'cancelled'
      and (p_include_done or w.status <> 'done')
  ), '[]'::jsonb);
end;
$$;
revoke execute on function public.acc_work_items(uuid, uuid, boolean) from public, anon;
grant execute on function public.acc_work_items(uuid, uuid, boolean) to authenticated;

create or replace function public.acc_create_work_item(
  p_org uuid, p_ext uuid, p_title text, p_kind text, p_period text, p_due date, p_assigned uuid, p_steps text[], p_template uuid default null
)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.acc_assert_target(p_org, p_ext);
  v_id uuid;
  v_step text;
  v_i int := 0;
begin
  if p_assigned is not null and not exists (select 1 from public.fiduciary_members where firm_id = v_firm and user_id = p_assigned) then
    raise exception 'Collaborateur inconnu';
  end if;
  if p_template is not null and not exists (select 1 from public.fiduciary_process_templates where id = p_template and firm_id = v_firm) then
    raise exception 'Modèle introuvable';
  end if;
  insert into public.fiduciary_work_items (firm_id, organization_id, external_client_id, title, kind, period_label, due_date, assigned_to, template_id)
  values (v_firm, p_org, p_ext, trim(p_title), coalesce(p_kind, 'other'), nullif(trim(coalesce(p_period, '')), ''), p_due, p_assigned, p_template)
  returning id into v_id;
  foreach v_step in array coalesce(p_steps, '{}') loop
    if trim(v_step) <> '' then
      v_i := v_i + 1;
      insert into public.fiduciary_work_steps (work_item_id, title, sort_order) values (v_id, left(trim(v_step), 200), v_i);
    end if;
  end loop;
  perform public.fiduciary_audit(v_firm, p_org, 'work_created', jsonb_build_object('title', trim(p_title), 'external_client_id', p_ext));
  return v_id;
end;
$$;
revoke execute on function public.acc_create_work_item(uuid, uuid, text, text, text, date, uuid, text[], uuid) from public, anon;
grant execute on function public.acc_create_work_item(uuid, uuid, text, text, text, date, uuid, text[], uuid) to authenticated;

-- p_patch: title, period_label, due_date, assigned_to, status (any subset).
create or replace function public.acc_update_work_item(p_id uuid, p_patch jsonb)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_w public.fiduciary_work_items%rowtype;
  v_firm uuid;
  v_status text;
begin
  select * into v_w from public.fiduciary_work_items where id = p_id;
  if not found then raise exception 'Travail introuvable'; end if;
  v_firm := public.acc_assert_target(v_w.organization_id, v_w.external_client_id);
  if p_patch ? 'assigned_to' and nullif(p_patch ->> 'assigned_to', '') is not null
     and not exists (select 1 from public.fiduciary_members where firm_id = v_firm and user_id = (p_patch ->> 'assigned_to')::uuid) then
    raise exception 'Collaborateur inconnu';
  end if;
  v_status := coalesce(p_patch ->> 'status', v_w.status);
  update public.fiduciary_work_items set
    title = case when p_patch ? 'title' then trim(p_patch ->> 'title') else title end,
    period_label = case when p_patch ? 'period_label' then nullif(trim(coalesce(p_patch ->> 'period_label', '')), '') else period_label end,
    due_date = case when p_patch ? 'due_date' then nullif(p_patch ->> 'due_date', '')::date else due_date end,
    assigned_to = case when p_patch ? 'assigned_to' then nullif(p_patch ->> 'assigned_to', '')::uuid else assigned_to end,
    status = v_status,
    completed_at = case when v_status = 'done' then coalesce(completed_at, now()) else null end,
    updated_at = now()
  where id = p_id;
  if p_patch ? 'status' and v_status <> v_w.status then
    perform public.fiduciary_audit(v_firm, v_w.organization_id, 'work_' || v_status, jsonb_build_object('title', v_w.title, 'external_client_id', v_w.external_client_id));
  end if;
end;
$$;
revoke execute on function public.acc_update_work_item(uuid, jsonb) from public, anon;
grant execute on function public.acc_update_work_item(uuid, jsonb) to authenticated;

-- Check / uncheck a step; the item follows (first step: in progress; all
-- steps: done; unchecked after done: in progress again).
create or replace function public.acc_toggle_work_step(p_step uuid, p_done boolean)
returns text
language plpgsql security definer set search_path = public as $$
declare
  v_s public.fiduciary_work_steps%rowtype;
  v_w public.fiduciary_work_items%rowtype;
  v_left int;
  v_status text;
begin
  select * into v_s from public.fiduciary_work_steps where id = p_step;
  if not found then raise exception 'Étape introuvable'; end if;
  select * into v_w from public.fiduciary_work_items where id = v_s.work_item_id;
  perform public.acc_assert_target(v_w.organization_id, v_w.external_client_id);
  update public.fiduciary_work_steps set
    done_at = case when p_done then coalesce(done_at, now()) else null end,
    done_by = case when p_done then coalesce(done_by, auth.uid()) else null end
  where id = p_step;
  select count(*) into v_left from public.fiduciary_work_steps where work_item_id = v_w.id and archived_at is null and done_at is null;
  v_status := case
    when v_left = 0 then 'done'
    when v_w.status in ('todo', 'done') then 'in_progress'
    else v_w.status end;
  update public.fiduciary_work_items set status = v_status,
    completed_at = case when v_status = 'done' then coalesce(completed_at, now()) else null end, updated_at = now()
  where id = v_w.id;
  return v_status;
end;
$$;
revoke execute on function public.acc_toggle_work_step(uuid, boolean) from public, anon;
grant execute on function public.acc_toggle_work_step(uuid, boolean) to authenticated;

create or replace function public.acc_add_work_step(p_item uuid, p_title text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_w public.fiduciary_work_items%rowtype;
  v_id uuid;
begin
  select * into v_w from public.fiduciary_work_items where id = p_item;
  if not found then raise exception 'Travail introuvable'; end if;
  perform public.acc_assert_target(v_w.organization_id, v_w.external_client_id);
  insert into public.fiduciary_work_steps (work_item_id, title, sort_order)
  values (p_item, left(trim(p_title), 200), coalesce((select max(sort_order) from public.fiduciary_work_steps where work_item_id = p_item), 0) + 1)
  returning id into v_id;
  if v_w.status = 'done' then update public.fiduciary_work_items set status = 'in_progress', completed_at = null, updated_at = now() where id = p_item; end if;
  return v_id;
end;
$$;
revoke execute on function public.acc_add_work_step(uuid, text) from public, anon;
grant execute on function public.acc_add_work_step(uuid, text) to authenticated;

create or replace function public.acc_archive_work_step(p_step uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_w public.fiduciary_work_items%rowtype;
begin
  select w.* into v_w from public.fiduciary_work_items w join public.fiduciary_work_steps s on s.work_item_id = w.id where s.id = p_step;
  if not found then raise exception 'Étape introuvable'; end if;
  perform public.acc_assert_target(v_w.organization_id, v_w.external_client_id);
  update public.fiduciary_work_steps set archived_at = now() where id = p_step;
end;
$$;
revoke execute on function public.acc_archive_work_step(uuid) from public, anon;
grant execute on function public.acc_archive_work_step(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Time and fees

-- The rate of a client: its own, else the firm's default.
create or replace function public.acc_client_rate(p_firm uuid, p_org uuid, p_ext uuid)
returns numeric
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select hourly_rate from public.fiduciary_client_profiles where firm_id = p_firm and organization_id = p_org),
    (select hourly_rate from public.fiduciary_external_clients where id = p_ext),
    (select default_hourly_rate from public.fiduciary_firms where id = p_firm)
  );
$$;
revoke execute on function public.acc_client_rate(uuid, uuid, uuid) from public, anon, authenticated;

create or replace function public.acc_set_client_rate(p_org uuid, p_rate numeric)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.acc_assert_client(p_org);
begin
  insert into public.fiduciary_client_profiles (firm_id, organization_id, hourly_rate, updated_by, updated_at)
  values (v_firm, p_org, p_rate, auth.uid(), now())
  on conflict (firm_id, organization_id) do update set hourly_rate = excluded.hourly_rate, updated_by = auth.uid(), updated_at = now();
end;
$$;
revoke execute on function public.acc_set_client_rate(uuid, numeric) from public, anon;
grant execute on function public.acc_set_client_rate(uuid, numeric) to authenticated;

create or replace function public.acc_time_entries(p_from date default null, p_to date default null, p_org uuid default null, p_ext uuid default null)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
begin
  if v_firm is null then raise exception 'Accès refusé'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', t.id, 'user_id', t.user_id, 'user_name', public.acc_member_name(v_firm, t.user_id), 'mine', t.user_id = auth.uid(),
      'organization_id', t.organization_id, 'external_client_id', t.external_client_id,
      'client_name', public.acc_target_name(t.organization_id, t.external_client_id),
      'work_item_id', t.work_item_id, 'work_title', (select title from public.fiduciary_work_items w where w.id = t.work_item_id),
      'entry_date', t.entry_date, 'minutes', t.minutes, 'description', t.description, 'billable', t.billable,
      'rate_chf', t.rate_chf, 'status', t.status, 'billed_at', t.billed_at
    ) order by t.entry_date desc, t.created_at desc)
    from public.fiduciary_time_entries t
    where t.firm_id = v_firm and t.status <> 'void'
      and (t.organization_id is null or t.organization_id in (select public.fiduciary_org_ids(null)))
      and (p_from is null or t.entry_date >= p_from) and (p_to is null or t.entry_date <= p_to)
      and (p_org is null or t.organization_id = p_org) and (p_ext is null or t.external_client_id = p_ext)
  ), '[]'::jsonb);
end;
$$;
revoke execute on function public.acc_time_entries(date, date, uuid, uuid) from public, anon;
grant execute on function public.acc_time_entries(date, date, uuid, uuid) to authenticated;

create or replace function public.acc_add_time(p_org uuid, p_ext uuid, p_date date, p_minutes integer, p_description text, p_billable boolean default true, p_work_item uuid default null)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.acc_assert_target(p_org, p_ext);
  v_id uuid;
begin
  if p_work_item is not null and not exists (
    select 1 from public.fiduciary_work_items where id = p_work_item and firm_id = v_firm
      and organization_id is not distinct from p_org and external_client_id is not distinct from p_ext
  ) then
    raise exception 'Travail introuvable';
  end if;
  insert into public.fiduciary_time_entries (firm_id, user_id, organization_id, external_client_id, work_item_id, entry_date, minutes, description, billable, rate_chf)
  values (v_firm, auth.uid(), p_org, p_ext, p_work_item, coalesce(p_date, current_date), p_minutes, nullif(trim(coalesce(p_description, '')), ''),
          coalesce(p_billable, true), public.acc_client_rate(v_firm, p_org, p_ext))
  returning id into v_id;
  return v_id;
end;
$$;
revoke execute on function public.acc_add_time(uuid, uuid, date, integer, text, boolean, uuid) from public, anon;
grant execute on function public.acc_add_time(uuid, uuid, date, integer, text, boolean, uuid) to authenticated;

-- p_patch: entry_date, minutes, description, billable, rate_chf. Own entries
-- (or admins), only while not billed.
create or replace function public.acc_update_time(p_id uuid, p_patch jsonb)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_t public.fiduciary_time_entries%rowtype;
begin
  select * into v_t from public.fiduciary_time_entries where id = p_id and firm_id = public.my_fiduciary_firm_id();
  if not found or not (v_t.user_id = auth.uid() or public.my_fiduciary_role() in ('OWNER', 'ADMIN')) then raise exception 'Accès refusé'; end if;
  if v_t.status <> 'open' then raise exception 'Temps déjà facturé'; end if;
  update public.fiduciary_time_entries set
    entry_date = coalesce((p_patch ->> 'entry_date')::date, entry_date),
    minutes = coalesce((p_patch ->> 'minutes')::integer, minutes),
    description = case when p_patch ? 'description' then nullif(trim(coalesce(p_patch ->> 'description', '')), '') else description end,
    billable = coalesce((p_patch ->> 'billable')::boolean, billable),
    rate_chf = case when p_patch ? 'rate_chf' then nullif(p_patch ->> 'rate_chf', '')::numeric else rate_chf end,
    updated_at = now()
  where id = p_id;
end;
$$;
revoke execute on function public.acc_update_time(uuid, jsonb) from public, anon;
grant execute on function public.acc_update_time(uuid, jsonb) to authenticated;

-- void (own or admin) / billed (admins, a batch) / reopen (admins).
create or replace function public.acc_time_action(p_ids uuid[], p_action text)
returns integer
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
  v_admin boolean := public.my_fiduciary_role() in ('OWNER', 'ADMIN');
  v_n int;
begin
  if v_firm is null then raise exception 'Accès refusé'; end if;
  if p_action = 'void' then
    update public.fiduciary_time_entries set status = 'void', updated_at = now()
    where id = any (p_ids) and firm_id = v_firm and status = 'open' and (user_id = auth.uid() or v_admin);
  elsif p_action = 'billed' then
    if not v_admin then raise exception 'Réservé aux administrateurs'; end if;
    update public.fiduciary_time_entries set status = 'billed', billed_at = now(), updated_at = now()
    where id = any (p_ids) and firm_id = v_firm and status = 'open';
  elsif p_action = 'reopen' then
    if not v_admin then raise exception 'Réservé aux administrateurs'; end if;
    update public.fiduciary_time_entries set status = 'open', billed_at = null, updated_at = now()
    where id = any (p_ids) and firm_id = v_firm and status = 'billed';
  else
    raise exception 'Action inconnue';
  end if;
  get diagnostics v_n = row_count;
  return v_n;
end;
$$;
revoke execute on function public.acc_time_action(uuid[], text) from public, anon;
grant execute on function public.acc_time_action(uuid[], text) to authenticated;

-- ---------------------------------------------------------------------------
-- Approvals

create or replace function public.acc_approvals(p_org uuid default null, p_ext uuid default null)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
begin
  if v_firm is null then raise exception 'Accès refusé'; end if;
  return coalesce((
    select jsonb_agg(to_jsonb(a) - 'firm_id' - 'signature_data' || jsonb_build_object(
      'client_name', public.acc_target_name(a.organization_id, a.external_client_id),
      'created_by_name', public.acc_member_name(v_firm, a.created_by),
      'signed', a.signature_data is not null,
      'signature_data', case when a.status = 'approved' then a.signature_data end
    ) order by (a.status = 'pending') desc, a.created_at desc)
    from public.fiduciary_approvals a
    where a.firm_id = v_firm and a.status <> 'cancelled'
      and (a.organization_id is null or a.organization_id in (select public.fiduciary_org_ids(null)))
      and (p_org is null or a.organization_id = p_org) and (p_ext is null or a.external_client_id = p_ext)
  ), '[]'::jsonb);
end;
$$;
revoke execute on function public.acc_approvals(uuid, uuid) from public, anon;
grant execute on function public.acc_approvals(uuid, uuid) to authenticated;

create or replace function public.fiduciary_approval_notify(p_id uuid, p_reminder boolean)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_a public.fiduciary_approvals%rowtype;
  v_f public.fiduciary_firms%rowtype;
  v_c public.fiduciary_external_clients%rowtype;
  v_payload jsonb;
begin
  select * into v_a from public.fiduciary_approvals where id = p_id;
  select * into v_f from public.fiduciary_firms where id = v_a.firm_id;
  v_payload := jsonb_build_object('firm_name', v_f.name, 'title', v_a.title, 'details', v_a.message, 'due_date', v_a.due_date,
    'brand_color', v_f.brand_color, 'reminder', p_reminder, 'reply_to', public.fiduciary_firm_reply_to(v_f.id));
  if v_a.organization_id is not null then
    perform public.fiduciary_notify_org_finance(v_a.organization_id, 'approval_new',
      case when p_reminder then 'Rappel : document à valider' else 'Document à valider' end,
      v_f.name || ' : ' || v_a.title, v_payload || jsonb_build_object('organization_name', (select name from public.organizations where id = v_a.organization_id)));
  else
    select * into v_c from public.fiduciary_external_clients where id = v_a.external_client_id;
    if v_c.email is not null then
      perform public.fiduciary_queue_email('approval_new', v_c.email, v_c.locale,
        v_payload || jsonb_build_object('company_name', v_c.name, 'contact_name', v_c.contact_name, 'portal_token', v_c.portal_token));
    end if;
  end if;
end;
$$;
revoke execute on function public.fiduciary_approval_notify(uuid, boolean) from public, anon, authenticated;

create or replace function public.acc_create_approval(
  p_org uuid, p_ext uuid, p_kind text, p_title text, p_message text, p_file_path text, p_file_name text, p_sha256 text, p_due date default null
)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.acc_assert_target(p_org, p_ext);
  v_id uuid;
begin
  if p_file_path is not null and split_part(p_file_path, '/', 2) <> v_firm::text then raise exception 'Fichier invalide'; end if;
  if (select count(*) from public.fiduciary_approvals where firm_id = v_firm and created_at > now() - interval '1 day') >= 200 then
    raise exception 'Trop d''envois aujourd''hui';
  end if;
  insert into public.fiduciary_approvals (firm_id, organization_id, external_client_id, kind, title, message, file_path, file_name, file_sha256, due_date)
  values (v_firm, p_org, p_ext, coalesce(p_kind, 'other'), trim(p_title), nullif(trim(coalesce(p_message, '')), ''), p_file_path,
          nullif(p_file_name, ''), nullif(lower(p_sha256), ''), p_due)
  returning id into v_id;
  perform public.fiduciary_audit(v_firm, p_org, 'approval_sent', jsonb_build_object('title', trim(p_title), 'external_client_id', p_ext));
  perform public.fiduciary_approval_notify(v_id, false);
  return v_id;
end;
$$;
revoke execute on function public.acc_create_approval(uuid, uuid, text, text, text, text, text, text, date) from public, anon;
grant execute on function public.acc_create_approval(uuid, uuid, text, text, text, text, text, text, date) to authenticated;

-- remind / cancel
create or replace function public.acc_approval_action(p_id uuid, p_action text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_a public.fiduciary_approvals%rowtype;
  v_firm uuid;
begin
  select * into v_a from public.fiduciary_approvals where id = p_id;
  if not found then raise exception 'Document introuvable'; end if;
  v_firm := public.acc_assert_target(v_a.organization_id, v_a.external_client_id);
  if v_a.status <> 'pending' then raise exception 'Document déjà traité'; end if;
  if p_action = 'remind' then
    if v_a.last_reminded_at > now() - interval '20 hours' then raise exception 'Un rappel a déjà été envoyé aujourd''hui'; end if;
    update public.fiduciary_approvals set last_reminded_at = now() where id = p_id;
    perform public.fiduciary_approval_notify(p_id, true);
  elsif p_action = 'cancel' then
    update public.fiduciary_approvals set status = 'cancelled' where id = p_id;
  else
    raise exception 'Action inconnue';
  end if;
  perform public.fiduciary_audit(v_firm, v_a.organization_id, 'approval_' || p_action, jsonb_build_object('title', v_a.title));
end;
$$;
revoke execute on function public.acc_approval_action(uuid, text) from public, anon;
grant execute on function public.acc_approval_action(uuid, text) to authenticated;

-- Shared by the Cantia client (org_decide_approval) and the private link
-- (fiduciary_portal_decide).
create or replace function public.fiduciary_apply_approval_decision(
  p_id uuid, p_accept boolean, p_signer text, p_signature text, p_reason text, p_user uuid, p_ip text
)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_a public.fiduciary_approvals%rowtype;
begin
  select * into v_a from public.fiduciary_approvals where id = p_id for update;
  if not found or v_a.status <> 'pending' then raise exception 'Document déjà traité'; end if;
  if p_accept and (coalesce(trim(p_signer), '') = '' or p_signature is null or p_signature not like 'data:image/%') then
    raise exception 'Nom et signature requis';
  end if;
  if not p_accept and coalesce(trim(p_reason), '') = '' then raise exception 'Indiquez la raison du refus'; end if;
  update public.fiduciary_approvals set
    status = case when p_accept then 'approved' else 'rejected' end,
    signer_name = left(trim(coalesce(p_signer, '')), 120),
    signature_data = case when p_accept then p_signature end,
    rejection_reason = case when p_accept then null else left(trim(p_reason), 1000) end,
    decided_by = p_user, decided_at = now(), decided_ip = left(p_ip, 64)
  where id = p_id;
  insert into public.fiduciary_audit_log (firm_id, organization_id, actor_id, action, details)
  values (v_a.firm_id, v_a.organization_id, p_user, case when p_accept then 'approval_approved' else 'approval_rejected' end,
          jsonb_build_object('title', v_a.title, 'external_client_id', v_a.external_client_id, 'signer', trim(coalesce(p_signer, ''))));
  perform public.fiduciary_notify_firm_people(v_a.firm_id, v_a.created_by, 'approval_decided', jsonb_build_object(
    'organization_name', public.acc_target_name(v_a.organization_id, v_a.external_client_id), 'title', v_a.title,
    'accepted', p_accept, 'details', case when p_accept then null else trim(p_reason) end,
    'organization_id', v_a.organization_id, 'external_client_id', v_a.external_client_id
  ));
end;
$$;
revoke execute on function public.fiduciary_apply_approval_decision(uuid, boolean, text, text, text, uuid, text) from public, anon, authenticated;

create or replace function public.org_fiduciary_approvals(p_org uuid)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.can_view_org_finances(p_org) then raise exception 'Accès refusé'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', a.id, 'firm_name', f.name, 'kind', a.kind, 'title', a.title, 'message', a.message, 'file_path', a.file_path,
      'file_name', a.file_name, 'file_sha256', a.file_sha256, 'due_date', a.due_date, 'status', a.status,
      'signer_name', a.signer_name, 'decided_at', a.decided_at, 'rejection_reason', a.rejection_reason, 'created_at', a.created_at
    ) order by (a.status = 'pending') desc, a.created_at desc)
    from public.fiduciary_approvals a join public.fiduciary_firms f on f.id = a.firm_id
    where a.organization_id = p_org and a.status <> 'cancelled'
      and exists (select 1 from public.fiduciary_client_access x where x.firm_id = a.firm_id and x.organization_id = p_org and x.status = 'ACTIVE')
  ), '[]'::jsonb);
end;
$$;
revoke execute on function public.org_fiduciary_approvals(uuid) from public, anon;
grant execute on function public.org_fiduciary_approvals(uuid) to authenticated;

create or replace function public.org_decide_approval(p_id uuid, p_accept boolean, p_signer text, p_signature text, p_reason text default null)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_org uuid;
begin
  select organization_id into v_org from public.fiduciary_approvals where id = p_id;
  if v_org is null or not public.can_view_org_finances(v_org) then raise exception 'Accès refusé'; end if;
  perform public.fiduciary_apply_approval_decision(p_id, p_accept, p_signer, p_signature, p_reason, auth.uid(), null);
end;
$$;
revoke execute on function public.org_decide_approval(uuid, boolean, text, text, text) from public, anon;
grant execute on function public.org_decide_approval(uuid, boolean, text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Entry proposals

create or replace function public.acc_entry_proposals(p_org uuid)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_firm uuid := public.acc_assert_client(p_org);
begin
  return coalesce((
    select jsonb_agg(to_jsonb(p) - 'firm_id' || jsonb_build_object('created_by_name', public.acc_member_name(v_firm, p.created_by)) order by p.created_at desc)
    from public.fiduciary_entry_proposals p
    where p.firm_id = v_firm and p.organization_id = p_org and p.status <> 'cancelled'
  ), '[]'::jsonb);
end;
$$;
revoke execute on function public.acc_entry_proposals(uuid) from public, anon;
grant execute on function public.acc_entry_proposals(uuid) to authenticated;

-- Lines: [{account_code, debit, credit, label}], at least two, each one
-- side only, on active accounts of the client, debit = credit.
create or replace function public.fiduciary_check_entry_lines(p_org uuid, p_lines jsonb)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_line jsonb;
  v_out jsonb := '[]'::jsonb;
  v_debit numeric := 0;
  v_credit numeric := 0;
  v_d numeric;
  v_c numeric;
  v_code text;
begin
  if jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) < 2 or jsonb_array_length(p_lines) > 50 then
    raise exception 'Une écriture compte au moins deux lignes';
  end if;
  for v_line in select * from jsonb_array_elements(p_lines) loop
    v_code := trim(coalesce(v_line ->> 'account_code', ''));
    v_d := round(coalesce(nullif(v_line ->> 'debit', '')::numeric, 0), 2);
    v_c := round(coalesce(nullif(v_line ->> 'credit', '')::numeric, 0), 2);
    if not ((v_d > 0 and v_c = 0) or (v_c > 0 and v_d = 0)) then raise exception 'Chaque ligne a un montant au débit ou au crédit'; end if;
    if not exists (select 1 from public.accounting_accounts where organization_id = p_org and code = v_code and is_active) then
      raise exception 'Compte % inconnu chez ce mandant', v_code;
    end if;
    v_debit := v_debit + v_d;
    v_credit := v_credit + v_c;
    v_out := v_out || jsonb_build_array(jsonb_build_object('account_code', v_code, 'debit', v_d, 'credit', v_c, 'label', nullif(left(trim(coalesce(v_line ->> 'label', '')), 200), '')));
  end loop;
  if v_debit <> v_credit then raise exception 'Écriture déséquilibrée : débit % ≠ crédit %', v_debit, v_credit; end if;
  return v_out;
end;
$$;
revoke execute on function public.fiduciary_check_entry_lines(uuid, jsonb) from public, anon, authenticated;

create or replace function public.acc_create_entry_proposal(p_org uuid, p_date date, p_label text, p_reason text, p_lines jsonb)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.acc_assert_client(p_org);
  v_lines jsonb;
  v_id uuid;
  v_firm_name text;
begin
  if not public.fiduciary_can(p_org, 'PROPOSE_ENTRIES') then raise exception 'Le mandant n''a pas autorisé les propositions d''écritures'; end if;
  v_lines := public.fiduciary_check_entry_lines(p_org, p_lines);
  insert into public.fiduciary_entry_proposals (firm_id, organization_id, entry_date, label, reason, lines)
  values (v_firm, p_org, p_date, trim(p_label), nullif(trim(coalesce(p_reason, '')), ''), v_lines)
  returning id into v_id;
  select name into v_firm_name from public.fiduciary_firms where id = v_firm;
  perform public.fiduciary_audit(v_firm, p_org, 'entry_proposed', jsonb_build_object('label', trim(p_label)));
  perform public.fiduciary_notify_org_finance(p_org, 'proposal_new', 'Écriture proposée par votre fiduciaire', v_firm_name || ' : ' || trim(p_label),
    jsonb_build_object('firm_name', v_firm_name, 'title', trim(p_label), 'details', nullif(trim(coalesce(p_reason, '')), ''),
      'organization_name', (select name from public.organizations where id = p_org)));
  return v_id;
end;
$$;
revoke execute on function public.acc_create_entry_proposal(uuid, date, text, text, jsonb) from public, anon;
grant execute on function public.acc_create_entry_proposal(uuid, date, text, text, jsonb) to authenticated;

create or replace function public.acc_cancel_entry_proposal(p_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_p public.fiduciary_entry_proposals%rowtype;
begin
  select * into v_p from public.fiduciary_entry_proposals where id = p_id;
  if not found or v_p.firm_id is distinct from public.acc_assert_client(v_p.organization_id) then raise exception 'Proposition introuvable'; end if;
  update public.fiduciary_entry_proposals set status = 'cancelled' where id = p_id and status = 'pending';
end;
$$;
revoke execute on function public.acc_cancel_entry_proposal(uuid) from public, anon;
grant execute on function public.acc_cancel_entry_proposal(uuid) to authenticated;

create or replace function public.org_entry_proposals(p_org uuid)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.can_view_org_finances(p_org) then raise exception 'Accès refusé'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', p.id, 'firm_name', f.name, 'entry_date', p.entry_date, 'label', p.label, 'reason', p.reason,
      'lines', (select jsonb_agg(l || jsonb_build_object('account_label', (select a.label from public.accounting_accounts a where a.organization_id = p_org and a.code = l ->> 'account_code')))
                from jsonb_array_elements(p.lines) l),
      'status', p.status, 'posted', p.posted, 'entry_id', p.entry_id, 'created_at', p.created_at, 'decided_at', p.decided_at,
      'rejection_reason', p.rejection_reason
    ) order by (p.status = 'pending') desc, p.created_at desc)
    from public.fiduciary_entry_proposals p join public.fiduciary_firms f on f.id = p.firm_id
    where p.organization_id = p_org and p.status <> 'cancelled'
  ), '[]'::jsonb);
end;
$$;
revoke execute on function public.org_entry_proposals(uuid) from public, anon;
grant execute on function public.org_entry_proposals(uuid) to authenticated;

-- Accept: the entry is created in the client's books (draft, posted when the
-- person may post). Reject: with a reason.
create or replace function public.org_decide_entry_proposal(p_id uuid, p_accept boolean, p_reason text default null)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_p public.fiduciary_entry_proposals%rowtype;
  v_fy uuid;
  v_journal uuid;
  v_entry uuid;
  v_lines jsonb;
  v_line jsonb;
  v_i int := 0;
  v_posted boolean := false;
  v_firm_name text;
begin
  select * into v_p from public.fiduciary_entry_proposals where id = p_id for update;
  if not found or v_p.status <> 'pending' then raise exception 'Proposition déjà traitée'; end if;
  if not public.can_manage_org_accounting_drafts(v_p.organization_id) then raise exception 'Accès refusé : droits comptables requis'; end if;
  select name into v_firm_name from public.fiduciary_firms where id = v_p.firm_id;
  if p_accept then
    v_lines := public.fiduciary_check_entry_lines(v_p.organization_id, v_p.lines);
    v_fy := public.find_org_open_fiscal_year(v_p.organization_id, v_p.entry_date);
    if v_fy is null then raise exception 'Aucun exercice ouvert au %', to_char(v_p.entry_date, 'DD.MM.YYYY'); end if;
    select id into v_journal from public.accounting_journals where organization_id = v_p.organization_id and code = 'OD' limit 1;
    if v_journal is null then select id into v_journal from public.accounting_journals where organization_id = v_p.organization_id and is_active order by code limit 1; end if;
    insert into public.accounting_entries (organization_id, fiscal_year_id, journal_id, entry_date, label, external_reference, source, status, created_by)
    values (v_p.organization_id, v_fy, v_journal, v_p.entry_date, v_p.label, 'FID-' || left(v_p.id::text, 8), 'manuelle', 'brouillon', auth.uid())
    returning id into v_entry;
    for v_line in select * from jsonb_array_elements(v_lines) loop
      v_i := v_i + 1;
      insert into public.accounting_entry_lines (entry_id, account_id, debit, credit, label, sort_order)
      values (v_entry, (select id from public.accounting_accounts where organization_id = v_p.organization_id and code = v_line ->> 'account_code' limit 1),
              (v_line ->> 'debit')::numeric, (v_line ->> 'credit')::numeric, v_line ->> 'label', v_i);
    end loop;
    if public.can_post_org_accounting_entries(v_p.organization_id) then
      perform public.post_accounting_entry(v_entry);
      v_posted := true;
    end if;
    update public.fiduciary_entry_proposals set status = 'accepted', entry_id = v_entry, posted = v_posted, decided_by = auth.uid(), decided_at = now() where id = p_id;
  else
    if coalesce(trim(p_reason), '') = '' then raise exception 'Indiquez la raison du refus'; end if;
    update public.fiduciary_entry_proposals set status = 'rejected', rejection_reason = left(trim(p_reason), 1000), decided_by = auth.uid(), decided_at = now() where id = p_id;
  end if;
  insert into public.fiduciary_audit_log (firm_id, organization_id, actor_id, action, details)
  values (v_p.firm_id, v_p.organization_id, auth.uid(), case when p_accept then 'entry_accepted' else 'entry_rejected' end, jsonb_build_object('label', v_p.label));
  perform public.fiduciary_notify_firm_people(v_p.firm_id, v_p.created_by, 'proposal_decided', jsonb_build_object(
    'organization_name', (select name from public.organizations where id = v_p.organization_id), 'title', v_p.label,
    'accepted', p_accept, 'details', case when p_accept then null else trim(p_reason) end, 'organization_id', v_p.organization_id
  ));
  return jsonb_build_object('entry_id', v_entry, 'posted', v_posted);
end;
$$;
revoke execute on function public.org_decide_entry_proposal(uuid, boolean, text) from public, anon;
grant execute on function public.org_decide_entry_proposal(uuid, boolean, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Financial indicators from the posted ledger (Swiss SME chart of
-- accounts: 3 revenue, 4 material and third-party work, 5 personnel,
-- 6 other operating costs, 68 depreciation, 69 financial result, 7 and 8
-- outside operations, 89 taxes; 10 cash, 11 receivables, 12 stock,
-- 13 prepaid, 20–23 short-term debt, 24–27 long-term debt).

create or replace function public.acc_kpis_internal(p_org uuid, p_as_of date)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_from date;
  v_prev_from date;
  v_prev_to date;
  v_cur jsonb;
  v_prev jsonb;
  v_bal jsonb;
  v_monthly jsonb;
begin
  select start_date into v_from from public.accounting_fiscal_years
  where organization_id = p_org and p_as_of between start_date and end_date order by start_date desc limit 1;
  v_from := coalesce(v_from, date_trunc('year', p_as_of)::date);
  v_prev_from := (v_from - interval '1 year')::date;
  v_prev_to := (p_as_of - interval '1 year')::date;

  with lines as (
    select a.code, e.entry_date, l.debit, l.credit
    from public.accounting_entry_lines l
    join public.accounting_entries e on e.id = l.entry_id
    join public.accounting_accounts a on a.id = l.account_id
    where e.organization_id = p_org and e.status = 'comptabilisee' and e.entry_date <= p_as_of
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
    from public.accounting_entry_lines l
    join public.accounting_entries e on e.id = l.entry_id
    join public.accounting_accounts a on a.id = l.account_id
    where e.organization_id = p_org and e.status = 'comptabilisee' and e.entry_date <= p_as_of
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
    from public.accounting_entry_lines l
    join public.accounting_entries e on e.id = l.entry_id
    join public.accounting_accounts a on a.id = l.account_id
    where e.organization_id = p_org and e.status = 'comptabilisee' and e.entry_date >= mm and e.entry_date < mm + interval '1 month'
  ) x on true;

  return jsonb_build_object(
    'period', jsonb_build_object('from', v_from, 'to', p_as_of, 'prev_from', v_prev_from, 'prev_to', v_prev_to),
    'current', coalesce(v_cur, '{}'::jsonb),
    'previous', coalesce(v_prev, '{}'::jsonb),
    'balance', v_bal,
    'monthly', v_monthly,
    'last_entry_date', (select max(entry_date) from public.accounting_entries where organization_id = p_org and status = 'comptabilisee')
  );
end;
$$;
revoke execute on function public.acc_kpis_internal(uuid, date) from public, anon, authenticated;

create or replace function public.acc_client_kpis(p_org uuid, p_as_of date default current_date)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.acc_assert_client(p_org);
  if not public.fiduciary_can(p_org, 'VIEW_ACCOUNTING_DOCUMENTS') then raise exception 'Le mandant n''a pas ouvert sa comptabilité'; end if;
  return public.acc_kpis_internal(p_org, coalesce(p_as_of, current_date));
end;
$$;
revoke execute on function public.acc_client_kpis(uuid, date) from public, anon;
grant execute on function public.acc_client_kpis(uuid, date) to authenticated;

-- The portfolio: every active client of the firm, Cantia or not, with its
-- figures (when the ledger is open) and what is pending.
create or replace function public.acc_portfolio()
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
begin
  if v_firm is null then raise exception 'Accès refusé'; end if;
  return coalesce((
    select jsonb_agg(x order by x ->> 'name')
    from (
      select jsonb_build_object(
        'kind', 'cantia', 'organization_id', o.id, 'external_client_id', null, 'name', o.name, 'software', 'cantia',
        'assigned_to', p.assigned_to, 'assigned_name', public.acc_member_name(v_firm, p.assigned_to),
        'kpis', case when o.id in (select public.fiduciary_org_ids('VIEW_ACCOUNTING_DOCUMENTS')) then public.acc_kpis_internal(o.id, current_date) end,
        'requests_open', (select count(*) from public.fiduciary_requests r where r.firm_id = v_firm and r.organization_id = o.id and r.status = 'open'),
        'requests_answered', (select count(*) from public.fiduciary_requests r where r.firm_id = v_firm and r.organization_id = o.id and r.status = 'answered'),
        'work_open', (select count(*) from public.fiduciary_work_items w where w.firm_id = v_firm and w.organization_id = o.id and w.status not in ('done', 'cancelled')),
        'approvals_pending', (select count(*) from public.fiduciary_approvals a where a.firm_id = v_firm and a.organization_id = o.id and a.status = 'pending'),
        'unbilled_minutes', (select coalesce(sum(t.minutes), 0) from public.fiduciary_time_entries t where t.firm_id = v_firm and t.organization_id = o.id and t.status = 'open' and t.billable)
      ) as x
      from public.organizations o
      left join public.fiduciary_client_profiles p on p.firm_id = v_firm and p.organization_id = o.id
      where o.id in (select public.fiduciary_org_ids(null))
      union all
      select jsonb_build_object(
        'kind', 'external', 'organization_id', null, 'external_client_id', c.id, 'name', c.name, 'software', c.software,
        'assigned_to', c.assigned_to, 'assigned_name', public.acc_member_name(v_firm, c.assigned_to),
        'kpis', null,
        'requests_open', (select count(*) from public.fiduciary_external_requests r where r.external_client_id = c.id and r.status = 'open'),
        'requests_answered', (select count(*) from public.fiduciary_external_requests r where r.external_client_id = c.id and r.status = 'answered'),
        'work_open', (select count(*) from public.fiduciary_work_items w where w.external_client_id = c.id and w.status not in ('done', 'cancelled')),
        'approvals_pending', (select count(*) from public.fiduciary_approvals a where a.external_client_id = c.id and a.status = 'pending'),
        'unbilled_minutes', (select coalesce(sum(t.minutes), 0) from public.fiduciary_time_entries t where t.external_client_id = c.id and t.status = 'open' and t.billable)
      )
      from public.fiduciary_external_clients c
      where c.firm_id = v_firm and c.status = 'ACTIVE'
    ) t
  ), '[]'::jsonb);
end;
$$;
revoke execute on function public.acc_portfolio() from public, anon;
grant execute on function public.acc_portfolio() to authenticated;

-- ---------------------------------------------------------------------------
-- The private link of an external client (accounting.cantia.ch/depot).
-- Called by the fiduciary-portal edge function only (service role), which
-- also signs the files and the uploads.

create or replace function public.fiduciary_portal_client(p_token uuid)
returns public.fiduciary_external_clients
language sql stable security definer set search_path = public as $$
  select c.* from public.fiduciary_external_clients c join public.fiduciary_firms f on f.id = c.firm_id
  where c.portal_token = p_token and c.status = 'ACTIVE' and f.status = 'ACTIVE';
$$;
revoke execute on function public.fiduciary_portal_client(uuid) from public, anon, authenticated;

create or replace function public.fiduciary_portal_get(p_token uuid)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_c public.fiduciary_external_clients%rowtype;
  v_f public.fiduciary_firms%rowtype;
begin
  v_c := public.fiduciary_portal_client(p_token);
  if v_c.id is null then return null; end if;
  select * into v_f from public.fiduciary_firms where id = v_c.firm_id;
  return jsonb_build_object(
    'client', jsonb_build_object('id', v_c.id, 'name', v_c.name, 'contact_name', v_c.contact_name, 'locale', v_c.locale),
    'firm', jsonb_build_object('id', v_f.id, 'name', v_f.name, 'logo_data', v_f.logo_data, 'brand_color', v_f.brand_color,
      'phone', v_f.phone, 'email', coalesce(v_f.public_email, (select m.email from public.fiduciary_members m where m.firm_id = v_f.id and m.role = 'OWNER' limit 1)),
      'website', v_f.website, 'city', v_f.city),
    'requests', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', r.id, 'title', r.title, 'details', r.details, 'due_date', r.due_date, 'status', r.status,
        'client_message', r.client_message, 'created_at', r.created_at, 'answered_at', r.answered_at,
        'files', coalesce((select jsonb_agg(jsonb_build_object('id', f.id, 'file_name', f.file_name, 'size_bytes', f.size_bytes, 'created_at', f.created_at) order by f.created_at)
                           from public.fiduciary_external_request_files f where f.request_id = r.id), '[]'::jsonb)
      ) order by (r.status = 'done'), r.due_date nulls last, r.created_at desc)
      from public.fiduciary_external_requests r
      where r.external_client_id = v_c.id and (r.status in ('open', 'answered') or r.closed_at > now() - interval '60 days') and r.status <> 'cancelled'
    ), '[]'::jsonb),
    'approvals', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', a.id, 'kind', a.kind, 'title', a.title, 'message', a.message, 'file_path', a.file_path, 'file_name', a.file_name,
        'file_sha256', a.file_sha256, 'due_date', a.due_date, 'status', a.status, 'signer_name', a.signer_name,
        'decided_at', a.decided_at, 'created_at', a.created_at
      ) order by (a.status = 'pending') desc, a.created_at desc)
      from public.fiduciary_approvals a
      where a.external_client_id = v_c.id and (a.status = 'pending' or a.decided_at > now() - interval '90 days') and a.status <> 'cancelled'
    ), '[]'::jsonb)
  );
end;
$$;
revoke execute on function public.fiduciary_portal_get(uuid) from public, anon, authenticated;
grant execute on function public.fiduciary_portal_get(uuid) to service_role;

-- Where a file of this request goes: fiduciary/{firm}/ext/{client}/{request}/
create or replace function public.fiduciary_portal_upload_prefix(p_token uuid, p_request uuid)
returns text
language plpgsql stable security definer set search_path = public as $$
declare
  v_c public.fiduciary_external_clients%rowtype;
begin
  v_c := public.fiduciary_portal_client(p_token);
  if v_c.id is null then raise exception 'Lien invalide'; end if;
  if not exists (select 1 from public.fiduciary_external_requests where id = p_request and external_client_id = v_c.id and status in ('open', 'answered')) then
    raise exception 'Demande introuvable';
  end if;
  if (select count(*) from public.fiduciary_external_request_files where request_id = p_request) >= 40 then
    raise exception 'Trop de fichiers pour cette demande';
  end if;
  return 'fiduciary/' || v_c.firm_id || '/ext/' || v_c.id || '/' || p_request || '/';
end;
$$;
revoke execute on function public.fiduciary_portal_upload_prefix(uuid, uuid) from public, anon, authenticated;
grant execute on function public.fiduciary_portal_upload_prefix(uuid, uuid) to service_role;

create or replace function public.fiduciary_portal_add_file(p_token uuid, p_request uuid, p_path text, p_name text, p_size bigint)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_prefix text := public.fiduciary_portal_upload_prefix(p_token, p_request);
begin
  if p_path not like v_prefix || '%' or p_path like '%..%' then raise exception 'Chemin invalide'; end if;
  insert into public.fiduciary_external_request_files (request_id, external_client_id, file_path, file_name, size_bytes)
  select p_request, (public.fiduciary_portal_client(p_token)).id, p_path, left(coalesce(nullif(trim(p_name), ''), 'document'), 255), p_size;
end;
$$;
revoke execute on function public.fiduciary_portal_add_file(uuid, uuid, text, text, bigint) from public, anon, authenticated;
grant execute on function public.fiduciary_portal_add_file(uuid, uuid, text, text, bigint) to service_role;

create or replace function public.fiduciary_portal_answer(p_token uuid, p_request uuid, p_message text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_c public.fiduciary_external_clients%rowtype;
  v_r public.fiduciary_external_requests%rowtype;
begin
  v_c := public.fiduciary_portal_client(p_token);
  if v_c.id is null then raise exception 'Lien invalide'; end if;
  select * into v_r from public.fiduciary_external_requests where id = p_request and external_client_id = v_c.id and status in ('open', 'answered');
  if not found then raise exception 'Demande introuvable'; end if;
  if nullif(trim(coalesce(p_message, '')), '') is null and not exists (select 1 from public.fiduciary_external_request_files where request_id = p_request) then
    raise exception 'Ajoutez un fichier ou un message';
  end if;
  update public.fiduciary_external_requests set status = 'answered', answered_at = now(),
    client_message = coalesce(nullif(left(trim(coalesce(p_message, '')), 2000), ''), client_message)
  where id = p_request;
  insert into public.fiduciary_audit_log (firm_id, organization_id, actor_id, action, details)
  values (v_c.firm_id, null, null, 'request_answered', jsonb_build_object('external_client_id', v_c.id, 'title', v_r.title));
  perform public.fiduciary_notify_firm_people(v_c.firm_id, v_r.created_by, 'request_answered', jsonb_build_object(
    'organization_name', v_c.name, 'title', v_r.title, 'external_client_id', v_c.id
  ));
end;
$$;
revoke execute on function public.fiduciary_portal_answer(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.fiduciary_portal_answer(uuid, uuid, text) to service_role;

create or replace function public.fiduciary_portal_decide(p_token uuid, p_approval uuid, p_accept boolean, p_signer text, p_signature text, p_reason text, p_ip text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_c public.fiduciary_external_clients%rowtype;
begin
  v_c := public.fiduciary_portal_client(p_token);
  if v_c.id is null then raise exception 'Lien invalide'; end if;
  if not exists (select 1 from public.fiduciary_approvals where id = p_approval and external_client_id = v_c.id) then raise exception 'Document introuvable'; end if;
  perform public.fiduciary_apply_approval_decision(p_approval, p_accept, p_signer, p_signature, p_reason, null, p_ip);
end;
$$;
revoke execute on function public.fiduciary_portal_decide(uuid, uuid, boolean, text, text, text, text) from public, anon, authenticated;
grant execute on function public.fiduciary_portal_decide(uuid, uuid, boolean, text, text, text, text) to service_role;

notify pgrst, 'reload schema';
