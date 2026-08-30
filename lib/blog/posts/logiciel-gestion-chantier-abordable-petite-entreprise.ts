import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'logiciel-gestion-chantier-abordable-petite-entreprise',
  question: 'Existe-t-il un logiciel de gestion de chantier abordable pour une petite entreprise ?',
  title: 'Un logiciel de gestion de chantier abordable, ça existe vraiment',
  description:
    'Le suivi de chantier a longtemps été réservé aux grandes entreprises avec des outils coûteux. Ce qui a changé, et pourquoi une petite structure peut aujourd\'hui y accéder facilement.',
  excerpt:
    'Longtemps réservé aux grandes entreprises de construction, le suivi de chantier numérique est aujourd\'hui accessible à une petite structure, souvent pour le prix d\'un abonnement mensuel modeste.',
  category: 'Comparatifs & outils',
  keywords: ['logiciel gestion chantier abordable', 'suivi chantier prix accessible', 'outil chantier petite entreprise bâtiment', 'application chantier pas cher Suisse', 'gestion de chantier économique'],
  publishedAt: '2026-07-25',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Le suivi de chantier numérique — photos, avancement, documents — a longtemps été perçu comme un outil de grande entreprise, avec des coûts et une complexité qui décourageaient les petites structures. Cette image ne correspond plus à l\'offre actuelle.',
    },
    { type: 'h2', text: 'Ce qui a changé' },
    {
      type: 'list',
      items: [
        'Le suivi de chantier est aujourd\'hui souvent inclus dans un abonnement mensuel abordable, pas vendu comme un module séparé coûteux',
        'Les applications mobiles modernes rendent la prise de photo et la documentation aussi simples qu\'un message texte',
        'Le stockage cloud a fait baisser le coût de conservation des photos et documents dans le temps',
      ],
    },
    {
      type: 'stat',
      value: 'CHF 30-60',
      label: 'coût mensuel typique pour un suivi de chantier numérique inclus dans un outil de gestion pensé pour une petite entreprise, contre plusieurs centaines de francs pour d\'anciennes solutions dédiées',
    },
    { type: 'h2', text: 'Ce qu\'un suivi de chantier abordable doit quand même couvrir' },
    {
      type: 'p',
      text: 'Le prix bas ne doit pas se faire au détriment de l\'essentiel : photos géolocalisées et horodatées (utiles en cas de litige), organisation par chantier, et accès simple depuis un téléphone. Un outil qui coche ces trois cases reste abordable sans être limité.',
    },
    {
      type: 'callout',
      title: 'Le vrai coût d\'absence de suivi de chantier',
      text: 'Sans documentation régulière, une contestation client ou un désaccord avec un sous-traitant devient beaucoup plus difficile à trancher — le coût de l\'absence d\'outil dépasse souvent celui de l\'outil lui-même.',
    },
    {
      type: 'cta',
      title: 'Le suivi de chantier inclus, pas en option coûteuse',
      text: 'Cantia intègre le suivi de chantier (photos, avancement, documents) directement dans ses plans, sans surcoût caché.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Le suivi de chantier numérique est-il réservé aux grandes entreprises ?',
      answer:
        'Non — il est aujourd\'hui accessible aux petites structures, souvent inclus dans un abonnement mensuel abordable plutôt que vendu comme un module séparé coûteux.',
    },
    {
      question: 'Quel est le coût typique d\'un suivi de chantier pour une petite entreprise ?',
      answer:
        'Généralement entre CHF 30 et 60 par mois, intégré à un outil de gestion plus large plutôt que facturé comme un service à part.',
    },
    {
      question: 'Que doit couvrir un suivi de chantier même dans une offre abordable ?',
      answer:
        'Au minimum des photos géolocalisées et horodatées, une organisation claire par chantier, et un accès simple depuis un téléphone.',
    },
  ],
  relatedSlugs: [
    'photos-chantier-preuve-juridique-litige',
    'application-hors-ligne-chantier-pourquoi-important',
    'combien-coute-logiciel-gestion-chantier-roi',
  ],
};
