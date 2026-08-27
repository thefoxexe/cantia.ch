import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-gratuit-ou-payant-que-dit-la-loi',
  question: 'Un devis doit-il être gratuit en Suisse, ou peut-on le facturer ?',
  title: 'Devis gratuit ou payant : ce que la loi suisse impose vraiment (rien)',
  description:
    'Aucune loi suisse n’oblige un artisan à établir un devis gratuit — mais la pratique du marché en a fait la norme. Voici quand facturer un devis est justifié, et comment le poser sans perdre le client.',
  excerpt:
    'Un devis, ce sont des heures de calcul, parfois un déplacement — et pourtant presque personne ne le facture. Ce n’est pas une obligation légale, c’est un usage. La nuance change tout pour un chiffrage complexe.',
  category: 'Devis & facturation',
  keywords: ['devis gratuit ou payant', 'facturer un devis', 'loi devis suisse', 'chiffrage travaux', 'devis complexe'],
  publishedAt: '2026-08-12',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Aucune disposition du Code des obligations n’impose la gratuité d’un devis. La croyance qu’un devis « doit » être gratuit vient de la pratique du marché, pas de la loi — un client peut s’attendre à ne rien payer pour un simple chiffrage standard, mais rien n’empêche juridiquement de facturer un devis, à condition de le poser clairement avant de s’y engager.',
    },
    { type: 'h2', text: 'Quand facturer un devis devient justifié' },
    {
      type: 'list',
      items: [
        'Un chiffrage qui nécessite plusieurs heures d’étude technique ou de déplacement sur un chantier complexe',
        'Une étude de faisabilité ou un avant-projet qui va au-delà d’un simple prix indicatif',
        'Un appel d’offres où plusieurs entreprises préparent un dossier détaillé sans garantie d’obtenir le marché',
        'Un client qui demande plusieurs versions ou variantes d’un même devis',
      ],
    },
    {
      type: 'callout',
      title: 'Le devis facturé se déduit souvent du prix final',
      text: 'Une pratique courante et bien acceptée : facturer un montant symbolique pour l’étude, déductible du prix total si le chantier est finalement confié — cela sécurise le temps investi sans braquer un client sérieux.',
    },
    { type: 'h2', text: 'Le vrai enjeu : le prévenir avant, pas après' },
    {
      type: 'p',
      text: 'Le seul vrai risque n’est pas juridique mais commercial : facturer un devis sans l’avoir annoncé au préalable crée un litige évitable. À l’inverse, l’indiquer explicitement (« étude chiffrée à CHF X, déduite du montant final en cas d’acceptation ») filtre naturellement les demandes non sérieuses tout en restant transparent avec un client engagé.',
    },
    {
      type: 'cta',
      title: 'Un devis clair, dès la première ligne',
      text: 'Cantia permet d’ajouter une mention de conditions directement sur le devis — de quoi préciser une éventuelle facturation d’étude sans complexité administrative supplémentaire.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'La loi suisse oblige-t-elle à faire des devis gratuits ?',
      answer:
        'Non, aucune loi ne l’impose. La gratuité est un usage du marché, pas une obligation légale — un devis peut être facturé s’il est annoncé clairement au préalable.',
    },
    {
      question: 'Peut-on déduire le prix d’un devis facturé du montant final des travaux ?',
      answer:
        'Oui, c’est une pratique courante et bien acceptée par les clients : le montant de l’étude est déduit de la facture finale si le chantier est confié à l’entreprise.',
    },
    {
      question: 'Faut-il prévenir le client avant de facturer un devis ?',
      answer:
        'Oui, dans les faits c’est indispensable — facturer un devis sans l’avoir annoncé au préalable crée un litige commercial évitable, même si rien ne l’interdit légalement.',
    },
  ],
  relatedSlugs: [
    'rediger-devis-qui-inspire-confiance-client',
    'validite-devis-signe-prix-qui-bouge',
    'devis-oral-valeur-legale-suisse',
  ],
};
