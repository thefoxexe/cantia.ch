-- Second batch of ready-to-publish social posts, covering features not
-- yet represented in the first 8 (20260917100000): planning, sous-
-- traitants, trésorerie, portail client, fil de chantier, import de
-- données, personnalisation des documents, multi-langue, paie étendue,
-- invitation d'équipe, réconciliation bancaire, météo/dashboard.

insert into public.social_posts (order_index, topic, headline, subheadline, instagram_caption, linkedin_caption, status, scene) values

(9, $$Planning de chantier$$, $$Qui est où.\nEn un coup d'œil.$$, $$Le planning de toute l'équipe, chantier par chantier.$$,
$$Fini les plannings sur papier ou dans la tête du patron. 📅

Avec Cantia, chaque membre de l'équipe voit où il doit être, sur quel chantier, quel jour. Un imprévu ? Le planning se met à jour pour tout le monde en même temps.

Zéro double-réservation, zéro chantier oublié. 🛠️

👉 Essai gratuit 14 jours, lien en bio.

#PlanningChantier #GestionEquipe #ArtisanSuisse #BTP #Cantia$$,
$$La planification des équipes reste souvent gérée de façon informelle dans les PME du bâtiment — un tableau, un groupe WhatsApp, la mémoire du patron.

Cantia centralise le planning de chantier : qui travaille où, quand, sur quel projet. Toute modification est visible immédiatement par l'ensemble de l'équipe, sur le terrain comme au bureau.

Le résultat : moins de conflits d'affectation, une meilleure visibilité sur la charge de chaque collaborateur, et un vrai gain de coordination pour les entreprises à plusieurs chantiers simultanés.

Découvrez le planning Cantia sur cantia.ch.

#Planification #GestionDeChantier #ConstructionSuisse #PME #Cantia$$,
'pret', 'chantier'),

(10, $$Sous-traitants$$, $$Vos sous-traitants.\nDans le même outil.$$, $$Contacts, documents et chantiers partagés, centralisés.$$,
$$Vous travaillez avec des sous-traitants sur chaque chantier ? Cantia centralise leurs coordonnées, leurs documents et les chantiers sur lesquels ils interviennent. 🤝

Plus besoin de fouiller les e-mails pour retrouver un contact ou une attestation. Tout est au même endroit, lié au bon chantier.

👉 cantia.ch

#SousTraitants #GestionChantier #BTP #Suisse #Cantia$$,
$$La coordination avec les sous-traitants est un point de friction récurrent pour les entreprises générales et les corps de métier qui font appel à des partenaires externes : coordonnées éparpillées, documents perdus, pas de vision claire de qui intervient où.

Cantia permet de centraliser les sous-traitants comme les autres contacts de l'entreprise, avec leurs documents et leur historique d'intervention par chantier — pour une traçabilité complète, sans outil supplémentaire.

Plus d'informations sur cantia.ch.

#SousTraitants #ConstructionSuisse #GestionDeChantier #PME #Cantia$$,
'pret', 'equipe'),

(11, $$Trésorerie & dépenses récurrentes$$, $$Votre trésorerie.\nSans surprise.$$, $$Dépenses récurrentes suivies, alertes avant échéance.$$,
$$Loyer, leasing, assurances, abonnements... Cantia suit vos dépenses récurrentes et vous alerte avant chaque échéance. 💰

Vous voyez d'un coup d'œil ce qui rentre, ce qui sort, et ce qu'il vous reste. Plus de mauvaise surprise en fin de mois.

👉 cantia.ch

#Tresorerie #GestionFinanciere #PME #Suisse #Artisan #Cantia$$,
$$La visibilité sur la trésorerie est un point faible fréquent des PME du bâtiment, où les dépenses récurrentes (loyers, leasings, assurances, abonnements) sont souvent suivies de façon dispersée, quand elles le sont.

Cantia centralise ces dépenses récurrentes et alerte avant chaque échéance, en complément du suivi des paiements clients déjà intégré à la facturation — pour une vision de trésorerie complète, sans tableur séparé.

En savoir plus sur cantia.ch.

#Trésorerie #PilotageFinancier #ConstructionSuisse #PME #Cantia$$,
'pret', 'rentabilite'),

