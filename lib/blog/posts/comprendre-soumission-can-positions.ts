import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'comprendre-soumission-can-positions',
  question: 'Comment lire une soumission CAN (chapitres, positions, textes à compléter) ?',
  title: 'Lire une soumission CAN : chapitres, positions et textes à compléter',
  description:
    'Ce que signifient les numéros, les chapitres, les positions réservées et les textes à compléter d’une soumission établie selon le CAN, pour chiffrer sans rien oublier.',
  excerpt:
    'Une soumission CAN a l’air codée. Une fois la logique comprise, elle se lit vite, et c’est précisément ce qui permet de réutiliser vos prix d’un chantier à l’autre.',
  category: 'Juridique & normes',
  keywords: ['soumission can', 'catalogue des articles normalisés', 'crb can', 'npk', 'position soumission', 'lire une soumission'],
  publishedAt: '2026-10-24',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'En Suisse, beaucoup de soumissions du bâtiment sont rédigées avec le CAN, le Catalogue des articles normalisés publié par le CRB (en allemand NPK). L’architecte y choisit des textes standardisés, les complète et y ajoute les quantités. Pour l’entreprise, l’intérêt est double : les descriptions sont précises, et une même prestation porte le même numéro d’un projet à l’autre.',
    },
    { type: 'h2', text: 'La structure d’une soumission CAN' },
    {
      type: 'list',
      items: [
        'Le chapitre, identifié par un numéro à trois chiffres, correspond à un domaine de travaux.',
        'À l’intérieur, les paragraphes et sous-paragraphes regroupent les prestations voisines.',
        'La position est la ligne que vous chiffrez : numéro, texte, unité, quantité, puis prix unitaire et montant à remplir.',
        'Le récapitulatif additionne les chapitres et applique remises et TVA.',
      ],
    },
    { type: 'h2', text: 'Les textes à compléter' },
    {
      type: 'p',
      text: 'Certaines positions contiennent des passages que l’architecte a précisés (matériau, épaisseur, produit), d’autres vous demandent une information : marque proposée, type de produit, ou parfois une quantité. Lisez-les avec attention : un produit à indiquer non renseigné peut rendre l’offre incomplète, et un produit imposé change votre prix d’achat.',
    },
    { type: 'h2', text: 'Les positions réservées et les positions éventuelles' },
    {
      type: 'p',
      text: 'Une soumission peut contenir des positions qui ne seront exécutées que si nécessaire, ou des variantes à chiffrer en plus de l’offre de base. Le document indique comment elles comptent dans le total. Chiffrez-les sérieusement : elles servent souvent de base aux travaux supplémentaires en cours de chantier.',
    },
    {
      type: 'callout',
      title: 'Et les soumissions sans CAN ?',
      text: 'Beaucoup d’architectes, surtout sur de petits projets, rédigent leurs propres positions. La logique reste la même : des lignes numérotées avec unité et quantité, un prix unitaire à remplir, des sous-totaux et un récapitulatif.',
    },
    { type: 'h2', text: 'Pourquoi c’est utile pour vos prix' },
    {
      type: 'p',
      text: 'Comme une même prestation garde son numéro de position, vous pouvez constituer un catalogue de vos prix par numéro et le réutiliser. Dans Cantia, les prix que vous avez déjà offerts pour un numéro sont proposés quand la même position revient dans une nouvelle soumission importée. Le catalogue garde le numéro, l’unité et votre prix, jamais le texte du CAN.',
    },
    {
      type: 'cta',
      title: 'Importez votre prochaine soumission, CAN ou non',
      text: 'Positions, unités et quantités reprises, vos prix proposés, le PDF d’origine rempli. En bêta, une à l’essai dès le plan Essentiel.',
      buttonLabel: 'Essayer Cantia',
    },
  ],
  faq: [
    {
      question: 'Que veut dire CAN ?',
      answer: 'Catalogue des articles normalisés, publié par le CRB. C’est la version française du NPK (Normpositionen-Katalog) utilisé en Suisse alémanique.',
    },
    {
      question: 'Faut-il une licence pour lire une soumission CAN ?',
      answer:
        'En principe non : vous recevez le document de l’architecte et vous le remplissez. Les licences du CRB concernent surtout ceux qui rédigent des soumissions ou utilisent le catalogue dans un logiciel.',
    },
    {
      question: 'Cantia lit-il aussi les soumissions sans CAN ?',
      answer: 'Oui. L’import fonctionne avec les soumissions CAN et avec celles que l’architecte a rédigées lui-même, y compris les documents scannés, avec un écran de vérification.',
    },
  ],
  relatedSlugs: ['remplir-soumission-pdf-architecte', 'calculer-prix-unitaire-soumission', 'norme-sia-118-devis-obligatoire'],
};
