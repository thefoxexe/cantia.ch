import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'comment-facturer-premiers-clients-debut-activite',
  question: 'Comment facturer correctement ses tout premiers clients quand on débute une activité ?',
  title: 'Facturer ses premiers clients : les bons réflexes dès le premier document',
  description:
    'La première facture donne le ton pour toutes celles qui suivront. Les points à vérifier avant de l\'envoyer, pour partir sur de bonnes bases dès le début de l\'activité.',
  excerpt:
    'La toute première facture envoyée compte plus qu\'elle n\'en a l\'air — c\'est souvent elle qui détermine si un client débutant paie vite et sans négocier, ou traîne des pieds.',
  category: 'Comparatifs & outils',
  keywords: ['facturer premiers clients', 'première facture indépendant', 'débuter facturation activité', 'facture conforme débutant Suisse', 'conseils première facturation'],
  publishedAt: '2026-07-26',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'La première facture envoyée à un client marque souvent un cap symbolique dans une nouvelle activité — mais elle a aussi un vrai poids pratique : un document professionnel et conforme dès le départ installe une relation de confiance, un document approximatif installe le doute.',
    },
    { type: 'h2', text: 'Ce qu\'il ne faut jamais oublier sur une première facture' },
    {
      type: 'list',
      items: [
        'Un numéro de facture, séquentiel et sans trou, dès le premier document',
        'Le taux de TVA applicable, ou une mention claire de non-assujettissement si c\'est le cas',
        'Des coordonnées bancaires exactes, idéalement avec une référence de paiement QR-facture',
        'Un délai de paiement clairement indiqué, pas seulement sous-entendu',
      ],
    },
    {
      type: 'stat',
      value: '30 jours',
      label: 'délai de paiement standard généralement appliqué en Suisse pour une première facture, sauf accord différent explicitement mentionné',
    },
    { type: 'h2', text: 'Facturer vite après la fin du travail, pas des semaines plus tard' },
    {
      type: 'p',
      text: 'Un client se souvient encore clairement du travail effectué et de sa satisfaction juste après la fin du chantier — une facture envoyée rapidement se conteste beaucoup moins qu\'une facture arrivée trois semaines plus tard, une fois le souvenir plus flou.',
    },
    {
      type: 'callout',
      title: 'Un outil qui applique automatiquement les bonnes règles évite l\'erreur de débutant',
      text: 'Numérotation, TVA, mentions obligatoires : un logiciel de facturation les gère automatiquement, ce qui évite l\'erreur classique du tout premier document fait "à la main".',
    },
    {
      type: 'cta',
      title: 'Une facture conforme dès le premier envoi',
      text: 'Cantia applique automatiquement numérotation, TVA et QR-facture suisse — pour que même la toute première facture soit irréprochable.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Quelles mentions ne doivent jamais manquer sur une première facture ?',
      answer:
        'Un numéro séquentiel, le taux de TVA applicable (ou une mention de non-assujettissement), des coordonnées bancaires exactes et un délai de paiement clair.',
    },
    {
      question: 'Combien de temps après la fin du chantier faut-il envoyer la facture ?',
      answer:
        'Le plus rapidement possible — un client se souvient encore clairement du travail effectué juste après, ce qui réduit le risque de contestation par rapport à une facture envoyée des semaines plus tard.',
    },
    {
      question: 'Un logiciel de facturation aide-t-il à éviter les erreurs de débutant ?',
      answer:
        'Oui — il applique automatiquement la numérotation, la TVA et les mentions obligatoires, ce qui évite les oublis fréquents sur une facture faite manuellement.',
    },
  ],
  relatedSlugs: [
    'mentions-obligatoires-facture-suisse-tva',
    'vitesse-reponse-devis-taux-conversion-batiment',
    'logiciel-facturation-raison-individuelle-suisse',
  ],
};
