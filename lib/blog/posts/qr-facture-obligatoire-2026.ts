import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'qr-facture-obligatoire-2026',
  question: 'La QR-facture est-elle obligatoire en Suisse en 2026 ?',
  title: 'QR-facture obligatoire en Suisse : ce qu’il faut savoir en 2026',
  description:
    'Le BVR n’existe plus depuis 2022, la QR-facture est le seul standard. Et depuis fin 2025, un nouveau changement de format menace les QR-factures non conformes.',
  excerpt:
    'Les bulletins de versement orange et roses ne sont plus acceptés depuis fin septembre 2022. Et la norme QR-facture elle-même vient encore de changer en 2025-2026.',
  category: 'Devis & facturation',
  keywords: ['qr-facture', 'bvr', 'iban', 'facturation suisse', 'qr-bill', 'paiement'],
  publishedAt: '2026-01-19',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Si vous facturez encore avec un ancien bulletin de versement orange (BVR) ou rose (BV) en 2026, la mauvaise nouvelle est simple : ces documents ne sont plus acceptés par les banques depuis le 30 septembre 2022. La QR-facture est, depuis, le seul standard de paiement suisse pour les factures papier et PDF.',
    },
    { type: 'h2', text: 'Ce qu’est la QR-facture' },
    {
      type: 'p',
      text: 'La QR-facture combine un talon de paiement structuré (montant, IBAN/QR-IBAN, référence, débiteur) et un QR-code lisible par n’importe quelle application bancaire suisse. Le client scanne, le montant et les coordonnées se remplissent tout seuls — plus d’erreur de saisie de référence, plus de bulletin perdu.',
    },
    {
      type: 'stat',
      value: '30.09.2022',
      label: 'Date à partir de laquelle les BVR/BV orange et roses ne sont plus acceptés par les banques suisses',
    },
    { type: 'h2', text: 'Le changement à connaître pour 2026 : adresses structurées obligatoires' },
    {
      type: 'p',
      text: 'La version 2.3 des spécifications QR-facture, entrée en vigueur en novembre 2025, impose que seules les adresses structurées (type "S" — rue, numéro, NPA et localité dans des champs séparés) soient acceptées dans le QR-code. Les adresses non structurées (type "K", un simple bloc de texte libre) seront rejetées par les banques à partir du 30 septembre 2026.',
    },
    {
      type: 'callout',
      title: 'Pourquoi c’est un piège silencieux',
      text: 'Un logiciel de facturation qui génère encore des QR-factures en adresse non structurée continuera à produire des factures qui scannent correctement aujourd’hui — jusqu’au jour où elles seront rejetées, souvent sans avertissement clair pour l’utilisateur.',
    },
    { type: 'h2', text: 'Ce qu’une QR-facture doit contenir' },
    {
      type: 'list',
      items: [
        'IBAN ou QR-IBAN du bénéficiaire (numéro dédié pour les créanciers utilisant la référence QR structurée)',
        'Montant et devise (ou champ vide si le montant est laissé au débiteur)',
        'Référence de paiement (QRR à 27 chiffres, ou référence ISO 11649/SCOR)',
        'Coordonnées du créancier et, le cas échéant, du débiteur — en adresse structurée depuis 2025-2026',
        'Le QR-code lui-même, positionné et dimensionné selon la norme (zone de tranquillité incluse)',
      ],
    },
    { type: 'h2', text: 'Le vrai gain : le suivi de paiement automatique' },
    {
      type: 'p',
      text: 'Au-delà de la conformité, la référence structurée de la QR-facture permet de rapprocher automatiquement un paiement reçu avec la facture correspondante, sans avoir à deviner de quel client vient un virement en lisant un relevé bancaire ligne par ligne.',
    },
    {
      type: 'cta',
      title: 'QR-facture conforme, déjà en adresse structurée',
      text: 'Cantia génère des QR-factures conformes à la dernière norme (adresses structurées) et rapproche automatiquement les paiements reçus grâce au numéro de référence.',
      buttonLabel: 'Voir le module Facturation',
    },
  ],
  faq: [
    {
      question: 'Peut-on encore utiliser un bulletin de versement orange en 2026 ?',
      answer:
        'Non. Les BVR (orange) et BV (rose) ne sont plus émis ni acceptés par les banques suisses depuis le 30 septembre 2022. Toute facture doit désormais inclure une section QR-facture.',
    },
    {
      question: 'Qu’est-ce qui change avec la version 2.3 de la norme QR-facture ?',
      answer:
        'Depuis novembre 2025, seules les adresses structurées (rue, numéro, NPA, localité en champs séparés) sont admises dans le QR-code. Les adresses en texte libre seront rejetées par les banques dès le 30 septembre 2026.',
    },
    {
      question: 'Quelle est la différence entre IBAN et QR-IBAN ?',
      answer:
        'Le QR-IBAN est un numéro dédié, reconnaissable à son identifiant d’établissement financier spécifique, utilisé uniquement pour les QR-factures avec référence QR structurée (QRR). Un IBAN standard peut aussi être utilisé sur une QR-facture, mais avec une référence de type SCOR ou sans référence.',
    },
  ],
  relatedSlugs: [
    'delai-paiement-facture-artisan-code-obligations',
    'duree-conservation-devis-factures-suisse',
    'calculer-prix-devis-renovation-suisse',
  ],
};
