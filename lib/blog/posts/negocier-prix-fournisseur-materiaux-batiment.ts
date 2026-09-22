import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'negocier-prix-fournisseur-materiaux-batiment',
  question: 'Comment négocier ses prix avec un fournisseur de matériaux dans le bâtiment ?',
  title: 'Comment négocier ses prix avec un fournisseur de matériaux',
  description:
    'Les leviers concrets pour négocier de meilleurs prix avec un fournisseur de matériaux de construction, sans dégrader la relation ni la qualité de service.',
  excerpt:
    'Négocier avec un fournisseur, ce n’est pas juste demander une remise. Voici les leviers qui fonctionnent vraiment et le bon moment pour les activer.',
  category: 'Chantier & rentabilité',
  keywords: ['négocier prix fournisseur matériaux', 'remise fournisseur bâtiment'],
  publishedAt: '2026-10-09',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Beaucoup d’entreprises du bâtiment paient leurs matériaux au prix catalogue, année après année, sans jamais rouvrir la discussion avec leur fournisseur. Pourtant, la marge de négociation existe presque toujours — encore faut-il savoir sur quoi jouer.',
    },
    { type: 'h2', text: 'Les leviers qui fonctionnent réellement' },
    {
      type: 'list',
      items: [
        'Le volume et la régularité des commandes : un fournisseur préfère un client stable à dix clients occasionnels',
        'Le paiement rapide, voire anticipé, en échange d’un escompte ou d’une remise fixe',
        'La centralisation des achats chez un nombre restreint de fournisseurs, pour peser plus lourd sur chacun d’eux',
        'L’engagement sur une durée (par exemple un prix fixé pour l’année) qui sécurise le fournisseur autant que vous',
      ],
    },
    { type: 'h2', text: 'Pourquoi rester fidèle à un seul fournisseur a aussi un coût' },
    {
      type: 'p',
      text: 'Concentrer ses achats chez un seul fournisseur simplifie la gestion et peut faire baisser les prix, mais cela affaiblit aussi votre position : sans mise en concurrence réelle, le fournisseur sait qu’il n’a pas besoin de faire d’effort pour vous garder. Garder au moins un deuxième fournisseur actif, même pour une petite part des commandes, permet de comparer et de garder un argument de négociation crédible.',
    },
    { type: 'h2', text: 'Quand renégocier' },
    {
      type: 'p',
      text: 'Le bon moment n’est pas au milieu d’un chantier sous pression, mais généralement une fois par an, ou dès que votre volume d’activité augmente sensiblement. Un fournisseur qui voit vos commandes progresser de 20% sur l’année a un intérêt direct à revoir vos conditions pour vous garder.',
    },
    {
      type: 'callout',
      title: 'Demandez toujours la grille tarifaire complète, pas seulement une remise ponctuelle',
      text: 'Une remise accordée sur une commande isolée ne dit rien de votre position réelle. Demander la structure de prix par palier de volume permet de savoir exactement où se trouve le seuil suivant et de viser dessus.',
    },
    {
      type: 'cta',
      title: 'Suivez vos achats matériaux par fournisseur, sans tableur',
      text: 'Cantia centralise vos commandes et vos dépenses par fournisseur, chantier par chantier, pour savoir précisément qui négocier et quand.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Faut-il toujours privilégier le fournisseur le moins cher ?',
      answer:
        'Pas nécessairement. Le prix affiché ne dit rien du délai de livraison, du service après-vente ou de la fiabilité des stocks. Un fournisseur légèrement plus cher mais fiable coûte souvent moins cher au final.',
    },
    {
      question: 'Comment aborder la négociation sans dégrader la relation ?',
      answer:
        'En présentant des chiffres concrets (volume annuel, régularité, délai de paiement) plutôt qu’en demandant simplement une remise. Un fournisseur négocie plus volontiers face à des arguments qu’face à une pression.',
    },
    {
      question: 'Une petite entreprise a-t-elle un vrai pouvoir de négociation ?',
      answer:
        'Oui, dans une mesure plus limitée. La régularité des commandes et la rapidité de paiement comptent souvent autant que le volume pour un fournisseur, surtout local.',
    },
  ],
  relatedSlugs: [
    'rupture-stock-fournisseur-chantier-que-faire',
    'groupement-achat-artisans-batiment-suisse',
    'comparer-devis-fournisseurs-materiaux-methode',
    'marge-beneficiaire-entreprise-batiment-suisse',
  ],
};
