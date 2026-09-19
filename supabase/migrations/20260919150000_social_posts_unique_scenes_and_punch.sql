alter table public.social_posts drop constraint social_posts_scene_check;

alter table public.social_posts
  add constraint social_posts_scene_check
  check (scene in (
    'devis', 'chantier', 'facture', 'equipe', 'rentabilite', 'signature', 'essai',
    'planning', 'tresorerie', 'sousTraitants', 'rapportChantier', 'situations',
    'donneesImport', 'dashboard', 'meteo', 'support', 'multiDevice',
    'paieEtendue', 'invitationEquipe', 'personnalisationDocuments', 'portailClient',
    'troisLangues', 'reconciliationBancaire', 'avantApres', 'statShock'
  ));

update public.social_posts set
  scene = 'devis', stat_value = '3 min', stat_label = 'pour un devis complet, TVA incluse',
  headline = $$3 minutes.\nUn devis complet.$$,
  subheadline = $$Dictez sur le chantier, Cantia rédige, calcule et met en page.$$,
  instagram_caption = $$Un devis en 3 minutes. Pas en 30. 🎙️

Vous dictez vos lignes à voix haute — sur le chantier, dans la camionnette, où vous voulez. Cantia rédige, calcule la TVA et met en page. Prêt à envoyer.

Votre métier, c'est le chantier. Pas la paperasse le soir sur la table de la cuisine. 🛠️

👉 Essai gratuit 14 jours, lien en bio.

#ArtisanSuisse #BTP #GestionChantier #Devis #Entrepreneur #ConstructionSuisse #Cantia$$,
  linkedin_caption = $$Un devis correctement chiffré prend en moyenne 20 à 30 minutes à rédiger le soir, après une journée de chantier. C'est l'un des premiers freins à la croissance des PME du bâtiment.

Avec la dictée vocale intégrée à Cantia, cette tâche descend à 3 minutes — directement depuis le terrain, sans reprendre une seule ligne au bureau.

Multiplié sur chaque devis de l'année, ce gain de temps se voit directement sur la rentabilité de l'entreprise.

Essayez la dictée vocale sur cantia.ch.

#DigitalisationBTP #PME #ConstructionSuisse #Productivité #Cantia$$
where topic = $$Devis à la voix$$;

update public.social_posts set
  scene = 'facture', stat_value = '0', stat_label = 'erreur d''IBAN ou de référence',
  headline = $$La QR-facture.\nZéro erreur.$$,
  instagram_caption = $$Une QR-facture fausse, c'est un paiement qui n'arrive jamais. ❌

Cantia génère automatiquement une QR-facture conforme à chaque facture : IBAN, référence structurée, montant — zéro ressaisie, zéro erreur.

💳 Suivi des paiements en temps réel, relances en un clic.

👉 cantia.ch

#Facturation #QRFacture #Suisse #PME #Artisan #Bâtiment #Cantia$$,
  linkedin_caption = $$La QR-facture est le standard suisse — et pourtant, elle reste une source d'erreurs et de temps perdu pour beaucoup de PME du bâtiment : IBAN à ressaisir, référence à vérifier, montant à recopier.

Cantia génère automatiquement une QR-facture conforme à chaque facture émise, avec rapprochement automatique dès réception du paiement.

Résultat : moins d'erreurs, une trésorerie suivie en temps réel, et des relances envoyées avant que l'impayé ne devienne un problème.

En savoir plus sur cantia.ch.

#Facturation #Fintech #ConstructionSuisse #Trésorerie #Cantia$$
where topic = $$Facturation & QR-facture$$;

update public.social_posts set
  scene = 'rapportChantier', stat_value = '1/jour', stat_label = 'rapport généré sans y penser',
  headline = $$Le rapport de chantier.\nGénéré tout seul.$$,
  instagram_caption = $$Et si le rapport de chantier s'écrivait tout seul ? 📸

Chaque jour, un rapport généré automatiquement : photos horodatées, notes vocales, météo, avancement — pendant que vous travaillez, pas le soir.

En cas de litige ? Chaque photo est datée et géolocalisée. Une vraie protection juridique. 🛡️

👉 cantia.ch

#ChantierBTP #RapportChantier #ArtisanSuisse #Construction #Cantia$$,
  linkedin_caption = $$Un rapport de chantier bien tenu est autant un outil de pilotage qu'une protection juridique en cas de litige.

