import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'formateur-independant-suisse-tva-facture',
  question: 'Un formateur indépendant en Suisse doit-il facturer la TVA ?',
  title: 'Formateur indépendant : TVA, factures et ce qu’il faut savoir',
  description:
    'Les prestations de formation sont en principe exclues de la TVA en Suisse. Ce que cela change pour un formateur indépendant ou une petite école : factures, décompte et pièges.',
  excerpt:
    'La formation est en principe hors du champ de la TVA, mais pas tout ce qu’un formateur facture. La différence se voit sur la facture et sur le décompte.',
  category: 'Services & autres métiers',
  keywords: ['formateur TVA Suisse', 'formation exclue TVA', 'art. 21 LTVA formation', 'facture formateur indépendant', 'chiffre 230 décompte TVA'],
  publishedAt: '2026-10-09',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un formateur qui dépasse le seuil de chiffre d’affaires de la TVA se demande souvent s’il doit l’ajouter à ses factures. Pour la formation elle-même, la réponse est en principe non ; pour le reste, cela dépend.',
    },
    { type: 'h2', text: 'La formation est exclue du champ de l’impôt' },
    {
      type: 'p',
      text: 'La loi sur la TVA exclut du champ de l’impôt les prestations de formation et d’éducation (art. 21 al. 2 ch. 11 LTVA). Une facture de formation ne comporte donc en principe pas de TVA. Il est possible d’opter pour l’imposition de certaines prestations exclues (art. 22 LTVA), avec des conséquences à examiner.',
    },
    {
      type: 'callout',
      title: 'Exclue ne veut pas dire « tout est exclu »',
      text: 'La location de salle, le matériel vendu à part, les repas ou le conseil en entreprise ne sont pas forcément de la formation au sens de la loi. Vérifiez chaque type de prestation.',
    },
    { type: 'h2', text: 'Ce que cela change si vous êtes assujetti' },
    {
      type: 'list',
      items: [
        'Les formations figurent dans le décompte TVA, au chiffre 230 (prestations exclues sans option)',
        'L’impôt préalable payé sur les achats liés à ces formations n’est en principe pas déductible',
        'Les autres prestations, imposables, portent la TVA au taux applicable',
      ],
    },
    { type: 'h2', text: 'Une facture claire' },
    {
      type: 'p',
      text: 'Indiquez la formation (intitulé, dates, participants), le prix, et pour une prestation exclue, l’absence de TVA. Si une même facture mélange formation et prestations imposables, séparez les lignes.',
    },
    { type: 'h2', text: 'Le statut d’indépendant' },
    {
      type: 'p',
      text: 'Facturer à plusieurs clients en votre nom et à vos risques ne suffit pas toujours à être reconnu indépendant par la caisse de compensation AVS. Si vous travaillez surtout pour une seule école, faites vérifier votre statut.',
    },
    {
      type: 'cta',
      title: 'Des factures et un décompte TVA justes',
      text: 'Avec Cantia, une formation sans TVA va au chiffre 230 du décompte, les prestations imposables portent la TVA, et le décompte AFC se prépare tout seul. Essai gratuit de 14 jours.',
      buttonLabel: 'Essayer 14 jours',
    },
  ],
  faq: [
    {
      question: 'Une formation pour une entreprise est-elle aussi exclue de la TVA ?',
      answer: 'En principe oui, les prestations de formation sont exclues quel que soit le client. Les prestations de conseil ou d’accompagnement qui ne sont pas de la formation peuvent en revanche être imposables.',
    },
    {
      question: 'Où déclarer les formations dans le décompte TVA ?',
      answer: 'Au chiffre 200 avec le reste du chiffre d’affaires, puis en déduction au chiffre 230 (prestations exclues du champ de l’impôt sans option).',
    },
    {
      question: 'Peut-on opter pour la TVA sur la formation ?',
      answer: 'La loi le permet pour certaines prestations exclues (art. 22 LTVA). L’option a des conséquences sur la déduction de l’impôt préalable et mérite d’être examinée avec une fiduciaire.',
    },
  ],
  relatedSlugs: ['declaration-tva-trimestrielle-artisan-suisse', 'mentions-obligatoires-facture-suisse-tva', 'forfait-ou-temps-passe-consultant-suisse'],
  relatedTradeSlug: 'formateur',
};
