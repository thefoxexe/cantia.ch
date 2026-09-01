import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'delai-paiement-facture-artisan-code-obligations',
  question: 'Quel est le délai de paiement légal d’une facture d’artisan en Suisse ?',
  title: 'Délai de paiement d’une facture d’artisan en Suisse : que dit la loi ?',
  description:
    'Le Code des obligations ne fixe pas de délai de paiement légal fixe : 30 jours est l’usage, mais tout dépend de ce qui figure sur votre facture. Explications et modèle de clause.',
  excerpt:
    'Un client qui paie à 60 jours n’est pas forcément en tort. En Suisse, le délai de paiement n’existe que si vous l’avez écrit vous-même sur la facture.',
  category: 'Juridique & normes',
  keywords: ['délai de paiement', 'facture', 'intérêt moratoire', 'code des obligations', 'relance'],
  publishedAt: '2026-01-22',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Un client qui paie 60 jours après réception d’une facture est-il en tort pour autant ? La réponse tient presque entièrement à une ligne que la plupart des entrepreneurs oublient d’écrire, parce qu’en Suisse, contrairement à l’Union européenne, aucun délai de paiement légal fixe n’est imposé aux entreprises du bâtiment.',
    },
    { type: 'h2', text: 'Ce que le Code des obligations dit vraiment' },
    {
      type: 'p',
      text: 'Aucun nombre de jours par défaut n’existe. En l’absence de délai précisé, l’art. 75 CO prévoit que la créance est exigible immédiatement : le client devrait payer sans délai. Dans la pratique du bâtiment, 30 jours est la norme d’usage, mais elle n’a de force juridique que si elle est écrite explicitement sur la facture ou le devis accepté.',
    },
    {
      type: 'callout',
      title: 'Le point qui coûte le plus cher à ignorer',
      text: 'Une facture sans échéance écrite est en théorie payable immédiatement, mais en pratique presque impossible à faire respecter, faute de date de référence claire pour calculer un retard. Une échéance précise n’est donc pas une simple formalité, c’est elle qui rend un retard exigible.',
    },
    { type: 'h2', text: 'Ce qui se passe une fois l’échéance dépassée' },
    {
      type: 'list',
      items: [
        'Le débiteur est en demeure automatiquement dès que l’échéance convenue est dépassée (art. 102 al. 2 CO), sans qu’un rappel formel soit nécessaire si une date était indiquée',
        'Un intérêt moratoire de 5 % l’an peut être réclamé de plein droit (art. 104 CO), sans qu’il faille l’avoir mentionné à l’avance',
        'Sans échéance écrite, une sommation est d’abord nécessaire pour faire courir ce délai, ce qui souligne l’intérêt de toujours dater précisément',
      ],
    },
    { type: 'h2', text: 'Ce qu’il faut vraiment écrire sur une facture' },
    {
      type: 'list',
      items: [
        'Une échéance précise : « Payable d’ici au 15.03.2026 » plutôt qu’un vague « payable à 30 jours »',
        'Le rappel de l’intérêt moratoire applicable en cas de retard, à titre dissuasif',
        'Une relance écrite dès le lendemain de l’échéance dépassée, avant que le dossier ne s’enlise',
        'Un numéro de référence QR pour identifier immédiatement un paiement reçu, afin de ne jamais relancer par erreur un client qui a déjà payé',
      ],
    },
    {
      type: 'p',
      text: 'En pratique, la difficulté n’est presque jamais juridique. Elle est logistique : savoir en temps réel quelles factures traînent, sans devoir comparer à la main un relevé bancaire à une liste de factures envoyées trois mois plus tôt.',
    },
    {
      type: 'cta',
      title: 'Les échéances, visibles sans les chercher',
      text: 'Cantia affiche en un coup d’œil les factures en attente, échues ou en retard, et rapproche chaque paiement reçu à sa facture grâce à la référence QR.',
      buttonLabel: 'Voir le module Facturation',
    },
  ],
  faq: [
    {
      question: 'La Suisse impose-t-elle un délai de paiement légal de 30 jours ?',
      answer:
        'Non, contrairement à certains pays de l’UE. Le Code des obligations ne fixe pas de délai par défaut ; 30 jours est un usage courant mais doit être explicitement mentionné sur la facture pour avoir une valeur contractuelle claire.',
    },
    {
      question: 'Peut-on réclamer des intérêts de retard sans les avoir mentionnés sur la facture ?',
      answer:
        'Oui. L’intérêt moratoire de 5 % l’an prévu par l’art. 104 CO s’applique de plein droit dès que le débiteur est en demeure, qu’il ait été mentionné sur la facture ou non.',
    },
    {
      question: 'Que faire si une facture ne précise aucune échéance ?',
      answer:
        'La créance est en principe exigible immédiatement, mais il est recommandé d’envoyer une mise en demeure écrite avec une échéance claire pour pouvoir ensuite faire courir un retard et réclamer des intérêts moratoires.',
    },
  ],
  relatedSlugs: [
    'qr-facture-obligatoire-2026',
    'duree-conservation-devis-factures-suisse',
    'norme-sia-118-devis-obligatoire',
  ],
};
