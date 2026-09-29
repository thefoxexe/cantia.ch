-- Cantia Accounting (accounting.cantia.ch): fiduciaries working with their
-- Cantia clients. See docs/accounting.md.
--
-- Same users as the app and Partners (auth.users): a fiduciary employee
-- signs in with their Cantia account. A fiduciary firm is its own entity,
-- never an organizations row (those are construction companies).
--
-- Security model: a firm member reads a client's data only through
-- SELECT-only row level security policies that require an ACTIVE access
-- for that client carrying the right permission. Nothing is trusted from
-- the browser: the organization id a page asks for is irrelevant, the
-- database checks auth.uid() -> firm membership -> access -> permission on
-- every row. Revoking an access takes effect on the next query. Every
-- change of access is written to fiduciary_audit_log.

-- ---------------------------------------------------------------------------
-- Permissions

create or replace function public.fiduciary_all_permissions()
returns text[]
language sql immutable as $$
  select array[
    'VIEW_INVOICES', 'VIEW_QUOTES', 'VIEW_CUSTOMERS', 'VIEW_PAYMENT_STATUS',
    'VIEW_ACCOUNTING_DOCUMENTS', 'DOWNLOAD_DOCUMENTS', 'VIEW_EXPORTS',
    'VIEW_WORK_HOURS', 'VIEW_PAYROLL_DATA'
  ]::text[];
$$;

-- ACCOUNTING_STANDARD: what a fiduciary normally needs. Quotes, hours and
-- payroll stay closed until the client opens them.
create or replace function public.fiduciary_standard_permissions()
returns text[]
language sql immutable as $$
  select array[
    'VIEW_INVOICES', 'VIEW_CUSTOMERS', 'VIEW_PAYMENT_STATUS',
    'VIEW_ACCOUNTING_DOCUMENTS', 'DOWNLOAD_DOCUMENTS', 'VIEW_EXPORTS'
  ]::text[];
$$;

create or replace function public.fiduciary_clean_permissions(p_permissions text[])
returns text[]
language sql immutable as $$
  select coalesce(array_agg(distinct p order by p), '{}'::text[])
  from unnest(coalesce(p_permissions, '{}'::text[])) p
  where p = any (public.fiduciary_all_permissions());
$$;

-- ---------------------------------------------------------------------------
-- Tables

create table public.fiduciary_firms (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 2 and 160),
  phone text,
  address text,
  postal_code text,
  city text,
  country text not null default 'CH',
  ide_number text,
  website text,
  mandates_range text check (mandates_range in ('1-10', '11-50', '51-100', '100+')),
  software text[] not null default '{}',
  locale text not null default 'fr' check (locale in ('fr', 'de', 'it')),
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'SUSPENDED', 'BLOCKED')),
  -- Future directory (cantia.ch/fiduciaires): prepared, not used yet.
  verified boolean not null default false,
  public_directory_visible boolean not null default false,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.fiduciary_firms enable row level security;

-- One firm per user in V1 (the cockpit is "my firm").
create table public.fiduciary_members (
  firm_id uuid not null references public.fiduciary_firms(id) on delete cascade,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null default 'MEMBER' check (role in ('OWNER', 'ADMIN', 'MEMBER')),
  first_name text,
  last_name text,
  email text,
  -- Prepared for per-client scoping: false = only the clients listed in
  -- fiduciary_member_clients. Everyone sees every client in V1.
  all_clients boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (firm_id, user_id)
);
alter table public.fiduciary_members enable row level security;

create table public.fiduciary_member_clients (
  firm_id uuid not null,
  user_id uuid not null,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  primary key (firm_id, user_id, organization_id),
  foreign key (firm_id, user_id) references public.fiduciary_members(firm_id, user_id) on delete cascade
);
alter table public.fiduciary_member_clients enable row level security;

