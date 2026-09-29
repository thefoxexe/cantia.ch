-- Monthly reminder to the Cantia Partners admin (PARTNERS_ADMIN_EMAIL
-- secret): on the 4th, the day before payouts, what is due and what blocks.

create or replace function public.partners_payout_digest()
returns jsonb
language sql stable security definer set search_path = public as $$
  with cfg as (select * from public.partners_config limit 1),
  eligible as (
    select c.partner_id, sum(c.amount_chf) total, bool_or(p.iban_masked is null) no_iban
    from public.partner_commissions c
    join public.partner_profiles p on p.id = c.partner_id
    where c.status = 'AVAILABLE' and c.payout_id is null and p.status <> 'BLOCKED' and not p.payouts_frozen
    group by c.partner_id
    having sum(c.amount_chf) >= (select min_payout_chf from cfg)
  )
  select jsonb_build_object(
    'eligible_partners', (select count(*) from eligible),
    'eligible_chf', coalesce((select sum(total) from eligible), 0),
    'missing_iban', (select count(*) from eligible where no_iban),
    'pending_chf', coalesce((select sum(amount_chf) from public.partner_commissions where status = 'PENDING'), 0),
    'to_pay_count', (select count(*) from public.partner_payouts where status = 'TO_PAY'),
    'payout_day', (select payout_day from cfg)
  );
$$;
revoke execute on function public.partners_payout_digest() from public, anon, authenticated;
grant execute on function public.partners_payout_digest() to service_role;

-- 07:45 UTC = 08:45 / 09:45 in Zurich depending on summer time.
select cron.schedule(
  'partners-admin-reminder',
  '45 7 4 * *',
  $cron$
  select net.http_post(
    url := 'https://krijilwxhdlzflvnvrtl.supabase.co/functions/v1/partners-admin-reminder',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Dispatch-Secret', coalesce((select decrypted_secret from vault.decrypted_secrets where name = 'dispatch_secret'), '')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
  $cron$
);
