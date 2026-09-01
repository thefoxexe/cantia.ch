import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'lancer-entreprise-batiment-suisse-par-ou-commencer',
  question: 'Par où commencer concrètement pour lancer son entreprise du bâtiment en Suisse ?',
  title: 'Lancer son entreprise du bâtiment en Suisse : par où commencer',
  description:
    'Entre le statut juridique, les assurances et les premiers outils, un ordre logique pour ne rien manquer au moment de se lancer dans le bâtiment en Suisse.',
  excerpt:
    'Se lancer dans le bâtiment implique une dizaine de décisions à prendre à peu près en même temps : un ordre clair aide à ne rien oublier sans se sentir submergé dès le premier jour.',
  category: 'Comparatifs & outils',
  keywords: ['lancer entreprise bâtiment Suisse', 'par où commencer entreprise construction', 'étapes création entreprise bâtiment', 'démarches entreprise artisan Suisse', 'checklist lancement activité bâtiment'],
  publishedAt: '2026-08-13',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Lancer une entreprise du bâtiment en Suisse implique des démarches juridiques, administratives et pratiques qui arrivent presque toutes en même temps. Un ordre clair permet d\'avancer méthodiquement, sans se sentir submergé par tout ce qu\'il reste à faire.',
    },
    { type: 'h2', text: 'Les grandes étapes, dans l\'ordre logique' },
    {
      type: 'list',
      items: [
        '1. Choisir un statut juridique (raison individuelle, Sàrl, SA) adapté à la situation et à l\'ambition de croissance',
        '2. S\'inscrire au registre du commerce si nécessaire, et vérifier les autorisations de pratiquer propres au métier',
        '3. Souscrire une assurance RC professionnelle, généralement indispensable',
        '4. Ouvrir un compte bancaire professionnel séparé du compte personnel',
        '5. Mettre en place un outil de devis et factures conforme, avant le tout premier client',
        '6. Se rapprocher d\'une association de métier ou d\'une chambre de commerce cantonale pour les premiers contacts et recommandations',
      ],
    },
    {
      type: 'stat',
      value: '2-4 sem.',
      label: 'délai courant pour finaliser les démarches administratives de base (inscription, assurance, compte bancaire) avant de pouvoir facturer légalement',
    },
    { type: 'h2', text: 'Ne pas tout vouloir perfectionner avant de démarrer' },
    {
      type: 'p',
      text: 'Attendre d\'avoir "tout" en place avant d\'accepter un premier client repousse inutilement le début de l\'activité. Le strict nécessaire (statut, assurance, outil de facturation) suffit pour démarrer. Le reste (catalogue de prix complet, planning, RH) peut se construire au fil de l\'eau.',
    },
    {
      type: 'callout',
      title: 'Un logiciel de gestion dès le départ facilite toutes les autres étapes',
      text: 'Un outil qui centralise devis, factures et suivi de chantier dès le premier jour rend les démarches suivantes (comptabilité, TVA, croissance) plus simples à gérer sans repartir de zéro.',
    },
    {
      type: 'cta',
      title: 'Prêt à facturer dès votre premier jour d\'activité',
      text: 'Cantia s\'installe rapidement et couvre devis, factures et suivi de chantier dès le lancement. Essayez-le gratuitement 30 jours avec le code ESSAI30.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Quelle est la première étape pour lancer une entreprise du bâtiment en Suisse ?',
      answer:
        'Choisir un statut juridique adapté (raison individuelle, Sàrl, SA), puis s\'inscrire au registre du commerce si nécessaire et vérifier les autorisations propres au métier.',
    },
    {
      question: 'Faut-il tout avoir en place avant d\'accepter son premier client ?',
      answer:
        'Non, car le strict nécessaire (statut juridique, assurance RC, outil de facturation conforme) suffit pour démarrer, et le reste peut se construire progressivement.',
    },
    {
      question: 'À quel moment mettre en place son outil de gestion en lançant son entreprise ?',
      answer:
        'Idéalement avant le tout premier client, pour garantir des devis et factures conformes dès le début de l\'activité.',
    },
  ],
  relatedSlugs: [
    'demarrer-entreprise-batiment-outils-indispensables',
    'checklist-logiciels-ouverture-societe-construction',
    'pourquoi-artisan-independant-besoin-logiciel-des-le-debut',
  ],
};
