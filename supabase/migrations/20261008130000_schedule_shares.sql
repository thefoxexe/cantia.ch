-- Planning de chantier — read-only links for people outside the company
-- (maître d'ouvrage, architecte, sous-traitants). Each link has an expiry
-- and can be revoked; nobody needs an account to open it. The token is the
-- only secret (uuid v4, 122 random bits), the same model as the devis links.
-- Internal fields never leave the database: notes only when the link says
-- so, never the responsible user, the baseline or the audit trail.

create table if not exists public.schedule_shares (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.site_schedules(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  label text check (label is null or char_length(label) <= 120),
  with_brand boolean not null default true,
  show_notes boolean not null default false,
  show_companies boolean not null default true,
  expires_at timestamptz,
  revoked_at timestamptz,
  view_count integer not null default 0,
  last_viewed_at timestamptz,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);
create index if not exists schedule_shares_schedule on public.schedule_shares (schedule_id);

-- same organization as the planning
create or replace function public.schedule_shares_same_org()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.site_schedules s where s.id = new.schedule_id and s.organization_id = new.organization_id) then
    raise exception 'Planning introuvable';
  end if;
  return new;
end;
$$;
drop trigger if exists schedule_shares_same_org on public.schedule_shares;
create trigger schedule_shares_same_org before insert or update of schedule_id, organization_id on public.schedule_shares
  for each row execute function public.schedule_shares_same_org();

alter table public.schedule_shares enable row level security;
drop policy if exists "schedule shares: read" on public.schedule_shares;
create policy "schedule shares: read" on public.schedule_shares for select using (public.can_view_schedule(schedule_id));
drop policy if exists "schedule shares: create" on public.schedule_shares;
create policy "schedule shares: create" on public.schedule_shares for insert with check (public.can_edit_schedule(schedule_id));
drop policy if exists "schedule shares: update" on public.schedule_shares;
create policy "schedule shares: update" on public.schedule_shares for update using (public.can_edit_schedule(schedule_id)) with check (public.can_edit_schedule(schedule_id));
drop policy if exists "schedule shares: delete" on public.schedule_shares;
create policy "schedule shares: delete" on public.schedule_shares for delete using (public.can_edit_schedule(schedule_id));
grant select, insert, update, delete on public.schedule_shares to authenticated;

-- The shared planning, read-only. Called by the public-schedule edge
-- function only (it also signs the logo out of private storage), so it is
-- not granted to anon. Returns null for an unknown, revoked or expired link.
create or replace function public.get_shared_schedule(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_share public.schedule_shares%rowtype;
  v_schedule public.site_schedules%rowtype;
  v_project record;
  v_org record;
  v_items jsonb;
  v_links jsonb;
begin
  select * into v_share from public.schedule_shares
  where token = p_token and revoked_at is null and (expires_at is null or expires_at > now());
  if not found then
    return null;
  end if;

  select * into v_schedule from public.site_schedules where id = v_share.schedule_id;
  select name, reference, address into v_project from public.projects where id = v_schedule.project_id;
  select name, logo_url, brand_color, locale, closure_periods into v_org from public.organizations where id = v_schedule.organization_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', i.id, 'parent_id', i.parent_id, 'kind', i.kind, 'name', i.name, 'trade', i.trade,
    'company', case when v_share.show_companies then i.company end,
    'status', i.status, 'progress', i.progress, 'progress_manual', i.progress_manual,
    'start_date', i.start_date, 'end_date', i.end_date, 'duration', i.duration,
    'notes', case when v_share.show_notes then i.notes end,
    'sort_order', i.sort_order
  ) order by i.sort_order), '[]'::jsonb)
  into v_items
  from public.schedule_items i where i.schedule_id = v_schedule.id;

  select coalesce(jsonb_agg(jsonb_build_object('id', l.id, 'from_item', l.from_item, 'to_item', l.to_item)), '[]'::jsonb)
  into v_links
  from public.schedule_links l where l.schedule_id = v_schedule.id;

  update public.schedule_shares set view_count = view_count + 1, last_viewed_at = now() where id = v_share.id;

  return jsonb_build_object(
    'share', jsonb_build_object('expires_at', v_share.expires_at, 'with_brand', v_share.with_brand, 'label', v_share.label),
    'project', jsonb_build_object('name', v_project.name, 'reference', v_project.reference, 'address', v_project.address),
    'organization', case when v_share.with_brand
      then jsonb_build_object('name', v_org.name, 'logo_path', v_org.logo_url, 'brand_color', v_org.brand_color, 'locale', v_org.locale)
      else jsonb_build_object('locale', v_org.locale) end,
    'calendar', jsonb_build_object(
      'workdays', to_jsonb(v_schedule.workdays), 'canton', v_schedule.canton, 'holidays', v_schedule.holidays,
      'days_off', to_jsonb(v_schedule.days_off), 'closures', coalesce(v_org.closure_periods, '[]'::jsonb)
    ),
    'items', v_items,
    'links', v_links,
    'updated_at', greatest(v_schedule.updated_at, (select max(updated_at) from public.schedule_items where schedule_id = v_schedule.id))
  );
end;
$$;

revoke all on function public.get_shared_schedule(uuid) from public, anon, authenticated;
grant execute on function public.get_shared_schedule(uuid) to service_role;
