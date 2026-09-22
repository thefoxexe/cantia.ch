import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-facture-genie-civil-suisse',
  question: 'Comment établir devis et factures en tant qu’entreprise de génie civil ?',
  title: 'Devis et facturation pour une entreprise de génie civil',
  description:
    'Métré de grande envergure, marchés publics, situations d’avancement, cautionnements : comment chiffrer et facturer un chantier de génie civil en Suisse.',
  excerpt:
    'Infrastructures, routes, ouvrages d’art : le génie civil se chiffre à une échelle différente du bâtiment classique, avec des règles de facturation qui suivent l’avancement du chantier.',
  category: 'Métiers du bâtiment',
  keywords: ['devis génie civil suisse', 'facturation situations avancement chantier', 'marchés publics génie civil'],
  publishedAt: '2026-10-12',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'Le génie civil se distingue du bâtiment classique par son objet : infrastructures, routes, ponts, ouvrages d’art, souvent réalisés dans le cadre de marchés publics. Cette différence de nature entraîne des méthodes de chiffrage et de facturation spécifiques, adaptées à des chantiers de plus grande envergure et de plus longue durée.',
    },
    { type: 'h2', text: 'Un chiffrage à plus grande échelle, un métré précis indispensable' },
    {
      type: 'p',
      text: 'Les quantités en jeu sur un chantier de génie civil sont généralement bien plus importantes qu’en bâtiment : volumes de terrassement massifs, longueurs de canalisation, surfaces de chaussée. Une erreur de métré, même faible en pourcentage, peut représenter un écart financier considérable en valeur absolue. Le métré doit donc être établi avec une rigueur particulière, souvent vérifié à plusieurs reprises avant la remise d’offre.',
    },
    { type: 'h2', text: 'Les marchés publics, un cadre de soumission spécifique' },
    {
      type: 'p',
      text: 'Une part importante des chantiers de génie civil relève de marchés publics, avec une procédure de soumission encadrée : appel d’offres, cahier des charges détaillé, critères d’attribution définis à l’avance. Le devis prend alors la forme d’une offre structurée selon le bordereau fourni par le maître d’ouvrage, avec un prix unitaire par poste plutôt qu’un forfait global.',
    },
    { type: 'h2', text: 'La facturation par situations d’avancement' },
    {
      type: 'list',
      items: [
        'Facturation périodique (mensuelle, le plus souvent) selon l’avancement réel des travaux constaté sur site',
        'Chaque situation détaille les quantités exécutées depuis la précédente, valorisées aux prix unitaires du contrat',
        'Validation généralement nécessaire par le maître d’œuvre ou l’ingénieur mandaté avant paiement',
        'Une retenue de garantie est souvent appliquée sur chaque situation jusqu’à la réception définitive des travaux',
      ],
    },
    { type: 'h2', text: 'Garanties et cautionnements, une exigence propre aux grands marchés' },
    {
      type: 'p',
      text: 'Sur ces marchés de plus grande taille, le maître d’ouvrage exige fréquemment une garantie bancaire ou un cautionnement de bonne exécution avant le démarrage du chantier. Cette exigence doit être anticipée bien en amont de la soumission, car l’obtention d’une garantie bancaire peut prendre du temps et représente un coût qu’il faut intégrer dans le calcul de rentabilité global du marché.',
    },
    {
      type: 'callout',
      title: 'Une erreur de métré à grande échelle ne pardonne pas',
      text: 'Sur un chantier de bâtiment classique, une petite erreur de quantité reste souvent gérable. En génie civil, où les volumes se comptent en centaines ou milliers de mètres cubes, la même erreur en proportion peut suffire à transformer un marché rentable en marché déficitaire.',
    },
    {
      type: 'cta',
      title: 'Des situations d’avancement générées sans ressaisie',
      text: 'Cantia permet de suivre l’avancement d’un chantier de génie civil et de générer des situations de facturation cohérentes avec le bordereau de prix unitaires.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Qu’est-ce qu’une situation d’avancement en génie civil ?',
      answer:
        'C’est une facturation périodique, généralement mensuelle, basée sur les quantités de travaux réellement exécutées depuis la dernière facturation, valorisées aux prix unitaires définis dans le contrat. Elle doit généralement être validée par le maître d’œuvre avant paiement.',
    },
    {
      question: 'Pourquoi une garantie bancaire est-elle souvent exigée sur ces marchés ?',
      answer:
        'Elle protège le maître d’ouvrage en cas de défaillance de l’entreprise en cours de chantier, notamment sur des marchés publics de montant important. Son coût et son délai d’obtention doivent être anticipés avant la remise de l’offre.',
    },
    {
      question: 'Le prix d’une soumission de génie civil est-il négociable après attribution ?',
      answer:
        'Sur un marché public, la marge de négociation après attribution est généralement très limitée, le prix ayant été fixé lors de la procédure de soumission. Des avenants restent possibles en cours de chantier, mais uniquement pour des travaux réellement supplémentaires ou imprévus.',
    },
  ],
  relatedSlugs: [
    'gestion-entreprise-generale-sous-traitants-suisse',
    'previsionnel-tresorerie-entreprise-batiment',
    'assurance-chantier-tous-risques-ectr-obligatoire',
  ],
  relatedTradeSlug: 'genie-civil',
};
