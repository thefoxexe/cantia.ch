-- E-mails hub (app › E-mails): one row per e-mail sent from Cantia to a
-- client (devis, devis follow-up, facture, payment reminder, extra works),
-- with its whole life: delivered, opened, clicked, viewed on the portal,
-- replied, bounced. The status shown is the furthest step reached.
--
-- Who writes what:
-- - devis e-mails: the 'sent' / 'followup_sent' rows of devis_events
--   (written by send-devis-email / send-devis-followups) create the row;
-- - factures, reminders, extra works: the sending edge functions insert it;
-- - resend-webhook: delivered / opened / clicked / bounced / complained
--   through email_message_event();
-- - portal views (devis and factures) and client replies (sales_emails):
--   triggers below.

create table public.email_messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  kind text not null check (kind in ('devis', 'devis_followup', 'facture', 'facture_reminder', 'extra_work')),
  document_type text not null check (document_type in ('devis', 'facture', 'extra_work')),
  document_id uuid not null,
  document_number text,
  to_email text not null,
  to_name text,
  subject text,
  resend_email_id text unique,
  sent_by uuid references auth.users(id) on delete set null,
  sent_at timestamptz not null default now(),
  delivered_at timestamptz,
  opened_at timestamptz,
  open_count integer not null default 0,
  clicked_at timestamptz,
  click_count integer not null default 0,
  viewed_at timestamptz,
  view_count integer not null default 0,
  replied_at timestamptz,
  reply_count integer not null default 0,
  bounced_at timestamptz,
  bounce_reason text,
  complained_at timestamptz,
  last_event_at timestamptz not null default now()
);
create index email_messages_org_sent_idx on public.email_messages (organization_id, sent_at desc);
create index email_messages_document_idx on public.email_messages (document_type, document_id, sent_at desc);
create index email_messages_to_idx on public.email_messages (organization_id, lower(to_email), sent_at desc);
alter table public.email_messages enable row level security;
create policy "finance members see e-mails" on public.email_messages
  for select using (public.can_view_org_finances(organization_id));

-- ---------------------------------------------------------------------------
-- Delivery events from Resend (resend-webhook, service role).

create or replace function public.email_message_event(p_resend_id text, p_kind text, p_at timestamptz, p_reason text default null)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_msg public.email_messages%rowtype;
begin
  select * into v_msg from public.email_messages where resend_email_id = p_resend_id for update;
  if not found then
    return jsonb_build_object('found', false);
  end if;
  -- Corporate mail scanners open every link within seconds of delivery.
  if p_kind = 'clicked' and p_at < v_msg.sent_at + interval '60 seconds' then
    return jsonb_build_object('found', true, 'document_type', v_msg.document_type, 'ignored', 'bot click');
  end if;
  update public.email_messages set
    delivered_at = case when p_kind = 'delivered' then coalesce(delivered_at, p_at) else delivered_at end,
    opened_at = case when p_kind = 'opened' then coalesce(opened_at, p_at) else opened_at end,
    open_count = open_count + (p_kind = 'opened')::int,
    clicked_at = case when p_kind = 'clicked' then coalesce(clicked_at, p_at) else clicked_at end,
    click_count = click_count + (p_kind = 'clicked')::int,
    bounced_at = case when p_kind = 'bounced' then coalesce(bounced_at, p_at) else bounced_at end,
    bounce_reason = case when p_kind = 'bounced' then coalesce(p_reason, bounce_reason) else bounce_reason end,
    complained_at = case when p_kind = 'complained' then coalesce(complained_at, p_at) else complained_at end,
    last_event_at = greatest(last_event_at, p_at)
  where id = v_msg.id;

  -- A bounced facture / reminder / extra works: the team must know now
  -- (devis bounces are already notified by the webhook).
  if p_kind = 'bounced' and v_msg.document_type <> 'devis' then
    begin
      insert into public.notifications (organization_id, user_id, type, title, body, link, source_table, source_id)
      select v_msg.organization_id, fm.user_id, 'email_bounced',
             'E-mail non délivré — ' || coalesce(v_msg.document_number, ''),
             'L''adresse ' || v_msg.to_email || ' a refusé l''e-mail. Vérifiez-la et renvoyez le document.',
             '/(app)/emails?id=' || v_msg.id, 'email_messages', v_msg.id
      from public.finance_member_user_ids(v_msg.organization_id) as fm(user_id);
    exception when others then
      null;
    end;
  end if;
  return jsonb_build_object('found', true, 'document_type', v_msg.document_type);
