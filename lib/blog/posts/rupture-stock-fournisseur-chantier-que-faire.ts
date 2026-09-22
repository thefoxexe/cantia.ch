import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'rupture-stock-fournisseur-chantier-que-faire',
  question: 'Que faire en cas de rupture de stock fournisseur en plein chantier ?',
  title: 'Rupture de stock fournisseur en plein chantier : que faire',
  description:
    'Comment réagir face à une rupture de stock fournisseur en plein chantier, anticiper le risque et protéger votre planning et votre relation client.',
  excerpt:
    'Un matériau indisponible en plein chantier peut faire dérailler tout un planning. Voici comment limiter les dégâts et, surtout, comment l’anticiper.',
  category: 'Chantier & rentabilité',
  keywords: ['rupture de stock fournisseur chantier', 'retard livraison matériaux bâtiment'],
  publishedAt: '2026-10-09',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Une rupture de stock chez un fournisseur est un risque souvent sous-estimé : elle ne touche pas seulement la commande concernée, elle se répercute sur tout le planning du chantier, parfois jusqu’à la pénalité contractuelle si un délai était ferme.',
    },
    { type: 'h2', text: 'Pourquoi c’est plus grave qu’il n’y paraît' },
    {
      type: 'p',
      text: 'Un retard de livraison de quelques jours peut décaler l’intervention de plusieurs corps de métier en cascade. Sur un chantier avec plusieurs entreprises coordonnées, ce décalage se paie souvent en temps mort facturable ou en tension avec le client, bien au-delà du coût du matériau lui-même.',
    },
    { type: 'h2', text: 'Les réflexes à avoir sur le moment' },
    {
      type: 'list',
      items: [
        'Contacter immédiatement le fournisseur pour connaître le délai réel, pas l’estimation optimiste',
        'Vérifier s’il existe une alternative équivalente disponible immédiatement, même chez un autre fournisseur',
        'Prévenir le client tôt, avec une solution proposée plutôt qu’au dernier moment sans explication',
        'Réorganiser l’ordre des tâches du chantier si un autre poste peut avancer en attendant',
      ],
    },
    { type: 'h2', text: 'Comment s’en prémunir en amont' },
    {
      type: 'p',
      text: 'Pour les matériaux critiques d’un chantier, identifier un fournisseur de secours avant d’en avoir besoin change tout : ce n’est pas une négociation à faire dans l’urgence. Sur le plan contractuel, il est également utile de formuler un délai indicatif plutôt que ferme lorsque la disponibilité du matériau est incertaine — cela protège l’entreprise d’une pénalité pour un retard qui ne dépend pas d’elle.',
    },
    {
      type: 'callout',
      title: 'Un deuxième fournisseur identifié vaut plus qu’un stock de sécurité',
      text: 'Stocker soi-même du matériau immobilise de la trésorerie et de l’espace. Avoir simplement identifié, à l’avance, un fournisseur alternatif pour les matériaux les plus critiques est souvent une protection plus efficace et moins coûteuse.',
    },
    {
      type: 'cta',
      title: 'Anticipez les délais avant qu’ils ne deviennent un problème',
      text: 'Cantia centralise les commandes et les délais fournisseurs par chantier, pour repérer un risque de retard avant qu’il n’impacte le planning.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Une rupture de stock fournisseur peut-elle justifier un dépassement de délai contractuel ?',
      answer:
        'Cela dépend des termes du contrat. Si le délai était formulé comme indicatif ou si une clause de force majeure ou d’imprévu est prévue, cela peut jouer en votre faveur ; sinon, la responsabilité peut rester engagée. Mieux vaut anticiper la formulation du contrat que de s’appuyer dessus après coup.',
    },
    {
      question: 'Faut-il prévenir le client immédiatement en cas de rupture de stock ?',
      answer:
        'Oui, dans l’idéal avec une solution ou un nouveau délai déjà envisagé. Un client informé tôt et avec une proposition concrète réagit presque toujours mieux qu’un client qui découvre le retard sur le chantier.',
    },
    {
      question: 'Comment choisir un fournisseur de secours pour un matériau critique ?',
      answer:
        'Idéalement un fournisseur déjà testé sur d’autres chantiers, avec un délai de livraison comparable, même si son prix est légèrement supérieur au fournisseur principal.',
    },
  ],
  relatedSlugs: [
    'negocier-prix-fournisseur-materiaux-batiment',
    'comparer-devis-fournisseurs-materiaux-methode',
    'previsionnel-tresorerie-entreprise-batiment',
  ],
};
