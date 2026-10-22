-- Super Admin › Fiduciaires: what each firm actually uses on
-- accounting.cantia.ch and when its people were last there.
--
-- Two sources:
--  * fiduciary_usage_days — one row per firm, person, screen and day,
--    written by fiduciary_track() as people move around the workspace
--    (screens that leave no data behind: portfolio, indicators, exports…);
--  * the rows each feature already writes (a fiduciary_time_entries row IS
--    "used time tracking"), counted by acc_admin_firm_features().
-- Read only through the accounting.admin functions below.

alter table public.fiduciary_members add column if not exists last_seen_at timestamptz;

create table if not exists public.fiduciary_usage_days (
  firm_id uuid not null references public.fiduciary_firms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  area text not null check (area ~ '^[a-z0-9_.:-]{1,60}$'),
  day date not null,
  views integer not null default 1,
  first_at timestamptz not null default now(),
  last_at timestamptz not null default now(),
  primary key (firm_id, user_id, area, day)
);
alter table public.fiduciary_usage_days enable row level security;
-- No policy: written by fiduciary_track(), read by acc_admin_* only.
create index if not exists fiduciary_usage_days_firm_last on public.fiduciary_usage_days (firm_id, last_at desc);

-- Called by accounting.cantia.ch: with an area when a screen opens or an
-- export runs, with null as a presence heartbeat (last_seen_at only).
create or replace function public.fiduciary_track(p_area text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day date := (now() at time zone 'Europe/Zurich')::date;
begin
  if auth.uid() is null then
    return;
  end if;
  update public.fiduciary_members set last_seen_at = now() where user_id = auth.uid();
  if p_area is null or p_area !~ '^[a-z0-9_.:-]{1,60}$' then
    return;
  end if;
  -- Bounded per person and day, whatever a client sends.
  if (select count(*) from public.fiduciary_usage_days u where u.user_id = auth.uid() and u.day = v_day) >= 150
     and not exists (select 1 from public.fiduciary_usage_days u where u.user_id = auth.uid() and u.day = v_day and u.area = p_area) then
    return;
  end if;
  insert into public.fiduciary_usage_days (firm_id, user_id, area, day)
  select m.firm_id, auth.uid(), p_area, v_day
    from public.fiduciary_members m
   where m.user_id = auth.uid()
  on conflict (firm_id, user_id, area, day)
  do update set views = least(public.fiduciary_usage_days.views + 1, 100000), last_at = now();
end;
$$;
revoke execute on function public.fiduciary_track(text) from public, anon;
grant execute on function public.fiduciary_track(text) to authenticated;

-- Every feature a firm can use, counted from the rows it writes.
create or replace function public.acc_admin_firm_features(p_firm uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object('key', x.key, 'count', x.n, 'last_at', x.last_at, 'extra', x.extra) order by x.ord), '[]'::jsonb)
  from (
    select 1 ord, 'clients_cantia' key, count(*) n, max(coalesce(a.approved_at, a.requested_at, a.created_at)) last_at, null::text extra
      from public.fiduciary_client_access a where a.firm_id = p_firm and a.status = 'ACTIVE'
    union all
    select 2, 'clients_external', count(*), max(c.created_at), null from public.fiduciary_external_clients c where c.firm_id = p_firm
    union all
    select 3, 'invitations', count(*), max(i.created_at), (count(*) filter (where i.status = 'ACCEPTED'))::text || ' acceptées'
      from public.fiduciary_invitations i where i.firm_id = p_firm
    union all
    select 4, 'requests', (select count(*) from public.fiduciary_requests r where r.firm_id = p_firm) + (select count(*) from public.fiduciary_external_requests r where r.firm_id = p_firm),
           greatest((select max(r.created_at) from public.fiduciary_requests r where r.firm_id = p_firm), (select max(r.created_at) from public.fiduciary_external_requests r where r.firm_id = p_firm)), null
    union all
    select 5, 'files_received',
           (select count(*) from public.fiduciary_request_files f join public.fiduciary_requests r on r.id = f.request_id where r.firm_id = p_firm)
           + (select count(*) from public.fiduciary_external_request_files f join public.fiduciary_external_requests r on r.id = f.request_id where r.firm_id = p_firm),
           greatest((select max(f.created_at) from public.fiduciary_request_files f join public.fiduciary_requests r on r.id = f.request_id where r.firm_id = p_firm),
                    (select max(f.created_at) from public.fiduciary_external_request_files f join public.fiduciary_external_requests r on r.id = f.request_id where r.firm_id = p_firm)), null
    union all
    select 6, 'shared_documents', count(*), max(d.created_at), (count(*) filter (where d.seen_at is not null))::text || ' ouverts'
      from public.fiduciary_shared_documents d where d.firm_id = p_firm
    union all
    select 7, 'approvals', count(*), max(a.created_at), (count(*) filter (where a.signature_data is not null))::text || ' signés'
      from public.fiduciary_approvals a where a.firm_id = p_firm
    union all
    select 8, 'proposals', count(*), max(p.created_at), (count(*) filter (where p.status = 'accepted'))::text || ' acceptées'
      from public.fiduciary_entry_proposals p where p.firm_id = p_firm
    union all
    select 9, 'time', count(*), max(t.created_at), (coalesce(sum(t.minutes), 0) / 60)::text || ' h ' || lpad((coalesce(sum(t.minutes), 0) % 60)::text, 2, '0')
      from public.fiduciary_time_entries t where t.firm_id = p_firm
    union all
    select 10, 'work', count(*), max(greatest(w.created_at, w.updated_at)), (count(*) filter (where w.completed_at is not null))::text || ' terminés'
      from public.fiduciary_work_items w where w.firm_id = p_firm
    union all
    select 11, 'templates', count(*), max(greatest(t.created_at, t.updated_at)), null
      from public.fiduciary_process_templates t where t.firm_id = p_firm and t.archived_at is null
    union all
    select 12, 'deadlines', (select count(*) from public.fiduciary_deadline_status d where d.firm_id = p_firm) + (select count(*) from public.fiduciary_external_deadline_status d where d.firm_id = p_firm),
           greatest((select max(d.updated_at) from public.fiduciary_deadline_status d where d.firm_id = p_firm), (select max(d.updated_at) from public.fiduciary_external_deadline_status d where d.firm_id = p_firm)), null
    union all
    select 13, 'notes', (select count(*) from public.fiduciary_client_notes n where n.firm_id = p_firm) + (select count(*) from public.fiduciary_external_notes n where n.firm_id = p_firm),
           greatest((select max(n.created_at) from public.fiduciary_client_notes n where n.firm_id = p_firm), (select max(n.created_at) from public.fiduciary_external_notes n where n.firm_id = p_firm)), null
    union all
    select 14, 'ledger_entries', count(*), max(e.created_at), (count(*) filter (where e.source = 'import'))::text || ' importées'
      from public.fiduciary_ext_entries e where e.firm_id = p_firm
    union all
    select 15, 'ledger_accounts', count(*), max(a.created_at), null from public.fiduciary_ext_accounts a where a.firm_id = p_firm
    union all
    select 16, 'vat_returns', count(*), max(v.filed_at), null from public.fiduciary_ext_vat_returns v where v.firm_id = p_firm and v.status <> 'cancelled'
    union all
    select 17, 'closings', count(*), max(c.closed_at), null from public.fiduciary_ext_closings c where c.firm_id = p_firm
    union all
    select 18, 'team', count(*), max(m.created_at), null from public.fiduciary_members m where m.firm_id = p_firm
    union all
    select 19, 'branding', case when f.logo_data is not null or f.brand_color is not null then 1 else 0 end, null, null from public.fiduciary_firms f where f.id = p_firm
    union all
    select 20, 'directory', case when f.public_directory_visible then 1 else 0 end, null, null from public.fiduciary_firms f where f.id = p_firm
  ) x;
