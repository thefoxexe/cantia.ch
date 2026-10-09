import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'corrections-incluses-offre-graphiste-droits',
  question: 'Combien de corrections inclure dans une offre de graphisme ?',
  title: 'Offre de graphiste : limiter les corrections et préciser les droits',
  description:
    'Nombre d’allers-retours, demandes hors offre, acompte, droits d’utilisation : ce qu’un graphiste ou une agence doit écrire dans son offre pour ne pas travailler gratuitement.',
  excerpt:
    'Le projet qui déborde n’est presque jamais celui qui était mal chiffré : c’est celui dont l’offre ne disait pas où il s’arrêtait.',
  category: 'Services & autres métiers',
  keywords: ['offre graphiste', 'nombre de corrections graphisme', 'devis agence communication', 'droits d’auteur graphiste Suisse', 'acompte graphiste'],
  publishedAt: '2026-10-09',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Une offre de graphisme vend un résultat, mais le coût réel dépend du nombre de retours du client. Sans limite écrite, chaque nouvelle demande paraît normale au client, et chaque heure en plus est offerte.',
    },
    { type: 'h2', text: 'Ce que l’offre doit contenir' },
    {
      type: 'list',
      items: [
        'Les livrables précis (formats, déclinaisons, nombre de pistes)',
        'Le nombre d’allers-retours compris, par exemple deux par étape',
        'Le tarif des corrections supplémentaires, à l’heure ou au forfait',
        'Le calendrier et ce qui se passe si le client tarde à répondre',
        'Les droits d’utilisation cédés',
      ],
    },
    { type: 'h2', text: 'Quand le client demande « juste une petite modification »' },
    {
      type: 'p',
      text: 'Au-delà des corrections prévues, annoncez le supplément avant de le faire et obtenez l’accord du client par écrit. Ce n’est pas de la rigidité : c’est ce qui permet de dire oui à la demande sans la payer de votre poche.',
    },
    {
      type: 'callout',
      title: 'Les droits d’utilisation',
      text: 'En droit suisse, l’auteur d’une œuvre garde ses droits tant qu’il ne les a pas cédés. Écrivez dans l’offre quels usages sont compris (supports, durée, territoire) et ce qui coûte en plus.',
    },
    { type: 'h2', text: 'Acompte et facture finale' },
    {
      type: 'p',
      text: 'Une facture d’acompte au démarrage engage le client et finance le début du travail. La facture finale reprend l’offre, les suppléments acceptés, et déduit l’acompte.',
    },
    { type: 'h2', text: 'Mesurer le temps réel' },
    {
      type: 'p',
      text: 'Même avec un prix au forfait, notez votre temps par projet. Vous saurez quels types de projets et quels clients sont rentables, et vous chiffrerez mieux la fois suivante.',
    },
    {
      type: 'cta',
      title: 'Offre, suppléments et temps par projet',
      text: 'Avec Cantia, les demandes hors offre deviennent des suppléments acceptés par le client et le temps est suivi par projet. Essai gratuit de 14 jours.',
      buttonLabel: 'Essayer 14 jours',
    },
  ],
  faq: [
    {
      question: 'Combien d’allers-retours inclure ?',
      answer: 'Il n’y a pas de norme. Deux allers-retours par étape sont courants ; l’important est que le nombre soit écrit dans l’offre.',
    },
    {
      question: 'Le client devient-il propriétaire du logo qu’il paie ?',
      answer: 'Pas automatiquement : les droits d’utilisation cédés doivent être précisés par écrit.',
    },
    {
      question: 'Faut-il demander un acompte ?',
      answer: 'C’est recommandé pour tout projet de plusieurs jours : il engage le client et couvre le début du travail.',
    },
  ],
  relatedSlugs: ['annulation-reservation-photographe-acompte-arrhes', 'facturer-acompte-suisse-securiser-solde', 'signature-electronique-devis-suisse-valeur-legale'],
  relatedTradeSlug: 'graphiste',
};
