-- Système de notifications : centre in-app (cloche), e-mail (Resend) et push
-- mobile (Expo), avec préférences par type d'événement. Deux mécanismes de
-- génération :
--  - événementiel (triggers AFTER INSERT/UPDATE) pour tout ce qui est
--    instantané : message posté dans un fil de chantier, TS accepté, et
--    surtout la SUPPRESSION d'une notification dès que la situation qui la
--    justifiait se résout (facture payée, devis qui change de statut...) —
--    c'est le mécanisme qui garantit qu'une notif ne "s'insiste" jamais.
--  - périodique (generate_scheduled_notifications(), appelée par pg_cron
--    toutes les heures) pour ce qui devient vrai avec le temps qui passe :
--    devis resté en brouillon, devis qui approche de sa date de validité,
--    facture en retard, dépense récurrente qui approche.
-- Chaque notification a une clé unique (user_id, type, source_id) : la
-- génération ne peut jamais créer de doublon (insert ... on conflict do
-- nothing), qu'elle soit rejouée par le cron ou par un trigger qui refire.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in (
    'devis_stale_draft', 'devis_expiring_soon', 'facture_overdue',
    'recurring_expense_due', 'extra_work_accepted', 'feed_message'
  )),
  title text not null,
  body text,
  link text,
  source_table text not null,
  source_id uuid not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, type, source_id)
);

create index notifications_user_unread_idx on public.notifications (user_id, read_at, created_at desc);
create index notifications_org_idx on public.notifications (organization_id);

alter table public.notifications enable row level security;

create policy "users can view own notifications" on public.notifications
  for select using (user_id = auth.uid());
create policy "users can update own notifications" on public.notifications
  for update using (user_id = auth.uid());
create policy "users can delete own notifications" on public.notifications
  for delete using (user_id = auth.uid());

-- Pas de policy insert : les lignes ne sont créées que par les fonctions
-- security definer ci-dessous (exécutées avec les privilèges du
-- propriétaire de la migration, qui contourne RLS comme partout ailleurs
-- dans ce schéma — voir accept_public_devis et consorts).

alter publication supabase_realtime add table public.notifications;

-- Préférences par (utilisateur, type) — absence de ligne = valeurs par
-- défaut ci-dessous (in-app et push actifs, e-mail opt-in).
create table public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  in_app_enabled boolean not null default true,
  email_enabled boolean not null default false,
  push_enabled boolean not null default true,
  unique (user_id, type)
);

create index notification_preferences_user_idx on public.notification_preferences (user_id);

alter table public.notification_preferences enable row level security;

create policy "users manage own notification preferences" on public.notification_preferences
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Jetons Expo Push, un par device. Un même token peut changer de
-- propriétaire (device réutilisé par un autre compte) : upsert sur conflit
-- de token côté client.
create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null unique,
  platform text not null check (platform in ('ios', 'android')),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index push_tokens_user_idx on public.push_tokens (user_id);

alter table public.push_tokens enable row level security;

create policy "users manage own push tokens" on public.push_tokens
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ==========================================================================
-- Ciblage des destinataires "finance" — can_view_org_finances()/is_org_admin()
-- existants sont câblés sur auth.uid() de la session courante, donc
-- inutilisables depuis un trigger ou un job planifié (pas de session HTTP).
-- Cette variante renvoie l'ensemble des user_id éligibles pour un org donné.
-- ==========================================================================
create or replace function public.finance_member_user_ids(org_id uuid)
returns setof uuid
language sql stable security definer set search_path = public as $$
  select m.user_id from public.organization_members m
  where m.organization_id = org_id and m.role in ('owner', 'admin')
  union
  select m.user_id from public.organization_members m
  join public.organization_roles r on r.id = m.role_id
  where m.organization_id = org_id and r.can_view_finances;
$$;

create or replace function public.notif_in_app_enabled(p_user_id uuid, p_type text)
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select in_app_enabled from public.notification_preferences where user_id = p_user_id and type = p_type),
    true
  );
$$;

-- ==========================================================================
-- Dispatch push/e-mail — appelé après chaque insertion, via pg_net (déjà
-- activé sur ce projet) vers l'edge function dispatch-notification. Le
-- secret ci-dessous n'est PAS la clé service-role du projet (que je n'ai
-- aucun moyen d'obtenir depuis cet environnement) : c'est un secret interne
-- généré pour cette seule fonctionnalité, dont le seul but est d'empêcher un
-- tiers d'invoquer l'edge function au hasard. Il est dupliqué tel quel dans
-- supabase/functions/dispatch-notification/index.ts.
-- ==========================================================================
create or replace function public.dispatch_notification_http()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform net.http_post(
    url := 'https://krijilwxhdlzflvnvrtl.supabase.co/functions/v1/dispatch-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Dispatch-Secret', '3cafd1059f6e75930c7c09c4e9af5de9e435fbb49cbe5fdcb4964d7512d7bc1b'
    ),
    body := jsonb_build_object('notification_id', new.id)
  );
  return new;
