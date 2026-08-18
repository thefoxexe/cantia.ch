-- Planning entries no longer have to reference a chantier — e.g. a training
-- day, an office day, or anything else worth putting on the team calendar
-- that isn't tied to a specific jobsite. project_id stays a real FK (still
-- cascades if the chantier itself is deleted), just optional now.
alter table public.planning_assignments
  alter column project_id drop not null;
