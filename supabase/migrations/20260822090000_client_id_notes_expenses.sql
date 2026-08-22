-- Fondation manquante identifiée en audit produit : devis/factures/travaux
-- supplémentaires ne pointent vers aucun client — juste des champs texte
-- libres (client_name/client_email), retapés à chaque fois. Résultat : la
-- fiche client (app/(app)/clients/[id].tsx) ne peut montrer aucun
-- historique. On ajoute un lien optionnel vers clients, sans toucher aux
-- colonnes texte existantes (un devis reste un instantané des infos client
-- au moment de la création, cf. commentaire sur la table clients).
alter table public.devis add column client_id uuid references public.clients(id) on delete set null;
alter table public.factures add column client_id uuid references public.clients(id) on delete set null;
alter table public.extra_works add column client_id uuid references public.clients(id) on delete set null;

create index on public.devis (client_id) where client_id is not null;
create index on public.factures (client_id) where client_id is not null;
create index on public.extra_works (client_id) where client_id is not null;

-- Backfill best-effort : ne relie que quand l'email du document correspond
-- à exactement un client de la même organisation (email vide ou partagé
-- par plusieurs clients = pas de lien automatique, l'utilisateur reliera
-- à la main via le sélecteur client).
update public.devis d
set client_id = c.id
from public.clients c
where d.client_id is null
  and d.client_email is not null and d.client_email <> ''
  and c.organization_id = d.organization_id
  and lower(c.email) = lower(d.client_email)
  and (select count(*) from public.clients c2 where c2.organization_id = d.organization_id and lower(c2.email) = lower(d.client_email)) = 1;

update public.factures f
set client_id = c.id
from public.clients c
where f.client_id is null
  and f.client_email is not null and f.client_email <> ''
  and c.organization_id = f.organization_id
  and lower(c.email) = lower(f.client_email)
  and (select count(*) from public.clients c2 where c2.organization_id = f.organization_id and lower(c2.email) = lower(f.client_email)) = 1;

update public.extra_works ew
set client_id = c.id
from public.clients c
where ew.client_id is null
  and ew.client_email is not null and ew.client_email <> ''
  and c.organization_id = ew.organization_id
  and lower(c.email) = lower(ew.client_email)
  and (select count(*) from public.clients c2 where c2.organization_id = ew.organization_id and lower(c2.email) = lower(ew.client_email)) = 1;

-- Journal de notes horodaté : remplace le champ clients.notes unique
-- (perdait l'historique — la dernière note écrasait toujours la
-- précédente). La colonne clients.notes reste en place pour compat mais
-- n'est plus alimentée par l'UI après cette migration.
create table public.client_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  body text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index on public.client_notes (client_id, created_at desc);

alter table public.client_notes enable row level security;

create policy "members can view client notes" on public.client_notes
  for select using (public.is_org_member(organization_id));
create policy "members can create client notes" on public.client_notes
  for insert with check (public.is_org_member(organization_id) and created_by = auth.uid());
create policy "members can update own client notes" on public.client_notes
  for update using (public.is_org_member(organization_id) and created_by = auth.uid());
create policy "admins can delete client notes" on public.client_notes
  for delete using (public.is_org_admin(organization_id));

insert into public.client_notes (organization_id, client_id, body, created_by, created_at)
select c.organization_id, c.id, c.notes, c.created_by, c.created_at
from public.clients c
where c.notes is not null and trim(c.notes) <> '';

-- Dépenses ponctuelles hors chantier (fournitures, outillage, frais
-- divers...) : distinct de recurring_expenses (abonnements récurrents) et
-- subcontractor_invoices (facturé par un sous-traitant sur un chantier).
-- Même famille de permissions que recurring_expenses (finance de l'org).
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  label text not null,
  category text,
  amount_chf numeric(10,2) not null check (amount_chf >= 0),
  expense_date date not null default current_date,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.expenses (organization_id, expense_date desc);

alter table public.expenses enable row level security;

create policy "finance members can view expenses" on public.expenses
  for select using (public.can_view_org_finances(organization_id));
create policy "finance members can insert expenses" on public.expenses
  for insert with check (public.can_view_org_finances(organization_id) and created_by = auth.uid());
create policy "finance members can update expenses" on public.expenses
  for update using (public.can_view_org_finances(organization_id));
create policy "finance members can delete expenses" on public.expenses
  for delete using (public.can_view_org_finances(organization_id));

create trigger expenses_set_updated_at before update on public.expenses
for each row execute function public.set_updated_at();
