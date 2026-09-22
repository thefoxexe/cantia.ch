import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'saisie-conservatoire-creance-impayee-batiment',
  question: 'Qu’est-ce qu’une saisie conservatoire et quand l’utiliser contre un client qui ne paie pas ?',
  title: 'Saisie conservatoire : un outil méconnu contre un client qui ne paie pas',
  description:
    'Ce qu’est une saisie conservatoire (séquestre), quand l’utiliser face à un client qui ne paie pas, et en quoi elle diffère d’une poursuite ordinaire.',
  excerpt:
    'Face à un client qui semble vouloir disparaître avant de payer, la poursuite ordinaire peut arriver trop tard. La saisie conservatoire existe pour ce cas précis.',
  category: 'Juridique & normes',
  keywords: ['saisie conservatoire créance impayée', 'séquestre débiteur bâtiment suisse'],
  publishedAt: '2026-10-10',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Une facture impayée se traite en général par la voie normale de la poursuite. Mais il existe des situations plus urgentes, où attendre le déroulement complet d’une poursuite ordinaire risque de laisser le débiteur mettre ses actifs hors de portée avant même d’avoir pu être payé. C’est pour ce cas précis qu’existe la saisie conservatoire, aussi appelée séquestre.',
    },
    { type: 'h2', text: 'Quand c’est pertinent' },
    {
      type: 'p',
      text: 'La saisie conservatoire s’envisage quand il existe des signes concrets que le débiteur cherche à se rendre insolvable ou à disparaître — par exemple des indices de transfert de biens, de départ précipité à l’étranger, ou de dissimulation d’actifs. Ce n’est pas un outil à utiliser pour une simple facture en retard sans autre signal alarmant.',
    },
    { type: 'h2', text: 'En quoi c’est différent d’une poursuite ordinaire' },
    {
      type: 'list',
      items: [
        'La poursuite ordinaire suit un déroulement standard et prend du temps avant d’aboutir à une saisie de biens',
        'La saisie conservatoire est une mesure urgente et préventive, qui vise à bloquer des actifs avant qu’ils ne disparaissent',
        'Elle nécessite généralement l’intervention rapide d’un tribunal pour être autorisée, contrairement à l’ouverture d’une poursuite classique',
      ],
    },
    { type: 'h2', text: 'Un outil peu connu mais utile dans des cas précis' },
    {
      type: 'p',
      text: 'Beaucoup d’entreprises du bâtiment ignorent l’existence de cette possibilité, alors qu’elle peut faire une réelle différence face à un débiteur qui montre des signes clairs de vouloir échapper au paiement. Cela reste toutefois une mesure exceptionnelle, généralement plus coûteuse et plus complexe à mettre en œuvre qu’une poursuite classique, et qui suppose de pouvoir démontrer un risque réel devant un tribunal.',
    },
    {
      type: 'callout',
      title: 'La saisie conservatoire n’est pas la voie normale pour un simple retard de paiement',
      text: 'Pour une facture en retard sans signe d’insolvabilité imminente, la poursuite ordinaire reste la voie adaptée. La saisie conservatoire est réservée aux situations où il y a une urgence réelle à agir avant qu’un actif ne disparaisse.',
    },
    {
      type: 'cta',
      title: 'Repérez les signaux d’alerte avant qu’une créance ne devienne irrécupérable',
      text: 'Cantia suit vos factures et vos relances client par client, pour identifier tôt un client à risque plutôt que de le découvrir une fois la situation critique.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Faut-il un avocat pour demander une saisie conservatoire ?',
      answer:
        'Ce n’est pas toujours obligatoire, mais fortement recommandé compte tenu de la complexité de la démarche et de l’urgence d’agir correctement. Consultez un avocat pour évaluer si votre situation justifie cette mesure.',
    },
    {
      question: 'La saisie conservatoire garantit-elle le recouvrement de la créance ?',
      answer:
        'Non, elle bloque des actifs identifiés mais ne garantit pas leur valeur suffisante ni l’issue finale de la procédure de recouvrement, qui suit généralement son cours par la suite selon les voies ordinaires.',
    },
    {
      question: 'Peut-on demander une saisie conservatoire pour n’importe quel montant impayé ?',
      answer:
        'En théorie oui, mais en pratique elle est réservée aux cas où le risque de perte est réel et le montant justifie la démarche, compte tenu de son coût et de sa complexité. Pour un petit montant sans risque particulier, la poursuite ordinaire reste plus adaptée.',
    },
  ],
  relatedSlugs: [
    'poursuite-facture-impayee-procedure-suisse',
    'faillite-client-creance-impayee-que-faire',
    'prescription-facture-impayee-delai-10-ans',
  ],
};
