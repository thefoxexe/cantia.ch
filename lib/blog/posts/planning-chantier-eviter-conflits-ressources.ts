import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'planning-chantier-eviter-conflits-ressources',
  question: 'Comment éviter qu’une même équipe ou une même machine soit prévue sur deux chantiers en même temps ?',
  title: 'Conflits de planning entre chantiers : comment une petite entreprise les évite vraiment',
  description:
    'Un ouvrier ou une machine réservés deux fois le même jour sur deux chantiers différents : un classique quand le planning vit dans plusieurs têtes ou plusieurs fichiers séparés.',
  excerpt:
    'Ce n’est presque jamais un problème de mauvaise volonté : c’est un problème de visibilité. Personne ne voit tout le planning au même endroit, donc personne ne peut repérer le conflit avant qu’il n’explose sur le terrain.',
  category: 'Chantier & rentabilité',
  keywords: ['planning chantier conflit', 'gestion équipe bâtiment', 'ressources multi-chantiers', 'organisation entreprise construction', 'planning partagé'],
  publishedAt: '2026-07-13',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Dès qu’une entreprise gère plus de deux ou trois chantiers en parallèle, le risque de double-réservation devient réel : un ouvrier annoncé sur un chantier alors qu’il est déjà prévu ailleurs, une bétonnière ou un échafaudage réservé deux fois le même jour. Le problème n’est presque jamais un manque d’organisation individuelle, c’est plutôt un manque de visibilité partagée sur l’ensemble des engagements.',
    },
    { type: 'h2', text: 'Pourquoi ça arrive, même dans des équipes bien organisées' },
    {
      type: 'list',
      items: [
        'Le planning existe, mais dans plusieurs endroits différents : un agenda papier au bureau, un fichier sur l’ordinateur du patron, des messages WhatsApp épars avec les chefs d’équipe',
        'Une modification de dernière minute (retard sur un chantier, absence imprévue) n’est jamais répercutée automatiquement sur les autres chantiers concernés',
        'Personne n’a de vue d’ensemble simultanée sur les personnes et le matériel engagés sur toute la semaine',
      ],
    },
    {
      type: 'callout',
      title: 'Le vrai coût d’un conflit de planning n’est pas seulement le retard',
      text: 'Une équipe déplacée en urgence d’un chantier à l’autre génère aussi un trajet perdu, un client mécontent d’un décalage non annoncé, et souvent une improvisation qui coûte plus cher que le temps qu’elle est censée gagner.',
    },
    { type: 'h2', text: 'Ce qui fonctionne concrètement' },
    {
      type: 'list',
      items: [
        'Un planning unique, visible par toute l’équipe, plutôt qu’une source d’information par personne',
        'Une vue par personne et par machine, pas seulement par chantier, afin de repérer un conflit avant qu’il ne devienne un problème sur le terrain',
        'Une mise à jour en temps réel, accessible depuis le chantier et pas seulement depuis le bureau',
      ],
    },
    {
      type: 'cta',
      title: 'Un planning que toute l’équipe voit, en temps réel',
      text: 'Le module Planning de Cantia centralise les affectations d’équipe et de chantier en un seul endroit accessible depuis le terrain. Fini les doubles réservations découvertes trop tard.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Pourquoi les conflits de planning arrivent-ils même dans des équipes organisées ?',
      answer:
        'Parce que le planning existe souvent dans plusieurs endroits séparés (agenda papier, fichier personnel, messages) sans vue d’ensemble partagée, plutôt que par manque d’organisation individuelle.',
    },
    {
      question: 'Quel est le vrai coût d’un conflit de planning entre deux chantiers ?',
      answer:
        'Au-delà du retard direct, il génère souvent un trajet perdu, un client mécontent d’un décalage non annoncé, et une improvisation de dernière minute plus coûteuse que le temps gagné à l’origine.',
    },
    {
      question: 'Un planning centralisé suffit-il à éviter tous les conflits ?',
      answer:
        'Il réduit fortement le risque en donnant une vue partagée en temps réel, mais il doit être mis à jour dès qu’un changement survient pour rester réellement fiable.',
    },
  ],
  relatedSlugs: [
    'gerer-plusieurs-chantiers-en-parallele-methode',
    'whatsapp-gestion-equipe-chantier-limites',
    'retard-chantier-meteo-obligations-contractuelles',
  ],
};
