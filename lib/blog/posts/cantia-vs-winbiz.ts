import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'cantia-vs-winbiz',
  question: 'Cantia ou Winbiz : lequel choisir pour un artisan du bâtiment ?',
  title: 'Cantia vs Winbiz : comparatif pour artisans du bâtiment',
  description:
    'Winbiz est un logiciel suisse établi de comptabilité, facturation et gestion, historiquement orienté poste de travail fixe. Cantia est pensée mobile, pour le chantier. Comparaison factuelle des deux approches.',
  excerpt:
    'Winbiz est utilisé depuis longtemps par de nombreuses PME romandes. Mais un artisan qui passe ses journées sur le chantier n’a pas les mêmes besoins qu’une PME de bureau.',
  category: 'Comparatifs & outils',
  keywords: ['Winbiz', 'alternative Winbiz bâtiment', 'Winbiz vs Cantia', 'logiciel gestion artisan suisse'],
  publishedAt: '2026-09-30',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'Winbiz est un nom bien connu en Suisse romande, utilisé depuis longtemps par de nombreuses PME pour la comptabilité, la facturation et la gestion commerciale. C’est un outil établi, historiquement pensé pour un usage depuis un poste de travail fixe, au bureau. Pour un artisan qui travaille surtout sur le terrain, cette conception d’origine change beaucoup de choses au quotidien.',
    },
    { type: 'h2', text: 'Ce que Winbiz fait bien' },
    {
      type: 'p',
      text: 'Comptabilité complète, facturation, gestion des stocks et des achats : Winbiz couvre un large spectre de besoins de gestion pour une PME suisse, avec une solidité éprouvée sur la durée par de nombreuses entreprises.',
    },
    { type: 'h2', text: 'Ce qui manque pour un usage mobile, sur le chantier' },
    {
      type: 'p',
      text: 'Winbiz n’a pas été pensé, à l’origine, pour un usage nomade depuis un chantier : pas de création de devis à la voix entre deux rendez-vous, pas de rapport de chantier avec photos géolocalisées, pas de suivi de rentabilité chantier par chantier, pas de portail client pour signer un devis en ligne. Ce sont des besoins qui touchent spécifiquement le métier du bâtiment sur le terrain, pas la gestion administrative générale d’une entreprise.',
    },
    {
      type: 'callout',
      title: 'La différence tient surtout à l’endroit où le travail se fait vraiment',
      text: 'Winbiz a été conçu pour un usage de bureau, ce qui reste pertinent pour la gestion administrative globale d’une entreprise. Cantia part du principe que l’essentiel du travail d’un artisan se passe sur le chantier, pas derrière un écran fixe.',
    },
    { type: 'h2', text: 'Le tableau comparatif' },
    {
      type: 'table',
      headers: ['Critère', 'Winbiz', 'Cantia'],
      rows: [
        ['Comptabilité générale et facturation suisse', 'Oui', 'Non (pas son objectif)'],
        ['Devis créé directement depuis le chantier', 'Non', 'Oui'],
        ['Catalogue de prix spécifique aux métiers du bâtiment', 'Non', 'Oui'],
        ['Rapport de chantier avec photos', 'Non', 'Oui'],
        ['Rentabilité par chantier (devisé vs réel)', 'Non', 'Oui'],
        ['Application mobile pensée pour le terrain', 'Limité', 'Oui'],
      ],
    },
    {
      type: 'p',
      text: 'Une entreprise déjà équipée de Winbiz pour sa comptabilité n’a pas nécessairement à l’abandonner : l’enjeu est souvent de compléter la gestion administrative de bureau par un outil pensé pour ce qui se passe réellement sur le chantier, plutôt que de forcer un seul outil à couvrir les deux mondes.',
    },
    {
      type: 'cta',
      title: 'Un outil pensé pour le chantier, pas pour le bureau',
      text: 'Cantia accompagne l’artisan là où se passe vraiment le travail : devis dicté à la voix sur le chantier, factures QR conformes, rapports photo, planning et rentabilité par chantier.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Winbiz convient-il à une entreprise du bâtiment ?',
      answer:
        'Winbiz couvre bien la comptabilité et la facturation générale, mais il n’a pas été conçu spécifiquement pour le bâtiment ni pour un usage mobile depuis un chantier, contrairement à un outil comme Cantia.',
    },
    {
      question: 'Peut-on remplacer Winbiz uniquement par Cantia ?',
      answer:
        'Cantia n’est pas un logiciel de comptabilité générale en partie double. Pour la tenue comptable complète, beaucoup d’entreprises gardent un outil dédié comme Winbiz, tout en utilisant Cantia pour le pilotage opérationnel des chantiers.',
    },
    {
      question: 'Winbiz fonctionne-t-il bien depuis un chantier, sur mobile ?',
      answer:
        'Winbiz reste historiquement plus orienté vers un usage depuis un poste de travail fixe. Pour créer un devis ou documenter un chantier directement sur le terrain, un outil pensé mobile dès le départ, comme Cantia, est généralement plus adapté.',
    },
  ],
  relatedSlugs: ['cantia-vs-klara', 'cantia-vs-cresus-facturation', 'application-devis-mobile-artisan'],
};
