import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-reparation-garage-supplement-accord-client',
  question: 'Un garage peut-il facturer plus que le devis de réparation ?',
  title: 'Devis de réparation au garage : que faire quand la facture dépasse ?',
  description:
    'Devis approximatif ou prix ferme, dépassement, accord du client : ce que prévoit le Code des obligations et comment un garage évite la contestation au moment de la facture.',
  excerpt:
    'En démontant, on découvre presque toujours quelque chose. Tout se joue sur la manière dont le supplément est annoncé et accepté avant d’être fait.',
  category: 'Services & autres métiers',
  keywords: ['devis réparation garage', 'dépassement devis voiture', 'art. 375 CO', 'supplément réparation accord client', 'garage facture contestée'],
  publishedAt: '2026-10-09',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Une réparation est en principe un contrat d’entreprise au sens du Code des obligations : le garage promet un résultat, le client un prix. La façon dont ce prix a été annoncé change tout au moment de la facture.',
    },
    { type: 'h2', text: 'Prix ferme ou devis approximatif' },
    {
      type: 'p',
      text: 'Si un prix a été fixé à forfait, le garage doit en principe exécuter pour ce prix, même si le travail s’avère plus long (art. 373 CO). Si le devis n’était qu’approximatif et qu’il est dépassé dans une mesure excessive, le client peut, selon les cas, se départir du contrat ou demander une réduction équitable (art. 375 CO).',
    },
    {
      type: 'callout',
      title: 'Écrivez ce qu’est votre devis',
      text: 'Indiquez clairement sur le document s’il s’agit d’un prix ferme ou d’une estimation, et ce qui n’est pas compris. C’est la première protection contre une contestation.',
    },
    { type: 'h2', text: 'Le supplément découvert pendant la réparation' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Arrêtez-vous avant de faire le travail supplémentaire',
        'Photographiez la pièce ou le défaut découvert',
        'Envoyez au client le supplément chiffré, avec la photo',
        'Attendez son accord écrit (une signature en ligne suffit en pratique pour la preuve)',
        'Reprenez le supplément tel quel sur la facture',
      ],
    },
    {
      type: 'p',
      text: 'Un accord oral au téléphone vaut contrat, mais il est difficile à prouver. Un accord écrit et daté, avec la photo, règle la question avant qu’elle ne se pose.',
    },
    { type: 'h2', text: 'Les heures d’atelier, la vraie marge' },
    {
      type: 'p',
      text: 'Comparez pour chaque réparation le temps facturé au temps réellement passé par les mécaniciens. Les écarts répétés sur un même type de travail indiquent un forfait mal calculé.',
    },
    {
      type: 'cta',
      title: 'Des suppléments acceptés avant d’être faits',
      text: 'Avec Cantia, le supplément part au client avec la photo, il l’accepte sur son téléphone, et la facture QR reprend tout. Essai gratuit de 14 jours.',
      buttonLabel: 'Essayer 14 jours',
    },
  ],
  faq: [
    {
      question: 'Le garage peut-il dépasser le devis sans prévenir ?',
      answer: 'Avec un prix ferme, en principe non. Avec un devis approximatif, un dépassement excessif ouvre au client des droits selon l’art. 375 CO. Dans tous les cas, prévenir et obtenir l’accord avant de continuer évite le litige.',
    },
    {
      question: 'Un accord par téléphone suffit-il ?',
      answer: 'Juridiquement, un accord oral peut suffire, mais il est difficile à prouver. Un accord écrit et daté est préférable.',
    },
    {
      question: 'Que doit contenir un devis de réparation ?',
      answer: 'Le véhicule, les travaux prévus, les pièces, la main-d’œuvre, la TVA si vous êtes assujetti, la validité et la nature du prix (ferme ou estimation).',
    },
  ],
  relatedSlugs: ['difference-devis-offre-facture-pro-forma', 'signature-electronique-devis-suisse-valeur-legale', 'photos-chantier-preuve-juridique-litige'],
  relatedTradeSlug: 'garagiste',
};
