import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'creer-champ-processus-sur-mesure-logiciel-gestion',
  question: 'Est-il possible d\'ajouter un champ ou un processus sur mesure dans son logiciel de gestion ?',
  title: 'Ajouter un champ ou un processus qui n\'existe nulle part ailleurs',
  description:
    'Un formulaire standard ne colle jamais à 100% à la façon de travailler d\'une entreprise. Comment un champ ou un processus sur mesure comble ce dernier écart.',
  excerpt:
    'Un formulaire de devis standard couvre 90% des besoins — les 10% restants, propres à la façon de travailler d\'une entreprise précise, méritent parfois un champ qui n\'existe dans aucun outil générique.',
  category: 'Sur-mesure & automatisations',
  keywords: ['ajouter champ sur mesure logiciel', 'processus personnalisé gestion entreprise', 'formulaire sur mesure devis facture', 'adapter logiciel besoins spécifiques', 'champ personnalisé outil gestion bâtiment'],
  publishedAt: '2026-08-18',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Un outil de gestion standard couvre généralement la grande majorité des besoins d\'une entreprise du bâtiment. Mais certaines entreprises ont un détail de fonctionnement propre — une information à suivre systématiquement, une étape de validation particulière — qu\'aucun formulaire générique ne prévoit.',
    },
    { type: 'h2', text: 'Des exemples de champs ou processus vraiment sur mesure' },
    {
      type: 'list',
      items: [
        'Un champ spécifique à cocher avant qu\'un devis ne puisse être envoyé (vérification propre au métier)',
        'Une étape de validation supplémentaire par un responsable avant l\'émission d\'une facture',
        'Un champ de suivi propre à un type de chantier particulier, absent des formulaires standards',
        'Un processus de réception de chantier avec des critères propres à l\'entreprise',
      ],
    },
    {
      type: 'stat',
      value: '80/20',
      label: 'répartition typique entre besoins couverts par un outil standard et besoins vraiment spécifiques à une entreprise — c\'est sur ces derniers 20% que le sur-mesure fait la différence',
    },
    { type: 'h2', text: 'Le sur-mesure part toujours d\'un vrai besoin, pas d\'une idée abstraite' },
    {
      type: 'p',
      text: 'Un champ ou un processus sur mesure n\'a de sens que s\'il répond à une friction réelle rencontrée au quotidien — c\'est pourquoi il se construit généralement en discutant directement du problème concret, pas en listant des envies théoriques.',
    },
    {
      type: 'callout',
      title: 'Un champ sur mesure reste intégré au reste de l\'outil',
      text: 'Contrairement à un contournement bricolé (un tableur à côté, par exemple), un champ développé sur mesure s\'intègre au même endroit que le reste des données — pas de ressaisie ni de système parallèle à maintenir.',
    },
    {
      type: 'cta',
      title: 'Parlons de ce qui manque à votre quotidien',
      text: 'Si un détail de votre façon de travailler ne trouve pas sa place dans Cantia aujourd\'hui, discutons-en — c\'est souvent le point de départ d\'une fonctionnalité sur mesure.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Peut-on ajouter un champ personnalisé à un devis ou une facture dans Cantia ?',
      answer:
        'C\'est possible via le développement de fonctionnalités sur mesure, pour des besoins propres à la façon de travailler d\'une entreprise en particulier.',
    },
    {
      question: 'Comment démarre concrètement une demande de champ ou de processus sur mesure ?',
      answer:
        'En général par une discussion directe sur le problème concret rencontré au quotidien, plutôt qu\'à partir d\'une liste théorique de souhaits.',
    },
    {
      question: 'Un champ sur mesure reste-t-il intégré au reste de l\'outil ?',
      answer:
        'Oui — contrairement à un contournement externe (tableur séparé, par exemple), un champ développé sur mesure s\'intègre directement aux données existantes, sans ressaisie.',
    },
  ],
  relatedSlugs: [
    'cantia-adapte-metier-specifique-batiment',
    'pourquoi-modeles-figes-ne-conviennent-pas-tous-metiers-batiment',
    'demander-fonctionnalite-sur-mesure-editeur-logiciel',
  ],
};
