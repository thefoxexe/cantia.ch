-- Scheduled sends can also carry addresses without a Cantia account
-- (prospects, fiduciaries to invite), typed in the composer: frozen with the
-- schedule like user_ids, sent by dispatch-scheduled-newsletter-send.
-- Each entry: { email, name?, company?, locale? }.
alter table public.scheduled_newsletter_sends
  add column if not exists external_recipients jsonb not null default '[]'::jsonb;

create or replace function public.admin_schedule_newsletter_send_v3(
  p_subject text,
  p_html text,
  p_user_ids uuid[],
  p_from_persona text,
  p_include_unsubscribed boolean,
  p_scheduled_at timestamptz,
  p_variants jsonb default null,
  p_audience_label text default null,
  p_external_recipients jsonb default '[]'::jsonb
)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_id uuid;
  v_external jsonb := coalesce(p_external_recipients, '[]'::jsonb);
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;
  if p_scheduled_at <= now() then
    raise exception 'scheduled_at must be in the future';
  end if;
  if jsonb_typeof(v_external) <> 'array' then
    raise exception 'external recipients must be a list';
  end if;
  if jsonb_array_length(v_external) > 200 then
    raise exception 'at most 200 external addresses per send';
  end if;
  if coalesce(cardinality(p_user_ids), 0) = 0 and jsonb_array_length(v_external) = 0 then
    raise exception 'no recipient';
  end if;

  insert into public.scheduled_newsletter_sends
    (subject, html, from_persona, user_ids, include_unsubscribed, scheduled_at, created_by, variants, audience_label, external_recipients)
  values
    (p_subject, p_html, case when p_from_persona = 'info' then 'info' else 'newsletter' end, coalesce(p_user_ids, '{}'::uuid[]),
     p_include_unsubscribed, p_scheduled_at, auth.uid(), p_variants, p_audience_label, v_external)
  returning id into v_id;

  return v_id;
end;
$$;
revoke all on function public.admin_schedule_newsletter_send_v3(text, text, uuid[], text, boolean, timestamptz, jsonb, text, jsonb) from public;
revoke execute on function public.admin_schedule_newsletter_send_v3(text, text, uuid[], text, boolean, timestamptz, jsonb, text, jsonb) from anon;
grant execute on function public.admin_schedule_newsletter_send_v3(text, text, uuid[], text, boolean, timestamptz, jsonb, text, jsonb) to authenticated;

notify pgrst, 'reload schema';
