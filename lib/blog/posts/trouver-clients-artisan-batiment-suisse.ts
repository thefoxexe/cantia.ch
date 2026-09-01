import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'trouver-clients-artisan-batiment-suisse',
  question: 'Comment un artisan indépendant du bâtiment trouve-t-il de nouveaux clients sans budget marketing important ?',
  title: 'Trouver des clients quand on est artisan indépendant, sans budget marketing',
  description:
    'Pas besoin d’une grosse campagne publicitaire pour remplir son carnet de commandes. Les canaux qui fonctionnent réellement pour un artisan du bâtiment en Suisse, du bouche-à-oreille au référencement local.',
  excerpt:
    'La majorité des artisans du bâtiment en Suisse trouvent leurs clients sans jamais avoir dépensé un centime en publicité : ce n’est pas un hasard, c’est le résultat de quelques habitudes précises, répétées dans la durée.',
  category: 'Croissance & acquisition',
  keywords: ['trouver des clients artisan', 'acquisition clients entreprise bâtiment', 'marketing artisan indépendant Suisse', 'développer clientèle construction', 'prospection artisan bâtiment'],
  publishedAt: '2026-08-29',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'La plupart des artisans du bâtiment n’ont ni le temps ni l’envie de gérer une stratégie marketing complexe. Et c’est très bien ainsi. Les canaux qui fonctionnent réellement dans ce secteur sont souvent simples, mais demandent de la constance : ils ne rapportent presque rien la première fois qu’on les active, et beaucoup après un an de régularité.',
    },
    { type: 'h2', text: 'Les canaux qui rapportent le plus, dans l’ordre' },
    {
      type: 'list',
      items: [
        'Le bouche-à-oreille d’un client satisfait est de loin le canal le plus fiable, mais il faut l’encourager activement (voir un article dédié sur le parrainage)',
        'La fiche Google Business bien tenue, avec photos de chantiers réels et avis récents (souvent le premier réflexe d’un client qui cherche un artisan dans sa région)',
        'Le réseau professionnel (autres corps de métier, architectes, régies), sachant qu’un maçon recommandé par un architecte vaut plusieurs prospects froids',
        'Un site internet simple avec des exemples de réalisations, même sans budget publicitaire derrière',
      ],
    },
    {
      type: 'stat',
      value: '60-80 %',
      label: 'part des nouveaux clients typiquement générés par recommandation directe pour une petite entreprise du bâtiment déjà établie',
    },
    { type: 'h2', text: 'Répondre vite fait souvent toute la différence' },
    {
      type: 'p',
      text: 'Un client qui contacte trois artisans pour un devis choisit très souvent celui qui répond en premier, à qualité de prestation équivalente. La vitesse de réponse à une demande de devis est probablement le levier le plus sous-exploité : pas besoin de plus de clients potentiels, juste de perdre moins de ceux qui contactent déjà.',
    },
    {
      type: 'callout',
      title: 'La régularité compte plus que l’intensité',
      text: 'Publier une photo de chantier terminé chaque semaine sur une fiche Google ou un réseau professionnel a plus d’effet sur un an que deux mois de publication intensive suivis d’un abandon.',
    },
    {
      type: 'cta',
      title: 'Un devis envoyé plus vite, un client qui hésite moins',
      text: 'Cantia permet de générer un devis professionnel depuis le chantier, en quelques minutes. De quoi répondre à une demande avant que le client n’ait fini de comparer les autres artisans contactés.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Quel est le canal d’acquisition le plus efficace pour un artisan du bâtiment ?',
      answer:
        'Le bouche-à-oreille reste généralement le plus efficace, suivi de près par une fiche Google Business bien entretenue avec des photos de chantiers réels et des avis récents.',
    },
    {
      question: 'Faut-il un site internet pour trouver des clients en tant qu’artisan ?',
      answer:
        'Ce n’est pas indispensable, mais un site simple avec des exemples de réalisations rassure un client qui compare plusieurs artisans, même sans stratégie publicitaire derrière.',
    },
    {
      question: 'Pourquoi la vitesse de réponse à une demande de devis est-elle si importante ?',
      answer:
        'Parce qu’un client qui contacte plusieurs artisans choisit souvent celui qui répond en premier, à qualité équivalente. C’est un levier de conversion souvent plus efficace que d’attirer davantage de prospects.',
    },
  ],
  relatedSlugs: [
    'vitesse-reponse-devis-taux-conversion-batiment',
    'avis-google-entreprise-construction-suisse',
    'parrainage-recommandation-clients-artisan-batiment',
  ],
};
