-- Suivi commercial des devis (plan Entreprise).
--
-- Every devis email and every client-portal visit is recorded in
-- devis_events, for every plan: that way an Équipe org sees its real
-- numbers on the locked Commercial screen (sales_tracking_teaser), and
-- upgrading shows history instead of an empty page. Reading the events
-- themselves requires both the finance permission and a plan with
-- has_sales_tracking.
--
-- Sources:
-- - send-devis-email and the follow-up sender write 'sent' / 'followup_sent'
--   with the Resend email id;
-- - the resend-webhook function writes delivered / bounced / complained /
--   opened / clicked, matched to the devis through that email id;
-- - get_public_devis writes 'portal_viewed' (one per visit, 10-minute
--   window) and public-document-pdf writes 'pdf_downloaded'.

alter table public.plans add column if not exists has_sales_tracking boolean not null default false;
update public.plans set has_sales_tracking = true where id = 'pro';

create table public.devis_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  devis_id uuid not null references public.devis(id) on delete cascade,
  kind text not null check (kind in (
    'sent', 'followup_sent', 'delivered', 'bounced', 'complained',
    'opened', 'clicked', 'portal_viewed', 'pdf_downloaded', 'reply_received'
  )),
  occurred_at timestamptz not null default now(),
  resend_email_id text,
  -- svix-id of the Resend webhook delivery, so a retried delivery is not
  -- recorded twice.
  webhook_id text unique,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index on public.devis_events (devis_id, occurred_at desc);
create index on public.devis_events (organization_id, occurred_at desc);
create index on public.devis_events (resend_email_id) where resend_email_id is not null;

create or replace function public.org_has_sales_tracking(org_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((
    select p.has_sales_tracking
    from public.organizations o
    join public.plans p on p.id = o.plan_id
    where o.id = org_id
  ), false);
$$;

alter table public.devis_events enable row level security;

-- No insert/update/delete policy: events are written only by security
-- definer functions and edge functions using the service role.
create policy "finance members with sales tracking can view devis events" on public.devis_events
  for select using (public.can_view_org_finances(organization_id) and public.org_has_sales_tracking(organization_id));

-- One 'portal_viewed' per visit (reloads within 10 minutes don't count),
-- plus a notification to finance members when the org has sales tracking.
create or replace function public.log_devis_portal_view(p_devis_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_devis record;
  v_count integer;
begin
  select id, organization_id, number, client_name into v_devis from public.devis where id = p_devis_id;
  if not found then
    return;
  end if;
  if exists (
    select 1 from public.devis_events
    where devis_id = p_devis_id and kind = 'portal_viewed' and occurred_at > now() - interval '10 minutes'
  ) then
    return;
  end if;

  insert into public.devis_events (organization_id, devis_id, kind) values (v_devis.organization_id, p_devis_id, 'portal_viewed');

  if not public.org_has_sales_tracking(v_devis.organization_id) then
    return;
  end if;

  select count(*) into v_count from public.devis_events where devis_id = p_devis_id and kind = 'portal_viewed';

  insert into public.notifications (organization_id, user_id, type, title, body, link, source_table, source_id)
  select v_devis.organization_id, fm.user_id, 'devis_viewed',
         'Devis consulté — ' || coalesce(v_devis.number, ''),
         coalesce(nullif(v_devis.client_name, ''), 'Le client') || ' a consulté le devis'
           || case when v_count > 1 then ' (' || v_count || 'e fois).' else '.' end,
         '/(app)/devis/' || v_devis.id,
         'devis', v_devis.id
  from public.finance_member_user_ids(v_devis.organization_id) as fm(user_id);
end;
$$;

revoke execute on function public.log_devis_portal_view(uuid) from public, anon, authenticated;

-- Same function as before, plus the visit log once the client is verified.
create or replace function public.get_public_devis(p_token uuid, p_email text, p_session text default null)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_devis public.devis%rowtype;
  v_org record;
  v_items jsonb;
  v_subtotal numeric;
begin
  select * into v_devis from public.devis where public_token = p_token;
  if not found then
    raise exception 'Lien invalide';
  end if;
  if v_devis.client_email is null or lower(trim(v_devis.client_email)) <> lower(trim(p_email)) then
    raise exception 'Vérification impossible';
  end if;
  if not public.has_valid_document_session(p_email, p_session) then
    raise exception 'Vérification requise';
  end if;

  perform public.log_devis_portal_view(v_devis.id);

  select name, phone, street, postal_code, locality, address, ide_number, locale
  into v_org
  from public.organizations where id = v_devis.organization_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id, 'description', description, 'quantity', quantity,
    'unit', unit, 'unit_price', unit_price, 'sort_order', sort_order
  ) order by sort_order), '[]'::jsonb), coalesce(sum(quantity * unit_price), 0)
  into v_items, v_subtotal
  from public.devis_items where devis_id = v_devis.id;

  return jsonb_build_object(
    'devis', jsonb_build_object(
      'id', v_devis.id, 'number', v_devis.number, 'status', v_devis.status,
      'client_name', v_devis.client_name, 'client_address', v_devis.client_address,
      'notes', v_devis.notes, 'vat_rate', v_devis.vat_rate, 'created_at', v_devis.created_at,
      'client_signed_at', v_devis.client_signed_at, 'client_signer_name', v_devis.client_signer_name,
      'has_pdf', v_devis.pdf_path is not null, 'locale', v_devis.locale
    ),
    'items', v_items,
    'totals', jsonb_build_object(
      'subtotal', v_subtotal,
      'vat', round(v_subtotal * v_devis.vat_rate / 100, 2),
      'total', round(v_subtotal * (1 + v_devis.vat_rate / 100), 2)
    ),
    'organization', to_jsonb(v_org)
  );
end;
$$;

-- What the locked Commercial screen shows to finance members of orgs without
-- sales tracking: counts only, never the events themselves.
create or replace function public.sales_tracking_teaser(org_id uuid)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_viewed integer;
  v_sent integer;
begin
  if not public.can_view_org_finances(org_id) then
    raise exception 'Accès refusé';
  end if;
  select count(*) into v_sent from public.devis d where d.organization_id = org_id and d.status = 'sent';
  select count(distinct d.id) into v_viewed
  from public.devis d
  join public.devis_events e on e.devis_id = d.id and e.kind = 'portal_viewed'
  where d.organization_id = org_id and d.status = 'sent';
  return jsonb_build_object('sent_waiting', v_sent, 'viewed_without_answer', v_viewed);
end;
$$;

revoke execute on function public.sales_tracking_teaser(uuid) from public, anon;
grant execute on function public.sales_tracking_teaser(uuid) to authenticated;
