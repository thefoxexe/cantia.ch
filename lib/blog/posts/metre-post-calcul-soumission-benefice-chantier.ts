import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'metre-post-calcul-soumission-benefice-chantier',
  question: 'Comment savoir si une soumission vous a vraiment rapporté de l’argent, une fois le chantier fait ?',
  title: 'Métré et post-calcul : savoir si une soumission vous a vraiment rapporté',
  description:
    'La soumission dit ce que vous avez vendu, le métré ce que vous avez exécuté. Comparer les deux, position par position, montre où vous gagnez et où vous perdez de l’argent.',
  excerpt:
    'Une soumission gagnée n’est pas encore un chantier rentable. Entre les quantités qui changent, les rendements et les imprévus, seul le post-calcul dit si vous avez vraiment gagné de l’argent.',
  category: 'Chantier & rentabilité',
  keywords: ['métré chantier', 'post-calcul chantier', 'métré après soumission', 'rentabilité soumission', 'quantités exécutées', 'prix unitaire soumission'],
  publishedAt: '2026-11-18',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Le jour où vous remplissez une soumission, vous fixez un prix unitaire pour chaque position, sur la base des quantités de l’architecte et de vos rendements habituels. Puis le chantier commence : certaines quantités augmentent, d’autres diminuent, un coffrage prend plus de temps que prévu, un travail non prévu s’ajoute. Sans post-calcul, vous ne savez pas si la soumission vous a fait gagner de l’argent ou si elle vous en a coûté.',
    },
    { type: 'h2', text: 'Soumission, métré, post-calcul : de quoi parle-t-on ?' },
    {
      type: 'list',
      items: [
        'La soumission : ce que vous avez offert, avec les quantités du document et vos prix unitaires.',
        'Le métré : les quantités réellement exécutées sur le chantier, mesurées ou relevées position par position.',
        'Le post-calcul : la comparaison entre ce que vous pouvez facturer et ce que chaque position vous a réellement coûté.',
      ],
    },
    { type: 'h2', text: 'Ce que le métré change dans un contrat à prix unitaires' },
    {
      type: 'p',
      text: 'Avec un contrat à prix unitaires, vous facturez les quantités réellement exécutées aux prix unitaires de la soumission. Si le radier demande 46 m³ de béton au lieu des 42 m³ prévus, vous facturez 46 m³. Le métré sert donc deux fois : pour établir la facture, et pour savoir ce que chaque position vous a laissé une fois vos coûts déduits.',
    },
    { type: 'h2', text: 'Faire le post-calcul d’une soumission, étape par étape' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Partez de la soumission remplie : mêmes chapitres, mêmes positions, mêmes unités.',
        'Pour chaque position, relevez la quantité réellement exécutée.',
        'Calculez le facturable : quantité exécutée × prix unitaire de la soumission.',
        'Mettez en face votre coût réel par unité : heures passées au taux horaire réel, matériel, location de machines, sous-traitance.',
        'Bénéfice de la position = facturable − (quantité exécutée × coût réel par unité). Additionnez ensuite par chapitre, puis pour tout le chantier, sans oublier le rabais et l’escompte accordés dans la soumission.',
      ],
    },
    { type: 'h2', text: 'Exemple de calcul sur deux positions' },
    {
      type: 'table',
      headers: ['Position', 'Soumission', 'Exécuté et coût réel', 'Facturable', 'Coût réel', 'Bénéfice'],
      rows: [
        ['Béton pour radier', '42 m³ × CHF 210', '46 m³ × CHF 168', 'CHF 9’660', 'CHF 7’728', 'CHF 1’932'],
        ['Coffrage des murs', '180 m² × CHF 38', '196 m² × CHF 41', 'CHF 7’448', 'CHF 8’036', '− CHF 588'],
      ],
    },
    {
      type: 'p',
      text: 'Sur ces deux positions, le total reste positif : CHF 1’344. Pourtant, le coffrage coûte plus qu’il ne rapporte. Le chiffre global masque une position qu’il faudra recalculer avant la prochaine soumission.',
    },
    {
      type: 'callout',
      title: 'Le piège : ne regarder que le total',
      text: 'Un chantier bénéficiaire peut cacher plusieurs positions en perte, compensées par une ou deux positions très rentables. Tant que le post-calcul s’arrête au total, ces positions restent mal chiffrées d’une soumission à l’autre.',
    },
    { type: 'h2', text: 'Que faire d’une position en perte ?' },
    {
      type: 'list',
      items: [
        'Vérifier le rendement : le temps réellement passé par unité correspond-il à celui utilisé pour chiffrer ?',
        'Revoir le prix unitaire de la position dans votre catalogue, pour la prochaine soumission.',
        'Regarder si la perte vient d’une condition particulière du chantier (accès, hauteur, météo) qu’il faudra mentionner dans l’offre.',
        'Comparer avec le coût d’une sous-traitance pour ce type de travail.',
      ],
    },
    { type: 'h2', text: 'Et les travaux qui n’étaient pas dans la soumission ?' },
    {
      type: 'p',
      text: 'Un travail ajouté en cours de chantier n’a pas de prix dans la soumission. Il doit être chiffré et facturé à part, idéalement accepté par écrit avant l’exécution. Dans le post-calcul, son coût compte quand même : s’il n’est pas facturé, il réduit directement le bénéfice du chantier.',
    },
    {
      type: 'cta',
      title: 'Le post-calcul dans Cantia',
      text: 'Avec le module Métrés, vous reprenez la soumission du chantier en un clic, vous mettez les quantités exécutées et vos coûts réels, et vous ajoutez les travaux en plus. Cantia affiche le facturable, le coût réel, le bénéfice et la marge, position par position.',
      buttonLabel: 'Essayer 14 jours',
    },
  ],
  faq: [
    {
      question: 'Quelle différence entre une soumission et un métré ?',
      answer:
        'La soumission contient ce que vous avez offert : quantités prévues et prix unitaires. Le métré relève les quantités réellement exécutées sur le chantier. Comparer les deux, avec vos coûts réels, donne le bénéfice de chaque position.',
    },
    {
      question: 'Comment calculer le bénéfice d’une position de soumission ?',
      answer:
        'Facturable = quantité exécutée × prix unitaire de la soumission. Coût réel = quantité exécutée × coût réel par unité. Le bénéfice est la différence entre les deux.',
    },
    {
      question: 'Quand faire le post-calcul d’un chantier ?',
      answer:
        'Dès que les quantités sont connues, idéalement en cours de chantier pour corriger le tir, et au plus tard à la facture finale, quand le métré est établi.',
    },
  ],
  relatedSlugs: ['calculer-prix-unitaire-soumission', 'suivre-rentabilite-chantier-sans-excel', 'calculer-prix-horaire-reel-ouvrier-batiment'],
};
