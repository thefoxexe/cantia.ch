import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'travail-au-noir-batiment-suisse-risques-controles',
  question: 'Quels sont les risques du travail au noir dans le bâtiment en Suisse ?',
  title: 'Travail au noir dans le bâtiment : ce que risque vraiment une entreprise',
  description:
    'Le secteur de la construction fait partie des branches les plus contrôlées par la LTN. Plus de 14’000 contrôles d’entreprises ont eu lieu en 2025 : les sanctions vont bien au-delà de l’amende.',
  excerpt:
    'La construction figure parmi les branches les plus contrôlées de Suisse. Et la sanction la plus lourde n’est pas l’amende. C’est l’exclusion des marchés publics.',
  category: 'Juridique & normes',
  keywords: ['travail au noir', 'ltn', 'contrôle chantier', 'sanctions bâtiment', 'seco'],
  publishedAt: '2026-04-30',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'La construction n’est pas un secteur contrôlé « comme les autres » en Suisse. C’est l’une des branches les plus ciblées par les inspections liées à la loi contre le travail au noir. En 2025, environ 14’450 contrôles d’entreprises ont été menés à l’échelle nationale, avec l’hôtellerie-restauration et la construction explicitement citées parmi les secteurs prioritaires.',
    },
    { type: 'h2', text: 'Ce que couvre exactement la LTN' },
    {
      type: 'p',
      text: 'La loi fédérale du 17 juin 2005 concernant des mesures en matière de lutte contre le travail au noir (LTN), avec son ordonnance d’application (OTN), vise à s’assurer que les obligations d’annonce et d’autorisation liées au droit des assurances sociales, au droit des étrangers et à l’impôt à la source sont correctement respectées, non seulement en cas d’absence totale de déclaration, mais aussi pour des déclarations partielles ou incomplètes.',
    },
    {
      type: 'callout',
      title: 'La sanction la plus lourde n’est pas financière',
      text: 'Au-delà des amendes, une condamnation entrée en force pour violation grave ou répétée peut entraîner l’exclusion d’une entreprise des marchés publics et la suppression ou réduction d’aides financières publiques (deux conséquences qui pèsent souvent plus lourd, sur la durée, que l’amende elle-même) pour une entreprise qui travaille avec des collectivités.',
    },
    { type: 'h2', text: 'Ce qui déclenche un contrôle sur un chantier' },
    {
      type: 'list',
      items: [
        'Un contrôle inopiné direct sur le chantier par des inspecteurs cantonaux ou paritaires',
        'Un signalement (concurrent, voisin, ancien employé) qui déclenche une vérification ciblée',
        'Un contrôle croisé lors d’une inspection liée à une autre entreprise du même chantier (sous-traitant notamment)',
      ],
    },
    { type: 'h2', text: 'Se protéger, du côté de l’entreprise principale' },
    {
      type: 'p',
      text: 'Le risque ne se limite pas à ses propres employés : une entreprise qui fait appel à un sous-traitant en défaut d’annonce peut se retrouver associée au problème sur son propre chantier, même sans faute directe. Vérifier qu’un sous-traitant est en règle (affiliation aux assurances sociales, autorisations pour du personnel étranger le cas échéant) avant de signer protège contre cet effet de contamination.',
    },
    {
      type: 'p',
      text: 'Pour l’entreprise elle-même, la meilleure protection reste la plus simple : une affiliation à jour de chaque collaborateur, des contrats de travail en bonne et due forme, et une trace claire des heures effectivement travaillées. C’est le genre de documentation qu’un contrôle demande en premier lieu.',
    },
    {
      type: 'cta',
      title: 'Les heures de l’équipe, tracées par chantier',
      text: 'Le module RH & Salaires de Cantia garde un historique clair des heures travaillées par chaque collaborateur, chantier par chantier, ce qui offre une base solide en cas de contrôle.',
      buttonLabel: 'Découvrir RH & Salaires',
    },
  ],
  faq: [
    {
      question: 'La construction est-elle particulièrement contrôlée en Suisse ?',
      answer:
        'Oui, c’est l’une des branches explicitement citées comme prioritaire dans les contrôles LTN, aux côtés de l’hôtellerie-restauration, avec des dizaines de milliers de personnes contrôlées chaque année.',
    },
    {
      question: 'Quelle est la sanction la plus lourde en cas de travail au noir constaté ?',
      answer:
        'Au-delà des amendes, une condamnation pour violation grave ou répétée peut entraîner l’exclusion des marchés publics et la suppression d’aides financières : des conséquences souvent plus lourdes sur la durée.',
    },
    {
      question: 'Une entreprise risque-t-elle quelque chose si son sous-traitant est en infraction ?',
      answer:
        'Elle peut se retrouver associée au problème sur son propre chantier même sans faute directe. D’où l’intérêt de vérifier la conformité d’un sous-traitant avant de l’engager.',
    },
  ],
  relatedSlugs: [
    'sous-traitant-batiment-suisse-contrat-facturation',
    'salaire-minimum-cct-construction-suisse',
    'assurance-rc-professionnelle-batiment-obligatoire',
  ],
};
