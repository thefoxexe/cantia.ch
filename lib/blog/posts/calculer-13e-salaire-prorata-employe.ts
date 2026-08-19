import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'calculer-13e-salaire-prorata-employe',
  question: 'Comment calculer le 13e salaire au prorata pour un employé arrivé en cours d’année ?',
  title: 'Calculer le 13e salaire au prorata en cours d’année',
  description:
    'Un employé engagé en avril n’a pas droit à un 13e salaire complet en décembre — le calcul au prorata se fait sur les mois réellement travaillés, primes et absences comprises.',
  excerpt:
    'Un ouvrier engagé le 1er avril ne touche pas un 13e salaire plein en décembre — encore faut-il savoir exactement sur quels mois il se calcule, et ce qui les réduit.',
  category: 'RH & salaires',
  keywords: ['13e salaire', 'prorata', 'calcul salaire', 'embauche en cours d’année', 'départ employé'],
  publishedAt: '2026-04-02',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un ouvrier engagé le 1er avril, licencié ou parti le 30 septembre : combien lui est dû au titre du 13e salaire ? La réponse tient en une formule simple, mais les erreurs les plus fréquentes viennent de ce qu’on met — ou pas — dans le calcul.',
    },
    { type: 'h2', text: 'La formule de base' },
    {
      type: 'p',
      text: 'Le 13e salaire au prorata se calcule ainsi : (nombre de mois travaillés dans l’année ÷ 12) × montant du 13e salaire plein. Un employé qui a travaillé 6 mois complets sur une année a droit à la moitié d’un 13e salaire, pas à un mois de salaire arbitraire calculé autrement.',
    },
    {
      type: 'table',
      headers: ['Situation', 'Mois travaillés', 'Fraction du 13e salaire'],
      rows: [
        ['Employé toute l’année', '12', '12/12 = 100 %'],
        ['Arrivée le 1er avril', '9', '9/12 = 75 %'],
        ['Départ le 30 septembre', '9', '9/12 = 75 %'],
        ['Contrat de 3 mois (intérim/saisonnier)', '3', '3/12 = 25 %'],
      ],
    },
    {
      type: 'callout',
      title: 'Le détail qui fausse le calcul : les mois incomplets',
      text: 'Un employé engagé le 15 du mois n’a en principe pas droit à un mois complet dans le calcul — la plupart des contrats et usages retiennent une règle proportionnelle au nombre de jours travaillés dans ce mois-là, plutôt que d’arrondir systématiquement au mois entier. Le contrat de travail ou la CCT applicable précise généralement la méthode exacte à suivre.',
    },
    { type: 'h2', text: 'Ce qui peut réduire le 13e salaire' },
    {
      type: 'list',
      items: [
        'Une absence prolongée non rémunérée (congé sans solde, par exemple) réduit généralement le prorata sur la période concernée',
        'Un arrêt maladie ou accident long peut avoir un traitement différent selon le contrat et les assurances perte de gain applicables',
        'Un changement de taux d’activité en cours d’année (passage à temps partiel) doit être reflété proportionnellement sur la période concernée',
      ],
    },
    { type: 'h2', text: 'Le vrai risque : l’oublier au moment du départ' },
    {
      type: 'p',
      text: 'Le 13e salaire au prorata dû lors d’un départ en cours d’année est régulièrement oublié dans le décompte final, surtout quand le départ est géré dans l’urgence. C’est une créance de l’employé, pas un geste facultatif — l’omettre expose à une réclamation, souvent bien après le départ effectif.',
    },
    {
      type: 'cta',
      title: 'Les salaires de l’équipe, calculés proprement',
      text: 'Le module RH & Salaires de Cantia calcule le salaire net à partir des heures et des taux configurés par employé — une base plus fiable qu’un calcul refait à la main à chaque départ.',
      buttonLabel: 'Découvrir RH & Salaires',
    },
  ],
  faq: [
    {
      question: 'Comment calculer un 13e salaire pour un employé arrivé en cours d’année ?',
      answer:
        'En multipliant le montant du 13e salaire plein par le nombre de mois réellement travaillés divisé par 12 — un employé présent 9 mois sur 12 a droit à 75 % d’un 13e salaire complet.',
    },
    {
      question: 'Un employé parti en cours d’année a-t-il droit à un 13e salaire au prorata ?',
      answer:
        'Oui, c’est une créance qui lui est due au moment de son départ, calculée sur les mois effectivement travaillés — elle doit figurer dans le décompte final de salaire.',
    },
    {
      question: 'Une absence maladie réduit-elle le 13e salaire au prorata ?',
      answer:
        'Cela dépend du contrat de travail et de la convention collective applicable — une absence prolongée non rémunérée réduit généralement le prorata, mais le traitement exact varie selon les cas.',
    },
  ],
  relatedSlugs: [
    'salaire-minimum-cct-construction-suisse',
    'heures-supplementaires-batiment-majoration-25',
    'avs-ai-independant-batiment',
  ],
};
