-- Several organizations in this project are ours, not real customers: a
-- batch of synthetic companies seeded for the pitch video (every member on
-- a @demo.cantia.ch address), a literal "Test" org, bastien's own dev
-- account (Cantia.ch), and his personal WebAlp.ch account. The admin
-- Entreprises/Abonnements lists and the dashboard's "dernières
-- inscriptions" widget need to tell those apart from real clients at a
-- glance, and push them to the bottom so the real pipeline isn't buried
-- under our own test data.
alter table public.organizations add column if not exists is_internal boolean not null default false;
alter table public.organizations add column if not exists internal_label text;

-- Seed batch for the pitch video: every member's email is @demo.cantia.ch.
update public.organizations o
set is_internal = true, internal_label = 'Démo'
where exists (
  select 1 from public.organization_members m
  join auth.users u on u.id = m.user_id
  where m.organization_id = o.id and u.email ilike '%@demo.cantia.ch'
);

update public.organizations set is_internal = true, internal_label = 'Test' where name = 'Test';
update public.organizations set is_internal = true, internal_label = 'Interne' where name = 'Cantia.ch';
update public.organizations set is_internal = true, internal_label = 'Interne' where name = 'WebAlp.ch';

drop function if exists public.admin_list_organizations(text, int, int);

create function public.admin_list_organizations(search text default null, limit_n int default 50, offset_n int default 0)
returns table(
  id uuid, name text, plan_id text, plan_name text, subscription_status text,
  trial_ends_at timestamptz, plan_selected boolean, created_at timestamptz,
  member_count bigint, owner_email text, private_modules_count bigint,
  is_internal boolean, internal_label text, total_count bigint
)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  return query
  select
    o.id, o.name, o.plan_id, p.name, o.subscription_status, o.trial_ends_at,
    o.plan_selected, o.created_at,
    (select count(*) from public.organization_members m where m.organization_id = o.id),
    (select u.email::text from public.organization_members m join auth.users u on u.id = m.user_id
       where m.organization_id = o.id and m.role = 'owner' order by m.created_at asc limit 1),
    (select count(*) from public.organization_modules om where om.organization_id = o.id and om.enabled),
    o.is_internal, o.internal_label,
    count(*) over ()
  from public.organizations o
  join public.plans p on p.id = o.plan_id
  where search is null or search = '' or o.name ilike '%' || search || '%'
  order by o.is_internal asc, o.created_at desc
  limit limit_n offset offset_n;
end;
$$;

revoke execute on function public.admin_list_organizations(text, int, int) from anon;
notify pgrst, 'reload schema';
