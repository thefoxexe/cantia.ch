import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'previsionnel-tresorerie-entreprise-batiment',
  question: 'Comment faire un prévisionnel de trésorerie simple pour une entreprise du bâtiment ?',
  title: 'Prévisionnel de trésorerie pour une entreprise du bâtiment : la méthode sans usine à gaz',
  description:
    'Pas besoin d’un plan financier complexe pour anticiper un creux de trésorerie : un prévisionnel à 30-60-90 jours basé sur les factures en attente et les charges connues suffit à voir venir les problèmes.',
  excerpt:
    'La trésorerie ne s’effondre presque jamais sans signe avant-coureur. Le problème, c’est que sans prévisionnel, ce signe reste invisible jusqu’au jour où le compte est déjà dans le rouge.',
  category: 'Chantier & rentabilité',
  keywords: ['prévisionnel trésorerie bâtiment', 'trésorerie entreprise construction', 'gestion cashflow artisan', 'prévision de trésorerie simple', 'anticiper problème de trésorerie'],
  publishedAt: '2026-07-05',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un prévisionnel de trésorerie n’a pas besoin d’être un exercice financier complexe réservé aux grandes entreprises. Pour une PME du bâtiment, un prévisionnel simple à 30, 60 et 90 jours, basé sur des données déjà disponibles (factures émises, charges récurrentes connues), suffit largement à anticiper un creux avant qu’il ne devienne un problème.',
    },
    { type: 'h2', text: 'Les données à réunir' },
    {
      type: 'list',
      items: [
        'Les factures déjà émises et leur échéance prévue de paiement',
        'Les acomptes attendus sur les chantiers en cours',
        'Les charges fixes récurrentes (salaires, loyer, assurances, leasing véhicules)',
        'Les dépenses ponctuelles déjà engagées mais pas encore payées (fournisseurs, sous-traitants)',
      ],
    },
    { type: 'h2', text: 'La méthode en trois horizons' },
    {
      type: 'table',
      headers: ['Horizon', 'Ce qu’il révèle'],
      rows: [
        ['30 jours', 'Le risque immédiat : un creux de trésorerie visible dès maintenant'],
        ['60 jours', 'La tendance (l’activité en cours suffit-elle à couvrir les charges fixes ?)'],
        ['90 jours', 'La marge de manœuvre pour décider d’un investissement ou d’un recrutement'],
      ],
    },
    {
      type: 'callout',
      title: 'Le prévisionnel n’a de valeur que s’il est mis à jour régulièrement',
      text: 'Un prévisionnel figé le jour de sa création perd toute utilité en quelques semaines. Chaque nouvelle facture émise ou chaque paiement reçu doit venir l’actualiser pour rester fiable.',
    },
    {
      type: 'p',
      text: 'Le vrai bénéfice d’un prévisionnel n’est pas de prédire l’avenir avec précision, mais de repérer un creux plusieurs semaines à l’avance : assez tôt pour relancer une facture en retard, décaler un achat non urgent, ou négocier un délai avec un fournisseur, plutôt que de découvrir le problème le jour où le compte est déjà négatif.',
    },
    {
      type: 'cta',
      title: 'Une prévision de trésorerie automatique',
      text: 'Le module Trésorerie de Cantia projette votre solde à venir à partir des factures en attente et des dépenses récurrentes, mis à jour en temps réel.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Un prévisionnel de trésorerie doit-il être complexe pour être utile ?',
      answer:
        'Non, un prévisionnel simple à 30-60-90 jours basé sur les factures en attente et les charges connues suffit largement pour une PME du bâtiment.',
    },
    {
      question: 'À quelle fréquence faut-il mettre à jour un prévisionnel de trésorerie ?',
      answer:
        'Idéalement à chaque nouvelle facture émise ou chaque paiement reçu. Un prévisionnel figé perd rapidement sa fiabilité.',
    },
    {
      question: 'Quel est le principal bénéfice d’un prévisionnel de trésorerie ?',
      answer:
        'Repérer un creux plusieurs semaines à l’avance, assez tôt pour agir (relance, report d’achat, négociation fournisseur) plutôt que de le découvrir une fois le compte déjà négatif.',
    },
  ],
  relatedSlugs: [
    'pourquoi-entreprises-batiment-font-faillite-suisse',
    'calculer-prix-de-revient-chantier-batiment',
    'relancer-client-facture-impayee-sans-perdre-client',
  ],
};
