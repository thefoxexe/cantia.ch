import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'calculer-acomptes-impots-independant-batiment',
  question: 'Comment calculer ses acomptes d’impôts en tant qu’indépendant du bâtiment ?',
  title: 'Comment calculer ses acomptes d’impôts quand on est indépendant du bâtiment',
  description:
    'Acomptes provisoires, estimation du revenu, risque de la première année sans historique : comment provisionner correctement ses impôts en tant qu’indépendant du bâtiment.',
  excerpt:
    'La première année est la plus risquée : sans historique, l’administration fiscale estime, et l’écart avec la réalité se rattrape parfois d’un coup. Voici comment éviter la mauvaise surprise.',
  category: 'Juridique & normes',
  keywords: [
    'acomptes impôts indépendant bâtiment',
    'calculer acompte impôt entreprise individuelle',
    'provisionner impôts artisan suisse',
    'acompte provisoire impôt cantonal',
    'différence acompte avs impôt',
  ],
  publishedAt: '2026-09-22',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Contrairement à un salarié, dont l’impôt est prélevé mois après mois via la source ou ajusté automatiquement, un indépendant du bâtiment doit lui-même provisionner ses impôts. L’administration fiscale cantonale envoie des acomptes provisoires, mais ces acomptes reposent sur une estimation, pas sur le revenu réel de l’année en cours, et c’est précisément là que se cache le risque.',
    },
    { type: 'h2', text: 'Comment sont calculés les acomptes provisoires' },
    {
      type: 'p',
      text: 'Pour une activité déjà établie, l’administration fiscale cantonale fixe généralement les acomptes sur la base du revenu déclaré l’année précédente, ajusté d’un facteur d’indexation. C’est un mécanisme automatique, pratique quand le revenu est stable, mais qui devient trompeur si l’activité progresse ou recule fortement d’une année à l’autre.',
    },
    { type: 'h2', text: 'Le piège de la première année d’activité' },
    {
      type: 'p',
      text: 'Sans historique, l’administration fiscale ne peut pas se baser sur une déclaration précédente : elle demande une estimation de revenu, souvent fournie par l’indépendant lui-même au moment de l’annonce d’activité. Si cette estimation est basse, volontairement ou par prudence, les acomptes de la première année seront faibles, mais l’impôt réel, calculé ensuite sur le revenu effectif, peut créer un rattrapage important une fois la déclaration définitive traitée, parfois plus d’un an après le début de l’activité.',
    },
    { type: 'h2', text: 'Le réflexe qui évite le rattrapage douloureux' },
    {
      type: 'list',
      items: [
        'Provisionner chaque mois un pourcentage du chiffre d’affaires encaissé sur un compte séparé, plutôt que d’attendre la facture d’acompte.',
        'Réviser l’estimation transmise à l’administration fiscale dès que l’activité dépasse nettement les prévisions initiales, pour ajuster les acomptes en cours d’année.',
        'Ne pas confondre les acomptes d’impôts cantonaux/communaux avec les acomptes AVS : ce sont deux mécanismes distincts, gérés par deux administrations différentes, avec des règles de calcul propres.',
      ],
    },
    {
      type: 'callout',
      title: 'Deux acomptes, deux administrations, deux calendriers',
      text: 'Les acomptes AVS sont gérés par la caisse de compensation et calculés sur le revenu de l’activité indépendante ; les acomptes d’impôts sont gérés par l’administration fiscale cantonale. Provisionner pour l’un ne dispense jamais de provisionner pour l’autre, une confusion fréquente en première année d’indépendance.',
    },
    {
      type: 'stat',
      value: 'Plus d’un an',
      label: 'peut s’écouler entre le début de l’activité et le calcul définitif de l’impôt, d’où le risque de rattrapage en première année',
    },
    {
      type: 'cta',
      title: 'Une trésorerie qui provisionne, pas qui subit',
      text: 'En suivant précisément l’encaissement de chaque chantier dans Cantia, il devient plus simple de mettre de côté chaque mois la part destinée aux impôts et aux charges sociales, plutôt que de la découvrir à la facture d’acompte.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Peut-on demander une révision des acomptes en cours d’année ?',
      answer:
        'Oui, il est généralement possible de demander une adaptation des acomptes auprès de l’administration fiscale cantonale si le revenu réel s’écarte fortement de l’estimation initiale, à la hausse comme à la baisse.',
    },
    {
      question: 'Les acomptes AVS et les acomptes d’impôts se calculent-ils de la même façon ?',
      answer:
        'Non, ce sont deux calculs distincts gérés par deux entités différentes : la caisse de compensation pour l’AVS, l’administration fiscale cantonale pour l’impôt. Il ne faut provisionner ni l’un à la place de l’autre, ni un seul des deux.',
    },
    {
      question: 'Que se passe-t-il si l’estimation de la première année était trop basse ?',
      answer:
        'L’impôt définitif, calculé une fois la déclaration traitée, peut créer un rattrapage important à payer d’un coup. C’est pour cela qu’il vaut mieux provisionner un peu plus que l’estimation initiale plutôt que de viser juste au plus bas.',
    },
  ],
  relatedSlugs: [
    'avs-ai-independant-batiment',
    'lpp-deuxieme-pilier-independant-batiment',
    'previsionnel-tresorerie-entreprise-batiment',
  ],
};
