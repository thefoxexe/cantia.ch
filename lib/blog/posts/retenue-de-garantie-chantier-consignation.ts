import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'retenue-de-garantie-chantier-consignation',
  question: 'Qu’est-ce que la retenue de garantie sur un chantier, et un maître d’ouvrage peut-il l’imposer ?',
  title: 'Retenue de garantie sur un chantier : ce qu’elle couvre, et jusqu’où elle peut aller',
  description:
    'Un maître d’ouvrage retient parfois 5 à 10 % du montant final « au cas où » : une pratique qui n’est pas automatique et doit être négociée, pas subie sans discussion.',
  excerpt:
    'Retenir une partie du paiement pour se prémunir contre des défauts futurs n’est ni interdit ni un droit acquis. C’est une clause qui se négocie, avec des limites claires.',
  category: 'Juridique & normes',
  keywords: ['retenue de garantie chantier', 'consignation travaux construction', 'garantie bancaire chantier', 'retenue de paiement travaux', 'solde chantier retenu'],
  publishedAt: '2026-06-22',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'La retenue de garantie consiste, pour un maître d’ouvrage, à ne pas verser l’intégralité du solde final d’un chantier immédiatement, en conservant une partie (souvent 5 à 10 %) comme garantie contre d’éventuels défauts découverts après réception. Ce n’est pas une règle légale automatique, mais une clause contractuelle qui doit être négociée et acceptée explicitement.',
    },
    { type: 'h2', text: 'Ce qui doit être précisé pour qu’une retenue soit valable' },
    {
      type: 'list',
      items: [
        'Le pourcentage exact retenu, fixé à l’avance dans le contrat ou le devis',
        'La durée de la retenue, qui correspond généralement à la période de garantie initiale (avant le passage aux 2 ou 5 ans complets)',
        'Les conditions de libération : à quelle date, sur quelle base, la retenue est-elle restituée à l’entrepreneur',
        'Une éventuelle alternative acceptée d’avance : garantie bancaire à première demande plutôt qu’une retenue en espèces',
      ],
    },
    { type: 'h2', text: 'Une alternative souvent plus favorable : la garantie bancaire' },
    {
      type: 'p',
      text: 'Plutôt que de laisser une part du chantier impayée pendant des mois, une entreprise peut proposer une garantie bancaire à première demande (un engagement de la banque à verser le montant en cas de défaut avéré, sans que l’entrepreneur ait à attendre sa trésorerie). Cela évite l’immobilisation directe de liquidités tout en offrant au client la même sécurité.',
    },
    {
      type: 'callout',
      title: 'Une retenue de garantie non encadrée par écrit devient un point de friction récurrent',
      text: 'Sans date de libération claire, le solde retenu se transforme souvent en un « oubli » du côté du client. La retenue doit donc toujours être accompagnée d’une échéance précise et écrite.',
    },
    {
      type: 'cta',
      title: 'Suivi des soldes retenus, chantier par chantier',
      text: 'Cantia garde une trace claire de ce qui reste dû sur chaque facture, pour ne jamais perdre le fil d’une retenue de garantie à réclamer une fois la période écoulée.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Un maître d’ouvrage peut-il imposer une retenue de garantie sans accord préalable ?',
      answer:
        'Non, la retenue de garantie est une clause contractuelle qui doit être négociée et acceptée explicitement. Elle n’est pas automatique en droit suisse.',
    },
    {
      question: 'Quel pourcentage est généralement retenu sur un chantier ?',
      answer:
        'Entre 5 et 10 % du montant final, selon ce qui a été négocié dans le contrat, car il n’existe pas de taux légal fixe.',
    },
    {
      question: 'Existe-t-il une alternative à la retenue en espèces ?',
      answer:
        'Oui, une garantie bancaire à première demande permet d’offrir la même sécurité au client sans immobiliser directement la trésorerie de l’entreprise.',
    },
  ],
  relatedSlugs: [
    'facturer-acompte-suisse-securiser-solde',
    'garantie-travaux-construction-2-ou-5-ans',
    'client-refuse-payer-solde-final-que-faire',
  ],
};