$$;
revoke execute on function public.acc_admin_firm_features(uuid) from public, anon, authenticated;

-- One row per firm for the list: last presence, last action, how active.
create or replace function public.acc_admin_firms_activity()
returns table(firm_id uuid, last_seen_at timestamptz, last_sign_in_at timestamptz, last_action_at timestamptz, active_days_30 integer, views_30 integer, features_used integer, features_total integer)
language plpgsql
stable
security definer
set search_path = public
as $$
#variable_conflict use_column
begin
  perform public.acc_admin_assert();
  return query
  select f.id,
         (select max(m.last_seen_at) from public.fiduciary_members m where m.firm_id = f.id),
         (select max(u.last_sign_in_at) from public.fiduciary_members m join auth.users u on u.id = m.user_id where m.firm_id = f.id),
         greatest((select max(a.created_at) from public.fiduciary_audit_log a where a.firm_id = f.id),
                  (select max(d.last_at) from public.fiduciary_usage_days d where d.firm_id = f.id)),
         (select count(distinct d.day)::int from public.fiduciary_usage_days d where d.firm_id = f.id and d.day > current_date - 30),
         (select coalesce(sum(d.views), 0)::int from public.fiduciary_usage_days d where d.firm_id = f.id and d.day > current_date - 30),
         (select count(*)::int from jsonb_array_elements(public.acc_admin_firm_features(f.id)) e where (e ->> 'count')::int > 0),
         (select jsonb_array_length(public.acc_admin_firm_features(f.id)))
    from public.fiduciary_firms f;
