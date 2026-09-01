import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'checklist-logiciels-ouverture-societe-construction',
  question: 'Existe-t-il une checklist des logiciels à mettre en place à l\'ouverture d\'une société de construction ?',
  title: 'Checklist logiciels pour l\'ouverture d\'une société de construction',
  description:
    'Une liste concrète et ordonnée des outils numériques à mettre en place au moment de créer sa société de construction, sans rien oublier ni s\'équiper inutilement.',
  excerpt:
    'Entre l\'inscription au registre du commerce et le premier chantier, il y a une fenêtre courte pour mettre en place ses outils numériques. Autant avoir une checklist sous la main plutôt que d\'improviser.',
  category: 'Comparatifs & outils',
  keywords: ['checklist logiciels ouverture société construction', 'liste outils création entreprise bâtiment', 'préparer logiciels avant premier chantier', 'setup numérique nouvelle entreprise construction', 'démarches logicielles création société'],
  publishedAt: '2026-08-01',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Entre la création officielle d\'une société de construction et le premier chantier facturé, le temps presse souvent. Une checklist claire évite d\'improviser dans l\'urgence, ou pire, de découvrir un manque une fois le premier client déjà en attente.',
    },
    { type: 'h2', text: 'La checklist, dans l\'ordre' },
    {
      type: 'list',
      items: [
        '1. Choisir et configurer un outil de devis/factures, avec les bonnes coordonnées bancaires et le bon taux de TVA',
        '2. Créer un catalogue de prix de base pour les prestations les plus courantes de l\'entreprise',
        '3. Mettre en place un moyen de documenter les chantiers (photos, avancement)',
        '4. Vérifier l\'accès mobile complet, pour ne pas dépendre d\'un bureau fixe',
        '5. Prévoir un espace pour archiver les documents légaux et contractuels dès le premier chantier',
      ],
    },
    {
      type: 'stat',
      value: '< 1 jour',
      label: 'temps généralement nécessaire pour configurer un outil de gestion de base (coordonnées, catalogue de prix initial) avant le premier devis',
    },
    { type: 'h2', text: 'Ne pas attendre le premier client pour tester l\'outil' },
    {
      type: 'p',
      text: 'Créer un devis fictif ou une facture test avant le lancement officiel permet de repérer les points à ajuster (mise en page, informations manquantes) sans que ça n\'impacte un vrai client.',
    },
    {
      type: 'callout',
      title: 'Le catalogue de prix se construit mieux progressivement',
      text: 'Pas besoin d\'avoir un catalogue complet dès le premier jour. L\'ajouter au fil des premiers devis, prestation par prestation, reste plus réaliste que de tout anticiper d\'un coup.',
    },
    {
      type: 'cta',
      title: 'Prêt à facturer dès la première utilisation',
      text: 'Cantia se configure en quelques minutes (coordonnées, catalogue de prix, premiers devis) avant même l\'arrivée du premier client.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Quelle est la première étape logicielle à l\'ouverture d\'une société de construction ?',
      answer:
        'Configurer un outil de devis/factures avec les bonnes coordonnées bancaires et le bon taux de TVA, avant même de créer un catalogue de prix complet.',
    },
    {
      question: 'Faut-il un catalogue de prix complet dès l\'ouverture de la société ?',
      answer:
        'Non : il peut se construire progressivement, prestation par prestation, au fil des premiers devis réels plutôt que d\'être anticipé entièrement à l\'avance.',
    },
    {
      question: 'Est-il utile de tester l\'outil avant le premier vrai client ?',
      answer:
        'Oui, créer un devis ou une facture test permet de repérer les ajustements nécessaires sans impact sur un vrai client.',
    },
  ],
  relatedSlugs: [
    'checklist-ouverture-chantier-artisan',
    'demarrer-entreprise-batiment-outils-indispensables',
    'quel-logiciel-choisir-demarrer-entreprise-construction',
  ],
};
