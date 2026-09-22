import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'google-sheets-partage-equipe-limites-batiment',
  question: 'À partir de combien de personnes un tableur partagé (Google Sheets) devient-il ingérable pour gérer une entreprise du bâtiment ?',
  title: 'Tableur partagé en équipe : pourquoi ça craque à partir de combien de personnes',
  description:
    'Un Google Sheets partagé fonctionne bien seul, mais craque dès que plusieurs personnes y touchent en même temps. Conflits d’édition, accès non contrôlé, versions qui divergent : le point de rupture en équipe.',
  excerpt:
    'Un tableur partagé tient très bien à une ou deux personnes. Dès que l’équipe grandit, les mêmes limites reviennent presque toujours, au même moment.',
  category: 'Comparatifs & outils',
  keywords: ['Google Sheets équipe limites', 'tableur partagé chantier problème', 'gestion équipe bâtiment Excel'],
  publishedAt: '2026-10-01',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Un tableur partagé pour suivre les chantiers, ça marche bien seul, ou à deux. C’est simple, gratuit, tout le monde sait plus ou moins l’utiliser. Le problème n’apparaît pas tout de suite : il apparaît précisément au moment où l’équipe grandit et que plusieurs personnes doivent y toucher en même temps.',
    },
    { type: 'h2', text: 'Les conflits d’édition simultanée' },
    {
      type: 'p',
      text: 'Deux personnes qui modifient la même ligne en même temps, un onglet qui se fige pendant qu’un collègue le consulte sur chantier avec une mauvaise connexion, une donnée écrasée sans que personne ne s’en rende compte : ces situations deviennent fréquentes dès que plus de deux ou trois personnes travaillent régulièrement sur le même fichier.',
    },
    { type: 'h2', text: 'Aucun contrôle d’accès par employé' },
    {
      type: 'p',
      text: 'Un tableur partagé ne distingue généralement pas ce qu’un employé a le droit de voir de ce qu’il ne devrait pas voir. Un ouvrier qui consulte le planning voit aussi les marges, les prix d’achat ou les informations d’un autre chantier qui ne le concerne pas. Ce n’est pas un problème de confiance, c’est simplement l’absence d’un système pensé pour des rôles différents dans l’équipe.',
    },
    {
      type: 'callout',
      title: 'Le point de rupture arrive souvent autour de la quatrième ou cinquième personne active',
      text: 'En dessous, les incidents restent rares et se règlent vite entre collègues. Au-delà, les conflits d’édition, les versions divergentes et les questions « qui a modifié ça ? » deviennent une gêne quasi quotidienne plutôt qu’une exception occasionnelle.',
    },
    { type: 'h2', text: 'Des versions qui finissent par diverger' },
    {
      type: 'list',
      items: [
        'Des copies locales du fichier téléchargées « pour travailler tranquillement », qui repartent ensuite dans des directions différentes',
        'Des onglets dupliqués pour tester une modification, jamais supprimés ni fusionnés ensuite',
        'Aucune notification quand un chantier est modifié : personne ne sait qu’une donnée a changé tant qu’il ne l’a pas remarqué par hasard',
      ],
    },
    {
      type: 'p',
      text: 'Aucun de ces problèmes ne vient d’une mauvaise utilisation de l’outil. Ils viennent du fait qu’un tableur n’a jamais été conçu pour gérer des accès différenciés, des notifications ou une équipe qui travaille en parallèle sur des chantiers actifs.',
    },
    {
      type: 'cta',
      title: 'Un chantier, une seule source d’information, pour toute l’équipe',
      text: 'Avec Cantia, chaque membre de l’équipe voit ce qui le concerne, les modifications sont notifiées en temps réel, et il n’existe qu’une seule version à jour d’un chantier, jamais une copie qui diverge.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'À partir de combien de personnes un Google Sheets partagé devient-il problématique ?',
      answer:
        'Généralement à partir de quatre ou cinq personnes actives sur le même fichier, les conflits d’édition, les versions divergentes et le manque de contrôle d’accès deviennent une gêne régulière plutôt qu’une exception.',
    },
    {
      question: 'Un tableur partagé peut-il gérer des accès différents selon l’employé ?',
      answer:
        'Pas de façon fiable dans la plupart des cas. Un tableur partagé donne généralement le même niveau de visibilité à tous, sans distinction entre ce qu’un ouvrier et un gérant devraient voir.',
    },
    {
      question: 'Le problème vient-il d’une mauvaise utilisation du tableur ?',
      answer:
        'Non, il vient surtout de l’outil lui-même : un tableur n’a pas été conçu pour gérer des accès différenciés, des notifications de modification ou un travail simultané à plusieurs sur des données actives.',
    },
  ],
  relatedSlugs: ['excel-vs-logiciel-gestion-chantier-limites', 'crm-artisan-batiment-pourquoi-utile', 'application-hors-ligne-chantier-pourquoi-important'],
};