end;
$$;
revoke execute on function public.acc_admin_firms_activity() from public, anon;
grant execute on function public.acc_admin_firms_activity() to authenticated;

-- The detail: features, people, screens, day-by-day activity, recent events.
create or replace function public.acc_admin_firm_usage(p_firm uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.acc_admin_assert();
  return jsonb_build_object(
    'features', public.acc_admin_firm_features(p_firm),
    'members', coalesce((
      select jsonb_agg(jsonb_build_object(
        'user_id', m.user_id,
        'name', nullif(trim(concat_ws(' ', m.first_name, m.last_name)), ''),
        'email', coalesce(m.email, u.email::text),
        'role', m.role,
        'joined_at', m.created_at,
        'last_seen_at', m.last_seen_at,
        'last_sign_in_at', u.last_sign_in_at,
        'active_days_30', (select count(distinct d.day) from public.fiduciary_usage_days d where d.firm_id = p_firm and d.user_id = m.user_id and d.day > current_date - 30),
        'top_areas', coalesce((
          select jsonb_agg(t.area order by t.v desc)
            from (select d.area, sum(d.views) v from public.fiduciary_usage_days d
                   where d.firm_id = p_firm and d.user_id = m.user_id and d.day > current_date - 30
                   group by d.area order by sum(d.views) desc limit 5) t), '[]'::jsonb)
      ) order by m.last_seen_at desc nulls last, m.created_at)
        from public.fiduciary_members m
        join auth.users u on u.id = m.user_id
       where m.firm_id = p_firm), '[]'::jsonb),
    'areas', coalesce((
      select jsonb_agg(jsonb_build_object('area', t.area, 'views', t.views, 'users', t.users, 'days', t.days, 'last_at', t.last_at) order by t.views desc)
        from (select d.area, sum(d.views)::int views, count(distinct d.user_id)::int users, count(distinct d.day)::int days, max(d.last_at) last_at
                from public.fiduciary_usage_days d
               where d.firm_id = p_firm and d.day > current_date - 90
               group by d.area) t), '[]'::jsonb),
    'daily', coalesce((
      select jsonb_agg(jsonb_build_object('day', g.day::date, 'views', coalesce(t.views, 0), 'users', coalesce(t.users, 0)) order by g.day)
        from generate_series(current_date - 29, current_date, interval '1 day') g(day)
        left join (select d.day, sum(d.views)::int views, count(distinct d.user_id)::int users
                     from public.fiduciary_usage_days d where d.firm_id = p_firm and d.day > current_date - 30
                    group by d.day) t on t.day = g.day::date), '[]'::jsonb),
    'recent', coalesce((
      select jsonb_agg(r.j order by r.at desc)
        from (
          select a.created_at at, jsonb_build_object('at', a.created_at, 'kind', 'action', 'key', a.action,
                   'actor', (select coalesce(nullif(trim(concat_ws(' ', m.first_name, m.last_name)), ''), m.email) from public.fiduciary_members m where m.firm_id = p_firm and m.user_id = a.actor_id),
                   'client', (select o.name from public.organizations o where o.id = a.organization_id)) j
            from public.fiduciary_audit_log a where a.firm_id = p_firm
          union all
          select d.last_at, jsonb_build_object('at', d.last_at, 'kind', 'screen', 'key', d.area, 'views', d.views,
                   'actor', (select coalesce(nullif(trim(concat_ws(' ', m.first_name, m.last_name)), ''), m.email) from public.fiduciary_members m where m.firm_id = p_firm and m.user_id = d.user_id))
            from public.fiduciary_usage_days d where d.firm_id = p_firm
          order by 1 desc
          limit 50
        ) r), '[]'::jsonb)
  );
end;
$$;
revoke execute on function public.acc_admin_firm_usage(uuid) from public, anon;
grant execute on function public.acc_admin_firm_usage(uuid) to authenticated;
