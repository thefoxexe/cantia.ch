import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'comparer-devis-fournisseurs-materiaux-methode',
  question: 'Comment comparer plusieurs devis fournisseurs de matériaux sans se tromper ?',
  title: 'Comment comparer plusieurs devis fournisseurs sans se tromper',
  description:
    'La méthode pour comparer plusieurs devis fournisseurs de matériaux sur des bases équivalentes, sans se laisser piéger par le seul prix total.',
  excerpt:
    'Comparer des devis fournisseurs seulement sur le prix total est le piège le plus courant. Voici les critères à aligner avant de choisir.',
  category: 'Chantier & rentabilité',
  keywords: ['comparer devis fournisseurs matériaux', 'choisir fournisseur bâtiment'],
  publishedAt: '2026-10-09',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Recevoir plusieurs devis fournisseurs pour un même matériau semble simple à comparer : il suffirait de prendre le moins cher. Dans la pratique, c’est souvent là que se cache une mauvaise décision — parce que les devis ne portent presque jamais exactement sur la même chose.',
    },
    { type: 'h2', text: 'Le piège classique' },
    {
      type: 'p',
      text: 'Deux devis avec un montant total proche peuvent couvrir des prestations très différentes : l’un inclut la livraison, l’autre non ; l’un porte sur un matériau de qualité standard, l’autre sur une qualité supérieure. Comparer uniquement le total final revient à comparer deux choses différentes sans le savoir.',
    },
    { type: 'h2', text: 'Les critères à aligner avant de comparer' },
    {
      type: 'list',
      items: [
        'Le délai de livraison réel, pas seulement annoncé',
        'Les conditions de paiement (comptant, 30 jours, escompte)',
        'La garantie du matériau et les conditions de retour ou d’échange',
        'Les frais de transport, inclus ou facturés séparément',
        'La quantité minimale de commande imposée',
      ],
    },
    { type: 'h2', text: 'Pourquoi le moins cher n’est pas toujours le plus rentable' },
    {
      type: 'p',
      text: 'Un matériau moins cher mais livré avec deux semaines de retard peut coûter bien plus en temps de main-d’œuvre immobilisée que la différence de prix économisée. De même, un matériau de qualité inférieure qui génère un retour client ou un défaut à corriger plus tard efface largement l’économie initiale. Le bon réflexe est de raisonner en coût total, pas en prix d’achat.',
    },
    {
      type: 'callout',
      title: 'Demandez toujours un prix tout compris, livraison incluse',
      text: 'Un devis qui sépare le prix du matériau et les frais de livraison est difficile à comparer à un devis rendu chantier. Demandez systématiquement ce chiffre unique aux fournisseurs, quitte à le recalculer vous-même si nécessaire.',
    },
    {
      type: 'cta',
      title: 'Comparez vos coûts matériaux réels, fournisseur par fournisseur',
      text: 'Cantia garde l’historique de vos commandes et de vos prix par fournisseur, pour comparer sur des bases réelles plutôt que sur un devis isolé.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Faut-il toujours demander plusieurs devis avant une commande de matériaux ?',
      answer:
        'Pour les commandes importantes ou récurrentes, oui. Pour un petit achat ponctuel, le temps passé à comparer peut dépasser le gain potentiel.',
    },
    {
      question: 'Comment comparer des devis avec des unités de mesure différentes ?',
      answer:
        'Ramenez systématiquement les prix à une unité commune (le mètre carré, le mètre cube, la pièce) avant de comparer, plutôt que de comparer des montants globaux qui masquent des quantités différentes.',
    },
    {
      question: 'Un devis fournisseur est-il engageant une fois accepté ?',
      answer:
        'Généralement oui, dans les conditions et délais qu’il précise. Vérifiez sa durée de validité, car un prix peut ne plus être garanti au-delà d’une certaine date.',
    },
  ],
  relatedSlugs: [
    'negocier-prix-fournisseur-materiaux-batiment',
    'rupture-stock-fournisseur-chantier-que-faire',
    'groupement-achat-artisans-batiment-suisse',
  ],
};
