-- "RTK" named a hardware GPS receiver feature that was never actually built
-- (see the landing-page removal of the "récepteur RTK" mention) — the
-- has_rtk plan flag was really always gating the whole Levés module, not a
-- specific receiver. Renaming everything away from "RTK" so the concept
-- stops existing anywhere, while keeping the exact same paywall behavior
-- (free plan can't insert survey points, every paid plan can).

alter table public.plans rename column has_rtk to has_survey;

create or replace function public.org_has_survey(org_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select coalesce(p.has_survey, false)
  from public.organizations o
  join public.plans p on p.id = o.plan_id
  where o.id = org_id;
$$;

create or replace function public.check_survey_points_plan()
returns trigger language plpgsql set search_path = public as $$
begin
  if not public.org_has_survey(new.organization_id) then
    raise exception 'Les levés de précision nécessitent un plan payant (dès Indépendant).';
  end if;
  return new;
end;
$$;

drop trigger if exists survey_points_require_rtk_plan on public.survey_points;
create trigger survey_points_require_survey_plan
before insert on public.survey_points
for each row execute function public.check_survey_points_plan();

drop function if exists public.org_has_rtk(uuid);
