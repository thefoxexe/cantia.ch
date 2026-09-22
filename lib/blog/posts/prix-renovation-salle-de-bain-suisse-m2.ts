import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'prix-renovation-salle-de-bain-suisse-m2',
  question: 'Quel est le prix moyen d’une rénovation de salle de bain en Suisse ?',
  title: 'Prix moyen d’une rénovation de salle de bain en Suisse',
  description:
    'Fourchettes réalistes pour une rénovation de salle de bain en Suisse (standard vs haut de gamme), poste par poste : sanitaire, carrelage, plomberie, électricité, étanchéité.',
  excerpt:
    'Entre une salle de bain « rafraîchie » et une salle de bain entièrement reprise avec déplacement des arrivées d’eau, l’écart de prix peut aller du simple au triple.',
  category: 'Devis & facturation',
  keywords: ['prix', 'rénovation', 'salle de bain', 'devis', 'sanitaire', 'carrelage'],
  publishedAt: '2026-09-25',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Demander « combien coûte une salle de bain » sans plus de détails revient à demander le prix d’une voiture : tout dépend de la taille, du niveau de finition et de ce qui se cache derrière les murs. Voici des repères concrets pour chiffrer un projet sérieusement.',
    },
    { type: 'h2', text: '1. Une fourchette large, et c’est normal' },
    {
      type: 'p',
      text: 'Pour une salle de bain standard de 5 à 6 m² entièrement reprise (sanitaires, carrelage, plomberie, électricité), comptez généralement entre CHF 15’000 et 30’000 tout compris. En haut de gamme (matériaux nobles, douche à l’italienne sur mesure, domotique), la facture grimpe souvent au-delà de CHF 40’000 à 50’000. Un simple remplacement des sanitaires sans toucher au carrelage existant reste nettement moins cher.',
    },
    { type: 'h2', text: '2. Le détail poste par poste' },
    {
      type: 'table',
      headers: ['Poste', 'Détail', 'Fourchette CHF'],
      rows: [
        ['Sanitaires', 'WC, lavabo, douche ou baignoire, robinetterie', '4’000 – 9’000'],
        ['Carrelage', 'Sol et murs, fourniture et pose, ~15-20 m²', '3’500 – 7’000'],
        ['Plomberie', 'Alimentation, évacuation, raccordements', '2’500 – 6’000'],
        ['Étanchéité', 'Chape étanche sous carrelage, obligatoire', '800 – 1’800'],
        ['Électricité', 'Mise aux normes, éclairage, ventilation', '1’500 – 3’000'],
        ['Total indicatif', 'Salle de bain 5-6 m², standard à milieu de gamme', '15’000 – 30’000'],
      ],
    },
    { type: 'h2', text: '3. Ce qui fait vraiment varier le devis' },
    {
      type: 'list',
      items: [
        'Un accès difficile au chantier (étage élevé sans ascenseur, immeuble ancien) augmente le temps de manutention et donc la main-d’œuvre facturée.',
        'Déplacer un point d’eau existant (WC, douche) implique de casser la chape et parfois de revoir l’évacuation : c’est souvent le poste qui fait le plus déraper un budget mal anticipé.',
        'L’état des conduites derrière les murs, invisible avant démolition, peut réserver des surprises — d’où l’intérêt d’une provision pour imprévus dans le devis.',
        'Le choix des matériaux (carrelage standard vs pierre naturelle, robinetterie de marque) peut à lui seul doubler le budget sans changer la surface.',
      ],
    },
    {
      type: 'callout',
      title: 'Le piège du devis « à la surface »',
      text: 'Un prix au m² annoncé sans visite du chantier ne veut souvent rien dire pour une salle de bain : deux pièces de même taille peuvent avoir des besoins totalement différents selon l’emplacement des conduites existantes. Méfiez-vous d’un chiffrage donné par téléphone.',
    },
    {
      type: 'cta',
      title: 'Un devis salle de bain qui tient sur une seule page, pas sur cinq corps de métier séparés',
      text: 'Sanitaire, carrelage, électricité, plomberie : sur Cantia, vous regroupez tous les postes d’un même chantier dans un seul devis clair, avec TVA et totaux calculés automatiquement.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Quel est le prix d’une salle de bain de 5 m² tout compris en Suisse ?',
      answer:
        'Pour une rénovation complète (sanitaires, carrelage, plomberie, électricité) en milieu de gamme, comptez généralement entre CHF 15’000 et 25’000. Le prix varie fortement selon l’état des installations existantes et les matériaux choisis.',
    },
    {
      question: 'Pourquoi déplacer un point d’eau coûte-t-il si cher ?',
      answer:
        'Déplacer une arrivée ou une évacuation implique de casser la chape existante, de modifier les canalisations et de refaire l’étanchéité sur la zone concernée. C’est un travail qui demande plusieurs corps de métier en cascade, d’où un surcoût souvent significatif par rapport à un remplacement à l’identique.',
    },
    {
      question: 'Faut-il prévoir une marge pour imprévus dans un devis de rénovation de salle de bain ?',
      answer:
        'Oui, c’est fortement recommandé dès que les murs ou le sol existants sont ouverts : l’état réel des conduites n’est visible qu’après démolition. Une provision explicite dans le devis évite les mauvaises surprises pour le client comme pour l’entreprise.',
    },
  ],
  relatedSlugs: [
    'calculer-prix-devis-renovation-suisse',
    'prix-renovation-cuisine-suisse',
    'calculer-prix-de-revient-chantier-batiment',
  ],
};
