import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'variante-soumission-proposer-alternative',
  question: 'Peut-on proposer une variante dans une soumission sans être écarté ?',
  title: 'Proposer une variante dans une soumission, sans faire écarter son offre',
  description:
    'Vous connaissez une solution moins chère ou plus rapide que celle de l’architecte ? Comment la proposer en variante, à côté d’une offre de base complète, sur un marché privé ou public.',
  excerpt:
    'Remplacer la solution de l’architecte par la vôtre, c’est risquer l’exclusion. La proposer à côté, c’est montrer votre savoir-faire.',
  category: 'Croissance & acquisition',
  keywords: ['variante soumission', 'offre variante marché public', 'proposer alternative architecte', 'soumission bâtiment suisse'],
  publishedAt: '2026-10-24',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'En lisant une soumission, vous voyez souvent mieux : un autre produit, une mise en œuvre plus rapide, un détail plus durable. La tentation est de chiffrer directement votre solution. C’est le moyen le plus sûr de rendre votre offre incomparable avec les autres.',
    },
    { type: 'h2', text: 'La règle : une offre de base complète, la variante à côté' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Remplissez toutes les positions de la soumission telle qu’elle est rédigée : c’est votre offre de base, comparable aux autres.',
        'Décrivez la variante séparément : ce qui change, les positions concernées, l’écart de prix (en plus ou en moins) et l’effet sur le délai.',
        'Indiquez clairement que l’offre de base reste valable si la variante n’est pas retenue.',
      ],
    },
    { type: 'h2', text: 'Sur un marché public' },
    {
      type: 'p',
      text: 'Le droit des marchés publics suisse admet en principe les variantes en plus de l’offre portant sur le projet décrit, sauf si l’adjudicateur les a restreintes ou exclues dans l’appel d’offres. Lisez donc les conditions : si les variantes sont exclues, n’en proposez pas ; si elles sont admises, l’offre de base complète reste indispensable.',
    },
    {
      type: 'callout',
      title: 'Une variante bien présentée est un argument',
      text: 'Une page claire, avec l’économie chiffrée et les positions concernées, montre au maître d’ouvrage que vous maîtrisez le sujet. C’est souvent ce qui fait la différence à prix proches.',
    },
    { type: 'h2', text: 'Sur un marché privé' },
    {
      type: 'p',
      text: 'L’architecte est généralement ouvert aux propositions, surtout si elles réduisent le coût ou le délai. Le même principe s’applique : rendez la soumission complète, puis joignez la variante. Un coup de téléphone avant l’échéance permet parfois de savoir si elle a une chance.',
    },
    { type: 'h2', text: 'Avec Cantia (bêta)' },
    {
      type: 'p',
      text: 'Vous remplissez l’offre de base dans le PDF d’origine avec Cantia, puis vous pouvez dupliquer la soumission pour chiffrer votre variante sans toucher à l’offre de base. Fonction en bêta : 1 soumission d’essai avec Essentiel, 3 par mois avec Équipe, illimitée avec Entreprise.',
    },
    {
      type: 'cta',
      title: 'L’offre de base remplie en quelques minutes',
      text: 'Il vous reste du temps pour la variante qui fera la différence.',
      buttonLabel: 'Essayer Cantia',
    },
  ],
  faq: [
    {
      question: 'Peut-on remplacer un produit imposé par un équivalent ?',
      answer:
        'Seulement si la soumission l’autorise (mention « ou équivalent ») ou en variante, à côté de l’offre de base. Remplacer sans le dire rend l’offre non comparable.',
    },
    {
      question: 'Une variante peut-elle être plus chère que l’offre de base ?',
      answer: 'Oui, si elle apporte autre chose : durabilité, délai, entretien. Expliquez clairement ce que le maître d’ouvrage gagne en échange.',
    },
    {
      question: 'Les variantes sont-elles toujours admises sur un marché public ?',
      answer: 'Non. Elles sont en principe admises, mais l’adjudicateur peut les restreindre ou les exclure dans l’appel d’offres. Les conditions du dossier font foi.',
    },
  ],
  relatedSlugs: ['repondre-appel-offres-public-batiment-etapes', 'appel-offres-marches-publics-batiment-suisse', 'remplir-soumission-pdf-architecte'],
};
