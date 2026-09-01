import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'qr-facture-obligatoire-2026',
  question: 'La QR-facture est-elle obligatoire en Suisse en 2026 ?',
  title: 'QR-facture obligatoire en Suisse : ce qu’il faut savoir en 2026',
  description:
    'Le BVR n’existe plus depuis 2022, la QR-facture est le seul standard. Et depuis fin 2025, un nouveau changement de format menace les QR-factures non conformes.',
  excerpt:
    'Si vos QR-factures scannent encore aujourd’hui, ça ne veut pas dire qu’elles scanneront encore en octobre 2026. Un détail de format vient de changer la donne.',
  category: 'Devis & facturation',
  keywords: ['qr-facture', 'bvr', 'iban', 'facturation suisse', 'qr-bill', 'paiement'],
  publishedAt: '2026-01-19',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Si vous facturez encore avec un bulletin de versement orange ou rose en 2026, la banque de votre client ne l’acceptera tout simplement plus. Ces documents sont morts depuis le 30 septembre 2022. Mais la vraie question pour cette année n’est plus là : elle est dans un changement de format bien plus discret, passé sous le radar de la plupart des entreprises.',
    },
    { type: 'h2', text: 'Ce qu’est la QR-facture' },
    {
      type: 'p',
      text: 'Un talon de paiement structuré (montant, IBAN ou QR-IBAN, référence, débiteur) plus un QR-code lisible par n’importe quelle app bancaire suisse. Le client scanne, le montant et les coordonnées se remplissent tout seuls : fini l’erreur de saisie de référence, fini le bulletin égaré au fond d’un classeur.',
    },
    {
      type: 'stat',
      value: '30.09.2022',
      label: 'Date à partir de laquelle les BVR/BV orange et roses ne sont plus acceptés par les banques suisses',
    },
    { type: 'h2', text: 'Le vrai piège de 2026 : les adresses non structurées' },
    {
      type: 'p',
      text: 'La version 2.3 des spécifications QR-facture, entrée en vigueur en novembre 2025, impose que seules les adresses structurées (type « S » : rue, numéro, NPA et localité dans des champs séparés) soient acceptées dans le QR-code. Les adresses en texte libre (type « K ») seront rejetées par les banques dès le 30 septembre 2026.',
    },
    {
      type: 'callout',
      title: 'Pourquoi personne ne le voit venir',
      text: 'Un logiciel qui génère encore des QR-factures en adresse non structurée continue à produire des documents parfaitement fonctionnels aujourd’hui. Le problème n’apparaît pas en test, il apparaît le jour où une banque commence à rejeter, et ce souvent sans message d’erreur clair du côté de l’utilisateur.',
    },
    { type: 'h2', text: 'Ce qu’une QR-facture doit contenir' },
    {
      type: 'list',
      items: [
        'IBAN ou QR-IBAN du bénéficiaire (numéro dédié pour la référence QR structurée)',
        'Montant et devise, ou champ vide si le montant est laissé au débiteur',
        'Référence de paiement (QRR à 27 chiffres, ou référence ISO 11649/SCOR)',
        'Coordonnées du créancier et, le cas échéant, du débiteur (en adresse structurée depuis 2025-2026)',
        'Le QR-code lui-même, dimensionné et positionné selon la norme, zone de tranquillité incluse',
      ],
    },
    { type: 'h2', text: 'Le vrai gain n’est pas la conformité, c’est le rapprochement automatique' },
    {
      type: 'p',
      text: 'La référence structurée permet de faire correspondre un paiement reçu à sa facture sans deviner, sans relever une liste de virements ligne par ligne un mercredi soir. C’est l’argument qui compte le plus une fois la conformité acquise.',
    },
    {
      type: 'cta',
      title: 'Conforme aujourd’hui, conforme en septembre 2026',
      text: 'Cantia génère des QR-factures en adresse structurée depuis le premier jour et rapproche automatiquement chaque paiement reçu grâce au numéro de référence.',
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
