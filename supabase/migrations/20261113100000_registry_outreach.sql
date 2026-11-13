-- Nouvelles entreprises › e-mail de bienvenue avec 3 mois offerts.
--
-- Every morning at 07:30 (Swiss time) the registry-outreach function writes
-- a draft for each new company of French-speaking Switzerland whose e-mail
-- was confirmed on its own site (or typed by the admin), at most 20 drafts
-- waiting at once: the next ones wait for the following mornings. The admin
-- gets one e-mail listing the drafts, reads them in Super Admin › Nouvelles
-- entreprises › À envoyer, edits them if needed and sends them. Nothing is
-- ever sent without that click, and never more than 20 a day.
--
-- Each draft carries a code of its own: 90 days of trial instead of 14,
-- usable by one organization, valid 60 days from the day the e-mail is
-- sent. The code lives here, not in Stripe: stripe-checkout reads it and
-- gives the subscription a 90-day trial (subscription_data.trial_period_days),
-- like ESSAI30, so an annual plan is not made free for a year.

create table if not exists public.trial_offer_codes (
  code text primary key,
  registry_id uuid references public.registry_companies(id) on delete set null,
  trial_days int not null default 90 check (trial_days between 1 and 365),
  expires_at timestamptz,            -- set when the e-mail is sent (sent + 60 days)
  organization_id uuid references public.organizations(id) on delete set null,
  claimed_at timestamptz,            -- first checkout opened with it
  redeemed_at timestamptz,           -- subscription created with its trial
  created_at timestamptz not null default now()
);
alter table public.trial_offer_codes enable row level security;
drop policy if exists "platform admins read trial offer codes" on public.trial_offer_codes;
create policy "platform admins read trial offer codes" on public.trial_offer_codes
  for select using (public.is_platform_admin());

alter table public.registry_companies add column if not exists outreach_status text
  check (outreach_status in ('draft', 'sent', 'skipped', 'failed'));
alter table public.registry_companies add column if not exists outreach_subject text;
alter table public.registry_companies add column if not exists outreach_body text;
alter table public.registry_companies add column if not exists outreach_code text references public.trial_offer_codes(code) on delete set null;
alter table public.registry_companies add column if not exists outreach_prepared_at timestamptz;
alter table public.registry_companies add column if not exists outreach_sent_at timestamptz;
alter table public.registry_companies add column if not exists outreach_error text;
alter table public.registry_companies add column if not exists unsubscribe_token uuid not null default gen_random_uuid();
alter table public.registry_companies add column if not exists unsubscribed_at timestamptz;
create unique index if not exists registry_companies_unsubscribe_idx on public.registry_companies (unsubscribe_token);
create index if not exists registry_companies_outreach_idx on public.registry_companies (outreach_status, email_checked_at);

-- Admin: correct a draft before sending it, or set it aside.
create or replace function public.admin_registry_outreach_update(
  p_id uuid,
  p_subject text default null,
  p_body text default null,
  p_skip boolean default false
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;
  update public.registry_companies set
    outreach_subject = coalesce(nullif(trim(p_subject), ''), outreach_subject),
    outreach_body = coalesce(nullif(trim(p_body), ''), outreach_body),
    outreach_status = case when p_skip then 'skipped' else outreach_status end,
    updated_at = now()
  where id = p_id and outreach_status in ('draft', 'failed');
end;
$$;
revoke all on function public.admin_registry_outreach_update(uuid, text, text, boolean) from public, anon;
grant execute on function public.admin_registry_outreach_update(uuid, text, text, boolean) to authenticated;

-- Unsubscribe link of the e-mail (cantia.ch/desinscription?t=…): no
-- account needed, the token is the only key. Says only whether it worked.
create or replace function public.registry_unsubscribe(p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  update public.registry_companies
     set unsubscribed_at = coalesce(unsubscribed_at, now()), updated_at = now()
   where unsubscribe_token = p_token
  returning email into v_email;
  if not found then return false; end if;
  -- The same address under another registry entry is never written to either.
  if v_email is not null then
    update public.registry_companies set unsubscribed_at = coalesce(unsubscribed_at, now())
     where email = v_email;
  end if;
  return true;
end;
$$;
revoke all on function public.registry_unsubscribe(uuid) from public;
grant execute on function public.registry_unsubscribe(uuid) to anon, authenticated;

-- Plan screen: is this offer code still good, and for how many days?
-- Returns the trial length, or null. Reveals nothing else about the code.
create or replace function public.trial_offer_preview(p_code text)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select t.trial_days
    from public.trial_offer_codes t
   where t.code = upper(trim(p_code))
     and t.expires_at > now()
     and t.redeemed_at is null
   limit 1
$$;
revoke all on function public.trial_offer_preview(text) from public;
grant execute on function public.trial_offer_preview(text) to anon, authenticated;

-- 07:30 in Zurich all year: the job runs at 05:30 and 06:30 UTC and the
-- function only works in the run where it is 07:xx in Zurich.
select cron.unschedule(jobid) from cron.job where jobname = 'registry-outreach-prepare';
select cron.schedule(
  'registry-outreach-prepare',
  '30 5,6 * * *',
  $$
  select net.http_post(
    url := 'https://krijilwxhdlzflvnvrtl.supabase.co/functions/v1/registry-outreach',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Dispatch-Secret', coalesce((select decrypted_secret from vault.decrypted_secrets where name = 'dispatch_secret'), '')
    ),
    body := '{"action":"prepare","only_at_zurich_hour":7}'::jsonb,
    timeout_milliseconds := 120000
  )
  where extract(hour from now() at time zone 'Europe/Zurich') = 7;
  $$
);

notify pgrst, 'reload schema';
