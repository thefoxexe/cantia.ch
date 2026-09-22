import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'action-garantie-sous-traitant-entrepreneur-general',
  question: 'Comment fonctionne l’action en garantie entre un sous-traitant et un entrepreneur général ?',
  title: 'Action en garantie entre sous-traitant et entrepreneur général',
  description:
    'Comment fonctionne l’action en garantie entre un sous-traitant et un entrepreneur général en cas de défaut, et pourquoi une assurance RC pro propre est essentielle.',
  excerpt:
    'Quand un défaut est découvert, la responsabilité peut remonter toute la chaîne du chantier. Voici comment fonctionne l’action en garantie entre entrepreneur général et sous-traitant.',
  category: 'Juridique & normes',
  keywords: ['action en garantie sous-traitant', 'responsabilité entrepreneur général sous-traitant'],
  publishedAt: '2026-10-10',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Sur un chantier avec plusieurs niveaux d’intervenants, un défaut découvert ne s’arrête pas toujours au premier responsable apparent. L’action en garantie permet à chaque maillon de la chaîne de se retourner vers celui qui a réellement exécuté la partie défectueuse.',
    },
    { type: 'h2', text: 'La chaîne de responsabilité' },
    {
      type: 'p',
      text: 'Dans une relation classique de sous-traitance, le maître d’ouvrage n’a de lien contractuel qu’avec l’entrepreneur général, pas avec les sous-traitants. Si un défaut est découvert, c’est donc l’entrepreneur général qui répond d’abord envers le maître d’ouvrage — même si le défaut provient du travail d’un sous-traitant. L’entrepreneur général peut ensuite se retourner contre ce sous-traitant par une action en garantie, pour lui faire porter la responsabilité de sa propre exécution.',
    },
    { type: 'h2', text: 'Pourquoi documenter qui a fait quoi devient essentiel' },
    {
      type: 'list',
      items: [
        'Savoir précisément quelle entreprise a exécuté quelle partie du chantier, avec des dates et des rapports',
        'Conserver les échanges sur les choix techniques, notamment si le sous-traitant a signalé un risque ou une réserve',
        'Garder une trace des réceptions partielles de travaux, poste par poste, quand c’est possible',
      ],
    },
    { type: 'h2', text: 'L’importance d’une assurance RC pro propre au sous-traitant' },
    {
      type: 'p',
      text: 'Un sous-traitant qui compte uniquement sur l’assurance responsabilité civile professionnelle de l’entrepreneur général prend un risque important : en cas d’action en garantie, c’est sa propre responsabilité qui est engagée, et sans sa propre couverture, le montant réclamé pourrait devoir sortir directement de sa trésorerie. Une assurance RC pro propre à l’entreprise reste la protection la plus fiable dans ce type de situation.',
    },
    {
      type: 'callout',
      title: 'Le contrat de sous-traitance doit clarifier la répartition des responsabilités',
      text: 'Un contrat de sous-traitance bien rédigé précise les limites de la mission du sous-traitant et les responsabilités qui lui incombent spécifiquement. Cela facilite considérablement une action en garantie ultérieure, dans un sens comme dans l’autre.',
    },
    {
      type: 'cta',
      title: 'Sachez précisément qui a fait quoi sur chaque chantier',
      text: 'Cantia trace l’avancement du chantier par intervenant, avec dates et documents associés — une base utile en cas de désaccord sur une responsabilité à établir.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Le maître d’ouvrage peut-il agir directement contre un sous-traitant ?',
      answer:
        'En général non, faute de lien contractuel direct entre eux — le maître d’ouvrage agit contre l’entrepreneur général, qui se retourne ensuite lui-même contre le sous-traitant concerné si nécessaire.',
    },
    {
      question: 'Dans quel délai une action en garantie peut-elle être engagée ?',
      answer:
        'Cela dépend des délais de garantie prévus au contrat et des règles de prescription applicables, qui varient selon les cas. Consultez un avocat pour évaluer les délais précis de votre situation.',
    },
    {
      question: 'Une clause contractuelle peut-elle limiter la responsabilité d’un sous-traitant ?',
      answer:
        'Dans une certaine mesure, oui, selon ce que prévoit le contrat de sous-traitance. Mais certaines limitations peuvent être contestées selon les circonstances — à vérifier avec un avocat lors de la rédaction du contrat.',
    },
  ],
  relatedSlugs: [
    'difference-sia-108-sia-118-devis-contrat',
    'defaut-construction-decouvert-apres-reception-qui-paie',
    'expertise-judiciaire-malfacon-construction-suisse',
  ],
};
