import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'expertise-judiciaire-malfacon-construction-suisse',
  question: 'Comment se déroule une expertise judiciaire en cas de malfaçon de construction ?',
  title: 'Expertise judiciaire en cas de malfaçon : comment ça se passe',
  description:
    'Comment se déroule une expertise judiciaire en cas de désaccord sur une malfaçon de construction, et pourquoi bien documenter le chantier facilite tout.',
  excerpt:
    'Quand les parties ne s’entendent pas sur la cause d’un défaut de construction, l’expertise judiciaire tranche techniquement. Voici comment elle se déroule.',
  category: 'Juridique & normes',
  keywords: ['expertise judiciaire malfaçon construction', 'expert bâtiment litige technique'],
  publishedAt: '2026-10-10',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Un défaut de construction découvert après réception soulève d’abord une question : qui doit payer. Mais avant même d’en arriver là, il faut souvent déterminer avec certitude d’où vient le défaut et quelle en est l’ampleur réelle — c’est le rôle de l’expertise judiciaire lorsque les parties ne s’accordent pas.',
    },
    { type: 'h2', text: 'Quand une expertise devient nécessaire' },
    {
      type: 'p',
      text: 'L’expertise judiciaire intervient généralement quand il existe un désaccord technique entre les parties : le maître d’ouvrage estime qu’un défaut vient d’une malfaçon, l’entrepreneur estime qu’il vient d’un autre corps de métier ou d’un usage inapproprié. Sans accord amiable sur la cause, une expertise neutre permet d’établir les faits sur une base technique plutôt que sur des versions contradictoires.',
    },
    { type: 'h2', text: 'Le rôle de l’expert' },
    {
      type: 'list',
      items: [
        'Un expert neutre, nommé par le tribunal ou choisi d’un commun accord entre les parties',
        'Il examine le chantier, les matériaux utilisés et les conditions d’exécution pour déterminer la cause probable du défaut',
        'Son rapport sert de base technique à la suite de la procédure, qu’elle soit judiciaire ou qu’elle débouche sur un accord amiable',
      ],
    },
    { type: 'h2', text: 'Pourquoi documenter le chantier en amont change tout' },
    {
      type: 'p',
      text: 'Une expertise se déroule presque toujours mieux lorsque le chantier a été documenté au fil de son avancement : photos datées, rapports de chantier, échanges écrits sur les choix techniques. Sans cette trace, l’expert doit reconstituer les faits a posteriori, ce qui est plus long et laisse davantage de place à l’interprétation. Cette documentation profite à l’entrepreneur comme au maître d’ouvrage, selon de quel côté se trouve la responsabilité réelle.',
    },
    {
      type: 'callout',
      title: 'L’expertise établit la cause, pas automatiquement qui paie',
      text: 'Une expertise judiciaire détermine généralement l’origine technique d’un défaut. La question de la responsabilité et du paiement qui en découle peut nécessiter une étape juridique supplémentaire — consultez un avocat pour la suite selon les conclusions de l’expertise.',
    },
    {
      type: 'cta',
      title: 'Gardez une trace complète de chaque chantier, dès le premier jour',
      text: 'Cantia conserve photos, rapports et échanges par chantier au même endroit — une documentation précieuse en cas de désaccord technique à faire trancher plus tard.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Qui paie les frais de l’expertise judiciaire ?',
      answer:
        'Généralement la partie qui la demande en fait l’avance, puis les frais sont répartis selon l’issue de la procédure. Les règles précises varient selon les cas — consultez un avocat pour votre situation.',
    },
    {
      question: 'Peut-on contester les conclusions d’un expert judiciaire ?',
      answer:
        'Oui, généralement en demandant un complément d’expertise ou une contre-expertise si les conclusions semblent erronées ou incomplètes, mais cela allonge la procédure. À évaluer avec votre avocat selon le cas.',
    },
    {
      question: 'Une expertise amiable, hors tribunal, a-t-elle la même valeur ?',
      answer:
        'Une expertise amiable, réalisée d’un commun accord entre les parties, peut suffire à résoudre un désaccord sans procédure judiciaire, mais elle a généralement moins de poids qu’une expertise judiciaire si le litige finit tout de même devant un tribunal.',
    },
  ],
  relatedSlugs: [
    'defaut-construction-decouvert-apres-reception-qui-paie',
    'litige-chantier-mediation-ou-tribunal',
    'arbitrage-sia-mediation-professionnelle-batiment',
  ],
};
