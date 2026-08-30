import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'logiciel-construit-avec-vous-sur-mesure',
  question: 'Qu\'est-ce que ça change d\'avoir un logiciel construit avec vous plutôt que pour tout le monde ?',
  title: 'Un logiciel construit avec vous, pas juste vendu à tout le monde',
  description:
    'La différence entre un éditeur qui vend un produit figé et un éditeur qui construit avec ses clients — ce que ça change concrètement pour une entreprise du bâtiment.',
  excerpt:
    'La plupart des logiciels sont pensés une fois, pour un client moyen imaginaire, puis vendus tels quels à tout le monde — un logiciel construit avec ses clients suit une autre logique, plus proche du terrain.',
  category: 'Sur-mesure & automatisations',
  keywords: ['logiciel construit avec vous', 'éditeur qui écoute ses clients', 'logiciel gestion collaboratif bâtiment', 'produit qui évolue avec les retours clients', 'Cantia développement avec clients'],
  publishedAt: '2026-08-28',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'La plupart des logiciels de gestion sont conçus une fois, pour un profil de client "moyen" imaginé au départ, puis vendus tels quels à toute une industrie. Une autre approche existe : construire l\'outil directement avec les entreprises qui l\'utilisent, fonctionnalité après fonctionnalité, retour après retour.',
    },
    { type: 'h2', text: 'Ce que ça change concrètement' },
    {
      type: 'list',
      items: [
        'Les nouvelles fonctionnalités naissent souvent d\'un besoin réel signalé par un client, pas d\'une idée abstraite en interne',
        'Un problème rencontré sur le terrain peut être remonté directement, sans passer par un service client anonyme',
        'L\'outil évolue au rythme des vrais besoins du bâtiment suisse, pas d\'une feuille de route figée à l\'avance',
        'Une fonctionnalité utile à une entreprise en particulier profite ensuite souvent à toutes les autres',
      ],
    },
    {
      type: 'stat',
      value: '20+',
      label: 'entreprises du bâtiment suisses accompagnent déjà l\'évolution de Cantia, avec des retours qui façonnent directement les prochaines fonctionnalités',
    },
    { type: 'h2', text: 'Ce que ça ne veut pas dire' },
    {
      type: 'p',
      text: 'Construire avec ses clients ne signifie pas développer une version totalement différente pour chacun — le socle standard reste commun à tous, ce qui change, c\'est la capacité à l\'ajuster réellement plutôt que d\'imposer un produit figé sans jamais l\'adapter.',
    },
    {
      type: 'callout',
      title: 'Un retour, même petit, peut vraiment changer quelque chose',
      text: 'Une remarque sur un détail qui coince au quotidien a souvent plus d\'impact sur l\'évolution de l\'outil qu\'on ne l\'imagine — ce genre de retour est directement à l\'origine de plusieurs fonctionnalités déjà existantes dans Cantia.',
    },
    {
      type: 'cta',
      title: 'Votre avis façonne directement l\'outil',
      text: 'Chez Cantia, chaque retour compte réellement dans l\'évolution du produit — essayez-le gratuitement et dites-nous ce qui pourrait mieux coller à votre façon de travailler.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Qu\'est-ce qui différencie un logiciel "construit avec ses clients" d\'un logiciel classique ?',
      answer:
        'Les nouvelles fonctionnalités naissent souvent de besoins réels signalés directement par des clients, plutôt que d\'une feuille de route décidée uniquement en interne.',
    },
    {
      question: 'Un logiciel construit avec ses clients développe-t-il une version différente pour chacun ?',
      answer:
        'Non — le socle standard reste commun à tous, la différence porte sur la capacité à l\'ajuster réellement selon les retours du terrain plutôt que de rester figé.',
    },
    {
      question: 'Comment un retour client peut-il concrètement influencer l\'évolution de l\'outil ?',
      answer:
        'Un problème rencontré au quotidien, remonté directement, peut donner naissance à une nouvelle fonctionnalité qui profite ensuite à l\'ensemble des utilisateurs de l\'outil.',
    },
  ],
  relatedSlugs: [
    'cantia-adapte-metier-specifique-batiment',
    'demander-fonctionnalite-sur-mesure-editeur-logiciel',
    'logiciel-standard-vs-solution-personnalisee-batiment',
  ],
};
