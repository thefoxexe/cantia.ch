-- 3 mois offerts: follow what each code leads to, and the requests made on
-- cantia.ch/nouvelle-entreprise.
--
--   visits / visited_at  the sign-up page was opened with the code's link
--                        (app/(auth)/signup.tsx calls trial_offer_visit);
--   claimed_at           a checkout was opened with it (stripe-checkout);
--   redeemed_at          the 90-day trial really started (stripe-webhook).
--
-- trial_requests: a company asks for the 3 months with the form of the
-- page (registry-outreach, action « request », which e-mails the admin).
-- The admin sends it a personal code from Super Admin › Nouvelles
-- entreprises › À envoyer, or sets the request aside.

alter table public.trial_offer_codes add column if not exists visits int not null default 0;
alter table public.trial_offer_codes add column if not exists visited_at timestamptz;

-- Called by the sign-up page when it is opened with ?offer=CODE. Counts the
-- visit, says nothing back.
create or replace function public.trial_offer_visit(p_code text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.trial_offer_codes
     set visits = visits + 1, visited_at = coalesce(visited_at, now())
   where code = upper(trim(p_code)) and visits < 100000;
$$;
revoke all on function public.trial_offer_visit(text) from public;
grant execute on function public.trial_offer_visit(text) to anon, authenticated;

create table if not exists public.trial_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  company text not null,
  email text not null,
  phone text,
  message text,
  locale text not null default 'fr' check (locale in ('fr', 'de', 'it')),
  status text not null default 'new' check (status in ('new', 'sent', 'ignored')),
  code text references public.trial_offer_codes(code) on delete set null,
  sent_at timestamptz
);
create index if not exists trial_requests_status_idx on public.trial_requests (status, created_at desc);
alter table public.trial_requests enable row level security;
drop policy if exists "platform admins read trial requests" on public.trial_requests;
create policy "platform admins read trial requests" on public.trial_requests
  for select using (public.is_platform_admin());
-- Writes go through the registry-outreach function (service role).

notify pgrst, 'reload schema';
