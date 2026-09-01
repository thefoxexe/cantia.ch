import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'pourquoi-entreprises-batiment-font-faillite-suisse',
  question: 'Pourquoi tant de petites entreprises du bâtiment font-elles faillite malgré un bon carnet de commandes ?',
  title: 'Pourquoi des entreprises du bâtiment en pleine activité finissent par faire faillite',
  description:
    'Avoir du travail ne suffit pas : les causes les plus fréquentes de faillite dans le bâtiment sont un problème de trésorerie et de marge invisible, pas un manque de chantiers.',
  excerpt:
    'Une entreprise qui « ne s’arrête jamais de travailler » peut quand même couler. Le carnet de commandes rassure, mais il ne dit rien sur la marge réelle ni sur le décalage entre dépenses et encaissements.',
  category: 'Chantier & rentabilité',
  keywords: ['faillite entreprise bâtiment', 'trésorerie construction', 'marge invisible chantier', 'gestion PME bâtiment', 'rentabilité artisan'],
  publishedAt: '2026-07-25',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'C’est un paradoxe fréquent dans le secteur : une entreprise du bâtiment avec plusieurs chantiers actifs simultanément, sans manque de travail, qui se retrouve pourtant en cessation de paiement. Les chiffres du secteur montrent que la cause n’est presque jamais un manque de demande, mais une combinaison de trésorerie mal anticipée et de marge réelle jamais mesurée chantier par chantier.',
    },
    { type: 'h2', text: 'Les 4 causes les plus fréquentes' },
    {
      type: 'list',
      items: [
        'Le décalage de trésorerie : les fournisseurs et salaires se paient chaque mois, mais les factures clients sont réglées à 30, 60 ou 90 jours, si bien qu’un chantier « rentable sur le papier » peut quand même provoquer une rupture de caisse',
        'Des chantiers sous-devisés qui se compensent mentalement avec d’autres jugés « bons », sans jamais vérifier lequel finance réellement l’autre',
        'Une croissance trop rapide de l’effectif financée par le chiffre d’affaires futur plutôt que par une trésorerie déjà constituée',
        'Un seul client ou un seul gros chantier qui représente une part disproportionnée du chiffre d’affaires, avec un risque de concentration non anticipé',
      ],
    },
    {
      type: 'callout',
      title: 'Le chiffre d’affaires n’est jamais un indicateur de santé financière',
      text: 'Une entreprise peut facturer beaucoup et rester structurellement en perte si sa marge réelle par chantier n’est jamais mesurée. Seul le suivi de la rentabilité chantier par chantier révèle ce que le chiffre d’affaires seul ne montre pas.',
    },
    { type: 'h2', text: 'Ce qui protège concrètement une petite structure' },
    {
      type: 'list',
      items: [
        'Une prévision de trésorerie à 30-60-90 jours, mise à jour régulièrement plutôt que reconstruite dans l’urgence',
        'Un suivi de la rentabilité par chantier, pas seulement du chiffre d’affaires global de l’entreprise',
        'Une facturation d’acomptes systématique sur les chantiers de taille significative',
        'Une diversification progressive du portefeuille client, même modeste',
      ],
    },
    {
      type: 'cta',
      title: 'Voir venir les problèmes de trésorerie avant qu’ils n’arrivent',
      text: 'Le module Trésorerie de Cantia projette votre solde à venir en tenant compte des factures en attente et des dépenses récurrentes. De quoi anticiper un creux plutôt que le subir.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Un bon carnet de commandes protège-t-il une entreprise du bâtiment de la faillite ?',
      answer:
        'Non. La cause la plus fréquente de faillite dans le secteur est un problème de trésorerie ou de marge réelle non mesurée, pas un manque de chantiers en cours.',
    },
    {
      question: 'Pourquoi un chantier « rentable » peut-il quand même créer une rupture de trésorerie ?',
      answer:
        'Parce que les charges (salaires, fournisseurs) se paient mensuellement alors que les clients règlent souvent à 30-90 jours, ce qui peut asphyxier la caisse même sur un chantier bénéficiaire.',
    },
    {
      question: 'Quel est le meilleur indicateur de santé financière pour une entreprise du bâtiment ?',
      answer:
        'Le meilleur indicateur est la rentabilité mesurée chantier par chantier, associée à une prévision de trésorerie à court terme, car le chiffre d’affaires global seul ne révèle rien de la marge réelle.',
    },
  ],
  relatedSlugs: [
    'chantier-complet-peut-etre-en-perte-taux-horaire',
    'calculer-prix-horaire-reel-ouvrier-batiment',
    'relancer-client-facture-impayee-sans-perdre-client',
  ],
};
