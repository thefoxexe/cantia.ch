-- 3 mois offerts: follow what each welcome e-mail leads to, and the public
-- code of the page cantia.ch/nouvelle-entreprise.
--
--   visits / visited_at  the sign-up page was opened with the code's link
--                        (app/(auth)/signup.tsx calls trial_offer_visit);
--   claimed_at           a checkout was opened with it (stripe-checkout);
--   redeemed_at          the 90-day trial really started (stripe-webhook).
--
-- NOUVELLE is the code shown on cantia.ch/nouvelle-entreprise: usable by any
-- new account (multi_use), never claimed by one organization; it gives the
-- 90 days only to an organization that has not had a trial yet.

alter table public.trial_offer_codes add column if not exists multi_use boolean not null default false;
alter table public.trial_offer_codes add column if not exists visits int not null default 0;
alter table public.trial_offer_codes add column if not exists visited_at timestamptz;

insert into public.trial_offer_codes (code, trial_days, expires_at, multi_use)
values ('NOUVELLE', 90, '2027-12-31 23:59:59+01', true)
on conflict (code) do nothing;

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

notify pgrst, 'reload schema';
