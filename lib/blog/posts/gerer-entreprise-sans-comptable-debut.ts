import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'gerer-entreprise-sans-comptable-debut',
  question: 'Peut-on gérer son entreprise sans comptable au tout début de l\'activité ?',
  title: 'Gérer son entreprise sans comptable au démarrage : jusqu\'où c\'est raisonnable',
  description:
    'Beaucoup d\'indépendants démarrent sans fiduciaire pour économiser. Ce qu\'il est réaliste de gérer soi-même, et le moment où un accompagnement devient nécessaire.',
  excerpt:
    'Se passer de comptable au démarrage n\'est pas une imprudence en soi — c\'est une question de savoir précisément où s\'arrête ce qu\'on peut gérer seul, et où ça devient risqué.',
  category: 'Comparatifs & outils',
  keywords: ['gérer entreprise sans comptable', 'démarrer sans fiduciaire Suisse', 'comptabilité indépendant débutant', 'gestion administrative sans comptable', 'auto-gestion entreprise bâtiment'],
  publishedAt: '2026-07-14',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Faire appel à un fiduciaire dès le premier jour représente un coût que beaucoup d\'indépendants préfèrent éviter au démarrage, quand chaque franc compte. Ce n\'est pas déraisonnable — à condition de savoir précisément ce qu\'on peut gérer seul et ce qui nécessite un accompagnement.',
    },
    { type: 'h2', text: 'Ce qu\'un indépendant peut généralement gérer seul' },
    {
      type: 'list',
      items: [
        'L\'émission de devis et factures conformes, avec un outil qui applique automatiquement les bonnes règles',
        'Le suivi de trésorerie de base — qui doit payer quoi, et quand',
        'L\'archivage des documents, pour retrouver facilement une facture en cas de contrôle',
      ],
    },
    { type: 'h2', text: 'Ce qui nécessite généralement un accompagnement' },
    {
      type: 'list',
      items: [
        'La déclaration TVA une fois le seuil d\'assujettissement franchi',
        'Le bouclement annuel des comptes',
        'Les cotisations sociales (AVS/AI) et leur calcul exact selon le revenu réel',
      ],
    },
    {
      type: 'stat',
      value: 'CHF 100 000',
      label: 'seuil de chiffre d\'affaires généralement associé à l\'assujettissement obligatoire à la TVA en Suisse — un repère souvent cité pour décider de faire appel à un fiduciaire',
    },
    {
      type: 'callout',
      title: 'Un bon outil de gestion facilite le travail du fiduciaire, le jour où il arrive',
      text: 'Des devis et factures bien structurés depuis le début, avec un historique clair, réduisent le temps (et donc le coût) que prendra un fiduciaire pour reprendre la comptabilité plus tard.',
    },
    {
      type: 'cta',
      title: 'Une base propre dès le premier document',
      text: 'Cantia structure automatiquement devis et factures de façon conforme — une base solide, que vous gériez seul aujourd\'hui ou avec un fiduciaire demain.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Peut-on démarrer son activité sans fiduciaire en Suisse ?',
      answer:
        'Oui pour les tâches de base (devis, factures, suivi de trésorerie), mais la déclaration TVA une fois assujetti et le bouclement annuel demandent généralement un accompagnement.',
    },
    {
      question: 'À partir de quel chiffre d\'affaires faut-il envisager un fiduciaire ?',
      answer:
        'Le seuil d\'assujettissement à la TVA (généralement CHF 100 000 de chiffre d\'affaires) est souvent le repère qui pousse à faire appel à un accompagnement professionnel.',
    },
    {
      question: 'Un bon logiciel de gestion remplace-t-il un fiduciaire ?',
      answer:
        'Non, mais il facilite grandement le travail du fiduciaire une fois sollicité, en gardant un historique de documents propre et conforme dès le départ.',
    },
  ],
  relatedSlugs: [
    'avs-ai-independant-batiment',
    'logiciel-facturation-raison-individuelle-suisse',
    'gerer-entreprise-seul-sans-embaucher-outils',
  ],
};
