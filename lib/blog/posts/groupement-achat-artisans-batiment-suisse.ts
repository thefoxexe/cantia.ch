import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'groupement-achat-artisans-batiment-suisse',
  question: 'Comment fonctionne un groupement d’achat entre artisans du bâtiment ?',
  title: 'Groupement d’achat entre artisans : une idée sous-exploitée',
  description:
    'Le principe du groupement d’achat entre artisans indépendants du bâtiment, ses avantages au-delà du prix, et comment en démarrer un à petite échelle.',
  excerpt:
    'Se regrouper à plusieurs entreprises pour acheter en plus gros volume, une pratique courante dans d’autres métiers artisanaux mais encore rare dans le bâtiment.',
  category: 'Chantier & rentabilité',
  keywords: ['groupement achat artisans bâtiment', 'achat groupé matériaux construction'],
  publishedAt: '2026-10-09',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Dans l’agriculture ou la boulangerie, les groupements d’achat entre indépendants sont une pratique ancienne. Dans le bâtiment, l’idée reste marginale — alors qu’elle peut faire une vraie différence sur le prix des matériaux pour une petite entreprise seule.',
    },
    { type: 'h2', text: 'Le principe' },
    {
      type: 'p',
      text: 'Plusieurs entreprises indépendantes, souvent de métiers différents ou de zones géographiques différentes pour ne pas se faire concurrence directement, se regroupent pour passer leurs commandes de matériaux ensemble. Le volume cumulé permet de négocier des conditions qu’aucune d’elles n’obtiendrait seule.',
    },
    { type: 'h2', text: 'Des avantages qui vont au-delà du prix' },
    {
      type: 'list',
      items: [
        'Partage d’informations sur les fournisseurs fiables et ceux à éviter',
        'Mutualisation de certains équipements coûteux et peu utilisés (matériel spécifique, engins de location)',
        'Négociation collective des délais de livraison, pas seulement des prix',
      ],
    },
    { type: 'h2', text: 'Pourquoi c’est rare, mais pas impossible' },
    {
      type: 'p',
      text: 'Le bâtiment reste un secteur où les entreprises se perçoivent d’abord comme concurrentes, même quand elles ne le sont pas directement. C’est ce qui freine la pratique, plus qu’une vraie difficulté organisationnelle. Dans les faits, un groupement d’achat entre deux ou trois entreprises non concurrentes — un maçon et un électricien, par exemple — est simple à mettre en place et ne demande aucune structure juridique lourde pour démarrer.',
    },
    { type: 'h2', text: 'Comment démarrer à petite échelle' },
    {
      type: 'p',
      text: 'Pas besoin de créer une association ou une société pour commencer. Deux ou trois entreprises voisines peuvent simplement convenir de grouper certaines commandes récurrentes (béton, bois, quincaillerie) auprès d’un même fournisseur, et négocier ensemble un tarif de volume. La formalisation peut venir plus tard, une fois la pratique installée et utile.',
    },
    {
      type: 'callout',
      title: 'Le bon partenaire de groupement n’est pas un concurrent, c’est un complémentaire',
      text: 'Un groupement fonctionne mieux entre entreprises de métiers différents ou de zones différentes, qui n’ont aucun intérêt à se retenir d’informations. Entre concurrents directs, la méfiance freine presque toujours la pratique.',
    },
    {
      type: 'cta',
      title: 'Suivez vos coûts d’achat matériaux pour savoir si un groupement en vaut la peine',
      text: 'Cantia donne une vue claire de ce que vous dépensez par fournisseur et par matériau, pour évaluer concrètement le gain potentiel d’un achat groupé.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Un groupement d’achat nécessite-t-il une structure juridique ?',
      answer:
        'Pas au démarrage. Une simple entente informelle entre deux ou trois entreprises suffit pour tester la pratique. Une structure plus formelle (association, coopérative) peut être envisagée si le groupement grandit.',
    },
    {
      question: 'Comment répartir la commande groupée entre les entreprises ?',
      answer:
        'Généralement au prorata des quantités commandées par chacune, avec une facturation séparée par le fournisseur à chaque entreprise, ou une redistribution interne selon ce qui a été convenu au départ.',
    },
    {
      question: 'Un groupement d’achat pose-t-il un problème de concurrence entre les membres ?',
      answer:
        'Uniquement si les membres sont en concurrence directe sur les mêmes chantiers. C’est pourquoi les groupements fonctionnent mieux entre métiers complémentaires ou zones géographiques distinctes.',
    },
  ],
  relatedSlugs: [
    'negocier-prix-fournisseur-materiaux-batiment',
    'comparer-devis-fournisseurs-materiaux-methode',
    'marge-beneficiaire-entreprise-batiment-suisse',
  ],
};
