import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'gestion-dechets-chantier-tri-obligatoire-suisse',
  question: 'Comment gérer le tri des déchets de chantier obligatoire en Suisse ?',
  title: 'Gestion des déchets de chantier : le tri obligatoire en Suisse',
  description:
    'Le tri des déchets de chantier n’est plus une option en Suisse : béton, bois, métaux et déchets spéciaux doivent être séparés. Voici comment l’organiser sans perdre de temps ni d’argent.',
  excerpt:
    'Un déchet mélangé coûte presque toujours plus cher qu’un déchet trié. Sur un chantier, cette règle simple se traduit directement dans la facture d’évacuation.',
  category: 'Juridique & normes',
  keywords: ['tri déchets chantier suisse', 'gestion déchets construction obligatoire', 'déchets de chantier tri sélectif'],
  publishedAt: '2026-10-07',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Le tri des déchets de chantier s’est imposé en quelques années comme une évidence opérationnelle plutôt qu’une simple contrainte administrative. La plupart des cantons et des communes suisses exigent aujourd’hui une séparation à la source, et les centres de traitement eux-mêmes refusent de plus en plus les bennes mélangées ou les facturent à un tarif nettement plus élevé.',
    },
    { type: 'h2', text: 'Le principe : un type de déchet, une benne' },
    {
      type: 'p',
      text: 'L’idée de base est simple à comprendre et un peu plus exigeante à appliquer sur le terrain : chaque grande famille de déchets doit être séparée dès sa production, pas triée après coup dans une benne commune. Sur un chantier de construction ou de rénovation, les catégories qui reviennent systématiquement sont les suivantes.',
    },
    {
      type: 'list',
      items: [
        'Les matériaux inertes : béton, gravats, briques, tuiles — recyclables en grande partie dans la construction routière ou comme matériau de remblai',
        'Le bois, qu’il soit brut ou traité, souvent séparé en plusieurs sous-catégories selon le degré de traitement',
        'Les métaux ferreux et non ferreux, dont la valeur de revente compense en général une bonne partie du coût d’évacuation',
        'Les déchets spéciaux : peintures, solvants, colles, résidus de produits chimiques, et tout matériau suspecté de contenir de l’amiante, qui suit une filière strictement encadrée',
        'Les déchets combustibles et non recyclables, qui restent la catégorie la plus coûteuse à évacuer',
      ],
    },
    { type: 'h2', text: 'Pourquoi les centres de tri refusent de plus en plus le mélangé' },
    {
      type: 'p',
      text: 'Une benne mélangée oblige le centre de traitement à effectuer lui-même un tri manuel ou mécanisé, ce qui a un coût direct qu’il répercute sur l’entreprise. Beaucoup de centres, notamment en zone urbaine, appliquent désormais une surtaxe significative sur les bennes non triées, voire refusent purement et simplement de les accepter. Le message envoyé à l’entreprise est clair : le tri se fait sur le chantier, pas après.',
    },
    { type: 'h2', text: 'Ce qu’une mauvaise gestion du tri coûte réellement' },
    {
      type: 'p',
      text: 'Au-delà de la surtaxe elle-même, une gestion approximative des déchets génère des coûts cachés : rotations de bennes plus fréquentes, temps perdu à trier a posteriori, litiges possibles avec un maître d’ouvrage qui exige une preuve de tri conforme sur un marché public ou un chantier labellisé. Sur une année, ces surcoûts grignotent une marge qui semblait pourtant solide sur le papier.',
    },
    {
      type: 'callout',
      title: 'Le réflexe qui change tout',
      text: 'Décider du schéma de tri avant le premier coup de pioche — combien de bennes, où elles sont placées, qui les surveille — évite presque tous les problèmes qui surviennent quand le tri est improvisé en cours de chantier, une fois les habitudes de l’équipe déjà prises.',
    },
    { type: 'h2', text: 'Organiser le tri sur un petit chantier, concrètement' },
    {
      type: 'list',
      items: [
        'Prévoir les bennes séparées dès l’installation de chantier, pas après le début des travaux',
        'Étiqueter clairement chaque benne, avec un pictogramme visible même pour un sous-traitant de passage',
        'Présenter le schéma de tri à l’équipe et aux sous-traitants dès l’accueil sur le chantier, pas en cours de route',
        'Désigner une personne responsable du suivi des bennes et de leur rotation',
        'Anticiper les fenêtres d’évacuation pour éviter qu’une benne pleine ne pousse quelqu’un à improviser un mélange',
      ],
    },
    {
      type: 'cta',
      title: 'Suivre les coûts d’évacuation sans mauvaise surprise',
      text: 'Les factures de tri et d’évacuation font partie des coûts qui s’oublient facilement dans un devis. Avec Cantia, chaque dépense de chantier — y compris les bennes et la taxe de déchets — reste rattachée au bon chantier, pour une rentabilité réelle et non estimée.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Le tri des déchets de chantier est-il obligatoire partout en Suisse ?',
      answer:
        'Le principe de séparation à la source est très largement appliqué, avec des exigences précises qui varient selon le canton et la commune. Dans le doute, le service cantonal de l’environnement ou le règlement communal de gestion des déchets donne les règles exactes applicables au chantier.',
    },
    {
      question: 'Que se passe-t-il si une benne de chantier n’est pas triée ?',
      answer:
        'La plupart des centres de traitement appliquent une surtaxe pour une benne mélangée, et certains refusent carrément de l’accepter. Sur un chantier soumis à des exigences contractuelles de tri, cela peut aussi créer un litige avec le maître d’ouvrage.',
    },
    {
      question: 'Que faire des matériaux suspectés de contenir de l’amiante ?',
      answer:
        'Ces matériaux ne se mélangent jamais avec les autres déchets et suivent une filière spécifique et strictement encadrée. En cas de doute sur la présence d’amiante, faire analyser le matériau avant toute démolition reste la seule approche sûre.',
    },
  ],
  relatedSlugs: [
    'chantier-propre-reduire-nuisances-voisinage',
    'reemploi-materiaux-economie-circulaire-batiment',
    'bilan-carbone-chantier-construction-suisse',
    'permis-construire-renovation-quand-necessaire',
  ],
};
