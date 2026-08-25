-- Super Admin: rôle plateforme (distinct du rôle "admin" d'une organisation)
-- + registre central de modules + attribution de modules privés par
-- organisation. Entièrement additif : aucune table/policy/fonction
-- existante n'est modifiée. Ne remplace pas organizations.enabled_modules
-- ni plans.has_* (toggle self-service par l'entreprise elle-même) — ce
-- système sert spécifiquement les modules contrôlés par Cantia (privés,
-- ou octroyés en dérogation d'un palier), accordés uniquement par un
-- super-admin, jamais par l'organisation elle-même.

-- ==========================================================================
-- 1. platform_admins
-- ==========================================================================
create table public.platform_admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null default 'super_admin' check (role in ('super_admin')),
  created_at timestamptz not null default now()
);

alter table public.platform_admins enable row level security;
-- Aucune policy self-service : lecture/écriture réservées aux fonctions
-- security definer ci-dessous, à l'image du reste du projet qui centralise
-- les écritures sensibles dans des RPCs plutôt que d'ouvrir la table.

create or replace function public.is_platform_admin()
returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.platform_admins where user_id = auth.uid());
$$;

revoke all on function public.is_platform_admin() from public;
grant execute on function public.is_platform_admin() to authenticated;

-- Seed initial : bastien@cantia.ch. Recherché par e-mail (pas d'UUID en
-- dur) ; sans effet si le compte n'existe pas encore dans cet environnement.
insert into public.platform_admins (user_id)
select id from auth.users where email = 'bastien@cantia.ch'
on conflict (user_id) do nothing;

-- ==========================================================================
-- 2. modules — registre central
-- ==========================================================================
create table public.modules (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  category text,
  visibility text not null default 'private' check (visibility in ('standard', 'private', 'experimental')),
  status text not null default 'active' check (status in ('active', 'beta', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_modules_updated_at before update on public.modules
  for each row execute function public.set_updated_at();

alter table public.modules enable row level security;

-- ==========================================================================
-- 3. organization_modules — attribution par organisation
-- ==========================================================================
create table public.organization_modules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  enabled boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, module_id)
);

create index on public.organization_modules (organization_id);
create index on public.organization_modules (module_id);

create trigger set_organization_modules_updated_at before update on public.organization_modules
  for each row execute function public.set_updated_at();

alter table public.organization_modules enable row level security;

-- ==========================================================================
-- 4. admin_audit_logs
-- ==========================================================================
create table public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  organization_id uuid references public.organizations(id) on delete set null,
  module_id uuid references public.modules(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index on public.admin_audit_logs (created_at desc);

alter table public.admin_audit_logs enable row level security;
-- Aucune policy self-service sur admin_audit_logs : lecture uniquement via
-- admin_list_audit_logs() plus bas.

-- ==========================================================================
-- 4bis. Policies (après que toutes les tables ci-dessus existent, certaines
-- se référencent mutuellement)
-- ==========================================================================

-- Un membre d'organisation ne voit que les modules effectivement accordés
-- (et activés) à sa propre organisation — jamais le registre complet, donc
-- jamais les modules privés d'une autre entreprise, même leur existence.
create policy "Members can view modules granted to their org"
on public.modules for select
using (
  public.is_platform_admin()
  or exists (
    select 1 from public.organization_modules om
    where om.module_id = modules.id
      and om.enabled = true
      and public.is_org_member(om.organization_id)
  )
);

-- Lecture seule pour les membres de l'organisation concernée (nécessaire
-- pour que hasModule()/useModule() fonctionnent côté client sans RPC dédié)
-- — jamais celles d'une autre organisation. Aucune policy d'écriture : les
-- toggles passent uniquement par admin_set_organization_module() ci-dessous.
create policy "Members can view their org's module grants"
on public.organization_modules for select
using (public.is_org_member(organization_id) or public.is_platform_admin());

-- ==========================================================================
-- 5. Visibilité additionnelle pour le super-admin (lecture cross-org)
-- ==========================================================================
-- Policies additives (OR'ées avec les policies existantes) : n'enlèvent ni
-- ne modifient rien pour les utilisateurs normaux, elles ajoutent seulement
-- une visibilité pour is_platform_admin(). Nécessaires notamment pour que
-- l'abonnement realtime "dernières inscriptions" fonctionne côté client
-- (les RPCs admin_* elles-mêmes n'en ont pas besoin : elles s'exécutent en
-- tant que propriétaire des tables, donc déjà exemptées de RLS).
create policy "Platform admins can view all organizations"
on public.organizations for select
using (public.is_platform_admin());

create policy "Platform admins can view all organization members"
on public.organization_members for select
using (public.is_platform_admin());

-- ==========================================================================
-- 6. RPCs — toutes vérifient is_platform_admin() en premier et lèvent une
-- exception explicite sinon (même style que create_organization et les
-- autres RPCs métier du projet).
-- ==========================================================================

create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql security definer stable set search_path = public as $$
declare
  result jsonb;
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  select jsonb_build_object(
    'organizations_count', (select count(*) from public.organizations),
    'users_count', (select count(*) from auth.users),
    'active_trials_count', (
      select count(*) from public.organizations
      where trial_ends_at is not null and trial_ends_at > now() and subscription_status is distinct from 'active'
    ),
    'paid_subscriptions_count', (select count(*) from public.organizations where subscription_status = 'active'),
    'signups_today_count', (select count(*) from auth.users where created_at >= date_trunc('day', now())),
    'organizations_created_today_count', (select count(*) from public.organizations where created_at >= date_trunc('day', now()))
  ) into result;

  return result;
end;
$$;

create or replace function public.admin_list_organizations(search text default null, limit_n int default 50, offset_n int default 0)
returns table (
  id uuid, name text, plan_id text, plan_name text, subscription_status text,
  trial_ends_at timestamptz, plan_selected boolean, created_at timestamptz,
  member_count bigint, owner_email text, private_modules_count bigint, total_count bigint
)
language plpgsql security definer stable set search_path = public as $$
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  return query
  select
    o.id, o.name, o.plan_id, p.name, o.subscription_status, o.trial_ends_at,
    o.plan_selected, o.created_at,
    (select count(*) from public.organization_members m where m.organization_id = o.id),
    (select u.email from public.organization_members m join auth.users u on u.id = m.user_id
       where m.organization_id = o.id and m.role = 'owner' order by m.created_at asc limit 1),
    (select count(*) from public.organization_modules om where om.organization_id = o.id and om.enabled),
    count(*) over ()
  from public.organizations o
  join public.plans p on p.id = o.plan_id
  where search is null or search = '' or o.name ilike '%' || search || '%'
  order by o.created_at desc
  limit limit_n offset offset_n;
end;
$$;

create or replace function public.admin_get_organization_detail(org_id uuid)
returns jsonb
language plpgsql security definer stable set search_path = public as $$
declare
  result jsonb;
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  select jsonb_build_object(
    'organization', to_jsonb(o) || jsonb_build_object('plan_name', p.name),
    'members', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'user_id', m.user_id,
        'full_name', m.full_name,
        'email', u.email,
        'role', m.role,
        'last_sign_in_at', u.last_sign_in_at,
        'created_at', m.created_at
      ) order by m.created_at asc), '[]'::jsonb)
      from public.organization_members m
      join auth.users u on u.id = m.user_id
      where m.organization_id = o.id
    ),
    'standard_modules', to_jsonb(o.enabled_modules),
    'private_modules', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'module_id', mod.id,
        'key', mod.key,
        'name', mod.name,
        'description', mod.description,
        'visibility', mod.visibility,
        'status', mod.status,
        'enabled', om.enabled
      ) order by mod.name asc), '[]'::jsonb)
      from public.organization_modules om
      join public.modules mod on mod.id = om.module_id
      where om.organization_id = o.id
    )
  ) into result
  from public.organizations o
  join public.plans p on p.id = o.plan_id
  where o.id = org_id;

  if result is null then
    raise exception 'organization not found';
  end if;

  return result;
