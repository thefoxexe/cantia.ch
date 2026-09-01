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
];
