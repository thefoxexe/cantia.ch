import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'heures-supplementaires-batiment-majoration-25',
  question: 'Comment fonctionnent les heures supplémentaires dans le bâtiment en Suisse ?',
  title: 'Heures supplémentaires bâtiment : ce qui a changé avec la CCT 2026',
  description:
    'La nouvelle convention collective de la construction change le calcul des heures supplémentaires : jusqu’à 100h reportables, majoration de 25 % au-delà, et un nouveau seuil hebdomadaire de 50h incluant les trajets.',
  excerpt:
    'La CCT construction 2026 change une règle que presque personne n’a encore intégrée : les heures de trajet comptent désormais dans le calcul des heures supplémentaires.',
  category: 'RH & salaires',
  keywords: ['heures supplémentaires', 'majoration 25%', 'cct construction', 'temps de trajet', 'compensation heures'],
  publishedAt: '2026-03-26',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'La nouvelle Convention nationale du secteur principal de la construction, en vigueur pour la période 2026-2031, change une règle qui touche directement la fiche de paie de chaque ouvrier : le calcul des heures supplémentaires intègre désormais explicitement le temps de trajet, pas seulement le temps de travail effectif sur le chantier.',
    },
    { type: 'h2', text: 'La nouvelle règle : 50 heures, trajets compris' },
    {
      type: 'p',
      text: 'Toutes les heures de travail et de déplacement qui, cumulées, dépassent 50 heures sur une semaine sont désormais considérées comme du travail supplémentaire — rémunérées le mois suivant au salaire de base majoré de 25 %. Un chantier éloigné qui ajoute une heure de trajet chaque jour peut faire basculer une semaine « normale » de 45h de travail effectif dans le régime des heures supplémentaires, simplement à cause du trajet.',
    },
    {
      type: 'callout',
      title: 'Le report de solde, plafonné à 100 heures',
      text: 'Les heures qui ne dépassent pas ce plafond de 50h/semaine peuvent être reportées d’une année sur l’autre, jusqu’à un maximum de 100 heures. Au-delà de ce cumul, les heures excédentaires doivent être payées avec la majoration de 25 % — impossible de les laisser s’accumuler indéfiniment dans un compteur.',
    },
    { type: 'h2', text: 'Ce que ça implique pour la gestion RH au quotidien' },
    {
      type: 'list',
      items: [
        'Le temps de trajet vers un chantier éloigné doit être suivi séparément du temps de travail, pour pouvoir les additionner correctement',
        'Un compteur d’heures supplémentaires qui dépasse 100h reportées doit déclencher un paiement, pas juste une note pour plus tard',
        'La majoration de 25 % s’applique sur le salaire de base — un détail de calcul qui se rate facilement sur une fiche construite à la main',
      ],
    },
    { type: 'h2', text: 'Distinguer heures supplémentaires et heures complémentaires' },
    {
      type: 'p',
      text: 'Les « heures supplémentaires » au sens de la CCT (au-delà de la durée normale et du seuil de 50h) ne se confondent pas avec les « heures complémentaires » d’un travailleur à temps partiel qui reste sous la durée normale à temps plein — les deux régimes de compensation ne sont pas identiques, et confondre les deux est une source classique d’erreur de paie.',
    },
    {
      type: 'cta',
      title: 'Le calcul des heures, sans jongler entre deux tableurs',
      text: 'Le module RH & Salaires de Cantia suit les heures par chantier et par employé au fil de l’eau — la base la plus fiable pour repérer un dépassement avant qu’il ne s’accumule sur des mois.',
      buttonLabel: 'Découvrir RH & Salaires',
    },
  ],
  faq: [
    {
      question: 'Le temps de trajet compte-t-il dans le calcul des heures supplémentaires ?',
      answer:
        'Oui, depuis la CCT construction 2026-2031 : toutes les heures de travail et de déplacement qui dépassent cumulativement 50h par semaine sont considérées comme du travail supplémentaire.',
    },
    {
      question: 'Combien d’heures supplémentaires peut-on reporter sur l’année suivante ?',
      answer:
        'Jusqu’à 100 heures. Au-delà de ce plafond, les heures excédentaires doivent être payées le mois suivant avec une majoration de 25 % sur le salaire de base.',
    },
    {
      question: 'Heures supplémentaires et heures complémentaires sont-elles la même chose ?',
      answer:
        'Non — les heures complémentaires concernent un travailleur à temps partiel restant sous la durée normale à temps plein, avec un régime de compensation distinct de celui des heures supplémentaires proprement dites.',
    },
  ],
  relatedSlugs: [
    'salaire-minimum-cct-construction-suisse',
    'calculer-heures-travail-ouvrier-minutes-decimales',
    'indemnites-kilometriques-2026-nouveau-taux',
  ],
};
