import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'resiliation-contrat-entreprise-chantier-en-cours',
  question: 'Un client peut-il résilier un contrat de chantier en cours de travaux, et à quel prix ?',
  title: 'Résiliation d’un contrat d’entreprise en cours de chantier : ce que dit l’art. 377 CO',
  description:
    'Un maître d’ouvrage peut résilier un contrat d’entreprise à tout moment, même en plein chantier — mais l’art. 377 CO lui impose de vous indemniser intégralement. Voici comment.',
  excerpt:
    'Un client peut arrêter un chantier du jour au lendemain, sans faute de votre part. La loi ne l’empêche pas — mais elle vous protège financièrement, à condition de savoir chiffrer correctement.',
  category: 'Juridique & normes',
  keywords: ['résiliation contrat chantier', 'art 377 CO', 'arrêt chantier', 'indemnisation entrepreneur', 'contrat entreprise'],
  publishedAt: '2026-08-27',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'C’est une situation qui déstabilise beaucoup d’artisans : un client annonce qu’il arrête le chantier, sans reproche particulier sur le travail effectué. Première réaction, souvent fausse : penser qu’un contrat signé ne peut pas être rompu unilatéralement. En droit suisse, si — et c’est même explicitement prévu par la loi.',
    },
    { type: 'h2', text: 'L’art. 377 CO : une résiliation possible à tout moment' },
    {
      type: 'p',
      text: 'L’article 377 du Code des obligations autorise le maître d’ouvrage à résilier le contrat en tout temps, tant que l’ouvrage n’est pas terminé — sans avoir à justifier de motif ni de faute de l’entrepreneur. Ce droit existe précisément parce que la contrepartie est claire : le client qui l’exerce doit indemniser l’entrepreneur pour l’intégralité du dommage causé par cet arrêt.',
    },
    {
      type: 'callout',
      title: 'L’indemnisation ne se limite pas au travail déjà fait',
      text: 'L’art. 377 CO prévoit le remboursement des dépenses engagées, la rémunération du travail déjà exécuté, et le gain manqué que l’entrepreneur aurait réalisé si le chantier était allé à son terme — sous déduction de ce qu’il a économisé en n’ayant pas à le terminer.',
    },
    { type: 'h2', text: 'Ce qu’il faut pouvoir prouver pour être indemnisé correctement' },
    {
      type: 'list',
      items: [
        'Le détail des heures et matériaux déjà engagés sur ce chantier précisément, pas une estimation globale',
        'Le devis initial accepté, qui sert de base pour calculer le manque à gagner sur la partie non réalisée',
        'Les commandes de matériel déjà passées (et non annulables) au moment de l’arrêt',
        'La date exacte de la notification de résiliation, point de départ du calcul',
      ],
    },
    {
      type: 'p',
      text: 'C’est là que la plupart des litiges se jouent : sans historique clair de ce qui a été facturé, chiffré ou exécuté chantier par chantier, l’entrepreneur négocie sa propre indemnisation à l’aveugle, et le client a tout intérêt à minimiser. Un devis détaillé par position, avec un suivi de ce qui a réellement été facturé dessus, transforme une négociation floue en calcul vérifiable.',
    },
    {
      type: 'cta',
      title: 'Un historique clair, chantier par chantier',
      text: 'Cantia relie chaque devis, facture et acompte à son chantier — de quoi reconstituer en quelques clics ce qui a été engagé et facturé si un client arrête un chantier en cours.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Un client peut-il résilier un contrat de chantier sans raison ?',
      answer:
        'Oui, l’art. 377 CO le permet à tout moment tant que l’ouvrage n’est pas terminé, sans avoir à justifier de faute de l’entrepreneur.',
    },
    {
      question: 'Que doit payer le client qui résilie un chantier en cours ?',
      answer:
        'Le travail déjà exécuté, les dépenses engagées, et le gain manqué sur la part non réalisée, sous déduction des économies faites par l’entrepreneur en ne terminant pas.',
    },
    {
      question: 'Faut-il un motif écrit pour que la résiliation soit valable ?',
      answer:
        'Non, la loi n’exige pas de justification — mais une notification claire, datée, fixe le point de départ du calcul de l’indemnisation.',
    },
  ],
  relatedSlugs: [
    'client-refuse-payer-solde-final-que-faire',
    'validite-devis-signe-prix-qui-bouge',
    'defaut-construction-decouvert-apres-reception-qui-paie',
  ],
};
