import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'estimer-chantier-a-distance-devis-photo',
  question: 'Peut-on estimer sérieusement un chantier à distance, sans se déplacer ?',
  title: 'Estimer un chantier à distance : jusqu’où c’est raisonnable',
  description:
    'Un déplacement pour chaque demande de prix coûte du temps que peu d’artisans facturent. Certaines estimations à distance sont fiables ; d’autres sont un pari risqué.',
  excerpt:
    'Chaque visite non transformée en chantier est du temps offert au client suivant. Savoir quand estimer à distance, et quand refuser de le faire, se calcule.',
  category: 'Chantier & rentabilité',
  keywords: ['devis à distance', 'estimation photo', 'visite chantier', 'prix rendez-vous', 'productivité artisan'],
  publishedAt: '2026-05-25',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un déplacement d’une heure pour estimer un chantier ne se concrétise qu’une fois sur deux. Cette heure non facturée pèse directement sur la rentabilité de la semaine. La question n’est pas « faut-il toujours se déplacer », mais « pour quel type de demande le déplacement est-il vraiment nécessaire ».',
    },
    { type: 'h2', text: 'Ce qui s’estime raisonnablement sur photos' },
    {
      type: 'list',
      items: [
        'Un remplacement à l’identique (fenêtre, porte, sanitaire) dont les dimensions sont mesurables par le client lui-même',
        'Une prestation standardisée avec un prix au mètre carré ou à l’unité déjà connu de l’entreprise',
        'Une première estimation indicative, explicitement présentée comme telle, pour permettre au client de décider s’il pousse la démarche plus loin',
      ],
    },
    {
      type: 'callout',
      title: 'Ce qui ne s’estime jamais sérieusement sans visite',
      text: 'Tout ce qui touche à l’état structurel existant (mur porteur suspecté, humidité, installation électrique ancienne) ne peut pas se juger sur photo, car le risque d’un devis flou ou irréaliste dépasse largement le temps économisé en évitant le déplacement. Un devis basé sur une hypothèse fausse coûte bien plus cher en avenant et en confiance perdue qu’une visite d’une heure.',
    },
    { type: 'h2', text: 'La méthode qui limite le risque des deux côtés' },
    {
      type: 'p',
      text: 'Présenter clairement une estimation à distance comme indicative (pas comme un prix ferme) protège l’entreprise d’un engagement pris sur des informations incomplètes, tout en donnant au client une base rapide pour avancer. Le devis ferme, lui, reste conditionné à une confirmation sur place avant le démarrage effectif des travaux, en particulier pour tout ce qui touche à de la rénovation.',
    },
    { type: 'h2', text: 'Ce que ça change dans l’organisation de la semaine' },
    {
      type: 'p',
      text: 'Filtrer les demandes qui peuvent réellement s’estimer à distance des demandes qui nécessitent une visite libère du temps de déplacement pour les chantiers qui en ont vraiment besoin, tout en préservant la fiabilité des prix annoncés. C’est un tri qui se fait dès le premier contact, pas après coup.',
    },
    {
      type: 'cta',
      title: 'Un devis chiffré depuis une simple photo, dicté à la voix',
      text: 'Avec Cantia, une estimation indicative se transforme en devis chiffré en quelques minutes, à partir de photos et d’une description dictée à la voix, sans forcément passer par un premier déplacement.',
      buttonLabel: 'Découvrir la dictée vocale',
    },
  ],
  faq: [
    {
      question: 'Peut-on établir un devis ferme uniquement sur la base de photos ?',
      answer:
        'C’est risqué pour tout ce qui touche à l’état structurel existant. Mieux vaut alors présenter une estimation indicative et conditionner le devis ferme à une visite sur place.',
    },
    {
      question: 'Quels types de travaux se prêtent le mieux à une estimation à distance ?',
      answer:
        'Les remplacements à l’identique avec des dimensions mesurables par le client, ou des prestations standardisées avec un prix déjà connu par l’entreprise.',
    },
    {
      question: 'Comment limiter le risque d’une estimation à distance qui se révèle fausse ?',
      answer:
        'En la présentant clairement comme indicative, non contractuelle, et en réservant le devis ferme à une confirmation effectuée sur place.',
    },
  ],
  relatedSlugs: [
    'rediger-devis-qui-inspire-confiance-client',
    'calculer-prix-devis-renovation-suisse',
    'logiciel-gestion-chantier-independant-seul',
  ],
};
