import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'photos-chantier-preuve-juridique-litige',
  question: 'Comment des photos de chantier peuvent-elles servir de preuve en cas de litige ?',
  title: 'Photos de chantier : la preuve la plus solide, si elle est bien prise',
  description:
    'Une photo de chantier vaut comme preuve devant un tribunal civil suisse — à condition d’être datée, contextualisée et conservée correctement. Une photo seule, sans ces éléments, vaut beaucoup moins.',
  excerpt:
    'Une photo prise au bon moment peut clore un litige de garantie en une seule pièce. La même photo, sans date ni contexte, ne vaut presque rien devant un juge.',
  category: 'Chantier & rentabilité',
  keywords: ['photo chantier', 'preuve litige', 'garantie construction', 'géolocalisation', 'documentation chantier'],
  publishedAt: '2026-05-07',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un client conteste, huit mois après la réception, l’état d’un mur avant travaux. Une entreprise qui a une photo datée de cette même zone, prise le premier jour du chantier, règle le désaccord en quelques secondes. Une entreprise qui n’en a pas se retrouve à discuter de mémoire contre mémoire — la position la plus faible possible en cas de litige.',
    },
    { type: 'h2', text: 'Ce qui fait qu’une photo « vaut » comme preuve' },
    {
      type: 'list',
      items: [
        'Une date et une heure fiables — un horodatage manipulable après coup (métadonnées modifiables) pèse moins qu’un système qui l’enregistre automatiquement au moment de la prise',
        'Un contexte clair sur ce qu’elle montre : quel local, quelle étape du chantier, idéalement une géolocalisation qui confirme l’endroit exact',
        'Une conservation dans le temps qui garantit qu’elle n’a pas pu être remplacée ou modifiée entre la prise et sa présentation en cas de litige',
      ],
    },
    { type: 'h2', text: 'Les moments du chantier où une photo change tout' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Avant travaux : état initial des lieux, utile en cas de contestation sur ce qui préexistait',
        'À des étapes clés (avant fermeture d’un mur, avant coulage d’une chape) : preuve que ce qui n’est plus visible ensuite était conforme',
        'À la réception : état final, référence directe pour toute réclamation ultérieure',
        'Si un défaut est constaté plus tard : datation précise du moment de la découverte, pertinente pour le délai de signalement de 60 jours',
      ],
    },
    {
      type: 'callout',
      title: 'Le point qui rend la plupart des archives photo inutilisables',
      text: 'Des photos stockées sur les téléphones personnels de plusieurs collaborateurs, sans centralisation ni horodatage fiable, ne constituent presque jamais une preuve solide — même si la photo elle-même existe bel et bien quelque part. Ce qui compte n’est pas seulement la photo, c’est sa traçabilité.',
    },
    {
      type: 'p',
      text: 'C’est particulièrement vrai depuis la réforme du droit de la garantie de 2026 (délai de 60 jours pour signaler un défaut caché) : une entreprise capable de prouver précisément quand un défaut est apparu — ou n’était pas visible avant — se retrouve en bien meilleure position qu’une entreprise qui ne peut que l’affirmer.',
    },
    {
      type: 'cta',
      title: 'Chaque photo, datée et géolocalisée automatiquement',
      text: 'Les rapports de chantier Cantia horodatent et géolocalisent chaque photo prise, classée par chantier — la preuve existe déjà, sans démarche supplémentaire au moment où elle devient utile.',
      buttonLabel: 'Découvrir les rapports de chantier',
    },
  ],
  faq: [
    {
      question: 'Une photo de chantier a-t-elle une vraie valeur de preuve devant un tribunal ?',
      answer:
        'Oui, à condition d’être datée de façon fiable, contextualisée (quel lieu, quelle étape) et conservée sans possibilité de modification a posteriori.',
    },
    {
      question: 'À quels moments du chantier est-il le plus utile de prendre des photos ?',
      answer:
        'Avant travaux, avant fermeture d’éléments qui ne resteront plus visibles ensuite, et à la réception finale — ce sont les moments qui servent le plus en cas de litige ultérieur.',
    },
    {
      question: 'Pourquoi des photos stockées sur des téléphones personnels sont-elles peu utilisables ?',
      answer:
        'Parce qu’elles manquent souvent de centralisation et d’horodatage fiable, ce qui affaiblit leur valeur de preuve même si le contenu de la photo est pertinent.',
    },
  ],
  relatedSlugs: [
    'defaut-construction-decouvert-apres-reception-qui-paie',
    'garantie-travaux-construction-2-ou-5-ans',
    'client-refuse-payer-solde-final-que-faire',
  ],
};
