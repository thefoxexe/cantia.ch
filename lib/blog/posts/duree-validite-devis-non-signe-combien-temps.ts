import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'duree-validite-devis-non-signe-combien-temps',
  question: 'Combien de temps un devis non signé reste-t-il valable avant qu’il faille le refaire ?',
  title: 'Combien de temps un devis reste valable en Suisse (et pourquoi le préciser change tout)',
  description:
    'Sans mention explicite, un devis non signé n’a pas de durée de validité légale fixe, ce qui expose l’entreprise à devoir honorer un prix ancien alors que matériaux et main-d’œuvre ont entretemps augmenté.',
  excerpt:
    'Sauf si le document précisait explicitement une date limite, un client qui revient trois mois plus tard avec « votre devis » peut légitimement s’attendre au même prix.',
  category: 'Devis & facturation',
  keywords: ['durée validité devis', 'devis non signé délai', 'devis expiré', 'combien de temps devis valable', 'validité offre de prix'],
  publishedAt: '2026-06-09',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Un devis engage l’entreprise qui l’émet, mais rien dans le Code des obligations ne fixe automatiquement une durée de validité. Sans mention explicite sur le document, un client peut légitimement considérer que le prix reste applicable des mois plus tard, même si le coût des matériaux ou de la main-d’œuvre a entretemps augmenté.',
    },
    { type: 'h2', text: 'Pourquoi une date de validité explicite protège l’entreprise' },
    {
      type: 'list',
      items: [
        'Le prix des matériaux fluctue, parfois fortement, sur des délais de quelques mois : un devis sans échéance fige un risque financier',
        'Un chantier accepté tardivement peut ne plus être compatible avec le planning ou la disponibilité de l’équipe',
        'Sans limite claire, un client peut exiger le prix initial même après un an, en l’absence de contestation formelle de l’entreprise',
      ],
    },
    {
      type: 'stat',
      value: '30 jours',
      label: 'durée de validité la plus courante pour un devis de travaux du bâtiment en Suisse (un choix d’usage, pas une obligation légale)',
    },
    { type: 'h2', text: 'Comment le formuler correctement' },
    {
      type: 'p',
      text: 'Une simple phrase suffit : « Ce devis est valable 30 jours à compter de sa date d’émission. Passé ce délai, une réévaluation des prix pourra être nécessaire. » Cette mention transforme une ambiguïté potentielle en règle claire, acceptée par le client au moment de la lecture du document, sans négociation ultérieure nécessaire.',
    },
    {
      type: 'callout',
      title: 'La durée de validité et la validité juridique du devis sont deux choses différentes',
      text: 'Un devis reste juridiquement engageant tant qu’il n’est pas retiré, même après sa date de validité indicative. La mention protège surtout la cohérence du prix, pas l’existence même de l’engagement.',
    },
    {
      type: 'cta',
      title: 'Une date de validité appliquée automatiquement',
      text: 'Cantia calcule et affiche la durée de validité de chaque devis à partir des paramètres de votre entreprise, sans avoir à y penser à chaque document.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Un devis a-t-il une durée de validité légale fixe en Suisse ?',
      answer:
        'Non, aucune loi ne fixe de durée automatique : sans mention explicite sur le document, le devis peut rester considéré comme valable indéfiniment.',
    },
    {
      question: 'Quelle durée de validité choisir pour un devis de travaux ?',
      answer:
        '30 jours est l’usage le plus courant dans le bâtiment suisse, mais rien n’empêche d’adapter ce délai selon la volatilité des prix du chantier concerné.',
    },
    {
      question: 'Que se passe-t-il si un client accepte un devis après sa date de validité ?',
      answer:
        'L’entreprise peut demander une réévaluation du prix, à condition que la mention de validité figurait clairement sur le document initial.',
    },
  ],
  relatedSlugs: [
    'validite-devis-signe-prix-qui-bouge',
    'rediger-devis-qui-inspire-confiance-client',
    'devis-gratuit-ou-payant-que-dit-la-loi',
  ],
};
