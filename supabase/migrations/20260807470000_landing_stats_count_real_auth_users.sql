-- Switch users_count to the real Supabase auth signup count (auth.users)
-- instead of distinct organization_members — the landing page badge is
-- meant to read "how many people signed up", not "how many completed
-- onboarding into an org".
create or replace function public.refresh_landing_stats()
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.landing_stats (id, users_count, organizations_count, devis_count, cash_collected_chf, updated_at)
  values (
    true,
    (select count(*) from auth.users),
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

-- The organization_members trigger no longer feeds users_count (that now
-- comes straight from auth.users), so replace it with a trigger on
-- auth.users itself, firing on every real signup/account deletion.
drop trigger if exists refresh_landing_stats_members on public.organization_members;

drop trigger if exists refresh_landing_stats_auth_users on auth.users;
create trigger refresh_landing_stats_auth_users
  after insert or delete on auth.users
  for each statement execute function public.trg_refresh_landing_stats();

-- Recompute immediately so the table reflects the corrected metric right away.
select public.refresh_landing_stats();
