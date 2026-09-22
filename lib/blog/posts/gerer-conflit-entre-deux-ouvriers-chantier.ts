import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'gerer-conflit-entre-deux-ouvriers-chantier',
  question: 'Comment gérer un conflit entre deux ouvriers sur un chantier ?',
  title: 'Gérer un conflit entre deux ouvriers sur un chantier',
  description:
    'Pression des délais, proximité physique, fatigue : les tensions entre ouvriers sont fréquentes sur un chantier. Voici comment intervenir tôt et efficacement, avant que ça ne dégénère.',
  excerpt:
    'Un conflit entre deux ouvriers ne se résout presque jamais tout seul. Il s’enkyste, jusqu’à ce que le chantier entier en paie le prix.',
  category: 'RH & salaires',
  keywords: ['conflit entre ouvriers chantier', 'gérer conflit équipe bâtiment', 'tension chantier construction'],
  publishedAt: '2026-10-08',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Les tensions entre ouvriers sont plus fréquentes qu’on ne l’admet dans le bâtiment. La pression des délais, la proximité physique constante sur un chantier étroit, la fatigue accumulée sur plusieurs semaines : les ingrédients d’un conflit sont réunis presque en permanence, même dans une équipe globalement compétente et bien intentionnée.',
    },
    { type: 'h2', text: 'Pourquoi ces tensions apparaissent aussi souvent' },
    {
      type: 'p',
      text: 'Un chantier concentre des conditions rarement réunies ailleurs : un espace de travail restreint, des délais serrés qui laissent peu de place à l’erreur, une dépendance directe entre les tâches de chacun. Une remarque un peu sèche sur un travail mal fait, répétée plusieurs jours de suite, suffit parfois à transformer une simple friction en conflit ouvert.',
    },
    { type: 'h2', text: 'Intervenir tôt plutôt que d’espérer que ça passe' },
    {
      type: 'p',
      text: 'L’erreur la plus courante consiste à laisser la situation se résoudre d’elle-même, en espérant qu’elle s’apaise avec le temps. Dans la grande majorité des cas, elle empire au contraire, jusqu’à affecter la qualité du travail ou la sécurité sur le chantier. Un conflit visible depuis plusieurs jours mérite une intervention rapide, avant qu’il ne devienne un problème d’équipe entière plutôt qu’un différend entre deux personnes.',
    },
    {
      type: 'list',
      items: [
        'Écouter chaque personne séparément avant toute discussion commune, pour comprendre les deux versions sans arbitrage précipité',
        'Recentrer la discussion sur les faits et le travail concret, pas sur les personnalités ou le passif entre les deux personnes',
        'Fixer ensemble une règle claire pour la suite, même simple, plutôt qu’une réconciliation vague sans suite concrète',
        'Suivre la situation dans les jours qui suivent, sans considérer le sujet clos après une seule discussion',
      ],
    },
    {
      type: 'callout',
      title: 'Le rôle du patron n’est pas de juger qui a raison',
      text: 'Trancher sur qui a « raison » dans un conflit personnel dépasse rarement ce qui est utile. L’objectif réaliste est de rétablir des conditions de travail supportables pour les deux, pas de rendre un verdict sur leur relation.',
    },
    { type: 'h2', text: 'Quand la situation dépasse le rôle du patron' },
    {
      type: 'p',
      text: 'Certains conflits ne se résolvent pas par une simple discussion, en particulier s’ils touchent à du harcèlement, des propos discriminatoires ou une dégradation sérieuse de l’ambiance de travail. Dans ce cas, faire appel à un service RH externe, une association professionnelle ou un conseil juridique devient nécessaire plutôt qu’une gestion informelle qui risque de rester insuffisante.',
    },
    {
      type: 'cta',
      title: 'Garder une trace claire de ce qui se passe sur chaque chantier',
      text: 'Un fil d’actualité par chantier permet de documenter les faits au moment où ils se produisent, plutôt que de reconstituer une situation a posteriori. Avec Cantia, chaque événement reste rattaché au bon chantier et à la bonne date.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Faut-il intervenir immédiatement dès qu’une tension apparaît entre deux ouvriers ?',
      answer:
        'Pas nécessairement dès la première friction, mais dès qu’une tension se répète sur plusieurs jours ou commence à affecter le travail, une intervention rapide reste préférable à l’attente d’une résolution spontanée, qui survient rarement.',
    },
    {
      question: 'Comment mener la discussion sans prendre parti ?',
      answer:
        'Écouter chaque personne séparément d’abord, puis recentrer l’échange commun sur des faits concrets liés au travail plutôt que sur les personnalités, aide à garder une posture neutre et à éviter d’envenimer la situation.',
    },
    {
      question: 'Quand faut-il faire appel à une aide extérieure pour un conflit d’équipe ?',
      answer:
        'Dès que le conflit touche à du harcèlement, des propos discriminatoires ou dépasse clairement une simple mésentente professionnelle, un accompagnement externe — RH, association professionnelle ou conseil juridique — devient nécessaire.',
    },
  ],
  relatedSlugs: [
    'motiver-equipe-chantier-batiment-quotidien',
    'entretien-annuel-employe-batiment-comment-faire',
    'clauses-oubliees-contrat-travail-batiment',
  ],
};
