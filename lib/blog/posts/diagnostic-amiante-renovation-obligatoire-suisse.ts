import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'diagnostic-amiante-renovation-obligatoire-suisse',
  question: 'Quand un diagnostic amiante est-il obligatoire avant une rénovation en Suisse ?',
  title: 'Amiante avant rénovation : quand un diagnostic est-il obligatoire',
  description:
    'Quels bâtiments sont concernés par le risque amiante avant travaux de rénovation en Suisse, pourquoi c’est la responsabilité de l’entreprise exécutante, et la marche à suivre avant de commencer.',
  excerpt:
    'Un chantier de rénovation qui touche une dalle, une colle ou une toiture ancienne peut libérer des fibres d’amiante sans que personne ne s’en doute. Voici quand se poser sérieusement la question, avant de sortir la disqueuse.',
  category: 'Juridique & normes',
  keywords: [
    'diagnostic amiante rénovation obligatoire',
    'amiante avant travaux suisse',
    'bâtiment amiante rénovation entreprise',
    'suva amiante chantier',
    'quand faire diagnostic amiante',
  ],
  publishedAt: '2026-09-23',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'L’amiante a été progressivement interdit en Suisse, et la plupart des bâtiments construits ou rénovés avant les années 1990 peuvent encore contenir des matériaux qui en renferment : dalles de sol, colles, flocages, ardoises de façade, conduits ou joints. Dès qu’une rénovation touche ce type de matériau, la question du diagnostic amiante n’est pas une précaution facultative, c’est une question de sécurité directe pour les personnes qui exécutent les travaux.',
    },
    { type: 'h2', text: 'Quels bâtiments et quels travaux sont concernés' },
    {
      type: 'p',
      text: 'Le risque concerne en priorité les bâtiments construits ou rénovés avant les années 1990, période avant laquelle l’amiante était encore couramment utilisé dans de nombreux matériaux de construction. Tous les travaux ne sont pas concernés de la même façon : une simple peinture ne présente pas le même risque qu’un perçage, une découpe ou une démolition partielle qui touche une dalle, une plaque ou un revêtement susceptible d’en contenir. C’est le type d’intervention, pas seulement l’âge du bâtiment, qui détermine le niveau de vigilance nécessaire.',
    },
    { type: 'h2', text: 'Pourquoi c’est la responsabilité de l’entreprise qui exécute' },
    {
      type: 'p',
      text: 'Même quand le maître d’ouvrage n’a pas anticipé la question, c’est l’entreprise qui exécute les travaux qui reste responsable de la sécurité de ses employés sur le chantier. Faire travailler une équipe sur un matériau suspect sans diagnostic préalable expose l’entreprise à un risque sanitaire réel pour ses ouvriers, et à un risque juridique en cas d’incident constaté a posteriori.',
    },
    { type: 'h2', text: 'La marche à suivre avant de démarrer' },
    {
      type: 'list',
      items: [
        'Identifier, avant le début des travaux, si le bâtiment et les matériaux concernés sont susceptibles de contenir de l’amiante, en particulier pour tout bâtiment antérieur aux années 1990.',
        'Faire réaliser un diagnostic par un spécialiste, qui analyse les matériaux suspects avant toute intervention qui pourrait les altérer (perçage, découpe, démolition).',
        'Adapter la méthode de travail si de l’amiante est détecté, souvent via une entreprise spécialisée dans le désamiantage plutôt que l’équipe habituelle du chantier.',
        'Documenter la démarche, y compris quand le diagnostic conclut à l’absence d’amiante, pour couvrir la responsabilité de l’entreprise en cas de contrôle ultérieur.',
      ],
    },
    {
      type: 'callout',
      title: 'Ce que la SUVA surveille de près',
      text: 'La SUVA considère l’exposition à l’amiante comme un risque professionnel majeur et peut intervenir en cas de non-respect des mesures de prévention sur un chantier. Au-delà de la sanction, c’est un risque sanitaire réel et différé pour les ouvriers concernés, ce qui en fait un des points les moins négociables de la sécurité de chantier.',
    },
    {
      type: 'cta',
      title: 'Une rénovation, ça se planifie avant de sortir les outils',
      text: 'Cantia aide à garder trace de chaque étape préparatoire d’un chantier de rénovation, y compris les diagnostics réalisés avant travaux, pour que rien ne se perde entre le devis et le premier coup de disqueuse.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Un diagnostic amiante est-il obligatoire pour tous les bâtiments anciens ?',
      answer:
        'Il est fortement recommandé, et souvent exigé en pratique, dès qu’un bâtiment antérieur aux années 1990 fait l’objet de travaux susceptibles de toucher des matériaux suspects. La prudence s’impose dès le doute, même sans certitude absolue sur la date de construction.',
    },
    {
      question: 'Qui doit payer le diagnostic amiante, le maître d’ouvrage ou l’entreprise ?',
      answer:
        'Cela dépend généralement de ce qui est convenu contractuellement, mais l’entreprise qui exécute les travaux a intérêt à s’assurer que ce diagnostic existe avant de démarrer, quelle que soit la partie qui le finance.',
    },
    {
      question: 'Que faire si de l’amiante est découvert en cours de chantier, sans diagnostic préalable ?',
      answer:
        'Il faut arrêter immédiatement les travaux sur la zone concernée, sécuriser le périmètre, et faire intervenir une entreprise spécialisée dans le désamiantage avant toute reprise du chantier.',
    },
  ],
  relatedSlugs: [
    'permis-construire-renovation-quand-necessaire',
    'accident-travail-chantier-obligations-employeur-suva',
    'assurance-chantier-tous-risques-ectr-obligatoire',
  ],
};
