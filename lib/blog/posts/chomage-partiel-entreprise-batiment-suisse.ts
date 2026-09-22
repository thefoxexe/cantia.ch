import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'chomage-partiel-entreprise-batiment-suisse',
  question: 'Quand et comment demander le chômage partiel pour une entreprise du bâtiment ?',
  title: 'Chômage partiel dans le bâtiment : quand et comment le demander',
  description:
    'Réduction de l’horaire de travail (RHT) pour raisons économiques dans le bâtiment : conditions, démarche auprès de l’autorité cantonale, et différence avec le chômage-intempéries.',
  excerpt:
    'Le chômage partiel n’est pas réservé aux crises majeures : c’est un outil concret pour traverser un creux d’activité sans devoir licencier.',
  category: 'RH & salaires',
  keywords: ['chômage partiel', 'RHT', 'bâtiment', 'entreprise', 'licenciement'],
  publishedAt: '2026-09-28',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Un carnet de commandes qui se vide temporairement ne doit pas forcément se traduire par des licenciements. Le chômage partiel, aussi appelé réduction de l’horaire de travail (RHT), est prévu précisément pour ce type de situation.',
    },
    { type: 'h2', text: '1. RHT et chômage-intempéries : deux dispositifs différents' },
    {
      type: 'p',
      text: 'Il est important de ne pas confondre le chômage partiel pour raisons économiques (RHT) avec le chômage-intempéries, propre au bâtiment, qui indemnise l’impossibilité de travailler à cause de conditions météorologiques (gel, fortes pluies, neige). La RHT, elle, concerne une baisse d’activité liée à des raisons économiques, indépendamment de la météo : baisse de commandes, retard de projets, difficultés d’un client important.',
    },
    { type: 'h2', text: '2. Les conditions générales' },
    {
      type: 'list',
      items: [
        'La perte de travail doit être temporaire et il doit exister une perspective raisonnable de reprise de l’activité normale.',
        'La perte de travail ne doit pas être évitable par d’autres moyens raisonnables à disposition de l’entreprise.',
        'Un préavis auprès de l’autorité cantonale compétente est généralement requis avant de pouvoir réduire l’horaire de travail des employés concernés.',
        'Les employés concernés doivent en principe donner leur accord, ou à défaut ne pas s’y opposer, selon les modalités applicables.',
      ],
    },
    { type: 'h2', text: '3. La démarche à suivre' },
    {
      type: 'p',
      text: 'La demande de réduction de l’horaire de travail se dépose auprès de l’autorité cantonale compétente en matière de marché du travail, généralement avant la période concernée. Les délais, formulaires et pièces justificatives exacts varient et sont régulièrement mis à jour : il est recommandé de consulter directement le site de l’autorité cantonale ou de se faire accompagner par sa fiduciaire ou son association professionnelle pour ne pas voir la demande retardée ou refusée pour un motif de forme.',
    },
    {
      type: 'callout',
      title: 'Pourquoi anticiper change tout',
      text: 'Une demande de RHT déposée dans les délais et bien documentée a généralement plus de chances d’aboutir sans accroc qu’une demande faite dans l’urgence après avoir déjà réduit l’activité. Dès les premiers signes d’un creux d’activité durable, mieux vaut se renseigner tôt plutôt que d’attendre d’être acculé.',
    },
    {
      type: 'cta',
      title: 'Une visibilité claire sur votre charge de travail, avant qu’un creux ne surprenne',
      text: 'Cantia vous donne une vue d’ensemble sur vos chantiers en cours et à venir, pour repérer un creux d’activité suffisamment tôt et décider sereinement des options disponibles.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Quelle est la différence entre le chômage partiel et le chômage-intempéries ?',
      answer:
        'Le chômage-intempéries indemnise l’impossibilité de travailler à cause de conditions météorologiques défavorables, spécifique au bâtiment. Le chômage partiel (RHT) couvre une baisse d’activité pour raisons économiques, indépendamment de la météo.',
    },
    {
      question: 'Faut-il l’accord des employés pour mettre en place le chômage partiel ?',
      answer:
        'En principe oui, les employés concernés doivent donner leur accord ou à défaut ne pas s’y opposer, selon les modalités applicables. Il est recommandé de bien communiquer avec les équipes avant le dépôt de la demande.',
    },
    {
      question: 'Combien de temps avant faut-il déposer une demande de RHT ?',
      answer:
        'Un préavis est généralement requis avant la période concernée, mais le délai exact et les démarches varient et sont régulièrement mis à jour par les autorités cantonales. Il est conseillé de se renseigner directement auprès de l’autorité compétente ou de sa fiduciaire.',
    },
  ],
  relatedSlugs: [
    'licenciement-ouvrier-batiment-delai-conge-cct',
    'salaire-minimum-cct-construction-suisse',
    'marge-beneficiaire-entreprise-batiment-suisse',
  ],
};
