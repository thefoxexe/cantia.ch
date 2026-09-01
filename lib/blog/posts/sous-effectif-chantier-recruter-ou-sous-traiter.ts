import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'sous-effectif-chantier-recruter-ou-sous-traiter',
  question: 'Manque de main-d’œuvre sur les chantiers : vaut-il mieux recruter ou sous-traiter ?',
  title: 'Sous-effectif sur les chantiers : recruter ou sous-traiter, comment trancher',
  description:
    'Refuser des chantiers faute de personnel est un mauvais calcul, mais recruter trop vite en est un autre. Voici les critères concrets pour choisir entre embauche et sous-traitance.',
  excerpt:
    'Un carnet de commandes plein et une équipe trop courte : la tentation est de recruter dans l’urgence. C’est souvent la décision la plus coûteuse à long terme, comparée à une sous-traitance bien choisie.',
  category: 'RH & salaires',
  keywords: ['manque main d’oeuvre bâtiment', 'recruter ou sous-traiter', 'gestion effectif construction', 'sous-traitance chantier', 'décision RH artisan'],
  publishedAt: '2026-08-05',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un carnet de commandes qui déborde et une équipe trop courte pour l’absorber : c’est une bonne nouvelle qui devient vite un problème si la décision de renforcer l’effectif se prend dans l’urgence. Recruter et sous-traiter ne répondent pas au même besoin, et confondre les deux mène souvent soit à un effectif surdimensionné une fois le pic passé, soit à une dépendance mal maîtrisée envers des sous-traitants.',
    },
    { type: 'h2', text: 'Quand recruter a du sens' },
    {
      type: 'list',
      items: [
        'La surcharge est structurelle, pas ponctuelle, car elle se répète chantier après chantier depuis plusieurs mois',
        'Le savoir-faire recherché est central au métier de l’entreprise, pas une compétence périphérique',
        'L’entreprise a la trésorerie pour absorber un salaire fixe même dans un mois plus calme',
      ],
    },
    { type: 'h2', text: 'Quand sous-traiter est plus pertinent' },
    {
      type: 'list',
      items: [
        'Le besoin est ponctuel ou saisonnier, lié à un ou deux chantiers spécifiques',
        'La compétence nécessaire est spécialisée et rarement utilisée (une prestation technique précise, un corps de métier complémentaire)',
        'L’entreprise veut tester un volume d’activité plus élevé avant de s’engager sur un recrutement durable',
      ],
    },
    {
      type: 'callout',
      title: 'Le vrai coût d’un recrutement précipité se voit après le pic d’activité, pas pendant',
      text: 'Un salaire fixe engagé pour absorber une surcharge ponctuelle continue de peser sur la trésorerie une fois le pic retombé. C’est souvent là, plusieurs mois plus tard, que la décision se révèle avoir été la mauvaise.',
    },
    {
      type: 'cta',
      title: 'Un répertoire de sous-traitants toujours à jour',
      text: 'Le module Sous-traitants de Cantia centralise vos partenaires par métier et par chantier. De quoi décider vite entre renfort ponctuel et recrutement, sans repartir de zéro à chaque pic d’activité.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Comment savoir s’il faut recruter plutôt que sous-traiter ?',
      answer:
        'Si la surcharge se répète chantier après chantier depuis plusieurs mois et concerne une compétence centrale au métier de l’entreprise, un recrutement se justifie mieux qu’un renfort ponctuel.',
    },
    {
      question: 'Quel est le principal risque d’un recrutement précipité ?',
      answer:
        'Un salaire fixe continue de peser sur la trésorerie une fois le pic d’activité retombé, ce qui fait que le coût réel d’une mauvaise décision se voit souvent plusieurs mois après, pas immédiatement.',
    },
    {
      question: 'La sous-traitance est-elle adaptée à un besoin ponctuel ?',
      answer:
        'Oui, elle convient bien à un pic d’activité limité dans le temps ou à une compétence spécialisée rarement mobilisée, sans engager l’entreprise sur le long terme.',
    },
  ],
  relatedSlugs: [
    'sous-traitant-batiment-suisse-contrat-facturation',
    'apprenti-batiment-salaire-obligations-employeur',
    'pourquoi-entreprises-batiment-font-faillite-suisse',
  ],
};
