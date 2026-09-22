import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'vacances-employe-batiment-cct-jours',
  question: 'Combien de jours de vacances un employé du bâtiment a-t-il droit selon la CCT ?',
  title: 'Combien de jours de vacances un employé du bâtiment a-t-il droit',
  description:
    'Minimum légal de vacances selon le Code des obligations, ce que prévoit en plus la CCT du secteur principal de la construction, et le calcul au prorata pour une année incomplète.',
  excerpt:
    'Le minimum légal de vacances n’est presque jamais ce qui s’applique réellement dans le bâtiment : la CCT du secteur prévoit souvent davantage.',
  category: 'RH & salaires',
  keywords: ['vacances', 'CCT', 'bâtiment', 'jours', 'congés', 'prorata'],
  publishedAt: '2026-09-27',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Le nombre de jours de vacances d’un employé du bâtiment est une question qui revient souvent, et la réponse ne se limite pas au minimum légal : la convention collective du secteur joue un rôle central.',
    },
    { type: 'h2', text: '1. Le minimum légal selon le Code des obligations' },
    {
      type: 'p',
      text: 'Le Code des obligations fixe un minimum de quatre semaines de vacances par année pour les travailleurs adultes, et davantage pour les jeunes travailleurs jusqu’à un certain âge. Ce minimum s’applique en l’absence de disposition contractuelle ou conventionnelle plus favorable.',
    },
    { type: 'h2', text: '2. Ce que prévoit la CCT du secteur principal de la construction' },
    {
      type: 'p',
      text: 'La CCT du secteur principal de la construction prévoit généralement un nombre de jours de vacances plus favorable que le minimum légal, souvent avec des paliers selon l’âge du travailleur ou son ancienneté dans l’entreprise. Ces paliers exacts peuvent évoluer et varier selon les dispositions en vigueur : il est recommandé de vérifier le texte à jour de la CCT applicable à votre entreprise, ou de vous renseigner auprès de votre commission paritaire, plutôt que de se fier à un chiffre fixe.',
    },
    { type: 'h2', text: '3. Le calcul au prorata pour une année incomplète' },
    {
      type: 'p',
      text: 'Lorsqu’un employé n’a pas travaillé une année complète (embauche ou départ en cours d’année), le droit aux vacances se calcule au prorata du temps de présence effectif. Concrètement, le nombre de jours annuels auquel l’employé aurait droit sur une année complète est divisé par douze, puis multiplié par le nombre de mois réellement travaillés. Certaines absences prolongées (maladie longue durée, par exemple) peuvent également réduire ce droit selon les règles applicables.',
    },
    {
      type: 'callout',
      title: 'Un point souvent mal calculé : le départ en cours d’année',
      text: 'Le calcul au prorata des vacances lors d’un départ en cours d’année est une source fréquente d’erreur, en particulier lorsque des jours de vacances ont déjà été pris en trop par rapport au droit acquis à la date du départ. Il est alors possible de récupérer un trop-perçu sur le solde de tout compte, à condition que cela soit correctement documenté.',
    },
    {
      type: 'cta',
      title: 'Le solde de vacances de chaque employé, à jour en permanence',
      text: 'Cantia suit automatiquement les jours de vacances pris et restants pour chaque employé, pour que le calcul au prorata ne soit plus jamais fait à la main au moment d’un départ.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Quel est le minimum légal de vacances dans le bâtiment en Suisse ?',
      answer:
        'Le Code des obligations fixe un minimum de quatre semaines par an pour les travailleurs adultes. Dans la plupart des cas, la CCT du secteur principal de la construction prévoit un nombre de jours plus favorable, à vérifier dans le texte applicable à votre entreprise.',
    },
    {
      question: 'La CCT prévoit-elle plus de vacances selon l’âge ou l’ancienneté ?',
      answer:
        'C’est généralement le cas, avec des paliers qui peuvent varier selon les dispositions en vigueur. Il est recommandé de vérifier le texte à jour de la CCT applicable plutôt que de se baser sur un chiffre fixe qui pourrait avoir évolué.',
    },
    {
      question: 'Comment calculer les vacances d’un employé qui part en cours d’année ?',
      answer:
        'Le droit aux vacances se calcule au prorata du nombre de mois réellement travaillés dans l’année. Il faut ensuite comparer ce droit acquis aux jours déjà pris pour déterminer un solde à verser ou, le cas échéant, un trop-perçu à régulariser.',
    },
  ],
  relatedSlugs: [
    'calculer-13e-salaire-prorata-employe',
    'vacances-non-prises-fin-annee-batiment-cct',
    'salaire-minimum-cct-construction-suisse',
  ],
};
