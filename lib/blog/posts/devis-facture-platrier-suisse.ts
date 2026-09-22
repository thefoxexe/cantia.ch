import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-facture-platrier-suisse',
  question: 'Comment établir devis et factures en tant que plâtrier en Suisse ?',
  title: 'Devis et facturation pour un plâtrier en Suisse',
  description:
    'Comment chiffrer un devis et facturer en tant que plâtrier en Suisse : prix au m² pour cloisons et faux-plafonds, distinction gros-œuvre intérieur et finitions.',
  excerpt:
    'Cloisons, faux-plafonds, enduits : le plâtrier chiffre au m², mais pas au même prix selon qu’il pose une structure ou qu’il finit une surface. Voici comment structurer le devis.',
  category: 'Métiers du bâtiment',
  keywords: [
    'devis plâtrier suisse',
    'facturation cloisons prix m2',
    'prix faux plafond devis',
    'plâtrier enduit facturation',
  ],
  publishedAt: '2026-10-03',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Le plâtrier chiffre l’essentiel de son travail au m², mais mélanger toutes les prestations sous un seul prix au mètre carré est l’erreur la plus commune sur ce type de devis. Poser une cloison n’a pas le même coût, ni la même logique, que réaliser un enduit de finition sur un mur existant.',
    },
    { type: 'h2', text: 'Deux logiques distinctes sous un même métier' },
    {
      type: 'list',
      items: [
        'Le gros-œuvre intérieur : cloisons en plaques de plâtre, faux-plafonds, doublages — chiffré au m² sur la base de la surface d’ossature et de plaques posées',
        'Les finitions : enduits, joints, ponçage — chiffré au m² également, mais sur des bases de prix très différentes, car le temps de travail dépend surtout de la qualité de finition demandée',
      ],
    },
    {
      type: 'p',
      text: 'Un devis clair sépare systématiquement ces deux postes, même sur un même chantier. Cela évite au client de comparer un prix « tout compris » avec le devis d’un autre artisan qui n’aurait chiffré que la structure, sans les finitions.',
    },
    { type: 'h2', text: 'La coordination avec le peintre, un point de friction classique' },
    {
      type: 'p',
      text: 'En fin de chantier, le plâtrier livre des surfaces qui doivent être prêtes à peindre. Le niveau de finition attendu (nombre de couches d’enduit, qualité du ponçage) doit être défini dans le devis avec le client, car c’est souvent le point de désaccord entre le plâtrier et le peintre quand la surface livrée n’est pas jugée suffisamment lisse. Préciser le niveau de finition visé (standard ou soigné) sur le devis limite ce type de litige.',
    },
    {
      type: 'callout',
      title: 'Le prix au m² cache une grande variabilité',
      text: 'Deux cloisons de même surface peuvent avoir un coût très différent selon la hauteur sous plafond, la présence de découpes autour de portes et fenêtres, ou l’intégration de gaines techniques. Le devis doit préciser ces conditions, pas seulement un prix au m² brut.',
    },
    {
      type: 'cta',
      title: 'Séparez structure et finition dans chaque devis',
      text: 'Cantia permet de détailler un devis de plâtrerie poste par poste, cloisons et finitions séparées, pour des factures qui correspondent exactement à ce qui a été livré.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Faut-il séparer le prix des cloisons et celui des enduits sur le devis ?',
      answer:
        'Oui, ce sont deux prestations avec des bases de prix différentes. Les regrouper sous un seul prix au m² rend le devis difficile à comparer et à justifier en cas de modification en cours de chantier.',
    },
    {
      question: 'Qui décide du niveau de finition attendu avant peinture ?',
      answer:
        'Cela doit être précisé au devis, en accord avec le client et si possible avec le peintre qui interviendra ensuite, pour éviter un désaccord sur la qualité du support livré en fin de chantier.',
    },
    {
      question: 'Pourquoi deux cloisons de même surface peuvent-elles coûter différemment ?',
      answer:
        'La hauteur sous plafond, les découpes autour des ouvertures et l’intégration de gaines techniques font varier le temps de pose réel, indépendamment de la surface brute en m² annoncée.',
    },
  ],
  relatedSlugs: [
    'devis-peintre-batiment-calcul-surface-suisse',
    'logiciel-devis-facture-maconnerie-suisse',
    'checklist-cloture-chantier-avant-facturation',
  ],
  relatedTradeSlug: 'platrier',
};