create table public.fiduciary_client_access (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.fiduciary_firms(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  -- PENDING_CLIENT: asked by the firm, waiting for the client.
  -- PENDING_FIRM: offered by the client, waiting for the firm.
  status text not null check (status in ('PENDING_CLIENT', 'PENDING_FIRM', 'ACTIVE', 'REFUSED', 'REVOKED', 'CANCELLED')),
  permissions text[] not null default public.fiduciary_standard_permissions(),
  source text not null check (source in ('FIRM_REQUEST', 'CLIENT_INVITE', 'NEW_CLIENT_INVITE')),
  requested_by uuid references auth.users(id),
  approved_by uuid references auth.users(id),
  revoked_by uuid references auth.users(id),
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  refused_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index fiduciary_client_access_open_idx on public.fiduciary_client_access (firm_id, organization_id)
  where status in ('PENDING_CLIENT', 'PENDING_FIRM', 'ACTIVE');
create index on public.fiduciary_client_access (organization_id);
alter table public.fiduciary_client_access enable row level security;

create table public.fiduciary_invitations (
  id uuid primary key default gen_random_uuid(),
  -- STAFF: a colleague joins the firm. CLIENT_TO_FIRM: a Cantia client
  -- invites a fiduciary not on Cantia Accounting yet. NEW_CLIENT: the firm
  -- invites a company not on Cantia yet.
  kind text not null check (kind in ('STAFF', 'CLIENT_TO_FIRM', 'NEW_CLIENT')),
  firm_id uuid references public.fiduciary_firms(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  email text not null,
  role text check (role in ('ADMIN', 'MEMBER')),
  company_name text,
  contact_name text,
  permissions text[],
  partner_code text,
  token text not null unique default encode(extensions.gen_random_bytes(18), 'hex'),
  status text not null default 'PENDING' check (status in ('PENDING', 'ACCEPTED', 'CANCELLED')),
  invited_by uuid references auth.users(id),
  accepted_by uuid references auth.users(id),
  accepted_at timestamptz,
  -- NEW_CLIENT: the company created from this invitation.
  result_organization_id uuid references public.organizations(id) on delete set null,
  expires_at timestamptz not null default now() + interval '30 days',
  created_at timestamptz not null default now()
);
create index on public.fiduciary_invitations (firm_id, kind, status);
create index on public.fiduciary_invitations (lower(email)) where status = 'PENDING';
alter table public.fiduciary_invitations enable row level security;

create table public.fiduciary_audit_log (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid references public.fiduciary_firms(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  actor_id uuid references auth.users(id),
  action text not null,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index on public.fiduciary_audit_log (firm_id, created_at desc);
create index on public.fiduciary_audit_log (organization_id, created_at desc);
alter table public.fiduciary_audit_log enable row level security;

create table public.fiduciary_admin_notes (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.fiduciary_firms(id) on delete cascade,
  author_id uuid references auth.users(id),
  body text not null,
  created_at timestamptz not null default now()
);
alter table public.fiduciary_admin_notes enable row level security;

-- Emails to send (accounting-mailer edge function). Written by the
-- functions below, sent right away through a trigger, retried hourly.
create table public.fiduciary_email_outbox (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  to_email text not null,
  locale text not null default 'fr',
  payload jsonb not null default '{}',
  attempts integer not null default 0,
  claimed_at timestamptz,
  sent_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);
create index on public.fiduciary_email_outbox (created_at) where sent_at is null;
alter table public.fiduciary_email_outbox enable row level security;

-- ---------------------------------------------------------------------------
-- Platform permission for the Cantia admin of Accounting.

alter table public.platform_permissions drop constraint if exists platform_permissions_permission_check;
alter table public.platform_permissions add constraint platform_permissions_permission_check
  check (permission in ('partners.admin', 'accounting.admin'));
insert into public.platform_permissions (user_id, permission)
select user_id, 'accounting.admin' from public.platform_admins
on conflict do nothing;

-- Fiduciaries can join Cantia Partners as such.
alter table public.partner_profiles drop constraint if exists partner_profiles_partner_type_check;
alter table public.partner_profiles add constraint partner_profiles_partner_type_check check (partner_type in (
  'WEB_AGENCY', 'CONSULTANT', 'SOFTWARE_INTEGRATOR', 'CANTIA_CUSTOMER', 'BUSINESS', 'CONTENT_CREATOR', 'OTHER', 'ACCOUNTING_FIRM'
));

-- Notification types (also restores 'devis_bounced', used by the Resend
-- webhook but missing from the list).
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in (
  'devis_stale_draft', 'devis_expiring_soon', 'facture_overdue',
  'recurring_expense_due', 'extra_work_accepted', 'feed_message', 'devis_accepted',
  'join_request_received', 'payslip_ready', 'devis_bounced',
  'fiduciary_access_request', 'fiduciary_access_update'
)) not valid;

-- ---------------------------------------------------------------------------
-- Helpers

create or replace function public.my_fiduciary_firm_id()
returns uuid
language sql stable security definer set search_path = public as $$
  select m.firm_id from public.fiduciary_members m
  join public.fiduciary_firms f on f.id = m.firm_id
  where m.user_id = auth.uid() and f.status <> 'BLOCKED';
$$;

create or replace function public.my_fiduciary_role()
returns text
language sql stable security definer set search_path = public as $$
  select m.role from public.fiduciary_members m where m.user_id = auth.uid();
$$;

-- Companies whose data the current user may read for one permission.
-- Used by the policies as "organization_id in (select ...)": evaluated
-- once per query, not per row.
create or replace function public.fiduciary_org_ids(p_permission text)
returns setof uuid
language sql stable security definer set search_path = public as $$
  select a.organization_id
  from public.fiduciary_members m
  join public.fiduciary_firms f on f.id = m.firm_id and f.status = 'ACTIVE'
  join public.fiduciary_client_access a on a.firm_id = m.firm_id and a.status = 'ACTIVE'
  where m.user_id = auth.uid()
    and (p_permission is null or p_permission = any (a.permissions))
    and (m.all_clients or exists (
      select 1 from public.fiduciary_member_clients s
      where s.firm_id = m.firm_id and s.user_id = m.user_id and s.organization_id = a.organization_id
    ));
$$;
revoke execute on function public.fiduciary_org_ids(text) from public, anon;
grant execute on function public.fiduciary_org_ids(text) to authenticated;

create or replace function public.fiduciary_can(p_org uuid, p_permission text)
returns boolean
language sql stable security definer set search_path = public as $$
  select p_org in (select public.fiduciary_org_ids(p_permission));
$$;
revoke execute on function public.fiduciary_can(uuid, text) from public, anon;
grant execute on function public.fiduciary_can(uuid, text) to authenticated;

create or replace function public.fiduciary_audit(p_firm uuid, p_org uuid, p_action text, p_details jsonb default '{}')
returns void
language sql security definer set search_path = public as $$
  insert into public.fiduciary_audit_log (firm_id, organization_id, actor_id, action, details)
  values (p_firm, p_org, auth.uid(), p_action, coalesce(p_details, '{}'));
$$;
revoke execute on function public.fiduciary_audit(uuid, uuid, text, jsonb) from public, anon, authenticated;

create or replace function public.fiduciary_queue_email(p_kind text, p_to text, p_locale text, p_payload jsonb)
returns void
language sql security definer set search_path = public as $$
  insert into public.fiduciary_email_outbox (kind, to_email, locale, payload)
  select p_kind, lower(trim(p_to)), coalesce(nullif(p_locale, ''), 'fr'), coalesce(p_payload, '{}')
  where coalesce(trim(p_to), '') <> '';
$$;
revoke execute on function public.fiduciary_queue_email(text, text, text, jsonb) from public, anon, authenticated;

-- Owners and admins of a client company (who decide on access).
create or replace function public.fiduciary_client_admins(p_org uuid)
returns table (user_id uuid, email text, locale text)
language sql stable security definer set search_path = public as $$
  select m.user_id, u.email::text, coalesce(o.locale, 'fr')
  from public.organization_members m
  join auth.users u on u.id = m.user_id
  join public.organizations o on o.id = m.organization_id
  where m.organization_id = p_org and m.role in ('owner', 'admin');
$$;
revoke execute on function public.fiduciary_client_admins(uuid) from public, anon, authenticated;

create or replace function public.fiduciary_firm_admin_emails(p_firm uuid)
returns table (email text)
language sql stable security definer set search_path = public as $$
  select coalesce(m.email, u.email::text)
  from public.fiduciary_members m join auth.users u on u.id = m.user_id
  where m.firm_id = p_firm and m.role in ('OWNER', 'ADMIN');
$$;
revoke execute on function public.fiduciary_firm_admin_emails(uuid) from public, anon, authenticated;

-- In-app notification + email to the client's owners/admins.
create or replace function public.fiduciary_notify_client(p_org uuid, p_type text, p_title text, p_body text, p_email_kind text, p_payload jsonb)
returns void
language plpgsql security definer set search_path = public as $$
declare
  r record;
begin
  for r in select * from public.fiduciary_client_admins(p_org) loop
    if p_email_kind is not null then
      perform public.fiduciary_queue_email(p_email_kind, r.email, r.locale, p_payload);
    end if;
    -- A notification never blocks the email or the access change itself.
    begin
      insert into public.notifications (organization_id, user_id, type, title, body, link, source_table, source_id)
      values (p_org, r.user_id, p_type, p_title, p_body, '/(app)/compte/fiduciaire', 'organizations', p_org);
    exception when others then
      null;
    end;
  end loop;
end;
$$;
revoke execute on function public.fiduciary_notify_client(uuid, text, text, text, text, jsonb) from public, anon, authenticated;

create or replace function public.fiduciary_notify_firm(p_firm uuid, p_email_kind text, p_payload jsonb)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_locale text;
  r record;
begin
  select locale into v_locale from public.fiduciary_firms where id = p_firm;
  for r in select * from public.fiduciary_firm_admin_emails(p_firm) loop
    perform public.fiduciary_queue_email(p_email_kind, r.email, v_locale, p_payload);
  end loop;
end;
$$;
revoke execute on function public.fiduciary_notify_firm(uuid, text, jsonb) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- RLS on the new tables (reads only; every write goes through the
-- functions below).

create policy "firm members see their firm" on public.fiduciary_firms
  for select using (id = public.my_fiduciary_firm_id() or public.has_platform_permission('accounting.admin'));
-- The client sees the firms it works with (name, city, contact).
create policy "clients see their fiduciaries" on public.fiduciary_firms
  for select using (exists (
    select 1 from public.fiduciary_client_access a
    where a.firm_id = fiduciary_firms.id and public.is_org_admin(a.organization_id)
  ));

create policy "firm members see their colleagues" on public.fiduciary_members
  for select using (firm_id = public.my_fiduciary_firm_id() or public.has_platform_permission('accounting.admin'));
create policy "clients see who at the firm has access" on public.fiduciary_members
  for select using (exists (
    select 1 from public.fiduciary_client_access a
    where a.firm_id = fiduciary_members.firm_id and a.status in ('ACTIVE', 'PENDING_CLIENT', 'PENDING_FIRM') and public.is_org_admin(a.organization_id)
  ));

create policy "firm members see their accesses" on public.fiduciary_client_access
  for select using (firm_id = public.my_fiduciary_firm_id() or public.has_platform_permission('accounting.admin'));
create policy "clients see their accesses" on public.fiduciary_client_access
  for select using (public.is_org_admin(organization_id));

create policy "firm admins see their invitations" on public.fiduciary_invitations
  for select using (
    (firm_id = public.my_fiduciary_firm_id() and public.my_fiduciary_role() in ('OWNER', 'ADMIN'))
    or (kind = 'CLIENT_TO_FIRM' and public.is_org_admin(organization_id))
    or public.has_platform_permission('accounting.admin')
  );

create policy "audit for the firm and the client" on public.fiduciary_audit_log
  for select using (
    (firm_id is not null and firm_id = public.my_fiduciary_firm_id() and public.my_fiduciary_role() in ('OWNER', 'ADMIN'))
    or (organization_id is not null and public.is_org_admin(organization_id))
    or public.has_platform_permission('accounting.admin')
  );

create policy "accounting admins see notes" on public.fiduciary_admin_notes
  for select using (public.has_platform_permission('accounting.admin'));

-- ---------------------------------------------------------------------------
-- Read access to client data (SELECT only, permission per table).

create policy "fiduciaries see their clients" on public.organizations
  for select using (id in (select public.fiduciary_org_ids(null)));

create policy "fiduciaries view invoices" on public.factures
  for select using (organization_id in (select public.fiduciary_org_ids('VIEW_INVOICES')));
create policy "fiduciaries view invoice lines" on public.facture_items
  for select using (facture_id in (select f.id from public.factures f where f.organization_id in (select public.fiduciary_org_ids('VIEW_INVOICES'))));
create policy "fiduciaries view payments" on public.facture_payments
  for select using (facture_id in (select f.id from public.factures f where f.organization_id in (select public.fiduciary_org_ids('VIEW_PAYMENT_STATUS'))));

create policy "fiduciaries view quotes" on public.devis
  for select using (organization_id in (select public.fiduciary_org_ids('VIEW_QUOTES')));
create policy "fiduciaries view quote lines" on public.devis_items
  for select using (devis_id in (select d.id from public.devis d where d.organization_id in (select public.fiduciary_org_ids('VIEW_QUOTES'))));

create policy "fiduciaries view customers" on public.clients
  for select using (organization_id in (select public.fiduciary_org_ids('VIEW_CUSTOMERS')));

create policy "fiduciaries view accounts" on public.accounting_accounts
  for select using (organization_id in (select public.fiduciary_org_ids('VIEW_ACCOUNTING_DOCUMENTS')));
create policy "fiduciaries view journals" on public.accounting_journals
  for select using (organization_id in (select public.fiduciary_org_ids('VIEW_ACCOUNTING_DOCUMENTS')));
create policy "fiduciaries view fiscal years" on public.accounting_fiscal_years
  for select using (organization_id in (select public.fiduciary_org_ids('VIEW_ACCOUNTING_DOCUMENTS')));
create policy "fiduciaries view account mappings" on public.accounting_account_mappings
  for select using (organization_id in (select public.fiduciary_org_ids('VIEW_ACCOUNTING_DOCUMENTS')));
create policy "fiduciaries view entries" on public.accounting_entries
  for select using (organization_id in (select public.fiduciary_org_ids('VIEW_ACCOUNTING_DOCUMENTS')));
create policy "fiduciaries view entry lines" on public.accounting_entry_lines
  for select using (entry_id in (select e.id from public.accounting_entries e where e.organization_id in (select public.fiduciary_org_ids('VIEW_ACCOUNTING_DOCUMENTS'))));
create policy "fiduciaries view entry attachments" on public.accounting_attachments
  for select using (entry_id in (select e.id from public.accounting_entries e where e.organization_id in (select public.fiduciary_org_ids('VIEW_ACCOUNTING_DOCUMENTS'))));
create policy "fiduciaries view vat codes" on public.vat_codes
  for select using (organization_id in (select public.fiduciary_org_ids('VIEW_ACCOUNTING_DOCUMENTS')));
create policy "fiduciaries view expenses" on public.expenses
  for select using (organization_id in (select public.fiduciary_org_ids('VIEW_ACCOUNTING_DOCUMENTS')));

create policy "fiduciaries view payroll runs" on public.payroll_runs
  for select using (organization_id in (select public.fiduciary_org_ids('VIEW_PAYROLL_DATA')));
create policy "fiduciaries view payslips" on public.payroll_slips
  for select using (organization_id in (select public.fiduciary_org_ids('VIEW_PAYROLL_DATA')));
create policy "fiduciaries view work hours" on public.payroll_time_entries
  for select using (organization_id in (select public.fiduciary_org_ids('VIEW_WORK_HOURS')));

-- Integration status only (credentials live in integration_credentials,
-- which stays closed).
create policy "fiduciaries view integration status" on public.integrations
  for select using (organization_id in (select public.fiduciary_org_ids('VIEW_EXPORTS')));

-- Files: only the invoice PDFs and the accounting receipts, never the
-- rest of the company's storage (photos, plans...).
create policy "fiduciaries download accounting files" on storage.objects
  for select using (
    bucket_id = 'opus-storage'
    -- Cheap guard first (paths start with the company id): for anyone
    -- without an accounting access this is an empty set, nothing else runs.
    and public.is_uuid_like((storage.foldername(name))[1])
    and ((storage.foldername(name))[1])::uuid in (select public.fiduciary_org_ids('DOWNLOAD_DOCUMENTS'))
    and (
      exists (
        select 1 from public.accounting_attachments att
        join public.accounting_entries e on e.id = att.entry_id
        where att.file_path = storage.objects.name
          and e.organization_id in (select public.fiduciary_org_ids('DOWNLOAD_DOCUMENTS'))
          and e.organization_id in (select public.fiduciary_org_ids('VIEW_ACCOUNTING_DOCUMENTS'))
      )
      or exists (
        select 1 from public.factures f
        where f.pdf_path = storage.objects.name
          and f.organization_id in (select public.fiduciary_org_ids('DOWNLOAD_DOCUMENTS'))
          and f.organization_id in (select public.fiduciary_org_ids('VIEW_INVOICES'))
      )
    )
  );

-- ---------------------------------------------------------------------------
-- Firm: creation, cockpit

create or replace function public.acc_create_firm(
  p_name text,
  p_first_name text,
  p_last_name text,
  p_phone text default null,
  p_address text default null,
  p_postal_code text default null,
  p_city text default null,
  p_country text default 'CH',
  p_ide_number text default null,
  p_website text default null,
  p_mandates_range text default null,
  p_software text[] default '{}',
  p_locale text default 'fr'
)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid;
  v_email text;
  r record;
begin
  if auth.uid() is null then raise exception 'Connexion requise'; end if;
  if exists (select 1 from public.fiduciary_members where user_id = auth.uid()) then
    raise exception 'Ce compte fait déjà partie d''une fiduciaire.';
  end if;
  if length(trim(coalesce(p_name, ''))) < 2 or length(trim(coalesce(p_first_name, ''))) < 1 or length(trim(coalesce(p_last_name, ''))) < 1 then
    raise exception 'Nom de la fiduciaire, prénom et nom sont requis.';
  end if;
  select email into v_email from auth.users where id = auth.uid();

  insert into public.fiduciary_firms (name, phone, address, postal_code, city, country, ide_number, website, mandates_range, software, locale, created_by)
  values (
    trim(p_name), nullif(trim(p_phone), ''), nullif(trim(p_address), ''), nullif(trim(p_postal_code), ''), nullif(trim(p_city), ''),
    coalesce(nullif(trim(p_country), ''), 'CH'), nullif(trim(p_ide_number), ''), nullif(trim(p_website), ''),
    case when p_mandates_range in ('1-10', '11-50', '51-100', '100+') then p_mandates_range end,
    (select coalesce(array_agg(s), '{}') from unnest(coalesce(p_software, '{}')) s
      where s in ('BEXIO', 'WINBIZ', 'CRESUS', 'ODOO', 'ABACUS', 'KLARA', 'OTHER')),
    case when p_locale in ('fr', 'de', 'it') then p_locale else 'fr' end,
    auth.uid()
  )
  returning id into v_firm;

  insert into public.fiduciary_members (firm_id, user_id, role, first_name, last_name, email)
  values (v_firm, auth.uid(), 'OWNER', trim(p_first_name), trim(p_last_name), v_email);
  perform public.fiduciary_audit(v_firm, null, 'firm_created', jsonb_build_object('name', trim(p_name)));
  perform public.fiduciary_queue_email('welcome', v_email, p_locale, jsonb_build_object('firm_name', trim(p_name), 'first_name', trim(p_first_name)));

  -- Clients who had already invited this address: the firm signed up
  -- through their invitation, their consent is given.
  for r in
    select * from public.fiduciary_invitations
    where kind = 'CLIENT_TO_FIRM' and status = 'PENDING' and lower(email) = lower(v_email) and expires_at > now()
  loop
    perform public.acc_link_client_invitation(r.id, v_firm);
  end loop;
  return v_firm;
end;
$$;

-- A client's invitation (CLIENT_TO_FIRM) taken by a firm: the access is
-- active right away, with the permissions the client chose.
create or replace function public.acc_link_client_invitation(p_invitation uuid, p_firm uuid)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_inv public.fiduciary_invitations%rowtype;
  v_access uuid;
  v_firm_name text;
begin
  select * into v_inv from public.fiduciary_invitations where id = p_invitation and kind = 'CLIENT_TO_FIRM' and status = 'PENDING' for update;
  if not found then return null; end if;
  update public.fiduciary_invitations set status = 'ACCEPTED', accepted_by = auth.uid(), accepted_at = now(), firm_id = p_firm where id = p_invitation;
  select id into v_access from public.fiduciary_client_access
   where firm_id = p_firm and organization_id = v_inv.organization_id and status in ('PENDING_CLIENT', 'PENDING_FIRM', 'ACTIVE');
  if v_access is null then
    insert into public.fiduciary_client_access (firm_id, organization_id, status, permissions, source, requested_by, approved_by, approved_at)
    values (p_firm, v_inv.organization_id, 'ACTIVE', public.fiduciary_clean_permissions(v_inv.permissions), 'CLIENT_INVITE', v_inv.invited_by, v_inv.invited_by, now())
    returning id into v_access;
  else
    update public.fiduciary_client_access
       set status = 'ACTIVE', permissions = public.fiduciary_clean_permissions(v_inv.permissions), approved_by = v_inv.invited_by, approved_at = now(), updated_at = now()
     where id = v_access;
  end if;
  select name into v_firm_name from public.fiduciary_firms where id = p_firm;
  perform public.fiduciary_audit(p_firm, v_inv.organization_id, 'access_accepted', jsonb_build_object('via', 'client_invitation', 'permissions', v_inv.permissions));
  perform public.fiduciary_notify_client(
    v_inv.organization_id, 'fiduciary_access_update', 'Fiduciaire connectée',
    v_firm_name || ' a accepté votre invitation et accède maintenant à vos données comptables.', null, '{}'
  );
  return v_access;
end;
$$;
revoke execute on function public.acc_link_client_invitation(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.acc_create_firm(text, text, text, text, text, text, text, text, text, text, text, text[], text) from public, anon;
grant execute on function public.acc_create_firm(text, text, text, text, text, text, text, text, text, text, text, text[], text) to authenticated;

create or replace function public.acc_update_firm(
  p_name text, p_phone text, p_address text, p_postal_code text, p_city text, p_country text,
  p_ide_number text, p_website text, p_mandates_range text, p_software text[], p_locale text
)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
begin
  if v_firm is null or public.my_fiduciary_role() not in ('OWNER', 'ADMIN') then raise exception 'Accès refusé'; end if;
  update public.fiduciary_firms set
    name = coalesce(nullif(trim(p_name), ''), name),
    phone = nullif(trim(p_phone), ''), address = nullif(trim(p_address), ''),
    postal_code = nullif(trim(p_postal_code), ''), city = nullif(trim(p_city), ''),
    country = coalesce(nullif(trim(p_country), ''), 'CH'),
    ide_number = nullif(trim(p_ide_number), ''), website = nullif(trim(p_website), ''),
    mandates_range = case when p_mandates_range in ('1-10', '11-50', '51-100', '100+') then p_mandates_range else mandates_range end,
    software = (select coalesce(array_agg(s), '{}') from unnest(coalesce(p_software, '{}')) s
      where s in ('BEXIO', 'WINBIZ', 'CRESUS', 'ODOO', 'ABACUS', 'KLARA', 'OTHER')),
    locale = case when p_locale in ('fr', 'de', 'it') then p_locale else locale end,
    updated_at = now()
  where id = v_firm;
end;
$$;
revoke execute on function public.acc_update_firm(text, text, text, text, text, text, text, text, text, text[], text) from public, anon;
grant execute on function public.acc_update_firm(text, text, text, text, text, text, text, text, text, text[], text) to authenticated;

create or replace function public.acc_me()
returns jsonb
language sql stable security definer set search_path = public as $$
  select case when f.id is null then null else jsonb_build_object(
    'firm', to_jsonb(f) - 'created_by',
    'role', m.role,
    'first_name', m.first_name,
    'last_name', m.last_name,
    'is_admin', public.has_platform_permission('accounting.admin')
  ) end
  from public.fiduciary_members m
  join public.fiduciary_firms f on f.id = m.firm_id
  where m.user_id = auth.uid();
$$;
revoke execute on function public.acc_me() from public, anon;
grant execute on function public.acc_me() to authenticated;

create or replace function public.acc_am_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select public.has_platform_permission('accounting.admin');
$$;
revoke execute on function public.acc_am_admin() from public, anon;
grant execute on function public.acc_am_admin() to authenticated;

-- Invoice amounts in SQL (lines x VAT), same rule as the app.
create or replace function public.acc_facture_total(p_facture uuid)
returns numeric
language sql stable security definer set search_path = public as $$
  select round(coalesce(sum(i.quantity * i.unit_price), 0) * (1 + coalesce(f.vat_rate, 0) / 100), 2)
  from public.factures f left join public.facture_items i on i.facture_id = f.id
  where f.id = p_facture
  group by f.vat_rate;
$$;
revoke execute on function public.acc_facture_total(uuid) from public, anon, authenticated;

-- "Mes mandants": one row per client (active or pending), with what the
-- firm is allowed to see. Figures only for permissions granted.
create or replace function public.acc_mandants()
returns table (
  access_id uuid,
  organization_id uuid,
  name text,
  status text,
  source text,
  permissions text[],
  plan_name text,
  subscription_status text,
  last_activity_at timestamptz,
  documents_count integer,
  factures_count integer,
  factures_open_chf numeric,
  factures_overdue integer,
  payments_30d_chf numeric,
  bexio_status text,
  requested_at timestamptz,
  approved_at timestamptz
)
language plpgsql stable security definer set search_path = public as $$
#variable_conflict use_column
declare
  v_firm uuid := public.my_fiduciary_firm_id();
begin
  if v_firm is null then return; end if;
  return query
  with acc as (
    select a.* from public.fiduciary_client_access a
    where a.firm_id = v_firm and a.status in ('ACTIVE', 'PENDING_CLIENT', 'PENDING_FIRM')
      and (a.status <> 'ACTIVE' or a.organization_id in (select public.fiduciary_org_ids(null)))
  ),
  fac as (
    select f.organization_id, f.id, f.status::text as st, f.due_date, f.updated_at,
           public.acc_facture_total(f.id) as total,
           coalesce((select sum(p.amount) from public.facture_payments p where p.facture_id = f.id), 0) as paid
    from public.factures f
    where f.organization_id in (select organization_id from acc where status = 'ACTIVE' and 'VIEW_INVOICES' = any (permissions))
      and f.status::text not in ('draft', 'cancelled')
  )
  select a.id, a.organization_id,
         o.name,
         a.status, a.source, a.permissions,
         case when a.status = 'ACTIVE' then pl.name end,
         case when a.status = 'ACTIVE' then o.subscription_status end,
         case when a.status = 'ACTIVE' then greatest(
           (select max(updated_at) from fac where fac.organization_id = a.organization_id),
           case when 'VIEW_ACCOUNTING_DOCUMENTS' = any (a.permissions)
             then (select max(e.created_at) from public.accounting_entries e where e.organization_id = a.organization_id) end,
           case when 'VIEW_ACCOUNTING_DOCUMENTS' = any (a.permissions)
             then (select max(x.created_at) from public.expenses x where x.organization_id = a.organization_id) end
         ) end,
         case when a.status = 'ACTIVE' and 'VIEW_ACCOUNTING_DOCUMENTS' = any (a.permissions) then (
           select count(*)::int from public.accounting_attachments att
           join public.accounting_entries e on e.id = att.entry_id where e.organization_id = a.organization_id
         ) end,
         case when 'VIEW_INVOICES' = any (a.permissions) and a.status = 'ACTIVE' then (select count(*)::int from fac where fac.organization_id = a.organization_id) end,
         case when 'VIEW_INVOICES' = any (a.permissions) and a.status = 'ACTIVE' then (
           select coalesce(sum(greatest(total - paid, 0)), 0) from fac where fac.organization_id = a.organization_id and st <> 'paid') end,
         case when 'VIEW_INVOICES' = any (a.permissions) and a.status = 'ACTIVE' then (
           select count(*)::int from fac where fac.organization_id = a.organization_id and st <> 'paid' and due_date < current_date and total - paid > 0.004) end,
         case when 'VIEW_PAYMENT_STATUS' = any (a.permissions) and a.status = 'ACTIVE' then (
           select coalesce(sum(p.amount), 0) from public.facture_payments p
           join public.factures f on f.id = p.facture_id
           where f.organization_id = a.organization_id and p.paid_at >= current_date - 30) end,
         case when 'VIEW_EXPORTS' = any (a.permissions) and a.status = 'ACTIVE' then (
           select i.status::text from public.integrations i where i.organization_id = a.organization_id and i.provider::text = 'bexio' limit 1) end,
         a.requested_at, a.approved_at
  from acc a
  join public.organizations o on o.id = a.organization_id
  left join public.plans pl on pl.id = o.plan_id
  order by (a.status = 'ACTIVE') desc, o.name;
end;
$$;
revoke execute on function public.acc_mandants() from public, anon;
grant execute on function public.acc_mandants() to authenticated;

create or replace function public.acc_dashboard()
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
  v_result jsonb;
begin
  if v_firm is null then return null; end if;
  select jsonb_build_object(
    'active_clients', count(*) filter (where status = 'ACTIVE'),
    'pending_client', count(*) filter (where status = 'PENDING_CLIENT'),
    'pending_firm', count(*) filter (where status = 'PENDING_FIRM'),
    'overdue_invoices', coalesce(sum(factures_overdue), 0),
    'open_chf', coalesce(sum(factures_open_chf), 0),
    'documents', coalesce(sum(documents_count), 0)
  ) into v_result
  from public.acc_mandants();
  return v_result || jsonb_build_object(
    'pending_invitations', (select count(*) from public.fiduciary_invitations
      where firm_id = v_firm and kind = 'NEW_CLIENT' and status = 'PENDING' and expires_at > now()),
    'new_clients', (select count(*) from public.fiduciary_invitations
      where firm_id = v_firm and kind = 'NEW_CLIENT' and status = 'ACCEPTED'),
    'recent_documents', coalesce((
      select jsonb_agg(d order by d.created_at desc) from (
        select att.id, att.file_name, att.file_path, att.created_at, e.organization_id, o.name as organization_name
        from public.accounting_attachments att
        join public.accounting_entries e on e.id = att.entry_id
        join public.organizations o on o.id = e.organization_id
        where e.organization_id in (select public.fiduciary_org_ids('VIEW_ACCOUNTING_DOCUMENTS'))
        order by att.created_at desc limit 6
      ) d), '[]'::jsonb)
  );
end;
$$;
revoke execute on function public.acc_dashboard() from public, anon;
grant execute on function public.acc_dashboard() to authenticated;

-- ---------------------------------------------------------------------------
-- Firm -> client: ask for access (existing Cantia company) or invite a new
-- company to Cantia. One entry point, the firm only types an email.

create or replace function public.acc_invite_client(p_email text, p_company_name text default null, p_contact_name text default null)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
  v_firm_row public.fiduciary_firms%rowtype;
  v_email text := lower(trim(coalesce(p_email, '')));
  v_user uuid;
  v_org record;
  v_count int := 0;
  v_code text;
  v_inv public.fiduciary_invitations%rowtype;
begin
  if v_firm is null then raise exception 'Accès refusé'; end if;
  select * into v_firm_row from public.fiduciary_firms where id = v_firm;
  if v_firm_row.status <> 'ACTIVE' then raise exception 'Votre fiduciaire est suspendue. Contactez Cantia.'; end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Adresse e-mail invalide.'; end if;
  -- Anti-spam: 40 requests a day per firm.
  if (select count(*) from public.fiduciary_audit_log where firm_id = v_firm and action in ('access_requested', 'client_invited') and created_at > now() - interval '1 day') >= 40 then
    raise exception 'Limite quotidienne atteinte. Réessayez demain.';
  end if;

  select id into v_user from auth.users where lower(email) = v_email;
  if v_user is not null then
    for v_org in
      select o.id, o.name, coalesce(o.locale, 'fr') as locale from public.organization_members m
      join public.organizations o on o.id = m.organization_id
      where m.user_id = v_user and m.role in ('owner', 'admin')
    loop
      if not exists (select 1 from public.fiduciary_client_access where firm_id = v_firm and organization_id = v_org.id and status in ('PENDING_CLIENT', 'PENDING_FIRM', 'ACTIVE')) then
        insert into public.fiduciary_client_access (firm_id, organization_id, status, source, requested_by)
        values (v_firm, v_org.id, 'PENDING_CLIENT', 'FIRM_REQUEST', auth.uid());
        perform public.fiduciary_audit(v_firm, v_org.id, 'access_requested', '{}');
        perform public.fiduciary_notify_client(
          v_org.id, 'fiduciary_access_request', 'Demande d''accès de votre fiduciaire',
          v_firm_row.name || ' souhaite accéder à vos données comptables Cantia. Acceptez ou refusez dans Paramètres › Fiduciaire.',
          'access_request', jsonb_build_object('firm_name', v_firm_row.name, 'organization_name', v_org.name)
        );
      end if;
      v_count := v_count + 1;
    end loop;
    if v_count > 0 then
      return jsonb_build_object('kind', 'request', 'count', v_count);
    end if;
  end if;

  -- Not a Cantia company yet: invitation to Cantia, with the firm's
  -- partner code when it has joined Cantia Partners.
  select c.code into v_code from public.partner_profiles p
  join public.partner_referral_codes c on c.partner_id = p.id
  where p.user_id = auth.uid() and p.status = 'ACTIVE'
  order by c.is_default desc, c.created_at limit 1;
  if v_code is null then
    select c.code into v_code from public.fiduciary_members m
    join public.partner_profiles p on p.user_id = m.user_id and p.status = 'ACTIVE'
    join public.partner_referral_codes c on c.partner_id = p.id
    where m.firm_id = v_firm and m.role = 'OWNER'
    order by c.is_default desc, c.created_at limit 1;
  end if;

  select * into v_inv from public.fiduciary_invitations
   where firm_id = v_firm and kind = 'NEW_CLIENT' and status = 'PENDING' and lower(email) = v_email;
  if found then
    update public.fiduciary_invitations
       set company_name = coalesce(nullif(trim(p_company_name), ''), company_name),
           contact_name = coalesce(nullif(trim(p_contact_name), ''), contact_name),
           partner_code = coalesce(v_code, partner_code),
           expires_at = now() + interval '30 days'
     where id = v_inv.id returning * into v_inv;
  else
    insert into public.fiduciary_invitations (kind, firm_id, email, company_name, contact_name, partner_code, invited_by)
    values ('NEW_CLIENT', v_firm, v_email, nullif(trim(p_company_name), ''), nullif(trim(p_contact_name), ''), v_code, auth.uid())
    returning * into v_inv;
  end if;
  perform public.fiduciary_audit(v_firm, null, 'client_invited', jsonb_build_object('email', v_email, 'partner_code', v_code is not null));
  perform public.fiduciary_queue_email('new_client_invite', v_email, v_firm_row.locale, jsonb_build_object(
    'firm_name', v_firm_row.name, 'company_name', v_inv.company_name, 'contact_name', v_inv.contact_name,
    'token', v_inv.token, 'partner_code', v_inv.partner_code
  ));
  return jsonb_build_object('kind', 'invitation', 'with_partner_code', v_inv.partner_code is not null);
end;
$$;
revoke execute on function public.acc_invite_client(text, text, text) from public, anon;
grant execute on function public.acc_invite_client(text, text, text) to authenticated;

create or replace function public.acc_invitations()
returns table (id uuid, kind text, email text, company_name text, contact_name text, status text, partner_code text, created_at timestamptz, expires_at timestamptz, result_organization_id uuid)
language sql stable security definer set search_path = public as $$
  select i.id, i.kind, i.email, i.company_name, i.contact_name,
         case when i.status = 'PENDING' and i.expires_at < now() then 'EXPIRED' else i.status end,
         i.partner_code, i.created_at, i.expires_at, i.result_organization_id
  from public.fiduciary_invitations i
  where i.firm_id = public.my_fiduciary_firm_id() and i.kind in ('NEW_CLIENT', 'STAFF')
  order by i.created_at desc
  limit 200;
$$;
revoke execute on function public.acc_invitations() from public, anon;
grant execute on function public.acc_invitations() to authenticated;

create or replace function public.acc_cancel_invitation(p_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
begin
  if v_firm is null or public.my_fiduciary_role() not in ('OWNER', 'ADMIN') then raise exception 'Accès refusé'; end if;
  update public.fiduciary_invitations set status = 'CANCELLED' where id = p_id and firm_id = v_firm and status = 'PENDING';
  perform public.fiduciary_audit(v_firm, null, 'invitation_cancelled', jsonb_build_object('invitation_id', p_id));
end;
$$;
revoke execute on function public.acc_cancel_invitation(uuid) from public, anon;
grant execute on function public.acc_cancel_invitation(uuid) to authenticated;

create or replace function public.acc_resend_invitation(p_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
  v_inv public.fiduciary_invitations%rowtype;
  v_f public.fiduciary_firms%rowtype;
begin
  select * into v_inv from public.fiduciary_invitations where id = p_id and firm_id = v_firm and status = 'PENDING';
  if not found then raise exception 'Invitation introuvable'; end if;
  if exists (select 1 from public.fiduciary_email_outbox where payload ->> 'token' = v_inv.token and created_at > now() - interval '10 minutes') then
    raise exception 'Invitation déjà renvoyée il y a quelques minutes.';
  end if;
  select * into v_f from public.fiduciary_firms where id = v_firm;
  update public.fiduciary_invitations set expires_at = now() + interval '30 days' where id = p_id;
  perform public.fiduciary_queue_email(
    case when v_inv.kind = 'STAFF' then 'staff_invite' else 'new_client_invite' end,
    v_inv.email, v_f.locale,
    jsonb_build_object('firm_name', v_f.name, 'company_name', v_inv.company_name, 'contact_name', v_inv.contact_name, 'token', v_inv.token, 'partner_code', v_inv.partner_code, 'role', v_inv.role)
  );
end;
$$;
revoke execute on function public.acc_resend_invitation(uuid) from public, anon;
grant execute on function public.acc_resend_invitation(uuid) to authenticated;

-- Firm answers a client's invitation (PENDING_FIRM), cancels its own
-- request, or ends a mandate.
create or replace function public.acc_respond_client(p_access_id uuid, p_accept boolean)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
  v_a public.fiduciary_client_access%rowtype;
  v_name text;
begin
  if v_firm is null or public.my_fiduciary_role() not in ('OWNER', 'ADMIN') then raise exception 'Accès refusé'; end if;
  select * into v_a from public.fiduciary_client_access where id = p_access_id and firm_id = v_firm for update;
  if not found then raise exception 'Mandat introuvable'; end if;
  select name into v_name from public.fiduciary_firms where id = v_firm;
  if v_a.status = 'PENDING_FIRM' then
    update public.fiduciary_client_access
       set status = case when p_accept then 'ACTIVE' else 'REFUSED' end,
           approved_at = case when p_accept then now() end,
           refused_at = case when p_accept then null else now() end,
           updated_at = now()
     where id = p_access_id;
    perform public.fiduciary_audit(v_firm, v_a.organization_id, case when p_accept then 'firm_accepted' else 'firm_declined' end, '{}');
    perform public.fiduciary_notify_client(
      v_a.organization_id, 'fiduciary_access_update',
      case when p_accept then 'Fiduciaire connectée' else 'Invitation déclinée' end,
      case when p_accept then v_name || ' a accepté votre invitation.' else v_name || ' a décliné votre invitation.' end,
      null, '{}'
    );
  elsif v_a.status = 'PENDING_CLIENT' and not p_accept then
    update public.fiduciary_client_access set status = 'CANCELLED', updated_at = now() where id = p_access_id;
    perform public.fiduciary_audit(v_firm, v_a.organization_id, 'request_cancelled', '{}');
  elsif v_a.status = 'ACTIVE' and not p_accept then
    update public.fiduciary_client_access set status = 'REVOKED', revoked_at = now(), revoked_by = auth.uid(), updated_at = now() where id = p_access_id;
    perform public.fiduciary_audit(v_firm, v_a.organization_id, 'mandate_ended_by_firm', '{}');
    perform public.fiduciary_notify_client(v_a.organization_id, 'fiduciary_access_update', 'Mandat terminé', v_name || ' a mis fin à son accès à vos données.', null, '{}');
  else
    raise exception 'Action impossible pour ce mandat.';
  end if;
end;
$$;
revoke execute on function public.acc_respond_client(uuid, boolean) from public, anon;
grant execute on function public.acc_respond_client(uuid, boolean) to authenticated;

-- One client, as seen by the firm (header of the client page).
create or replace function public.acc_client(p_org uuid)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
  v_a public.fiduciary_client_access%rowtype;
begin
  select * into v_a from public.fiduciary_client_access
   where firm_id = v_firm and organization_id = p_org and status = 'ACTIVE'
     and p_org in (select public.fiduciary_org_ids(null));
  if not found then return null; end if;
  -- Log that the client's file was opened (nLPD: who looked, when).
  insert into public.fiduciary_audit_log (firm_id, organization_id, actor_id, action)
  select v_firm, p_org, auth.uid(), 'client_opened'
  where not exists (
    select 1 from public.fiduciary_audit_log
    where firm_id = v_firm and organization_id = p_org and actor_id = auth.uid() and action = 'client_opened' and created_at > now() - interval '1 hour'
  );
  return (
    select jsonb_build_object(
      'access_id', v_a.id,
      'organization_id', o.id,
      'name', o.name,
      'permissions', v_a.permissions,
      'approved_at', v_a.approved_at,
      'plan_name', pl.name,
      'subscription_status', o.subscription_status,
      'email', o.email,
      'phone', o.phone,
      'address', o.address,
      'postal_code', o.postal_code,
      'locality', o.locality,
      'ide_number', o.ide_number,
      'locale', o.locale
    )
    from public.organizations o left join public.plans pl on pl.id = o.plan_id
    where o.id = p_org
  );
end;
$$;
revoke execute on function public.acc_client(uuid) from public, anon;
grant execute on function public.acc_client(uuid) to authenticated;

-- Documents across clients: invoice PDFs and accounting receipts.
create or replace function public.acc_documents(p_org uuid default null, p_from date default null, p_to date default null, p_kind text default null)
returns table (id uuid, kind text, organization_id uuid, organization_name text, title text, file_path text, doc_date date, amount_chf numeric, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select * from (
    select f.id as id, 'invoice'::text as kind, f.organization_id as organization_id, o.name as organization_name,
           coalesce(f.number, '—') || ' · ' || f.client_name as title,
           f.pdf_path as file_path, f.created_at::date as doc_date, public.acc_facture_total(f.id) as amount_chf, f.created_at as created_at
    from public.factures f join public.organizations o on o.id = f.organization_id
    where f.organization_id in (select public.fiduciary_org_ids('VIEW_INVOICES'))
      and f.status::text not in ('draft')
      and (p_org is null or f.organization_id = p_org)
      and (p_kind is null or p_kind = 'invoice')
    union all
    select att.id, 'receipt', e.organization_id, o.name, att.file_name, att.file_path, e.entry_date, null::numeric, att.created_at
    from public.accounting_attachments att
    join public.accounting_entries e on e.id = att.entry_id
    join public.organizations o on o.id = e.organization_id
    where e.organization_id in (select public.fiduciary_org_ids('VIEW_ACCOUNTING_DOCUMENTS'))
      and (p_org is null or e.organization_id = p_org)
      and (p_kind is null or p_kind = 'receipt')
  ) d
  where (p_from is null or d.doc_date >= p_from) and (p_to is null or d.doc_date <= p_to)
  order by d.doc_date desc nulls last, d.created_at desc
  limit 500;
$$;
revoke execute on function public.acc_documents(uuid, date, date, text) from public, anon;
grant execute on function public.acc_documents(uuid, date, date, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Team

create or replace function public.acc_team()
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
begin
  if v_firm is null then return null; end if;
  return jsonb_build_object(
    'members', coalesce((
      select jsonb_agg(jsonb_build_object('user_id', m.user_id, 'role', m.role, 'first_name', m.first_name, 'last_name', m.last_name,
        'email', coalesce(m.email, u.email), 'created_at', m.created_at, 'me', m.user_id = auth.uid()) order by m.created_at)
      from public.fiduciary_members m join auth.users u on u.id = m.user_id where m.firm_id = v_firm), '[]'::jsonb),
    'invitations', case when public.my_fiduciary_role() in ('OWNER', 'ADMIN') then coalesce((
      select jsonb_agg(jsonb_build_object('id', i.id, 'email', i.email, 'role', i.role, 'created_at', i.created_at, 'expires_at', i.expires_at) order by i.created_at desc)
      from public.fiduciary_invitations i where i.firm_id = v_firm and i.kind = 'STAFF' and i.status = 'PENDING' and i.expires_at > now()), '[]'::jsonb) else '[]'::jsonb end
  );
end;
$$;
revoke execute on function public.acc_team() from public, anon;
grant execute on function public.acc_team() to authenticated;

create or replace function public.acc_invite_staff(p_email text, p_role text default 'MEMBER')
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
  v_f public.fiduciary_firms%rowtype;
  v_email text := lower(trim(coalesce(p_email, '')));
  v_inv public.fiduciary_invitations%rowtype;
begin
  if v_firm is null or public.my_fiduciary_role() not in ('OWNER', 'ADMIN') then raise exception 'Accès refusé'; end if;
  if p_role not in ('ADMIN', 'MEMBER') then raise exception 'Rôle invalide'; end if;
  if p_role = 'ADMIN' and public.my_fiduciary_role() <> 'OWNER' then raise exception 'Seul le propriétaire peut nommer un administrateur.'; end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Adresse e-mail invalide.'; end if;
  if exists (select 1 from public.fiduciary_members m join auth.users u on u.id = m.user_id where m.firm_id = v_firm and lower(u.email) = v_email) then
    raise exception 'Cette personne fait déjà partie de l''équipe.';
  end if;
  select * into v_f from public.fiduciary_firms where id = v_firm;
  update public.fiduciary_invitations set status = 'CANCELLED' where firm_id = v_firm and kind = 'STAFF' and status = 'PENDING' and lower(email) = v_email;
  insert into public.fiduciary_invitations (kind, firm_id, email, role, invited_by)
  values ('STAFF', v_firm, v_email, p_role, auth.uid()) returning * into v_inv;
  perform public.fiduciary_audit(v_firm, null, 'staff_invited', jsonb_build_object('email', v_email, 'role', p_role));
  perform public.fiduciary_queue_email('staff_invite', v_email, v_f.locale, jsonb_build_object('firm_name', v_f.name, 'token', v_inv.token, 'role', p_role));
end;
$$;
revoke execute on function public.acc_invite_staff(text, text) from public, anon;
grant execute on function public.acc_invite_staff(text, text) to authenticated;

-- What an invitation link shows before accepting (by token only).
create or replace function public.acc_invitation_preview(p_token text)
returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'kind', i.kind,
    'email', i.email,
    'role', i.role,
    'firm_name', f.name,
    'organization_name', o.name,
    'permissions', i.permissions,
    'status', case when i.status = 'PENDING' and i.expires_at < now() then 'EXPIRED' else i.status end
  )
  from public.fiduciary_invitations i
  left join public.fiduciary_firms f on f.id = i.firm_id
  left join public.organizations o on o.id = i.organization_id
  where i.token = p_token and i.kind in ('STAFF', 'CLIENT_TO_FIRM');
$$;
revoke execute on function public.acc_invitation_preview(text) from public;
grant execute on function public.acc_invitation_preview(text) to anon, authenticated;

-- Accept a STAFF invitation (join the firm) or a CLIENT_TO_FIRM one (the
-- signed-in user's firm takes the client). The signed-in email must be the
-- invited one.
create or replace function public.acc_accept_invitation(p_token text, p_first_name text default null, p_last_name text default null)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_inv public.fiduciary_invitations%rowtype;
  v_email text;
  v_firm uuid;
begin
  if auth.uid() is null then raise exception 'Connexion requise'; end if;
  select email into v_email from auth.users where id = auth.uid();
  select * into v_inv from public.fiduciary_invitations where token = p_token for update;
  if not found or v_inv.status <> 'PENDING' or v_inv.expires_at < now() then raise exception 'Invitation expirée ou déjà utilisée.'; end if;
  if lower(v_inv.email) <> lower(v_email) then
    raise exception 'Cette invitation a été envoyée à %. Connectez-vous avec cette adresse.', v_inv.email;
  end if;

  if v_inv.kind = 'STAFF' then
    if exists (select 1 from public.fiduciary_members where user_id = auth.uid()) then
      raise exception 'Ce compte fait déjà partie d''une fiduciaire.';
    end if;
    insert into public.fiduciary_members (firm_id, user_id, role, first_name, last_name, email)
    values (v_inv.firm_id, auth.uid(), v_inv.role, nullif(trim(p_first_name), ''), nullif(trim(p_last_name), ''), v_email);
    update public.fiduciary_invitations set status = 'ACCEPTED', accepted_by = auth.uid(), accepted_at = now() where id = v_inv.id;
    perform public.fiduciary_audit(v_inv.firm_id, null, 'staff_joined', jsonb_build_object('email', v_email, 'role', v_inv.role));
    return jsonb_build_object('kind', 'STAFF', 'firm_id', v_inv.firm_id);
  elsif v_inv.kind = 'CLIENT_TO_FIRM' then
    v_firm := public.my_fiduciary_firm_id();
    if v_firm is null then
      return jsonb_build_object('kind', 'CLIENT_TO_FIRM', 'needs_firm', true);
    end if;
    if public.my_fiduciary_role() not in ('OWNER', 'ADMIN') then raise exception 'Seul un administrateur de la fiduciaire peut accepter.'; end if;
    perform public.acc_link_client_invitation(v_inv.id, v_firm);
    return jsonb_build_object('kind', 'CLIENT_TO_FIRM', 'organization_id', v_inv.organization_id);
  end if;
  raise exception 'Invitation invalide';
end;
$$;
revoke execute on function public.acc_accept_invitation(text, text, text) from public, anon;
grant execute on function public.acc_accept_invitation(text, text, text) to authenticated;

create or replace function public.acc_set_member_role(p_user uuid, p_role text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
begin
  if v_firm is null or public.my_fiduciary_role() <> 'OWNER' then raise exception 'Seul le propriétaire peut changer les rôles.'; end if;
  if p_role not in ('OWNER', 'ADMIN', 'MEMBER') then raise exception 'Rôle invalide'; end if;
  if p_user = auth.uid() and p_role <> 'OWNER' and (select count(*) from public.fiduciary_members where firm_id = v_firm and role = 'OWNER') < 2 then
    raise exception 'La fiduciaire doit garder au moins un propriétaire.';
  end if;
  update public.fiduciary_members set role = p_role where firm_id = v_firm and user_id = p_user;
  perform public.fiduciary_audit(v_firm, null, 'member_role_changed', jsonb_build_object('user_id', p_user, 'role', p_role));
end;
$$;
revoke execute on function public.acc_set_member_role(uuid, text) from public, anon;
grant execute on function public.acc_set_member_role(uuid, text) to authenticated;

create or replace function public.acc_remove_member(p_user uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
  v_role text;
begin
  if v_firm is null then raise exception 'Accès refusé'; end if;
  select role into v_role from public.fiduciary_members where firm_id = v_firm and user_id = p_user;
  if v_role is null then raise exception 'Membre introuvable'; end if;
  -- Anyone may leave; removing others needs owner/admin, and only an owner
  -- removes an owner or an admin.
  if p_user <> auth.uid() then
    if public.my_fiduciary_role() not in ('OWNER', 'ADMIN') then raise exception 'Accès refusé'; end if;
    if v_role in ('OWNER', 'ADMIN') and public.my_fiduciary_role() <> 'OWNER' then raise exception 'Seul le propriétaire peut retirer un administrateur.'; end if;
  end if;
  if v_role = 'OWNER' and (select count(*) from public.fiduciary_members where firm_id = v_firm and role = 'OWNER') < 2 then
    raise exception 'La fiduciaire doit garder au moins un propriétaire.';
  end if;
  delete from public.fiduciary_members where firm_id = v_firm and user_id = p_user;
  perform public.fiduciary_audit(v_firm, null, 'member_removed', jsonb_build_object('user_id', p_user));
end;
$$;
revoke execute on function public.acc_remove_member(uuid) from public, anon;
grant execute on function public.acc_remove_member(uuid) to authenticated;

create or replace function public.acc_audit(p_org uuid default null)
returns table (id uuid, action text, organization_name text, actor_name text, details jsonb, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select l.id, l.action, o.name,
         coalesce(nullif(trim(coalesce(m.first_name, '') || ' ' || coalesce(m.last_name, '')), ''), u.email::text),
         l.details, l.created_at
  from public.fiduciary_audit_log l
  left join public.organizations o on o.id = l.organization_id
  left join public.fiduciary_members m on m.user_id = l.actor_id and m.firm_id = l.firm_id
  left join auth.users u on u.id = l.actor_id
  where l.firm_id = public.my_fiduciary_firm_id()
    and public.my_fiduciary_role() in ('OWNER', 'ADMIN')
    and (p_org is null or l.organization_id = p_org)
  order by l.created_at desc
  limit 200;
$$;
revoke execute on function public.acc_audit(uuid) from public, anon;
grant execute on function public.acc_audit(uuid) to authenticated;

-- Cantia Partners from Accounting: same user, partner type ACCOUNTING_FIRM.
create or replace function public.acc_activate_partner()
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_m public.fiduciary_members%rowtype;
  v_f public.fiduciary_firms%rowtype;
  v_result jsonb;
begin
  select * into v_m from public.fiduciary_members where user_id = auth.uid();
  if not found then raise exception 'Accès refusé'; end if;
  select * into v_f from public.fiduciary_firms where id = v_m.firm_id;
  if exists (select 1 from public.partner_profiles where user_id = auth.uid()) then
    return jsonb_build_object('already', true);
  end if;
  v_result := public.become_partner(
    coalesce(v_m.first_name, ''), coalesce(v_m.last_name, ''), v_f.name, 'ACCOUNTING_FIRM',
    v_f.phone, v_f.address, v_f.postal_code, v_f.city, v_f.country, v_f.locale
  );
  perform public.fiduciary_audit(v_m.firm_id, null, 'partner_activated', '{}');
  return v_result;
end;
$$;
revoke execute on function public.acc_activate_partner() from public, anon;
grant execute on function public.acc_activate_partner() to authenticated;

-- ---------------------------------------------------------------------------
-- Client side (app.cantia.ch, Paramètres › Fiduciaire). Owners and admins
-- of the company decide.

create or replace function public.org_fiduciaries(p_org uuid)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_org_admin(p_org) then raise exception 'Accès refusé'; end if;
  return jsonb_build_object(
    'accesses', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', a.id, 'status', a.status, 'source', a.source, 'permissions', a.permissions,
        'requested_at', a.requested_at, 'approved_at', a.approved_at, 'revoked_at', a.revoked_at, 'refused_at', a.refused_at,
        'firm', jsonb_build_object('id', f.id, 'name', f.name, 'city', f.city, 'website', f.website, 'verified', f.verified, 'status', f.status),
        'members', coalesce((
          select jsonb_agg(jsonb_build_object('name', trim(coalesce(m.first_name, '') || ' ' || coalesce(m.last_name, '')), 'email', m.email, 'role', m.role))
          from public.fiduciary_members m where m.firm_id = f.id and a.status in ('ACTIVE', 'PENDING_CLIENT', 'PENDING_FIRM')
        ), '[]'::jsonb)
      ) order by (a.status = 'PENDING_CLIENT') desc, (a.status = 'ACTIVE') desc, a.updated_at desc)
      from public.fiduciary_client_access a join public.fiduciary_firms f on f.id = a.firm_id
      where a.organization_id = p_org and a.status <> 'CANCELLED'
    ), '[]'::jsonb),
    'invitations', coalesce((
      select jsonb_agg(jsonb_build_object('id', i.id, 'email', i.email, 'permissions', i.permissions, 'created_at', i.created_at, 'expires_at', i.expires_at) order by i.created_at desc)
      from public.fiduciary_invitations i
      where i.organization_id = p_org and i.kind = 'CLIENT_TO_FIRM' and i.status = 'PENDING' and i.expires_at > now()
    ), '[]'::jsonb),
    'all_permissions', to_jsonb(public.fiduciary_all_permissions()),
    'standard_permissions', to_jsonb(public.fiduciary_standard_permissions())
  );
end;
$$;
revoke execute on function public.org_fiduciaries(uuid) from public, anon;
grant execute on function public.org_fiduciaries(uuid) to authenticated;

-- The client invites its fiduciary by email. A firm already on Cantia
-- Accounting gets a PENDING_FIRM access; otherwise an invitation to join.
create or replace function public.org_invite_fiduciary(p_org uuid, p_email text, p_permissions text[] default null)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_perms text[] := public.fiduciary_clean_permissions(coalesce(p_permissions, public.fiduciary_standard_permissions()));
  v_firm uuid;
  v_org_name text;
  v_inv public.fiduciary_invitations%rowtype;
  v_locale text;
begin
  if not public.is_org_admin(p_org) then raise exception 'Accès refusé'; end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Adresse e-mail invalide.'; end if;
  select name, coalesce(locale, 'fr') into v_org_name, v_locale from public.organizations where id = p_org;

  select m.firm_id into v_firm from public.fiduciary_members m
  join auth.users u on u.id = m.user_id
  join public.fiduciary_firms f on f.id = m.firm_id and f.status = 'ACTIVE'
  where lower(u.email) = v_email limit 1;

  if v_firm is not null then
    if exists (select 1 from public.fiduciary_client_access where firm_id = v_firm and organization_id = p_org and status = 'ACTIVE') then
      raise exception 'Cette fiduciaire a déjà accès à vos données.';
    end if;
    -- The firm had asked first: the client's invitation is its consent.
    if exists (select 1 from public.fiduciary_client_access where firm_id = v_firm and organization_id = p_org and status = 'PENDING_CLIENT') then
      update public.fiduciary_client_access set status = 'ACTIVE', permissions = v_perms, approved_by = auth.uid(), approved_at = now(), updated_at = now()
       where firm_id = v_firm and organization_id = p_org and status = 'PENDING_CLIENT';
      perform public.fiduciary_audit(v_firm, p_org, 'access_accepted', jsonb_build_object('permissions', v_perms));
      perform public.fiduciary_notify_firm(v_firm, 'access_accepted', jsonb_build_object('organization_name', v_org_name));
      return jsonb_build_object('kind', 'active');
    end if;
    if not exists (select 1 from public.fiduciary_client_access where firm_id = v_firm and organization_id = p_org and status = 'PENDING_FIRM') then
      insert into public.fiduciary_client_access (firm_id, organization_id, status, permissions, source, requested_by, approved_by, approved_at)
      values (v_firm, p_org, 'PENDING_FIRM', v_perms, 'CLIENT_INVITE', auth.uid(), auth.uid(), null);
    end if;
    perform public.fiduciary_audit(v_firm, p_org, 'client_invited_firm', jsonb_build_object('permissions', v_perms));
    perform public.fiduciary_notify_firm(v_firm, 'client_invite_existing_firm', jsonb_build_object('organization_name', v_org_name));
    return jsonb_build_object('kind', 'pending_firm');
  end if;

  update public.fiduciary_invitations set status = 'CANCELLED'
   where organization_id = p_org and kind = 'CLIENT_TO_FIRM' and status = 'PENDING' and lower(email) = v_email;
  insert into public.fiduciary_invitations (kind, organization_id, email, permissions, invited_by)
  values ('CLIENT_TO_FIRM', p_org, v_email, v_perms, auth.uid()) returning * into v_inv;
  perform public.fiduciary_audit(null, p_org, 'client_invited_firm', jsonb_build_object('email', v_email, 'permissions', v_perms));
  perform public.fiduciary_queue_email('client_invite_firm', v_email, v_locale, jsonb_build_object('organization_name', v_org_name, 'token', v_inv.token));
  return jsonb_build_object('kind', 'invitation');
end;
$$;
revoke execute on function public.org_invite_fiduciary(uuid, text, text[]) from public, anon;
grant execute on function public.org_invite_fiduciary(uuid, text, text[]) to authenticated;

create or replace function public.org_cancel_fiduciary_invitation(p_invitation uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_org uuid;
begin
  select organization_id into v_org from public.fiduciary_invitations where id = p_invitation and kind = 'CLIENT_TO_FIRM';
  if v_org is null or not public.is_org_admin(v_org) then raise exception 'Accès refusé'; end if;
  update public.fiduciary_invitations set status = 'CANCELLED' where id = p_invitation and status = 'PENDING';
  perform public.fiduciary_audit(null, v_org, 'invitation_cancelled', jsonb_build_object('invitation_id', p_invitation));
end;
$$;
revoke execute on function public.org_cancel_fiduciary_invitation(uuid) from public, anon;
grant execute on function public.org_cancel_fiduciary_invitation(uuid) to authenticated;

-- Accept / refuse a firm's request (PENDING_CLIENT).
create or replace function public.org_respond_fiduciary(p_access_id uuid, p_accept boolean, p_permissions text[] default null)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_a public.fiduciary_client_access%rowtype;
  v_org_name text;
  v_perms text[];
begin
  select * into v_a from public.fiduciary_client_access where id = p_access_id for update;
  if not found or not public.is_org_admin(v_a.organization_id) then raise exception 'Accès refusé'; end if;
  if v_a.status <> 'PENDING_CLIENT' then raise exception 'Cette demande n''est plus en attente.'; end if;
  select name into v_org_name from public.organizations where id = v_a.organization_id;
  v_perms := public.fiduciary_clean_permissions(coalesce(p_permissions, v_a.permissions));
  if p_accept then
    update public.fiduciary_client_access
       set status = 'ACTIVE', permissions = v_perms, approved_by = auth.uid(), approved_at = now(), updated_at = now()
     where id = p_access_id;
    perform public.fiduciary_audit(v_a.firm_id, v_a.organization_id, 'access_accepted', jsonb_build_object('permissions', v_perms));
    perform public.fiduciary_notify_firm(v_a.firm_id, 'access_accepted', jsonb_build_object('organization_name', v_org_name));
  else
    update public.fiduciary_client_access set status = 'REFUSED', refused_at = now(), updated_at = now() where id = p_access_id;
    perform public.fiduciary_audit(v_a.firm_id, v_a.organization_id, 'access_refused', '{}');
    perform public.fiduciary_notify_firm(v_a.firm_id, 'access_refused', jsonb_build_object('organization_name', v_org_name));
  end if;
end;
$$;
revoke execute on function public.org_respond_fiduciary(uuid, boolean, text[]) from public, anon;
grant execute on function public.org_respond_fiduciary(uuid, boolean, text[]) to authenticated;

create or replace function public.org_set_fiduciary_permissions(p_access_id uuid, p_permissions text[])
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_a public.fiduciary_client_access%rowtype;
  v_perms text[] := public.fiduciary_clean_permissions(p_permissions);
begin
  select * into v_a from public.fiduciary_client_access where id = p_access_id for update;
  if not found or not public.is_org_admin(v_a.organization_id) then raise exception 'Accès refusé'; end if;
  if v_a.status not in ('ACTIVE', 'PENDING_FIRM', 'PENDING_CLIENT') then raise exception 'Accès terminé.'; end if;
  update public.fiduciary_client_access set permissions = v_perms, updated_at = now() where id = p_access_id;
  perform public.fiduciary_audit(v_a.firm_id, v_a.organization_id, 'permissions_changed', jsonb_build_object('before', v_a.permissions, 'after', v_perms));
end;
$$;
revoke execute on function public.org_set_fiduciary_permissions(uuid, text[]) from public, anon;
grant execute on function public.org_set_fiduciary_permissions(uuid, text[]) to authenticated;

create or replace function public.org_revoke_fiduciary(p_access_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_a public.fiduciary_client_access%rowtype;
  v_org_name text;
begin
  select * into v_a from public.fiduciary_client_access where id = p_access_id for update;
  if not found or not public.is_org_admin(v_a.organization_id) then raise exception 'Accès refusé'; end if;
  if v_a.status not in ('ACTIVE', 'PENDING_FIRM') then raise exception 'Aucun accès actif à révoquer.'; end if;
  update public.fiduciary_client_access set status = 'REVOKED', revoked_at = now(), revoked_by = auth.uid(), updated_at = now() where id = p_access_id;
  select name into v_org_name from public.organizations where id = v_a.organization_id;
  perform public.fiduciary_audit(v_a.firm_id, v_a.organization_id, 'access_revoked', '{}');
  perform public.fiduciary_notify_firm(v_a.firm_id, 'access_revoked', jsonb_build_object('organization_name', v_org_name));
end;
$$;
revoke execute on function public.org_revoke_fiduciary(uuid) from public, anon;
grant execute on function public.org_revoke_fiduciary(uuid) to authenticated;

create or replace function public.org_fiduciary_audit(p_org uuid)
returns table (id uuid, action text, firm_name text, actor_name text, details jsonb, created_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
#variable_conflict use_column
begin
  if not public.is_org_admin(p_org) then raise exception 'Accès refusé'; end if;
  return query
  select l.id, l.action, f.name,
         coalesce(
           nullif(trim(coalesce(fm.first_name, '') || ' ' || coalesce(fm.last_name, '')), ''),
           nullif(om.full_name, ''),
           u.email::text
         ),
         l.details, l.created_at
  from public.fiduciary_audit_log l
  left join public.fiduciary_firms f on f.id = l.firm_id
  left join public.fiduciary_members fm on fm.user_id = l.actor_id and fm.firm_id = l.firm_id
  left join public.organization_members om on om.user_id = l.actor_id and om.organization_id = p_org
  left join auth.users u on u.id = l.actor_id
  where l.organization_id = p_org
  order by l.created_at desc
  limit 200;
end;
$$;
revoke execute on function public.org_fiduciary_audit(uuid) from public, anon;
grant execute on function public.org_fiduciary_audit(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- New company created from a firm's invitation (NEW_CLIENT): the token
-- travels in the user's metadata (fiduciary_invite) like the partner code.
-- The company gets a PENDING_CLIENT access: the client still accepts
-- explicitly in the app before anything is visible.

create or replace function public.fiduciary_claim_invite(p_org uuid, p_user uuid, p_token text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_inv public.fiduciary_invitations%rowtype;
  v_firm_name text;
begin
  select * into v_inv from public.fiduciary_invitations
   where token = p_token and kind = 'NEW_CLIENT' and status = 'PENDING' for update;
  if not found then return false; end if;
  update public.fiduciary_invitations
     set status = 'ACCEPTED', accepted_by = p_user, accepted_at = now(), result_organization_id = p_org
   where id = v_inv.id;
  if not exists (select 1 from public.fiduciary_client_access where firm_id = v_inv.firm_id and organization_id = p_org and status in ('PENDING_CLIENT', 'ACTIVE')) then
    insert into public.fiduciary_client_access (firm_id, organization_id, status, source, requested_by)
    values (v_inv.firm_id, p_org, 'PENDING_CLIENT', 'NEW_CLIENT_INVITE', v_inv.invited_by);
  end if;
  -- The notification is a nicety: never lose the access over it.
  begin
  insert into public.fiduciary_audit_log (firm_id, organization_id, actor_id, action, details)
  values (v_inv.firm_id, p_org, p_user, 'new_client_joined', jsonb_build_object('invitation_id', v_inv.id));
  select name into v_firm_name from public.fiduciary_firms where id = v_inv.firm_id;
  insert into public.notifications (organization_id, user_id, type, title, body, link, source_table, source_id)
  values (p_org, p_user, 'fiduciary_access_request', 'Votre fiduciaire vous attend',
          coalesce(v_firm_name, 'Votre fiduciaire') || ' souhaite accéder à vos données comptables. Acceptez ou refusez dans Paramètres › Fiduciaire.',
          '/(app)/compte/fiduciaire', 'organizations', p_org);
  exception when others then
    null;
  end;
  return true;
exception when others then
  return false;
end;
$$;
revoke execute on function public.fiduciary_claim_invite(uuid, uuid, text) from public, anon, authenticated;

create or replace function public.fiduciary_claim_on_new_owner()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_token text;
begin
  if new.role <> 'owner' then return new; end if;
  select raw_user_meta_data ->> 'fiduciary_invite' into v_token from auth.users where id = new.user_id;
  if coalesce(v_token, '') <> '' then
    perform public.fiduciary_claim_invite(new.organization_id, new.user_id, v_token);
  end if;
  return new;
exception when others then
  return new;
end;
$$;
revoke execute on function public.fiduciary_claim_on_new_owner() from public, anon, authenticated;
drop trigger if exists fiduciary_claim_on_new_owner on public.organization_members;
create trigger fiduciary_claim_on_new_owner
  after insert on public.organization_members
  for each row execute function public.fiduciary_claim_on_new_owner();

-- Second chance from the app right after the company is created.
create or replace function public.org_claim_fiduciary_invite(p_org uuid, p_token text)
returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.organization_members where organization_id = p_org and user_id = auth.uid() and role = 'owner') then
    return false;
  end if;
  return public.fiduciary_claim_invite(p_org, auth.uid(), p_token);
end;
$$;
revoke execute on function public.org_claim_fiduciary_invite(uuid, text) from public, anon;
grant execute on function public.org_claim_fiduciary_invite(uuid, text) to authenticated;

-- What the signup page shows for a firm's invitation link.
create or replace function public.fiduciary_new_client_preview(p_token text)
returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('firm_name', f.name, 'company_name', i.company_name, 'email', i.email)
  from public.fiduciary_invitations i join public.fiduciary_firms f on f.id = i.firm_id
  where i.token = p_token and i.kind = 'NEW_CLIENT' and i.status = 'PENDING' and i.expires_at > now();
$$;
revoke execute on function public.fiduciary_new_client_preview(text) from public;
grant execute on function public.fiduciary_new_client_preview(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Cantia admin (accounting.admin)

create or replace function public.acc_admin_assert()
returns void
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.has_platform_permission('accounting.admin') then
    raise exception 'Accès réservé à l''administration Cantia';
  end if;
end;
$$;

create or replace function public.acc_admin_overview()
returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.acc_admin_assert();
  return jsonb_build_object(
    'firms', (select count(*) from public.fiduciary_firms),
    'firms_active', (select count(*) from public.fiduciary_firms f where f.status = 'ACTIVE'
      and exists (select 1 from public.fiduciary_client_access a where a.firm_id = f.id and a.status = 'ACTIVE')),
    'firms_new_30d', (select count(*) from public.fiduciary_firms where created_at > now() - interval '30 days'),
    'linked_clients', (select count(distinct organization_id) from public.fiduciary_client_access where status = 'ACTIVE'),
    'acquired_clients', (select count(*) from public.fiduciary_invitations where kind = 'NEW_CLIENT' and result_organization_id is not null),
    'acquired_mrr_chf', coalesce((
      select sum(coalesce(pl.price_chf_monthly, 0))
      from public.fiduciary_invitations i
      join public.organizations o on o.id = i.result_organization_id
      join public.plans pl on pl.id = o.plan_id
      where i.kind = 'NEW_CLIENT' and o.subscription_status = 'active'
    ), 0),
    'partner_firms', (select count(distinct m.firm_id) from public.fiduciary_members m join public.partner_profiles p on p.user_id = m.user_id),
    'suspicious', (select count(*) from public.acc_admin_suspicious())
  );
end;
$$;

-- A firm is flagged when its requests are refused a lot, or when it sends
-- many requests in a short time.
create or replace function public.acc_admin_suspicious()
returns table (firm_id uuid, reason text)
language sql stable security definer set search_path = public as $$
  select a.firm_id, 'refus répétés (' || count(*) filter (where a.status = 'REFUSED') || ')'
  from public.fiduciary_client_access a
  where a.source = 'FIRM_REQUEST'
  group by a.firm_id
  having count(*) filter (where a.status = 'REFUSED') >= 3
     and count(*) filter (where a.status = 'REFUSED') * 2 >= count(*)
  union
  select l.firm_id, 'beaucoup de demandes en 7 jours (' || count(*) || ')'
  from public.fiduciary_audit_log l
  where l.action in ('access_requested', 'client_invited') and l.created_at > now() - interval '7 days'
  group by l.firm_id
  having count(*) >= 60;
$$;
revoke execute on function public.acc_admin_suspicious() from public, anon, authenticated;

create or replace function public.acc_admin_firms()
returns table (
  id uuid, name text, city text, status text, verified boolean, created_at timestamptz,
  owner_email text, members integer, active_clients integer, pending integer,
  invitations integer, acquired integer, partner boolean, suspicious text
)
language plpgsql stable security definer set search_path = public as $$
#variable_conflict use_column
begin
  perform public.acc_admin_assert();
  return query
  select f.id, f.name, f.city, f.status, f.verified, f.created_at,
         (select coalesce(m.email, u.email::text) from public.fiduciary_members m join auth.users u on u.id = m.user_id where m.firm_id = f.id and m.role = 'OWNER' order by m.created_at limit 1),
         (select count(*)::int from public.fiduciary_members m where m.firm_id = f.id),
         (select count(*)::int from public.fiduciary_client_access a where a.firm_id = f.id and a.status = 'ACTIVE'),
         (select count(*)::int from public.fiduciary_client_access a where a.firm_id = f.id and a.status in ('PENDING_CLIENT', 'PENDING_FIRM')),
         (select count(*)::int from public.fiduciary_invitations i where i.firm_id = f.id and i.kind = 'NEW_CLIENT'),
         (select count(*)::int from public.fiduciary_invitations i where i.firm_id = f.id and i.kind = 'NEW_CLIENT' and i.result_organization_id is not null),
         exists (select 1 from public.fiduciary_members m join public.partner_profiles p on p.user_id = m.user_id where m.firm_id = f.id),
         (select string_agg(s.reason, ', ') from public.acc_admin_suspicious() s where s.firm_id = f.id)
  from public.fiduciary_firms f
  order by f.created_at desc;
end;
$$;

create or replace function public.acc_admin_firm(p_firm uuid)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.acc_admin_assert();
  return jsonb_build_object(
    'firm', (select to_jsonb(f) from public.fiduciary_firms f where f.id = p_firm),
    'members', coalesce((select jsonb_agg(jsonb_build_object('user_id', m.user_id, 'role', m.role, 'name', trim(coalesce(m.first_name, '') || ' ' || coalesce(m.last_name, '')), 'email', coalesce(m.email, u.email), 'created_at', m.created_at))
      from public.fiduciary_members m join auth.users u on u.id = m.user_id where m.firm_id = p_firm), '[]'::jsonb),
    'clients', coalesce((select jsonb_agg(jsonb_build_object('access_id', a.id, 'organization', o.name, 'status', a.status, 'source', a.source, 'permissions', a.permissions, 'requested_at', a.requested_at, 'approved_at', a.approved_at) order by a.requested_at desc)
      from public.fiduciary_client_access a join public.organizations o on o.id = a.organization_id where a.firm_id = p_firm), '[]'::jsonb),
    'invitations', coalesce((select jsonb_agg(jsonb_build_object('kind', i.kind, 'email', i.email, 'company_name', i.company_name, 'status', i.status, 'partner_code', i.partner_code, 'created_at', i.created_at, 'organization', o.name) order by i.created_at desc)
      from public.fiduciary_invitations i left join public.organizations o on o.id = i.result_organization_id where i.firm_id = p_firm), '[]'::jsonb),
    'partners', coalesce((select jsonb_agg(jsonb_build_object(
        'name', trim(p.first_name || ' ' || p.last_name), 'status', p.status,
        'referrals', (select count(*) from public.referral_attributions ra where ra.partner_id = p.id),
        'paying', (select count(*) from public.referral_attributions ra where ra.partner_id = p.id and ra.first_paid_at is not null),
        'commissions_chf', (select coalesce(sum(c.amount_chf), 0) from public.partner_commissions c where c.partner_id = p.id and c.status <> 'CANCELLED')))
      from public.fiduciary_members m join public.partner_profiles p on p.user_id = m.user_id where m.firm_id = p_firm), '[]'::jsonb),
    'notes', coalesce((select jsonb_agg(jsonb_build_object('id', n.id, 'body', n.body, 'created_at', n.created_at, 'author', u.email) order by n.created_at desc)
      from public.fiduciary_admin_notes n left join auth.users u on u.id = n.author_id where n.firm_id = p_firm), '[]'::jsonb),
    'audit', coalesce((select jsonb_agg(x order by x.created_at desc) from (
        select l.action, l.details, l.created_at, o.name as organization, u.email as actor
        from public.fiduciary_audit_log l
        left join public.organizations o on o.id = l.organization_id
        left join auth.users u on u.id = l.actor_id
        where l.firm_id = p_firm order by l.created_at desc limit 100) x), '[]'::jsonb)
  );
end;
$$;

create or replace function public.acc_admin_set_firm(p_firm uuid, p_status text default null, p_verified boolean default null)
returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public.acc_admin_assert();
  if p_status is not null and p_status not in ('ACTIVE', 'SUSPENDED', 'BLOCKED') then raise exception 'Statut invalide'; end if;
  update public.fiduciary_firms
     set status = coalesce(p_status, status), verified = coalesce(p_verified, verified), updated_at = now()
   where id = p_firm;
  perform public.fiduciary_audit(p_firm, null, 'admin_firm_updated', jsonb_build_object('status', p_status, 'verified', p_verified));
end;
$$;

create or replace function public.acc_admin_add_note(p_firm uuid, p_body text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public.acc_admin_assert();
  if length(trim(coalesce(p_body, ''))) = 0 then raise exception 'Note vide'; end if;
  insert into public.fiduciary_admin_notes (firm_id, author_id, body) values (p_firm, auth.uid(), trim(p_body));
end;
$$;

create or replace function public.acc_admin_remove_access(p_access_id uuid, p_reason text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_a public.fiduciary_client_access%rowtype;
begin
  perform public.acc_admin_assert();
  select * into v_a from public.fiduciary_client_access where id = p_access_id for update;
  if not found then raise exception 'Accès introuvable'; end if;
  update public.fiduciary_client_access set status = 'REVOKED', revoked_at = now(), revoked_by = auth.uid(), updated_at = now() where id = p_access_id;
  perform public.fiduciary_audit(v_a.firm_id, v_a.organization_id, 'admin_access_removed', jsonb_build_object('reason', p_reason));
end;
$$;

do $$
declare
  f text;
begin
  foreach f in array array[
    'acc_admin_assert()', 'acc_admin_overview()', 'acc_admin_firms()', 'acc_admin_firm(uuid)',
    'acc_admin_set_firm(uuid, text, boolean)', 'acc_admin_add_note(uuid, text)', 'acc_admin_remove_access(uuid, text)'
  ] loop
    execute format('revoke execute on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Email outbox: sent right away by accounting-mailer (trigger), retried
-- every hour by cron for anything left unsent.

-- The mailer takes rows with this, so two runs never send the same email.
create or replace function public.fiduciary_outbox_claim(p_limit integer default 25)
returns setof public.fiduciary_email_outbox
language sql security definer set search_path = public as $$
  update public.fiduciary_email_outbox o
     set claimed_at = now(), attempts = o.attempts + 1
   where o.id in (
     select id from public.fiduciary_email_outbox
     where sent_at is null and attempts < 5 and (claimed_at is null or claimed_at < now() - interval '5 minutes')
     order by created_at
     limit p_limit
     for update skip locked
   )
  returning o.*;
$$;
revoke execute on function public.fiduciary_outbox_claim(integer) from public, anon, authenticated;
grant execute on function public.fiduciary_outbox_claim(integer) to service_role;

create or replace function public.fiduciary_outbox_dispatch()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform net.http_post(
    url := 'https://krijilwxhdlzflvnvrtl.supabase.co/functions/v1/accounting-mailer',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Dispatch-Secret', coalesce((select decrypted_secret from vault.decrypted_secrets where name = 'dispatch_secret'), '')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 20000
  );
  return null;
exception when others then
  return null;
end;
$$;
revoke execute on function public.fiduciary_outbox_dispatch() from public, anon, authenticated;
drop trigger if exists fiduciary_outbox_dispatch on public.fiduciary_email_outbox;
create trigger fiduciary_outbox_dispatch
  after insert on public.fiduciary_email_outbox
  for each statement execute function public.fiduciary_outbox_dispatch();

select cron.schedule(
  'accounting-mailer-retry',
  '17 * * * *',
  $cron$
  select net.http_post(
    url := 'https://krijilwxhdlzflvnvrtl.supabase.co/functions/v1/accounting-mailer',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Dispatch-Secret', coalesce((select decrypted_secret from vault.decrypted_secrets where name = 'dispatch_secret'), '')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  )
  where exists (select 1 from public.fiduciary_email_outbox where sent_at is null and attempts < 5);
  $cron$
);

notify pgrst, 'reload schema';