end;
$$;

create trigger notifications_dispatch after insert on public.notifications
for each row execute function public.dispatch_notification_http();

-- ==========================================================================
-- Génération événementielle
-- ==========================================================================

-- Nouveau message de fil de chantier -> toute l'équipe de l'org sauf l'auteur.
create or replace function public.notify_feed_message()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_project_name text;
begin
  select name into v_project_name from public.projects where id = new.project_id;
  insert into public.notifications (organization_id, user_id, type, title, body, link, source_table, source_id)
  select new.organization_id, m.user_id, 'feed_message',
         'Nouveau message — ' || coalesce(v_project_name, 'Chantier'),
         nullif(left(coalesce(new.body, ''), 140), ''),
         '/(app)/chantiers/' || new.project_id,
         'feed_entries', new.id
  from public.organization_members m
  where m.organization_id = new.organization_id
    and m.user_id is distinct from new.created_by
    and public.notif_in_app_enabled(m.user_id, 'feed_message')
  on conflict (user_id, type, source_id) do nothing;
  return new;
end;
$$;

create trigger feed_entries_notify after insert on public.feed_entries
for each row execute function public.notify_feed_message();

-- TS accepté -> membres finance.
create or replace function public.notify_extra_work_accepted()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
    insert into public.notifications (organization_id, user_id, type, title, body, link, source_table, source_id)
    select new.organization_id, fm.user_id, 'extra_work_accepted',
           'Travaux supplémentaires accepté — ' || coalesce(new.number, ''),
           new.title,
           '/(app)/chantiers/' || new.project_id || '/travaux-supplementaires/' || new.id,
           'extra_works', new.id
    from public.finance_member_user_ids(new.organization_id) as fm(user_id)
    where public.notif_in_app_enabled(fm.user_id, 'extra_work_accepted')
    on conflict (user_id, type, source_id) do nothing;
  end if;
  return new;
end;
$$;

create trigger extra_works_notify_accepted after update of status on public.extra_works
for each row execute function public.notify_extra_work_accepted();

-- Nettoyage instantané : la facture n'est plus en retard -> la notif disparaît.
create or replace function public.cleanup_facture_notifications()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status not in ('sent', 'partial') or new.due_date >= current_date then
    delete from public.notifications where type = 'facture_overdue' and source_id = new.id;
  end if;
  return new;
end;
$$;

create trigger factures_cleanup_notify after update of status, due_date on public.factures
for each row execute function public.cleanup_facture_notifications();

-- Nettoyage instantané : le devis a changé de statut -> les notifs liées disparaissent.
create or replace function public.cleanup_devis_notifications()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status <> 'draft' then
    delete from public.notifications where type = 'devis_stale_draft' and source_id = new.id;
  end if;
  if new.status <> 'sent' then
    delete from public.notifications where type = 'devis_expiring_soon' and source_id = new.id;
  end if;
  return new;
end;
$$;

create trigger devis_cleanup_notify after update of status on public.devis
for each row execute function public.cleanup_devis_notifications();

-- Nettoyage instantané : dépense désactivée ou échéance déplacée -> la notif disparaît.
create or replace function public.cleanup_recurring_expense_notifications()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.active = false or new.next_due_date is distinct from old.next_due_date then
    delete from public.notifications where type = 'recurring_expense_due' and source_id = new.id;
  end if;
  return new;
end;
$$;

create trigger recurring_expenses_cleanup_notify after update on public.recurring_expenses
for each row execute function public.cleanup_recurring_expense_notifications();

