import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'facturer-support-informatique-temps-passe',
  question: 'Comment facturer le support informatique au temps passé sans rien oublier ?',
  title: 'Support informatique : facturer chaque intervention, même les petites',
  description:
    'Appels courts, mises à jour à distance, déplacements : comment un informaticien indépendant ou une PME IT note, arrondit et facture le temps de support sans perte.',
  excerpt:
    'Ce ne sont pas les gros projets qui échappent à la facture, ce sont les vingt minutes au téléphone qu’on n’a pas notées.',
  category: 'Services & autres métiers',
  keywords: ['facturer support informatique', 'informaticien indépendant facture', 'tarif horaire informatique Suisse', 'contrat de support IT', 'temps passé facturation'],
  publishedAt: '2026-10-09',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Le support informatique se compose de dizaines de petites interventions. Chacune paraît trop courte pour être notée ; ensemble, elles représentent souvent plusieurs heures par client et par mois.',
    },
    { type: 'h2', text: 'Fixer les règles dans l’offre' },
    {
      type: 'list',
      items: [
        'Le tarif horaire, et s’il diffère sur site, à distance ou en urgence',
        'L’unité de facturation : par exemple tranches de 15 minutes, avec un minimum',
        'Les frais de déplacement',
        'Ce qui est compris dans un éventuel forfait mensuel',
      ],
    },
    { type: 'h2', text: 'Noter au moment où ça se passe' },
    {
      type: 'p',
      text: 'La seule méthode qui marche : saisir le temps sur le mandat du client juste après l’intervention, avec une ligne de description. Une note dictée sur le téléphone suffit si vous êtes en route.',
    },
    {
      type: 'callout',
      title: 'Forfait de support',
      text: 'Un forfait mensuel stabilise vos revenus, à condition de suivre le temps réellement passé. Sinon, vous ne saurez jamais si le forfait est encore rentable.',
    },
    { type: 'h2', text: 'Une facture lisible' },
    {
      type: 'p',
      text: 'Regroupez les interventions du mois par client, avec la date, la description et le temps. Le client voit ce qu’il paie et pose moins de questions. Ajoutez le bulletin QR, et si vous êtes assujetti, la TVA et votre numéro IDE.',
    },
    { type: 'h2', text: 'Projets : comparer l’offre et le réalisé' },
    {
      type: 'p',
      text: 'Pour un projet au forfait, suivez les heures en cours de route. À 70 % du budget consommé, il est encore temps d’en parler au client ; à la facturation, c’est trop tard.',
    },
    {
      type: 'cta',
      title: 'Le temps saisi, la facture prête',
      text: 'Avec Cantia, chaque intervention est saisie sur le mandat du client et la facture se prépare depuis l’offre et les heures. Essai gratuit de 14 jours.',
      buttonLabel: 'Essayer 14 jours',
    },
  ],
  faq: [
    {
      question: 'Peut-on facturer un minimum par intervention ?',
      answer: 'Oui, si votre offre ou vos conditions le prévoient, par exemple un quart d’heure minimum par intervention à distance.',
    },
    {
      question: 'Forfait ou temps passé pour le support ?',
      answer: 'Le forfait apporte de la régularité, le temps passé de la précision. Beaucoup combinent un forfait de base et la facturation du temps au-delà.',
    },
    {
      question: 'Que doit indiquer la facture ?',
      answer: 'Vos coordonnées, celles du client, la date, les prestations, les montants, et pour une entreprise assujettie la TVA et le numéro IDE.',
    },
  ],
  relatedSlugs: ['forfait-ou-temps-passe-consultant-suisse', 'mentions-obligatoires-facture-suisse-tva', 'relancer-client-facture-impayee-sans-perdre-client'],
  relatedTradeSlug: 'informaticien',
};
