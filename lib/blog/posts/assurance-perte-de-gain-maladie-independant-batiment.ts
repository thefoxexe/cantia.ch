import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'assurance-perte-de-gain-maladie-independant-batiment',
  question: 'Un indépendant du bâtiment est-il couvert en cas d’arrêt maladie ?',
  title: 'Arrêt maladie quand on est indépendant : ce qui n’est PAS couvert',
  description:
    'La LAMal paie les soins, jamais le revenu perdu. Sans assurance perte de gain maladie souscrite volontairement, un indépendant en arrêt de travail n’a droit à aucun revenu de remplacement.',
  excerpt:
    'Un indépendant cloué au lit trois semaines ne touche rien — sauf s’il a lui-même souscrit une assurance que rien ne l’oblige à avoir. La LAMal ne couvre que les soins, jamais le salaire perdu.',
  category: 'Juridique & normes',
  keywords: ['perte de gain maladie', 'indépendant', 'lamal', 'indemnités journalières', 'assurance maladie'],
  publishedAt: '2026-05-04',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un salarié en arrêt maladie continue en général de toucher son salaire pendant un certain temps, via son employeur ou une assurance collective. Un indépendant du bâtiment, lui, ne touche rien du tout par défaut — trois semaines d’arrêt maladie sans assurance spécifique signifient trois semaines sans le moindre revenu de remplacement.',
    },
    { type: 'h2', text: 'La confusion la plus fréquente : LAMal ne veut pas dire revenu garanti' },
    {
      type: 'p',
      text: 'La LAMal (assurance-maladie de base, obligatoire pour tout résident suisse) couvre les soins médicaux — consultations, hospitalisation, médicaments. Elle ne remplace jamais un revenu perdu. Les indemnités journalières en cas de maladie relèvent d’un régime totalement distinct et facultatif.',
    },
    {
      type: 'callout',
      title: 'Deux façons de se couvrir, aucune obligatoire',
      text: 'Une assurance d’indemnités journalières maladie (IJM) peut être souscrite soit comme assurance privée régie par la LCA (loi sur le contrat d’assurance), soit comme assurance facultative d’indemnités journalières relevant elle-même de la LAMal. Dans les deux cas, la démarche est volontaire — rien ne l’impose légalement à un indépendant.',
    },
    { type: 'h2', text: 'Ce que ça veut dire en pratique' },
    {
      type: 'list',
      items: [
        'Sans IJM, un arrêt maladie de plusieurs semaines peut mettre en péril la trésorerie personnelle et professionnelle d’un indépendant sans autre revenu',
        'Le délai de carence (période avant que les indemnités ne commencent à courir) varie selon le contrat souscrit — un point à vérifier avant de considérer une couverture comme suffisante',
        'Plus l’activité dépend physiquement de la présence de l’indépendant sur le chantier (contrairement à un rôle de gestion à distance), plus l’absence de couverture pèse lourd en cas d’incapacité',
      ],
    },
    { type: 'h2', text: 'Une pièce d’un puzzle plus large' },
    {
      type: 'p',
      text: 'L’assurance perte de gain maladie s’ajoute à une liste de décisions de prévoyance qu’un indépendant doit prendre lui-même, faute d’obligation légale : AVS/AI obligatoire, LPP facultative, LAA généralement facultative sans employé, et maintenant l’IJM. Aucune de ces briques ne se met en place automatiquement — chacune demande une démarche volontaire, souvent négligée dans les premières années d’activité, quand la priorité va au chiffre d’affaires plutôt qu’à la prévoyance.',
    },
    {
      type: 'cta',
      title: 'Une rentabilité claire, même pour anticiper ces décisions',
      text: 'Voir précisément ce que rapporte chaque chantier aide aussi à budgétiser sereinement une prévoyance volontaire — le module Rentabilité de Cantia donne cette visibilité en continu.',
      buttonLabel: 'Découvrir la rentabilité par chantier',
    },
  ],
  faq: [
    {
      question: 'La LAMal couvre-t-elle la perte de revenu en cas de maladie pour un indépendant ?',
      answer:
        'Non — la LAMal ne couvre que les soins médicaux. Une perte de revenu n’est couverte que par une assurance d’indemnités journalières maladie souscrite volontairement.',
    },
    {
      question: 'Un indépendant est-il obligé de souscrire une assurance perte de gain maladie ?',
      answer:
        'Non, cette assurance reste entièrement facultative en Suisse, que ce soit sous forme d’assurance privée (LCA) ou d’assurance facultative rattachée à la LAMal.',
    },
    {
      question: 'Que se passe-t-il pour un indépendant sans couverture en cas d’arrêt maladie prolongé ?',
      answer:
        'Il ne perçoit aucun revenu de remplacement pendant son incapacité, ce qui peut rapidement peser sur sa trésorerie personnelle et professionnelle.',
    },
  ],
  relatedSlugs: [
    'avs-ai-independant-batiment',
    'lpp-deuxieme-pilier-independant-batiment',
    'assurance-rc-professionnelle-batiment-obligatoire',
  ],
};
