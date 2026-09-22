import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'vacances-construction-suisse-dates-canton',
  question: 'Quelles sont les dates des vacances de la construction en Suisse et quel impact sur la facturation ?',
  title: 'Vacances de la construction en Suisse : dates par canton et impact sur la facturation',
  description:
    'Vacances de la construction en Suisse romande : pourquoi elles existent, comment les dates varient par canton et CCT, et comment anticiper leur impact sur la trésorerie.',
  excerpt:
    'Chaque été, le secteur de la construction ferme ses chantiers pendant plusieurs semaines dans plusieurs cantons romands. Voici pourquoi, et comment anticiper l’impact sur votre facturation.',
  category: 'RH & salaires',
  keywords: [
    'vacances construction suisse',
    'fermeture chantier été suisse',
    'CCT bâtiment vacances',
    'commission paritaire construction',
  ],
  publishedAt: '2026-10-04',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Dans plusieurs cantons romands, le secteur de la construction observe une fermeture annuelle estivale, communément appelée « vacances de la construction ». Ce n’est pas une simple habitude collective : elle découle des conventions collectives de travail (CCT) et des commissions paritaires cantonales qui encadrent le secteur, et les dates exactes varient chaque année et selon le canton concerné.',
    },
    { type: 'h2', text: 'Pourquoi cette fermeture existe' },
    {
      type: 'p',
      text: 'Le mécanisme vise à garantir une période de repos commune à l’ensemble des ouvriers du secteur, négociée entre partenaires sociaux au niveau cantonal via les commissions paritaires. Comme la date et la durée exactes dépendent de la CCT applicable et peuvent changer d’une année à l’autre, il est indispensable de vérifier chaque année les dates précises auprès de la commission paritaire cantonale compétente, plutôt que de se fier à un calendrier fixe supposé se répéter.',
    },
    { type: 'h2', text: 'L’impact concret sur le planning de chantier' },
    {
      type: 'list',
      items: [
        'Les chantiers en cours doivent être planifiés en tenant compte de cette fermeture, souvent plusieurs mois à l’avance',
        'Les livraisons de matériaux et les interventions de sous-traitants doivent être coordonnées avant ou après la période, pas pendant',
        'Un chantier mal anticipé peut se retrouver interrompu au pire moment, avec un impact direct sur les délais annoncés au client',
      ],
    },
    { type: 'h2', text: 'L’impact sur la trésorerie et la facturation' },
    {
      type: 'p',
      text: 'La fermeture estivale crée souvent un creux de facturation, puisque les chantiers s’arrêtent et que les situations de fin de mois ne peuvent pas toujours être établies normalement. Une entreprise qui anticipe ce creux peut facturer les jalons ou acomptes prévus juste avant la fermeture, pour éviter un trou de trésorerie en plein été. À l’inverse, une entreprise qui n’y pense qu’au moment de la fermeture se retrouve à attendre la reprise pour encaisser.',
    },
    {
      type: 'callout',
      title: 'Ne jamais se fier à un calendrier de l’année précédente',
      text: 'Les dates des vacances de la construction changent d’une année à l’autre et selon le canton. La seule source fiable reste la commission paritaire cantonale compétente pour votre secteur d’activité : vérifiez-y les dates exactes chaque année avant de planifier vos chantiers d’été.',
    },
    {
      type: 'cta',
      title: 'Anticipez le creux d’été dans votre trésorerie',
      text: 'Cantia permet de planifier vos jalons de facturation en amont d’une fermeture de chantier, pour garder une trésorerie stable même pendant les vacances de la construction.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Les vacances de la construction sont-elles identiques dans tous les cantons romands ?',
      answer:
        'Non, les dates et l’existence même de cette fermeture dépendent de la convention collective de travail et de la commission paritaire applicables dans chaque canton. Il faut vérifier la situation propre à son canton chaque année.',
    },
    {
      question: 'Comment éviter un trou de trésorerie pendant la fermeture estivale ?',
      answer:
        'En planifiant les factures d’acompte ou de situation de chantier juste avant la fermeture, plutôt que d’attendre la reprise, et en anticipant ce creux dans son prévisionnel de trésorerie annuel.',
    },
    {
      question: 'Où trouver les dates exactes des vacances de la construction pour mon canton ?',
      answer:
        'Auprès de la commission paritaire cantonale compétente pour votre secteur d’activité, qui publie les dates applicables chaque année selon la CCT en vigueur.',
    },
  ],
  relatedSlugs: [
    'previsionnel-tresorerie-entreprise-batiment',
    'checklist-fin-annee-entreprise-batiment',
    'calculer-13e-salaire-prorata-employe',
  ],
};
