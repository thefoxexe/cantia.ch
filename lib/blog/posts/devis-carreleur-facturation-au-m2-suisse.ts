import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-carreleur-facturation-au-m2-suisse',
  question: 'Comment un carreleur doit-il chiffrer un devis au m² sans se faire piéger par la découpe et la pose complexe ?',
  title: 'Devis de carrelage : pourquoi le prix au m² ne suffit jamais seul',
  description:
    'Format du carreau, motif de pose, découpes, plans de calepinage : autant de facteurs qui font varier fortement le temps de pose d’un carrelage, à surface égale. Comment les intégrer au devis.',
  excerpt:
    'Deux pièces de la même surface, carrelées avec le même matériau, peuvent demander deux fois plus de temps selon le format des carreaux et le motif de pose choisi : le prix au m² seul ne raconte jamais toute l’histoire.',
  category: 'Métiers du bâtiment',
  keywords: ['devis carreleur', 'prix carrelage au m2 Suisse', 'facturation pose carrelage', 'calepinage devis', 'découpe carrelage temps de pose'],
  publishedAt: '2026-09-03',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Le client compare naturellement les devis de carrelage au prix au m², car c’est le chiffre qu’il retient. Mais ce chiffre seul ne dit rien du temps de pose réel, qui dépend fortement du format des carreaux, du motif choisi (droit, diagonale, chevron) et du nombre de découpes autour des angles, prises électriques ou sanitaires déjà en place.',
    },
    { type: 'h2', text: 'Ce qui fait varier le temps de pose, à surface égale' },
    {
      type: 'list',
      items: [
        'Grand format (60x60 et plus) : pose plus rapide au m², mais manipulation plus délicate et nivellement plus exigeant',
        'Petit format ou mosaïque : beaucoup plus de joints, donc un temps de pose largement supérieur au m²',
        'Motif diagonale ou chevron : davantage de découpes qu’une pose droite classique, souvent 20 à 30 % de temps en plus',
        'Nombre d’angles, de tuyauteries et de sanitaires déjà posés autour desquels découper',
      ],
    },
    {
      type: 'stat',
      value: '+20-30 %',
      label: 'temps de pose supplémentaire typique pour un motif diagonale ou chevron par rapport à une pose droite, à surface identique',
    },
    { type: 'h2', text: 'Prévoir une marge de casse dès le devis' },
    {
      type: 'p',
      text: 'Une commande de carrelage sans marge de casse expose à devoir recommander en urgence, avec le risque de ne plus trouver le même lot ni la même teinte. Intégrer une marge de 8 à 12 % selon la complexité de la pose au moment du devis évite ce genre de mauvaise surprise en plein chantier.',
    },
    {
      type: 'callout',
      title: 'Le ragréage du support n’est pas toujours visible avant chantier',
      text: 'Un sol qui semble plat à l’œil peut nécessiter un ragréage une fois l’ancien revêtement retiré. Prévoir cette possibilité au devis (même en option chiffrée à part) évite de devoir renégocier un prix en plein milieu du chantier.',
    },
    {
      type: 'cta',
      title: 'Des devis qui gardent vos prix par format et par motif',
      text: 'Cantia conserve votre catalogue de prix (format, motif, marge de casse) pour composer un devis de carrelage cohérent en quelques minutes, sans tout recalculer à chaque nouveau chantier.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Pourquoi deux devis de carrelage à surface identique peuvent-ils avoir des prix très différents ?',
      answer:
        'Le format des carreaux, le motif de pose (droit, diagonale, chevron) et le nombre de découpes autour des obstacles font varier fortement le temps de pose réel, même à surface égale.',
    },
    {
      question: 'Quelle marge de casse prévoir sur une commande de carrelage ?',
      answer:
        'Généralement entre 8 et 12 % selon la complexité de la pose, car un motif avec beaucoup de découpes consomme davantage de carreaux qu’une pose droite simple.',
    },
    {
      question: 'Faut-il prévoir le ragréage du support dans le devis initial de carrelage ?',
      answer:
        'C’est recommandé, au moins en option chiffrée à part, car l’état réel du support n’est souvent visible qu’une fois l’ancien revêtement retiré.',
    },
  ],
  relatedSlugs: [
    'calculer-prix-devis-renovation-suisse',
    'checklist-ouverture-chantier-artisan',
    'devis-menuisier-sur-mesure-facturation-suisse',
  ],
};
