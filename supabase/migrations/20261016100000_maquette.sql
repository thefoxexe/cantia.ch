-- Cantia Maquette (formerly "Relief"): where each project stands in the
-- company's own process, and the process itself kept editable without
-- rebuilding the world.
--
-- relief_item_progress: one row per project, written from the map
-- (components/relief/ReliefDom.tsx) when someone moves the project to its
-- next step, by a click or by voice. Any member of the organization may
-- move a project along, like ticking a task; the history keeps who did it
-- and when, so the map can tell how long each step really took.

create table if not exists public.relief_item_progress (
  project_id uuid primary key references public.projects(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  -- Which kind of project (answers.kinds[].id), so which process applies.
  kind text,
  -- Index of the current step in that process.
  stage integer not null default 0 check (stage between 0 and 11),
  stage_started_on date not null default current_date,
  -- [{ "stage": 2, "at": "2026-10-16T08:12:00Z", "by": "<user id>" }, …]
  history jsonb not null default '[]'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index if not exists relief_item_progress_org_idx on public.relief_item_progress (organization_id);

create trigger relief_item_progress_set_updated_at before update on public.relief_item_progress
for each row execute function public.set_updated_at();

alter table public.relief_item_progress enable row level security;

create policy "members can view project steps" on public.relief_item_progress
  for select using (public.is_org_member(organization_id));

-- The project must belong to the same organization as the row.
create policy "members can set project steps" on public.relief_item_progress
  for insert with check (
    public.is_org_member(organization_id)
    and exists (select 1 from public.projects p where p.id = project_id and p.organization_id = relief_item_progress.organization_id)
  );

create policy "members can move project steps" on public.relief_item_progress
  for update using (public.is_org_member(organization_id))
  with check (
    public.is_org_member(organization_id)
    and exists (select 1 from public.projects p where p.id = project_id and p.organization_id = relief_item_progress.organization_id)
  );

alter publication supabase_realtime add table public.relief_item_progress;

-- The owner edits the process (kinds of projects, steps, durations) from
-- the map: saved straight into the answers, no AI rebuild needed. Owner or
-- admin only; the world must exist.
create or replace function public.relief_save_answers(p_organization_id uuid, p_answers jsonb)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_org_admin(p_organization_id) then
    raise exception 'Seuls le propriétaire et les administrateurs peuvent modifier le process.' using errcode = '42501';
  end if;
  if jsonb_typeof(p_answers) <> 'object' or octet_length(p_answers::text) > 60000 then
    raise exception 'Process invalide.' using errcode = '22023';
  end if;
  update public.relief_worlds set answers = p_answers where organization_id = p_organization_id;
  if not found then
    raise exception 'Maquette introuvable.' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.relief_save_answers(uuid, jsonb) from public, anon;
grant execute on function public.relief_save_answers(uuid, jsonb) to authenticated;

update public.modules
set name = 'Cantia Maquette',
    description = 'L’entreprise en maquette 3D vivante : vos projets, votre process et vos équipes du jour, reliés au planning, aux tâches et à la facturation.'
where key = 'relief';