end;
$$;
revoke execute on function public.email_message_event(text, text, timestamptz, text) from public, anon, authenticated;
grant execute on function public.email_message_event(text, text, timestamptz, text) to service_role;

-- ---------------------------------------------------------------------------
-- Devis e-mails: created from devis_events; portal views on the devis.

create or replace function public.email_messages_from_devis_event()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_devis record;
  v_org_name text;
begin
  if new.kind in ('sent', 'followup_sent') and new.resend_email_id is not null then
    select d.number, d.client_name, d.client_email, o.name as org_name into v_devis
    from public.devis d join public.organizations o on o.id = d.organization_id where d.id = new.devis_id;
    insert into public.email_messages (organization_id, kind, document_type, document_id, document_number, to_email, to_name, subject, resend_email_id, sent_at, last_event_at)
    values (
      new.organization_id,
      case when new.kind = 'sent' then 'devis' else 'devis_followup' end,
      'devis', new.devis_id, v_devis.number,
      coalesce(new.meta ->> 'to', v_devis.client_email, ''), v_devis.client_name,
      case when new.kind = 'sent' then 'Devis ' else 'Relance — Devis ' end || coalesce(v_devis.number, '') || ' — ' || coalesce(v_devis.org_name, ''),
      new.resend_email_id, new.occurred_at, new.occurred_at
    )
    on conflict (resend_email_id) do nothing;
  elsif new.kind = 'portal_viewed' then
    update public.email_messages set
      viewed_at = coalesce(viewed_at, new.occurred_at),
      view_count = view_count + 1,
      last_event_at = greatest(last_event_at, new.occurred_at)
    where id = (
      select id from public.email_messages
      where document_type = 'devis' and document_id = new.devis_id
      order by sent_at desc limit 1
    );
  end if;
  return new;
exception when others then
  return new;
end;
$$;
revoke execute on function public.email_messages_from_devis_event() from public, anon, authenticated;
drop trigger if exists email_messages_from_devis_event on public.devis_events;
create trigger email_messages_from_devis_event
  after insert on public.devis_events
  for each row execute function public.email_messages_from_devis_event();

-- ---------------------------------------------------------------------------
-- Facture portal views (same 10-minute throttle as devis).

