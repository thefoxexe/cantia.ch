import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-facture-paysagiste-jardinier-suisse',
  question: 'Comment un paysagiste doit-il chiffrer un devis entre aménagement ponctuel et entretien récurrent ?',
  title: 'Paysagiste : chiffrer l’aménagement ponctuel et l’entretien récurrent sans les mélanger',
  description:
    'Un chantier d’aménagement extérieur et un contrat d’entretien de jardin suivent deux logiques de facturation opposées, l’un au projet, l’autre en récurrence. Comment les structurer proprement.',
  excerpt:
    'Un paysagiste vend souvent deux choses très différentes au même client : un aménagement ponctuel facturé une fois, et un entretien récurrent facturé toute l’année. Les confondre dans un même devis finit par mal chiffrer les deux.',
  category: 'Métiers du bâtiment',
  keywords: ['devis paysagiste', 'facturation jardinier Suisse', 'contrat entretien jardin prix', 'devis aménagement extérieur', 'facturation récurrente paysagiste'],
  publishedAt: '2026-09-10',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'L’aménagement d’un jardin (terrassement, plantation, dallage, arrosage automatique) se chiffre comme n’importe quel chantier ponctuel : un devis, une réalisation, une facture. L’entretien qui suit (tonte, taille, désherbage) fonctionne sur un rythme complètement différent, souvent mensuel ou saisonnier, et mérite un contrat séparé plutôt qu’un devis classique repris chaque fois.',
    },
    { type: 'h2', text: 'Aménagement ponctuel : chiffrer poste par poste' },
    {
      type: 'list',
      items: [
        'Terrassement et évacuation de terre, souvent le poste le plus variable selon l’accès au terrain',
        'Fourniture de végétaux, séparée du temps de plantation, car les prix varient selon la saison',
        'Maçonnerie paysagère (murets, dallage, bordures) au m² ou au forfait',
        'Arrosage automatique et éclairage extérieur, souvent sous-traités mais à intégrer dans le suivi global du chantier',
      ],
    },
    { type: 'h2', text: 'Entretien récurrent : un contrat, pas un devis répété' },
    {
      type: 'p',
      text: 'Refaire un devis à chaque passage d’entretien est une perte de temps administratif pour tout le monde. Un contrat annuel ou saisonnier, avec une fréquence de passage définie et une facturation régulière (mensuelle ou par passage), simplifie la gestion et sécurise un revenu récurrent plus stable qu’une succession de chantiers ponctuels.',
    },
    {
      type: 'stat',
      value: '4-8',
      label: 'passages annuels typiques pour un contrat d’entretien de jardin résidentiel standard en Suisse, hors interventions exceptionnelles',
    },
    {
      type: 'callout',
      title: 'La saisonnalité influence directement la trésorerie',
      text: 'Un paysagiste dont l’activité se concentre sur le printemps et l’été doit anticiper les mois plus creux. Un contrat d’entretien récurrent signé à l’année lisse une partie de cette saisonnalité, contrairement à des chantiers ponctuels qui s’arrêtent en hiver.',
    },
    {
      type: 'cta',
      title: 'Gardez vos chantiers ponctuels et vos contrats d’entretien bien séparés',
      text: 'Cantia permet de suivre chaque chantier indépendamment (devis, factures et rentabilité) pour distinguer clairement vos projets d’aménagement de vos contrats d’entretien récurrents.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Faut-il refaire un devis à chaque passage d’entretien de jardin ?',
      answer:
        'Non : un contrat d’entretien annuel ou saisonnier avec une fréquence de passage définie évite de reproduire un devis à chaque intervention et simplifie la facturation récurrente.',
    },
    {
      question: 'Comment chiffrer la fourniture de végétaux dans un devis d’aménagement ?',
      answer:
        'En la séparant du temps de plantation, car le prix des végétaux varie fortement selon la saison et la disponibilité. Les mélanger dans un forfait unique complique toute révision ultérieure.',
    },
    {
      question: 'Comment gérer la saisonnalité de l’activité d’un paysagiste sur l’année ?',
      answer:
        'En sécurisant une part de revenu récurrent via des contrats d’entretien à l’année, qui lissent partiellement les mois plus creux typiques de l’automne et de l’hiver.',
    },
  ],
  relatedSlugs: [
    'previsionnel-tresorerie-entreprise-batiment',
    'facturation-heures-regie-batiment-comment-faire',
    'sous-traitant-batiment-suisse-contrat-facturation',
  ],
};