(12, $$Portail client sécurisé$$, $$Vos clients.\nEn toute confiance.$$, $$Devis et factures consultés, acceptés et signés en ligne.$$,
$$Vos clients consultent leurs devis et factures depuis un portail sécurisé, accessible avec un code de vérification. 🔒

Ils acceptent et signent en ligne, vous êtes notifié immédiatement. Une image professionnelle, sans échange de PDF par e-mail.

👉 cantia.ch

#PortailClient #DevisEnLigne #BTP #Suisse #Cantia$$,
$$L'expérience client est aussi un vecteur de professionnalisme pour une entreprise du bâtiment — et l'échange de devis par pièce jointe e-mail en est souvent le maillon faible.

Cantia met à disposition un portail client sécurisé (vérification en deux étapes) où le client consulte, accepte et signe ses devis et factures en ligne. L'entreprise est notifiée en temps réel de chaque action.

Le résultat : un parcours client plus fluide et une image plus professionnelle, sans changer d'outil.

Découvrez le portail client sur cantia.ch.

#ExperienceClient #DigitalisationBTP #ConstructionSuisse #Cantia$$,
'pret', 'signature'),

(13, $$Fil de chantier$$, $$Toute l'équipe.\nAu même endroit.$$, $$Messages, photos et documents par chantier, sans spam.$$,
$$Chaque chantier a son propre fil de discussion : messages, photos, documents, partagés avec l'équipe concernée. 💬

Et pour ne pas vous noyer sous les notifications, Cantia ne vous alerte pas à chaque message : un simple badge indique les chantiers avec du nouveau, à consulter quand vous voulez.

👉 cantia.ch

#CommunicationChantier #GestionEquipe #BTP #Cantia$$,
$$La communication d'équipe autour d'un chantier finit souvent éclatée entre SMS, WhatsApp et appels — avec le risque de perdre une information importante.

Cantia propose un fil de discussion propre à chaque chantier, avec photos et documents partagés. Volontairement, aucune notification push n'est envoyée à chaque message : un badge sur le chantier concerné suffit à savoir où il y a du nouveau, sans saturer l'attention de l'équipe.

Plus d'informations sur cantia.ch.

#GestionDeChantier #ConstructionSuisse #ProductivitéÉquipe #Cantia$$,
'pret', 'chantier'),

(14, $$Import de données$$, $$Vos anciennes données.\nEn quelques minutes.$$, $$Clients, devis et factures importés depuis Excel.$$,
$$Vous changez d'outil et vous avez peur de tout perdre ? Cantia importe vos clients, devis et factures directement depuis un fichier Excel ou CSV. 📊

Pas besoin de tout ressaisir à la main. Vos données historiques sont là dès le premier jour.

👉 cantia.ch

#MigrationDeDonnees #ChangementDoutil #PME #Suisse #Cantia$$,
$$La peur de perdre son historique client et sa comptabilité est l'un des principaux freins au changement d'outil pour une PME.

Cantia propose un import direct des données existantes (clients, devis, factures) depuis un fichier Excel ou CSV, pour démarrer avec son historique complet plutôt que repartir de zéro.

Un point de friction en moins dans la décision de migrer vers un nouvel outil de gestion.

Découvrez l'import de données sur cantia.ch.

#DigitalisationBTP #MigrationDeDonnées #ConstructionSuisse #Cantia$$,
'pret', 'facture'),

(15, $$Personnalisation des documents$$, $$Vos devis.\nÀ vos couleurs.$$, $$Logo et couleur de marque sur chaque document.$$,
$$Vos devis et factures portent votre logo et vos couleurs, pas celles de Cantia. 🎨

Une mise en page professionnelle, personnalisée à l'image de votre entreprise, générée automatiquement à chaque document.

👉 cantia.ch

#Branding #DevisPro #ArtisanSuisse #BTP #Cantia$$,
$$L'image de marque ne s'arrête pas au logo sur le camion — elle se joue aussi sur chaque document envoyé au client.

Cantia permet de personnaliser ses devis, factures et rapports avec son propre logo et sa couleur de marque, appliqués automatiquement à chaque document généré, sans mise en page manuelle.

Un détail qui contribue à l'image professionnelle perçue par le client final.

En savoir plus sur cantia.ch.

#IdentitéDeMarque #ConstructionSuisse #PME #Cantia$$,
'pret', 'facture'),

(16, $$Trois langues, un seul outil$$, $$Français, allemand, italien.\nUn seul Cantia.$$, $$Toute l'application disponible dans les trois langues nationales.$$,
$$Cantia parle français, allemand et italien — comme la Suisse. 🇨🇭

Chaque utilisateur choisit sa langue, l'équipe travaille dans le même outil, quelle que soit la région.

👉 cantia.ch

#Suisse #Multilingue #BTP #PME #Cantia$$,
$$Une entreprise du bâtiment suisse travaille rarement dans une seule langue — que ce soit avec des équipes multilingues ou des clients dans plusieurs régions du pays.

Cantia est disponible intégralement en français, allemand et italien : chaque utilisateur choisit sa langue d'interface indépendamment, sans que cela ne fragmente les données ou les documents de l'entreprise.

Pensé pour la réalité plurilingue du marché suisse de la construction.

Découvrez Cantia sur cantia.ch.

#ConstructionSuisse #Multilingue #DigitalisationBTP #Cantia$$,
'pret', 'essai'),

