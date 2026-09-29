-- Relances de devis automatiques (plan Entreprise), réglées dans
-- Automatisations. Off until the org turns them on.
--
-- send-devis-followups runs every 15 minutes (cron below): for each org with
-- enabled settings and a plan with has_sales_tracking, it sends the next
-- follow-up of every devis still 'sent' once `days[step]` days have passed
-- since the devis email, inside the send window (Swiss time), and records a
-- 'followup_sent' devis_event. It stops on its own when the client signs,
-- refuses, replies, the email bounced, the devis expired, or someone paused
-- the devis (devis.followups_paused).

create table public.devis_followup_settings (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  enabled boolean not null default false,
  preset text not null default 'standard' check (preset in ('doux', 'standard', 'soutenu', 'custom')),
  -- Days after the devis email, one entry per follow-up (1 to 5 steps).
  days integer[] not null default '{3,7,14}'
    check (cardinality(days) between 1 and 5 and 1 <= all(days) and 90 >= all(days)),
  -- Devis below this amount (incl. VAT) are never followed up. 0 = all.
  min_amount numeric(12,2) not null default 0 check (min_amount >= 0),
  send_from_hour integer not null default 8 check (send_from_hour between 0 and 23),
  send_to_hour integer not null default 18 check (send_to_hour between 1 and 24),
  weekdays_only boolean not null default true,
  attach_pdf boolean not null default true,
  -- Custom texts per step, in the org's language: ["text step 1", ...].
  -- Empty or missing entries use the standard text of the devis language.
  messages text[] not null default '{}',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  constraint devis_followup_settings_window check (send_to_hour > send_from_hour)
);

create trigger devis_followup_settings_set_updated_at before update on public.devis_followup_settings
for each row execute function public.set_updated_at();

alter table public.devis_followup_settings enable row level security;

create policy "finance members can view follow-up settings" on public.devis_followup_settings
  for select using (public.can_view_org_finances(organization_id));
create policy "finance members can create follow-up settings" on public.devis_followup_settings
  for insert with check (public.can_view_org_finances(organization_id));
create policy "finance members can update follow-up settings" on public.devis_followup_settings
  for update using (public.can_view_org_finances(organization_id));

-- Per-devis stop switch ("Suspendre les relances" on the devis).
alter table public.devis add column if not exists followups_paused boolean not null default false;

select cron.schedule(
  'send-devis-followups',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://krijilwxhdlzflvnvrtl.supabase.co/functions/v1/send-devis-followups',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Dispatch-Secret', coalesce((select decrypted_secret from vault.decrypted_secrets where name = 'dispatch_secret'), '')
    ),
    body := '{}'::jsonb
  );
  $$
);
