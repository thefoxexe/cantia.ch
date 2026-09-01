import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'degats-voisinage-chantier-qui-est-responsable',
  question: 'Qui paie si un chantier cause des dégâts chez le voisin (fissure, poussière, vibrations) ?',
  title: 'Dégâts au voisinage causés par un chantier : qui est responsable, et comment se protéger',
  description:
    'Une fissure chez le voisin après des travaux de terrassement, de la poussière sur une façade fraîchement repeinte : la responsabilité n’est pas automatique, et se prouve avec un état des lieux préalable.',
  excerpt:
    'Sans état des lieux avant travaux, un voisin peut attribuer à votre chantier une fissure qui existait déjà. L’entreprise se retrouve alors à devoir prouver le contraire, souvent trop tard.',
  category: 'Juridique & normes',
  keywords: ['dégâts voisinage chantier', 'responsabilité travaux voisin', 'fissure chantier voisinage', 'nuisances chantier', 'état des lieux avant travaux'],
  publishedAt: '2026-06-19',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un chantier de terrassement, de démolition ou de gros œuvre peut causer des nuisances ou des dégâts chez un voisin (fissures, vibrations, poussière, dépôt de matériaux débordant sur une propriété adjacente). La responsabilité n’est jamais automatique : elle dépend de qui a causé le dommage, et surtout, de ce qui peut être prouvé.',
    },
    { type: 'h2', text: 'Qui porte la responsabilité en principe' },
    {
      type: 'list',
      items: [
        'L’entrepreneur répond de sa propre exécution défectueuse ou négligente (art. 41 CO, responsabilité pour faute)',
        'Le maître d’ouvrage peut aussi être visé si les travaux qu’il a commandés étaient intrinsèquement risqueux pour le voisinage (art. 679 CC, droits de voisinage)',
        'Une assurance RC professionnelle de l’entreprise couvre en général ce type de dommage, à condition qu’il soit correctement documenté',
      ],
    },
    { type: 'h2', text: 'La protection la plus efficace : l’état des lieux avant travaux' },
    {
      type: 'p',
      text: 'Un état des lieux contradictoire (photos datées, éventuellement avec le voisin) réalisé avant le début des travaux est la meilleure protection pour l’entreprise. Sans lui, un voisin peut, légitimement ou de mauvaise foi, attribuer une fissure préexistante au chantier, et l’entreprise n’a alors aucun moyen de prouver le contraire.',
    },
    {
      type: 'list',
      items: [
        'Photographier systématiquement les façades et éléments sensibles du voisinage avant le début des travaux',
        'Documenter les vibrations ou nuisances constatées en cours de chantier si elles semblent anormales',
        'Conserver ces preuves dans le dossier du chantier, pas seulement sur un téléphone personnel qui peut se perdre',
      ],
    },
    {
      type: 'callout',
      title: 'Un état des lieux réalisé après une plainte du voisin ne prouve rien',
      text: 'La preuve doit exister avant le fait contesté : un relevé pris après coup, une fois le litige déclaré, n’a aucune valeur pour établir l’état antérieur du bien.',
    },
    {
      type: 'cta',
      title: 'Photos de chantier horodatées, dès le premier jour',
      text: 'Le fil d’actualité de Cantia géolocalise et horodate chaque photo. Un état des lieux avant travaux devient ainsi un réflexe simple, documenté automatiquement.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Qui est responsable des dégâts causés à un voisin par un chantier ?',
      answer:
        'L’entrepreneur répond de sa propre exécution fautive, et le maître d’ouvrage peut aussi être visé si les travaux commandés étaient intrinsèquement risqueux pour le voisinage.',
    },
    {
      question: 'Comment se protéger contre une accusation de dégât non fondée ?',
      answer:
        'En réalisant un état des lieux contradictoire, avec photos datées, avant le début des travaux : c’est la seule preuve fiable de l’état antérieur du bien voisin.',
    },
    {
      question: 'L’assurance RC professionnelle couvre-t-elle les dégâts au voisinage ?',
      answer:
        'En général oui, à condition que le dommage soit correctement documenté et que la responsabilité de l’entreprise soit établie.',
    },
  ],
  relatedSlugs: [
    'assurance-rc-professionnelle-batiment-obligatoire',
    'photos-chantier-preuve-juridique-litige',
    'assurance-chantier-tous-risques-ectr-obligatoire',
  ],
};
