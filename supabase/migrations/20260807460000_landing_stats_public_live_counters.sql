-- Public, aggregate-only stats for the marketing landing page. This is a
-- singleton table (not per-organization data) so it is safe to expose to
-- anonymous visitors: it never contains anything more granular than a count
-- or a sum, no names, no org identifiers.
create table if not exists public.landing_stats (
  id boolean primary key default true,
  users_count integer not null default 0,
  organizations_count integer not null default 0,
  devis_count integer not null default 0,
  cash_collected_chf numeric not null default 0,
  updated_at timestamptz not null default now(),
  constraint landing_stats_singleton check (id)
);

alter table public.landing_stats enable row level security;

create policy "landing_stats_public_read" on public.landing_stats
  for select
  to anon, authenticated
  using (true);

-- No insert/update/delete policies for anon/authenticated: the row is only
-- ever written by refresh_landing_stats() below, running as the function
-- owner (security definer), not by client requests.

create or replace function public.refresh_landing_stats()
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.landing_stats (id, users_count, organizations_count, devis_count, cash_collected_chf, updated_at)
  values (
    true,
    (select count(distinct user_id) from public.organization_members),
    (select count(*) from public.organizations),
    (select count(*) from public.devis),
    coalesce((select sum(amount) from public.facture_payments), 0),
    now()
  )
  on conflict (id) do update set
    users_count = excluded.users_count,
    organizations_count = excluded.organizations_count,
    devis_count = excluded.devis_count,
    cash_collected_chf = excluded.cash_collected_chf,
    updated_at = excluded.updated_at;
$$;

create or replace function public.trg_refresh_landing_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_landing_stats();
  return null;
end;
$$;

drop trigger if exists refresh_landing_stats_members on public.organization_members;
create trigger refresh_landing_stats_members
  after insert or delete on public.organization_members
  for each statement execute function public.trg_refresh_landing_stats();

drop trigger if exists refresh_landing_stats_orgs on public.organizations;
create trigger refresh_landing_stats_orgs
  after insert or delete on public.organizations
  for each statement execute function public.trg_refresh_landing_stats();

drop trigger if exists refresh_landing_stats_devis on public.devis;
create trigger refresh_landing_stats_devis
  after insert or delete on public.devis
  for each statement execute function public.trg_refresh_landing_stats();

drop trigger if exists refresh_landing_stats_payments on public.facture_payments;
create trigger refresh_landing_stats_payments
  after insert or update or delete on public.facture_payments
  for each statement execute function public.trg_refresh_landing_stats();

-- Seed the row from current data immediately (rather than waiting for the
-- next write on one of the tracked tables).
select public.refresh_landing_stats();

-- Broadcast changes to anon subscribers so the landing page's cash-collected
-- figure can update live without a page refresh.
alter publication supabase_realtime add table public.landing_stats;
