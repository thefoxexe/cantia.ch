import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-facture-ramoneur-suisse',
  question: 'Comment établir devis et factures en tant que ramoneur en Suisse ?',
  title: 'Devis et facturation pour un ramoneur en Suisse',
  description:
    'Comment établir devis et factures en tant que ramoneur en Suisse : secteur réglementé par canton, facturation périodique, rapport de contrôle écrit.',
  excerpt:
    'Le ramonage est un métier à part : souvent réglementé par secteur cantonal, avec une facturation récurrente plutôt que ponctuelle. Voici les points à connaître pour bien la structurer.',
  category: 'Métiers du bâtiment',
  keywords: [
    'devis ramoneur suisse',
    'facturation ramonage prix',
    'contrôle chauffage ramoneur',
    'ramoneur officiel canton',
  ],
  publishedAt: '2026-10-03',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Le ramonage occupe une place particulière parmi les métiers du bâtiment : dans plusieurs cantons suisses, l’activité est organisée par secteur, avec un ramoneur officiel attribué à une zone géographique donnée, et un contrôle périodique obligatoire des installations de chauffage. Les règles exactes (fréquence des contrôles, périmètre de compétence) varient selon le canton, et il est essentiel de vérifier le cadre applicable à son propre secteur avant de structurer sa facturation.',
    },
    { type: 'h2', text: 'Une facturation souvent récurrente, pas ponctuelle' },
    {
      type: 'p',
      text: 'Contrairement à la plupart des autres corps de métier du bâtiment, le ramoneur facture rarement une prestation isolée. L’essentiel de l’activité repose sur des contrôles et nettoyages périodiques, dont la fréquence dépend du type d’installation (chauffage au bois, au mazout, au gaz) et des règles cantonales. Cela justifie une organisation de facturation par cycle plutôt que par chantier, avec un suivi des échéances de contrôle propre à chaque client.',
    },
    { type: 'h2', text: 'Le rapport de contrôle écrit, une pièce centrale' },
    {
      type: 'p',
      text: 'Chaque intervention de contrôle donne lieu à un rapport écrit remis au client, qui atteste de la conformité de l’installation ou signale les points à corriger. Ce rapport doit être conservé par le client, parfois exigé par son assurance ou lors d’une vente immobilière. Facturer l’intervention sans avoir formalisé ce rapport, ou avec un délai trop long entre le passage et sa remise, est une source fréquente de réclamation.',
    },
    {
      type: 'callout',
      title: 'La périodicité facilite la prévisibilité du chiffre d’affaires',
      text: 'Un ramoneur qui structure ses tournées par cycle de contrôle plutôt qu’au fil des demandes ponctuelles gagne en prévisibilité, à la fois pour organiser ses déplacements et pour anticiper son chiffre d’affaires sur l’année.',
    },
    {
      type: 'cta',
      title: 'Suivez vos cycles de contrôle sans tableur',
      text: 'Cantia permet de programmer des factures récurrentes par client et de garder l’historique des rapports de contrôle liés à chaque installation.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Le ramonage est-il obligatoire partout en Suisse selon les mêmes règles ?',
      answer:
        'Le principe d’un contrôle périodique existe largement, mais la fréquence et l’organisation par secteur varient selon le canton. Il est important de vérifier les règles exactes applicables à sa propre zone d’activité.',
    },
    {
      question: 'Pourquoi facturer le ramonage par cycle plutôt qu’à l’intervention ?',
      answer:
        'Parce que l’activité repose sur des contrôles périodiques récurrents plutôt que sur des chantiers ponctuels, un suivi par cycle facilite à la fois la planification des tournées et la prévisibilité du chiffre d’affaires.',
    },
    {
      question: 'Que doit contenir le rapport remis après un contrôle ?',
      answer:
        'Un état clair de la conformité de l’installation, daté et signé, remis rapidement au client — ce document peut lui être demandé par son assurance ou lors d’une transaction immobilière.',
    },
  ],
  relatedSlugs: [
    'devis-facture-poelier-fumiste-suisse',
    'devis-facture-chauffagiste-cvc-suisse',
    'previsionnel-tresorerie-entreprise-batiment',
  ],
};
