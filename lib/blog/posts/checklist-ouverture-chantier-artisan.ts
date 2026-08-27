import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'checklist-ouverture-chantier-artisan',
  question: 'Quelle checklist suivre avant d’ouvrir un nouveau chantier ?',
  title: 'Checklist d’ouverture de chantier : ce qu’il faut vérifier avant le premier coup de pioche',
  description:
    'Un chantier qui démarre mal (autorisation manquante, acompte non reçu, accès non prévu) coûte du temps et de l’argent à rattraper. Une checklist simple évite l’essentiel des mauvaises surprises.',
  excerpt:
    'La plupart des retards de chantier ne viennent pas d’un imprévu technique, mais d’un point administratif ou logistique oublié avant même le premier jour de travaux.',
  category: 'Chantier & rentabilité',
  keywords: ['checklist ouverture chantier', 'démarrer un chantier bâtiment', 'préparation chantier construction', 'organisation début de chantier', 'liste vérification chantier'],
  publishedAt: '2026-06-08',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un chantier qui démarre bien se remarque rarement — c’est celui qui démarre mal qui coûte du temps. La plupart des faux départs ne viennent pas d’un problème technique imprévisible, mais d’un point administratif ou logistique tout simplement oublié avant le premier jour.',
    },
    { type: 'h2', text: 'Avant le premier jour de chantier' },
    {
      type: 'list',
      items: [
        'Devis signé et acompte reçu — un chantier qui démarre sans acompte encaissé prend un risque financier évitable',
        'Autorisations nécessaires obtenues (permis de construire si requis, autorisation d’installation de chantier selon la commune)',
        'Accès au chantier confirmé (clés, code, horaires d’accès si occupé)',
        'Sécurisation de la zone (balisage, protection des éléments existants sensibles)',
        'État des lieux photographique réalisé, y compris du voisinage immédiat si pertinent',
      ],
    },
    { type: 'h2', text: 'Au moment de démarrer' },
    {
      type: 'list',
      items: [
        'Équipe et sous-traitants informés du planning précis et des accès',
        'Matériel et matériaux nécessaires confirmés disponibles, pas juste commandés',
        'Un contact direct avec le client établi pour la durée du chantier, en cas de question urgente',
      ],
    },
    {
      type: 'callout',
      title: 'L’état des lieux photographique est la protection la moins chère du chantier',
      text: 'Quelques minutes de photos avant travaux évitent des semaines de discussion en cas de contestation ultérieure sur l’état préexistant d’un élément du chantier ou du voisinage.',
    },
    {
      type: 'cta',
      title: 'Chaque chantier documenté dès le premier jour',
      text: 'Cantia centralise devis, acompte, équipe affectée et photos dès l’ouverture du chantier — une checklist qui se coche presque toute seule.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Pourquoi documenter l’état des lieux avant le début du chantier ?',
      answer:
        'Pour se protéger en cas de contestation ultérieure — sans preuve datée de l’état préexistant, il devient impossible de démontrer qu’un dégât n’a pas été causé par le chantier.',
    },
    {
      question: 'Faut-il attendre l’encaissement de l’acompte avant de démarrer ?',
      answer:
        'C’est fortement recommandé — démarrer sans acompte encaissé prend un risque financier évitable, surtout sur un chantier de taille significative.',
    },
    {
      question: 'Quelle est la cause la plus fréquente de faux départ de chantier ?',
      answer:
        'Un point administratif ou logistique oublié (autorisation manquante, accès non confirmé) bien plus souvent qu’un imprévu technique réel.',
    },
  ],
  relatedSlugs: [
    'checklist-cloture-chantier-avant-facturation',
    'photos-chantier-preuve-juridique-litige',
    'facturer-acompte-suisse-securiser-solde',
  ],
};
