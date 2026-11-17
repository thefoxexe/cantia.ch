-- Super Admin: everything that waits for an action, in one call. Feeds the
-- « À traiter » list of the home page and the counters of the side menu
-- (app/(admin)/_layout.tsx, lib/adminDataContext.tsx). Counts only, read
-- from the tables each page already uses; the pages keep the detail.

create or replace function public.admin_attention()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  partners jsonb;
  fiduciaries jsonb;
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  begin
    partners := public.partners_admin_overview();
  exception when others then
    partners := '{}'::jsonb;
  end;
  begin
    fiduciaries := public.acc_admin_overview();
  exception when others then
    fiduciaries := '{}'::jsonb;
  end;

  return jsonb_build_object(
    -- Prospection
    'outreach_drafts', (select count(*) from public.registry_companies where outreach_status = 'draft'),
    'outreach_failed', (select count(*) from public.registry_companies where outreach_status = 'failed'),
    'trial_requests', (select count(*) from public.trial_requests where status = 'new'),
    -- Clients
    'past_due', (select count(*) from public.organizations where subscription_status in ('past_due', 'unpaid')),
    'trials_ending_3d', (select count(*) from public.organizations
                          where subscription_status = 'trialing'
                            and trial_ends_at is not null
                            and trial_ends_at between now() and now() + interval '3 days'),
    'signups_24h', (select count(*) from public.organizations where created_at > now() - interval '24 hours'),
    'incomplete_signups_7d', (select count(*) from public.organizations
                               where created_at > now() - interval '7 days'
                                 and subscription_status is null),
    'cancellation_reasons_7d', (select count(*) from public.subscription_cancellation_reasons
                                 where created_at > now() - interval '7 days'),
    -- Écosystème
    'partner_payouts', coalesce((partners ->> 'to_pay_count')::int, 0),
    'fiduciaries_suspicious', coalesce((fiduciaries ->> 'suspicious')::int, 0)
  );
end;
$$;
revoke execute on function public.admin_attention() from public, anon;
grant execute on function public.admin_attention() to authenticated;

notify pgrst, 'reload schema';
