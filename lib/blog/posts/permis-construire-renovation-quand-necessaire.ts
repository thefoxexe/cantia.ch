import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'permis-construire-renovation-quand-necessaire',
  question: 'Faut-il un permis de construire pour une rénovation en Suisse ?',
  title: 'Permis de construire pour une rénovation : quand c’est nécessaire',
  description:
    'Refaire une cuisine ou une salle de bains ne demande en principe pas de permis. Dès que la structure, l’aspect extérieur ou l’affectation changent, la donne change, et cela dépend fortement du canton.',
  excerpt:
    'Refaire une salle de bains ne demande en principe aucun permis. Toucher un mur porteur, si, et la limite entre les deux se joue à des détails que peu d’artisans vérifient avant de commencer.',
  category: 'Juridique & normes',
  keywords: ['permis de construire', 'rénovation', 'procédure d’annonce', 'autorisation travaux', 'canton'],
  publishedAt: '2026-03-16',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Une rénovation intérieure qui ne touche ni la structure porteuse ni l’usage des locaux est en principe dispensée de permis en Suisse : refaire une cuisine, une salle de bains, des sols ou des peintures ne demande généralement aucune autorisation. La règle change dès qu’un mur porteur, l’aspect extérieur ou l’affectation d’un local entrent dans l’équation.',
    },
    { type: 'h2', text: 'Ce qui passe généralement sans permis' },
    {
      type: 'list',
      items: [
        'Rénovation intérieure sans toucher la structure (cuisine, salle de bains, revêtements, peinture)',
        'Remplacement à l’identique d’installations existantes (chauffage, sanitaires, électricité)',
        'Petites interventions d’entretien courant',
      ],
    },
    {
      type: 'h2', text: 'Ce qui déclenche presque toujours une procédure' },
    {
      type: 'list',
      items: [
        'Toute modification touchant à la structure porteuse (mur porteur abattu ou percé)',
        'Un changement d’aspect extérieur (façade, toiture, fenêtres visibles depuis l’extérieur)',
        'Un changement d’affectation d’un local (transformer un garage en pièce habitable, par exemple)',
        'Toute question de sécurité incendie modifiée par les travaux',
      ],
    },
    {
      type: 'callout',
      title: 'Le piège : « dispensé de permis » ne veut pas dire « dispensé d’annonce »',
      text: 'Même les petits travaux doivent souvent être annoncés à la commune avant leur démarrage, pour qu’elle décide elle-même de la procédure adéquate (procédure d’annonce simplifiée, sans mise à l’enquête publique ni recours des voisins, ou procédure complète). Démarrer sans avoir annoncé, même pour des travaux qui auraient été dispensés de permis, expose à un arrêt de chantier.',
    },
    { type: 'h2', text: 'La vraie variable : le canton, pas la Confédération' },
    {
      type: 'p',
      text: 'Il n’existe pas de règle fédérale unique : chaque canton, parfois chaque commune, fixe ses propres seuils de dispense et ses propres procédures. Un même chantier de rénovation peut être totalement libre dans un canton et soumis à annonce simplifiée dans un autre. Vérifier auprès de la commune avant de s’engager coûte une visite ; ne pas le faire peut coûter un arrêt de chantier en cours de route.',
    },
    {
      type: 'p',
      text: 'Sur un chantier qui touche potentiellement à la structure ou à l’aspect extérieur, mieux vaut poser la question à la commune avant le devis, pas après. Un délai de procédure mal anticipé se répercute directement sur le planning promis au client.',
    },
    {
      type: 'cta',
      title: 'Le planning du chantier, jamais perdu de vue',
      text: 'Le planning d’équipe Cantia rattache chaque affectation à un chantier précis, ce qui aide à absorber un délai de procédure sans perdre le fil du reste des engagements.',
      buttonLabel: 'Découvrir le planning d’équipe',
    },
  ],
  faq: [
    {
      question: 'Refaire une cuisine ou une salle de bains nécessite-t-il un permis ?',
      answer:
        'En principe non, tant que la structure porteuse et l’usage des locaux ne sont pas modifiés. Une annonce à la commune peut toutefois rester nécessaire selon le canton.',
    },
    {
      question: 'Quels travaux de rénovation nécessitent presque toujours un permis ?',
      answer:
        'Tout ce qui touche à un mur porteur, à l’aspect extérieur du bâtiment, à l’affectation d’un local ou à la sécurité incendie déclenche généralement une procédure.',
    },
    {
      question: 'Les règles de permis sont-elles les mêmes dans tous les cantons suisses ?',
      answer:
        'Non, ce n’est pas le cas. Chaque canton, parfois chaque commune, fixe ses propres seuils de dispense et procédures : il n’existe pas de règle fédérale unique pour les rénovations.',
    },
  ],
  relatedSlugs: [
    'contrat-entreprise-vs-mandat-artisan',
    'garantie-travaux-construction-2-ou-5-ans',
    'norme-sia-118-devis-obligatoire',
  ],
};
