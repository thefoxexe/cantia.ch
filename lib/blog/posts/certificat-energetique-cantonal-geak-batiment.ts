import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'certificat-energetique-cantonal-geak-batiment',
  question: 'Qu’est-ce que le CECB (GEAK) et quand est-il obligatoire ?',
  title: 'Le CECB/GEAK : le certificat énergétique cantonal des bâtiments',
  description:
    'Le CECB, aussi appelé GEAK, note l’efficacité énergétique d’un bâtiment de A à G. Obligatoire dans certains cantons lors d’une vente, il concerne aussi les artisans en rénovation énergétique.',
  excerpt:
    'Une note de A à G, un peu comme sur un électroménager, mais pour un bâtiment entier : voici ce qu’il faut savoir sur le CECB avant qu’un client n’en parle sur un chantier.',
  category: 'Juridique & normes',
  keywords: ['CECB certificat énergétique bâtiment', 'GEAK obligatoire suisse', 'certificat énergétique cantonal'],
  publishedAt: '2026-10-08',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Le CECB — certificat énergétique cantonal des bâtiments, aussi connu sous le nom de GEAK — revient régulièrement dans les discussions autour de la vente ou de la rénovation d’un bien immobilier en Suisse. Sans être toujours au cœur du métier d’un artisan, il fait partie des documents qu’un client mentionne de plus en plus souvent, en particulier sur des projets de rénovation énergétique.',
    },
    { type: 'h2', text: 'Ce que le CECB évalue' },
    {
      type: 'p',
      text: 'Le CECB attribue une note allant de A à G à un bâtiment, sur le modèle des étiquettes énergétiques utilisées pour l’électroménager, en fonction de sa performance énergétique globale. Il évalue à la fois l’enveloppe du bâtiment (isolation, fenêtres) et les installations techniques (chauffage, production d’eau chaude), et permet de situer un bien par rapport à d’autres sur un même marché.',
    },
    {
      type: 'h2', text: 'Quand est-il obligatoire ?',
    },
    {
      type: 'p',
      text: 'Les exigences varient selon le canton : dans plusieurs cantons, le CECB est obligatoire lors de la vente d’un bâtiment, et parfois lors d’une location, mais les règles précises — délai, champ d’application, exceptions — diffèrent d’un canton à l’autre. Il est donc utile de vérifier la réglementation cantonale exacte plutôt que de se fier à une règle générale, surtout quand un client pose la question directement.',
    },
    {
      type: 'callout',
      title: 'Le CECB n’est pas le Programme Bâtiments',
      text: 'Les deux sont souvent confondus alors qu’ils ne font pas la même chose. Le CECB évalue et note la performance énergétique d’un bâtiment. Le Programme Bâtiments, lui, subventionne certains travaux de rénovation énergétique. L’un peut motiver l’autre, mais ce sont deux démarches distinctes, avec des interlocuteurs différents.',
    },
    { type: 'h2', text: 'Pourquoi un artisan en rénovation énergétique y est concerné' },
    {
      type: 'p',
      text: 'Un client qui a fait établir un CECB dispose déjà d’un diagnostic assez précis des faiblesses énergétiques de son bâtiment, ce qui peut orienter directement la nature des travaux demandés — isolation de façade, remplacement de fenêtres, changement de système de chauffage. Comprendre la logique du certificat aide à mieux dialoguer avec un client qui arrive déjà avec ce document en main, et parfois avec des attentes précises sur le gain de note visé.',
    },
    {
      type: 'cta',
      title: 'Chiffrer une rénovation énergétique sans perdre le fil',
      text: 'Isolation, fenêtres, chauffage : une rénovation énergétique combine souvent plusieurs corps de métier et plusieurs devis. Avec Cantia, chaque poste reste suivi jusqu’à la facture finale, pour garder une vision claire de la rentabilité du chantier.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Le CECB et le GEAK sont-ils la même chose ?',
      answer:
        'Oui, ce sont deux noms pour le même certificat : GEAK en allemand (Gebäudeenergieausweis der Kantone) et CECB en français, tous deux désignant le certificat énergétique cantonal des bâtiments.',
    },
    {
      question: 'Le CECB est-il obligatoire dans toute la Suisse ?',
      answer:
        'Non, les exigences varient selon le canton, avec une obligation fréquente lors d’une vente et parfois lors d’une location, selon les règles cantonales en vigueur. Il faut vérifier la réglementation précise du canton concerné.',
    },
    {
      question: 'Le CECB donne-t-il droit à une subvention ?',
      answer:
        'Non, le CECB est un outil d’évaluation, pas de subvention. Les aides financières pour la rénovation énergétique relèvent d’autres dispositifs, comme le Programme Bâtiments, qui fonctionne indépendamment du certificat.',
    },
  ],
  relatedSlugs: [
    'norme-minergie-batiment-explication',
    'programme-batiments-subvention-renovation-suisse',
    'prix-isolation-facade-m2-suisse',
  ],
};
