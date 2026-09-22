import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'immatriculer-entreprise-construction-registre-commerce',
  question: 'Comment immatriculer son entreprise de construction au registre du commerce en Suisse ?',
  title: 'Comment immatriculer son entreprise de construction au registre du commerce',
  description:
    'La procédure concrète pour inscrire une entreprise du bâtiment au registre du commerce suisse : quand c’est obligatoire, les étapes, les documents et les délais réels.',
  excerpt:
    'L’inscription au registre du commerce n’est pas obligatoire pour tout le monde dans le bâtiment. Voici qui doit s’inscrire, comment, et ce qui bloque le plus souvent le dossier.',
  category: 'Juridique & normes',
  keywords: [
    'immatriculer entreprise construction registre commerce',
    'inscription registre du commerce artisan',
    'ide numéro entreprise suisse',
    'créer sàrl registre du commerce',
    'quand inscrire entreprise registre commerce suisse',
  ],
  publishedAt: '2026-09-12',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'L’inscription au registre du commerce cristallise beaucoup d’angoisse au moment de créer une entreprise du bâtiment, alors que la procédure elle-même est plutôt balisée. Ce qui bloque le plus souvent, c’est de ne pas savoir si elle est réellement obligatoire dans sa situation.',
    },
    { type: 'h2', text: 'Qui doit s’inscrire, et qui peut attendre' },
    {
      type: 'list',
      items: [
        'Sàrl et SA : inscription toujours obligatoire, dès la constitution — l’entreprise n’existe juridiquement qu’une fois inscrite',
        'Raison individuelle : inscription obligatoire uniquement à partir de CHF 100’000 de chiffre d’affaires annuel',
        'Raison individuelle sous ce seuil : inscription facultative, mais souvent utile pour la crédibilité commerciale, l’ouverture d’un compte bancaire professionnel ou l’accès à certains marchés publics',
      ],
    },
    {
      type: 'callout',
      title: 'Le numéro IDE, lui, est toujours nécessaire',
      text: 'Que l’inscription au registre du commerce soit obligatoire ou non, un numéro IDE (identification des entreprises) est requis dès le début de l’activité indépendante, notamment pour la facturation. Il s’obtient gratuitement via le registre IDE de l’Office fédéral de la statistique, indépendamment de l’inscription au registre du commerce.',
    },
    { type: 'h2', text: 'La procédure pour une raison individuelle' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Choisir une raison de commerce conforme aux règles cantonales (le nom de famille du titulaire doit généralement y figurer)',
        'Réunir les documents : pièce d’identité, adresse de l’établissement, description de l’activité',
        'Déposer la réquisition auprès de l’office cantonal du registre du commerce compétent, en ligne ou par courrier selon le canton',
        'Attendre la vérification puis la publication dans la Feuille officielle suisse du commerce (FOSC)',
      ],
    },
    { type: 'h2', text: 'La procédure pour une Sàrl' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Rédiger les statuts de la société, avec l’aide d’un notaire ou d’une plateforme de création en ligne',
        'Ouvrir un compte de consignation bancaire et y déposer le capital social (CHF 20’000 minimum, intégralement libéré)',
        'Signer l’acte de constitution authentique devant notaire',
        'Le notaire transmet le dossier à l’office cantonal du registre du commerce pour inscription',
        'Une fois inscrite, la société débloque le capital consigné sur son propre compte professionnel',
      ],
    },
    { type: 'h2', text: 'Combien de temps ça prend réellement' },
    {
      type: 'p',
      text: 'Pour une Sàrl, entre le rendez-vous notarial et l’inscription effective, comptez généralement une à trois semaines selon le canton et la charge de l’office du registre du commerce — certains cantons sont nettement plus rapides que d’autres. Pour une raison individuelle qui choisit de s’inscrire volontairement, le délai est souvent plus court, la procédure étant plus simple.',
    },
    {
      type: 'stat',
      value: '1 à 3 semaines',
      label: 'entre le dépôt du dossier complet et l’inscription effective au registre du commerce, pour une Sàrl',
    },
    { type: 'h2', text: 'Ce qui fait le plus souvent traîner le dossier' },
    {
      type: 'p',
      text: 'Presque jamais la procédure en elle-même : le blocage vient d’une raison de commerce refusée pour non-conformité, d’un capital social pas encore intégralement libéré au moment du rendez-vous notarial, ou d’une adresse d’établissement qui ne correspond pas exactement aux documents fournis. Vérifier ces trois points avant de prendre rendez-vous évite la grande majorité des allers-retours.',
    },
    {
      type: 'cta',
      title: 'Une fois l’entreprise inscrite, place à la gestion réelle',
      text: 'Numéro IDE en main, Cantia génère des devis et factures conformes (mentions légales, TVA, QR-facture) dès le premier client.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Une raison individuelle doit-elle obligatoirement s’inscrire au registre du commerce ?',
      answer:
        'Seulement à partir de CHF 100’000 de chiffre d’affaires annuel. En dessous de ce seuil, l’inscription reste facultative, même si elle peut être utile pour la crédibilité commerciale ou l’accès à certains marchés.',
    },
    {
      question: 'Faut-il un numéro IDE même sans inscription au registre du commerce ?',
      answer:
        'Oui, le numéro IDE est nécessaire dès le début de l’activité indépendante, indépendamment de l’inscription au registre du commerce, et s’obtient gratuitement auprès de l’Office fédéral de la statistique.',
    },
    {
      question: 'Combien de temps prend l’inscription d’une Sàrl au registre du commerce ?',
      answer:
        'Généralement une à trois semaines entre le dépôt du dossier complet chez le notaire et l’inscription effective, selon le canton et la charge de l’office du registre du commerce concerné.',
    },
  ],
  relatedSlugs: [
    'creer-entreprise-batiment-suisse-guide-complet',
    'raison-individuelle-sarl-sa-quel-statut-batiment',
    'cout-creation-entreprise-construction-suisse',
    'mentions-obligatoires-facture-suisse-tva',
  ],
};
