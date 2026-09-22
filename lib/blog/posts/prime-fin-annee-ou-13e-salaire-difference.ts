import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'prime-fin-annee-ou-13e-salaire-difference',
  question: 'Quelle est la différence entre une prime de fin d’année et le 13e salaire ?',
  title: 'Prime de fin d’année ou 13e salaire : quelle différence',
  description:
    'Le 13e salaire est généralement une obligation fixe, la prime de fin d’année reste discrétionnaire. Confondre les deux peut créer un litige le jour où un employé la considère comme acquise.',
  excerpt:
    'Un employé qui reçoit la même « prime » trois années de suite finit souvent par la considérer comme acquise. Encore faut-il que l’entreprise, elle, sache ce qu’elle a réellement promis.',
  category: 'RH & salaires',
  keywords: ['prime de fin d’année ou 13e salaire', 'différence prime 13e salaire', 'prime discrétionnaire bâtiment'],
  publishedAt: '2026-10-08',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Le 13e salaire et la prime de fin d’année se ressemblent au moment du versement — les deux arrivent souvent en fin d’année, sur la même fiche de salaire — mais leur nature juridique est très différente. Cette confusion, fréquente dans les petites entreprises du bâtiment, peut créer un vrai litige le jour où un employé considère une prime comme un droit acquis.',
    },
    { type: 'h2', text: 'Deux logiques différentes' },
    {
      type: 'p',
      text: 'Le 13e salaire est, dans la grande majorité des cas, une obligation contractuelle ou conventionnelle fixe : il découle du contrat de travail ou de la convention collective applicable, avec un montant et des règles de calcul déterminés à l’avance, indépendamment des résultats de l’entreprise. La prime de fin d’année, elle, relève en général d’une décision discrétionnaire de l’employeur, qui peut varier selon les résultats de l’entreprise, la conjoncture, ou même l’année en question.',
    },
    {
      type: 'table',
      headers: ['', '13e salaire', 'Prime de fin d’année'],
      rows: [
        ['Origine', 'Contrat de travail ou CCT', 'Décision de l’employeur'],
        ['Montant', 'Généralement fixe et prévisible', 'Variable selon les résultats'],
        ['Caractère', 'Dû, sauf exception explicite', 'Discrétionnaire en principe'],
      ],
    },
    { type: 'h2', text: 'Pourquoi la confusion peut coûter cher' },
    {
      type: 'p',
      text: 'Une prime versée de façon répétée et sans condition explicite, année après année, peut finir par être perçue — et parfois considérée juridiquement — comme un élément acquis du salaire, même si elle avait été pensée comme discrétionnaire au départ. C’est un terrain glissant : une entreprise qui souhaite garder une vraie flexibilité sur sa prime de fin d’année a intérêt à le formuler clairement, chaque année, plutôt que de laisser une habitude s’installer sans cadre écrit.',
    },
    {
      type: 'callout',
      title: 'Le mot compte autant que le montant',
      text: 'Appeler une prime « 13e salaire » sur une fiche de paie, même par simplicité de langage, peut créer une confusion durable sur sa nature réelle. Utiliser un intitulé distinct et rappeler, au moins verbalement, son caractère discrétionnaire évite ce type de malentendu.',
    },
    {
      type: 'cta',
      title: 'Clarifier ce qui est dû, chantier après chantier',
      text: 'Suivre la rentabilité réelle de chaque chantier aide aussi à décider, chaque fin d’année, si une prime discrétionnaire est réellement justifiée. Avec Cantia, la rentabilité par chantier reste visible en continu, pas seulement au moment du bilan annuel.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Un employeur est-il obligé de verser une prime de fin d’année ?',
      answer:
        'Non, contrairement au 13e salaire quand il est prévu par le contrat ou la CCT, une prime de fin d’année reste en principe discrétionnaire, sauf si l’entreprise l’a explicitement transformée en engagement contractuel.',
    },
    {
      question: 'Une prime versée plusieurs années de suite devient-elle obligatoire ?',
      answer:
        'Elle peut le devenir dans certaines situations si elle est versée de façon répétée et sans réserve explicite, ce qui peut créer une attente légitime chez l’employé. C’est pour cette raison qu’il vaut mieux formuler clairement son caractère discrétionnaire chaque année.',
    },
    {
      question: 'Comment calculer le 13e salaire d’un employé qui a travaillé une partie de l’année seulement ?',
      answer:
        'Le calcul suit en général un prorata basé sur la durée effective d’emploi durant l’année, selon les règles précises fixées par le contrat ou la convention collective applicable — un point traité en détail dans un article dédié au calcul du 13e salaire.',
    },
  ],
  relatedSlugs: [
    'calculer-13e-salaire-prorata-employe',
    'salaire-minimum-cct-construction-suisse',
    'entretien-annuel-employe-batiment-comment-faire',
  ],
};