Cantia génère automatiquement un rapport quotidien à partir de ce qui est déjà capturé sur le terrain — photos horodatées et géolocalisées, notes vocales, conditions météo — sans charge de saisie supplémentaire pour les équipes.

Le résultat est un document PDF structuré, à l'image de votre entreprise, disponible pour le client ou l'assurance en un clic.

Découvrez la fonctionnalité sur cantia.ch.

#GestionDeChantier #ConstructionSuisse #Conformité #Cantia$$
where topic = $$Rapports de chantier$$;

update public.social_posts set
  scene = 'equipe', stat_value = '0', stat_label = 'tableur Excel fait maison',
  headline = $$La paie suisse.\nSans le tableur maison.$$,
  instagram_caption = $$Le tableur Excel de la paie que personne n'ose plus toucher ? Cantia le remplace. 📱

Vos équipes pointent leurs heures par chantier depuis leur téléphone. Le salaire se calcule automatiquement — du brut au net, conforme aux normes suisses.

👷 Plus de temps pour vos équipes, moins pour la paperasse.

👉 cantia.ch

#RH #Paie #BTP #Suisse #GestionEquipe #Cantia$$,
  linkedin_caption = $$La gestion de la paie reste l'une des tâches administratives les plus chronophages — et les plus sensibles aux erreurs — pour une PME du bâtiment suisse.

Avec Cantia, les heures sont saisies par chantier directement par les équipes sur le terrain, et le calcul de salaire — du brut au net — se fait automatiquement, en conformité avec les normes suisses.

Les droits d'accès sont clairs : un employé ne voit que ses propres heures, jamais les salaires de l'équipe.

Découvrez notre module RH sur cantia.ch.

#RH #PaieSuisse #ConstructionSuisse #PME #Cantia$$
where topic = $$RH & salaires$$;

update public.social_posts set
  scene = 'rentabilite', stat_value = '+18%', stat_label = 'de marge visible en temps réel',
  headline = $$La marge.\nVisible en temps réel.$$,
  instagram_caption = $$Ce chantier est-il vraiment rentable ? Avec Cantia, la réponse est sous vos yeux — pas seulement à la clôture. 📊

