import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'litige-chantier-mediation-ou-tribunal',
  question: 'Un désaccord sur un chantier tourne mal : faut-il aller directement au tribunal ou existe-t-il d’autres options ?',
  title: 'Litige de chantier : médiation, conciliation ou tribunal — comment choisir',
  description:
    'Le tribunal n’est presque jamais la première étape logique d’un litige de chantier en Suisse — une procédure de conciliation est même obligatoire avant la plupart des actions civiles.',
  excerpt:
    'Beaucoup d’entrepreneurs pensent au procès dès la première tension avec un client. En pratique, plusieurs étapes plus rapides et moins coûteuses existent avant d’en arriver là — certaines sont même obligatoires.',
  category: 'Juridique & normes',
  keywords: ['litige chantier médiation', 'conciliation tribunal construction', 'résolution conflit chantier', 'procédure civile Suisse bâtiment', 'litige client artisan'],
  publishedAt: '2026-06-24',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un désaccord sur la qualité des travaux, un solde contesté, un délai non respecté — les tensions font partie du métier. Mais aller directement au tribunal n’est ni la première option, ni même toujours possible immédiatement : le droit de procédure civile suisse impose en principe une tentative de conciliation avant la plupart des actions civiles.',
    },
    { type: 'h2', text: 'Les étapes, dans l’ordre logique' },
    {
      type: 'list',
      items: [
        'Discussion directe et écrite avec le client — souvent négligée, mais elle résout la majorité des différends sans frais',
        'Médiation privée : un tiers neutre facilite le dialogue, sans imposer de décision — rapide et peu coûteux, mais nécessite l’accord des deux parties',
        'Conciliation devant l’autorité compétente : obligatoire avant la plupart des procès civils en Suisse pour les litiges de faible et moyenne valeur',
        'Procédure judiciaire : uniquement si la conciliation échoue ou si le montant en jeu dépasse les seuils de compétence simplifiée',
      ],
      ordered: true,
    },
    {
      type: 'callout',
      title: 'Sauter l’étape de conciliation obligatoire fait rejeter la demande devant le tribunal',
      text: 'Pour la majorité des litiges civils, une autorisation de procéder délivrée après tentative de conciliation est une condition de recevabilité — sans elle, le tribunal ne peut simplement pas entrer en matière.',
    },
    { type: 'h2', text: 'Ce qui détermine la meilleure voie' },
    {
      type: 'list',
      items: [
        'Le montant en jeu : pour un petit litige, le coût d’un procès dépasse souvent l’enjeu financier réel',
        'La qualité de la relation avec le client : un accord amiable préserve une relation commerciale, un procès la ferme définitivement',
        'La solidité du dossier : des preuves écrites claires (devis, échanges, photos) rendent une conciliation bien plus rapide',
      ],
    },
    {
      type: 'p',
      text: 'Dans presque tous les cas, la solidité du dossier documentaire pèse plus que l’argumentation orale — un historique clair de devis, factures, échanges et photos de chantier accélère considérablement n’importe laquelle de ces étapes.',
    },
    {
      type: 'cta',
      title: 'Un dossier solide, prêt en cas de litige',
      text: 'Cantia centralise devis, factures, échanges et photos par chantier — l’historique complet reste disponible si une conciliation ou une procédure devient nécessaire.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Faut-il obligatoirement passer par une conciliation avant un procès en Suisse ?',
      answer:
        'Oui, pour la majorité des litiges civils, une tentative de conciliation est une condition de recevabilité avant de pouvoir saisir le tribunal.',
    },
    {
      question: 'La médiation est-elle obligatoire pour un litige de chantier ?',
      answer:
        'Non, la médiation privée est une démarche volontaire qui nécessite l’accord des deux parties, contrairement à la conciliation qui est imposée par la procédure.',
    },
    {
      question: 'Qu’est-ce qui accélère le plus une conciliation ou un litige ?',
      answer:
        'Un dossier documentaire solide — devis signés, échanges écrits, photos datées du chantier — pèse presque toujours plus que l’argumentation orale.',
    },
  ],
  relatedSlugs: [
    'client-refuse-payer-solde-final-que-faire',
    'photos-chantier-preuve-juridique-litige',
    'resiliation-contrat-entreprise-chantier-en-cours',
  ],
};
