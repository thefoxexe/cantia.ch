-- Tasks can be tied to a chantier, given a due date and assigned to a
-- member: the new home page (app/(app)/index.tsx) groups them by chantier.
alter table public.dashboard_tasks
  add column if not exists project_id uuid references public.projects(id) on delete set null,
  add column if not exists due_on date,
  add column if not exists assigned_to uuid references auth.users(id) on delete set null;

create index if not exists dashboard_tasks_project_idx on public.dashboard_tasks (project_id) where project_id is not null;
