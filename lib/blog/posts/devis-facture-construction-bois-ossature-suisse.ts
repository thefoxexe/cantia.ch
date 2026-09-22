import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-facture-construction-bois-ossature-suisse',
  question: 'Comment établir devis et factures pour une construction bois (ossature bois) en Suisse ?',
  title: 'Devis et facturation pour une entreprise de construction bois',
  description:
    'Ossature complète plutôt que charpente seule, préfabrication en atelier, délai de montage réduit : comment chiffrer et facturer une construction bois en Suisse.',
  excerpt:
    'Construire l’ossature complète d’un bâtiment en bois n’a rien à voir avec la seule charpente d’une toiture. Voici ce que cela change pour le devis et le montage sur site.',
  category: 'Métiers du bâtiment',
  keywords: ['devis construction bois suisse', 'facturation ossature bois', 'prix maison ossature bois suisse'],
  publishedAt: '2026-10-12',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'La construction bois ne se limite pas à la charpente d’une toiture : elle consiste à réaliser l’ossature complète d’un bâtiment, murs porteurs compris, en structure bois plutôt qu’en maçonnerie traditionnelle. Ce périmètre bien plus large que la charpente seule demande un chiffrage différent, souvent organisé autour d’une part importante de préfabrication en atelier.',
    },
    { type: 'h2', text: 'Une différence de périmètre avec la charpente traditionnelle' },
    {
      type: 'p',
      text: 'Une entreprise de charpente traditionnelle réalise généralement la structure de la toiture d’un bâtiment déjà construit en maçonnerie. Une entreprise de construction bois, elle, conçoit et réalise l’ossature porteuse complète du bâtiment : murs, planchers, et souvent la toiture également. Cette différence de périmètre doit être claire dès le premier échange avec le client, pour éviter toute confusion sur ce que couvre réellement le devis.',
    },
    { type: 'h2', text: 'Un chiffrage souvent construit autour de la préfabrication' },
    {
      type: 'p',
      text: 'Une part importante des éléments de mur est généralement préassemblée en atelier, isolation et parfois revêtement extérieur compris, avant d’être transportée et posée sur site. Le devis doit donc distinguer clairement la part de fabrication en atelier, facturée selon des surfaces ou des éléments définis en amont, de la part de montage sur site, qui dépend davantage de l’accessibilité du terrain et des conditions météo du jour de pose.',
    },
    {
      type: 'list',
      items: [
        'Éléments de mur préassemblés en atelier : isolation, pare-vapeur et parfois menuiseries déjà intégrées avant livraison',
        'Montage sur site généralement rapide comparé à une construction maçonnée équivalente, souvent en quelques jours pour l’ossature complète',
        'Étanchéité à l’air et gestion de l’humidité : points techniques critiques à ne jamais sous-traiter à la légère dans le devis',
        'Finitions extérieures et intérieures : souvent facturées séparément de l’ossature elle-même',
      ],
    },
    { type: 'h2', text: 'Un argument commercial fort : la rapidité de montage' },
    {
      type: 'p',
      text: 'Le délai de montage sur site généralement plus rapide qu’en maçonnerie traditionnelle constitue un argument commercial de poids, en particulier pour des clients pressés par un calendrier serré ou soucieux de limiter les nuisances de chantier prolongées. Ce gain de temps doit néanmoins être présenté avec honnêteté : il concerne le gros œuvre, pas l’ensemble du chantier jusqu’à la livraison finale, second œuvre compris.',
    },
    {
      type: 'callout',
      title: 'La rapidité du montage ne dispense pas d’une préparation minutieuse',
      text: 'Le temps gagné sur site en construction bois se paie par une exigence accrue en amont : plans très précis, coordination fine avec l’atelier de préfabrication. Une erreur de conception découverte au montage coûte généralement plus cher à corriger qu’en construction traditionnelle.',
    },
    {
      type: 'cta',
      title: 'Un devis qui distingue atelier et chantier',
      text: 'Cantia permet de structurer un devis de construction bois entre fabrication en atelier et montage sur site, avec un suivi de rentabilité sur les deux phases.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Quelle est la différence entre une entreprise de charpente et une entreprise de construction bois ?',
      answer:
        'Une entreprise de charpente traditionnelle réalise généralement la structure de toiture d’un bâtiment déjà construit. Une entreprise de construction bois conçoit et réalise l’ossature porteuse complète du bâtiment, murs compris, pas seulement la toiture.',
    },
    {
      question: 'La préfabrication en atelier rend-elle le devis plus prévisible ?',
      answer:
        'Généralement oui, car une part importante du travail est réalisée dans des conditions contrôlées en atelier, avec moins d’aléas que sur un chantier extérieur. Le montage sur site reste toutefois soumis aux conditions d’accès et à la météo du jour de pose.',
    },
    {
      question: 'Une construction bois est-elle plus rapide à livrer qu’une construction maçonnée ?',
      answer:
        'Le montage de l’ossature elle-même est généralement plus rapide, souvent quelques jours seulement. Mais le délai de livraison final dépend aussi du second œuvre et des finitions, qui suivent un calendrier comparable à celui d’une construction traditionnelle.',
    },
  ],
  relatedSlugs: [
    'devis-charpente-bois-facturation-suisse',
    'construction-modulaire-prefabriquee-suisse',
    'garantie-travaux-construction-2-ou-5-ans',
  ],
  relatedTradeSlug: 'construction-bois',
};
