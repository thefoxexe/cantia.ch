import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'gestion-entreprise-sur-mobile-artisan',
  question: 'Peut-on vraiment gérer toute son entreprise artisanale depuis un téléphone ?',
  title: 'Gérer son entreprise depuis son téléphone : jusqu\'où c\'est vraiment possible',
  description:
    'Devis, factures, photos de chantier, heures d\'équipe — ce qui se fait réellement bien sur mobile aujourd\'hui, et ce qui reste plus confortable sur un écran plus grand.',
  excerpt:
    'La promesse "gérez tout depuis votre téléphone" est vraie pour l\'essentiel du quotidien d\'un artisan — mais pas pour absolument tout, et mieux vaut savoir où se situe la limite.',
  category: 'Comparatifs & outils',
  keywords: ['gestion entreprise mobile', 'gérer artisanat depuis téléphone', 'application gestion smartphone bâtiment', 'tout gérer sur mobile PME', 'logiciel mobile artisan Suisse'],
  publishedAt: '2026-07-20',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'La promesse de "tout gérer depuis son téléphone" revient dans presque toutes les publicités d\'outils de gestion. Elle est globalement vraie pour le quotidien d\'un artisan, mais avec des nuances qu\'il vaut mieux connaître avant de s\'y fier entièrement.',
    },
    { type: 'h2', text: 'Ce qui fonctionne très bien sur mobile' },
    {
      type: 'list',
      items: [
        'Créer et envoyer un devis ou une facture depuis le chantier',
        'Prendre et organiser des photos géolocalisées',
        'Pointer ses heures ou consulter son planning',
        'Consulter l\'état des paiements en attente en un coup d\'œil',
      ],
    },
    { type: 'h2', text: 'Ce qui reste plus confortable sur ordinateur' },
    {
      type: 'list',
      items: [
        'Construire un catalogue de prix détaillé la première fois',
        'Analyser en profondeur la rentabilité de plusieurs chantiers en parallèle',
        'Paramétrer les rôles et permissions d\'une équipe qui grandit',
      ],
    },
    {
      type: 'stat',
      value: '90 %',
      label: 'part des tâches quotidiennes d\'un artisan (devis, facture, photo, heure) réalisables entièrement depuis un mobile avec un bon outil de gestion',
    },
    {
      type: 'callout',
      title: 'La bonne appli complète le mobile plutôt que de le remplacer totalement',
      text: 'Un outil qui fonctionne aussi bien sur ordinateur que sur mobile permet de faire les tâches rapides sur le terrain, et les tâches de configuration plus posées au bureau — sans jamais être bloqué d\'un côté ou de l\'autre.',
    },
    {
      type: 'cta',
      title: 'Le quotidien sur mobile, la configuration sur ordinateur',
      text: 'Cantia s\'utilise aussi bien depuis un téléphone sur chantier que depuis un ordinateur pour les tâches plus poussées — un seul compte, partout.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Peut-on vraiment créer un devis complet depuis son téléphone ?',
      answer:
        'Oui, avec un outil bien conçu pour mobile — y compris avec un catalogue de prix pour éviter de tout retaper à la main sur un petit écran.',
    },
    {
      question: 'Quelles tâches restent plus faciles sur ordinateur que sur mobile ?',
      answer:
        'La construction initiale d\'un catalogue de prix détaillé ou l\'analyse approfondie de plusieurs chantiers restent généralement plus confortables sur un écran plus grand.',
    },
    {
      question: 'Un artisan peut-il se passer complètement d\'ordinateur en utilisant un bon outil mobile ?',
      answer:
        'Pour le quotidien, largement oui — mais garder un accès occasionnel à un ordinateur reste utile pour les tâches de configuration plus poussées.',
    },
  ],
  relatedSlugs: [
    'application-gestion-freelance-batiment',
    'application-hors-ligne-chantier-pourquoi-important',
    'outil-facturation-en-ligne-pme-suisse',
  ],
};