create or replace function public.log_facture_portal_view(p_facture_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.email_messages set
    viewed_at = coalesce(viewed_at, now()),
    view_count = view_count + 1,
    last_event_at = now()
  where id = (
    select id from public.email_messages
    where document_type = 'facture' and document_id = p_facture_id
    order by sent_at desc limit 1
  )
  and (last_event_at < now() - interval '10 minutes' or viewed_at is null);
exception when others then
  null;
end;
$$;
revoke execute on function public.log_facture_portal_view(uuid) from public, anon, authenticated;

-- get_public_facture: log the view once the client is verified. The live
-- definition is patched in place (one line added after the session check).
do $$
declare
  v_def text := pg_get_functiondef('public.get_public_facture(uuid,text,text)'::regprocedure);
begin
  if position('log_facture_portal_view' in v_def) = 0 then
    v_def := replace(
      v_def,
      E'    raise exception ''Vérification requise'';\n  end if;\n',
      E'    raise exception ''Vérification requise'';\n  end if;\n\n  perform public.log_facture_portal_view(v_facture.id);\n'
    );
    if position('log_facture_portal_view' in v_def) = 0 then
      raise exception 'get_public_facture: insertion point not found';
    end if;
    execute v_def;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Client replies (sales_emails, written by resend-webhook/inbound.ts).

create or replace function public.email_messages_from_reply()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_target uuid;
begin
  if new.direction <> 'incoming' then
    return new;
  end if;
  select id into v_target from public.email_messages m
  where m.organization_id = new.organization_id
    and m.sent_at > now() - interval '120 days'
    and (
      (new.devis_id is not null and m.document_type = 'devis' and m.document_id = new.devis_id)
      or (new.facture_id is not null and m.document_type = 'facture' and m.document_id = new.facture_id)
      or (new.devis_id is null and new.facture_id is null and new.counterpart_email is not null and lower(m.to_email) = lower(new.counterpart_email))
    )
  order by m.sent_at desc limit 1;
  if v_target is not null then
    update public.email_messages set
      replied_at = coalesce(replied_at, new.occurred_at),
      reply_count = reply_count + 1,
      last_event_at = greatest(last_event_at, new.occurred_at)
    where id = v_target;
  end if;
  return new;
exception when others then
  return new;
end;
$$;
revoke execute on function public.email_messages_from_reply() from public, anon, authenticated;
drop trigger if exists email_messages_from_reply on public.sales_emails;
create trigger email_messages_from_reply
  after insert on public.sales_emails
  for each row execute function public.email_messages_from_reply();

-- ---------------------------------------------------------------------------
-- Backfill: devis e-mails already sent and their events.

insert into public.email_messages (organization_id, kind, document_type, document_id, document_number, to_email, to_name, subject, resend_email_id, sent_at, last_event_at)
select e.organization_id,
       case when e.kind = 'sent' then 'devis' else 'devis_followup' end,
       'devis', e.devis_id, d.number,
       coalesce(e.meta ->> 'to', d.client_email, ''), d.client_name,
       case when e.kind = 'sent' then 'Devis ' else 'Relance — Devis ' end || coalesce(d.number, '') || ' — ' || coalesce(o.name, ''),
       e.resend_email_id, e.occurred_at, e.occurred_at
from public.devis_events e
join public.devis d on d.id = e.devis_id
join public.organizations o on o.id = e.organization_id
where e.kind in ('sent', 'followup_sent') and e.resend_email_id is not null
on conflict (resend_email_id) do nothing;

update public.email_messages m set
  delivered_at = x.delivered_at,
  opened_at = x.opened_at,
  open_count = x.open_count,
  clicked_at = x.clicked_at,
  click_count = x.click_count,
  bounced_at = x.bounced_at,
  complained_at = x.complained_at,
  last_event_at = greatest(m.last_event_at, coalesce(x.last_at, m.last_event_at))
from (
  select resend_email_id,
         min(occurred_at) filter (where kind = 'delivered') as delivered_at,
         min(occurred_at) filter (where kind = 'opened') as opened_at,
         count(*) filter (where kind = 'opened')::int as open_count,
         min(occurred_at) filter (where kind = 'clicked') as clicked_at,
         count(*) filter (where kind = 'clicked')::int as click_count,
         min(occurred_at) filter (where kind = 'bounced') as bounced_at,
         min(occurred_at) filter (where kind = 'complained') as complained_at,
         max(occurred_at) as last_at
  from public.devis_events
  where resend_email_id is not null and kind in ('delivered', 'opened', 'clicked', 'bounced', 'complained')
  group by resend_email_id
) x
where x.resend_email_id = m.resend_email_id;

update public.email_messages m set
  viewed_at = v.first_view,
  view_count = v.views
from (
  select devis_id, min(occurred_at) as first_view, count(*)::int as views
  from public.devis_events where kind = 'portal_viewed' group by devis_id
) v
where m.document_type = 'devis' and m.document_id = v.devis_id and m.kind = 'devis';

notify pgrst, 'reload schema';
