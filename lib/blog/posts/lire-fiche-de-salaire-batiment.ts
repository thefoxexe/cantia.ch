import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'lire-fiche-de-salaire-batiment',
  question: 'Comment lire et expliquer une fiche de salaire dans le bâtiment ?',
  title: 'Comment expliquer une fiche de salaire à un employé du bâtiment',
  description:
    'Structure d’une fiche de salaire suisse (brut, déductions AVS/AI/APG, AC, LPP, LAANP, net) et comment l’expliquer simplement à un employé du bâtiment.',
  excerpt:
    'L’écart entre le salaire brut annoncé à l’embauche et le montant qui arrive sur le compte est la question RH la plus fréquente — et la plus mal expliquée.',
  category: 'RH & salaires',
  keywords: ['fiche de salaire', 'salaire brut', 'salaire net', 'déductions', 'AVS', 'LPP'],
  publishedAt: '2026-09-27',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Peu de sujets génèrent autant de questions, et parfois de méfiance, qu’une fiche de salaire mal expliquée. Pour un employeur, savoir la décomposer simplement évite bien des malentendus.',
    },
    { type: 'h2', text: '1. La structure d’une fiche de salaire suisse' },
    {
      type: 'table',
      headers: ['Ligne', 'Ce que c’est'],
      rows: [
        ['Salaire brut', 'Le montant convenu au contrat, avant toute déduction'],
        ['AVS/AI/APG', 'Cotisation pour l’assurance vieillesse, invalidité et allocations pour perte de gain'],
        ['AC', 'Assurance-chômage'],
        ['LPP', 'Cotisation à la caisse de pension (prévoyance professionnelle)'],
        ['LAANP', 'Assurance accidents non professionnels, si à charge de l’employé'],
        ['Salaire net', 'Le montant effectivement versé, après toutes les déductions'],
      ],
    },
    { type: 'h2', text: '2. Pourquoi l’écart brut/net surprend souvent' },
    {
      type: 'p',
      text: 'Un employé qui négocie ou accepte un salaire « brut » sans avoir clairement en tête le montant net qui en résulte est souvent surpris à réception de sa première fiche de salaire. L’écart peut représenter une part significative du salaire brut, ce qui explique pourquoi il est utile, dès l’embauche, de donner une estimation du salaire net attendu plutôt que de s’en tenir au seul chiffre brut annoncé.',
    },
    { type: 'h2', text: '3. Comment l’expliquer simplement en tant qu’employeur' },
    {
      type: 'p',
      text: 'La méthode la plus efficace consiste à reprendre la fiche de salaire ligne par ligne avec l’employé, en expliquant à quoi correspond chaque déduction plutôt que de simplement renvoyer vers un document technique. Rappeler que ces cotisations financent des prestations concrètes (retraite, rente en cas d’invalidité, couverture accident) aide souvent à rendre la déduction moins abstraite qu’une simple ligne négative sur le décompte.',
    },
    {
      type: 'callout',
      title: 'Un réflexe utile à l’embauche',
      text: 'Donner, dès l’entretien d’embauche, une estimation du salaire net en plus du salaire brut négocié évite presque toujours la déception de la première fiche de salaire. Ce n’est pas une obligation, mais c’est souvent ce qui distingue un onboarding qui inspire confiance d’un premier mois qui commence par un malentendu.',
    },
    {
      type: 'cta',
      title: 'Des fiches de salaire claires, générées automatiquement',
      text: 'Cantia centralise les données de vos employés pour générer des décomptes de salaire clairs, prêts à être expliqués sans avoir à ressortir une calculatrice à chaque question.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Pourquoi le salaire net est-il tellement inférieur au salaire brut ?',
      answer:
        'Parce que plusieurs cotisations sociales obligatoires sont déduites du brut avant versement : AVS/AI/APG, assurance-chômage, prévoyance professionnelle (LPP), et parfois l’assurance accidents non professionnels. Ces déductions financent des prestations sociales concrètes.',
    },
    {
      question: 'Toutes les déductions sont-elles identiques d’un employé à l’autre ?',
      answer:
        'Non, certaines déductions dépendent du salaire, de l’âge (notamment pour la LPP) ou du statut de l’employé. C’est pourquoi deux fiches de salaire avec un même montant brut peuvent afficher un net légèrement différent.',
    },
    {
      question: 'Faut-il expliquer la fiche de salaire à chaque nouvel employé ?',
      answer:
        'C’est fortement recommandé, en particulier lors du premier mois. Une explication simple, ligne par ligne, évite la plupart des questions et malentendus récurrents sur l’écart entre salaire brut et salaire net.',
    },
  ],
  relatedSlugs: [
    'calculer-13e-salaire-prorata-employe',
    'salaire-minimum-cct-construction-suisse',
    'apprenti-batiment-salaire-obligations-employeur',
  ],
};
