-- Super Admin › Journal: one feed of what happens on the platform, newest
-- first, from the tables that already record it:
--   signup         auth.users (new accounts)
--   company        organizations (companies created)
--   subscription   organization_subscription_events (trial, activation,
--                  plan change, cancellation)
--   cancel_reason  subscription_cancellation_reasons
--   email          newsletter_campaigns and failed scheduled sends
--   fiduciary      fiduciary_audit_log (Cantia Accounting)
--   partner        partner_audit_log (Cantia Partners)
--   sync_error     integration_sync_logs in error (Bexio)
--   lead           blog_leads
--   admin          admin_audit_logs (modules enabled / disabled)
-- p_kinds limits the feed to some of them, p_before pages back in time.
create or replace function public.admin_activity_feed(
  p_limit int default 150,
  p_before timestamptz default null,
  p_kinds text[] default null
)
returns table(
  at timestamptz,
  kind text,
  action text,
  title text,
  detail text,
  organization_id uuid,
  organization_name text,
  actor text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_limit int := least(greatest(coalesce(p_limit, 150), 1), 500);
  v_before timestamptz := coalesce(p_before, now() + interval '1 minute');
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  return query
  select * from (
    (select u.created_at, 'signup'::text, 'signup'::text, 'Nouvelle inscription'::text, u.email::text,
            null::uuid, null::text, null::text
       from auth.users u
      where (p_kinds is null or 'signup' = any(p_kinds)) and u.created_at < v_before
      order by u.created_at desc limit v_limit)
    union all
    (select o.created_at, 'company', 'company_created', 'Entreprise créée', nullif(concat_ws(' · ', o.trade, o.locality), ''),
            o.id, o.name, null
       from public.organizations o
      where (p_kinds is null or 'company' = any(p_kinds)) and o.created_at < v_before
      order by o.created_at desc limit v_limit)
    union all
    (select e.created_at, 'subscription', e.event_type,
            case e.event_type
              when 'trial_started' then 'Essai démarré'
              when 'activated' then 'Abonnement activé'
              when 'canceled' then 'Abonnement résilié'
              when 'plan_changed' then 'Changement de plan'
              else e.event_type end,
            nullif(concat_ws(' → ', e.detail->>'from', coalesce(e.detail->>'to', e.detail->>'plan_id')), ''),
            o.id, o.name, null
       from public.organization_subscription_events e
       left join public.organizations o on o.id = e.organization_id
      where (p_kinds is null or 'subscription' = any(p_kinds)) and e.created_at < v_before
      order by e.created_at desc limit v_limit)
    union all
    (select r.created_at, 'cancel_reason', r.reason, 'Motif de résiliation',
            nullif(concat_ws(' : ', r.reason, nullif(r.comment, '')), ''),
            o.id, o.name, null
       from public.subscription_cancellation_reasons r
       left join public.organizations o on o.id = r.organization_id
      where (p_kinds is null or 'cancel_reason' = any(p_kinds)) and r.created_at < v_before
      order by r.created_at desc limit v_limit)
    union all
    (select c.created_at, 'email', case when c.sent_count = 0 then 'email_failed' else 'email_sent' end,
            case when c.sent_count = 0 then 'E-mail non envoyé' else 'E-mail envoyé' end,
            concat(c.subject, ' · ', c.sent_count, ' sur ', c.total_count, ' envoyés',
                   case when c.error is not null then ' · ' || left(c.error, 160) else '' end),
            null, c.audience_label, u.email::text
       from public.newsletter_campaigns c
       left join auth.users u on u.id = c.sent_by
      where (p_kinds is null or 'email' = any(p_kinds)) and c.created_at < v_before
      order by c.created_at desc limit v_limit)
    union all
    (select coalesce(s.sent_at, s.scheduled_at), 'email', 'scheduled_failed', 'Envoi programmé échoué',
            concat(s.subject, ' · ', coalesce(s.error, 'erreur inconnue')),
            null, s.audience_label, null
       from public.scheduled_newsletter_sends s
      where (p_kinds is null or 'email' = any(p_kinds)) and s.status = 'failed'
        and coalesce(s.sent_at, s.scheduled_at) < v_before
      order by coalesce(s.sent_at, s.scheduled_at) desc limit v_limit)
    union all
    (select f.created_at, 'fiduciary', f.action, ff.name,
            nullif(concat_ws(' · ', f.details->>'name', f.details->>'title', f.details->>'email'), ''),
            o.id, o.name, u.email::text
       from public.fiduciary_audit_log f
       left join public.fiduciary_firms ff on ff.id = f.firm_id
       left join public.organizations o on o.id = f.organization_id
       left join auth.users u on u.id = f.actor_id
      where (p_kinds is null or 'fiduciary' = any(p_kinds)) and f.created_at < v_before
      order by f.created_at desc limit v_limit)
    union all
    (select p.created_at, 'partner', p.action,
            coalesce(nullif(trim(concat_ws(' ', pp.first_name, pp.last_name)), ''), pp.company_name, 'Partenaire'),
            p.reason, null, pp.company_name, u.email::text
       from public.partner_audit_log p
       left join public.partner_profiles pp on pp.id = p.entity_id
       left join auth.users u on u.id = p.actor_id
      where (p_kinds is null or 'partner' = any(p_kinds)) and p.created_at < v_before
      order by p.created_at desc limit v_limit)
    union all
    (select l.created_at, 'sync_error', l.action, 'Erreur de synchronisation Bexio',
            nullif(concat_ws(' · ', l.entity_type, left(l.error_message, 200)), ''),
            o.id, o.name, null
       from public.integration_sync_logs l
       left join public.organizations o on o.id = l.organization_id
      where (p_kinds is null or 'sync_error' = any(p_kinds)) and l.status = 'error' and l.created_at < v_before
      order by l.created_at desc limit v_limit)
    union all
    (select b.created_at, 'lead', 'lead', 'E-mail capté sur le blog',
            concat_ws(' · ', b.email, b.source_slug), null, null, null
       from public.blog_leads b
      where (p_kinds is null or 'lead' = any(p_kinds)) and b.created_at < v_before
      order by b.created_at desc limit v_limit)
    union all
    (select a.created_at, 'admin', a.action,
            case a.action
              when 'module_enabled' then 'Module activé'
              when 'module_disabled' then 'Module désactivé'
              when 'module_registered' then 'Module enregistré'
              else a.action end,
            mo.name, o.id, o.name, u.email::text
       from public.admin_audit_logs a
       left join auth.users u on u.id = a.admin_user_id
       left join public.organizations o on o.id = a.organization_id
       left join public.modules mo on mo.id = a.module_id
      where (p_kinds is null or 'admin' = any(p_kinds)) and a.created_at < v_before
      order by a.created_at desc limit v_limit)
  ) feed
  order by 1 desc
  limit v_limit;
end;
$$;
revoke all on function public.admin_activity_feed(int, timestamptz, text[]) from public;
revoke execute on function public.admin_activity_feed(int, timestamptz, text[]) from anon;
grant execute on function public.admin_activity_feed(int, timestamptz, text[]) to authenticated;

notify pgrst, 'reload schema';
