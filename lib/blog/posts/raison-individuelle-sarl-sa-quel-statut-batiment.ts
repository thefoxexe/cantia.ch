import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'raison-individuelle-sarl-sa-quel-statut-batiment',
  question: 'Raison individuelle, Sàrl ou SA : quel statut choisir pour une entreprise du bâtiment en Suisse ?',
  title: 'Raison individuelle, Sàrl ou SA : quel statut pour une entreprise du bâtiment',
  description:
    'Raison individuelle, Sàrl ou SA pour se lancer dans le bâtiment en Suisse : capital, responsabilité, coûts de création et le vrai critère de choix, avec un tableau comparatif.',
  excerpt:
    'La question revient à chaque création d’entreprise du bâtiment, et la bonne réponse dépend rarement de la taille visée. Elle dépend surtout du risque financier du métier.',
  category: 'Juridique & normes',
  keywords: [
    'raison individuelle ou sàrl bâtiment',
    'statut juridique entreprise construction suisse',
    'sàrl vs sa bâtiment',
    'créer entreprise individuelle artisan',
    'quel statut pour artisan indépendant suisse',
  ],
  publishedAt: '2026-09-08',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'C’est souvent la toute première décision administrative, et celle qui bloque le plus longtemps avant l’ouverture d’un chantier. Raison individuelle, Sàrl ou SA : la bonne réponse ne dépend presque jamais de l’ambition affichée, mais d’un seul critère concret, souvent ignoré au moment de choisir.',
    },
    { type: 'h2', text: 'Raison individuelle : le choix par défaut, et souvent le bon' },
    {
      type: 'p',
      text: 'C’est le statut le plus rapide et le moins coûteux à ouvrir : aucun capital minimum, aucun acte notarié, une simple annonce à la caisse de compensation AVS et, au-delà de CHF 100’000 de chiffre d’affaires annuel, une inscription obligatoire au registre du commerce (facultative en dessous de ce seuil, mais souvent utile pour l’image et pour ouvrir un compte professionnel). C’est le point de départ naturel pour un artisan qui se lance seul.',
    },
    {
      type: 'callout',
      title: 'Le vrai coût caché de la raison individuelle',
      text: 'La responsabilité est illimitée : en cas de dette professionnelle impayée, le patrimoine personnel (épargne, parts de propriété) peut être engagé, pas seulement les actifs de l’entreprise. C’est le vrai arbitrage à faire, pas la paperasse de création.',
    },
    { type: 'h2', text: 'Sàrl : quand la responsabilité limitée devient nécessaire' },
    {
      type: 'p',
      text: 'La Sàrl (société à responsabilité limitée) exige un capital social minimum de CHF 20’000, intégralement libéré à la constitution, un acte authentique devant notaire et une inscription obligatoire au registre du commerce. En échange, la responsabilité est limitée aux apports de la société : le patrimoine personnel des associés est en principe protégé des dettes de l’entreprise, sauf faute grave ou caution personnelle donnée à une banque.',
    },
    {
      type: 'p',
      text: 'C’est le statut qui devient pertinent dès que l’activité engage des montants importants par chantier, qu’un ou plusieurs employés sont embauchés, ou que l’entreprise travaille avec des maîtres d’ouvrage qui exigent une structure sociétaire plutôt qu’un indépendant en nom propre — de plus en plus fréquent sur les chantiers de taille moyenne.',
    },
    { type: 'h2', text: 'SA : rarement le bon point de départ dans le bâtiment' },
    {
      type: 'p',
      text: 'La société anonyme exige un capital de CHF 100’000 (dont CHF 50’000 au moins libérés à la fondation), une gouvernance plus lourde (conseil d’administration, organe de révision selon la taille) et des frais de constitution nettement supérieurs à ceux d’une Sàrl. Elle a du sens pour une structure déjà importante, avec plusieurs associés ou des investisseurs externes, mais elle est rarement le bon choix pour démarrer une entreprise artisanale.',
    },
    {
      type: 'table',
      headers: ['Critère', 'Raison individuelle', 'Sàrl', 'SA'],
      rows: [
        ['Capital minimum', 'Aucun', 'CHF 20’000', 'CHF 100’000 (CHF 50’000 libérés)'],
        ['Responsabilité', 'Illimitée, sur le patrimoine personnel', 'Limitée aux apports', 'Limitée aux apports'],
        ['Acte notarié', 'Non', 'Oui', 'Oui'],
        ['Inscription RC', 'Obligatoire dès CHF 100’000 de CA', 'Toujours obligatoire', 'Toujours obligatoire'],
        ['Coût de création', 'Quasi nul', 'Environ CHF 700 à 2’500', 'Souvent CHF 3’000 et plus'],
        ['Adapté pour', 'Démarrer seul, tester l’activité', 'Structure établie, employés, risque à couvrir', 'Grande structure, plusieurs associés'],
      ],
    },
    { type: 'h2', text: 'Le vrai critère : le risque financier du métier, pas la taille visée' },
    {
      type: 'list',
      items: [
        'Un chantier qui tourne mal peut-il générer une dette que vous ne pourriez pas éponger personnellement ? Si oui, la responsabilité limitée d’une Sàrl a un vrai prix.',
        'Le métier implique-t-il des montants engagés élevés (gros œuvre, installations techniques) ou plutôt des interventions ponctuelles de faible montant ? Le risque n’est pas le même selon le corps de métier.',
        'Des employés seront-ils embauchés rapidement ? Une structure sociétaire facilite souvent la relation avec les banques, les assurances collectives et certains maîtres d’ouvrage.',
      ],
    },
    {
      type: 'stat',
      value: 'CHF 20’000',
      label: 'de capital minimum, intégralement libéré, pour constituer une Sàrl en Suisse',
    },
    {
      type: 'p',
      text: 'Le changement de statut en cours de route est courant et parfaitement possible : beaucoup d’entreprises du bâtiment démarrent en raison individuelle pour tester l’activité à moindre coût, puis basculent vers une Sàrl une fois le chiffre d’affaires stabilisé et le risque devenu réel. Ce n’est pas un échec de départ, c’est une trajectoire normale.',
    },
    {
      type: 'cta',
      title: 'Le statut change, la façon de gérer votre entreprise, non',
      text: 'Que vous démarriez en raison individuelle ou que vous passiez en Sàrl plus tard, devis, factures et suivi de chantier fonctionnent exactement de la même façon sur Cantia.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Peut-on démarrer en raison individuelle et passer en Sàrl plus tard ?',
      answer:
        'Oui, c’est même la trajectoire la plus fréquente dans le bâtiment : démarrer en raison individuelle pour limiter les frais de création, puis basculer vers une Sàrl une fois l’activité stabilisée et le risque financier devenu significatif.',
    },
    {
      question: 'Faut-il un capital minimum pour créer une raison individuelle ?',
      answer:
        'Non, aucun capital minimum n’est exigé pour une raison individuelle, contrairement à la Sàrl (CHF 20’000) ou à la SA (CHF 100’000).',
    },
    {
      question: 'La responsabilité illimitée d’une raison individuelle concerne-t-elle uniquement les biens professionnels ?',
      answer:
        'Non, elle engage l’ensemble du patrimoine personnel de l’entrepreneur, pas seulement les actifs affectés à l’activité professionnelle — c’est la différence essentielle avec une structure à responsabilité limitée.',
    },
  ],
  relatedSlugs: [
    'creer-entreprise-batiment-suisse-guide-complet',
    'cout-creation-entreprise-construction-suisse',
    'immatriculer-entreprise-construction-registre-commerce',
    'avs-ai-independant-batiment',
  ],
};
