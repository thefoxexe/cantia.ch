import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'logiciel-facturation-qr-facture-comparatif-suisse',
  question: 'Comment choisir un logiciel de facturation qui gère vraiment bien la QR-facture suisse ?',
  title: 'Logiciel de facturation avec QR-facture : ce qui différencie un vrai support d’un module bricolé',
  description:
    'Beaucoup d’outils affichent « QR-facture compatible » sans respecter la norme dans le détail : adresse structurée, IBAN vs QR-IBAN, référence QR. Voici ce qui distingue les deux.',
  excerpt:
    'Un QR-code qui « a l’air correct » peut être rejeté par une banque au scan. La QR-facture suisse a des règles précises, et tous les logiciels ne les respectent pas de la même façon.',
  category: 'Comparatifs & outils',
  keywords: ['logiciel QR-facture', 'QR-facture suisse comparatif', 'logiciel facturation QR-IBAN', 'norme QR-facture 2.3', 'facturation suisse conforme'],
  publishedAt: '2026-06-03',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Depuis la disparition du bulletin de versement orange en 2022, la QR-facture est l’unique standard de paiement en Suisse. La plupart des logiciels de facturation affichent aujourd’hui « QR-facture » comme argument marketing. Mais générer un QR-code qui scanne correctement, à chaque fois, avec les bonnes données, est plus exigeant qu’il n’y paraît.',
    },
    { type: 'h2', text: 'Ce qui distingue un vrai support QR-facture' },
    {
      type: 'list',
      items: [
        'La gestion correcte de l’IBAN vs QR-IBAN (deux formats différents selon le type de compte, avec ou sans référence QR)',
        'L’adresse structurée (NPA et localité séparés), obligatoire depuis la norme 2.3 : une adresse en texte libre sera rejetée dès fin septembre 2026',
        'Le calcul et la vérification automatique de la référence QR (QRR), pour éviter une erreur de rapprochement côté client',
        'Une zone de quiétude (quiet zone) suffisante autour du QR-code — un code mal marginé peut échouer au scan même si les données sont correctes',
      ],
    },
    {
      type: 'callout',
      title: 'Un bug de génération QR-facture ne se voit souvent qu’au moment du paiement',
      text: 'Le PDF a l’air normal, le client tente de scanner ou de saisir la référence, et ça échoue — le problème remonte alors comme un retard de paiement, sans que la vraie cause (un défaut de conformité) soit évidente.',
    },
    { type: 'h2', text: 'Comment vérifier la conformité avant de choisir' },
    {
      type: 'list',
      items: [
        'Générer une facture test et la scanner avec une vraie application bancaire suisse, pas juste visuellement',
        'Vérifier que l’adresse apparaît bien structurée (NPA/localité séparés) et non en un seul bloc de texte',
        'Confirmer que le logiciel distingue automatiquement IBAN standard et QR-IBAN selon le compte configuré',
      ],
    },
    {
      type: 'cta',
      title: 'QR-facture conforme, générée automatiquement',
      text: 'Cantia génère des QR-factures conformes à la norme suisse dès la création du devis ou de la facture, sans configuration technique de votre part.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Quelle est la différence entre IBAN et QR-IBAN ?',
      answer:
        'Le QR-IBAN est un numéro dédié utilisé uniquement pour les QR-factures avec référence QR structurée (QRR), distinct d’un IBAN standard utilisable sans référence.',
    },
    {
      question: 'Pourquoi une QR-facture peut-elle échouer au scan ?',
      answer:
        'Une adresse non structurée, une zone de quiétude insuffisante ou une référence QR mal calculée peuvent toutes empêcher un scan correct, même si le PDF semble normal visuellement.',
    },
    {
      question: 'Depuis quand l’adresse structurée est-elle obligatoire sur une QR-facture ?',
      answer:
        'Depuis la norme 2.3 en novembre 2025 — les adresses en texte libre seront définitivement rejetées à partir du 30 septembre 2026.',
    },
  ],
  relatedSlugs: [
    'qr-facture-obligatoire-2026',
    'meilleur-logiciel-devis-facture-batiment-suisse-2026',
    'mentions-obligatoires-facture-suisse-tva',
  ],
};
