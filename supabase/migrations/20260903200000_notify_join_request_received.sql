-- Notifie les administrateurs/propriétaires d'une organisation dès qu'une
-- demande d'adhésion est déposée (organization_join_requests, voir
-- requestToJoin() dans lib/api/invites.ts) — jusqu'ici seule l'insertion en
-- base se produisait, sans aucun signal côté équipe déjà en place tant que
-- personne ne repensait à consulter Compte → Équipe. Même mécanisme que le
-- reste de 20260820120000_notifications.sql : type ajouté à la contrainte,
-- fonction security definer + trigger AFTER INSERT, dispatch push/e-mail
-- automatique via le trigger générique déjà en place sur la table.

alter table public.notifications drop constraint notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in (
  'devis_stale_draft', 'devis_expiring_soon', 'facture_overdue',
  'recurring_expense_due', 'extra_work_accepted', 'feed_message', 'devis_accepted',
  'join_request_received'
));

-- Même forme que finance_member_user_ids() (20260820120000_notifications.sql)
-- mais pour les destinataires habilités à approuver/rejeter une demande —
-- is_org_admin() lui-même est câblé sur auth.uid() de la session courante et
-- donc inutilisable depuis un trigger, qui n'a pas de session HTTP.
create or replace function public.admin_member_user_ids(org_id uuid)
returns setof uuid
language sql stable security definer set search_path = public as $$
  select m.user_id from public.organization_members m
  where m.organization_id = org_id and m.role in ('owner', 'admin');
$$;

create or replace function public.notify_join_request_received()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_org_name text;
  v_requester_name text;
begin
  select name into v_org_name from public.organizations where id = new.organization_id;
  select coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), u.email, 'Quelqu''un')
    into v_requester_name
    from auth.users u
    where u.id = new.user_id;

  insert into public.notifications (organization_id, user_id, type, title, body, link, source_table, source_id)
  select new.organization_id, am.user_id, 'join_request_received',
         'Nouvelle demande pour rejoindre ' || coalesce(v_org_name, 'votre entreprise'),
         v_requester_name || ' souhaite rejoindre votre organisation.',
         '/(app)/compte/equipe',
         'organization_join_requests', new.id
  from public.admin_member_user_ids(new.organization_id) as am(user_id)
  where public.notif_in_app_enabled(am.user_id, 'join_request_received')
  on conflict (user_id, type, source_id) do nothing;

  return new;
end;
$$;

create trigger join_requests_notify after insert on public.organization_join_requests
for each row execute function public.notify_join_request_received();

revoke all on function public.admin_member_user_ids(uuid) from public;
