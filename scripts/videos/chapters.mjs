// The 41 tutorial videos (Super Admin › Tutoriels, table tutorial_chapters):
// for each one, three steps shown with a real screen of the demo
// (marketing/videos/screens) and a caption, without voice.
//
// Step fields:
//   t     caption (short, read in 4 s on a reel)
//   d     second line, YouTube only
//   s     screen for both formats (marketing/videos/screens/{desk|phone}-<s>.jpg)
//   ds/ps screen for the computer / the phone only (overrides s; null = card)
//   card  shown when there is no screen: { label, path } — used where the
//         demo has nothing to show (empty module), never a mock-up.
//
// Captions only say what the product does (public descriptions of the
// chapters and what the screens show).
export const CHAPTERS = [
  {
    n: 1, area: 'Démarrage', title: 'Créer son compte Cantia et démarrer en 5 minutes', slug: 'creer-son-compte',
    steps: [
      { t: 'Inscrivez-vous avec votre e-mail', d: 'Un code arrive par e-mail pour confirmer l’adresse.', card: { label: 'Inscription', path: 'cantia.ch › Essayer Cantia' } },
      { t: 'Créez votre entreprise, ou rejoignez votre équipe', d: 'Pour rejoindre une équipe, le lien d’invitation suffit.', card: { label: 'Rejoindre une équipe', path: 'Lien envoyé par votre administrateur' } },
      { t: 'Votre tableau de bord est prêt', d: 'Chantiers en cours, planning, tâches et l’équipe du jour.', s: 'home' },
    ],
  },
  {
    n: 2, area: 'Démarrage', title: 'Installer Cantia sur son téléphone, iPhone ou Android', slug: 'installer-sur-telephone',
    steps: [
      { t: 'Ouvrez cantia.ch dans votre navigateur', d: 'Safari sur iPhone, Chrome sur Android.', s: 'installer' },
      { t: 'Ajoutez Cantia à l’écran d’accueil', d: 'Sur iPhone : Partager, puis « Sur l’écran d’accueil ».', s: 'installer' },
      { t: 'Cantia s’ouvre comme une application', d: 'En plein écran, depuis son icône.', s: 'home' },
    ],
  },
  {
    n: 3, area: 'Démarrage', title: 'Reprendre ses clients et ses devis depuis Excel ou un ancien logiciel', slug: 'importer-ses-donnees',
    steps: [
      { t: 'Exportez vos données de l’ancien logiciel', d: 'Un fichier Excel ou CSV suffit.', s: 'compte_import' },
      { t: 'Choisissez ce que vous importez', d: 'Clients, chantiers, devis, factures ou dépenses.', s: 'compte_import' },
      { t: 'Vérifiez les colonnes, puis validez', d: 'Chaque colonne de votre fichier va dans le bon champ.', s: 'compte_import' },
    ],
  },
  {
    n: 4, area: 'Démarrage', title: 'Des devis et factures à votre image : logo, signature, numérotation', slug: 'logo-signature-numerotation',
    steps: [
      { t: 'Ajoutez votre logo et votre couleur', d: 'Sur vos devis, factures et rapports PDF.', s: 'compte_apparence' },
      { t: 'L’adresse du client à gauche ou à droite', d: 'À droite, elle tombe dans la fenêtre de l’enveloppe.', s: 'compte_apparence' },
      { t: 'Réglez la TVA, la validité et les mentions', d: 'Ils sont repris dans chaque nouveau document.', s: 'compte_devis' },
    ],
  },
  {
    n: 5, area: 'Devis', title: 'Créer un devis à la voix, sur le chantier', slug: 'devis-a-la-voix',
    steps: [
      { t: 'Créez un nouveau devis', d: 'Choisissez le client et, si besoin, le chantier.', s: 'devis_new' },
      { t: 'Dictez les positions', d: 'Parlez comme à un collègue, Cantia écrit les lignes.', s: 'devis_new' },
      { t: 'Quantités, unités et prix sont en place', d: 'Le total et la TVA sont calculés. Il reste à vérifier.', s: 'devis_d1' },
    ],
  },
  {
    n: 6, area: 'Devis', title: 'Le catalogue : vos prix proposés tout seuls dans chaque devis', slug: 'catalogue-des-prix',
    steps: [
      { t: 'Vos prix restent dans le catalogue', d: 'Chaque prestation déjà utilisée est gardée.', card: { label: 'Catalogue', path: 'Menu › Catalogue' } },
      { t: 'Ils sont proposés quand vous écrivez une ligne', d: 'Plus besoin de rechercher le prix d’un ancien devis.', s: 'devis_new' },
      { t: 'Ajoutez des articles ou importez votre liste', d: 'Votre liste de prix en CSV.', card: { label: 'Import CSV', path: 'Catalogue › Actions' } },
    ],
  },
  {
    n: 7, area: 'Devis', title: 'Des trames de devis pour ne plus repartir de zéro', slug: 'trames-de-devis',
    steps: [
      { t: 'Enregistrez un devis type', d: 'Ses positions et ses textes deviennent un modèle.', s: 'devis_d1' },
      { t: 'Vos modèles sont rangés au même endroit', d: 'Devis › Modèles de devis.', ds: 'devis_trames', ps: null, card: { label: 'Modèles de devis', path: 'Devis › Modèles' } },
      { t: 'Repartez d’un modèle pour le suivant', d: '« Utiliser un modèle » à la création, puis ajustez.', s: 'devis_new' },
    ],
  },
  {
    n: 8, area: 'Devis', title: 'Envoyer un devis et le faire signer en ligne', slug: 'envoyer-et-faire-signer',
    steps: [
      { t: 'Envoyez le devis par e-mail', d: 'Votre client reçoit un lien vers son devis.', s: 'devis_d1' },
      { t: 'Votre client le signe en ligne', d: 'Sans créer de compte, sur son téléphone ou son ordinateur.', card: { label: 'Signature en ligne', path: 'Depuis le lien reçu par e-mail' } },
      { t: 'Le statut passe à « Accepté »', d: 'Vous voyez tout de suite quand le devis est signé.', s: 'devis_d9' },
    ],
  },
  {
    n: 9, area: 'Devis', title: 'Relancer automatiquement un devis resté sans réponse', slug: 'relances-automatiques',
    steps: [
      { t: 'Ouvrez les relances automatiques', d: 'Réglages des e-mails. Incluses dans le plan Entreprise.', s: 'emails_relances' },
      { t: 'Les devis sans réponse sont relancés', d: 'Tout s’arrête dès que le client répond, signe ou refuse.', s: 'emails_relances' },
      { t: 'Vos textes, écrits une seule fois', d: 'Le nom du client et le numéro se remplissent tout seuls.', s: 'emails_modeles' },
    ],
  },
  {
    n: 10, area: 'Devis', title: 'Transformer un devis accepté en facture, sans rien ressaisir', slug: 'devis-en-facture',
    steps: [
      { t: 'Ouvrez le devis signé', d: 'Il est marqué « Accepté ».', s: 'devis_d9' },
      { t: 'Créez la facture en un clic', d: 'Toutes les lignes du devis sont reprises.', s: 'devis_factures_f1' },
      { t: 'Envoyez-la', d: 'Par e-mail, ou en PDF à imprimer.', s: 'devis_factures_f1' },
    ],
  },
  {
    n: 11, area: 'Devis', title: 'Remplir une soumission reçue et renvoyer le PDF chiffré', slug: 'remplir-une-soumission',
    steps: [
      { t: 'Importez la soumission reçue', d: 'Le PDF de l’architecte ou du maître d’ouvrage.', s: 'soumissions' },
      { t: 'Mettez vos prix poste par poste', d: 'Chaque soumission est rangée avec son chantier.', s: 'soumissions' },
      { t: 'Renvoyez le PDF rempli', d: 'Le document d’origine, chiffré.', card: { label: 'PDF chiffré', path: 'Soumissions' } },
    ],
  },
  {
    n: 12, area: 'Facturation', title: 'Créer une facture avec QR-facture suisse', slug: 'facture-qr',
    steps: [
      { t: 'Créez une facture', d: 'Depuis un devis, ou directement.', s: 'devis_factures_new' },
      { t: 'Ajoutez les lignes', d: 'À la main, à la voix ou depuis un modèle.', s: 'devis_factures_new' },
      { t: 'La QR-facture est ajoutée', d: 'Le bulletin de paiement suisse, avec votre IBAN.', s: 'devis_factures_f1' },
    ],
  },
  {
    n: 13, area: 'Facturation', title: 'Facturer un acompte avant de démarrer un chantier', slug: 'facturer-un-acompte',
    steps: [
      { t: 'Partez du devis accepté', d: 'L’acompte se demande sur le devis.', s: 'devis_d9' },
      { t: 'Facturez l’acompte', d: 'Avant de commencer le chantier.', card: { label: 'Acompte', path: 'Sur le devis accepté' } },
      { t: 'Il est déduit de la facture finale', d: 'Tout seul, sans calcul à refaire.', card: { label: 'Facture finale', path: 'Acompte déduit' } },
    ],
  },
  {
    n: 14, area: 'Facturation', title: 'Facturer un chantier par étapes, avec les situations', slug: 'situations-de-chantier',
    steps: [
      { t: 'Ouvrez le chantier', d: 'Situations de chantier, dans ses outils.', s: 'chantiers_p1' },
      { t: 'Créez une situation', d: 'Pour un chantier facturé au fil de l’avancement.', ds: 'chantiers_p1_situations', ps: null, card: { label: 'Situations', path: 'Chantier › Situations de chantier' } },
      { t: 'Facturez l’avancement, poste par poste', d: 'Vous indiquez où en est chaque poste.', card: { label: 'Avancement', path: 'Poste par poste' } },
    ],
  },
  {
    n: 15, area: 'Facturation', title: 'Suivre ses paiements et relancer un impayé', slug: 'paiements-et-impayes',
    steps: [
      { t: 'Voyez où en est chaque facture', d: 'En retard, à encaisser, encaissée.', s: 'devis_factures' },
      { t: 'Enregistrez un paiement', d: 'Depuis la fiche de la facture.', s: 'devis_factures_f1' },
      { t: 'Relancez une facture en retard', d: 'L’échéance dépassée est signalée en rouge.', s: 'devis_factures_f3' },
    ],
  },
  {
    n: 16, area: 'Facturation', title: 'Importer un relevé bancaire et pointer les factures payées', slug: 'import-releve-bancaire',
    steps: [
      { t: 'Exportez le relevé de votre e-banking', d: 'Au format camt.053 (.xml).', s: 'devis_factures_import-releve' },
      { t: 'Importez-le dans Cantia', d: 'Factures › Importer un relevé.', s: 'devis_factures_import-releve' },
      { t: 'Les paiements sont reliés à vos factures', d: 'Vous voyez ce qui est payé.', s: 'devis_factures' },
    ],
  },
  {
    n: 17, area: 'E-mails', title: 'Tous vos e-mails clients au même endroit : envois suivis et réponses', slug: 'boite-e-mails',
    steps: [
      { t: 'Tous vos envois au même endroit', d: 'Devis et factures envoyés, et où ils en sont.', s: 'emails' },
      { t: 'Les réponses de vos clients arrivent ici', d: 'La boîte de réception est incluse dans le plan Entreprise.', s: 'emails_reglages' },
      { t: 'Écrivez vos propres textes', d: 'Les modèles de vos e-mails.', s: 'emails_modeles' },
    ],
  },
  {
    n: 18, area: 'Chantiers', title: 'Créer un chantier et suivre son fil d’actualité', slug: 'chantier-et-fil',
    steps: [
      { t: 'Créez un chantier', d: 'Son client, son adresse et son équipe.', s: 'chantiers' },
      { t: 'Tout ce qui s’y passe est dans le fil', d: 'Notes, photos et messages vocaux de l’équipe.', s: 'chantiers_p1_feed' },
      { t: 'Tout reste rangé avec le chantier', d: 'Rapports, documents, planning, travaux supplémentaires.', s: 'chantiers_p1' },
    ],
  },
  {
    n: 19, area: 'Chantiers', title: 'Photos, plans et documents de chantier, rangés au même endroit', slug: 'photos-et-documents',
    steps: [
      { t: 'Ouvrez la galerie du chantier', d: 'Toutes les photos, comme sur votre téléphone.', ds: 'chantiers_p1_photos', ps: 'chantiers_p1' },
      { t: 'Chaque photo est datée et située', d: 'Vous retrouvez quand et où elle a été prise.', card: { label: 'Galerie', path: 'Chantier › Galerie' } },
      { t: 'Plans et documents dans le chantier', d: 'Rangés par dossier.', ds: 'chantiers_p1_documents', ps: null, card: { label: 'Documents', path: 'Chantier › Documents' } },
    ],
  },
  {
    n: 20, area: 'Chantiers', title: 'Un rapport de chantier propre à partir de notes et de photos', slug: 'rapport-de-chantier',
    steps: [
      { t: 'Prenez vos notes et vos photos', d: 'Dans le fil du chantier, au fil de la journée.', s: 'chantiers_p1_feed' },
      { t: 'Générez le rapport', d: 'Cantia en fait un rapport propre, avec votre logo.', s: 'chantiers_p1_rapport-new' },
      { t: 'Envoyez-le en PDF', d: 'Les rapports restent rangés avec le chantier.', s: 'chantiers_p1_reports' },
    ],
  },
  {
    n: 21, area: 'Chantiers', title: 'Le planning de chantier : phases, tâches et avancement', slug: 'planning-de-chantier',
    steps: [
      { t: 'Ouvrez le planning du chantier', d: 'Dans les outils du chantier.', ds: 'chantiers_p1_gantt', ps: 'chantiers_p1' },
      { t: 'Ajoutez les phases et les tâches', d: 'Dans le temps, sur un diagramme de Gantt.', card: { label: 'Phases et tâches', path: 'Chantier › Planning de chantier' } },
      { t: 'Suivez l’avancement', d: 'Les liens montrent ce qui dépend de quoi.', card: { label: 'Avancement', path: 'Phase par phase' } },
    ],
  },
  {
    n: 22, area: 'Chantiers', title: 'Travaux supplémentaires : chiffrer, faire signer, facturer', slug: 'travaux-supplementaires',
    steps: [
      { t: 'Chiffrez le travail demandé', d: 'Pendant le chantier, en quelques lignes.', s: 'chantiers_p1_travaux-supplementaires' },
      { t: 'Votre client le signe', d: 'En ligne, ou sur place sur votre tablette.', card: { label: 'Signature', path: 'En ligne ou sur place' } },
      { t: 'Facturez-le', d: 'Chaque travail garde son statut : envoyé, accepté, refusé.', s: 'chantiers_p1_travaux-supplementaires' },
    ],
  },
  {
    n: 23, area: 'Chantiers', title: 'Faire signer un travail supplémentaire sur place, sur tablette', slug: 'signature-sur-tablette',
    steps: [
      { t: 'Ouvrez le travail supplémentaire', d: 'Depuis le chantier.', s: 'chantiers_p1_travaux-supplementaires' },
      { t: 'Tendez la tablette à votre client', d: 'Il signe du doigt, sur l’écran.', card: { label: 'Signer ici', path: 'Sur votre tablette ou votre téléphone' } },
      { t: 'Le document signé est rangé', d: 'Avec le chantier, prêt à être facturé.', card: { label: 'Signé', path: 'Chantier › Travaux supplémentaires' } },
    ],
  },
  {
    n: 24, area: 'Chantiers', title: 'Suivre ses sous-traitants sur un chantier', slug: 'sous-traitants-chantier',
    steps: [
      { t: 'Ouvrez le chantier', d: 'Sous-traitants, dans ses outils.', s: 'chantiers_p1' },
      { t: 'Ajoutez un sous-traitant', d: 'Pour ce chantier.', ds: 'chantiers_p1_subcontractors', ps: null, card: { label: 'Sous-traitants', path: 'Chantier › Sous-traitants' } },
      { t: 'Suivez ses interventions et ses factures', d: 'Au même endroit que le reste du chantier.', card: { label: 'Interventions', path: 'Et factures du sous-traitant' } },
    ],
  },
  {
    n: 25, area: 'Chantiers', title: 'Savoir si un chantier gagne de l’argent : devisé contre coût réel', slug: 'rentabilite-chantier',
    steps: [
      { t: 'Ouvrez la rentabilité du chantier', d: 'Dans les outils du chantier.', s: 'chantiers_p1' },
      { t: 'Devisé contre coût réel', d: 'Matériel et heures de l’équipe compris.', s: 'chantiers_p1_profitability' },
      { t: 'La marge en francs et en pour-cent', d: 'Vous voyez si le chantier gagne de l’argent.', s: 'chantiers_p1_profitability' },
    ],
  },
  {
    n: 26, area: 'Équipe & RH', title: 'Le planning d’équipe : qui est où, chaque jour', slug: 'planning-equipe',
    steps: [
      { t: 'Qui est sur quel chantier, chaque jour', d: 'Toute l’équipe sur un seul écran.', s: 'planning' },
      { t: 'Planifiez la semaine', d: 'Placez chaque personne sur un chantier.', s: 'planning' },
      { t: 'Chacun voit son planning', d: 'Sur son téléphone, dès l’accueil.', s: 'home' },
    ],
  },
  {
    n: 27, area: 'Équipe & RH', title: 'La liste de tâches de toute l’équipe', slug: 'taches-equipe',
    steps: [
      { t: 'Une liste pour toute l’équipe', d: 'Ajoutez une tâche en une ligne.', s: 'taches' },
      { t: 'Classez par catégorie', d: 'Chantier, client, administratif.', s: 'taches' },
      { t: 'Qui s’en occupe, et pour quand', d: 'Une personne et une échéance par tâche.', s: 'taches' },
    ],
  },
  {
    n: 28, area: 'Équipe & RH', title: 'Inviter son équipe et choisir ce que chacun voit', slug: 'membres-et-roles',
    steps: [
      { t: 'Invitez votre équipe', d: 'Par lien ou par e-mail.', s: 'compte_equipe' },
      { t: 'Choisissez un rôle', d: 'Il définit ce que chacun peut voir et faire.', s: 'compte_equipe' },
      { t: 'Chacun a son propre accès', d: 'Avec son nom, sur son téléphone.', card: { label: 'Rôles', path: 'Paramètres › Équipe' } },
    ],
  },
  {
    n: 29, area: 'Équipe & RH', title: 'Des heures pointées à la fiche de salaire', slug: 'heures-et-salaires',
    steps: [
      { t: 'Les heures sont pointées sur le téléphone', d: 'Par chaque membre de l’équipe.', s: 'rh' },
      { t: 'Par chantier et par jour', d: 'Prêtes pour la rentabilité et les salaires.', s: 'rh' },
      { t: 'Les fiches de salaire se calculent', d: 'À valider, puis à envoyer par e-mail à l’employé.', s: 'rh_fiches-salaire' },
    ],
  },
  {
    n: 30, area: 'Équipe & RH', title: 'Demandes de congé et soldes de vacances de l’équipe', slug: 'absences-et-vacances',
    steps: [
      { t: 'Demandez un congé', d: 'Heures & frais › Absences.', ds: 'rh_absences', ps: null, card: { label: 'Nouvelle demande', path: 'Heures & frais › Absences' } },
      { t: 'Validez la demande', d: 'En un clic.', card: { label: 'Validée', path: 'Demande de congé' } },
      { t: 'Les soldes de vacances sont à jour', d: 'Pour chaque membre de l’équipe.', card: { label: 'Soldes', path: 'Vacances restantes' } },
    ],
  },
  {
    n: 31, area: 'Équipe & RH', title: 'Le répertoire de ses sous-traitants', slug: 'repertoire-sous-traitants',
    steps: [
      { t: 'Vos sous-traitants dans vos contacts', d: 'Filtre « Sous-traitants ».', s: 'clients' },
      { t: 'Coordonnées et spécialité', d: 'Tout ce qu’il faut pour les appeler.', card: { label: 'Spécialité', path: 'Fiche du sous-traitant' } },
      { t: 'Leurs chantiers en cours', d: 'Vous savez où chacun travaille.', card: { label: 'Chantiers en cours', path: 'Fiche du sous-traitant' } },
    ],
  },
  {
    n: 32, area: 'Clients', title: 'Toute l’histoire d’un client sur une seule fiche', slug: 'fiche-client',
    steps: [
      { t: 'Tous vos clients', d: 'Particuliers et entreprises.', s: 'clients' },
      { t: 'Une fiche par client', d: 'Coordonnées, adresse, type.', s: 'clients_c1' },
      { t: 'Tout son historique', d: 'Devis, factures et chantiers liés.', s: 'clients_c1' },
    ],
  },
  {
    n: 33, area: 'Clients', title: 'Ce que voit votre client : devis, factures et signature en ligne', slug: 'portail-client',
    steps: [
      { t: 'Vous envoyez un lien', d: 'Par e-mail, ou copié dans un message.', s: 'devis_d1' },
      { t: 'Votre client ouvre ses documents', d: 'Sans créer de compte.', card: { label: 'Ses documents', path: 'Depuis le lien reçu' } },
      { t: 'Il signe en ligne', d: 'Et vous voyez la signature tout de suite.', card: { label: 'Signature', path: 'Sur son téléphone ou son ordinateur' } },
    ],
  },
  {
    n: 34, area: 'Gestion', title: 'Suivre ses dépenses et scanner ses tickets', slug: 'depenses',
    steps: [
      { t: 'Notez vos dépenses', d: 'Ponctuelles ou récurrentes.', s: 'depenses' },
      { t: 'Scannez vos tickets', d: 'La photo du ticket reste avec la dépense.', s: 'depenses' },
      { t: 'Les dépenses récurrentes sont prévues', d: 'Elles apparaissent dans la trésorerie.', s: 'tresorerie' },
    ],
  },
  {
    n: 35, area: 'Gestion', title: 'La trésorerie prévue sur 90 jours', slug: 'tresorerie',
    steps: [
      { t: 'Votre solde aujourd’hui', d: 'Et ce qu’il sera dans 30 et 90 jours.', s: 'tresorerie' },
      { t: 'Ce qui entre et ce qui sort', d: 'Factures, salaires, sous-traitants et charges.', s: 'tresorerie' },
      { t: 'Une alerte avant un creux', d: 'Vous voyez à l’avance si le solde passe sous zéro.', s: 'tresorerie' },
    ],
  },
  {
    n: 36, area: 'Gestion', title: 'Bilan et compte de résultat, tenus automatiquement', slug: 'comptabilite',
    steps: [
      { t: 'Les écritures se passent toutes seules', d: 'À partir de vos devis, factures, dépenses et salaires.', card: { label: 'Écritures', path: 'Comptabilité' } },
      { t: 'Bilan et compte de résultat', d: 'À jour quand vous les ouvrez.', card: { label: 'Bilan', path: 'Comptabilité › Bilan' } },
      { t: 'Le grand livre pour votre fiduciaire', d: 'Compte par compte.', card: { label: 'Grand livre', path: 'Comptabilité › Grand livre' } },
    ],
  },
  {
    n: 37, area: 'Gestion', title: 'Préparer son décompte TVA suisse', slug: 'decompte-tva',
    steps: [
      { t: 'Choisissez le trimestre', d: 'Les quatre trimestres de l’année.', s: 'compta_tva' },
      { t: 'Le décompte, taux par taux', d: 'Rempli à partir de votre comptabilité.', s: 'compta_tva' },
      { t: 'Prêt à reporter pour l’AFC', d: 'Sur le portail de l’Administration fédérale des contributions.', s: 'compta_tva' },
    ],
  },
  {
    n: 38, area: 'Gestion', title: 'Le bouclement de fin d’année, étape par étape', slug: 'bouclement',
    steps: [
      { t: 'Les étapes pour clôturer l’année', d: 'Dans l’ordre, une à une.', card: { label: 'Bouclement', path: 'Comptabilité › Bouclement' } },
      { t: 'Verrouillez l’exercice', d: 'Plus rien ne bouge une fois clôturé.', ds: 'compta_bouclement', ps: null, card: { label: 'Verrouiller', path: 'Bouclement › Verrouiller et transmettre' } },
      { t: 'Transmettez à votre fiduciaire', d: 'Ce qui est prêt pour elle, au même endroit.', card: { label: 'Transmettre', path: 'À votre fiduciaire' } },
    ],
  },
  {
    n: 39, area: 'Gestion', title: 'Travailler avec sa fiduciaire sans échanger de classeurs', slug: 'fiduciaire',
    steps: [
      { t: 'Invitez votre fiduciaire', d: 'Avec son adresse e-mail.', s: 'compte_fiduciaire' },
      { t: 'Un accès en lecture seule', d: 'Factures, paiements, clients, comptabilité, justificatifs.', s: 'compte_fiduciaire' },
      { t: 'Vos chantiers restent à vous', d: 'Ni photos, ni planning, ni notes internes.', s: 'compte_fiduciaire' },
    ],
  },
  {
    n: 40, area: 'Outils', title: 'L’assistant vocal : parler à Cantia au lieu de taper', slug: 'assistant-vocal',
    steps: [
      { t: 'Le micro est sur chaque écran', d: 'En bas à droite.', s: 'home' },
      { t: 'Dictez au lieu de taper', d: 'Devis, factures, notes de chantier.', s: 'devis_new' },
      { t: 'Demandez ce que vous cherchez', d: 'En parlant normalement.', card: { label: 'Assistant', path: 'Le micro, sur chaque écran' } },
    ],
  },
  {
    n: 41, area: 'Outils', title: 'Relier Cantia à Bexio', slug: 'integration-bexio',
    steps: [
      { t: 'Connectez votre compte Bexio', d: 'Paramètres › Intégrations.', s: 'compte_integrations' },
      { t: 'Clients et factures des deux côtés', d: 'Relevés automatiquement.', s: 'compte_integrations' },
      { t: 'Ou synchronisez maintenant', d: 'En un bouton.', s: 'compte_integrations' },
    ],
  },
];
