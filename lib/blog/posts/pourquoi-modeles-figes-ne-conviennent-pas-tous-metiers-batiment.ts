import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'pourquoi-modeles-figes-ne-conviennent-pas-tous-metiers-batiment',
  question: 'Pourquoi les modèles figés des logiciels de gestion ne conviennent-ils pas à tous les métiers du bâtiment ?',
  title: 'Pourquoi un modèle figé ne peut pas convenir à tout le bâtiment à la fois',
  description:
    'Le bâtiment regroupe des métiers très différents entre eux. Pourquoi un même modèle rigide de devis ou de suivi de chantier ne peut logiquement pas convenir à tous en même temps.',
  excerpt:
    'Un maçon, un électricien et un paysagiste n\'ont pas la même façon de chiffrer, de suivre un chantier ou de facturer. Un modèle unique et figé ne peut donc jamais parfaitement convenir à tous les trois en même temps.',
  category: 'Sur-mesure & automatisations',
  keywords: ['modèle figé logiciel bâtiment', 'logiciel adapté métier construction', 'pourquoi outil générique ne suffit pas', 'diversité métiers bâtiment logiciel', 'personnalisation par métier construction'],
  publishedAt: '2026-08-24',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Le terme "bâtiment" recouvre une réalité extrêmement diverse : maçonnerie, électricité, paysagisme, charpente, chacun avec ses propres unités de mesure, ses propres processus de chantier, ses propres habitudes de facturation. Un modèle figé, pensé pour "le bâtiment" en général, ne peut structurellement pas parfaitement convenir à chacun.',
    },
    { type: 'h2', text: 'Des exemples concrets de cette diversité' },
    {
      type: 'list',
      items: [
        'Un maçon chiffre en m³ de béton, un électricien en points électriques, un paysagiste souvent au forfait par prestation',
        'Un couvreur documente son chantier avec une attention particulière à la météo, un menuisier avec un temps d\'atelier séparé de la pose',
        'Un chauffagiste doit intégrer des délais de livraison longs, un serrurier gère surtout de l\'urgence ponctuelle',
      ],
    },
    {
      type: 'stat',
      value: '15+',
      label: 'corps de métier différents généralement regroupés sous le terme générique "bâtiment" (chacun avec des besoins de gestion qui divergent sur des points concrets)',
    },
    { type: 'h2', text: 'Un bon outil de gestion doit se plier au métier, pas l\'inverse' },
    {
      type: 'p',
      text: 'Plutôt que de forcer chaque métier à s\'adapter à un modèle unique, un outil de gestion pensé pour le bâtiment devrait permettre d\'ajuster ce qui compte réellement pour chaque métier (les unités utilisées, les étapes de suivi, les documents générés) sans perdre la cohérence d\'ensemble.',
    },
    {
      type: 'callout',
      title: 'Le socle commun reste large, seuls les détails changent',
      text: 'La plupart des besoins (devis, factures, TVA, suivi de chantier) sont communs à tous les métiers du bâtiment. C\'est sur les détails spécifiques que la personnalisation fait vraiment la différence.',
    },
    {
      type: 'cta',
      title: 'Un outil qui s\'adapte à votre métier, pas l\'inverse',
      text: 'Cantia couvre déjà les spécificités de nombreux métiers du bâtiment, et peut être ajusté sur mesure pour ceux qui sortent encore du cadre standard.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Pourquoi un logiciel générique "bâtiment" ne convient-il pas parfaitement à tous les métiers ?',
      answer:
        'Parce que le bâtiment regroupe plus de 15 corps de métier différents, chacun avec ses propres unités de mesure, processus de chantier et habitudes de facturation.',
    },
    {
      question: 'Qu\'est-ce qui reste commun entre tous les métiers du bâtiment dans un logiciel de gestion ?',
      answer:
        'La grande majorité des besoins de base (devis, factures, conformité TVA, suivi de chantier) reste commune, seuls certains détails spécifiques diffèrent d\'un métier à l\'autre.',
    },
    {
      question: 'Un logiciel de gestion doit-il s\'adapter au métier ou le métier s\'adapter au logiciel ?',
      answer:
        'Idéalement l\'outil s\'adapte au métier, car un bon logiciel doit permettre d\'ajuster ce qui compte réellement (unités, étapes, documents) sans forcer l\'entreprise à changer sa façon de travailler.',
    },
  ],
  relatedSlugs: [
    'cantia-adapte-metier-specifique-batiment',
    'logiciel-standard-vs-solution-personnalisee-batiment',
    'logiciel-devis-facture-maconnerie-suisse',
  ],
};
