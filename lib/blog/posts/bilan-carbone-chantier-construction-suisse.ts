import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'bilan-carbone-chantier-construction-suisse',
  question: 'Comment évaluer le bilan carbone d’un chantier de construction ?',
  title: 'Bilan carbone d’un chantier : de quoi parle-t-on vraiment',
  description:
    'Matériaux, transport, énergie et déchets : voici ce qui compose réellement le bilan carbone d’un chantier suisse, et pourquoi ce critère revient de plus en plus dans les cahiers des charges.',
  excerpt:
    'Le bilan carbone d’un chantier n’est pas une case cochée pour faire plaisir. C’est une addition très concrète de matériaux, de trajets et d’énergie consommée pendant les travaux.',
  category: 'Juridique & normes',
  keywords: ['bilan carbone chantier', 'empreinte carbone construction suisse', 'bilan carbone bâtiment'],
  publishedAt: '2026-10-08',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Le bilan carbone d’un chantier revient de plus en plus souvent dans les échanges avec certains maîtres d’ouvrage, en particulier sur des marchés publics ou des projets portés par des collectivités. Le terme reste pourtant flou pour beaucoup d’entreprises, entre ce qu’il mesure réellement et ce qui relève plutôt du bâtiment fini une fois occupé.',
    },
    { type: 'h2', text: 'Ce qui compose l’empreinte carbone d’un chantier' },
    {
      type: 'p',
      text: 'Le bilan carbone d’un chantier additionne plusieurs sources d’émissions, dont le poids relatif varie fortement selon le type de projet.',
    },
    {
      type: 'list',
      items: [
        'La production des matériaux — le béton et l’acier pèsent en général le plus lourd, bien avant le bois ou les matériaux biosourcés',
        'Le transport, à la fois des matériaux jusqu’au chantier et des déchets évacués',
        'L’énergie consommée sur le chantier lui-même : engins, outillage électrique, chauffage temporaire',
        'Le traitement des déchets de construction, dont l’impact varie beaucoup selon qu’ils sont triés et valorisés ou simplement incinérés',
      ],
    },
    { type: 'h2', text: 'Bâtiment ou chantier : deux périmètres différents' },
    {
      type: 'p',
      text: 'Il est utile de distinguer deux notions souvent confondues. Le bilan carbone d’un bâtiment couvre toute sa durée de vie : construction, mais aussi chauffage, entretien et éventuellement démolition sur plusieurs décennies. Le bilan carbone d’un chantier, lui, se limite à la phase de construction ou de rénovation elle-même — c’est un périmètre plus restreint, plus facile à mesurer, et c’est celui qui concerne directement une entreprise du bâtiment au moment d’exécuter les travaux.',
    },
    {
      type: 'callout',
      title: 'Le choix du matériau pèse plus que l’organisation du chantier',
      text: 'Sur la plupart des projets, le choix des matériaux structurels influence le bilan carbone bien plus que l’organisation logistique du chantier elle-même. Optimiser les trajets de camions reste utile, mais ne compense pas un choix de matériau nettement plus émetteur.',
    },
    { type: 'h2', text: 'Pourquoi ce critère prend de l’importance' },
    {
      type: 'p',
      text: 'Certains maîtres d’ouvrage, notamment dans le secteur public ou parapublic, intègrent désormais des critères liés à l’impact environnemental dans leurs appels d’offres, parfois au même titre que le prix. Une entreprise capable d’argumenter sur ses choix de matériaux ou sa gestion des déchets dispose d’un avantage réel face à des concurrents qui n’y ont simplement jamais réfléchi.',
    },
    {
      type: 'cta',
      title: 'Documenter les chantiers avec des arguments concrets',
      text: 'Un dossier de chantier qui montre les matériaux utilisés et la gestion des déchets constitue déjà un premier argument face à un maître d’ouvrage exigeant. Avec Cantia, chaque chantier garde son historique complet, prêt à être présenté.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Qu’est-ce qui pèse le plus dans le bilan carbone d’un chantier ?',
      answer:
        'En général, la production des matériaux, en particulier le béton et l’acier, représente la part la plus importante, largement devant le transport ou l’énergie consommée directement sur le chantier.',
    },
    {
      question: 'Le bilan carbone d’un chantier est-il obligatoire en Suisse ?',
      answer:
        'Il n’existe pas d’obligation générale et uniforme, mais certains marchés publics ou projets soumis à des exigences environnementales spécifiques peuvent le demander explicitement dans leur cahier des charges.',
    },
    {
      question: 'Quelle différence entre le bilan carbone d’un bâtiment et celui d’un chantier ?',
      answer:
        'Le bilan carbone d’un bâtiment couvre toute sa durée de vie, chauffage et entretien compris sur plusieurs décennies, alors que celui d’un chantier se limite à la phase de construction ou de rénovation proprement dite.',
    },
  ],
  relatedSlugs: [
    'reemploi-materiaux-economie-circulaire-batiment',
    'norme-minergie-batiment-explication',
    'certificat-energetique-cantonal-geak-batiment',
    'gestion-dechets-chantier-tri-obligatoire-suisse',
  ],
};