(17, $$Paie étendue$$, $$13e salaire, heures sup, vacances.\nCalculés seuls.$$, $$La paie suisse dans tous ses détails, sans tableur.$$,
$$13e salaire, heures supplémentaires, indemnités vacances, avances sur salaire... Cantia calcule tout, automatiquement, en conformité avec les normes suisses. 🇨🇭

Fini les tableurs Excel maison qu'on n'ose plus toucher de peur de casser une formule.

👉 cantia.ch

#PaieSuisse #RH #BTP #PME #Cantia$$,
$$Au-delà du calcul de base, la paie suisse comporte de nombreux cas particuliers : 13e salaire, heures supplémentaires, indemnités vacances, avances, corrections rétroactives.

Cantia gère nativement ces rubriques de salaire étendues, avec la préparation des déclarations sociales annuelles — remplaçant les tableurs artisanaux qui accumulent les risques d'erreur au fil des années.

Plus d'informations sur le module RH & Salaires sur cantia.ch.

#PaieSuisse #RH #ConstructionSuisse #PME #Cantia$$,
'pret', 'equipe'),

(18, $$Invitation d'équipe$$, $$Un e-mail.\nUn nouveau membre.$$, $$Invitez votre équipe par e-mail, en quelques secondes.$$,
$$Besoin d'ajouter un membre à l'équipe ? Entrez son e-mail, cliquez sur envoyer — Cantia s'occupe du reste. ✉️

Plus besoin de partager un lien sur WhatsApp ou de tout configurer vous-même. La personne reçoit une invitation claire et rejoint l'entreprise en un clic.

👉 cantia.ch

#GestionEquipe #Onboarding #BTP #Suisse #Cantia$$,
$$L'ajout d'un nouveau collaborateur à l'outil de gestion de l'entreprise ne devrait pas être une tâche administrative en soi.

Depuis les paramètres d'équipe, Cantia permet d'envoyer une invitation directement par e-mail : la personne reçoit un message professionnel avec un lien direct pour rejoindre l'organisation, sans manipulation côté administrateur.

En savoir plus sur cantia.ch.

#GestionEquipe #DigitalisationBTP #ConstructionSuisse #Cantia$$,
'pret', 'equipe'),

(19, $$Réconciliation bancaire$$, $$Vos paiements.\nRapprochés seuls.$$, $$Le relevé bancaire rapproché automatiquement de vos factures.$$,
$$Importez votre relevé bancaire, Cantia rapproche automatiquement chaque paiement de la bonne facture. 🏦

Plus besoin de pointer ligne par ligne à la main. Vous voyez immédiatement ce qui est payé et ce qui reste en attente.

👉 cantia.ch

#ReconciliationBancaire #Comptabilite #PME #Suisse #Cantia$$,
$$Le rapprochement manuel entre les paiements reçus et les factures émises est une tâche répétitive à faible valeur ajoutée, mais nécessaire à une comptabilité fiable.

Cantia importe les relevés bancaires (format CAMT) et rapproche automatiquement chaque paiement de la facture correspondante, avec des règles automatiques configurables pour les cas récurrents.

Un gain de temps direct pour la gestion comptable des PME du bâtiment.

Découvrez la réconciliation bancaire sur cantia.ch.

#Comptabilité #Fintech #ConstructionSuisse #PME #Cantia$$,
'pret', 'rentabilite'),

(20, $$Tableau de bord chantier$$, $$Votre journée.\nEn un écran.$$, $$Météo, chantiers du jour, raccourcis essentiels au démarrage.$$,
$$Le matin, un seul écran pour tout voir : la météo du jour, vos chantiers en cours, vos raccourcis essentiels. ☀️🌧️

Cantia vous montre ce qui compte pour démarrer la journée, sans naviguer dans dix menus différents.

👉 cantia.ch

#TableauDeBord #GestionChantier #ArtisanSuisse #Cantia$$,
$$Un tableau de bord utile est un tableau de bord qui répond à la question du matin : "qu'est-ce qui compte aujourd'hui ?"

Le dashboard Cantia réunit la météo du jour (utile pour planifier les travaux extérieurs), les chantiers en cours et les raccourcis vers les actions les plus fréquentes — pensé pour être consulté en quelques secondes, pas exploré.

Découvrez Cantia sur cantia.ch.

#ExpérienceUtilisateur #ConstructionSuisse #GestionDeChantier #Cantia$$,
'pret', 'chantier');
