import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'licenciement-ouvrier-batiment-delai-conge-cct',
  question: 'Quel délai de congé respecter pour licencier un ouvrier du bâtiment en Suisse ?',
  title: 'Licenciement dans le bâtiment : les délais de congé selon la CCT et le Code des obligations',
  description:
    'Le délai de congé d’un ouvrier du bâtiment dépend de son ancienneté et de la CCT applicable. Se tromper expose l’employeur à devoir indemniser la différence. Voici comment le calculer correctement.',
  excerpt:
    'Un délai de congé mal calculé n’est pas juste une erreur administrative : c’est une créance salariale que l’ouvrier peut réclamer, parfois des mois après son départ.',
  category: 'RH & salaires',
  keywords: ['licenciement bâtiment', 'délai de congé CCT', 'ancienneté employé', 'résiliation contrat travail', 'construction suisse'],
  publishedAt: '2026-08-09',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Le délai de congé applicable à un ouvrier du bâtiment n’est pas fixe : il dépend à la fois de son ancienneté dans l’entreprise et de la convention collective de travail (CCT) applicable, qui peut prévoir des règles plus favorables que le régime supplétif du Code des obligations. Se référer uniquement à l’art. 335c CO sans vérifier la CCT du secteur est l’erreur la plus fréquente.',
    },
    { type: 'h2', text: 'Les délais légaux par défaut (art. 335c CO)' },
    {
      type: 'table',
      headers: ['Ancienneté', 'Délai de congé'],
      rows: [
        ['Pendant le temps d’essai', '7 jours (sauf accord contraire)'],
        ['1re année de service', '1 mois pour la fin d’un mois'],
        ['2e à 9e année de service', '2 mois pour la fin d’un mois'],
        ['Dès la 10e année de service', '3 mois pour la fin d’un mois'],
      ],
    },
    {
      type: 'callout',
      title: 'La CCT du secteur peut imposer des délais différents',
      text: 'La convention collective nationale du secteur principal de la construction (et ses variantes cantonales) prévoit parfois des dispositions spécifiques sur les délais, les périodes de protection ou la forme du congé : elle prime sur le régime légal supplétif quand elle est plus favorable au travailleur.',
    },
    { type: 'h2', text: 'Les périodes où le congé ne peut pas être donné' },
    {
      type: 'list',
      items: [
        'Pendant une incapacité de travail pour cause de maladie ou accident (protection temporaire, durée variable selon l’ancienneté)',
        'Pendant le service militaire suisse ou une obligation légale similaire',
        'Pendant la grossesse et les 16 semaines suivant l’accouchement',
        'Un congé donné pendant une période protégée est nul, il faudra le notifier à nouveau une fois la période terminée',
      ],
    },
    {
      type: 'cta',
      title: 'Une équipe suivie, chantier par chantier',
      text: 'Le module RH de Cantia centralise les dates d’entrée de chaque employé et son historique, ce qui est utile pour vérifier l’ancienneté exacte au moment de calculer un délai de congé.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Quel est le délai de congé légal pour un employé avec 3 ans d’ancienneté ?',
      answer:
        'Deux mois pour la fin d’un mois selon l’art. 335c CO, sauf disposition plus favorable prévue par la CCT applicable au secteur de la construction.',
    },
    {
      question: 'Peut-on licencier un employé en arrêt maladie ?',
      answer:
        'Non, le congé donné pendant une période de protection (maladie, accident, service militaire, maternité) est nul. Il devra être notifié à nouveau une fois la période protégée écoulée.',
    },
    {
      question: 'La CCT peut-elle prévoir un délai plus long que le Code des obligations ?',
      answer:
        'Oui, et dans ce cas elle prime sur le régime légal supplétif : il faut toujours vérifier la CCT applicable avant de se fier uniquement à l’art. 335c CO.',
    },
  ],
  relatedSlugs: [
    'salaire-minimum-cct-construction-suisse',
    'accident-travail-chantier-obligations-employeur-suva',
    'vacances-non-prises-fin-annee-batiment-cct',
  ],
};
