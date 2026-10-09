import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'annulation-reservation-photographe-acompte-arrhes',
  question: 'Comment un photographe protège-t-il une date réservée en cas d’annulation ?',
  title: 'Photographe : protéger une date réservée contre l’annulation',
  description:
    'Mariage, événement, tournage : une date bloquée puis annulée est perdue. Offre signée, acompte, conditions d’annulation : ce qu’un photographe ou vidéaste doit prévoir.',
  excerpt:
    'Un samedi de juin ne se revend pas trois semaines avant. La protection se met en place à la réservation, pas au moment de l’annulation.',
  category: 'Services & autres métiers',
  keywords: ['annulation photographe', 'acompte photographe mariage', 'arrhes Suisse', 'contrat photographe', 'conditions annulation vidéaste'],
  publishedAt: '2026-10-09',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Pour un photographe ou un vidéaste, la date est le produit. Une réservation sans engagement bloque une journée que vous refusez à d’autres clients ; si elle est annulée tard, elle est simplement perdue.',
    },
    { type: 'h2', text: 'Une offre signée, pas un message' },
    {
      type: 'p',
      text: 'Un « c’est d’accord » par message laisse beaucoup de questions ouvertes. Une offre acceptée et signée fixe la date, les prestations, le prix et les conditions d’annulation.',
    },
    { type: 'h2', text: 'Les conditions d’annulation à écrire' },
    {
      type: 'table',
      headers: ['Annulation', 'Exemple de règle'],
      rows: [
        ['Plus de 3 mois avant', 'Acompte remboursé ou reporté sur une autre date'],
        ['Entre 3 mois et 1 mois', 'Acompte conservé'],
        ['Moins d’un mois', 'Une part plus importante du prix due'],
      ],
    },
    {
      type: 'p',
      text: 'Ces paliers ne sont qu’un exemple : à vous de les fixer selon votre activité. Ce qui compte, c’est qu’ils figurent dans l’offre acceptée.',
    },
    {
      type: 'callout',
      title: 'Acompte, arrhes ou dédit',
      text: 'Le Code des obligations distingue les arrhes et le dédit (art. 158 CO), avec des effets différents en cas de renonciation. Le plus sûr est d’écrire noir sur blanc ce que devient le montant versé si le client annule.',
    },
    { type: 'h2', text: 'Facturer l’acompte tout de suite' },
    {
      type: 'p',
      text: 'Envoyez la facture d’acompte dès la signature, avec le bulletin QR. La date n’est confirmée qu’une fois l’acompte payé : dites-le dans l’offre. La facture de solde déduira l’acompte.',
    },
    { type: 'h2', text: 'Compter la post-production' },
    {
      type: 'p',
      text: 'La journée de prise de vue n’est qu’une partie du travail. Notez le temps de préparation et de retouche par projet : c’est lui qui dit si vos forfaits sont justes.',
    },
    {
      type: 'cta',
      title: 'Offre signée, acompte envoyé, date protégée',
      text: 'Avec Cantia, le client signe l’offre en ligne, la facture d’acompte part aussitôt et la date entre dans votre planning. Essai gratuit de 14 jours.',
      buttonLabel: 'Essayer 14 jours',
    },
  ],
  faq: [
    {
      question: 'Un photographe peut-il garder l’acompte si le client annule ?',
      answer: 'Cela dépend de ce qui a été convenu. Écrivez les conditions d’annulation dans l’offre signée pour éviter toute discussion.',
    },
    {
      question: 'Quand envoyer la facture d’acompte ?',
      answer: 'Dès la signature de l’offre, en précisant que la date est confirmée à réception du paiement.',
    },
    {
      question: 'Faut-il un contrat pour un mariage ?',
      answer: 'Une offre détaillée et signée tient lieu de contrat : date, horaires, prestations, livrables, délais, prix et conditions d’annulation.',
    },
  ],
  relatedSlugs: ['corrections-incluses-offre-graphiste-droits', 'facturer-acompte-suisse-securiser-solde', 'signature-electronique-devis-suisse-valeur-legale'],
  relatedTradeSlug: 'photographe',
};
