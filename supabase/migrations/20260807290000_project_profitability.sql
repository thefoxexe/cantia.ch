-- Rentabilité par chantier: comparer le devis accepté (revenu) au coût réel
-- (matériel saisi manuellement + main d'oeuvre = jours planifiés sur le
-- chantier × coût horaire de l'entreprise). Le coût horaire est un seul
-- réglage par entreprise plutôt que par employé, pour rester simple à
-- renseigner pour une PME — voir organizations.hourly_cost. Les heures ne
-- sont pas pointées séparément : elles sont dérivées des affectations déjà
-- saisies dans le Planning, pour ne demander aucune double saisie.

alter table public.organizations
  add column hourly_cost numeric not null default 0;

create table public.project_expenses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  label text not null,
  amount numeric not null check (amount >= 0),
  category text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index on public.project_expenses (project_id);
create index on public.project_expenses (organization_id);

alter table public.project_expenses enable row level security;

create policy "members can view project expenses" on public.project_expenses
  for select using (public.is_org_member(organization_id));
create policy "members can create project expenses" on public.project_expenses
  for insert with check (public.is_org_member(organization_id) and created_by = auth.uid());
create policy "members can update project expenses" on public.project_expenses
  for update using (public.is_org_member(organization_id));
create policy "authors and admins can delete project expenses" on public.project_expenses
  for delete using (created_by = auth.uid() or public.is_org_admin(organization_id));
