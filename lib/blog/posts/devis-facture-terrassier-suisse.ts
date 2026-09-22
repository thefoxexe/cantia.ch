import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-facture-terrassier-suisse',
  question: 'Comment établir devis et factures en tant que terrassier en Suisse ?',
  title: 'Devis et facturation pour un terrassier en Suisse',
  description:
    'Comment chiffrer un devis et facturer en tant que terrassier en Suisse : incertitude sur le terrain, facturation machine et opérateur, clauses pour les imprévus.',
  excerpt:
    'Premier corps de métier sur un chantier, le terrassier chiffre souvent avant de connaître le terrain réel. Voici comment sécuriser un devis quand le sol reste une inconnue.',
  category: 'Métiers du bâtiment',
  keywords: [
    'devis terrassement suisse',
    'facturation terrassier',
    'prix terrassement heure machine',
    'devis excavation terrain',
  ],
  publishedAt: '2026-10-02',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Le terrassier intervient en premier sur un chantier, souvent avant que le projet soit entièrement finalisé et avant de connaître avec certitude la nature réelle du terrain. Cette incertitude structurelle rend le devis de terrassement particulier : il doit chiffrer une prestation dont une partie des conditions n’est confirmée qu’une fois les engins sur place.',
    },
    { type: 'h2', text: 'Forfait sur le connu, régie sur l’imprévu' },
    {
      type: 'p',
      text: 'Pour les volumes de terre à déplacer et les prestations bien définies par les plans (fouille, nivellement de base), le forfait reste praticable. Mais la facturation à l’heure de machine et d’opérateur est très fréquente dans ce métier, en particulier pour tout ce qui dépend directement de la nature du sol rencontré. Un devis mixte, forfait pour le prévisible et régie horaire pour le reste, reflète mieux la réalité du terrain que le tout-forfait.',
    },
    { type: 'h2', text: 'Anticiper la découverte d’un terrain difficile' },
    {
      type: 'list',
      items: [
        'Roche : nécessite un engin ou une méthode différente, avec un surcoût qui peut être important',
        'Nappe phréatique haute ou terrain gorgé d’eau : impose souvent un pompage ou un drainage non prévu au devis initial',
        'Terrain pollué ou contenant des matériaux imprévus : implique une gestion et une évacuation spécifiques, réglementées',
      ],
    },
    {
      type: 'p',
      text: 'La bonne pratique est d’inscrire une clause explicite dans le devis : le prix indiqué se base sur la nature de sol présumée à la signature, et toute découverte différente (roche, eau, pollution) fait l’objet d’un avenant chiffré avant poursuite des travaux. Cette clause protège autant le terrassier que le client, en évitant les discussions a posteriori sur un imprévu que personne ne pouvait anticiper avec certitude.',
    },
    {
      type: 'callout',
      title: 'Le premier corps de métier porte le premier risque financier',
      text: 'Un terrassier qui démarre un chantier avant la finalisation complète du projet prend un risque que les corps de métier suivants n’ont pas. Facturer un acompte au démarrage, avant l’intervention des engins, reste la meilleure protection contre un chantier qui s’arrête en cours de route.',
    },
    {
      type: 'cta',
      title: 'Un devis mixte forfait et régie, géré en un seul outil',
      text: 'Cantia permet de chiffrer un terrassement en combinant lignes forfaitaires et heures de machine, puis de facturer les avenants liés aux imprévus de terrain sans repartir de zéro.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Comment facturer une découverte de roche non prévue au devis ?',
      answer:
        'Via un avenant chiffré séparément, à condition que le devis initial mentionne explicitement que le prix se base sur la nature de sol présumée et que toute différence constatée sera facturée en plus.',
    },
    {
      question: 'Faut-il facturer le terrassement au forfait ou à l’heure ?',
      answer:
        'Un mix des deux est souvent le plus juste : forfait pour les prestations bien définies par les plans, régie horaire (machine et opérateur) pour tout ce qui dépend de la nature réelle du terrain.',
    },
    {
      question: 'Pourquoi demander un acompte avant de démarrer un chantier de terrassement ?',
      answer:
        'Parce que le terrassier engage des coûts importants de machine et de main-d’œuvre dès le premier jour, souvent avant que le reste du projet soit finalisé, ce qui l’expose davantage en cas d’arrêt du chantier.',
    },
  ],
  relatedSlugs: [
    'logiciel-devis-facture-maconnerie-suisse',
    'checklist-ouverture-chantier-artisan',
    'permis-construire-renovation-quand-necessaire',
    'previsionnel-tresorerie-entreprise-batiment',
  ],
  relatedTradeSlug: 'terrassier',
};
