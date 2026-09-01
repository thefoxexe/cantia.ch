import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'outil-facturation-en-ligne-pme-suisse',
  question: 'Quels sont les avantages d\'un outil de facturation en ligne pour une PME suisse ?',
  title: 'Outil de facturation en ligne : ce que ça change concrètement pour une PME',
  description:
    'Entre un logiciel installé sur un seul ordinateur et un outil en ligne accessible partout, la différence dépasse la simple commodité : voici ce qu\'une PME suisse y gagne vraiment.',
  excerpt:
    'Un logiciel installé sur un seul poste de travail semble suffire, jusqu\'au jour où il faut facturer depuis un chantier, un autre bureau, ou avec un collègue en même temps.',
  category: 'Comparatifs & outils',
  keywords: ['outil facturation en ligne PME', 'logiciel facturation cloud Suisse', 'facturation accessible partout', 'avantages logiciel en ligne PME', 'facturation web vs logiciel installé'],
  publishedAt: '2026-07-17',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Un logiciel de facturation "en ligne" (cloud) s\'oppose à un logiciel installé localement sur un seul ordinateur. Cette distinction semble technique, mais elle a des conséquences très concrètes pour une PME du bâtiment au quotidien.',
    },
    { type: 'h2', text: 'Ce que le "en ligne" apporte concrètement' },
    {
      type: 'list',
      items: [
        'Accès depuis n\'importe quel appareil (chantier, bureau, domicile), sans dépendre d\'un seul poste',
        'Plusieurs personnes peuvent travailler en même temps, sans se marcher dessus sur le même fichier',
        'Les sauvegardes sont automatiques, pas dépendantes d\'un disque dur qui pourrait tomber en panne',
        'Les mises à jour (nouvelles normes TVA, QR-facture) arrivent automatiquement, sans manipulation',
      ],
    },
    {
      type: 'stat',
      value: '0',
      label: 'installation ou mise à jour manuelle nécessaire avec un outil en ligne, car tout se fait automatiquement côté éditeur',
    },
    { type: 'h2', text: 'Le vrai risque d\'un logiciel installé localement' },
    {
      type: 'p',
      text: 'Un logiciel installé sur un seul ordinateur crée un point unique de défaillance : panne, vol, ou simplement absence de la personne qui a l\'accès, et toute l\'entreprise se retrouve bloquée pour facturer. Un outil en ligne élimine ce risque par construction.',
    },
    {
      type: 'callout',
      title: 'La sécurité des données reste une vraie question à poser',
      text: 'Avant de choisir un outil en ligne, il faut vérifier qu\'il héberge les données en Suisse ou dans l\'UE et qu\'il est transparent sur ses pratiques de sécurité, plutôt que de le supposer automatiquement.',
    },
    {
      type: 'cta',
      title: 'Accessible partout, hébergé en Suisse',
      text: 'Cantia fonctionne en ligne, accessible depuis n\'importe quel appareil, avec des données hébergées en Suisse. Testez gratuitement pendant 30 jours avec le code ESSAI30.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Quel est le principal avantage d\'un outil de facturation en ligne par rapport à un logiciel installé ?',
      answer:
        'L\'accès depuis n\'importe quel appareil, sans dépendre d\'un seul ordinateur, ce qui est particulièrement important pour une entreprise qui travaille sur plusieurs chantiers.',
    },
    {
      question: 'Un outil en ligne est-il aussi sûr qu\'un logiciel installé localement ?',
      answer:
        'Généralement plus sûr en pratique, grâce aux sauvegardes automatiques, à condition toutefois de vérifier que l\'éditeur héberge les données en Suisse ou dans l\'UE et applique de bonnes pratiques de sécurité.',
    },
    {
      question: 'Faut-il installer quelque chose pour utiliser un outil de facturation en ligne ?',
      answer:
        'Non, un simple navigateur ou une application mobile suffit. Aucune installation ni mise à jour manuelle n\'est nécessaire.',
    },
  ],
  relatedSlugs: [
    'application-hors-ligne-chantier-pourquoi-important',
    'logiciel-gestion-evolutif-grandit-avec-entreprise',
    'gestion-entreprise-sur-mobile-artisan',
  ],
};