Devis accepté vs coût réel (matériel + main d'œuvre), marge en CHF et en %.

Repérez un chantier qui dérape avant qu'il ne soit trop tard. 🚩

👉 cantia.ch

#Rentabilité #GestionChantier #BTP #Suisse #Entrepreneur #Cantia$$
where topic = $$Rentabilité par chantier$$;

update public.social_posts set
  scene = 'situations', stat_value = '100%', stat_label = 'facturé, rien d''oublié',
  headline = $$Facturer à l'avancement.\nSans rien oublier.$$,
  instagram_caption = $$Un poste facturé deux fois, un autre jamais ? Ça n'arrive plus. 🏗️

Cantia génère vos situations de chantier automatiquement, poste par poste, en suivant précisément ce qui a déjà été facturé et ce qu'il reste à venir.

👉 cantia.ch

#SituationDeChantier #GrosOeuvre #BTP #Suisse #Cantia$$
where topic = $$Situations de chantier$$;

update public.social_posts set
  scene = 'signature', stat_value = '30 sec', stat_label = 'pour signer un imprévu sur le chantier',
  headline = $$Signé sur place.\nFacturable tout de suite.$$,
  instagram_caption = $$Un imprévu sur le chantier ? Signé en 30 secondes, sur tablette. ✍️

Plus de bon de commande papier perdu, plus de « on verra plus tard ». La signature électronique a la même valeur légale, et tout est tracé dans Cantia.

👉 cantia.ch

#SignatureElectronique #TravauxSupplementaires #BTP #Cantia$$
where topic = $$Signature électronique$$;

update public.social_posts set
  scene = 'essai', badge = 'SANS CARTE BANCAIRE',
  instagram_caption = $$Une seule plateforme pour vous laisser du temps pour le chantier. 🇨🇭🏔️

Devis, factures, chantiers, équipes — tout au même endroit, pensé pour les métiers du bâtiment suisse.

14 jours d'essai gratuit, sans carte bancaire. 👉 cantia.ch

#Cantia #BTP #ArtisanSuisse #ConstructionSuisse #PME #GestionChantier$$
where topic = $$Marque / confiance$$;

update public.social_posts set
  scene = 'planning', stat_value = '0', stat_label = 'double réservation d''équipe',
  instagram_caption = $$Un chantier oublié, deux équipes sur le même projet ? Plus jamais. 📅

Le planning de toute l'équipe, chantier par chantier. Un imprévu ? Il se met à jour pour tout le monde, en même temps.

🛠️

👉 Essai gratuit 14 jours, lien en bio.

#PlanningChantier #GestionEquipe #ArtisanSuisse #BTP #Cantia$$
where topic = $$Planning de chantier$$;

update public.social_posts set
  scene = 'sousTraitants', stat_value = '1', stat_label = 'outil pour toute l''équipe, sous-traitants inclus',
  headline = $$Vos sous-traitants.\nAu même endroit.$$,
  instagram_caption = $$Fini les coordonnées perdues dans les e-mails. 🤝

Cantia centralise vos sous-traitants comme vos contacts internes : coordonnées, documents et chantiers partagés, liés au bon projet.

👉 cantia.ch

#SousTraitants #GestionChantier #BTP #Suisse #Cantia$$
where topic = $$Sous-traitants$$;

update public.social_posts set
  scene = 'tresorerie', stat_value = '90 j', stat_label = 'de trésorerie prévisionnelle',
  headline = $$Votre trésorerie.\n90 jours à l'avance.$$,
  instagram_caption = $$Une mauvaise surprise en fin de mois ? Plus avec 90 jours de visibilité. 💰

Loyer, leasing, assurances, abonnements... Cantia suit vos dépenses récurrentes et vous alerte avant chaque échéance.

👉 cantia.ch

#Tresorerie #GestionFinanciere #PME #Suisse #Artisan #Cantia$$
where topic = $$Trésorerie & dépenses récurrentes$$;

update public.social_posts set
  scene = 'portailClient', badge = '100% SÉCURISÉ',
  instagram_caption = $$Un devis envoyé par e-mail, c'est un devis qui se perd. 🔒

Vos clients consultent, acceptent et signent leurs devis et factures depuis un portail sécurisé, avec code de vérification. Vous êtes notifié immédiatement.

👉 cantia.ch

#PortailClient #DevisEnLigne #BTP #Suisse #Cantia$$
where topic = $$Portail client sécurisé$$;

update public.social_posts set
  scene = 'support', stat_value = '0', stat_label = 'notification inutile',
  headline = $$Toute l'équipe.\nSans le bruit.$$
where topic = $$Fil de chantier$$;

update public.social_posts set
  scene = 'donneesImport', stat_value = '0', stat_label = 'ressaisie manuelle',
  headline = $$Vos données.\nImportées, pas ressaisies.$$,
  instagram_caption = $$Changer d'outil sans tout perdre ni tout retaper ? C'est possible. 📊

Cantia importe vos clients, devis et factures directement depuis un fichier Excel ou CSV. Vos données historiques sont là dès le premier jour.

👉 cantia.ch

#MigrationDeDonnees #ChangementDoutil #PME #Suisse #Cantia$$
where topic = $$Import de données$$;

update public.social_posts set
  scene = 'personnalisationDocuments', badge = 'VOTRE MARQUE',
  instagram_caption = $$Vos devis et factures portent votre logo, pas le nôtre. 🎨

Mise en page professionnelle, personnalisée à l'image de votre entreprise, générée automatiquement à chaque document.

👉 cantia.ch

#Branding #DevisPro #ArtisanSuisse #BTP #Cantia$$
where topic = $$Personnalisation des documents$$;

update public.social_posts set
  scene = 'troisLangues', badge = 'FR · DE · IT'
where topic = $$Trois langues, un seul outil$$;

update public.social_posts set
  scene = 'paieEtendue', stat_value = '13e', stat_label = 'salaire calculé sans y penser',
  headline = $$13e, heures sup, vacances.\nCalculés seuls.$$
where topic = $$Paie étendue$$;

update public.social_posts set
  scene = 'invitationEquipe', stat_value = '30 sec', stat_label = 'pour ajouter un collaborateur',
  headline = $$Un e-mail.\n30 secondes.$$,
  instagram_caption = $$Ajouter un membre à l'équipe en 30 secondes ? Un e-mail suffit. ✉️

Entrez son adresse, cliquez sur envoyer — Cantia s'occupe du reste. La personne reçoit une invitation claire et rejoint l'entreprise en un clic.

👉 cantia.ch

#GestionEquipe #Onboarding #BTP #Suisse #Cantia$$
where topic = $$Invitation d'équipe$$;

update public.social_posts set
  scene = 'reconciliationBancaire', stat_value = '0', stat_label = 'ligne pointée à la main',
  instagram_caption = $$Pointer chaque ligne du relevé bancaire à la main ? Plus jamais. 🏦

Importez votre relevé, Cantia rapproche automatiquement chaque paiement de la bonne facture. Vous voyez immédiatement ce qui est payé, ce qui reste en attente.

👉 cantia.ch

#ReconciliationBancaire #Comptabilite #PME #Suisse #Cantia$$
where topic = $$Réconciliation bancaire$$;

update public.social_posts set
  scene = 'meteo', stat_value = '1', stat_label = 'écran pour démarrer la journée',
  instagram_caption = $$La météo, vos chantiers, vos raccourcis — un seul écran le matin. ☀️🌧️

Cantia vous montre ce qui compte pour démarrer la journée, sans naviguer dans dix menus différents.

👉 cantia.ch

#TableauDeBord #GestionChantier #ArtisanSuisse #Cantia$$
where topic = $$Tableau de bord chantier$$;

update public.social_posts set
  stat_value = '4', stat_label = 'indicateurs clés, un seul écran',
  instagram_caption = $$Cinq écrans pour savoir où vous en êtes ? Plus besoin. 📊

Devis actifs, chantiers en cours, chiffre d'affaires du mois et marge — un seul tableau de bord, mis à jour en temps réel.

Vous pilotez votre entreprise, pas des tableurs. 🛠️

👉 Essai gratuit 14 jours, lien en bio.

#TableauDeBord #GestionEntreprise #ArtisanSuisse #BTP #PME #Cantia$$
where topic = $$Vue d'ensemble de l'activité$$;

update public.social_posts set
  badge = 'TEMPS RÉEL'
where topic = $$Bureau et chantier, synchronisés$$;

insert into public.social_posts (order_index, topic, headline, subheadline, instagram_caption, linkedin_caption, status, scene, stat_value, stat_label) values

(23, $$Un seul outil, pas dix Excel$$, $$Un outil.\nZéro Excel.$$, $$Devis, factures, planning, paie, trésorerie — un seul endroit, pas dix fichiers.$$,
$$Un Excel pour les devis, un pour la paie, un pour la trésorerie, un pour le planning... et personne ne se souvient lequel est à jour. 😮‍💨

Cantia remplace tout ça par un seul outil. Une seule source de vérité, pour toute l'entreprise.

👉 Essai gratuit 14 jours, lien en bio.

#GestionEntreprise #BTP #ArtisanSuisse #Excel #Cantia$$,
$$Beaucoup de PME du bâtiment pilotent encore leur activité avec une collection de fichiers Excel — un pour les devis, un pour la paie, un pour la trésorerie — maintenus par une seule personne, difficiles à croiser, et fragiles au moindre changement de formule.

Cantia centralise devis, factures, chantiers, équipes, paie et trésorerie dans un seul outil, avec des données qui se recoupent automatiquement d'un module à l'autre.

Le résultat : une seule source de vérité pour l'entreprise, plutôt qu'une collection de fichiers à synchroniser à la main.

Découvrez Cantia sur cantia.ch.

#DigitalisationBTP #ConstructionSuisse #PME #Cantia$$,
'pret', 'avantApres', '1', 'outil, plus de dix Excel à jongler'),

(24, $$Le temps que vous récupérez$$, $$Jusqu'à 20h.\nRécupérées chaque mois.$$, $$Le temps que la dictée vocale, la QR-facture et la paie automatique peuvent vous rendre.$$,
$$Et si vous récupériez jusqu'à 20 heures par mois sur l'administratif ? ⏱️

Devis dictés à la voix, QR-facture générée automatiquement, paie calculée seule — additionnés sur un mois, ces gains de temps parlent d'eux-mêmes.

Ce temps retourne au chantier. Pas à la paperasse.

👉 Essai gratuit 14 jours, lien en bio.

#ArtisanSuisse #BTP #Productivité #GestionChantier #Cantia$$,
$$Le temps administratif reste l'un des coûts les plus invisibles pour une PME du bâtiment : devis rédigés le soir, factures vérifiées trois fois, heures ressaisies dans un tableur.

En automatisant la rédaction des devis (dictée vocale), la génération de la QR-facture et le calcul de la paie, Cantia peut faire gagner jusqu'à 20 heures par mois à une entreprise du bâtiment — un temps qui retourne au chantier plutôt qu'à l'administratif.

Découvrez comment sur cantia.ch.

#DigitalisationBTP #ConstructionSuisse #PME #ProductivitéBTP #Cantia$$,
'pret', 'statShock', '20h/mois', 'récupérables sur l''administratif');
