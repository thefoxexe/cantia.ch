import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'avenant-chantier-plus-value-moins-value',
  question: 'Comment facturer un avenant (plus-value ou moins-value) en cours de chantier ?',
  title: 'Facturer un avenant en cours de chantier sans se faire piéger',
  description:
    'Un client qui demande un changement en cours de chantier ne signe presque jamais d’avenant écrit sur le moment. C’est exactement ce qui transforme un service rendu en travail gratuit.',
  excerpt:
    '« Tant que vous y êtes, ajoutez donc ça » — la phrase la plus rentable à entendre sur un chantier, et la plus dangereuse à ne pas facturer correctement.',
  category: 'Devis & facturation',
  keywords: ['avenant', 'plus-value', 'moins-value', 'travaux supplémentaires', 'modification devis'],
  publishedAt: '2026-04-27',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: '« Tant que vous êtes là, vous pourriez aussi… » — la phrase qui démarre la moitié des avenants de chantier, presque toujours à l’oral, presque toujours sans qu’un nouveau prix soit clairement acté avant que le travail commence.',
    },
    { type: 'h2', text: 'La plus-value : la facturer avant, pas après' },
    {
      type: 'p',
      text: 'Un ajout de travail exécuté sans accord préalable sur le prix laisse l’entreprise en position de faiblesse au moment de facturer : le client découvre le montant après coup, sans avoir pu l’anticiper, et une négociation défavorable s’ouvre presque toujours à ce moment-là. La règle simple : un avenant, même court et informel, se chiffre et se fait valider avant de démarrer le travail supplémentaire — un message écrit avec le prix suffit, pas besoin d’un document formel de plusieurs pages.',
    },
    {
      type: 'callout',
      title: 'Le piège du « ça ne prendra pas longtemps »',
      text: 'Une petite plus-value non facturée aujourd’hui devient un précédent silencieux : le client s’habitue à des ajustements gratuits, et la prochaine demande — plus lourde — arrive avec la même attente implicite. Facturer systématiquement, même un petit montant, maintient la référence claire pour toute la suite du chantier.',
    },
    { type: 'h2', text: 'La moins-value : tout aussi importante à documenter' },
    {
      type: 'p',
      text: 'Un client qui retire une prestation prévue au devis initial (renonce à une finition, réduit une surface) doit voir le montant correspondant clairement déduit — mais cette déduction doit elle-même être actée par écrit, avec le nouveau total. Sans cette trace, une contestation ultérieure sur le montant final devient un point de désaccord évitable.',
    },
    { type: 'h2', text: 'Ce qu’un avenant devrait toujours préciser' },
    {
      type: 'list',
      items: [
        'La description précise de ce qui change (ajout ou retrait) par rapport au devis initial',
        'Le montant exact de la plus-value ou moins-value, chiffré séparément',
        'L’impact éventuel sur le délai de livraison, si le changement en a un',
        'La référence explicite au devis initial qu’il modifie',
      ],
    },
    {
      type: 'p',
      text: 'Sur un chantier avec plusieurs avenants successifs, garder trace de chacun évite aussi une confusion fréquente en fin de chantier : reconstruire, au moment de la facture finale, tous les ajustements accumulés sans document de référence clair pour chacun.',
    },
    {
      type: 'cta',
      title: 'Un avenant, chiffré et envoyé en quelques minutes',
      text: 'Cantia permet de créer rapidement un avenant lié au devis initial, avec le nouveau total recalculé automatiquement — envoyé au client avant que le travail supplémentaire ne démarre.',
      buttonLabel: 'Découvrir le module Devis',
    },
  ],
  faq: [
    {
      question: 'Faut-il facturer une petite plus-value demandée en cours de chantier ?',
      answer:
        'Oui, systématiquement — même un petit montant, pour maintenir une référence claire et éviter que le client ne s’habitue à des ajustements gratuits.',
    },
    {
      question: 'Quand faut-il faire valider le prix d’un avenant ?',
      answer:
        'Avant de démarrer le travail supplémentaire, pas après — un message écrit avec le prix suffit à sécuriser l’accord sans document formel lourd.',
    },
    {
      question: 'Une moins-value doit-elle aussi être documentée par écrit ?',
      answer:
        'Oui, pour éviter toute contestation ultérieure sur le montant final — la déduction et le nouveau total doivent être clairement actés.',
    },
  ],
  relatedSlugs: [
    'validite-devis-signe-prix-qui-bouge',
    'rediger-devis-qui-inspire-confiance-client',
    'client-refuse-payer-solde-final-que-faire',
  ],
};
