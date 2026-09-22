import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-facture-demolition-suisse',
  question: 'Comment établir devis et factures en tant qu’entreprise de démolition en Suisse ?',
  title: 'Devis et facturation pour une entreprise de démolition en Suisse',
  description:
    'Accessibilité, évacuation des gravats, diagnostic amiante préalable : comment chiffrer et facturer un chantier de démolition en Suisse sans sous-estimer les postes cachés.',
  excerpt:
    'Le poste le plus sous-estimé d’un devis de démolition n’est presque jamais la démolition elle-même, mais l’évacuation et le tri des déchets qui en résultent.',
  category: 'Métiers du bâtiment',
  keywords: ['devis démolition suisse', 'facturation entreprise démolition', 'prix évacuation gravats chantier'],
  publishedAt: '2026-10-11',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Chiffrer un chantier de démolition demande d’anticiper des variables que l’on ne maîtrise pas toujours au moment du devis : accessibilité du site, structure réelle du bâtiment, et surtout la gestion des déchets qui en résultera. Un devis qui ne détaille pas ces postes distincts prend un risque important de sous-estimation.',
    },
    { type: 'h2', text: 'Démolition manuelle ou mécanisée : un choix qui dépend de l’accès' },
    {
      type: 'p',
      text: 'La méthode de démolition dépend largement de l’accessibilité du site pour les engins. En milieu urbain dense ou dans un espace confiné, une démolition manuelle ou semi-mécanisée reste souvent la seule option, avec un coût de main-d’œuvre nettement plus élevé qu’une démolition à la pelle mécanique sur un terrain dégagé. Le devis doit clairement indiquer sur quelle hypothèse d’accès il se base.',
    },
    { type: 'h2', text: 'L’évacuation, un poste souvent sous-estimé' },
    {
      type: 'list',
      items: [
        'Tri des matériaux : béton, bois, métal et matériaux dangereux doivent généralement être séparés avant évacuation',
        'Transport vers les filières de traitement adaptées, avec des coûts qui varient selon le type de déchet',
        'Taxes d’élimination qui peuvent représenter une part significative du coût total du chantier',
        'Volume souvent supérieur aux estimations initiales, en particulier sur un bâtiment ancien mal documenté',
      ],
    },
    {
      type: 'p',
      text: 'Les entreprises non spécialisées en démolition sous-estiment fréquemment ce poste, en se concentrant sur le coût de la démolition physique sans intégrer correctement le volume réel et le coût de traitement des déchets. Un devis de démolition sérieux détaille systématiquement l’évacuation comme une ligne à part entière, pas comme un forfait générique.',
    },
    { type: 'h2', text: 'Un diagnostic préalable souvent nécessaire' },
    {
      type: 'p',
      text: 'Avant de pouvoir chiffrer précisément, un diagnostic amiante est généralement requis pour les bâtiments construits avant une certaine période, ainsi qu’une évaluation des structures porteuses pour éviter tout risque d’effondrement non maîtrisé. Ces diagnostics peuvent révéler des contraintes qui modifient fortement le devis initial : présence d’amiante à désamianter avant démolition, ou structure plus complexe que prévu.',
    },
    {
      type: 'callout',
      title: 'Un devis de démolition sans diagnostic préalable est une estimation, pas un engagement',
      text: 'Tant que le diagnostic amiante et l’évaluation structurelle n’ont pas été réalisés, il vaut mieux présenter un chiffrage sous réserve plutôt qu’un prix ferme. Le risque de découverte en cours de chantier reste réel dans ce métier.',
    },
    {
      type: 'cta',
      title: 'Un devis qui sépare démolition, tri et évacuation',
      text: 'Cantia permet de détailler chaque poste d’un chantier de démolition, du diagnostic préalable jusqu’à l’évacuation finale des déchets.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Le diagnostic amiante est-il obligatoire avant une démolition ?',
      answer:
        'Il est généralement requis pour les bâtiments construits avant une certaine période, avant toute démolition. Les règles exactes dépendent du canton et du type de bâtiment : il vaut mieux vérifier auprès des autorités compétentes avant de chiffrer les travaux.',
    },
    {
      question: 'Pourquoi le coût d’évacuation des gravats varie-t-il autant d’un chantier à l’autre ?',
      answer:
        'Le coût dépend du volume réel de déchets, de leur nature (inertes, dangereux, valorisables) et de la distance jusqu’aux filières de traitement adaptées. Un tri mal anticipé peut aussi faire grimper la facture si des matériaux dangereux sont mélangés aux gravats classiques.',
    },
    {
      question: 'Peut-on donner un prix ferme avant d’avoir visité le bâtiment à démolir ?',
      answer:
        'Ce n’est généralement pas recommandé. Sans visite et sans diagnostic préalable, mieux vaut présenter une estimation sous réserve, le temps de confirmer la structure réelle, l’accessibilité et l’absence ou la présence de matériaux dangereux.',
    },
  ],
  relatedSlugs: [
    'assurance-chantier-tous-risques-ectr-obligatoire',
    'checklist-ouverture-chantier-artisan',
    'garantie-travaux-construction-2-ou-5-ans',
  ],
  relatedTradeSlug: 'demolition',
};
