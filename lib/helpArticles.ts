// Static content for the in-app help library (Compte → Aide) — bundled with
// the app rather than stored per-organization in the DB, since it explains
// how Cantia itself works and doesn't vary between organizations.
export interface HelpArticleStep {
  // Base filename (no extension) of a screenshot under public/aide/<screenshot>.png.
  screenshot: string;
  // Short label under the screenshot — what this exact step shows, not a
  // restatement of the article's own intro paragraphs above it.
  caption: string;
}

export interface HelpArticle {
  id: string;
  category: string;
  title: string;
  keywords: string[];
  body: string[]; // one string per paragraph
  // Base filename (no extension) of a screenshot under public/aide/<screenshot>.png,
  // rendered near the top of the article's dedicated page. Real Cantia UI
  // captured against a "Cantia Démo SA" demo organization seeded with
  // placeholder data — never a real customer's account.
  screenshot?: string;
  // An ordered, numbered walkthrough (mobile view, desktop view, admin
  // view…) rendered below the intro paragraphs instead of — not in
  // addition to — the single `screenshot` above. Same demo-org sourcing
  // rule applies to every step's screenshot.
  steps?: HelpArticleStep[];
}

export const HELP_ARTICLES: HelpArticle[] = [
  {
    id: 'demarrage',
    category: 'Démarrage',
    title: "Premiers pas avec Cantia",
    keywords: ['démarrage', 'organisation', 'équipe', 'entreprise', 'compte', 'onboarding'],
    body: [
      "Tout tourne autour d'une organisation (votre entreprise) : vous l'avez créée à l'inscription, et toutes les personnes qui la rejoignent partagent les mêmes chantiers, devis, factures et documents.",
      "Les modules (Rentabilité, Planning, Métré, Catalogue, Trames…) sont activables un par un dans Compte → Modules — un nouveau module n'apparaît jamais tout seul dans la barre du bas, il faut l'activer une fois.",
      "La barre de navigation en bas (ou la barre latérale sur tablette/desktop) défile horizontalement s'il y a plus d'onglets que de place — glissez pour voir les modules activés.",
      "En haut à droite, le menu compte donne accès aux paramètres, à l'installation de l'application et à la déconnexion.",
    ],
  },
  {
    id: 'devis-creation',
    screenshot: 'devis-creation',
    category: 'Devis',
    title: 'Créer et envoyer un devis',
    keywords: ['devis', 'création', 'dictée', 'lignes', 'client', 'chantier'],
    body: [
      "Un devis se crée avec un client (nom, adresse, e-mail) et des lignes (description, quantité, unité, prix unitaire). Le bouton \"Dicter\" permet de dicter les notes ou une ligne entière à la voix — l'IA structure automatiquement la description, la quantité et le prix.",
      "Vous pouvez lier un devis à un chantier existant dès sa création (ou plus tard depuis le devis) — c'est ce qui permet ensuite de suivre la rentabilité du chantier et de retrouver toutes les factures liées.",
      "Le statut d'un devis suit ce parcours : Brouillon → Prêt à l'envoi → Envoyé → Accepté (ou Refusé). Le PDF ne peut être généré/téléchargé qu'une fois sorti du brouillon.",
      "Une fois le devis accepté (manuellement ou par le client lui-même via le lien public — voir l'article \"Lien client public\"), la facture correspondante est créée automatiquement.",
    ],
  },
  {
    id: 'devis-trames',
    category: 'Devis',
    title: 'Gagner du temps avec les trames',
    keywords: ['trame', 'modèle', 'bibliothèque', 'lignes'],
    body: [
      "Une trame est un ensemble de lignes de devis réutilisables (par exemple toutes les positions habituelles d'une salle de bain) — vous l'insérez en un clic dans un nouveau devis au lieu de retaper les mêmes lignes à chaque fois.",
      "Vous pouvez créer une trame depuis un devis existant (\"Enregistrer comme trame\" dans le menu du devis), ou directement depuis la bibliothèque de trames.",
      "Le catalogue détecte aussi automatiquement l'unité la plus probable pour un article (par exemple \"mètre linéaire\" pour du PVC) et vous alerte si le prix saisi s'écarte fortement du prix catalogue habituel.",
    ],
  },
  {
    id: 'facturation-acomptes',
    screenshot: 'facturation-acomptes',
    category: 'Facturation',
    title: 'Factures, acomptes et paiements partiels',
    keywords: ['facture', 'acompte', 'paiement', 'partiel', 'solde', 'déduction'],
    body: [
      "Depuis un devis accepté, vous pouvez facturer un acompte (un pourcentage du montant total) avant la facture finale. La facture finale déduit automatiquement tous les acomptes déjà facturés sur ce devis — vous n'avez jamais à faire le calcul vous-même.",
      "Si un acompte est annulé ou supprimé, la déduction sur la facture finale est recalculée automatiquement dans l'autre sens, pour que le solde reste toujours juste.",
      "Un paiement peut être enregistré partiellement : la facture passe alors au statut \"Partiellement payée\" et affiche le solde restant dû, jusqu'à ce que le total soit atteint.",
      "Comme les devis, les factures peuvent être liées à un chantier — la liste des factures se trie et se filtre par date d'émission, date d'échéance, statut ou chantier.",
    ],
  },
  {
    id: 'facturation-email-lien',
    category: 'Facturation',
    title: 'Envoyer un devis ou une facture, et le lien client public',
    keywords: ['e-mail', 'envoyer', 'lien', 'signature', 'portail', 'client', 'qr-facture'],
    body: [
      "Le bouton \"Envoyer par e-mail\" sur un devis ou une facture envoie automatiquement le PDF en pièce jointe, accompagné du lien du portail client — génération du PDF requise au préalable.",
      "Le bouton \"Copier le lien client\" génère un lien unique et impossible à deviner, à envoyer vous-même (WhatsApp, e-mail manuel…) si vous préférez. Ce lien ne fonctionne qu'avec l'adresse e-mail du client renseignée sur le document — une sécurité supplémentaire avant d'afficher quoi que ce soit.",
      "Sur un devis, le client peut consulter le détail et l'accepter en ligne, en signant à la souris/au doigt ou en important une photo de sa signature — l'acceptation déclenche automatiquement le passage au statut \"Accepté\" et la création de la facture, exactement comme si vous l'aviez fait depuis l'application.",
      "Sur une facture, le lien est en lecture seule (détail et solde restant dû) — le client ne peut jamais marquer lui-même une facture comme payée, ce constat reste toujours une action interne de l'entreprise.",
      "Les factures affichent aussi une référence QR suisse (QR-facture) : le paiement peut être rapproché automatiquement en recherchant ce numéro de référence dans l'application.",
    ],
  },
  {
    id: 'chantiers-rapports',
    screenshot: 'chantiers-rapports',
    category: 'Chantiers & rapports',
    title: 'Fil de chantier et rapports PDF',
    keywords: ['chantier', 'rapport', 'photo', 'fil', 'actualité', 'pdf'],
    body: [
      "Chaque chantier a un fil d'actualité façon discussion : vous y postez des photos géolocalisées et des messages (dictés à la voix si besoin) au fur et à mesure de l'avancement.",
      "Depuis le fil, un bouton génère un rapport de chantier en PDF à partir des entrées sélectionnées — l'IA peut aussi rédiger un texte de synthèse à partir de vos notes.",
      "Le rapport PDF inclut une grille de photos avec légendes, coordonnées GPS, horodatage, et une carte qui situe les photos éparpillées sur le chantier.",
      "Le mode hors-ligne permet de prendre des photos sans réseau sur le chantier — elles se synchronisent automatiquement dès que la connexion revient.",
    ],
  },
  {
    id: 'rentabilite',
    category: 'Chantiers & rapports',
    title: 'Rentabilité par chantier',
    keywords: ['rentabilité', 'coût', 'dépense', 'main d\'œuvre', 'marge', 'ticket', 'scan'],
    body: [
      "L'onglet Rentabilité d'un chantier compare le montant devisé/facturé au coût réel : matériel (dépenses saisies sur le chantier) et main d'œuvre (calculée à partir des heures réellement pointées dans RH & Salaires, ou à défaut estimée depuis les affectations Planning et le coût horaire moyen défini dans Compte → Facturation).",
      "Pour saisir une dépense matériel, une photo du ticket de caisse ou de la facture fournisseur suffit — le fournisseur et le montant sont lus automatiquement, il ne reste qu'à vérifier avant d'enregistrer. La saisie manuelle reste possible pour les cas où la photo n'est pas pratique, et l'assistant vocal (bouton micro en bas de l'écran) permet aussi d'ajouter une dépense en la dictant.",
      "Un badge indique en un coup d'œil si le chantier est en dessous, autour ou au-dessus du seuil de rentabilité, pour repérer vite un chantier qui dérape avant la fin.",
      "Toutes les dépenses de tous les chantiers, ainsi que les dépenses générales de l'entreprise, sont aussi visibles regroupées dans la section Dépenses de la navigation — voir l'article dédié.",
    ],
  },
  {
    id: 'planning',
    screenshot: 'planning',
    category: 'Planning',
    title: "Planning d'équipe",
    keywords: ['planning', 'équipe', 'affectation', 'calendrier'],
    body: [
      "Le Planning affiche un vrai calendrier où chaque membre de l'équipe peut être affecté à un chantier sur une ou plusieurs journées.",
      "Ces affectations alimentent l'estimation de main-d'œuvre de l'onglet Rentabilité tant qu'aucune heure réelle n'a encore été pointée sur le chantier — dès que l'équipe utilise RH & Salaires, ce sont les heures réelles qui prennent le relais automatiquement.",
    ],
  },
  {
    id: 'metre',
    category: 'Métré',
    title: 'Le métré',
    keywords: ['métré', 'quantité', 'mesure'],
    body: [
      "Le module Métré donne un tableau de mesures adapté au mobile, pour calculer des surfaces et quantités directement depuis le chantier.",
      "Chaque poste de métré peut être transformé en ligne de devis chiffrée en un clic.",
    ],
  },
  {
    id: 'inventaire',
    category: 'Catalogue',
    title: 'À quoi sert le Catalogue ?',
    keywords: ['inventaire', 'catalogue', 'prix', 'positions', 'csv', 'import', 'export'],
    body: [
      "Ce n'est pas un suivi de stock ou de matériel physique : c'est une bibliothèque de vos positions (description, unité, prix) qui se remplit automatiquement à chaque devis — dès qu'une description est utilisée une première fois, elle y est enregistrée.",
      "Elle sert ensuite à aller plus vite sur les devis suivants : en tapant une description déjà connue, Cantia vous propose la ligne complète avec son unité et son dernier prix, prêts à réutiliser ou ajuster.",
      "Vous pouvez aussi créer, modifier ou supprimer des positions directement depuis le Catalogue, importer une liste existante par CSV (colonnes reconnues automatiquement) et exporter le tout à tout moment.",
    ],
  },
  {
    id: 'equipe-modules',
    screenshot: 'equipe-modules',
    category: 'Équipe & organisation',
    title: "Inviter l'équipe et activer des modules",
    keywords: ['équipe', 'invitation', 'rôle', 'module', 'admin'],
    body: [
      "Depuis Compte → Équipe, un lien d'invitation permet à un collègue de rejoindre l'organisation ; les demandes d'adhésion en attente sont validées par un administrateur.",
      "Compte → Modules active ou désactive les fonctionnalités optionnelles (Planning, Rentabilité, Métré, Catalogue, Trames…) organisation par organisation — un module éteint disparaît simplement de la barre de navigation, aucune donnée n'est perdue si vous le rallumez plus tard.",
    ],
  },
  {
    id: 'personnalisation-abonnement',
    screenshot: 'personnalisation-abonnement',
    category: 'Personnalisation & abonnement',
    title: 'Kit de marque, plans et abonnement',
    keywords: ['couleur', 'logo', 'marque', 'plan', 'abonnement', 'stripe', 'quota'],
    body: [
      "Dans Compte → Entreprise, vous pouvez définir la couleur de marque et le logo utilisés sur vos devis, factures et rapports PDF, dès le plan Essentiel — une couleur est même suggérée automatiquement à partir de votre logo ou de votre site web.",
      "Devis et factures sont illimités sur tous les plans Cantia. Ce qui varie d'un plan à l'autre, c'est l'espace de stockage, le nombre de membres et l'accès à certains modules (planning, RH, trésorerie, dès Équipe). La gestion de l'abonnement se fait depuis Compte → Abonnement (facturation Stripe).",
      "Compte → Stockage détaille l'espace utilisé par catégorie (photos, PDF, autres fichiers) avec un bouton pour passer à un plan supérieur si besoin.",
    ],
  },
  {
    id: 'tableau-de-bord',
    screenshot: 'tableau-de-bord',
    category: 'Démarrage',
    title: 'Comprendre le tableau de bord',
    keywords: ['tableau de bord', 'dashboard', 'accueil', 'kpi', 'raccourcis'],
    body: [
      "L'écran d'accueil affiche les indicateurs qui comptent au quotidien : devis en attente de réponse, factures impayées ou en retard, et chantiers actuellement actifs — en un coup d'œil, sans avoir à ouvrir chaque module.",
      "Les raccourcis rapides (nouveau devis, nouvelle facture, nouveau chantier) permettent de créer un document sans passer par le menu complet — utile depuis un téléphone, entre deux rendez-vous.",
      "Un bandeau signale les dépenses récurrentes qui tombent dans les 7 prochains jours (module Trésorerie) avant qu'elles ne soient prélevées, pour ne jamais être pris au dépourvu.",
      "Le tableau de bord ne montre que ce qui est pertinent pour votre rôle : un employé standard verra ses propres tâches et chantiers, un administrateur voit l'ensemble de l'organisation.",
    ],
  },
  {
    id: 'rejoindre-organisation',
    category: 'Démarrage',
    title: 'Rejoindre une organisation existante',
    keywords: ['rejoindre', 'invitation', 'lien', 'équipe', 'organisation existante'],
    body: [
      "Si votre entreprise utilise déjà Cantia, inutile de créer une nouvelle organisation : un administrateur vous envoie un lien d'invitation (depuis Compte → Équipe) qui vous rattache directement à l'organisation existante lors de votre inscription.",
      "Sans lien d'invitation, vous pouvez aussi demander à rejoindre une organisation par son nom — la demande part alors en attente jusqu'à ce qu'un administrateur la valide.",
      "Une fois rattaché, vous voyez immédiatement les chantiers, clients et documents de l'organisation, selon les permissions de votre rôle (administrateur, secrétaire RH, ou employé standard).",
      "Il n'est pas possible d'appartenir à deux organisations à la fois avec le même compte — quitter une organisation avant d'en rejoindre une autre est nécessaire si besoin.",
    ],
  },
  {
    id: 'dictee-vocale',
    category: 'Démarrage',
    title: 'La dictée vocale, partout dans Cantia',
    keywords: ['dictée', 'voix', 'micro', 'transcription', 'vocal'],
    body: [
      "Le bouton micro apparaît à chaque endroit où vous écrivez dans Cantia : une ligne de devis, un message du fil de chantier, une note de rapport. Il transforme votre voix en texte structuré, pas juste en texte brut.",
      "Sur une ligne de devis par exemple, dicter « pose de dix mètres carrés de carrelage à septante francs le mètre » suffit à remplir la description, la quantité, l'unité et le prix unitaire en une seule fois.",
      "La reconnaissance est adaptée au vocabulaire du bâtiment (matériaux, unités, corps de métier) — elle comprend aussi bien le jargon technique que le langage courant.",
      "Un second bouton micro, celui en bas de l'écran (accessible depuis n'importe quelle page de l'application), fonctionne différemment : c'est un assistant complet, pas juste une dictée. Dites par exemple « chantier villa, de 7h à 15h, coffrage » ou « achat de vis chez Bauhaus, 45 francs », et il comprend seul s'il s'agit d'heures ou d'une dépense, à quel chantier ça se rapporte, puis affiche un récapitulatif à confirmer (modifiable à la main ou en redictant) avant d'enregistrer quoi que ce soit.",
      "Une connexion internet est nécessaire au moment de dicter (la transcription se fait sur des serveurs sécurisés), mais tout ce qui a déjà été créé reste consultable hors ligne ensuite.",
    ],
  },
  {
    id: 'chantiers-documents',
    category: 'Chantiers & rapports',
    title: 'Photos et documents de chantier',
    keywords: ['photos', 'documents', 'arborescence', 'plans', 'classement', 'dossier'],
    body: [
      "Chaque chantier a son propre espace Documents, organisé en dossiers (plans, autorisations, contrats, factures fournisseurs…) plutôt qu'un simple tas de fichiers en vrac.",
      "Les photos prises depuis le fil d'actualité du chantier sont géolocalisées et horodatées automatiquement — utile comme preuve en cas de contestation ultérieure sur l'état d'un élément.",
      "Un document peut être renommé, déplacé dans un autre dossier ou supprimé à tout moment ; les types courants (PDF, images, fichiers Office) s'ouvrent directement en prévisualisation, sans téléchargement préalable.",
      "L'espace utilisé par les documents et photos de chantier compte dans le quota de stockage de l'organisation, visible dans Compte → Stockage.",
    ],
  },
  {
    id: 'chantiers-sous-traitants',
    category: 'Chantiers & rapports',
    title: 'Sous-traitants sur un chantier',
    keywords: ['sous-traitant', 'chantier', 'facture fournisseur', 'responsabilité'],
    body: [
      "Un sous-traitant peut être ajouté directement à un chantier précis, avec ses propres coordonnées et le suivi de ses factures liées à ce chantier.",
      "Les factures reçues d'un sous-traitant sont enregistrées avec leur statut de paiement, ce qui alimente aussi le calcul de rentabilité du chantier (le coût sous-traité s'ajoute au coût réel).",
      "Le répertoire global des sous-traitants (module Sous-traitants, dans la navigation principale) centralise tous ceux avec qui vous travaillez, au-delà d'un seul chantier — voir l'article dédié.",
    ],
  },
  {
    id: 'travaux-supplementaires',
    category: 'Chantiers & rapports',
    title: 'Travaux supplémentaires (TS)',
    keywords: ['travaux supplémentaires', 'ts', 'avenant', 'extra', 'plus-value'],
    body: [
      "Un Travaux supplémentaires (TS) est un document séparé pour tout ce qui est demandé en plus du devis initial en cours de chantier — un mur à déplacer, une prise à ajouter. Il se crée depuis un chantier, avec ou sans lien vers le devis d'origine.",
      "Il se rédige, s'envoie et se signe exactement comme un devis (dictée vocale comprise), puis se transforme automatiquement en facture une fois accepté par le client.",
      "Un TS accepté s'ajoute automatiquement au montant devisé total du chantier dans l'onglet Rentabilité — pas besoin de le recompter à la main pour que la marge reste juste.",
      "Documenter chaque extra par un TS, même mineur, évite la situation la plus fréquente en fin de chantier : un travail réellement effectué mais jamais facturé faute de trace écrite.",
    ],
  },
  {
    id: 'rh-heures-salaires',
    screenshot: 'rh-heures-salaires',
    category: 'RH & salaires',
    title: 'Heures, frais et fiches de salaire',
    keywords: ['rh', 'heures', 'salaire', 'fiche de paie', 'avs', 'lpp', 'source'],
    body: [
      "Chaque employé pointe ses heures directement depuis son téléphone, rattachées à un chantier précis — ce qui permet ensuite de comparer le temps prévu au temps réellement passé, chantier par chantier.",
      "Les frais professionnels (indemnités kilométriques, repas…) s'ajoutent de la même façon, avec le taux forfaitaire en vigueur préconfiguré.",
      "Depuis Compte → RH, la secrétaire RH ou l'administrateur génère la fiche de salaire de chaque employé, du brut au net, à partir de taux AVS/AC/LPP/LAA et d'un taux d'impôt à la source configurables par personne — les valeurs par défaut sont indicatives, à ajuster selon votre caisse de compensation et votre canton.",
      "Un employé standard ne voit jamais que ses propres heures, frais et fiches de salaire — jamais ceux du reste de l'équipe, sauf s'il a lui-même un rôle RH ou administrateur.",
      "La feuille d'heures s'exporte en CSV à la granularité de votre choix (journalière, hebdomadaire, mensuelle) pour l'envoyer à une fiduciaire si besoin.",
    ],
  },
  // These three screenshots are real Cantia UI (actual PayrollEntryPanel /
  // RH → Heures components, not mockups), but with entirely fictional
  // data (org "Cantia Démo SA", "Marco Ferreira"/"Julien Moret") — this
  // sandbox's browser has its egress to the real Supabase backend blocked
  // by policy, so instead of a real signed-up account, the Supabase REST/
  // auth calls were intercepted at the browser level (Playwright
  // page.route on **/krijilwxhdlzflvnvrtl.supabase.co/**, fulfilled with
  // canned JSON matching each query's exact shape) and a fake but
  // long-lived session was seeded straight into localStorage
  // (sb-krijilwxhdlzflvnvrtl-auth-token) before first load — the request
  // never actually leaves the browser, so the network policy never comes
  // into play. Re-run the same technique to refresh these after a UI
  // change: mobile shot from a 'member' identity (self-only screen — an
  // owner/admin always has canManagePayroll=true and never sees it),
  // desktop shot same identity with the calendar, admin shot from an
  // 'owner' identity on the "Facturation" tab.
  {
    id: 'rh-heures-guide',
    category: 'RH & salaires',
    title: 'Saisir ses heures et les refacturer par chantier — le guide pas à pas',
    keywords: ['heures', 'pointage', 'mobile', 'refacturer', 'facturer chantier', 'export csv', 'monteur', 'employé'],
    body: [
      "Concrètement, à quoi ça ressemble d'utiliser Cantia pour les heures — du téléphone d'un employé sur le chantier jusqu'au bureau qui refacture et sort les chiffres. Les trois écrans ci-dessous sont la même fonctionnalité vue de trois côtés différents.",
    ],
    steps: [
      {
        screenshot: 'heures-mobile-saisie',
        caption: "Sur le téléphone, un employé choisit le chantier concerné, indique ses heures et ce qu'il a fait — rien d'autre à installer, ça se fait directement dans le navigateur du téléphone. Le bouton \"Dicter une entrée\" permet aussi de tout dire à voix haute (\"chantier rénovation villa, de 7h à 15h, coffrage\") : Cantia reconnaît le chantier, calcule les heures et enregistre l'entrée tout seul.",
      },
      {
        screenshot: 'heures-desktop-saisie',
        caption: "Sur ordinateur, le même formulaire s'utilise avec un calendrier pour naviguer entre les jours — pratique pour rattraper plusieurs journées d'un coup en fin de semaine. Le bouton \"Exporter CSV\" en bas de la feuille sort les heures de la période affichée.",
      },
      {
        screenshot: 'heures-admin-facturation',
        caption: "Côté bureau, l'onglet Facturation de RH → Heures regroupe les heures non encore facturées par chantier et par type de travail. Un clic sur \"Facturer ce chantier\" crée directement la facture correspondante — les heures utilisées sont marquées comme facturées et n'apparaissent plus dans ce qui reste à facturer.",
      },
    ],
  },
  {
    id: 'tresorerie',
    category: 'Trésorerie',
    title: 'Prévision de trésorerie',
    keywords: ['trésorerie', 'liquidité', 'prévision', 'cashflow', 'banque'],
    body: [
      "Le module Trésorerie projette votre solde à venir sur 90 jours, à partir de ce que Cantia sait déjà de votre activité : factures clients non soldées, estimation de la masse salariale, factures sous-traitants impayées et dépenses récurrentes que vous enregistrez.",
      "Aucune connexion bancaire n'est demandée ni nécessaire : vous saisissez votre solde de départ manuellement, quand vous le souhaitez.",
      "Une dépense récurrente (loyer, leasing, assurance…) se configure une seule fois avec sa fréquence, depuis Dépenses — elle réapparaît ensuite automatiquement dans la projection ci-dessous, avec un rappel avant chaque échéance.",
      "Les achats ponctuels hors chantier (fournitures, outillage, frais divers) se créent eux aussi depuis Dépenses, jamais ici : une photo du ticket remplit le libellé et le montant automatiquement, ou l'assistant vocal (bouton micro) peut les ajouter en les dictant. Ils ne figurent pas dans la projection ci-dessous, qui ne retient que les mouvements récurrents et prévisibles.",
      "L'intérêt principal n'est pas de prédire l'avenir au franc près, mais de repérer un creux plusieurs semaines à l'avance : assez tôt pour relancer une facture en retard ou décaler un achat non urgent.",
    ],
  },
  {
    id: 'depenses',
    category: 'Trésorerie',
    title: 'Dépenses : créer, suivre et filtrer',
    keywords: ['dépenses', 'liste', 'filtre', 'chantier', 'général', 'total', 'récurrente', 'ponctuelle'],
    body: [
      "La section Dépenses (dans la navigation, à côté de Trésorerie) regroupe en une seule liste toutes les dépenses de l'entreprise : celles liées à un chantier précis (toujours saisies depuis l'onglet Rentabilité de ce chantier) et les dépenses générales, hors chantier — que vous créez, modifiez et supprimez directement ici, avec un total et des filtres par période (ce mois-ci, 30 derniers jours, tout) et par chantier.",
      "Le bouton « Nouvelle dépense » ouvre le même formulaire que la note vocale : une photo du ticket remplit automatiquement le libellé et le montant, à vérifier avant d'enregistrer. Un onglet « Récurrentes » à part gère les charges qui reviennent (loyer, abonnements, assurances…), avec un rappel avant chaque échéance — c'est aussi de là qu'elles alimentent la projection de Trésorerie.",
      "Toucher une ligne liée à un chantier ouvre l'onglet Rentabilité de ce chantier ; toucher une dépense générale l'ouvre en modification, ici même — pratique pour vérifier qu'une dépense ajoutée à la voix ou par scan est bien arrivée au bon endroit, ou pour la corriger.",
      "Disponible dès que Rentabilité ou Trésorerie l'est (plan Équipe) : la liste s'adapte à ce que couvre votre plan, mais créer des dépenses générales ou récurrentes nécessite Trésorerie.",
    ],
  },
  {
    id: 'clients',
    screenshot: 'clients',
    category: 'Clients',
    title: 'La fiche client',
    keywords: ['client', 'historique', 'fiche', 'coordonnées', 'relance'],
    body: [
      "Chaque client a sa propre fiche : coordonnées, historique complet de ses devis, factures et chantiers, et notes de suivi — un seul endroit plutôt qu'une recherche dans les e-mails à chaque nouveau contact.",
      "Un client se crée automatiquement au moment d'un premier devis, ou manuellement depuis le module Clients si vous voulez préparer une fiche avant même le premier document.",
      "L'historique centralisé permet de repérer facilement les clients récurrents (souvent les plus rentables à fidéliser) et de savoir en un coup d'œil qui recontacter, et à quel sujet.",
    ],
  },
  {
    id: 'sous-traitants',
    category: 'Sous-traitants',
    title: 'Le répertoire des sous-traitants',
    keywords: ['sous-traitant', 'répertoire', 'annuaire', 'facture'],
    body: [
      "Le module Sous-traitants (activable dans Compte → Modules) centralise tous les sous-traitants avec qui vous travaillez, au-delà d'un seul chantier — coordonnées, corps de métier, et historique des factures reçues.",
      "Un sous-traitant du répertoire peut être ajouté à n'importe quel chantier en quelques clics, sans ressaisir ses coordonnées à chaque fois.",
      "Le suivi des factures sous-traitants (payées, en attente) donne une vision claire de ce qui reste dû, utile aussi bien pour la trésorerie que pour la rentabilité par chantier.",
    ],
  },
  {
    id: 'integration-bexio',
    category: 'Intégrations',
    title: 'Intégration Bexio',
    keywords: ['bexio', 'intégration', 'comptabilité', 'synchronisation'],
    body: [
      "L'intégration Bexio (disponible dès le plan Équipe) connecte Cantia à votre comptabilité via l'API officielle de Bexio, depuis Compte → Intégrations.",
      "Une fois connectée, les clients et positions du catalogue s'importent automatiquement, et chaque facture Cantia peut être envoyée vers Bexio en un clic.",
      "Chaque facture arrive dans Bexio en brouillon uniquement — la finalisation reste toujours une action manuelle côté Bexio, pour garder le contrôle sur ce qui part réellement en comptabilité.",
      "Déconnecter l'intégration révoque immédiatement les accès : aucune donnée ne continue d'être échangée entre les deux outils après coup.",
    ],
  },
  {
    id: 'relances-impayes',
    category: 'Facturation',
    title: 'Relancer une facture impayée',
    keywords: ['relance', 'impayé', 'retard', 'rappel', 'intérêt moratoire'],
    body: [
      "Une facture en retard apparaît directement sur le tableau de bord et dans la liste des factures, sans avoir à comparer manuellement un relevé bancaire à une liste de documents envoyés.",
      "Un premier rappel neutre, envoyé dès le lendemain de l'échéance dépassée, suffit dans la majorité des cas — le ton peut se durcir sur une deuxième relance si nécessaire.",
      "La référence QR de chaque facture permet de rapprocher un paiement reçu en quelques secondes, ce qui évite de relancer par erreur un client qui a déjà payé.",
    ],
  },
  {
    id: 'import-releve-bancaire',
    category: 'Facturation',
    title: 'Importer un relevé bancaire',
    keywords: ['relevé bancaire', 'import', 'rapprochement', 'camt', 'paiement'],
    body: [
      "Depuis Facturation → Import de relevé, un fichier de relevé bancaire (format CAMT.053 notamment) peut être importé pour rapprocher automatiquement les paiements reçus avec les factures en attente.",
      "Le rapprochement se fait en priorité via la référence QR de chaque paiement — un match exact et fiable à 100 %. Quand un client paie sans cette référence, Cantia tente ensuite un rapprochement par montant, puis, en dernier recours, par ressemblance de nom (même si l'ordre des mots diffère, comme un relevé qui inverse nom et prénom).",
      "Les rapprochements par ressemblance de nom sont signalés à part et ne sont jamais cochés automatiquement — ils demandent une vérification avant confirmation, contrairement aux rapprochements exacts (référence ou montant unique) qui le sont déjà.",
      "Cet import ne remplace pas une connexion bancaire permanente : c'est un import ponctuel, à faire aussi souvent que vous le souhaitez, sans jamais donner à Cantia d'accès direct à votre compte.",
    ],
  },
  {
    id: 'portail-client',
    category: 'Facturation',
    title: 'Ce que voit le client sur son portail',
    keywords: ['portail client', 'lien client', 'signature en ligne', 'sécurité'],
    body: [
      "Le lien envoyé à un client ouvre un portail sécurisé, sans qu'il ait besoin de créer de compte ni de mot de passe — juste son adresse e-mail, déjà connue de Cantia.",
      "Une double vérification protège l'accès : un code reçu par e-mail doit être saisi avant de pouvoir consulter le document, pour qu'un lien égaré ne suffise pas à lui seul.",
      "Sur un devis ou un Travaux supplémentaires, le client consulte le détail chiffré et signe en ligne (souris, doigt, ou import d'une photo de signature) — l'acceptation est horodatée et déclenche automatiquement les étapes suivantes côté Cantia.",
      "Sur une facture, le portail reste en lecture seule : le client voit le détail et le solde restant dû, mais ne peut jamais marquer lui-même un paiement comme reçu.",
    ],
  },
];