end;
$$;

create or replace function public.admin_set_organization_module(org_id uuid, module_key text, enabled boolean)
returns void
language plpgsql security definer set search_path = public as $$
declare
  target_module_id uuid;
  target_module_name text;
  target_org_name text;
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  select id, name into target_module_id, target_module_name from public.modules where key = module_key;
  if target_module_id is null then
    raise exception 'unknown module key: %', module_key;
  end if;

  select name into target_org_name from public.organizations where id = org_id;
  if target_org_name is null then
    raise exception 'organization not found';
  end if;

  insert into public.organization_modules (organization_id, module_id, enabled)
  values (org_id, target_module_id, enabled)
  on conflict (organization_id, module_id)
  do update set enabled = excluded.enabled, updated_at = now();

  insert into public.admin_audit_logs (admin_user_id, action, organization_id, module_id, metadata)
  values (
    auth.uid(),
    case when enabled then 'module_enabled' else 'module_disabled' end,
    org_id,
    target_module_id,
    jsonb_build_object('module_key', module_key, 'module_name', target_module_name, 'organization_name', target_org_name)
  );
end;
$$;

create or replace function public.admin_upsert_module(
  module_key text, module_name text, module_description text default null,
  module_category text default null, module_visibility text default 'private', module_status text default 'active'
)
returns public.modules
language plpgsql security definer set search_path = public as $$
declare
  result public.modules;
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  insert into public.modules (key, name, description, category, visibility, status)
  values (module_key, module_name, module_description, module_category, module_visibility, module_status)
  on conflict (key) do update set
    name = excluded.name, description = excluded.description, category = excluded.category,
    visibility = excluded.visibility, status = excluded.status, updated_at = now()
  returning * into result;

  insert into public.admin_audit_logs (admin_user_id, action, module_id, metadata)
  values (auth.uid(), 'module_registered', result.id, jsonb_build_object('module_key', module_key, 'module_name', module_name));

  return result;
