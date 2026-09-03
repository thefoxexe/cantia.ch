// Static content for the in-app help library (Compte → Aide) — bundled with
// the app rather than stored per-organization in the DB, since it explains
// how Cantia itself works and doesn't vary between organizations.
export interface HelpArticle {
  id: string;
  category: string;
  title: string;
  keywords: string[];
  body: string[]; // one string per paragraph
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
    keywords: ['rentabilité', 'coût', 'dépense', 'main d\'œuvre', 'marge'],
    body: [
      "L'onglet Rentabilité d'un chantier compare le montant devisé/facturé au coût réel : matériel (dépenses saisies manuellement) et main d'œuvre (estimée à partir des affectations Planning et du coût horaire moyen défini dans Compte → Facturation).",
      "Un badge indique en un coup d'œil si le chantier est en dessous, autour ou au-dessus du seuil de rentabilité, pour repérer vite un chantier qui dérape avant la fin.",
    ],
  },
  {
    id: 'planning',
    category: 'Planning',
    title: "Planning d'équipe",
    keywords: ['planning', 'équipe', 'affectation', 'calendrier'],
    body: [
      "Le Planning affiche un vrai calendrier où chaque membre de l'équipe peut être affecté à un chantier sur une ou plusieurs journées.",
      "Ces affectations alimentent directement l'estimation de main-d'œuvre de l'onglet Rentabilité — pas besoin de pointeuse séparée pour avoir une estimation raisonnable des heures passées sur un chantier.",
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
  {
    id: 'tresorerie',
    category: 'Trésorerie',
    title: 'Prévision de trésorerie',
    keywords: ['trésorerie', 'liquidité', 'prévision', 'cashflow', 'banque'],
    body: [
      "Le module Trésorerie projette votre solde à venir sur 90 jours, à partir de ce que Cantia sait déjà de votre activité : factures clients non soldées, estimation de la masse salariale, factures sous-traitants impayées et dépenses récurrentes que vous enregistrez.",
      "Aucune connexion bancaire n'est demandée ni nécessaire : vous saisissez votre solde de départ manuellement, quand vous le souhaitez.",
      "Une dépense récurrente (loyer, leasing, assurance…) se configure une seule fois avec sa fréquence — elle réapparaît ensuite automatiquement dans la projection, avec un rappel avant chaque échéance.",
      "L'intérêt principal n'est pas de prédire l'avenir au franc près, mais de repérer un creux plusieurs semaines à l'avance : assez tôt pour relancer une facture en retard ou décaler un achat non urgent.",
    ],
  },
  {
    id: 'clients',
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
      "Le rapprochement se fait via la référence QR de chaque paiement — les lignes du relevé qui ne correspondent à aucune facture connue sont signalées, pour être traitées manuellement si besoin.",
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
    keywords: ['rentabilität', 'kosten', 'ausgabe', 'arbeitskraft', 'marge'],
    body: [
      "Der Reiter Rentabilität einer Baustelle vergleicht den offerierten/fakturierten Betrag mit den tatsächlichen Kosten: Material (manuell erfasste Ausgaben) und Arbeitskraft (geschätzt anhand der Planungs-Zuweisungen und des unter Konto → Rechnungsstellung festgelegten durchschnittlichen Stundenkostensatzes).",
      "Ein Badge zeigt auf einen Blick, ob die Baustelle unter, um oder über der Rentabilitätsschwelle liegt, damit eine aus dem Ruder laufende Baustelle frühzeitig erkannt wird.",
    ],
  },
  {
    id: 'planning',
    category: 'Planung',
    title: 'Team-Planung',
    keywords: ['planung', 'team', 'zuweisung', 'kalender'],
    body: [
      "Die Planung zeigt einen echten Kalender, in dem jedes Teammitglied für einen oder mehrere Tage einer Baustelle zugewiesen werden kann.",
      "Diese Zuweisungen fliessen direkt in die Arbeitskraft-Schätzung des Rentabilitäts-Reiters ein — für eine vernünftige Schätzung der auf einer Baustelle verbrachten Stunden ist keine separate Stempeluhr nötig.",
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
    category: 'Anpassung & Abonnement',
    title: 'Markenkit, Pläne und Abonnement',
    keywords: ['farbe', 'logo', 'marke', 'plan', 'abonnement', 'stripe', 'kontingent'],
    body: [
      "Unter Konto → Unternehmen können Sie bereits ab dem Plan Essentiel die Markenfarbe und das Logo festlegen, die auf Ihren Offerten, Rechnungen und PDF-Berichten verwendet werden — eine Farbe wird sogar automatisch anhand Ihres Logos oder Ihrer Website vorgeschlagen.",
      "Offerten und Rechnungen sind bei allen Cantia-Plänen unbegrenzt. Was sich von Plan zu Plan unterscheidet, sind der Speicherplatz, die Anzahl der Mitglieder und der Zugriff auf bestimmte Module (Planung, Personal & Löhne, Liquidität, ab Équipe). Die Abonnementverwaltung erfolgt unter Konto → Abonnement (Stripe-Abrechnung).",
      "Konto → Speicherplatz zeigt den genutzten Speicherplatz nach Kategorie im Detail an (Fotos, PDFs, weitere Dateien) mit einer Schaltfläche für ein Upgrade auf einen höheren Plan, falls nötig.",
    ],
  },
];
