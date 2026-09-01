import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-menuisier-sur-mesure-facturation-suisse',
  question: 'Comment un menuisier-agenceur doit-il chiffrer un devis de mobilier ou d’agencement sur mesure ?',
  title: 'Menuisier-agenceur : chiffrer le sur-mesure sans perdre le fil du prototype au montage',
  description:
    'Un agencement sur mesure passe par quatre étapes : la prise de cotes, la conception, la fabrication en atelier et le montage sur site, qui méritent chacune leur propre ligne de devis.',
  excerpt:
    'Contrairement à une pose standardisée, chaque projet de menuiserie sur mesure repart de zéro en conception. Un devis qui ne distingue pas le temps de bureau d’étude du temps d’atelier finit par le facturer au même tarif que la pose.',
  category: 'Métiers du bâtiment',
  keywords: ['devis menuisier sur mesure', 'facturation agencement bois', 'prix mobilier sur mesure Suisse', 'devis atelier menuiserie', 'conception agencement facturation'],
  publishedAt: '2026-09-08',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Une cuisine ou une bibliothèque sur mesure ne se chiffre pas comme la pose d’un élément standard. Le temps de conception (prise de cotes, plans, choix des matériaux avec le client) est souvent aussi long que la fabrication elle-même. Il reste pourtant presque toujours le plus mal valorisé, car difficile à montrer concrètement au client au moment de présenter le prix.',
    },
    { type: 'h2', text: 'Quatre étapes, quatre lignes de devis' },
    {
      type: 'list',
      items: [
        'Prise de cotes et étude de faisabilité : à facturer séparément si le projet ne se concrétise pas, ou à intégrer si le devis est signé',
        'Conception et plans techniques : temps de bureau d’étude, souvent sous-évalué',
        'Fabrication en atelier : le poste le plus prévisible, chiffrable au temps ou à la pièce',
        'Pose et ajustements sur site : toujours plus long qu’en atelier, car il faut composer avec l’existant',
      ],
    },
    {
      type: 'stat',
      value: '20-25 %',
      label: 'part typique du temps total d’un projet d’agencement sur mesure consacrée à la conception et aux plans, avant même la première coupe de bois',
    },
    { type: 'h2', text: 'Facturer l’étude quand le projet ne se concrétise pas' },
    {
      type: 'p',
      text: 'Un devis détaillé avec plans personnalisés représente un vrai travail : le fournir systématiquement gratuitement, même quand le client compare plusieurs artisans sans jamais signer, revient à financer la mise en concurrence des autres. Facturer un forfait d’étude, déductible du prix final si le projet est signé, protège ce temps sans décourager les clients sérieux.',
    },
    {
      type: 'callout',
      title: 'Le montage sur site prend presque toujours plus de temps qu’en atelier',
      text: 'Un mur qui n’est pas parfaitement d’équerre, un sol qui n’est pas de niveau : ces ajustements de dernière minute font partie du métier, mais doivent être provisionnés dans le temps de pose plutôt que de venir grignoter la marge du projet.',
    },
    {
      type: 'cta',
      title: 'Un devis qui distingue étude, fabrication et pose',
      text: 'Cantia permet de structurer un devis en postes clairs, avec le catalogue de vos prix récurrents pour ne pas repartir de zéro à chaque nouveau projet sur mesure.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Faut-il facturer la prise de cotes et les plans d’un agencement sur mesure ?',
      answer:
        'C’est recommandé, au moins comme un forfait d’étude déductible du prix final si le devis est signé, car cela protège un temps de travail réel qui reste souvent invisible pour le client.',
    },
    {
      question: 'Comment chiffrer le temps de montage d’un agencement sur mesure ?',
      answer:
        'En prévoyant systématiquement une marge par rapport au temps théorique d’atelier, car les irrégularités du bâti existant (murs, sols) allongent presque toujours la pose réelle.',
    },
    {
      question: 'Le devis de menuiserie sur mesure doit-il inclure une clause de modification ?',
      answer:
        'Oui. Un client qui change d’avis sur une finition ou une dimension après validation des plans doit générer un avenant chiffré, pas une modification silencieuse absorbée dans le prix initial.',
    },
  ],
  relatedSlugs: [
    'avenant-chantier-plus-value-moins-value',
    'devis-oral-valeur-legale-suisse',
    'validite-devis-signe-prix-qui-bouge',
  ],
};
