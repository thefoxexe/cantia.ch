import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'travailleur-temporaire-interimaire-batiment-regles',
  question: 'Faire appel à un intérimaire dans le bâtiment : quelles règles et quels pièges éviter ?',
  title: 'Travailleur temporaire dans le bâtiment : ce qu’il faut savoir avant d’y recourir',
  description:
    'L’intérim permet d’absorber un pic d’activité rapidement, mais implique une entreprise de location de services soumise à autorisation, et des règles de coordination avec la CCT du chantier.',
  excerpt:
    'Un intérimaire coûte plus cher à l’heure qu’un employé fixe, mais évite l’engagement d’un recrutement. Encore faut-il connaître les règles pour que ça reste un vrai gain, pas un risque caché.',
  category: 'RH & salaires',
  keywords: ['intérimaire bâtiment', 'travailleur temporaire construction', 'location de services BTP', 'agence intérim chantier', 'main-d’œuvre temporaire suisse'],
  publishedAt: '2026-07-01',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Recourir à un travailleur temporaire pour absorber un pic d’activité est courant dans le bâtiment. L’opération passe toutefois légalement par une entreprise de location de services, soumise à autorisation cantonale et fédérale, et non par un simple accord informel entre deux entreprises.',
    },
    { type: 'h2', text: 'Ce qui distingue l’intérim d’un simple prêt de personnel' },
    {
      type: 'list',
      items: [
        'Une entreprise de location de services doit détenir une autorisation officielle pour placer du personnel (un prêt de main-d’œuvre informel entre deux entreprises du bâtiment n’a pas ce statut légal)',
        'Le contrat de travail lie l’intérimaire à l’agence de location, pas à l’entreprise qui l’accueille sur le chantier : c’est l’agence qui reste responsable du salaire et des charges sociales',
        'L’entreprise utilisatrice doit néanmoins respecter les mêmes règles de sécurité au travail que pour ses propres employés',
      ],
    },
    { type: 'h2', text: 'La coordination avec la CCT du chantier' },
    {
      type: 'p',
      text: 'Un intérimaire placé sur un chantier de construction reste soumis aux conditions de la convention collective de travail applicable au secteur, au même titre qu’un employé fixe, ce qui oblige l’agence de location à en tenir compte dans le salaire versé et explique en partie le coût horaire plus élevé facturé à l’entreprise utilisatrice.',
    },
    {
      type: 'callout',
      title: 'Le coût horaire affiché inclut déjà les charges : comparer directement au salaire d’un employé fixe est trompeur',
      text: 'Le tarif facturé par une agence de location de services couvre le salaire, les charges sociales et sa propre marge. La comparaison pertinente est avec le coût horaire complet d’un employé fixe, pas avec son seul salaire brut.',
    },
    { type: 'h2', text: 'Quand l’intérim a vraiment du sens' },
    {
      type: 'list',
      items: [
        'Un pic d’activité ponctuel et limité dans le temps, sur un ou deux chantiers précis',
        'Un remplacement rapide en cas d’absence imprévue, sans le temps de recruter en propre',
        'Un test de volume d’activité avant de décider d’un recrutement durable',
      ],
    },
    {
      type: 'cta',
      title: 'Suivre les heures d’un renfort temporaire comme celles de l’équipe fixe',
      text: 'Le module Heures & Salaires de Cantia permet de suivre l’activité de tout intervenant sur un chantier, renfort temporaire compris, sans double système parallèle.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Peut-on prêter du personnel entre deux entreprises du bâtiment sans passer par une agence ?',
      answer:
        'Un vrai prêt de main-d’œuvre nécessite une entreprise de location de services autorisée. Un accord informel sans ce statut légal n’est pas conforme.',
    },
    {
      question: 'Un intérimaire est-il soumis à la CCT du chantier où il travaille ?',
      answer:
        'Oui, les conditions de la convention collective applicable au secteur s’appliquent à lui au même titre qu’à un employé fixe, ce que l’agence de location doit répercuter dans son salaire.',
    },
    {
      question: 'Pourquoi un intérimaire coûte-t-il plus cher à l’heure qu’un employé fixe ?',
      answer:
        'Le tarif facturé inclut déjà le salaire, les charges sociales et la marge de l’agence, ce qui rend pertinente la comparaison avec le coût horaire complet d’un employé, plutôt qu’avec son seul salaire brut.',
    },
  ],
  relatedSlugs: [
    'sous-effectif-chantier-recruter-ou-sous-traiter',
    'salaire-minimum-cct-construction-suisse',
    'sous-traitant-batiment-suisse-contrat-facturation',
  ],
};
