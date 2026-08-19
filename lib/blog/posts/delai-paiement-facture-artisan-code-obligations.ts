import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'delai-paiement-facture-artisan-code-obligations',
  question: 'Quel est le délai de paiement légal d’une facture d’artisan en Suisse ?',
  title: 'Délai de paiement d’une facture d’artisan en Suisse : que dit la loi ?',
  description:
    'Le Code des obligations ne fixe pas de délai de paiement légal fixe — 30 jours est l’usage, mais tout dépend de ce qui figure sur votre facture. Explications et modèle de clause.',
  excerpt:
    'Contrairement à d’autres pays européens, la Suisse n’impose pas de délai de paiement légal fixe. Ce qui compte, c’est ce que vous écrivez vous-même sur la facture.',
  category: 'Juridique & normes',
  keywords: ['délai de paiement', 'facture', 'intérêt moratoire', 'code des obligations', 'relance'],
  publishedAt: '2026-01-22',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Un client qui paie 60 jours après réception, est-il en tort ? La réponse dépend presque entièrement d’une chose : ce qui est écrit sur votre facture — car en Suisse, contrairement à l’Union européenne, il n’existe pas de délai de paiement légal fixe imposé aux entreprises du bâtiment.',
    },
    { type: 'h2', text: 'Ce que dit (et ne dit pas) le Code des obligations' },
    {
      type: 'p',
      text: 'Le Code des obligations (CO) ne fixe pas un nombre de jours par défaut. En l’absence de délai précisé sur la facture ou dans le contrat, l’art. 75 CO prévoit que la créance est exigible immédiatement — le client devrait donc payer sans délai. Dans la pratique du bâtiment, 30 jours est la norme d’usage, mais elle n’a de force que si elle est explicitement écrite sur la facture ou le devis accepté.',
    },
    {
      type: 'callout',
      title: 'Le point à ne jamais oublier',
      text: 'Une facture sans échéance écrite est juridiquement payable immédiatement, mais dans les faits, très difficile à faire respecter faute de date de référence claire pour calculer un retard. Toujours indiquer une échéance précise, en toutes lettres ou en date calendaire.',
    },
    { type: 'h2', text: 'Que se passe-t-il une fois l’échéance dépassée ?' },
    {
      type: 'list',
      items: [
        'Le débiteur est en demeure automatiquement dès que l’échéance convenue est dépassée (art. 102 al. 2 CO) — pas besoin de rappel formel si une date était bien indiquée',
        'Un intérêt moratoire de 5 % l’an peut alors être réclamé de plein droit (art. 104 CO), sans qu’il faille l’avoir mentionné à l’avance',
        'Sans échéance écrite, il faut d’abord adresser une sommation (mise en demeure) pour faire courir ce délai — d’où l’intérêt de toujours dater précisément',
      ],
    },
    { type: 'h2', text: 'Bonnes pratiques pour vos factures' },
    {
      type: 'list',
      items: [
        'Toujours indiquer une échéance précise : "Payable d’ici au 15.03.2026" plutôt que "payable à 30 jours"',
        'Rappeler l’intérêt moratoire applicable en cas de retard, à titre dissuasif',
        'Envoyer une relance écrite dès le lendemain de l’échéance dépassée, avant que le dossier ne s’enlise',
        'Utiliser un numéro de référence QR sur chaque facture pour identifier immédiatement un paiement reçu sans devoir relancer par erreur un client qui a déjà payé',
      ],
    },
    {
      type: 'p',
      text: 'En pratique, la difficulté n’est presque jamais juridique — elle est logistique : savoir en temps réel quelles factures sont en retard, sans devoir comparer manuellement un relevé bancaire à une liste Excel de factures envoyées.',
    },
    {
      type: 'cta',
      title: 'Le suivi des échéances, automatique',
      text: 'Cantia affiche en un coup d’œil les factures en attente, échues ou en retard, et rapproche automatiquement chaque paiement reçu grâce à la référence QR — plus besoin de croiser manuellement le relevé bancaire.',
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
