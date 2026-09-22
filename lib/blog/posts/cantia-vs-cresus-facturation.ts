import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'cantia-vs-cresus-facturation',
  question: 'Cantia ou Crésus Facturation : quelle différence pour une entreprise du bâtiment ?',
  title: 'Cantia vs Crésus Facturation : quelle différence pour le bâtiment',
  description:
    'Crésus Facturation est un logiciel suisse populaire et abordable, historiquement pensé pour Windows. Cantia est pensée mobile, pour le chantier. Comparaison honnête des deux approches.',
  excerpt:
    'Crésus Facturation est utilisé depuis des années par beaucoup d’indépendants suisses, pour de bonnes raisons. Reste à savoir s’il couvre ce qui se passe vraiment sur un chantier.',
  category: 'Comparatifs & outils',
  keywords: ['Crésus Facturation', 'alternative Crésus bâtiment', 'Crésus vs Cantia', 'logiciel facturation suisse artisan'],
  publishedAt: '2026-09-30',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Crésus Facturation fait partie des logiciels suisses les plus connus et les plus abordables pour la facturation et la comptabilité, utilisé depuis longtemps par de nombreux indépendants, historiquement sur un environnement Windows. Sa popularité tient à sa simplicité et à son prix accessible. La question, pour une entreprise du bâtiment, est de savoir si cette simplicité couvre aussi ce qui se passe réellement sur un chantier.',
    },
    { type: 'h2', text: 'Ce que Crésus Facturation fait bien' },
    {
      type: 'p',
      text: 'Facturation claire, gestion de base de la comptabilité, tarif accessible pour un indépendant ou une petite structure : Crésus reste un choix pertinent pour qui a des besoins de facturation simples et généraux, sans exigence particulière liée à un métier de terrain.',
    },
    { type: 'h2', text: 'Ce qui manque pour le suivi d’un chantier' },
    {
      type: 'p',
      text: 'Crésus Facturation n’a pas été construit autour des besoins spécifiques du bâtiment : pas de catalogue de prix par métier, pas de création de devis directement sur le chantier depuis un mobile, pas de suivi de rentabilité chantier par chantier, pas de rapport de chantier avec photos. Ce sont des besoins qui dépassent le périmètre d’un logiciel de facturation généraliste.',
    },
    {
      type: 'callout',
      title: 'Un logiciel de facturation n’est pas un outil de pilotage de chantier',
      text: 'Crésus Facturation fait bien ce pour quoi il a été pensé : émettre des factures simplement et à moindre coût. Cantia part du chantier, pas de la facture, et construit tout le reste (devis, planning, rentabilité) autour de cette réalité de terrain.',
    },
    { type: 'h2', text: 'Le tableau comparatif' },
    {
      type: 'table',
      headers: ['Critère', 'Crésus Facturation', 'Cantia'],
      rows: [
        ['Facturation simple et abordable', 'Oui', 'Oui'],
        ['Catalogue de prix spécifique aux métiers du bâtiment', 'Non', 'Oui'],
        ['Devis créé depuis le chantier, sur mobile', 'Non', 'Oui'],
        ['Rentabilité par chantier (devisé vs réel)', 'Non', 'Oui'],
        ['Rapport de chantier avec photos', 'Non', 'Oui'],
        ['Application mobile pensée pour le terrain', 'Limité', 'Oui'],
      ],
    },
    {
      type: 'p',
      text: 'Pour un indépendant avec des besoins de facturation très simples et sans réel enjeu de suivi de chantier, Crésus Facturation reste un choix économique raisonnable. Dès que le suivi de la rentabilité par chantier ou la mobilité sur le terrain deviennent centraux, l’écart avec un outil pensé pour le bâtiment se fait sentir.',
    },
    {
      type: 'cta',
      title: 'Un devis fait sur le chantier, une facture qui suit automatiquement',
      text: 'Avec Cantia, le devis se crée à la voix directement sur le chantier, la facture QR suisse se génère ensuite en un clic, et la rentabilité du chantier se calcule sans ressaisie.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Crésus Facturation suffit-il pour gérer une entreprise du bâtiment ?',
      answer:
        'Pour la seule facturation, oui dans bien des cas. Mais Crésus Facturation ne couvre pas le suivi de chantier, la rentabilité par projet ni les devis créés directement sur le terrain, des besoins propres au métier du bâtiment.',
    },
    {
      question: 'Quelle est la principale différence entre Crésus Facturation et Cantia ?',
      answer:
        'Crésus Facturation est un logiciel généraliste de facturation, simple et abordable. Cantia est pensée spécifiquement pour le déroulement d’un chantier du bâtiment, du devis sur le terrain jusqu’au paiement final.',
    },
    {
      question: 'Peut-on utiliser Crésus et Cantia en parallèle ?',
      answer:
        'C’est possible pour une période de transition, mais la plupart des entreprises du bâtiment qui adoptent un outil métier comme Cantia finissent par centraliser devis et factures au même endroit pour éviter la double saisie.',
    },
  ],
  relatedSlugs: ['cantia-vs-winbiz', 'cantia-vs-klara', 'meilleur-logiciel-devis-facture-batiment-suisse-2026'],
};
