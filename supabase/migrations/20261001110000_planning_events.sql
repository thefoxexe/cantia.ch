-- Planning: any event, not only a chantier assignment.
--   title       what it is (required in the app: « Séance de chantier »,
--               « Absent », « Rendez-vous client »…); a chantier is optional
--   start_time / end_time   hours within the day; both null = all day
--   is_private  only the person concerned and the author see it; everyone
--               else (owner included) sees « Rendez-vous privé » and nothing
--               more, through planning_busy_blocks() below.
-- An employee creates only for themself; owners / admins for any member.
alter table public.planning_assignments
  add column if not exists title text check (title is null or char_length(title) <= 200),
  add column if not exists start_time time,
  add column if not exists end_time time,
  add column if not exists is_private boolean not null default false;

alter table public.planning_assignments drop constraint if exists planning_assignments_time_check;
alter table public.planning_assignments add constraint planning_assignments_time_check
  check (start_time is null or end_time is null or ends_on > starts_on or end_time > start_time);

drop policy if exists "planning-permitted members can view planning assignments" on public.planning_assignments;
drop policy if exists "planning-permitted members can create planning assignments" on public.planning_assignments;
drop policy if exists "planning-permitted members can update planning assignments" on public.planning_assignments;
drop policy if exists "authors and admins can delete planning assignments" on public.planning_assignments;

-- Private rows are never readable by others, even admins: their details
-- don't leave the database (planning_busy_blocks returns only the slot).
create policy "planning: view shared events and own private ones" on public.planning_assignments
  for select using (
    public.can_view_org_planning(organization_id)
    and (not is_private or member_user_id = auth.uid() or created_by = auth.uid())
  );
create policy "planning: create for oneself, admins for anyone" on public.planning_assignments
  for insert with check (
    public.can_view_org_planning(organization_id)
    and created_by = auth.uid()
    and (member_user_id = auth.uid() or public.is_org_admin(organization_id))
  );
create policy "planning: edit own events, admins shared ones" on public.planning_assignments
  for update using (
    public.can_view_org_planning(organization_id)
    and (member_user_id = auth.uid() or created_by = auth.uid() or (public.is_org_admin(organization_id) and not is_private))
  ) with check (
    public.can_view_org_planning(organization_id)
    and (member_user_id = auth.uid() or public.is_org_admin(organization_id))
  );
create policy "planning: delete own events, admins shared ones" on public.planning_assignments
  for delete using (
    member_user_id = auth.uid() or created_by = auth.uid() or (public.is_org_admin(organization_id) and not is_private)
  );

-- Other people's private events, reduced to « busy »: who and when, no
-- title, note or chantier.
create or replace function public.planning_busy_blocks(p_organization_id uuid, p_start date, p_end date)
returns table (id uuid, member_user_id uuid, starts_on date, ends_on date, start_time time, end_time time)
language sql stable security definer set search_path = public as $$
  select a.id, a.member_user_id, a.starts_on, a.ends_on, a.start_time, a.end_time
  from public.planning_assignments a
  where a.organization_id = p_organization_id
    and public.can_view_org_planning(p_organization_id)
    and a.is_private
    and a.member_user_id <> auth.uid()
    and coalesce(a.created_by, '00000000-0000-0000-0000-000000000000'::uuid) <> auth.uid()
    and a.starts_on <= p_end
    and a.ends_on >= p_start;
$$;
revoke all on function public.planning_busy_blocks(uuid, date, date) from public, anon;
grant execute on function public.planning_busy_blocks(uuid, date, date) to authenticated;
