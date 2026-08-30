import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'automatiser-taches-repetitives-entreprise-sans-developpeur',
  question: 'Peut-on automatiser les tâches répétitives de son entreprise sans être développeur ?',
  title: 'Automatiser sans coder : ce qui est possible pour une entreprise du bâtiment',
  description:
    'L\'automatisation n\'est plus réservée aux entreprises avec un service informatique. Ce qui peut aujourd\'hui être automatisé dans une petite entreprise du bâtiment, sans écrire une ligne de code.',
  excerpt:
    'Automatiser fait souvent penser à des scripts compliqués ou des logiciels coûteux — pour une petite entreprise du bâtiment, ça peut simplement vouloir dire qu\'une relance de facture part toute seule, au bon moment.',
  category: 'Sur-mesure & automatisations',
  keywords: ['automatiser tâches entreprise sans développeur', 'automatisation PME bâtiment', 'automatiser sans coder', 'gagner du temps automatisation gestion', 'automatisation administrative artisan'],
  publishedAt: '2026-08-16',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'L\'automatisation évoque souvent des outils complexes réservés aux grandes entreprises avec un service informatique dédié. Pour une petite entreprise du bâtiment, l\'automatisation utile est souvent beaucoup plus simple : des tâches répétitives qui se déclenchent sans intervention manuelle.',
    },
    { type: 'h2', text: 'Des exemples concrets d\'automatisation déjà accessibles' },
    {
      type: 'list',
      items: [
        'Une relance de facture impayée envoyée automatiquement après un délai défini',
        'Une notification quand un devis approche de sa date de validité, pour relancer le client à temps',
        'Le calcul automatique de la rentabilité d\'un chantier dès que les heures et les dépenses sont saisies',
        'Un rapport de chantier généré automatiquement à partir des photos et notes déjà prises sur le terrain',
      ],
    },
    {
      type: 'stat',
      value: '3-6h',
      label: 'temps hebdomadaire économisé en moyenne par l\'automatisation des tâches administratives répétitives dans une petite entreprise du bâtiment',
    },
    { type: 'h2', text: 'La différence entre automatisation standard et automatisation sur mesure' },
    {
      type: 'p',
      text: 'Certaines automatisations existent déjà de façon standard dans un bon outil de gestion (relances, notifications). D\'autres, propres à la façon de travailler d\'une entreprise en particulier, peuvent être développées sur mesure — sans que l\'entreprise n\'ait besoin d\'embaucher un développeur pour ça.',
    },
    {
      type: 'callout',
      title: 'Automatiser, ce n\'est pas perdre le contrôle',
      text: 'Une bonne automatisation reste toujours visible et modifiable — une relance automatique peut être annulée manuellement si la situation le demande, elle ne remplace pas le jugement de l\'entreprise.',
    },
    {
      type: 'cta',
      title: 'Des automatisations déjà prêtes, et d\'autres possibles sur mesure',
      text: 'Cantia automatise déjà relances et notifications de base — et peut développer des automatisations propres à votre façon de travailler si besoin.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Faut-il des compétences techniques pour automatiser des tâches dans son entreprise du bâtiment ?',
      answer:
        'Non — de nombreuses automatisations (relances, notifications, calculs) existent déjà de façon standard dans un bon outil de gestion, sans nécessiter de compétences en programmation.',
    },
    {
      question: 'Quelles tâches peuvent être automatisées en priorité dans une petite entreprise du bâtiment ?',
      answer:
        'Les relances de factures impayées, les notifications de devis arrivant à expiration, et le calcul automatique de la rentabilité d\'un chantier sont parmi les automatisations les plus utiles au quotidien.',
    },
    {
      question: 'Une automatisation retire-t-elle le contrôle sur les décisions de l\'entreprise ?',
      answer:
        'Non, une bonne automatisation reste toujours visible et modifiable manuellement — elle accélère les tâches répétitives sans remplacer le jugement humain sur les décisions importantes.',
    },
  ],
  relatedSlugs: [
    'automatiser-rappels-relances-entreprise',
    'automatiser-suivi-administratif-entreprise-artisanale',
    'relancer-client-facture-impayee-sans-perdre-client',
  ],
};
