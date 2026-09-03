-- Tutoriel vidéo : suivi de production pour la super-admin (liste de
-- chapitres à tourner, avec le script/points à dire par chapitre et un
-- statut d'avancement). Même pattern que platform_admins/modules
-- (20260825010000) : table fermée en RLS, tout passe par des RPCs
-- security definer qui re-vérifient is_platform_admin(). Additif pur,
-- aucune table existante touchée.

create table public.tutorial_chapters (
  id uuid primary key default gen_random_uuid(),
  order_index integer not null,
  feature_area text not null,
  title text not null,
  talking_points text not null default '',
  status text not null default 'a_faire' check (status in ('a_faire', 'tourne', 'monte', 'publie')),
  youtube_url text,
  site_embed_done boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tutorial_chapters enable row level security;
-- Pas de policy self-service, à l'image de platform_admins/modules : la
-- table n'est accessible que via les fonctions security definer ci-dessous.

create or replace function public.admin_list_tutorial_chapters()
returns setof public.tutorial_chapters
language plpgsql security definer stable set search_path = public as $$
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  return query
  select * from public.tutorial_chapters
  order by order_index asc, created_at asc;
end;
$$;

create or replace function public.admin_upsert_tutorial_chapter(
  chapter_id uuid default null,
  p_order_index integer default 0,
  p_feature_area text default '',
  p_title text default '',
  p_talking_points text default '',
  p_status text default 'a_faire',
  p_youtube_url text default null,
  p_site_embed_done boolean default false,
  p_notes text default null
)
returns public.tutorial_chapters
language plpgsql security definer set search_path = public as $$
declare
  result public.tutorial_chapters;
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  if chapter_id is null then
    insert into public.tutorial_chapters
      (order_index, feature_area, title, talking_points, status, youtube_url, site_embed_done, notes)
    values
      (p_order_index, p_feature_area, p_title, p_talking_points, p_status, p_youtube_url, p_site_embed_done, p_notes)
    returning * into result;
  else
    update public.tutorial_chapters set
      order_index = p_order_index,
      feature_area = p_feature_area,
      title = p_title,
      talking_points = p_talking_points,
      status = p_status,
      youtube_url = p_youtube_url,
      site_embed_done = p_site_embed_done,
      notes = p_notes,
      updated_at = now()
    where id = chapter_id
    returning * into result;
  end if;

  return result;
end;
$$;

create or replace function public.admin_delete_tutorial_chapter(chapter_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  delete from public.tutorial_chapters where id = chapter_id;
end;
$$;

revoke all on function public.admin_list_tutorial_chapters() from public;
revoke all on function public.admin_upsert_tutorial_chapter(uuid, integer, text, text, text, text, text, boolean, text) from public;
revoke all on function public.admin_delete_tutorial_chapter(uuid) from public;

grant execute on function public.admin_list_tutorial_chapters() to authenticated;
grant execute on function public.admin_upsert_tutorial_chapter(uuid, integer, text, text, text, text, text, boolean, text) to authenticated;
grant execute on function public.admin_delete_tutorial_chapter(uuid) to authenticated;

-- ==========================================================================
-- Seed : plan de tournage complet, un chapitre par fonctionnalité, avec les
-- points à montrer/dire pour chacun — prêt à cocher au fur et à mesure du
-- tournage. Éditable/supprimable ensuite depuis l'écran admin, ceci n'est
-- que le point de départ.
-- ==========================================================================
insert into public.tutorial_chapters (order_index, feature_area, title, talking_points) values

(1, $$Démarrage$$, $$Créer son compte$$, $$Montrer l'écran d'inscription : nom, e-mail, mot de passe.
Insister sur la vérification e-mail (code reçu par mail) avant de pouvoir continuer.
Préciser qu'il n'y a pas de carte bancaire à saisir à cette étape : 14 jours d'essai complet.$$),

(2, $$Démarrage$$, $$Onboarding : créer une entreprise ou rejoindre une équipe$$, $$Montrer les deux chemins possibles juste après l'inscription : « Créer mon entreprise » vs « Rejoindre une équipe existante » avec un lien d'invitation.
Pour la création : nom de l'entreprise, corps de métier, taille d'équipe.
Rappeler que rejoindre une équipe demande juste le lien envoyé par l'administrateur — pas de configuration à refaire.$$),

(3, $$Démarrage$$, $$Tour du tableau de bord$$, $$Montrer les KPI en haut (devis en attente, factures impayées, chantiers actifs).
Montrer les raccourcis rapides (nouveau devis, nouvelle facture, nouveau chantier).
Insister sur le fait que tout part de là : c'est l'écran qu'on revoit chaque matin.$$),

(4, $$Devis$$, $$Créer un devis à la voix$$, $$Ouvrir un nouveau devis, montrer le bouton dicter.
Dicter une ligne à voix haute et montrer la transformation automatique en position chiffrée avec prix.
Montrer l'ajout d'un client, le calcul automatique de la TVA et du total.$$),

(5, $$Devis$$, $$Trames de devis réutilisables$$, $$Montrer comment enregistrer un devis type comme trame (ex. « rénovation salle de bain standard »).
Réutiliser la trame sur un nouveau devis pour gagner du temps.
Insister sur le gain de temps pour les artisans qui refont souvent le même type de prestation.$$),

(6, $$Devis$$, $$Envoyer un devis et suivre la signature$$, $$Montrer l'envoi du devis au client (lien, pas de PDF à imprimer).
Montrer le portail client où il consulte et signe électroniquement.
Montrer le statut qui passe à « signé » côté Cantia, en temps réel.$$),

(7, $$Devis$$, $$Transformer un devis accepté en facture$$, $$Depuis un devis signé, montrer le bouton « Convertir en facture ».
Insister : aucune ligne à ressaisir, tout est repris automatiquement.
Montrer le résultat : une facture prête, déjà avec QR-facture suisse.$$),

(8, $$Facturation$$, $$Créer une facture et la QR-facture suisse$$, $$Montrer la création d'une facture indépendante (pas depuis un devis).
Montrer le bulletin QR généré automatiquement (IBAN, référence structurée, montant).
Rappeler que l'IBAN se configure une seule fois dans les paramètres.$$),

(9, $$Facturation$$, $$Facturer un acompte$$, $$Montrer comment émettre une facture d'acompte pour un pourcentage du devis.
Montrer que ce montant est ensuite automatiquement déduit de la facture finale.
Bon moment pour rappeler la logique : sécuriser sa trésorerie avant de commencer un chantier.$$),

(10, $$Facturation$$, $$Suivre les paiements et relancer un impayé$$, $$Montrer le statut d'une facture (envoyée, payée, en retard).
Montrer le rapprochement automatique via la référence QR quand un paiement arrive.
Montrer une relance envoyée en un clic pour une facture en retard.$$),

(11, $$Facturation$$, $$Import de relevé bancaire$$, $$Montrer l'import d'un fichier de relevé bancaire.
Montrer le rapprochement automatique avec les factures en attente.
Insister sur le temps gagné par rapport à un pointage manuel facture par facture.$$),

(12, $$Chantiers$$, $$Créer un chantier et son fil d'actualité$$, $$Créer un nouveau chantier : nom, adresse, client, équipe affectée.
Montrer le fil d'actualité : notes, photos, messages vocaux au même endroit.
Comparer rapidement à un groupe WhatsApp qui se perd dans le défilement — ici tout reste classé par chantier.$$),

(13, $$Chantiers$$, $$Photos et documents de chantier$$, $$Montrer l'ajout d'une photo depuis le téléphone, géolocalisée et horodatée automatiquement.
Montrer le classement des documents en arborescence (plans, contrats, autorisations).
Insister sur l'intérêt juridique : une photo datée protège en cas de litige.$$),

(14, $$Chantiers$$, $$Rapport de chantier généré par IA$$, $$Montrer la prise de notes vocales et photos sur le moment.
Montrer le rapport PDF structuré généré automatiquement à partir de ça.
Montrer la personnalisation : logo, couleur de marque, signature du rédacteur.$$),

(15, $$Chantiers$$, $$Métré poste par poste$$, $$Montrer la saisie d'un métré (quantités, unités) directement lié au chantier.
Montrer le lien avec le devis : comparer prévu vs réellement posé.
Utile en particulier pour les corps de métier qui facturent au m²/ml.$$),

(16, $$Chantiers$$, $$Sous-traitants sur un chantier$$, $$Montrer l'ajout d'un sous-traitant à un chantier précis.
Montrer le suivi de ses factures et de son statut de paiement.
Rappeler que l'entrepreneur principal reste responsable envers le client — d'où l'intérêt d'un suivi centralisé.$$),

(17, $$Chantiers$$, $$Rentabilité par chantier$$, $$Montrer la comparaison devis accepté vs coût réel (matériel + main d'œuvre issue du planning).
Montrer la marge affichée en CHF et en % en temps réel, pas seulement à la clôture.
Bon moment pour montrer un chantier « limite » et expliquer comment le repérer tôt.$$),

(18, $$Chantiers$$, $$Travaux supplémentaires (TS)$$, $$Montrer la création d'un TS pour un extra demandé en cours de chantier.
Montrer l'envoi au client et la signature en ligne, comme pour un devis.
Montrer la transformation automatique en facture une fois accepté.$$),

(19, $$Équipe & RH$$, $$Planning d'équipe$$, $$Montrer le calendrier hebdomadaire partagé : qui est sur quel chantier, chaque jour.
Montrer l'affectation d'un membre à un chantier en quelques clics.
Comparer à un tableau papier ou Excel qui n'est jamais à jour pour tout le monde en même temps.$$),

(20, $$Équipe & RH$$, $$RH : heures et salaires$$, $$Montrer un employé qui pointe ses heures par chantier depuis son téléphone.
Montrer côté admin/secrétaire la fiche de salaire générée du brut au net.
Rappeler qui voit quoi : un employé standard ne voit que ses propres heures, pas les salaires de l'équipe.$$),

(21, $$Équipe & RH$$, $$Gérer les membres et les rôles$$, $$Montrer l'invitation d'un nouveau membre par lien.
Montrer les différents rôles disponibles et ce que chacun peut voir/faire.
Bon moment pour clarifier la différence entre administrateur, secrétaire RH et employé standard.$$),

(22, $$Pilotage$$, $$Trésorerie prévisionnelle$$, $$Montrer la projection à 90 jours : factures à encaisser, salaires, sous-traitants, charges récurrentes.
Préciser qu'il n'y a aucune connexion bancaire : le solde se saisit manuellement.
Montrer le bandeau d'alerte pour une dépense récurrente qui arrive dans les 7 jours.$$),

(23, $$Pilotage$$, $$Clients : historique centralisé$$, $$Montrer la fiche client : tous ses devis, factures, chantiers et notes au même endroit.
Montrer comment relancer un ancien client au bon moment plutôt qu'au hasard.
Bon moment pour rappeler qu'un client récurrent coûte moins cher à garder qu'un nouveau à trouver.$$),

(24, $$Pilotage$$, $$Le portail client, côté client$$, $$Se mettre à la place du client : montrer ce qu'il reçoit et voit (lien, pas de compte à créer).
Montrer la consultation d'un devis et la signature électronique de son point de vue.
Montrer la double vérification (code reçu par e-mail) qui sécurise l'accès.$$),

(25, $$Paramètres$$, $$Paramètres de l'organisation$$, $$Montrer l'onglet Compte : apparence (logo, couleur de marque), modules activables, gestion de l'abonnement.
Montrer où changer la langue de l'interface (français/allemand).
Montrer la gestion du stockage et des notifications.$$),

(26, $$Paramètres$$, $$Intégration Bexio$$, $$Montrer la connexion à Bexio depuis les paramètres.
Montrer un client et une facture synchronisés automatiquement.
Bien préciser : chaque facture arrive dans Bexio en brouillon, la finalisation reste toujours manuelle côté Bexio.$$),

(27, $$Paramètres$$, $$Dictée vocale partout dans l'app$$, $$Montrer le bouton dicter utilisé à trois endroits différents : un devis, un rapport de chantier, un message d'équipe.
Insister : ça marche même avec le vocabulaire technique du bâtiment (matériaux, unités, métiers).
Bon chapitre de clôture : résumer que la voix remplace le clavier partout où on écrit dans Cantia.$$);
