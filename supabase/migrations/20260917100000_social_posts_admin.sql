-- Contenu réseaux sociaux : même pattern que tutorial_chapters
-- (20260903180000) — table fermée en RLS, tout passe par des RPCs security
-- definer qui re-vérifient is_platform_admin(). Additif pur, aucune table
-- existante touchée.
--
-- Un post = un sujet, avec un texte différent par réseau (Instagram vs
-- LinkedIn n'ont ni le même ton ni la même longueur attendue) ; les visuels
-- eux-mêmes (format 4:5 pour Instagram, 1200×627 pour LinkedIn) sont générés
-- côté client à partir de headline/subheadline — voir
-- lib/socialPostGenerator.ts — pas stockés en base, pour rester éditables
-- sans re-upload à chaque changement de texte.

create table public.social_posts (
  id uuid primary key default gen_random_uuid(),
  order_index integer not null,
  topic text not null,
  headline text not null,
  subheadline text not null default '',
  instagram_caption text not null default '',
  linkedin_caption text not null default '',
  status text not null default 'pret' check (status in ('idee', 'pret', 'publie')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.social_posts enable row level security;
-- Pas de policy self-service, à l'image de tutorial_chapters : la table
-- n'est accessible que via les fonctions security definer ci-dessous.

create or replace function public.admin_list_social_posts()
returns setof public.social_posts
language plpgsql security definer stable set search_path = public as $$
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  return query
  select * from public.social_posts
  order by order_index asc, created_at asc;
end;
$$;

create or replace function public.admin_upsert_social_post(
  post_id uuid default null,
  p_order_index integer default 0,
  p_topic text default '',
  p_headline text default '',
  p_subheadline text default '',
  p_instagram_caption text default '',
  p_linkedin_caption text default '',
  p_status text default 'idee',
  p_notes text default null
)
returns public.social_posts
language plpgsql security definer set search_path = public as $$
declare
  result public.social_posts;
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  if post_id is null then
    insert into public.social_posts
      (order_index, topic, headline, subheadline, instagram_caption, linkedin_caption, status, notes)
    values
      (p_order_index, p_topic, p_headline, p_subheadline, p_instagram_caption, p_linkedin_caption, p_status, p_notes)
    returning * into result;
  else
    update public.social_posts set
      order_index = p_order_index,
      topic = p_topic,
      headline = p_headline,
      subheadline = p_subheadline,
      instagram_caption = p_instagram_caption,
      linkedin_caption = p_linkedin_caption,
      status = p_status,
      notes = p_notes,
      updated_at = now()
    where id = post_id
    returning * into result;
  end if;

  return result;
end;
$$;

create or replace function public.admin_delete_social_post(post_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_platform_admin() then
    raise exception 'access denied: not a platform admin';
  end if;

  delete from public.social_posts where id = post_id;
end;
$$;

revoke all on function public.admin_list_social_posts() from public;
revoke all on function public.admin_upsert_social_post(uuid, integer, text, text, text, text, text, text, text) from public;
revoke all on function public.admin_delete_social_post(uuid) from public;

grant execute on function public.admin_list_social_posts() to authenticated;
grant execute on function public.admin_upsert_social_post(uuid, integer, text, text, text, text, text, text, text) to authenticated;
grant execute on function public.admin_delete_social_post(uuid) to authenticated;

-- ==========================================================================
-- Seed : premier lot de contenu prêt à publier, un post par fonctionnalité
-- phare. Éditable/supprimable ensuite depuis l'écran admin, ceci n'est que
-- le point de départ.
-- ==========================================================================
insert into public.social_posts (order_index, topic, headline, subheadline, instagram_caption, linkedin_caption, status) values

(1, $$Devis à la voix$$, $$Un devis. Trois minutes.$$, $$Dictez sur le chantier, Cantia rédige le reste.$$,
$$Fini les devis rédigés le soir, sur un coin de table. 😮‍💨

Avec Cantia, vous dictez vos lignes à voix haute — sur le chantier, dans la camionnette, où vous voulez — et le devis est prêt en quelques minutes. TVA calculée, mise en page pro, prêt à envoyer.

Votre métier, c'est le chantier. Pas la paperasse. 🛠️

👉 Essai gratuit 14 jours, lien en bio.

#ArtisanSuisse #BTP #GestionChantier #Devis #Entrepreneur #ConstructionSuisse #Cantia$$,
$$Le temps administratif est l'un des premiers freins à la croissance des PME du bâtiment.

Chez Cantia, nous avons construit la dictée vocale pour répondre à un problème concret : un devis correctement chiffré prend en moyenne 20 à 30 minutes à rédiger le soir, après une journée de chantier.

Avec la dictée vocale intégrée à Cantia, cette tâche descend à quelques minutes — directement depuis le terrain, sans reprendre une seule ligne au bureau.

C'est ce type de gain de temps, multiplié sur chaque devis de l'année, qui fait la différence sur la rentabilité d'une entreprise du bâtiment.

Découvrez comment sur cantia.ch.

#DigitalisationBTP #PME #ConstructionSuisse #Productivité #Cantia$$,
'pret'),

(2, $$Facturation & QR-facture$$, $$La QR-facture. Sans y penser.$$, $$Générée automatiquement, conforme, prête à envoyer.$$,
$$La QR-facture suisse, générée automatiquement à chaque facture. IBAN, référence structurée, montant — tout est déjà là. ✅

Plus besoin de la faire à la main ni de la vérifier trois fois. Cantia s'en charge, vous vous occupez du chantier.

💳 Suivi des paiements en temps réel, relances en un clic.

👉 cantia.ch

#Facturation #QRFacture #Suisse #PME #Artisan #Bâtiment #Cantia$$,
$$La QR-facture est devenue le standard suisse — et pourtant, elle reste une source d'erreurs et de temps perdu pour beaucoup de PME du bâtiment : IBAN à ressaisir, référence à vérifier, montant à recopier.

Cantia génère automatiquement une QR-facture conforme à chaque facture émise, avec rapprochement automatique dès réception du paiement.

Résultat : moins d'erreurs, une trésorerie suivie en temps réel, et des relances envoyées avant que l'impayé ne devienne un problème.

En savoir plus sur cantia.ch.

#Facturation #Fintech #ConstructionSuisse #Trésorerie #Cantia$$,
'pret'),

(3, $$Rapports de chantier$$, $$Le chantier. Documenté seul.$$, $$Photos, notes, météo — un rapport généré chaque jour.$$,
$$Chaque jour, un rapport de chantier généré automatiquement : photos horodatées, notes vocales, météo, avancement. 📸🎙️

Plus besoin d'y penser le soir — tout se construit tout seul, pendant que vous travaillez.

Et en cas de litige ? Chaque photo est datée et géolocalisée. Une vraie protection juridique. 🛡️

👉 cantia.ch

#ChantierBTP #RapportChantier #ArtisanSuisse #Construction #Cantia$$,
$$Un rapport de chantier bien tenu est autant un outil de pilotage qu'une protection juridique en cas de litige.

Cantia génère automatiquement un rapport quotidien à partir de ce qui est déjà capturé sur le terrain — photos horodatées et géolocalisées, notes vocales, conditions météo — sans charge de saisie supplémentaire pour les équipes.

Le résultat est un document PDF structuré, à l'image de votre entreprise, disponible pour le client ou l'assurance en un clic.

Découvrez la fonctionnalité sur cantia.ch.

#GestionDeChantier #ConstructionSuisse #Conformité #Cantia$$,
'pret'),

(4, $$RH & salaires$$, $$La paie suisse. Sans le casse-tête.$$, $$Heures par chantier, salaires calculés automatiquement.$$,
$$Vos équipes pointent leurs heures par chantier, directement depuis leur téléphone. 📱

Côté bureau, les salaires se calculent automatiquement — du brut au net, conforme aux normes suisses. Zéro tableur, zéro erreur de calcul.

👷 Plus de temps pour vos équipes, moins pour la paperasse.

👉 cantia.ch

#RH #Paie #BTP #Suisse #GestionEquipe #Cantia$$,
$$La gestion de la paie reste l'une des tâches administratives les plus chronophages — et les plus sensibles aux erreurs — pour une PME du bâtiment suisse.

Avec Cantia, les heures sont saisies par chantier directement par les équipes sur le terrain, et le calcul de salaire — du brut au net — se fait automatiquement, en conformité avec les normes suisses.

Les droits d'accès sont clairs : un employé ne voit que ses propres heures, jamais les salaires de l'équipe.

Découvrez notre module RH sur cantia.ch.

#RH #PaieSuisse #ConstructionSuisse #PME #Cantia$$,
'pret'),

(5, $$Rentabilité par chantier$$, $$La marge. En temps réel.$$, $$Devis vs coût réel, chantier par chantier.$$,
$$Est-ce que ce chantier est vraiment rentable ? Avec Cantia, la réponse est sous vos yeux — en temps réel, pas seulement à la clôture. 📊

Devis accepté vs coût réel (matériel + main d'œuvre), marge en CHF et en %.

Repérez un chantier qui dérape avant qu'il ne soit trop tard. 🚩

👉 cantia.ch

#Rentabilité #GestionChantier #BTP #Suisse #Entrepreneur #Cantia$$,
$$Trop d'entreprises du bâtiment ne découvrent qu'un chantier n'était pas rentable qu'à sa clôture — quand il est déjà trop tard pour agir.

Cantia calcule la rentabilité de chaque chantier en continu, en comparant le devis accepté au coût réel (matériel et main d'œuvre issue du planning), avec la marge affichée en CHF et en pourcentage.

Cela permet d'identifier un chantier qui dérape suffisamment tôt pour corriger le tir — plutôt que de le constater a posteriori.

Plus d'informations sur cantia.ch.

#Rentabilité #PilotageFinancier #ConstructionSuisse #PME #Cantia$$,
'pret'),

(6, $$Situations de chantier$$, $$Facturer à l'avancement. Sans y perdre de temps.$$, $$Situations de chantier générées à chaque étape.$$,
$$Gros œuvre, chantiers longs, facturation par étapes ? Cantia génère vos situations de chantier automatiquement, poste par poste. 🏗️

Plus besoin de tout recalculer à la main à chaque avancement — Cantia suit ce qui a déjà été facturé et ce qu'il reste à venir.

👉 cantia.ch

#SituationDeChantier #GrosOeuvre #BTP #Suisse #Cantia$$,
$$Pour les chantiers de longue durée, la facturation à l'avancement (situations de chantier) est une nécessité — et une source d'erreurs quand elle est gérée manuellement, poste par poste, avancement après avancement.

Cantia automatise la génération des situations de chantier à partir du devis initial, en suivant précisément ce qui a déjà été facturé et ce qui reste à venir.

Un gain de temps réel pour les entreprises de gros œuvre et de second œuvre qui facturent par étapes.

Découvrez cette fonctionnalité sur cantia.ch.

#SituationDeChantier #ConstructionSuisse #GrosOeuvre #Cantia$$,
'pret'),

(7, $$Signature électronique$$, $$Signé sur place. Validé tout de suite.$$, $$Travaux supplémentaires signés sur tablette, en direct.$$,
$$Un imprévu sur le chantier ? Le client signe directement sur tablette — validé et facturable dans la foulée. ✍️📱

Plus de bon de commande papier perdu, plus de « on verra plus tard ». La signature électronique a la même valeur légale, et tout est tracé dans Cantia.

👉 cantia.ch

#SignatureElectronique #TravauxSupplementaires #BTP #Cantia$$,
$$Les travaux supplémentaires sont l'un des points de friction classiques d'un chantier : un imprévu, une demande client sur le terrain, et souvent... rien d'écrit avant la facture finale.

Cantia permet de faire signer un travail supplémentaire directement sur tablette, sur le chantier — avec la même valeur légale qu'une signature papier — puis de le transformer automatiquement en facture une fois validé.

Un accord clair, tracé, et facturé sans délai.

Plus d'informations sur cantia.ch.

#TravauxSupplementaires #SignatureElectronique #ConstructionSuisse #Cantia$$,
'pret'),

(8, $$Marque / confiance$$, $$Gérez vos chantiers.\nPas votre administratif.$$, $$Devis, factures, chantiers, équipes — pensé pour le bâtiment suisse.$$,
$$Cantia, c'est une plateforme pensée pour une chose : vous laisser du temps pour le chantier. 🇨🇭🏔️

Devis, factures, chantiers, équipes — tout au même endroit, pensé pour les métiers du bâtiment suisse.

14 jours d'essai gratuit, sans carte bancaire. 👉 cantia.ch

#Cantia #BTP #ArtisanSuisse #ConstructionSuisse #PME #GestionChantier$$,
$$Cantia est une plateforme de gestion pensée spécifiquement pour les entreprises du bâtiment suisses : devis, factures, chantiers et équipes réunis au même endroit, avec la QR-facture, la conformité RH suisse et la dictée vocale intégrées nativement.

Notre conviction : le temps d'un chef d'entreprise ou d'un chef de chantier doit aller au chantier, pas à l'administratif.

14 jours d'essai gratuit, sans engagement. Découvrez Cantia sur cantia.ch.

#ConstructionSuisse #PME #DigitalisationBTP #Cantia$$,
'pret');
