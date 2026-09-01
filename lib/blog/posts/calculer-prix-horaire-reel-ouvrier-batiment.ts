import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'calculer-prix-horaire-reel-ouvrier-batiment',
  question: 'Comment calculer le vrai coût horaire d’un ouvrier, au-delà de son salaire brut ?',
  title: 'Le vrai coût horaire d’un ouvrier du bâtiment : bien plus que son salaire brut',
  description:
    'Un devis chiffré sur le seul salaire brut d’un ouvrier sous-estime systématiquement le vrai coût horaire : il faut aussi compter les charges sociales, les absences payées et le temps non facturable.',
  excerpt:
    'Beaucoup d’entreprises chiffrent leurs devis sur un taux horaire approximatif hérité d’années de pratique, sans jamais prendre le temps de recalculer ce qu’un ouvrier coûte vraiment une fois toutes les charges intégrées.',
  category: 'Chantier & rentabilité',
  keywords: ['coût horaire ouvrier', 'calcul taux horaire bâtiment', 'charges sociales construction', 'rentabilité chantier', 'chiffrage devis'],
  publishedAt: '2026-07-28',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Un devis chiffré sur le salaire brut d’un ouvrier, sans plus, sous-estime presque toujours le vrai coût horaire de l’entreprise. Entre les charges sociales patronales, les absences payées et le temps de travail réellement facturable dans une année, l’écart entre le salaire affiché et le coût réel supporté par l’entreprise dépasse souvent 40 %.',
    },
    { type: 'h2', text: 'Les composantes du vrai coût horaire' },
    {
      type: 'list',
      items: [
        'Salaire brut annuel, y compris 13e salaire',
        'Charges sociales patronales (AVS/AI/APG, LPP, LAA, allocations familiales), soit généralement 15 à 20 % du salaire brut',
        'Vacances et jours fériés payés, qui réduisent le nombre d’heures effectivement travaillées mais pas la masse salariale annuelle',
        'Temps non facturable : déplacements internes, entretien du matériel, formation, intempéries payées',
      ],
    },
    {
      type: 'stat',
      value: '~1750 h',
      label: 'heures effectivement facturables par an et par ouvrier en moyenne, une fois vacances, absences et temps non productif déduits d’un plein temps théorique',
    },
    { type: 'h2', text: 'La formule de base' },
    {
      type: 'p',
      text: 'Coût horaire réel = (salaire brut annuel + charges sociales patronales) ÷ heures effectivement facturables dans l’année. Le piège classique est de diviser le coût annuel par le nombre d’heures contractuelles théoriques (par exemple 2080 heures pour un plein temps), sans déduire les absences et le temps non productif ; cette erreur sous-estime systématiquement le taux horaire réel.',
    },
    {
      type: 'callout',
      title: 'Un taux horaire sous-évalué grignote la marge sur chaque chantier, sans jamais s’en apercevoir chantier par chantier',
      text: 'C’est souvent seulement en comparant le devisé au coût réellement engagé, chantier par chantier, qu’une entreprise réalise que son taux horaire de référence était trop bas depuis des années.',
    },
    {
      type: 'cta',
      title: 'Comparer devisé et coût réel, chantier par chantier',
      text: 'Le module Rentabilité de Cantia confronte automatiquement ce qui a été devisé aux heures et coûts réellement engagés sur chaque chantier. C’est la meilleure façon de savoir si votre taux horaire est réaliste.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Faut-il inclure les charges sociales dans le calcul du coût horaire ?',
      answer:
        'Oui, elles représentent généralement 15 à 20 % du salaire brut et doivent impérativement être intégrées, sous peine de sous-estimer fortement le coût horaire réel.',
    },
    {
      question: 'Combien d’heures un ouvrier travaille-t-il réellement par an, hors absences ?',
      answer:
        'Autour de 1750 heures facturables en moyenne, une fois vacances, jours fériés et temps non productif déduits d’un plein temps théorique de 2080 heures environ.',
    },
    {
      question: 'Pourquoi le taux horaire de référence d’une entreprise est-il souvent trop bas ?',
      answer:
        'Parce qu’il est hérité d’une pratique ancienne jamais recalculée, plutôt que d’un calcul explicite intégrant charges sociales et heures réellement facturables.',
    },
  ],
  relatedSlugs: [
    'chantier-complet-peut-etre-en-perte-taux-horaire',
    'suivre-rentabilite-chantier-sans-excel',
    'calculer-prix-devis-renovation-suisse',
  ],
};
