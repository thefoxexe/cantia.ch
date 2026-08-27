import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'crm-artisan-batiment-pourquoi-utile',
  question: 'Un artisan du bâtiment a-t-il vraiment besoin d’un CRM ?',
  title: 'CRM pour artisan du bâtiment : utile ou superflu ?',
  description:
    'Le mot CRM évoque des équipes commerciales et des tableaux de bord complexes — mais un artisan qui gère 30, 50 ou 100 clients a exactement le même problème de mémoire qu’un commercial.',
  excerpt:
    'Pas besoin d’un logiciel de vente complexe pour avoir besoin d’un CRM. Le vrai signal, c’est le nombre de fois où on cherche « c’était qui déjà, ce client » dans ses e-mails.',
  category: 'Comparatifs & outils',
  keywords: ['CRM artisan bâtiment', 'gestion clients entreprise construction', 'logiciel clients artisan', 'suivi client chantier', 'fidélisation client bâtiment'],
  publishedAt: '2026-06-05',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Le mot CRM (customer relationship management) évoque souvent des équipes commerciales avec des pipelines de vente complexes — un univers loin du quotidien d’un artisan. Mais la fonction de base d’un CRM (savoir qui sont ses clients, ce qu’ils ont déjà commandé, et quand les relancer) concerne exactement autant une entreprise du bâtiment qu’une équipe commerciale.',
    },
    { type: 'h2', text: 'Le signal qui indique qu’un CRM devient utile' },
    {
      type: 'list',
      items: [
        'Chercher un ancien devis ou une adresse de chantier dans sa boîte mail plutôt que dans un fichier centralisé',
        'Ne plus se souvenir si un client a déjà été facturé pour une intervention précédente',
        'Recontacter un ancien client par hasard plutôt que par un suivi structuré',
        'Perdre le fil de qui a signé quoi, sur quel chantier, avec quel acompte versé',
      ],
    },
    {
      type: 'h2', text: 'Ce qu’un CRM adapté au bâtiment apporte concrètement',
    },
    {
      type: 'list',
      items: [
        'Un historique complet par client : devis, factures, chantiers, notes de suivi, en un seul endroit',
        'Une base pour relancer un ancien client au bon moment, plutôt qu’au hasard d’un souvenir',
        'Une vue claire de qui sont les clients récurrents, souvent les plus rentables à conserver',
        'Un gain de temps direct : plus besoin de reconstituer un historique à chaque nouveau contact avec un client existant',
      ],
    },
    {
      type: 'callout',
      title: 'Un client récurrent coûte bien moins cher à conserver qu’un nouveau à acquérir',
      text: 'Dans le bâtiment comme ailleurs, la fidélisation est presque toujours plus rentable que la prospection — encore faut-il avoir la visibilité nécessaire pour savoir qui relancer et quand.',
    },
    {
      type: 'cta',
      title: 'Un historique client intégré, pas un logiciel à part',
      text: 'Cantia centralise devis, factures et notes par client directement lié aux chantiers — pas besoin d’un CRM séparé à synchroniser en plus.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Un artisan indépendant a-t-il besoin d’un CRM ?',
      answer:
        'Dès qu’il devient difficile de se souvenir de l’historique de chaque client sans chercher dans ses e-mails, un CRM simple apporte un vrai gain de temps, même en solo.',
    },
    {
      question: 'Quelle est la différence entre un CRM et un simple carnet d’adresses ?',
      answer:
        'Un CRM relie l’historique complet (devis, factures, chantiers, notes) à chaque client, alors qu’un carnet d’adresses ne conserve que les coordonnées.',
    },
    {
      question: 'Faut-il un logiciel séparé pour le CRM et la facturation ?',
      answer:
        'Pas nécessairement — un outil qui relie nativement clients, devis et factures évite la double saisie et la synchronisation entre deux systèmes distincts.',
    },
  ],
  relatedSlugs: [
    'relancer-client-facture-impayee-sans-perdre-client',
    'meilleur-logiciel-devis-facture-batiment-suisse-2026',
    'excel-vs-logiciel-gestion-chantier-limites',
  ],
};
