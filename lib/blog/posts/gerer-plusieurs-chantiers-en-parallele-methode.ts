import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'gerer-plusieurs-chantiers-en-parallele-methode',
  question: 'Comment gérer plusieurs chantiers en même temps sans perdre le fil ?',
  title: 'Gérer plusieurs chantiers en parallèle sans rien perdre en route',
  description:
    'Passer de un à trois chantiers simultanés change la nature du travail : ce n’est plus une question de bras, c’est une question de mémoire et de coordination. Une méthode concrète.',
  excerpt:
    'Le passage d’un à trois chantiers en parallèle ne double pas la charge de travail — il multiplie le nombre de choses qu’il faut se rappeler sans les avoir écrites nulle part.',
  category: 'Chantier & rentabilité',
  keywords: ['plusieurs chantiers', 'organisation chantier', 'planning équipe', 'coordination', 'gestion multi-projets'],
  publishedAt: '2026-04-09',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Un chantier à la fois se gère à la mémoire, sans vraiment y penser. Trois chantiers en parallèle changent tout — pas parce qu’il y a trois fois plus de travail physique, mais parce qu’il y a soudain dix fois plus de choses à se rappeler : qui est où, quel matériel a été commandé pour quel chantier, quel client attend quelle réponse.',
    },
    { type: 'h2', text: 'Le vrai problème n’est jamais la charge, c’est la mémoire' },
    {
      type: 'p',
      text: 'La plupart des ratés sur des chantiers multiples ne viennent pas d’un manque de compétence ou de main-d’œuvre — ils viennent d’une information qui existait quelque part (dans un SMS, une conversation orale, un post-it) mais qui n’était nulle part accessible au bon moment, pour la bonne personne.',
    },
    {
      type: 'list',
      items: [
        'Un collaborateur envoyé sur le mauvais chantier faute de planning centralisé et à jour',
        'Une commande matériel dupliquée parce que personne ne savait qu’elle avait déjà été passée pour ce chantier',
        'Un client qui relance parce que sa question posée oralement s’est perdue entre deux visites',
        'Une facture de sous-traitant rattachée au mauvais chantier, faussant la rentabilité des deux',
      ],
    },
    { type: 'h2', text: 'Trois habitudes qui absorbent la complexité' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Un planning d’équipe unique et partagé, où chaque affectation est rattachée à un chantier précis — visible par toute l’équipe, pas seulement par celui qui l’a écrit',
        'Un seul endroit par chantier où atterrit tout ce qui le concerne : photos, notes, devis, factures — pas un fil WhatsApp d’un côté et un dossier papier de l’autre',
        'Un point de rentabilité par chantier consulté régulièrement, pas seulement à la clôture — pour repérer tôt un chantier qui dérape pendant qu’il reste du temps pour réagir',
      ],
    },
    {
      type: 'callout',
      title: 'Le signe qu’il est temps de changer de méthode',
      text: 'Si une question revient régulièrement — « c’était pour quel chantier déjà ? », « qui devait s’en occuper ? » — ce n’est pas un problème de mémoire individuelle à corriger, c’est un signal que l’information n’a pas d’endroit fixe où vivre. Le corriger, c’est changer d’outil, pas se forcer à mieux se souvenir.',
    },
    {
      type: 'cta',
      title: 'Chaque chantier, un seul endroit pour tout',
      text: 'Cantia centralise planning, devis, factures, rapports et sous-traitants par chantier — l’équipe entière voit la même information, à jour, au même endroit.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Pourquoi gérer plusieurs chantiers est-il plus difficile que multiplier un seul chantier ?',
      answer:
        'Parce que la difficulté n’est pas la charge de travail elle-même, mais la coordination et la mémoire des informations spécifiques à chaque chantier — qui se perdent facilement sans un endroit centralisé pour les stocker.',
    },
    {
      question: 'Quel est le signe qu’une entreprise a besoin d’un meilleur système de suivi ?',
      answer:
        'Des questions récurrentes comme « c’était pour quel chantier ? » ou une confusion sur qui devait faire quoi indiquent que l’information n’a pas d’endroit fixe et accessible à toute l’équipe.',
    },
    {
      question: 'Un planning WhatsApp suffit-il pour gérer plusieurs chantiers ?',
      answer:
        'Ça fonctionne un temps avec une petite équipe, mais l’information s’y perd vite dans le défilement des messages — sans structure par chantier, elle devient rapidement impossible à retrouver.',
    },
  ],
  relatedSlugs: [
    'whatsapp-gestion-equipe-chantier-limites',
    'suivre-rentabilite-chantier-sans-excel',
    'chantier-complet-peut-etre-en-perte-taux-horaire',
  ],
};
