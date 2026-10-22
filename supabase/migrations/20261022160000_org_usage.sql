-- Super Admin › Entreprises: what each company uses in the app and when its
-- people were last there — the same view as Fiduciaires (fiduciary_usage).
--
--  * org_usage_days — one row per company, person, screen and day, written
--    by org_track() as people move around the app;
--  * the rows each feature already writes (a devis row IS "used devis"),
--    counted from ORG_FEATURES below;
--  * presence stays organization_members.last_seen_at (touch_presence).

create table if not exists public.org_usage_days (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  area text not null check (area ~ '^[a-z0-9_.:-]{1,80}$'),
  day date not null,
  views integer not null default 1,
  first_at timestamptz not null default now(),
  last_at timestamptz not null default now(),
  primary key (organization_id, user_id, area, day)
);
alter table public.org_usage_days enable row level security;
-- No policy: written by org_track(), read by admin_* only.
create index if not exists org_usage_days_org_last on public.org_usage_days (organization_id, last_at desc);

create or replace function public.org_track(p_org uuid, p_area text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day date := (now() at time zone 'Europe/Zurich')::date;
begin
  if auth.uid() is null or p_org is null or p_area is null or p_area !~ '^[a-z0-9_.:-]{1,80}$' then
    return;
  end if;
  if not exists (select 1 from public.organization_members m where m.organization_id = p_org and m.user_id = auth.uid()) then
    return;
  end if;
  -- Bounded per person and day, whatever a client sends.
  if (select count(*) from public.org_usage_days u where u.user_id = auth.uid() and u.day = v_day) >= 200
     and not exists (select 1 from public.org_usage_days u where u.user_id = auth.uid() and u.day = v_day and u.organization_id = p_org and u.area = p_area) then
    return;
  end if;
  insert into public.org_usage_days (organization_id, user_id, area, day)
  values (p_org, auth.uid(), p_area, v_day)
  on conflict (organization_id, user_id, area, day)
  do update set views = least(public.org_usage_days.views + 1, 100000), last_at = now();
end;
$$;
revoke execute on function public.org_track(uuid, text) from public, anon;
grant execute on function public.org_track(uuid, text) to authenticated;

-- The features counted per company: key, label, table (organization_id +
-- created_at). One list for the detail, the list and the action feed.
create or replace function public.admin_org_feature_tables()
returns table(ord int, key text, label text, tbl text)
language sql
immutable
as $$
  select * from (values
    (1, 'devis', 'Devis', 'devis'),
    (2, 'factures', 'Factures', 'factures'),
    (3, 'chantiers', 'Chantiers / projets', 'projects'),
    (4, 'clients', 'Contacts', 'clients'),
    (5, 'catalogue', 'Articles de catalogue', 'catalog_items'),
    (6, 'devis_trames', 'Modèles de devis', 'devis_trames'),
    (7, 'devis_events', 'Suivi des devis (envois, ouvertures)', 'devis_events'),
    (8, 'sales_emails', 'E-mails commerciaux', 'sales_emails'),
    (9, 'rapports', 'Rapports de chantier', 'reports'),
    (10, 'travaux_sup', 'Travaux supplémentaires', 'extra_works'),
    (11, 'situations', 'Situations de chantier', 'chantier_situations'),
    (12, 'planning', 'Planning (assignations)', 'planning_assignments'),
    (13, 'planning_chantier', 'Planning de chantier (Gantt)', 'site_schedules'),
    (14, 'soumissions', 'Soumissions / métrés', 'tenders'),
    (15, 'imports_pdf', 'Imports de soumissions PDF', 'tender_import_jobs'),
    (16, 'plans', 'Plans de chantier', 'site_plans'),
    (17, 'fichiers', 'Fichiers', 'files'),
    (18, 'taches', 'Tâches', 'dashboard_tasks'),
    (19, 'sous_traitants', 'Sous-traitants', 'subcontractors'),
    (20, 'heures', 'Heures pointées', 'payroll_time_entries'),
    (21, 'absences', 'Absences', 'payroll_absences'),
    (22, 'salaires', 'Salaires calculés', 'payroll_runs'),
    (23, 'fiches_salaire', 'Fiches de salaire', 'payroll_slips'),
    (24, 'employes_rh', 'Employés sans compte', 'payroll_ghost_employees'),
    (25, 'depenses', 'Dépenses', 'expenses'),
    (26, 'compta', 'Écritures comptables', 'accounting_entries'),
    (27, 'tva', 'Décomptes TVA', 'vat_declarations'),
    (28, 'bouclement', 'Bouclements', 'fiscal_closings'),
    (29, 'banque', 'Comptes bancaires', 'bank_accounts'),
    (30, 'integrations', 'Intégrations (Bexio…)', 'integrations'),
    (31, 'agenda', 'Agenda Google / Outlook', 'calendar_connections'),
    (32, 'ia', 'Dictée vocale / IA', 'ai_usage_log'),
    (33, 'fiduciaire', 'Documents envoyés au fiduciaire', 'fiduciary_shared_documents'),
    (34, 'invitations', 'Invitations d’équipe', 'organization_invites'),
    (35, 'maquette', 'Cantia Panorama', 'relief_worlds')
  ) v(ord, key, label, tbl);
$$;

create or replace function public.admin_org_features(p_org uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  f record;
  v_count bigint;
  v_last timestamptz;
  v_30 bigint;
  v_out jsonb := '[]'::jsonb;
  o public.organizations;
begin
  select * into o from public.organizations where id = p_org;
  for f in select * from public.admin_org_feature_tables() order by ord loop
    if to_regclass('public.' || f.tbl) is null then
      continue;
    end if;
    execute format('select count(*), max(created_at), count(*) filter (where created_at > now() - interval ''30 days'') from public.%I where organization_id = $1', f.tbl)
      into v_count, v_last, v_30 using p_org;
    v_out := v_out || jsonb_build_object('key', f.key, 'label', f.label, 'count', v_count, 'last_at', v_last,
                                         'extra', case when v_30 > 0 then v_30 || ' en 30 jours' end);
  end loop;
  v_out := v_out
    || jsonb_build_object('key', 'logo', 'label', 'Logo personnalisé', 'count', case when o.logo_url is not null then 1 else 0 end, 'last_at', null, 'extra', null)
    || jsonb_build_object('key', 'couleur', 'label', 'Couleur de marque', 'count', case when o.brand_color is distinct from '#1F3D3A' then 1 else 0 end, 'last_at', null, 'extra', null);
  return v_out;
end;
$$;
revoke execute on function public.admin_org_features(uuid) from public, anon, authenticated;

-- One row per company for the list.
create or replace function public.admin_orgs_activity(p_ids uuid[])
returns table(organization_id uuid, last_seen_at timestamptz, last_sign_in_at timestamptz, last_action_at timestamptz, active_days_30 integer, views_30 integer, features_used integer, features_total integer)
language plpgsql
stable
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  f record;
  v_used jsonb := '{}'::jsonb;
  v_last jsonb := '{}'::jsonb;
  v_total int := 2;
  r record;
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;
  for f in select * from public.admin_org_feature_tables() loop
    if to_regclass('public.' || f.tbl) is null then
      continue;
    end if;
    v_total := v_total + 1;
    for r in execute format('select organization_id org_id, max(created_at) at from public.%I where organization_id = any($1) group by organization_id', f.tbl) using p_ids loop
      v_used := jsonb_set(v_used, array[r.org_id::text], to_jsonb(coalesce((v_used ->> r.org_id::text)::int, 0) + 1));
      if (v_last ->> r.org_id::text) is null or (v_last ->> r.org_id::text)::timestamptz < r.at then
        v_last := jsonb_set(v_last, array[r.org_id::text], to_jsonb(r.at));
      end if;
    end loop;
  end loop;
  return query
  select o.id,
         (select max(m.last_seen_at) from public.organization_members m where m.organization_id = o.id),
         (select max(u.last_sign_in_at) from public.organization_members m join auth.users u on u.id = m.user_id where m.organization_id = o.id),
         greatest((v_last ->> o.id::text)::timestamptz, (select max(d.last_at) from public.org_usage_days d where d.organization_id = o.id)),
         (select count(distinct d.day)::int from public.org_usage_days d where d.organization_id = o.id and d.day > current_date - 30),
         (select coalesce(sum(d.views), 0)::int from public.org_usage_days d where d.organization_id = o.id and d.day > current_date - 30),
         coalesce((v_used ->> o.id::text)::int, 0)
           + (case when o.logo_url is not null then 1 else 0 end)
           + (case when o.brand_color is distinct from '#1F3D3A' then 1 else 0 end),
         v_total
    from public.organizations o
   where o.id = any(p_ids);
end;
$$;
revoke execute on function public.admin_orgs_activity(uuid[]) from public, anon;
grant execute on function public.admin_orgs_activity(uuid[]) to authenticated;

-- The detail: features, people, screens, day-by-day activity, recent events.
create or replace function public.admin_org_usage(p_org uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  f record;
  v_recent jsonb := '[]'::jsonb;
  r record;
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;
  -- Latest rows of every feature table: "Devis créé", "Facture créée"…
  for f in select * from public.admin_org_feature_tables() loop
    if to_regclass('public.' || f.tbl) is null then
      continue;
    end if;
    -- Grouped by minute: an import of 500 contacts is one line, not 500.
    for r in execute format('select max(created_at) at, count(*) n from public.%I where organization_id = $1 group by date_trunc(''minute'', created_at) order by 1 desc limit 6', f.tbl) using p_org loop
      v_recent := v_recent || jsonb_build_object('at', r.at, 'kind', 'action', 'key', f.key, 'label', f.label, 'views', r.n, 'actor', null);
    end loop;
  end loop;
  v_recent := v_recent || coalesce((
    select jsonb_agg(jsonb_build_object('at', d.last_at, 'kind', 'screen', 'key', d.area, 'views', d.views,
             'actor', (select coalesce(nullif(m.full_name, ''), u.email::text) from public.organization_members m join auth.users u on u.id = m.user_id where m.organization_id = p_org and m.user_id = d.user_id)))
      from (select * from public.org_usage_days d where d.organization_id = p_org order by d.last_at desc limit 40) d), '[]'::jsonb);

  return jsonb_build_object(
    'features', public.admin_org_features(p_org),
    'members', coalesce((
      select jsonb_agg(jsonb_build_object(
        'user_id', m.user_id,
        'name', nullif(m.full_name, ''),
        'email', u.email,
        'role', m.role,
        'joined_at', m.created_at,
        'last_seen_at', m.last_seen_at,
        'last_sign_in_at', u.last_sign_in_at,
        'active_days_30', (select count(distinct d.day) from public.org_usage_days d where d.organization_id = p_org and d.user_id = m.user_id and d.day > current_date - 30),
        'top_areas', coalesce((
          select jsonb_agg(t.area order by t.v desc)
            from (select d.area, sum(d.views) v from public.org_usage_days d
                   where d.organization_id = p_org and d.user_id = m.user_id and d.day > current_date - 30
                   group by d.area order by sum(d.views) desc limit 5) t), '[]'::jsonb)
      ) order by m.last_seen_at desc nulls last, m.created_at)
        from public.organization_members m
        join auth.users u on u.id = m.user_id
       where m.organization_id = p_org), '[]'::jsonb),
    'areas', coalesce((
      select jsonb_agg(jsonb_build_object('area', t.area, 'views', t.views, 'users', t.users, 'days', t.days, 'last_at', t.last_at) order by t.views desc)
        from (select d.area, sum(d.views)::int views, count(distinct d.user_id)::int users, count(distinct d.day)::int days, max(d.last_at) last_at
                from public.org_usage_days d
               where d.organization_id = p_org and d.day > current_date - 90
               group by d.area) t), '[]'::jsonb),
    'daily', coalesce((
      select jsonb_agg(jsonb_build_object('day', g.day::date, 'views', coalesce(t.views, 0), 'users', coalesce(t.users, 0)) order by g.day)
        from generate_series(current_date - 29, current_date, interval '1 day') g(day)
        left join (select d.day, sum(d.views)::int views, count(distinct d.user_id)::int users
                     from public.org_usage_days d where d.organization_id = p_org and d.day > current_date - 30
                    group by d.day) t on t.day = g.day::date), '[]'::jsonb),
    'recent', coalesce((
      select jsonb_agg(e order by (e ->> 'at')::timestamptz desc)
        from (select e from jsonb_array_elements(v_recent) e order by (e ->> 'at')::timestamptz desc limit 50) x), '[]'::jsonb)
  );
end;
$$;
revoke execute on function public.admin_org_usage(uuid) from public, anon;
grant execute on function public.admin_org_usage(uuid) to authenticated;
