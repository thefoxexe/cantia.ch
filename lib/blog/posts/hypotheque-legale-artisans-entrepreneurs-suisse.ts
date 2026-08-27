import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'hypotheque-legale-artisans-entrepreneurs-suisse',
  question: 'Qu’est-ce que l’hypothèque légale des artisans et entrepreneurs, et comment ne pas la perdre ?',
  title: 'Hypothèque légale des artisans et entrepreneurs : votre garantie de paiement, avec un délai strict',
  description:
    'L’hypothèque légale (art. 837 CC) garantit le paiement de vos travaux sur l’immeuble lui-même — mais elle doit être inscrite au registre foncier dans un délai de 4 mois. Passé ce délai, elle disparaît.',
  excerpt:
    'Un client qui ne paie pas peut être poursuivi — mais s’il est insolvable ou disparaît, la poursuite ne récupère rien. L’hypothèque légale, elle, garde une prise directe sur le bâtiment que vous avez construit.',
  category: 'Juridique & normes',
  keywords: ['hypothèque légale artisans', 'art 837 CC', 'garantie paiement chantier', 'registre foncier', 'entrepreneur impayé'],
  publishedAt: '2026-08-24',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un client insolvable ou de mauvaise foi qui ne paie pas votre facture n’est pas seulement un problème de trésorerie — c’est un risque que la poursuite ordinaire ne couvre pas toujours, s’il n’a plus d’actifs mobiliers. L’hypothèque légale des artisans et entrepreneurs, prévue par l’art. 837 du Code civil, existe précisément pour ce cas : elle vous donne un droit de gage directement sur l’immeuble que vous avez construit, transformé ou rénové.',
    },
    { type: 'h2', text: 'Un droit puissant, mais qui expire vite' },
    {
      type: 'p',
      text: 'Ce droit n’est pas automatique et n’est pas permanent : il doit être inscrit au registre foncier dans un délai de 4 mois après l’achèvement des travaux. Passé ce délai, l’hypothèque légale s’éteint définitivement, même si la créance elle-même reste due. C’est le piège le plus fréquent — beaucoup d’entrepreneurs découvrent ce mécanisme seulement quand il est déjà trop tard pour l’utiliser.',
    },
    {
      type: 'stat',
      value: '4 mois',
      label: 'délai strict, à partir de la fin des travaux, pour requérir l’inscription au registre foncier',
    },
    { type: 'h2', text: 'Qui peut s’en prévaloir, et sur quoi' },
    {
      type: 'list',
      items: [
        'Tout artisan ou entrepreneur ayant fourni des matériaux et/ou du travail pour la construction ou la rénovation d’un immeuble',
        'Y compris un sous-traitant, même sans lien contractuel direct avec le propriétaire du bien',
        'La garantie porte sur l’immeuble concerné, quel que soit le montage financier ou le nombre d’intervenants sur le chantier',
        'Un simple accord ou une reconnaissance de dette du client ne remplace jamais l’inscription — seule l’inscription au registre foncier crée la sûreté',
      ],
    },
    {
      type: 'callout',
      title: 'Le compte à rebours démarre à la fin réelle des travaux, pas à la date de la facture',
      text: 'Savoir précisément quand un chantier s’est terminé — et pouvoir le prouver — est ce qui détermine si vous êtes encore dans le délai de 4 mois ou déjà hors délai.',
    },
    {
      type: 'cta',
      title: 'Un chantier daté, du premier au dernier jour',
      text: 'Cantia garde la trace de chaque chantier, de son ouverture à sa clôture — de quoi établir sans ambiguïté la date de fin de travaux si vous devez agir vite pour préserver votre hypothèque légale.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Qu’est-ce que l’hypothèque légale des artisans et entrepreneurs ?',
      answer:
        'Un droit de gage sur l’immeuble construit ou rénové, prévu par l’art. 837 CC, qui garantit le paiement des travaux fournis même en l’absence d’autres actifs saisissables chez le client.',
    },
    {
      question: 'Quel est le délai pour l’inscrire ?',
      answer:
        'Quatre mois à compter de l’achèvement des travaux. Passé ce délai, le droit s’éteint définitivement, même si la créance reste due.',
    },
    {
      question: 'Un sous-traitant peut-il demander une hypothèque légale ?',
      answer:
        'Oui, ce droit existe indépendamment d’un lien contractuel direct avec le propriétaire de l’immeuble, du moment que des matériaux ou du travail ont été fournis pour la construction.',
    },
  ],
  relatedSlugs: [
    'poursuite-facture-impayee-procedure-suisse',
    'relancer-client-facture-impayee-sans-perdre-client',
    'client-refuse-payer-solde-final-que-faire',
  ],
};
