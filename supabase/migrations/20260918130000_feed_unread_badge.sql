-- Remplace la notification générique (cloche + push) pour un message de
-- fil de chantier par un badge de compteur discret sur la liste des
-- chantiers — un message d'équipe n'a rien d'un événement métier (devis
-- signé, facture en retard) qui mérite une alerte, et avec plusieurs
-- messages par jour sur un chantier actif la cloche devenait vite
-- inutilisable. Le badge se base sur un vrai suivi de lecture par
-- utilisateur/chantier, pas sur les lignes de notifications.

create table public.project_feed_reads (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

alter table public.project_feed_reads enable row level security;

create policy "users manage own feed read state" on public.project_feed_reads
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Appelée quand l'utilisateur ouvre l'onglet Fil d'un chantier — upsert
-- explicite plutôt qu'un simple insert on conflict côté client pour rester
-- cohérent avec le reste du schéma (une seule fonction, jamais deux façons
-- différentes d'écrire la même chose depuis le client).
create or replace function public.mark_feed_read(p_project_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into public.project_feed_reads (project_id, user_id, last_read_at)
  values (p_project_id, auth.uid(), now())
  on conflict (project_id, user_id) do update set last_read_at = now();
end;
$$;

revoke all on function public.mark_feed_read(uuid) from public;
grant execute on function public.mark_feed_read(uuid) to authenticated;

-- Un compteur par chantier de l'organisation, pour l'utilisateur courant —
-- messages postés après sa dernière lecture, jamais ses propres messages
-- (pas de badge sur ce qu'on vient soi-même d'écrire).
create or replace function public.feed_unread_counts(org_id uuid)
returns table(project_id uuid, unread_count bigint)
language sql stable security definer set search_path = public as $$
  select f.project_id, count(*)::bigint
  from public.feed_entries f
  join public.projects p on p.id = f.project_id
  left join public.project_feed_reads r on r.project_id = f.project_id and r.user_id = auth.uid()
  where p.organization_id = org_id
    and f.created_by is distinct from auth.uid()
    and f.created_at > coalesce(r.last_read_at, 'epoch'::timestamptz)
  group by f.project_id;
$$;

revoke all on function public.feed_unread_counts(uuid) from public;
grant execute on function public.feed_unread_counts(uuid) to authenticated;

-- feed_message ne crée plus de ligne dans notifications (donc plus de
-- cloche ni de push pour un simple message) — le badge ci-dessus est la
-- seule surface désormais. Le type reste une valeur valide de l'ancien
-- check constraint (des lignes historiques peuvent encore exister), il
-- n'y en aura simplement plus de nouvelles.
drop trigger if exists feed_entries_notify on public.feed_entries;
drop function if exists public.notify_feed_message();