-- ==========================================================================
-- Génération périodique — appelée par pg_cron toutes les heures. Chaque
-- bloc supprime d'abord les notifications dont la condition n'est plus
-- vraie (filet de sécurité en plus des triggers ci-dessus), puis insère les
-- nouvelles (déduplication automatique via la contrainte unique).
-- ==========================================================================
create or replace function public.generate_scheduled_notifications()
returns void
language plpgsql security definer set search_path = public as $$
begin
  -- devis_stale_draft : brouillon depuis plus de 5 jours.
  delete from public.notifications n
  where n.type = 'devis_stale_draft'
    and not exists (
      select 1 from public.devis d
      where d.id = n.source_id and d.status = 'draft' and d.created_at < now() - interval '5 days'
    );

  insert into public.notifications (organization_id, user_id, type, title, body, link, source_table, source_id)
  select d.organization_id, fm.user_id, 'devis_stale_draft',
         'Devis en attente — ' || coalesce(d.number, ''),
         'Ce devis est en brouillon depuis plusieurs jours et n''a pas encore été envoyé.',
         '/(app)/devis/' || d.id,
         'devis', d.id
  from public.devis d
  cross join lateral public.finance_member_user_ids(d.organization_id) as fm(user_id)
  where d.status = 'draft' and d.created_at < now() - interval '5 days'
    and public.notif_in_app_enabled(fm.user_id, 'devis_stale_draft')
  on conflict (user_id, type, source_id) do nothing;

  -- devis_expiring_soon : envoyé, fenêtre de validité qui se termine dans les 3 jours.
  delete from public.notifications n
  where n.type = 'devis_expiring_soon'
    and not exists (
      select 1 from public.devis d
      join public.organizations o on o.id = d.organization_id
      where d.id = n.source_id and d.status = 'sent'
        and d.created_at + make_interval(days => o.devis_validity_days) between now() and now() + interval '3 days'
    );

  insert into public.notifications (organization_id, user_id, type, title, body, link, source_table, source_id)
  select d.organization_id, fm.user_id, 'devis_expiring_soon',
         'Devis bientôt échu — ' || coalesce(d.number, ''),
         'Ce devis arrive à échéance de validité, relancez le client si besoin.',
         '/(app)/devis/' || d.id,
         'devis', d.id
  from public.devis d
  join public.organizations o on o.id = d.organization_id
  cross join lateral public.finance_member_user_ids(d.organization_id) as fm(user_id)
  where d.status = 'sent'
    and d.created_at + make_interval(days => o.devis_validity_days) between now() and now() + interval '3 days'
    and public.notif_in_app_enabled(fm.user_id, 'devis_expiring_soon')
  on conflict (user_id, type, source_id) do nothing;

  -- facture_overdue : envoyée/partielle, échéance dépassée.
  delete from public.notifications n
  where n.type = 'facture_overdue'
    and not exists (
      select 1 from public.factures f
      where f.id = n.source_id and f.status in ('sent', 'partial') and f.due_date < current_date
    );

  insert into public.notifications (organization_id, user_id, type, title, body, link, source_table, source_id)
  select f.organization_id, fm.user_id, 'facture_overdue',
         'Facture en retard — ' || coalesce(f.number, ''),
         'Échéance dépassée le ' || to_char(f.due_date, 'DD.MM.YYYY') || ', pensez à relancer.',
         '/(app)/devis/factures/' || f.id,
         'factures', f.id
  from public.factures f
  cross join lateral public.finance_member_user_ids(f.organization_id) as fm(user_id)
  where f.status in ('sent', 'partial') and f.due_date < current_date
    and public.notif_in_app_enabled(fm.user_id, 'facture_overdue')
  on conflict (user_id, type, source_id) do nothing;

  -- recurring_expense_due : dépense active dont l'échéance approche, uniquement si la trésorerie est activée.
  delete from public.notifications n
  where n.type = 'recurring_expense_due'
    and not exists (
      select 1 from public.recurring_expenses e
      where e.id = n.source_id and e.active
        and e.next_due_date between current_date and current_date + e.reminder_days_before
    );

  insert into public.notifications (organization_id, user_id, type, title, body, link, source_table, source_id)
  select e.organization_id, fm.user_id, 'recurring_expense_due',
         'Dépense récurrente à venir — ' || e.label,
         'CHF ' || e.amount_chf::text || ' prévu le ' || to_char(e.next_due_date, 'DD.MM.YYYY') || '.',
         '/(app)/tresorerie',
         'recurring_expenses', e.id
  from public.recurring_expenses e
  join public.organizations o on o.id = e.organization_id
  cross join lateral public.finance_member_user_ids(e.organization_id) as fm(user_id)
  where e.active
    and e.next_due_date between current_date and current_date + e.reminder_days_before
    and o.enabled_modules @> array['treasury']
    and public.notif_in_app_enabled(fm.user_id, 'recurring_expense_due')
  on conflict (user_id, type, source_id) do nothing;

  -- Ménage : les notifications lues s'effacent après 30 jours, les non lues après 90.
  delete from public.notifications where read_at is not null and read_at < now() - interval '30 days';
  delete from public.notifications where read_at is null and created_at < now() - interval '90 days';
end;
$$;

create extension if not exists pg_cron;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'generate-notifications') then
    perform cron.unschedule('generate-notifications');
  end if;
end $$;

select cron.schedule('generate-notifications', '0 * * * *', $$select public.generate_scheduled_notifications()$$);
