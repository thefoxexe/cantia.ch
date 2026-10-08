#!/usr/bin/env python3
"""Builds supabase/tests/fiduciary/00_stubs.sql: minimal tables of the
existing schema + the REAL helper functions copied from the migrations, so
20261008140000_fiduciary_pro.sql runs against the same code as in prod."""
import re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
mig = root / 'supabase' / 'migrations'

def fn(file, name):
    text = (mig / file).read_text()
    m = re.search(r'create or replace function public\.%s\(.*?\n\$\$;\n' % re.escape(name), text, re.S)
    if not m:
        raise SystemExit(f'missing {name} in {file}')
    return m.group(0)

TABLES = r"""
do $$ begin create role authenticated; exception when duplicate_object then null; end $$;
do $$ begin create role anon; exception when duplicate_object then null; end $$;
do $$ begin create role service_role bypassrls; exception when duplicate_object then null; end $$;
alter role service_role bypassrls;
create extension if not exists pgcrypto;
create schema if not exists extensions;
create or replace function extensions.gen_random_bytes(int) returns bytea language sql as $$ select public.gen_random_bytes($1) $$;
create schema auth;
create table auth.users (id uuid primary key, email text);
create or replace function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.uid', true), '')::uuid $$;
create schema storage;
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
alter table storage.objects enable row level security;
create table public.plans (id text primary key, name text);
create table public.organizations (id uuid primary key default gen_random_uuid(), name text, locale text default 'fr', plan_id text);
create table public.organization_members (organization_id uuid, user_id uuid, role text, locale text, role_id uuid);
create table public.platform_permissions (user_id uuid, permission text);
create table public.notifications (id uuid primary key default gen_random_uuid(), organization_id uuid, user_id uuid, type text, title text, body text, link text, source_table text, source_id uuid);
create function public.is_org_admin(org uuid) returns boolean language sql stable security definer as $$ select exists(select 1 from public.organization_members where organization_id=org and user_id=auth.uid() and role in ('owner','admin')) $$;
create function public.is_org_member(org uuid) returns boolean language sql stable security definer as $$ select exists(select 1 from public.organization_members where organization_id=org and user_id=auth.uid()) $$;
create function public.can_view_org_finances(org uuid) returns boolean language sql stable security definer as $$ select public.is_org_admin(org) $$;
create function public.finance_member_user_ids(org uuid) returns setof uuid language sql stable security definer as $$ select user_id from public.organization_members where organization_id=org and role in ('owner','admin') $$;
create function public.can_manage_org_accounting_drafts(org uuid) returns boolean language sql stable security definer as $$ select public.is_org_admin(org) $$;
create function public.can_post_org_accounting_entries(org uuid) returns boolean language sql stable security definer as $$ select exists(select 1 from public.organization_members where organization_id=org and user_id=auth.uid() and role='owner') $$;

create table public.fiduciary_firms (
  id uuid primary key default gen_random_uuid(), name text not null, phone text, address text, postal_code text, city text,
  country text not null default 'CH', ide_number text, website text, mandates_range text, software text[] not null default '{}',
  locale text not null default 'fr', status text not null default 'ACTIVE', verified boolean not null default false,
  public_directory_visible boolean not null default false, created_by uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.fiduciary_members (firm_id uuid not null references public.fiduciary_firms(id), user_id uuid not null unique, role text not null default 'MEMBER',
  first_name text, last_name text, email text, all_clients boolean not null default true, created_at timestamptz default now(), primary key (firm_id, user_id));
create table public.fiduciary_member_clients (firm_id uuid, user_id uuid, organization_id uuid);
create table public.fiduciary_client_access (id uuid primary key default gen_random_uuid(), firm_id uuid not null, organization_id uuid not null, status text not null,
  permissions text[] not null default '{}', source text not null, requested_by uuid, approved_by uuid, revoked_by uuid,
  requested_at timestamptz default now(), approved_at timestamptz, refused_at timestamptz, revoked_at timestamptz, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.fiduciary_audit_log (id uuid primary key default gen_random_uuid(), firm_id uuid, organization_id uuid, actor_id uuid, action text not null, details jsonb not null default '{}', created_at timestamptz not null default now());
create table public.fiduciary_email_outbox (id uuid primary key default gen_random_uuid(), kind text not null, to_email text not null, locale text not null default 'fr', payload jsonb not null default '{}', created_at timestamptz default now());
create table public.fiduciary_client_profiles (
  firm_id uuid not null, organization_id uuid not null,
  vat_method text not null default 'effective_quarterly', has_payroll boolean not null default true, legal_form text not null default 'sarl',
  fiscal_year_end text not null default '12-31', tax_return_due text not null default '03-31', assigned_to uuid, updated_by uuid, updated_at timestamptz not null default now(),
  primary key (firm_id, organization_id));
create table public.fiduciary_deadline_status (firm_id uuid, organization_id uuid, kind text, period_key text, status text, note text, updated_by uuid, updated_at timestamptz);
create table public.fiduciary_requests (id uuid primary key default gen_random_uuid(), firm_id uuid, organization_id uuid, title text, details text, due_date date,
  status text default 'open', client_message text, created_by uuid, created_at timestamptz default now(), answered_at timestamptz, closed_at timestamptz, last_reminded_at timestamptz);
create table public.fiduciary_request_files (id uuid primary key default gen_random_uuid(), request_id uuid, organization_id uuid, file_path text, file_name text, size_bytes bigint, created_at timestamptz default now());

create table public.accounting_fiscal_years (id uuid primary key default gen_random_uuid(), organization_id uuid, start_date date, end_date date, status text default 'open', locked_until_date date);
create table public.accounting_journals (id uuid primary key default gen_random_uuid(), organization_id uuid, code text, label text, is_active boolean default true);
create table public.accounting_accounts (id uuid primary key default gen_random_uuid(), organization_id uuid, code text, label text, type text, is_active boolean default true);
create table public.accounting_entries (id uuid primary key default gen_random_uuid(), organization_id uuid, fiscal_year_id uuid, journal_id uuid, entry_number int, entry_date date,
  label text, external_reference text, source text, status text default 'brouillon', created_by uuid, posted_at timestamptz, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.accounting_entry_lines (id uuid primary key default gen_random_uuid(), entry_id uuid references public.accounting_entries(id), account_id uuid, debit numeric(12,2) default 0, credit numeric(12,2) default 0, label text, sort_order int default 0,
  check ((debit > 0 and credit = 0) or (credit > 0 and debit = 0)));
create table public.accounting_entry_sequences (fiscal_year_id uuid primary key, next_number integer not null default 1);
create table public.accounting_audit_events (id uuid primary key default gen_random_uuid(), organization_id uuid, user_id uuid, action text, entity_type text, entity_id uuid, new_values jsonb, source text);
"""

FUNCS = [
    ('20260929210000_accounting_foundation.sql', n) for n in [
        'fiduciary_all_permissions', 'fiduciary_standard_permissions', 'fiduciary_clean_permissions', 'my_fiduciary_firm_id', 'my_fiduciary_role',
        'fiduciary_org_ids', 'fiduciary_can', 'fiduciary_audit', 'fiduciary_queue_email', 'fiduciary_firm_admin_emails', 'fiduciary_notify_firm',
    ]
] + [
    ('20260930120000_fiduciary_workspace.sql', n) for n in ['acc_assert_client', 'fiduciary_client_finance_people']
] + [
    ('20260911233700_accounting_v2_posting_engine.sql', n) for n in ['find_org_open_fiscal_year', 'post_accounting_entry']
]

out = [TABLES]
for f, n in FUNCS:
    out.append(fn(f, n))
(root / 'supabase' / 'tests' / 'fiduciary' / '00_stubs.sql').write_text('-- Generated by scripts/build-fiduciary-test-stubs.py\n' + '\n'.join(out))
print('ok')
