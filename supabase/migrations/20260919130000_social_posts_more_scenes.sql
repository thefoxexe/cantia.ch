alter table public.social_posts drop constraint social_posts_scene_check;

alter table public.social_posts
  add constraint social_posts_scene_check
  check (scene in (
    'devis', 'chantier', 'facture', 'equipe', 'rentabilite', 'signature', 'essai',
    'planning', 'tresorerie', 'sousTraitants', 'rapportChantier', 'situations',
    'donneesImport', 'dashboard', 'meteo', 'support', 'multiDevice'
  ));

update public.social_posts set scene = 'rapportChantier' where topic = $$Rapports de chantier$$;
update public.social_posts set scene = 'situations' where topic = $$Situations de chantier$$;
update public.social_posts set scene = 'planning' where topic = $$Planning de chantier$$;
update public.social_posts set scene = 'sousTraitants' where topic = $$Sous-traitants$$;
update public.social_posts set scene = 'tresorerie' where topic = $$Trésorerie & dépenses récurrentes$$;
update public.social_posts set scene = 'support' where topic = $$Fil de chantier$$;
update public.social_posts set scene = 'donneesImport' where topic = $$Import de données$$;
update public.social_posts set scene = 'meteo' where topic = $$Tableau de bord chantier$$;

insert into public.social_posts (order_index, topic, headline, subheadline, instagram_caption, linkedin_caption, status, scene) values

(21, $$Vue d'ensemble de l'activité$$, $$Votre activité.\nEn un coup d'œil.$$, $$Devis actifs, chantiers en cours, chiffre d'affaires et marge — sur un seul écran.$$,
$$Plus besoin d'ouvrir cinq écrans pour savoir où vous en êtes. 📊

Le tableau de bord Cantia réunit vos devis actifs, vos chantiers en cours, votre chiffre d'affaires du mois et votre marge — mis à jour en temps réel, sans rien recalculer.

Vous pilotez votre entreprise, pas des tableurs. 🛠️

👉 Essai gratuit 14 jours, lien en bio.

#TableauDeBord #GestionEntreprise #ArtisanSuisse #BTP #PME #Cantia$$,
$$Un dirigeant de PME du bâtiment n'a pas le temps de reconstituer sa situation à partir de trois outils différents avant chaque décision.

Le tableau de bord Cantia consolide en un seul écran les indicateurs qui comptent au quotidien : devis en attente de réponse, chantiers actifs, chiffre d'affaires encaissé et marge réelle — calculés automatiquement à partir des données déjà saisies dans l'outil, sans ressaisie ni tableur annexe.

Une vision claire de l'activité, disponible en permanence.

Découvrez Cantia sur cantia.ch.

#PilotageEntreprise #ConstructionSuisse #PME #DigitalisationBTP #Cantia$$,
'pret', 'dashboard'),

(22, $$Bureau et chantier, synchronisés$$, $$Commencé au bureau.\nContinué sur le chantier.$$, $$Vos devis, factures et plannings à jour sur tous vos appareils, en temps réel.$$,
$$Vous commencez un devis au bureau, vous le terminez depuis le chantier sur votre téléphone — sans rien perdre, sans rien ressaisir. 📱💻

Cantia synchronise vos données en temps réel entre ordinateur et mobile. Le bureau et le terrain travaillent enfin sur la même version.

👉 cantia.ch

#MultiAppareils #GestionChantier #BTP #Suisse #Cantia$$,
$$La rupture entre les outils du bureau et ceux du terrain reste un point de friction classique dans le bâtiment : un fichier modifié sur ordinateur, une version différente consultée depuis le chantier.

Cantia fonctionne nativement sur ordinateur, tablette et smartphone, avec une synchronisation en temps réel — un devis modifié au bureau est immédiatement visible sur le chantier, et inversement.

Une seule source de vérité, quel que soit l'appareil utilisé.

Découvrez Cantia sur cantia.ch.

#DigitalisationBTP #ConstructionSuisse #ExpérienceUtilisateur #Cantia$$,
'pret', 'multiDevice');