end;
$$;

create or replace function public.admin_list_modules()
returns table (
  id uuid, key text, name text, description text, category text, visibility text, status text,
  organizations_count bigint, created_at timestamptz
)
language plpgsql security definer stable set search_path = public as $$
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  return query
  select
    m.id, m.key, m.name, m.description, m.category, m.visibility, m.status,
    (select count(*) from public.organization_modules om where om.module_id = m.id and om.enabled),
    m.created_at
  from public.modules m
  order by m.created_at desc;
end;
$$;

create or replace function public.admin_list_users(search text default null, limit_n int default 50, offset_n int default 0)
returns table (
  user_id uuid, email text, full_name text, organization_id uuid, organization_name text,
  role public.org_role, created_at timestamptz, last_sign_in_at timestamptz, total_count bigint
)
language plpgsql security definer stable set search_path = public as $$
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  return query
  select
    u.id, u.email, m.full_name, o.id, o.name, m.role, u.created_at, u.last_sign_in_at,
    count(*) over ()
  from auth.users u
  join public.organization_members m on m.user_id = u.id
  join public.organizations o on o.id = m.organization_id
  where search is null or search = '' or u.email ilike '%' || search || '%' or m.full_name ilike '%' || search || '%'
  order by u.created_at desc
  limit limit_n offset offset_n;
end;
$$;

create or replace function public.admin_list_audit_logs(limit_n int default 50, offset_n int default 0)
returns table (
  id uuid, admin_email text, action text, organization_name text, module_name text,
  metadata jsonb, created_at timestamptz, total_count bigint
)
language plpgsql security definer stable set search_path = public as $$
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  return query
  select
    l.id, u.email, l.action, o.name, mo.name, l.metadata, l.created_at,
    count(*) over ()
  from public.admin_audit_logs l
  left join auth.users u on u.id = l.admin_user_id
  left join public.organizations o on o.id = l.organization_id
  left join public.modules mo on mo.id = l.module_id
  order by l.created_at desc
  limit limit_n offset offset_n;
end;
$$;

revoke all on function public.admin_dashboard_stats() from public;
revoke all on function public.admin_list_organizations(text, int, int) from public;
revoke all on function public.admin_get_organization_detail(uuid) from public;
revoke all on function public.admin_set_organization_module(uuid, text, boolean) from public;
revoke all on function public.admin_upsert_module(text, text, text, text, text, text) from public;
revoke all on function public.admin_list_modules() from public;
revoke all on function public.admin_list_users(text, int, int) from public;
revoke all on function public.admin_list_audit_logs(int, int) from public;

grant execute on function public.admin_dashboard_stats() to authenticated;
grant execute on function public.admin_list_organizations(text, int, int) to authenticated;
grant execute on function public.admin_get_organization_detail(uuid) to authenticated;
grant execute on function public.admin_set_organization_module(uuid, text, boolean) to authenticated;
grant execute on function public.admin_upsert_module(text, text, text, text, text, text) to authenticated;
grant execute on function public.admin_list_modules() to authenticated;
grant execute on function public.admin_list_users(text, int, int) to authenticated;
grant execute on function public.admin_list_audit_logs(int, int) to authenticated;

-- ==========================================================================
-- 7. Realtime — "dernières inscriptions" côté super-admin
-- ==========================================================================
alter publication supabase_realtime add table public.organizations;
alter publication supabase_realtime add table public.organization_members;
