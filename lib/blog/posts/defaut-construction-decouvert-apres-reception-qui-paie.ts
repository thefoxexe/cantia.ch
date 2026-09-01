import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'defaut-construction-decouvert-apres-reception-qui-paie',
  question: 'Un défaut de construction découvert après la réception : qui paie la réparation ?',
  title: 'Défaut découvert après réception du chantier : qui paie ?',
  description:
    'Un défaut caché découvert des mois après la réception reste à la charge de l’entrepreneur s’il est signalé à temps. Ce que change la réforme du droit de la garantie en 2026.',
  excerpt:
    'La réception d’un chantier ne clôt jamais tout : un défaut caché découvert plus tard reste à la charge de l’entrepreneur, à une condition précise que tout le monde ignore.',
  category: 'Juridique & normes',
  keywords: ['défaut caché', 'réception ouvrage', 'garantie chantier', 'responsabilité entrepreneur', 'malfaçon'],
  publishedAt: '2026-03-09',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Le client signe la réception, tout semble en ordre. Puis huit mois plus tard, une fissure apparaît, ou une infiltration se déclare derrière un doublage refermé. La réception n’efface pas la responsabilité de l’entrepreneur pour ce genre de défaut : c’est précisément ce que le régime de garantie de 5 ans est censé couvrir.',
    },
    { type: 'h2', text: 'Défaut apparent vs défaut caché : la distinction qui décide de tout' },
    {
      type: 'p',
      text: 'Un défaut visible au moment de la réception doit être signalé sur-le-champ ; à défaut, le client est réputé l’avoir accepté tel quel, sauf clause contraire. Un défaut caché, non détectable lors d’une vérification normale, reste couvert par le délai de garantie même après une réception sans réserve.',
    },
    {
      type: 'callout',
      title: 'La condition qui fait basculer la responsabilité',
      text: 'Depuis la réforme du droit de la garantie entrée en vigueur en 2026, un défaut caché doit être signalé dans les 60 jours suivant sa découverte. Un client qui attend six mois après avoir remarqué le problème risque de perdre son droit à réparation, et ce même si le défaut lui-même reste dans le délai de garantie de 5 ans.',
    },
    { type: 'h2', text: 'Ce qui détermine qui paie' },
    {
      type: 'list',
      items: [
        'Le défaut est-il apparent ou caché ? Un défaut apparent non signalé à la réception se perd généralement',
        'A-t-il été signalé dans les 60 jours suivant sa découverte pour un défaut caché ?',
        'Le chantier est-il encore dans le délai de prescription de 5 ans (10 ans en cas de dissimulation intentionnelle) ?',
        'Le défaut résulte-t-il d’un vice d’exécution de l’entrepreneur, ou d’un mauvais usage postérieur par le client (la charge de la preuve joue ici un rôle décisif)',
      ],
    },
    { type: 'h2', text: 'Se protéger des deux côtés' },
    {
      type: 'p',
      text: 'Un procès-verbal de réception détaillé, accompagné de photos datées de chaque zone du chantier, protège autant l’entrepreneur (preuve de l’état réel à la remise) que le client (référence en cas de litige ultérieur). C’est le document le plus sous-utilisé du secteur : souvent réduit à une signature rapide en fin de visite, alors qu’il devient la pièce centrale si un défaut ressurgit des mois plus tard.',
    },
    {
      type: 'cta',
      title: 'Chaque étape du chantier, documentée automatiquement',
      text: 'Les rapports Cantia horodatent et géolocalisent chaque photo prise sur le chantier. C’est la trace la plus solide en cas de litige de garantie, sans effort de classement supplémentaire.',
      buttonLabel: 'Découvrir les rapports de chantier',
    },
  ],
  faq: [
    {
      question: 'Un client peut-il réclamer un défaut découvert un an après la réception ?',
      answer:
        'Oui, s’il s’agit d’un défaut caché non détectable lors d’une vérification normale à la réception, et à condition de le signaler dans les 60 jours suivant sa découverte, dans le délai de prescription de 5 ans.',
    },
    {
      question: 'Que se passe-t-il si un défaut apparent n’a pas été signalé à la réception ?',
      answer:
        'Il est en principe réputé accepté par le client, sauf clause contraire prévue au contrat, ce qui explique l’intérêt d’un procès-verbal de réception détaillé listant précisément ce qui a été vérifié.',
    },
    {
      question: 'Quel est le délai pour signaler un défaut caché depuis la réforme 2026 ?',
      answer:
        '60 jours à compter de sa découverte, un cadre plus précis que l’ancienne exigence de signalement « immédiat ». Un retard peut faire perdre le droit à réparation même dans le délai de garantie global.',
    },
  ],
  relatedSlugs: [
    'garantie-travaux-construction-2-ou-5-ans',
    'norme-sia-118-devis-obligatoire',
    'assurance-rc-professionnelle-batiment-obligatoire',
  ],
};
