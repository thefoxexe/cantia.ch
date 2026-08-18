// Single source of truth for the video tutorial library (public /aide/videos
// page). Each entry is a placeholder until a real YouTube video exists —
// `youtubeId` stays null (renders as "Bientôt disponible") until one is
// recorded and uploaded; fill it in with just the video's 11-char ID (the
// part after "v=" or "youtu.be/") and the card goes live automatically,
// no other code change needed.
export interface TutorialVideo {
  id: string;
  title: string;
  description: string;
  youtubeId: string | null;
}

export const TUTORIAL_VIDEOS: TutorialVideo[] = [
  {
    id: 'prise-en-main',
    title: 'Prise en main de Cantia',
    description: "Créer son entreprise, inviter l'équipe et faire le tour des modules en 5 minutes.",
    youtubeId: null,
  },
  {
    id: 'devis',
    title: 'Créer un devis',
    description: 'Ajouter des positions, utiliser une trame, envoyer et suivre le statut jusqu’à la signature.',
    youtubeId: null,
  },
  {
    id: 'facturation',
    title: 'Facturer avec le QR-facture suisse',
    description: 'Convertir un devis accepté en facture, générer le QR-code de paiement et suivre les encaissements.',
    youtubeId: null,
  },
  {
    id: 'rapports-chantier',
    title: 'Rapport de chantier depuis le fil',
    description: 'Publier des photos et notes sur le fil du chantier, puis générer un rapport PDF en un clic.',
    youtubeId: null,
  },
  {
    id: 'dictee-vocale',
    title: 'Dicter au lieu de taper',
    description: 'Utiliser la dictée vocale pour remplir un devis, un rapport ou une note du fil à la voix.',
    youtubeId: null,
  },
  {
    id: 'planning',
    title: "Planifier l'équipe",
    description: 'Affecter chaque employé à un chantier (ou une tâche libre) semaine par semaine.',
    youtubeId: null,
  },
  {
    id: 'rh-salaires',
    title: 'Heures, frais et salaires',
    description: "Pointer ses heures par chantier, gérer les frais professionnels et éditer les fiches de salaire.",
    youtubeId: null,
  },
  {
    id: 'rentabilite',
    title: 'Suivre la rentabilité d’un chantier',
    description: 'Comparer le devisé au coût réel (matériel + main d’œuvre) chantier par chantier.',
    youtubeId: null,
  },
  {
    id: 'sous-traitants',
    title: 'Gérer les sous-traitants',
    description: "Affecter une entreprise sous-traitée à un chantier et suivre ses factures reçues.",
    youtubeId: null,
  },
  {
    id: 'metre',
    title: 'Métré chantier',
    description: 'Tenir le tableau de quantités poste par poste directement depuis le chantier.',
    youtubeId: null,
  },
  {
    id: 'inventaire',
    title: 'Inventaire & catalogue',
    description: 'Constituer son catalogue de prix et l’utiliser pour préremplir les devis automatiquement.',
    youtubeId: null,
  },
];
