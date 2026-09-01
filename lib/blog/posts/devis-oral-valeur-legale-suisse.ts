import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-oral-valeur-legale-suisse',
  question: 'Un devis accepté oralement a-t-il une valeur légale en Suisse ?',
  title: 'Devis accepté à l’oral : ça engage, mais ça ne se prouve pas',
  description:
    'En droit suisse, un accord oral vaut contrat : le Code des obligations n’exige aucune forme écrite par défaut. Le problème n’est jamais la validité, c’est la preuve.',
  excerpt:
    '« On s’est mis d’accord au téléphone » engage juridiquement les deux parties en Suisse. Le vrai problème arrive le jour où l’une des deux prétend le contraire.',
  category: 'Juridique & normes',
  keywords: ['devis oral', 'accord verbal', 'preuve contrat', 'forme du contrat', 'art 11 co'],
  publishedAt: '2026-04-16',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un client dit oui au téléphone, le chantier démarre la semaine suivante sans qu’aucun papier n’ait été signé. Beaucoup d’artisans pensent qu’un tel accord ne « compte pas vraiment » tant qu’il n’est pas sur papier. C’est faux. Cette différence change radicalement la façon de gérer un litige quand ça arrive.',
    },
    { type: 'h2', text: 'Le principe : aucune forme n’est exigée par défaut' },
    {
      type: 'p',
      text: 'L’art. 11 al. 1 du Code des obligations pose une règle simple : la validité d’un contrat n’est subordonnée à l’observation d’une forme particulière qu’en vertu d’une prescription spéciale de la loi. Pour un contrat d’entreprise (devis de travaux), aucune loi n’impose l’écrit : un accord verbal, un échange de SMS, un « c’est bon, allez-y » au téléphone forment un contrat parfaitement valable.',
    },
    {
      type: 'callout',
      title: 'La vraie question n’est jamais « est-ce valable ? »',
      text: 'C’est « puis-je le prouver ? ». Un contrat oral existe juridiquement, mais en cas de désaccord sur le prix, le périmètre ou le délai convenu, celui qui doit prouver ce qui a été dit se retrouve démuni face à un accord jamais couché sur papier.',
    },
    { type: 'h2', text: 'Ce qui se joue concrètement en cas de litige' },
    {
      type: 'list',
      items: [
        'Sans trace écrite, le prix convenu devient une question de mémoire de chacun, sachant que les deux souvenirs divergent rarement en faveur du même montant',
        'Le périmètre exact des travaux (« ça inclut la peinture ou pas ? ») se discute après coup, au pire moment possible',
        'Un juge civil suisse statue sur la base des preuves apportées, pas sur la parole donnée, si bien qu’un accord oral non documenté part avec un désavantage structurel',
      ],
    },
    { type: 'h2', text: 'Le compromis qui marche en pratique' },
    {
      type: 'p',
      text: 'Personne n’attend un contrat en bonne et due forme pour un petit dépannage de deux heures. Mais dès qu’un montant significatif est en jeu, un simple message écrit confirmant l’accord oral (« comme convenu au téléphone, je démarre lundi pour CHF X, travaux Y ») suffit à transformer un accord fragile en preuve solide, sans lourdeur administrative.',
    },
    {
      type: 'p',
      text: 'Le vrai gain d’un devis formalisé n’est donc pas de rendre l’accord « plus valable » (il l’est déjà oralement), c’est de le rendre prouvable le jour où l’un des deux se souvient différemment.',
    },
    {
      type: 'cta',
      title: 'Un devis envoyé en trente secondes, pas en trente minutes',
      text: 'Avec la dictée vocale de Cantia, un accord donné au téléphone se transforme en devis PDF chiffré en quelques minutes. La trace écrite existe ainsi sans ralentir le rythme du chantier.',
      buttonLabel: 'Découvrir la dictée vocale',
    },
  ],
  faq: [
    {
      question: 'Un accord oral pour des travaux est-il valable en droit suisse ?',
      answer:
        'Oui, dans la mesure où l’art. 11 CO n’exige aucune forme particulière par défaut pour un contrat d’entreprise. Un accord verbal engage juridiquement les deux parties.',
    },
    {
      question: 'Quel est le principal risque d’un devis accepté uniquement à l’oral ?',
      answer:
        'La preuve, pas la validité : en cas de désaccord sur le prix ou le périmètre convenu, il devient difficile de démontrer précisément ce qui a été dit.',
    },
    {
      question: 'Un simple message écrit suffit-il à sécuriser un accord oral ?',
      answer:
        'Dans la majorité des cas pratiques, oui : un message confirmant les termes de l’accord (prix, périmètre, délai) constitue une preuve bien plus solide qu’un accord purement verbal.',
    },
  ],
  relatedSlugs: [
    'signature-electronique-devis-suisse-valeur-legale',
    'validite-devis-signe-prix-qui-bouge',
    'rediger-devis-qui-inspire-confiance-client',
  ],
};