// German mirror of HELP_ARTICLES — same ids/order (app/aide.tsx groups and
// filters by these), full body text translated rather than machine-run
// through the UI dict, since these are long explanatory paragraphs rather
// than short interface labels. Terminology kept consistent with the rest
// of the German UI (Offerte, Baustelle, Rechnung, Anzahlung, Vorlage,
// Aufmass, Katalog, Team, Modul, Rentabilität, Personal & Löhne,
// Liquidität, Speicherplatz — see lib/translations/de.ts).
export const HELP_ARTICLES_DE: HelpArticle[] = [
  {
    id: 'demarrage',
    category: 'Erste Schritte',
    title: 'Erste Schritte mit Cantia',
    keywords: ['start', 'organisation', 'team', 'unternehmen', 'konto', 'onboarding'],
    body: [
      "Alles dreht sich um eine Organisation (Ihr Unternehmen): Sie haben sie bei der Registrierung erstellt, und alle Personen, die ihr beitreten, teilen dieselben Baustellen, Offerten, Rechnungen und Dokumente.",
      "Die Module (Rentabilität, Planung, Aufmass, Katalog, Vorlagen…) lassen sich einzeln unter Konto → Module aktivieren — ein neues Modul erscheint nie von selbst in der unteren Leiste, es muss einmal aktiviert werden.",
      "Die Navigationsleiste unten (oder die Seitenleiste auf Tablet/Desktop) scrollt horizontal, wenn mehr Reiter vorhanden sind als Platz — wischen Sie, um die aktivierten Module zu sehen.",
      "Oben rechts bietet das Kontomenü Zugriff auf die Einstellungen, die Installation der Anwendung und die Abmeldung.",
    ],
  },
  {
    id: 'devis-creation',
    screenshot: 'devis-creation',
    category: 'Offerten',
    title: 'Eine Offerte erstellen und versenden',
    keywords: ['offerte', 'erstellen', 'diktieren', 'positionen', 'kunde', 'baustelle'],
    body: [
      "Eine Offerte wird mit einem Kunden (Name, Adresse, E-Mail) und Positionen (Beschreibung, Menge, Einheit, Einzelpreis) erstellt. Mit der Schaltfläche \"Diktieren\" können Sie Notizen oder eine ganze Position per Spracheingabe diktieren — die KI strukturiert automatisch Beschreibung, Menge und Preis.",
      "Sie können eine Offerte schon bei der Erstellung mit einer bestehenden Baustelle verknüpfen (oder später von der Offerte aus) — das ermöglicht es später, die Rentabilität der Baustelle zu verfolgen und alle verknüpften Rechnungen wiederzufinden.",
      "Der Status einer Offerte durchläuft folgenden Ablauf: Entwurf → Bereit zum Versand → Gesendet → Angenommen (oder Abgelehnt). Das PDF kann erst erzeugt bzw. heruntergeladen werden, sobald sie den Entwurfsstatus verlassen hat.",
      "Sobald die Offerte angenommen wurde (manuell oder durch den Kunden selbst über den öffentlichen Link — siehe den Artikel \"Öffentlicher Kundenlink\"), wird die entsprechende Rechnung automatisch erstellt.",
    ],
  },
  {
    id: 'devis-trames',
    category: 'Offerten',
    title: 'Mit Vorlagen Zeit sparen',
    keywords: ['vorlage', 'muster', 'bibliothek', 'positionen'],
    body: [
      "Eine Vorlage ist eine Sammlung wiederverwendbarer Offertpositionen (zum Beispiel alle üblichen Positionen für ein Badezimmer) — Sie fügen sie mit einem Klick in eine neue Offerte ein, statt dieselben Positionen jedes Mal neu einzutippen.",
      "Sie können eine Vorlage aus einer bestehenden Offerte erstellen (\"Als Vorlage speichern\" im Offertmenü) oder direkt aus der Vorlagenbibliothek.",
      "Der Katalog erkennt zudem automatisch die wahrscheinlichste Einheit für einen Artikel (zum Beispiel \"Laufmeter\" für PVC) und warnt Sie, wenn der eingegebene Preis stark vom üblichen Katalogpreis abweicht.",
    ],
  },
  {
    id: 'facturation-acomptes',
    screenshot: 'facturation-acomptes',
    category: 'Rechnungsstellung',
    title: 'Rechnungen, Anzahlungen und Teilzahlungen',
    keywords: ['rechnung', 'anzahlung', 'zahlung', 'teilzahlung', 'saldo', 'abzug'],
    body: [
      "Ab einer angenommenen Offerte können Sie eine Anzahlung (einen Prozentsatz des Gesamtbetrags) vor der Schlussrechnung fakturieren. Die Schlussrechnung zieht automatisch alle bereits für diese Offerte fakturierten Anzahlungen ab — Sie müssen die Berechnung nie selbst vornehmen.",
      "Wird eine Anzahlung storniert oder gelöscht, wird der Abzug auf der Schlussrechnung automatisch in die andere Richtung neu berechnet, damit der Saldo immer stimmt.",
      "Eine Zahlung kann teilweise erfasst werden: Die Rechnung erhält dann den Status \"Teilweise bezahlt\" und zeigt den verbleibenden Restbetrag an, bis der Gesamtbetrag erreicht ist.",
      "Wie Offerten können auch Rechnungen mit einer Baustelle verknüpft werden — die Rechnungsliste lässt sich nach Ausstellungsdatum, Fälligkeitsdatum, Status oder Baustelle sortieren und filtern.",
    ],
  },
  {
    id: 'facturation-email-lien',
    category: 'Rechnungsstellung',
    title: 'Eine Offerte oder Rechnung versenden, und der öffentliche Kundenlink',
    keywords: ['e-mail', 'senden', 'link', 'unterschrift', 'portal', 'kunde', 'qr-rechnung'],
    body: [
      "Die Schaltfläche \"Per E-Mail senden\" bei einer Offerte oder Rechnung versendet automatisch das PDF als Anhang, zusammen mit dem Link zum Kundenportal — das PDF muss vorher erzeugt worden sein.",
      "Die Schaltfläche \"Kundenlink kopieren\" erzeugt einen einzigartigen, nicht erratbaren Link, den Sie selbst versenden können (WhatsApp, manuelle E-Mail…), falls Sie das bevorzugen. Dieser Link funktioniert nur mit der auf dem Dokument hinterlegten E-Mail-Adresse des Kunden — eine zusätzliche Sicherheitsstufe, bevor irgendetwas angezeigt wird.",
      "Bei einer Offerte kann der Kunde die Details online einsehen und sie annehmen, indem er mit der Maus/dem Finger unterschreibt oder ein Foto seiner Unterschrift hochlädt — die Annahme löst automatisch den Statuswechsel auf \"Angenommen\" und die Erstellung der Rechnung aus, genau wie wenn Sie es selbst in der Anwendung getan hätten.",
      "Bei einer Rechnung ist der Link schreibgeschützt (Details und verbleibender Restbetrag) — der Kunde kann eine Rechnung nie selbst als bezahlt markieren, diese Feststellung bleibt immer eine interne Aktion des Unternehmens.",
      "Rechnungen zeigen zudem eine Schweizer QR-Referenz (QR-Rechnung) an: Die Zahlung kann automatisch abgeglichen werden, indem diese Referenznummer in der Anwendung gesucht wird.",
    ],
  },
  {
    id: 'chantiers-rapports',
    screenshot: 'chantiers-rapports',
    category: 'Baustellen & Berichte',
    title: 'Baustellen-Feed und PDF-Berichte',
    keywords: ['baustelle', 'bericht', 'foto', 'feed', 'neuigkeiten', 'pdf'],
    body: [
      "Jede Baustelle hat einen Feed im Chat-Stil: Sie posten dort laufend geolokalisierte Fotos und Nachrichten (bei Bedarf per Spracheingabe diktiert), während die Arbeiten voranschreiten.",
      "Vom Feed aus erzeugt eine Schaltfläche einen Baustellenbericht als PDF aus den ausgewählten Einträgen — die KI kann auch einen Zusammenfassungstext aus Ihren Notizen verfassen.",
      "Der PDF-Bericht enthält ein Fotoraster mit Bildunterschriften, GPS-Koordinaten, Zeitstempel sowie eine Karte, die die verstreuten Fotos auf der Baustelle verortet.",
      "Der Offline-Modus ermöglicht es, auf der Baustelle ohne Netzverbindung Fotos aufzunehmen — sie werden automatisch synchronisiert, sobald die Verbindung wieder besteht.",
    ],
  },
  {
    id: 'rentabilite',
    category: 'Baustellen & Berichte',
    title: 'Rentabilität pro Baustelle',
    keywords: ['rentabilität', 'kosten', 'ausgabe', 'arbeitskraft', 'marge', 'beleg', 'scan'],
    body: [
      "Der Reiter Rentabilität einer Baustelle vergleicht den offerierten/fakturierten Betrag mit den tatsächlichen Kosten: Material (auf der Baustelle erfasste Ausgaben) und Arbeitskraft (berechnet aus den tatsächlich in Personal & Löhne erfassten Stunden, oder ersatzweise geschätzt anhand der Planungs-Zuweisungen und des unter Konto → Rechnungsstellung festgelegten durchschnittlichen Stundenkostensatzes).",
      "Für eine Materialausgabe genügt ein Foto des Kassenbons oder der Lieferantenrechnung — Lieferant und Betrag werden automatisch gelesen, es bleibt nur noch, vor dem Speichern zu prüfen. Die manuelle Erfassung bleibt weiterhin möglich, wenn ein Foto nicht praktisch ist, und auch der Sprachassistent (Mikrofon-Schaltfläche unten am Bildschirm) kann eine Ausgabe per Diktat hinzufügen.",
      "Ein Badge zeigt auf einen Blick, ob die Baustelle unter, um oder über der Rentabilitätsschwelle liegt, damit eine aus dem Ruder laufende Baustelle frühzeitig erkannt wird.",
    ],
  },
  {
    id: 'planning',
    screenshot: 'planning',
    category: 'Planung',
    title: 'Team-Planung',
    keywords: ['planung', 'team', 'zuweisung', 'kalender'],
    body: [
      "Die Planung zeigt einen echten Kalender, in dem jedes Teammitglied für einen oder mehrere Tage einer Baustelle zugewiesen werden kann.",
      "Diese Zuweisungen fliessen in die Arbeitskraft-Schätzung des Rentabilitäts-Reiters ein, solange noch keine realen Stunden auf der Baustelle erfasst wurden — sobald das Team Personal & Löhne nutzt, übernehmen automatisch die realen Stunden.",
    ],
  },
  {
    id: 'metre',
    category: 'Aufmass',
    title: 'Das Aufmass',
    keywords: ['aufmass', 'menge', 'messung'],
    body: [
      "Das Aufmass-Modul bietet eine mobilgerechte Messtabelle, um Flächen und Mengen direkt auf der Baustelle zu berechnen.",
      "Jede Aufmass-Position lässt sich mit einem Klick in eine bepreiste Offertposition umwandeln.",
    ],
  },
  {
    id: 'inventaire',
    category: 'Katalog',
    title: 'Wozu dient der Katalog?',
    keywords: ['inventar', 'katalog', 'preis', 'positionen', 'csv', 'import', 'export'],
    body: [
      "Das ist keine Bestandsverwaltung für physisches Material: Es ist eine Bibliothek Ihrer Positionen (Beschreibung, Einheit, Preis), die sich bei jeder Offerte automatisch füllt — sobald eine Beschreibung zum ersten Mal verwendet wird, wird sie dort gespeichert.",
      "Sie dient dann dazu, bei den nächsten Offerten schneller voranzukommen: Beim Eintippen einer bereits bekannten Beschreibung schlägt Cantia Ihnen die vollständige Position mit Einheit und letztem Preis vor, bereit zur Wiederverwendung oder Anpassung.",
      "Sie können Positionen auch direkt im Katalog erstellen, ändern oder löschen, eine bestehende Liste per CSV importieren (Spalten werden automatisch erkannt) und alles jederzeit exportieren.",
    ],
  },
  {
    id: 'equipe-modules',
    screenshot: 'equipe-modules',
    category: 'Team & Organisation',
    title: 'Team einladen und Module aktivieren',
    keywords: ['team', 'einladung', 'rolle', 'modul', 'admin'],
    body: [
      "Unter Konto → Team ermöglicht ein Einladungslink einem Kollegen, der Organisation beizutreten; ausstehende Beitrittsanfragen werden von einem Administrator bestätigt.",
      "Konto → Module aktiviert oder deaktiviert die optionalen Funktionen (Planung, Rentabilität, Aufmass, Katalog, Vorlagen…) organisationsweise — ein deaktiviertes Modul verschwindet einfach aus der Navigationsleiste, es gehen keine Daten verloren, wenn Sie es später wieder aktivieren.",
    ],
  },
  {
    id: 'personnalisation-abonnement',
    screenshot: 'personnalisation-abonnement',
    category: 'Anpassung & Abonnement',
    title: 'Markenkit, Pläne und Abonnement',
    keywords: ['farbe', 'logo', 'marke', 'plan', 'abonnement', 'stripe', 'kontingent'],
    body: [
      "Unter Konto → Unternehmen können Sie bereits ab dem Plan Essentiel die Markenfarbe und das Logo festlegen, die auf Ihren Offerten, Rechnungen und PDF-Berichten verwendet werden — eine Farbe wird sogar automatisch anhand Ihres Logos oder Ihrer Website vorgeschlagen.",
      "Offerten und Rechnungen sind bei allen Cantia-Plänen unbegrenzt. Was sich von Plan zu Plan unterscheidet, sind der Speicherplatz, die Anzahl der Mitglieder und der Zugriff auf bestimmte Module (Planung, Personal & Löhne, Liquidität, ab Équipe). Die Abonnementverwaltung erfolgt unter Konto → Abonnement (Stripe-Abrechnung).",
      "Konto → Speicherplatz zeigt den genutzten Speicherplatz nach Kategorie im Detail an (Fotos, PDFs, weitere Dateien) mit einer Schaltfläche für ein Upgrade auf einen höheren Plan, falls nötig.",
    ],
  },
  {
    id: 'tableau-de-bord',
    screenshot: 'tableau-de-bord',
    category: 'Erste Schritte',
    title: 'Die Startseite verstehen',
    keywords: ['startseite', 'dashboard', 'übersicht', 'kpi', 'verknüpfungen'],
    body: [
      "Der Startbildschirm zeigt die Kennzahlen, die im Alltag zählen: Offerten, die auf eine Antwort warten, unbezahlte oder überfällige Rechnungen und aktuell laufende Baustellen — auf einen Blick, ohne jedes Modul einzeln öffnen zu müssen.",
      "Die Verknüpfungen (neue Offerte, neue Rechnung, neue Baustelle) ermöglichen es, ein Dokument zu erstellen, ohne über das vollständige Menü zu gehen — praktisch vom Smartphone aus, zwischen zwei Terminen.",
      "Ein Banner zeigt wiederkehrende Ausgaben an, die in den nächsten 7 Tagen fällig werden (Modul Liquidität), bevor sie abgebucht werden, damit Sie nie überrascht werden.",
      "Die Startseite zeigt nur, was für Ihre Rolle relevant ist: Ein einfacher Mitarbeiter sieht seine eigenen Aufgaben und Baustellen, ein Administrator sieht die gesamte Organisation.",
    ],
  },
  {
    id: 'rejoindre-organisation',
    category: 'Erste Schritte',
    title: 'Einer bestehenden Organisation beitreten',
    keywords: ['beitreten', 'einladung', 'link', 'team', 'bestehende organisation'],
    body: [
      "Wenn Ihr Unternehmen Cantia bereits nutzt, müssen Sie keine neue Organisation erstellen: Ein Administrator sendet Ihnen einen Einladungslink (unter Konto → Team), der Sie bei Ihrer Registrierung direkt mit der bestehenden Organisation verknüpft.",
      "Ohne Einladungslink können Sie auch beantragen, einer Organisation anhand ihres Namens beizutreten — die Anfrage bleibt dann ausstehend, bis ein Administrator sie bestätigt.",
      "Sobald Sie zugeordnet sind, sehen Sie sofort die Baustellen, Kunden und Dokumente der Organisation, entsprechend den Berechtigungen Ihrer Rolle (Administrator, Personalsekretärin, oder einfacher Mitarbeiter).",
      "Es ist nicht möglich, mit demselben Konto gleichzeitig zwei Organisationen anzugehören — bei Bedarf müssen Sie eine Organisation verlassen, bevor Sie einer anderen beitreten.",
    ],
  },
  {
    id: 'dictee-vocale',
    category: 'Erste Schritte',
    title: 'Die Spracheingabe, überall in Cantia',
    keywords: ['diktieren', 'stimme', 'mikrofon', 'transkription', 'sprachsteuerung'],
    body: [
      "Die Mikrofon-Schaltfläche erscheint überall dort, wo Sie in Cantia etwas eingeben: eine Offertposition, eine Nachricht im Baustellen-Feed, eine Notiz im Rapport. Sie wandelt Ihre Stimme in strukturierten Text um, nicht nur in reinen Fliesstext.",
      "Bei einer Offertposition genügt es zum Beispiel, „Verlegen von zehn Quadratmetern Fliesen zu siebzig Franken pro Meter\" zu diktieren, um Beschreibung, Menge, Einheit und Einzelpreis auf einmal auszufüllen.",
      "Die Spracherkennung ist auf das Vokabular des Bauwesens abgestimmt (Materialien, Einheiten, Gewerke) — sie versteht sowohl Fachjargon als auch Umgangssprache.",
      "Eine zweite Mikrofon-Schaltfläche, die unten am Bildschirm (von jeder Seite der Anwendung aus zugänglich), funktioniert anders: Sie ist ein vollständiger Assistent, kein reines Diktat. Sagen Sie zum Beispiel „Baustelle Villa, von 7 bis 15 Uhr, Schalung\" oder „Schraubenkauf bei Bauhaus, 45 Franken\", und sie erkennt selbst, ob es sich um Stunden oder eine Ausgabe handelt, zu welcher Baustelle es gehört, und zeigt dann eine Zusammenfassung zur Bestätigung an (von Hand änderbar oder durch erneutes Diktieren), bevor irgendetwas gespeichert wird.",
      "Für das Diktieren selbst ist eine Internetverbindung nötig (die Transkription erfolgt auf sicheren Servern), aber alles bereits Erstellte bleibt danach offline einsehbar.",
    ],
  },
  {
    id: 'chantiers-documents',
    category: 'Baustellen & Berichte',
    title: 'Fotos und Dokumente der Baustelle',
    keywords: ['fotos', 'dokumente', 'ordnerstruktur', 'pläne', 'ablage', 'ordner'],
    body: [
      "Jede Baustelle hat ihren eigenen Dokumentenbereich, organisiert in Ordnern (Pläne, Bewilligungen, Verträge, Lieferantenrechnungen…) statt eines einfachen Haufens loser Dateien.",
      "Die im Baustellen-Feed aufgenommenen Fotos werden automatisch geolokalisiert und mit einem Zeitstempel versehen — nützlich als Nachweis bei späteren Streitigkeiten über den Zustand eines Bauteils.",
      "Ein Dokument kann jederzeit umbenannt, in einen anderen Ordner verschoben oder gelöscht werden; gängige Dateitypen (PDF, Bilder, Office-Dateien) öffnen sich direkt in der Vorschau, ohne vorherigen Download.",
      "Der von Baustellendokumenten und -fotos belegte Speicherplatz zählt zum Speicherkontingent der Organisation, einsehbar unter Konto → Speicherplatz.",
    ],
  },
  {
    id: 'chantiers-sous-traitants',
    category: 'Baustellen & Berichte',
    title: 'Subunternehmer auf einer Baustelle',
    keywords: ['subunternehmer', 'baustelle', 'lieferantenrechnung', 'verantwortung'],
    body: [
      "Ein Subunternehmer kann direkt zu einer bestimmten Baustelle hinzugefügt werden, mit seinen eigenen Kontaktdaten und der Nachverfolgung seiner mit dieser Baustelle verknüpften Rechnungen.",
      "Von einem Subunternehmer erhaltene Rechnungen werden mit ihrem Zahlungsstatus erfasst, was auch in die Rentabilitätsberechnung der Baustelle einfliesst (die Subunternehmer-Kosten werden den tatsächlichen Kosten hinzugerechnet).",
      "Das globale Verzeichnis der Subunternehmer (Modul Subunternehmer, in der Hauptnavigation) bündelt alle, mit denen Sie zusammenarbeiten, über eine einzelne Baustelle hinaus — siehe den entsprechenden Artikel.",
    ],
  },
  {
    id: 'travaux-supplementaires',
    category: 'Baustellen & Berichte',
    title: 'Zusatzarbeiten (ZA)',
    keywords: ['zusatzarbeiten', 'za', 'nachtrag', 'extra', 'mehrwert'],
    body: [
      "Eine Zusatzarbeit (ZA) ist ein eigenständiges Dokument für alles, was während der Bauausführung zusätzlich zur ursprünglichen Offerte verlangt wird — eine zu versetzende Wand, eine zusätzliche Steckdose. Sie wird von einer Baustelle aus erstellt, mit oder ohne Verknüpfung zur ursprünglichen Offerte.",
      "Sie wird genau wie eine Offerte verfasst, versendet und unterschrieben (Spracheingabe inklusive) und verwandelt sich nach Annahme durch den Kunden automatisch in eine Rechnung.",
      "Eine angenommene Zusatzarbeit wird automatisch zum offerierten Gesamtbetrag der Baustelle im Reiter Rentabilität addiert — keine manuelle Nachrechnung nötig, damit die Marge stimmt.",
      "Jede noch so kleine Zusatzarbeit zu dokumentieren, vermeidet die häufigste Situation am Ende einer Baustelle: eine tatsächlich ausgeführte, aber mangels schriftlicher Spur nie fakturierte Arbeit.",
    ],
  },
  {
    id: 'rh-heures-salaires',
    screenshot: 'rh-heures-salaires',
    category: 'Personal & Löhne',
    title: 'Stunden, Spesen und Lohnabrechnungen',
    keywords: ['personal', 'stunden', 'lohn', 'lohnabrechnung', 'ahv', 'bvg', 'quellensteuer'],
    body: [
      "Jeder Mitarbeiter erfasst seine Arbeitsstunden direkt über sein Smartphone, zugeordnet zu einer bestimmten Baustelle — so lässt sich anschliessend die geplante mit der tatsächlich aufgewendeten Zeit vergleichen, Baustelle für Baustelle.",
      "Berufliche Spesen (Kilometerentschädigung, Verpflegung…) werden auf dieselbe Weise erfasst, mit dem geltenden Pauschalsatz bereits vorkonfiguriert.",
      "Unter Konto → Personal erstellt die Personalsekretärin oder der Administrator die Lohnabrechnung jedes Mitarbeiters, von brutto bis netto, anhand von AHV-/ALV-/BVG-/UVG-Sätzen und eines pro Person konfigurierbaren Quellensteuersatzes — die Standardwerte sind Richtwerte, die entsprechend Ihrer Ausgleichskasse und Ihrem Kanton anzupassen sind.",
      "Ein einfacher Mitarbeiter sieht immer nur seine eigenen Stunden, Spesen und Lohnabrechnungen — nie die des restlichen Teams, ausser er hat selbst eine Personal- oder Administratorrolle.",
      "Die Stundenliste lässt sich in der gewünschten Granularität als CSV exportieren (täglich, wöchentlich, monatlich), um sie bei Bedarf an eine Treuhandstelle zu senden.",
    ],
  },
  {
    id: 'rh-heures-guide',
    category: 'Personal & Löhne',
    title: 'Arbeitszeit erfassen und pro Baustelle verrechnen — Schritt für Schritt',
    keywords: ['arbeitszeit', 'stunden', 'mobil', 'verrechnen', 'baustelle abrechnen', 'csv export', 'mitarbeiter'],
    body: [
      "Wie sich Cantia für die Arbeitszeiterfassung konkret anfühlt — vom Mitarbeiter-Smartphone auf der Baustelle bis zum Büro, das verrechnet und die Zahlen exportiert. Die drei folgenden Ansichten zeigen dieselbe Funktion aus drei verschiedenen Blickwinkeln.",
    ],
    steps: [
      {
        screenshot: 'heures-mobile-saisie',
        caption: 'Auf dem Smartphone wählt ein Mitarbeiter die betreffende Baustelle, trägt seine Stunden ein und was er gemacht hat — keine Installation nötig, alles läuft direkt im mobilen Browser. Mit der Schaltfläche „Eintrag diktieren" geht es auch per Sprache („Baustelle Renovation Villa, von 7 bis 15 Uhr, Schalung"): Cantia erkennt die Baustelle, berechnet die Stunden und speichert den Eintrag von selbst.',
      },
      {
        screenshot: 'heures-desktop-saisie',
        caption: 'Am Computer wird dasselbe Formular mit einem Kalender bedient, um zwischen den Tagen zu navigieren — praktisch, um mehrere Tage am Ende der Woche gesammelt nachzutragen. Die Schaltfläche „CSV exportieren" unten auf dem Blatt exportiert die Stunden des angezeigten Zeitraums.',
      },
      {
        screenshot: 'heures-admin-facturation',
        caption: 'Im Büro fasst der Tab „Abrechnung" unter Personal → Arbeitszeit die noch nicht verrechneten Stunden pro Baustelle und Arbeitstyp zusammen. Ein Klick auf „Diese Baustelle verrechnen" erstellt direkt die entsprechende Rechnung — die verwendeten Stunden werden als verrechnet markiert und erscheinen nicht mehr in den offenen Posten.',
      },
    ],
  },
  {
    id: 'tresorerie',
    category: 'Liquidität',
    title: 'Liquiditätsprognose',
    keywords: ['liquidität', 'prognose', 'cashflow', 'bank'],
    body: [
      "Das Modul Liquidität projiziert Ihren zukünftigen Saldo über 90 Tage, basierend auf dem, was Cantia bereits über Ihre Tätigkeit weiss: offene Kundenrechnungen, geschätzte Lohnsumme, unbezahlte Subunternehmer-Rechnungen und die von Ihnen erfassten wiederkehrenden Ausgaben.",
      "Es ist keine Bankverbindung erforderlich oder nötig: Sie geben Ihren Startsaldo manuell ein, wann immer Sie möchten.",
      "Eine wiederkehrende Ausgabe (Miete, Leasing, Versicherung…) wird einmalig mit ihrer Häufigkeit unter Ausgaben eingerichtet — sie erscheint danach automatisch in der untenstehenden Prognose, mit einer Erinnerung vor jeder Fälligkeit.",
      "Einmalige Anschaffungen ausserhalb einer Baustelle (Material, Werkzeug, diverse Kosten) werden ebenfalls unter Ausgaben erstellt, nie hier: Ein Foto des Belegs füllt Bezeichnung und Betrag automatisch aus, oder der Sprachassistent (Mikrofon-Schaltfläche) kann sie per Diktat hinzufügen. Sie erscheinen nicht in der untenstehenden Prognose, die nur wiederkehrende und vorhersehbare Bewegungen berücksichtigt.",
      "Der Hauptnutzen liegt nicht darin, die Zukunft auf den Franken genau vorherzusagen, sondern einen Engpass mehrere Wochen im Voraus zu erkennen: früh genug, um eine überfällige Rechnung zu mahnen oder einen nicht dringenden Kauf zu verschieben.",
    ],
  },
  {
    id: 'depenses',
    category: 'Liquidität',
    title: 'Ausgaben: erstellen, verfolgen und filtern',
    keywords: ['ausgaben', 'liste', 'filter', 'baustelle', 'allgemein', 'total', 'wiederkehrend', 'einmalig'],
    body: [
      "Der Bereich Ausgaben (in der Navigation, neben Liquidität) bündelt in einer einzigen Liste alle Ausgaben des Unternehmens: die einer bestimmten Baustelle zugeordneten (immer über den Reiter Rentabilität dieser Baustelle erfasst) und die allgemeinen Ausgaben ausserhalb einer Baustelle — die Sie direkt hier erstellen, ändern und löschen, mit einer Summe sowie Filtern nach Zeitraum (dieser Monat, letzte 30 Tage, alle) und nach Baustelle.",
      "Die Schaltfläche „Neue Ausgabe\" öffnet dasselbe Formular wie die Sprachnotiz: Ein Foto des Belegs füllt Bezeichnung und Betrag automatisch aus, vor dem Speichern zu prüfen. Ein separater Reiter „Wiederkehrend\" verwaltet regelmässig anfallende Kosten (Miete, Abonnements, Versicherungen…), mit einer Erinnerung vor jeder Fälligkeit — von dort aus fliessen sie auch in die Liquiditätsprognose ein.",
      "Das Antippen einer mit einer Baustelle verknüpften Zeile öffnet den Reiter Rentabilität dieser Baustelle; das Antippen einer allgemeinen Ausgabe öffnet sie genau hier zur Bearbeitung — praktisch, um zu prüfen, ob eine per Sprache oder Scan hinzugefügte Ausgabe am richtigen Ort gelandet ist, oder um sie zu korrigieren.",
      "Verfügbar, sobald Rentabilität oder Liquidität es ist (Team-Plan): Die Liste passt sich an das an, was Ihr Plan abdeckt, aber das Erstellen allgemeiner oder wiederkehrender Ausgaben erfordert Liquidität.",
    ],
  },
  {
    id: 'clients',
    screenshot: 'clients',
    category: 'Kunden',
    title: 'Die Kundenkartei',
    keywords: ['kunde', 'verlauf', 'kartei', 'kontaktdaten', 'mahnung'],
    body: [
      "Jeder Kunde hat seine eigene Kundenkartei: Kontaktdaten, vollständiger Verlauf seiner Offerten, Rechnungen und Baustellen, sowie Notizen zur Nachverfolgung — ein einziger Ort statt einer Suche in den E-Mails bei jedem neuen Kontakt.",
      "Ein Kunde wird automatisch bei der ersten Offerte erstellt, oder manuell über das Modul Kunden, wenn Sie eine Kartei schon vor dem ersten Dokument anlegen möchten.",
      "Der zentralisierte Verlauf erlaubt es, wiederkehrende Kunden leicht zu erkennen (oft die rentabelsten für eine langfristige Bindung) und auf einen Blick zu wissen, wen man wozu erneut kontaktieren sollte.",
    ],
  },
  {
    id: 'sous-traitants',
    category: 'Subunternehmer',
    title: 'Das Verzeichnis der Subunternehmer',
    keywords: ['subunternehmer', 'verzeichnis', 'register', 'rechnung'],
    body: [
      "Das Modul Subunternehmer (aktivierbar unter Konto → Module) bündelt alle Subunternehmer, mit denen Sie zusammenarbeiten, über eine einzelne Baustelle hinaus — Kontaktdaten, Gewerk und Verlauf der erhaltenen Rechnungen.",
      "Ein Subunternehmer aus dem Verzeichnis kann mit wenigen Klicks zu jeder beliebigen Baustelle hinzugefügt werden, ohne seine Kontaktdaten jedes Mal neu einzugeben.",
      "Die Nachverfolgung der Subunternehmer-Rechnungen (bezahlt, ausstehend) gibt einen klaren Überblick darüber, was noch offen ist — nützlich sowohl für die Liquidität als auch für die Rentabilität pro Baustelle.",
    ],
  },
  {
    id: 'integration-bexio',
    category: 'Integrationen',
    title: 'Bexio-Integration',
    keywords: ['bexio', 'integration', 'buchhaltung', 'synchronisierung'],
    body: [
      "Die Bexio-Integration (verfügbar ab dem Team-Plan) verbindet Cantia über die offizielle Bexio-API mit Ihrer Buchhaltung, unter Konto → Integrationen.",
      "Einmal verbunden, werden Kunden und Katalogpositionen automatisch importiert, und jede Cantia-Rechnung kann mit einem Klick an Bexio gesendet werden.",
      "Jede Rechnung kommt bei Bexio ausschliesslich als Entwurf an — die Finalisierung bleibt immer eine manuelle Aktion auf Bexio-Seite, um die Kontrolle darüber zu behalten, was tatsächlich in die Buchhaltung übergeht.",
      "Das Trennen der Integration widerruft sofort die Zugriffsrechte: Danach werden keine Daten mehr zwischen den beiden Tools ausgetauscht.",
    ],
  },
  {
    id: 'relances-impayes',
    category: 'Rechnungsstellung',
    title: 'Eine unbezahlte Rechnung mahnen',
    keywords: ['mahnung', 'unbezahlt', 'verzug', 'erinnerung', 'verzugszins'],
    body: [
      "Eine überfällige Rechnung erscheint direkt auf der Startseite und in der Rechnungsliste, ohne dass ein Kontoauszug manuell mit einer Liste versendeter Dokumente verglichen werden muss.",
      "Eine erste, neutral formulierte Mahnung, die bereits am Tag nach dem verpassten Fälligkeitsdatum versendet wird, genügt in den meisten Fällen — der Ton kann bei einer zweiten Mahnung bei Bedarf schärfer werden.",
      "Die QR-Referenz jeder Rechnung erlaubt es, eine eingegangene Zahlung in Sekundenschnelle abzugleichen, was verhindert, dass ein Kunde, der bereits bezahlt hat, versehentlich gemahnt wird.",
    ],
  },
  {
    id: 'import-releve-bancaire',
    category: 'Rechnungsstellung',
    title: 'Kontoauszug importieren',
    keywords: ['kontoauszug', 'import', 'abgleich', 'camt', 'zahlung'],
    body: [
      "Unter Rechnungsstellung → Kontoauszug-Import kann eine Kontoauszugsdatei (insbesondere im camt.053-Format) importiert werden, um erhaltene Zahlungen automatisch mit offenen Rechnungen abzugleichen.",
      "Der Abgleich erfolgt vorrangig über die QR-Referenz jeder Zahlung — ein exakter, zu 100 % zuverlässiger Treffer. Zahlt ein Kunde ohne diese Referenz, versucht Cantia anschliessend einen Abgleich über den Betrag und, als letzten Ausweg, über eine Namensähnlichkeit (auch wenn die Wortreihenfolge abweicht, etwa bei einem Auszug, der Vor- und Nachname vertauscht).",
      "Abgleiche über Namensähnlichkeit werden gesondert angezeigt und nie automatisch abgehakt — sie erfordern eine Prüfung vor der Bestätigung, im Gegensatz zu exakten Abgleichen (Referenz oder eindeutiger Betrag), die es bereits sind.",
      "Dieser Import ersetzt keine dauerhafte Bankverbindung: Es handelt sich um einen punktuellen Import, den Sie so oft wie gewünscht durchführen können, ohne Cantia jemals direkten Zugriff auf Ihr Konto zu geben.",
    ],
  },
  {
    id: 'portail-client',
    category: 'Rechnungsstellung',
    title: 'Was der Kunde auf seinem Portal sieht',
    keywords: ['kundenportal', 'kundenlink', 'online-unterschrift', 'sicherheit'],
    body: [
      "Der an einen Kunden gesendete Link öffnet ein sicheres Portal, ohne dass er ein Konto oder Passwort erstellen muss — nur seine E-Mail-Adresse, die Cantia bereits kennt.",
      "Eine doppelte Überprüfung schützt den Zugriff: Ein per E-Mail erhaltener Code muss eingegeben werden, bevor das Dokument eingesehen werden kann, damit ein verlorener Link allein nicht ausreicht.",
      "Bei einer Offerte oder einer Zusatzarbeit sieht der Kunde die bepreiste Detailübersicht und unterschreibt online (Maus, Finger oder Hochladen eines Fotos der Unterschrift) — die Annahme wird mit Zeitstempel versehen und löst automatisch die nächsten Schritte auf Cantia-Seite aus.",
      "Bei einer Rechnung bleibt das Portal schreibgeschützt: Der Kunde sieht die Details und den verbleibenden Restbetrag, kann eine Zahlung aber nie selbst als erhalten markieren.",
    ],
  },
];
