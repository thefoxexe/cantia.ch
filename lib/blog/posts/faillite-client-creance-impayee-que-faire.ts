import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'faillite-client-creance-impayee-que-faire',
  question: 'Que devient une créance impayée quand un client fait faillite ?',
  title: 'Un client fait faillite : que devient votre créance impayée',
  description:
    'Ce que devient une créance impayée lorsqu’un client fait faillite : comment produire sa créance et pourquoi la situation diffère d’un simple impayé.',
  excerpt:
    'Quand un client fait faillite, la simple relance ne suffit plus. Voici comment fonctionne la procédure et ce que vous pouvez réellement récupérer.',
  category: 'Juridique & normes',
  keywords: ['créance impayée faillite client', 'produire créance faillite suisse'],
  publishedAt: '2026-10-10',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Un client qui refuse de payer et un client qui fait faillite sont deux situations juridiquement très différentes. Dans le premier cas, c’est un désaccord à résoudre. Dans le second, l’entreprise n’a en général plus la capacité de payer du tout, et la question devient : que reste-t-il à récupérer, et comment.',
    },
    { type: 'h2', text: 'Le mécanisme général' },
    {
      type: 'p',
      text: 'Lorsqu’un client fait faillite, l’ensemble de ses créanciers doit produire sa créance auprès de l’office des poursuites ou de l’administration de la faillite, dans le délai fixé par la publication officielle. Les créances sont ensuite classées par rang — certaines créances (salariales notamment) sont généralement prioritaires, les créances commerciales ordinaires arrivent souvent dans un rang inférieur. En pratique, les créanciers de rang inférieur récupèrent souvent peu, voire rien, une fois les créanciers prioritaires et les frais de la procédure payés.',
    },
    { type: 'h2', text: 'Pourquoi agir vite et bien documenter compte' },
    {
      type: 'list',
      items: [
        'Produire sa créance dans les délais est indispensable — une créance produite trop tard risque d’être écartée de la procédure',
        'Documenter la créance avec précision (factures, contrats, échanges) facilite son admission dans le classement',
        'Surveiller les premiers signes de difficulté d’un client (retards de paiement répétés, changements soudains dans les commandes) permet parfois d’agir avant l’ouverture de la faillite',
      ],
    },
    { type: 'h2', text: 'En quoi c’est différent d’une poursuite ordinaire' },
    {
      type: 'p',
      text: 'Une poursuite classique pour une facture impayée suppose que le débiteur est solvable mais ne paie pas. La faillite change fondamentalement la donne : ce n’est plus une question de volonté de payer, mais de capacité. La procédure devient collective — tous les créanciers sont traités ensemble selon un ordre légal — plutôt qu’individuelle comme dans une poursuite classique.',
    },
    {
      type: 'callout',
      title: 'Ne comptez pas sur une récupération intégrale',
      text: 'Sauf créance privilégiée, il est réaliste de s’attendre à ne récupérer qu’une fraction de la créance, parfois rien du tout. Le rôle principal de la production de créance est de garder une trace officielle et de ne pas être écarté de la répartition si un montant est finalement disponible.',
    },
    {
      type: 'cta',
      title: 'Repérez les signaux de risque avant qu’un client ne devienne insolvable',
      text: 'Cantia suit vos factures et vos délais de paiement client par client, pour repérer un retard qui se répète avant qu’il ne devienne une créance perdue.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Que faire si mon client refuse de payer mais n’est pas en faillite ?',
      answer:
        'C’est une situation différente, à traiter par la voie de la poursuite ordinaire pour facture impayée plutôt que par une production de créance. Consultez notre article sur la procédure de poursuite en Suisse pour la marche à suivre.',
    },
    {
      question: 'Dans quel délai faut-il produire sa créance lors d’une faillite ?',
      answer:
        'Le délai est fixé par la publication officielle de la faillite et varie selon les cas. Il est généralement de l’ordre de quelques semaines — vérifiez la publication précise ou consultez votre fiduciaire ou un avocat pour ne pas le manquer.',
    },
    {
      question: 'Peut-on récupérer sa créance plus vite en agissant tôt, avant la faillite ?',
      answer:
        'Dans certains cas, oui — une poursuite engagée avant l’ouverture de la faillite peut aboutir à une saisie de biens si le débiteur a encore des actifs. Une fois la faillite ouverte, la procédure devient collective et une démarche individuelle n’est plus possible.',
    },
  ],
  relatedSlugs: [
    'client-refuse-payer-solde-final-que-faire',
    'poursuite-facture-impayee-procedure-suisse',
    'saisie-conservatoire-creance-impayee-batiment',
  ],
};
