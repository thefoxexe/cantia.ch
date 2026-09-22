import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'affacturage-factoring-entreprise-batiment-suisse',
  question: 'L’affacturage est-il une bonne idée pour une entreprise du bâtiment en Suisse ?',
  title: 'L’affacturage (factoring) pour une entreprise du bâtiment : bonne idée ?',
  description:
    'Comment fonctionne l’affacturage, ses avantages et ses inconvénients pour une entreprise du bâtiment, et dans quels cas précis il vaut vraiment le coût de la commission.',
  excerpt:
    'Ne plus jamais attendre 60 ou 90 jours qu’un client règle une facture, contre une commission à chaque fois. L’affacturage n’est pas magique, mais il répond à un vrai problème.',
  category: 'Chantier & rentabilité',
  keywords: [
    'affacturage entreprise batiment suisse',
    'factoring construction suisse',
    'avance de tresorerie factures chantier',
  ],
  publishedAt: '2026-10-07',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'Attendre 60 ou 90 jours qu’un client institutionnel règle une facture, tout en devant payer les fournisseurs, les salaires et les charges sociales bien avant, est l’un des problèmes de trésorerie les plus fréquents dans le bâtiment. L’affacturage propose une réponse directe à ce décalage, moyennant un coût qu’il faut savoir évaluer avant de s’engager.',
    },
    { type: 'h2', text: 'Comment fonctionne l’affacturage' },
    {
      type: 'p',
      text: 'Le principe est simple : l’entreprise cède ses factures clients à un organisme de factoring, qui avance immédiatement une grande partie de leur montant, généralement dans les jours qui suivent l’émission de la facture. L’organisme de factoring se charge ensuite d’encaisser la facture auprès du client, et reverse le solde à l’entreprise une fois le paiement reçu, déduction faite de sa commission.',
    },
    { type: 'h2', text: 'Les avantages concrets' },
    {
      type: 'list',
      items: [
        'Une trésorerie disponible presque immédiatement après l’émission d’une facture, au lieu d’attendre le délai de paiement réel du client.',
        'La gestion des relances de paiement est transférée à l’organisme de factoring, ce qui libère du temps administratif.',
        'Le risque d’impayé peut, selon la formule choisie, être en partie transféré à l’organisme de factoring plutôt que supporté seul par l’entreprise.',
      ],
    },
    { type: 'h2', text: 'Les inconvénients à ne pas sous-estimer' },
    {
      type: 'list',
      items: [
        'La commission prélevée réduit directement la marge sur chaque facture concernée, ce qui doit être intégré dans le calcul de rentabilité.',
        'Pour de petits montants ou un faible nombre de factures par an, le coût fixe et la mise en place du dispositif peuvent ne pas être rentables.',
        'La relation avec le client change : c’est un tiers qui gère l’encaissement, ce qui peut être perçu différemment selon le type de client.',
      ],
    },
    {
      type: 'callout',
      title: 'L’affacturage n’est pas un pansement sur un problème de marge',
      text: 'Une entreprise qui a régulièrement recours à l’affacturage pour survivre entre deux chantiers, plutôt que pour fluidifier une trésorerie déjà saine, masque souvent un problème plus profond de marge ou de délais de paiement négociés trop tard. Il vaut mieux traiter la cause avant de traiter le symptôme.',
    },
    { type: 'h2', text: 'Quand ça vaut vraiment le coup' },
    {
      type: 'p',
      text: 'L’affacturage prend tout son sens quand les délais de paiement sont structurellement longs, typiquement avec de gros clients institutionnels ou des marchés publics, et quand le volume de factures est suffisant pour amortir la commission. Pour une petite entreprise avec des clients particuliers qui paient rapidement, il est en général moins pertinent qu’une simple ligne de crédit court terme.',
    },
    {
      type: 'cta',
      title: 'Avant de céder vos factures, sachez précisément ce qu’elles valent',
      text: 'Un suivi clair des factures émises, encaissées et en retard aide à décider si l’affacturage est vraiment justifié, et sur quels clients précisément. Cantia centralise cette vue en temps réel.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'L’affacturage est-il réservé aux grandes entreprises ?',
      answer:
        'Non, des formules existent aussi pour les PME, mais leur intérêt économique dépend du volume et du montant des factures concernées. En dessous d’un certain seuil, le coût peut ne pas justifier la mise en place.',
    },
    {
      question: 'Le client sait-il que sa facture a été cédée à un organisme de factoring ?',
      answer:
        'Oui, en général le client est informé et règle directement l’organisme de factoring plutôt que l’entreprise elle-même. Certaines formules plus discrètes existent, mais elles restent moins courantes.',
    },
    {
      question: 'L’affacturage couvre-t-il le risque d’impayé total ?',
      answer:
        'Cela dépend de la formule choisie : certains contrats transfèrent une partie du risque d’impayé à l’organisme de factoring, d’autres non. C’est un point essentiel à clarifier avant de signer.',
    },
  ],
  relatedSlugs: [
    'ligne-de-credit-tresorerie-pme-batiment',
    'previsionnel-tresorerie-entreprise-batiment',
    'credit-construction-hypothecaire-entreprise-batiment',
  ],
};
