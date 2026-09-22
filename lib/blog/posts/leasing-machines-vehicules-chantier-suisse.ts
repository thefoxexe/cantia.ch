import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'leasing-machines-vehicules-chantier-suisse',
  question: 'Faut-il privilégier le leasing ou l’achat pour les machines et véhicules de chantier ?',
  title: 'Leasing ou achat pour les machines et véhicules de chantier',
  description:
    'Avantages et inconvénients du leasing et de l’achat pour les machines et véhicules de chantier, et les critères concrets pour trancher selon la situation de l’entreprise.',
  excerpt:
    'La question revient à chaque renouvellement de flotte ou de parc machines, et la bonne réponse dépend rarement du prix affiché, mais de la fréquence d’usage réelle.',
  category: 'Chantier & rentabilité',
  keywords: [
    'leasing machines chantier suisse',
    'leasing vehicule utilitaire entreprise batiment',
    'achat ou leasing materiel construction',
  ],
  publishedAt: '2026-10-07',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Un nouveau fourgon, une pelle mécanique, une nacelle : à chaque renouvellement de matériel, la même question revient. Le leasing et l’achat répondent tous les deux à un besoin réel, mais rarement au même profil d’entreprise ni au même usage.',
    },
    { type: 'h2', text: 'Les avantages du leasing' },
    {
      type: 'list',
      items: [
        'Pas de gros capital immobilisé d’un coup, ce qui préserve la trésorerie disponible pour les chantiers en cours.',
        'Le matériel est renouvelé régulièrement, ce qui limite le risque de panne sur un équipement vieillissant en pleine saison chargée.',
        'Les mensualités sont prévisibles et faciles à intégrer dans un budget mensuel.',
      ],
    },
    { type: 'h2', text: 'Les avantages de l’achat' },
    {
      type: 'list',
      items: [
        'Le coût total sur la durée de vie du matériel est souvent inférieur à celui d’un leasing équivalent, une fois toutes les mensualités additionnées.',
        'Aucune contrainte de kilométrage ou d’heures d’utilisation à respecter, contrairement à de nombreux contrats de leasing.',
        'Le matériel reste un actif de l’entreprise, qui peut être revendu ou continuer à être utilisé au-delà de la durée initialement prévue.',
      ],
    },
    { type: 'h2', text: 'Les critères concrets pour trancher' },
    {
      type: 'table',
      headers: ['Critère', 'Plutôt leasing', 'Plutôt achat'],
      rows: [
        ['Fréquence d’utilisation', 'Usage ponctuel ou saisonnier', 'Usage quotidien et intensif'],
        ['Âge de l’entreprise', 'Jeune entreprise, trésorerie limitée', 'Entreprise établie, capacité d’investissement'],
        ['Durée de vie souhaitée du matériel', 'Renouvellement fréquent souhaité', 'Utilisation longue durée prévue'],
        ['Trésorerie disponible', 'Trésorerie serrée', 'Trésorerie confortable'],
      ],
    },
    {
      type: 'callout',
      title: 'Le vrai calcul à faire : le coût par heure d’utilisation réelle',
      text: 'Comparer un loyer mensuel de leasing à un prix d’achat ne dit rien de la rentabilité réelle. Le bon calcul rapporte le coût total, leasing ou achat, aux heures d’utilisation effective de la machine sur l’année. Un équipement peu utilisé coûte souvent moins cher en leasing, même si le prix affiché semble plus élevé sur le papier.',
    },
    {
      type: 'cta',
      title: 'Suivez le vrai coût de votre matériel, chantier après chantier',
      text: 'Savoir combien un véhicule ou une machine coûte réellement par chantier aide à décider entre leasing et achat en connaissance de cause. Cantia aide à suivre la rentabilité réelle de chaque chantier, matériel compris.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Le leasing est-il toujours plus cher que l’achat sur le long terme ?',
      answer:
        'En général oui, sur la durée totale de vie du matériel, mais pas systématiquement une fois pris en compte l’entretien, la revente et le risque de panne d’un matériel ancien. Le calcul dépend fortement de l’usage réel.',
    },
    {
      question: 'Peut-on mixer leasing et achat au sein d’une même flotte ?',
      answer:
        'Oui, c’est même une pratique courante : acheter le matériel utilisé quotidiennement et intensément, et louer en leasing ou à la demande le matériel utilisé ponctuellement ou pour des besoins spécifiques.',
    },
    {
      question: 'Le leasing a-t-il un impact sur la capacité d’emprunt de l’entreprise ?',
      answer:
        'Cela peut jouer, selon la structure du contrat et la façon dont il est comptabilisé, sur l’appréciation de l’endettement par une banque lors d’une demande de crédit ultérieure. Il vaut la peine d’en discuter avec son fiduciaire.',
    },
  ],
  relatedSlugs: [
    'ligne-de-credit-tresorerie-pme-batiment',
    'assurance-bris-machine-outillage-chantier',
    'marge-beneficiaire-entreprise-batiment-suisse',
  ],
};
