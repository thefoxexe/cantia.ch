-- Enforce RTK/levés plan gating at the database level (defense in depth,
-- not just a UI check) so a free-plan member can't insert survey points
-- by calling the API directly.
create or replace function public.org_has_rtk(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select coalesce(p.has_rtk, false)
  from public.organizations o
  join public.plans p on p.id = o.plan_id
  where o.id = org_id;
$$;

create or replace function public.check_survey_points_plan()
returns trigger language plpgsql set search_path = public as $$
begin
  if not public.org_has_rtk(new.organization_id) then
    raise exception 'Les levés de précision nécessitent un plan payant (dès Artisan Solo).';
  end if;
  return new;
end;
$$;

create trigger survey_points_require_rtk_plan
before insert on public.survey_points
for each row execute function public.check_survey_points_plan();
