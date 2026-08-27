import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'excel-vs-logiciel-gestion-chantier-limites',
  question: 'Excel suffit-il pour gérer une entreprise du bâtiment, ou faut-il passer à un vrai logiciel ?',
  title: 'Excel pour gérer ses chantiers : jusqu’où ça tient, et où ça casse',
  description:
    'Excel fonctionne bien à petite échelle — jusqu’à ce qu’un deuxième employé le modifie en même temps, ou qu’un devis oublié coûte plus cher que l’outil censé le remplacer.',
  excerpt:
    'Beaucoup d’entreprises du bâtiment démarrent avec un fichier Excel bricolé au fil des années. Ce n’est pas un mauvais choix au départ — c’est un choix qui vieillit mal, souvent sans qu’on s’en rende compte.',
  category: 'Comparatifs & outils',
  keywords: ['excel gestion chantier', 'logiciel vs excel bâtiment', 'limites tableur construction', 'digitalisation PME bâtiment', 'outil devis facture'],
  publishedAt: '2026-07-19',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Excel reste un outil redoutablement efficace pour ce qu’il fait bien : calculer, trier, ajuster une formule en quelques secondes. Le problème n’est jamais Excel en tant que tel — c’est le moment où un fichier de suivi de chantier, pensé à l’origine pour un usage simple, se retrouve à porter des responsabilités pour lesquelles il n’a pas été conçu.',
    },
    { type: 'h2', text: 'Là où Excel tient très bien' },
    {
      type: 'list',
      items: [
        'Un calcul ponctuel de métré ou de quantité de matériaux',
        'Un budget prévisionnel simple pour un chantier isolé',
        'Une liste de contacts ou de fournisseurs sans besoin de mise à jour partagée en temps réel',
      ],
    },
    { type: 'h2', text: 'Là où ça casse à l’échelle' },
    {
      type: 'list',
      items: [
        'Deux personnes qui modifient le même fichier en parallèle — le risque d’écraser le travail de l’autre sans avertissement existe toujours',
        'Aucune trace fiable de qui a changé quoi, ni quand — un litige avec un client devient difficile à documenter précisément',
        'Un devis validé oralement mais jamais formalisé, perdu dans un onglet oublié',
        'Un fichier qui grossit avec les années, devient lent, et où une seule formule cassée fausse silencieusement tout un tableau',
        'Aucun lien automatique entre un devis, la facture qui en découle, et le paiement réellement reçu — tout le rapprochement se fait à la main',
      ],
    },
    {
      type: 'callout',
      title: 'Le vrai coût d’Excel n’est pas dans le fichier, il est dans les erreurs qu’il ne montre pas',
      text: 'Un tableau de suivi qui « a l’air à jour » peut cacher un devis jamais facturé ou une facture jamais relancée — Excel ne signale jamais activement ce qui a été oublié, contrairement à un outil pensé pour ça.',
    },
    {
      type: 'cta',
      title: 'Le même besoin, sans les angles morts d’un tableur',
      text: 'Cantia relie automatiquement devis, factures QR et paiements par client et par chantier — ce qu’Excel ne fait jamais tout seul, même bien organisé.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Excel est-il suffisant pour une petite entreprise du bâtiment ?',
      answer:
        'Pour un usage ponctuel (métré, budget isolé), oui — mais dès que plusieurs personnes travaillent sur le même suivi ou que le volume de devis/factures augmente, les limites deviennent rapidement problématiques.',
    },
    {
      question: 'Quel est le principal risque d’Excel pour la gestion de chantier ?',
      answer:
        'L’absence de trace fiable des modifications et l’absence de lien automatique entre devis, facture et paiement — les oublis ne sont jamais signalés activement par le fichier.',
    },
    {
      question: 'À partir de quand faut-il envisager un vrai logiciel de gestion ?',
      answer:
        'Dès que plusieurs chantiers tournent en parallèle ou que plusieurs personnes doivent accéder aux mêmes informations en même temps, un tableur devient un point de friction plutôt qu’un gain de temps.',
    },
  ],
  relatedSlugs: [
    'logiciel-gestion-chantier-independant-seul',
    'combien-coute-logiciel-gestion-chantier-roi',
    'suivre-rentabilite-chantier-sans-excel',
  ],
};
