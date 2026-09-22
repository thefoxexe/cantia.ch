import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'prix-renovation-cuisine-suisse',
  question: 'Quel est le prix moyen d’une rénovation de cuisine en Suisse ?',
  title: 'Prix moyen d’une rénovation de cuisine en Suisse',
  description:
    'Fourchettes réalistes pour une rénovation de cuisine en Suisse selon le standing (agencement standard, milieu de gamme, sur mesure), avec le détail poste par poste.',
  excerpt:
    'Entre une cuisine en kit et une cuisine sur mesure avec électroménager haut de gamme, le prix peut varier du simple au quadruple pour une surface identique.',
  category: 'Devis & facturation',
  keywords: ['prix', 'rénovation', 'cuisine', 'devis', 'agencement', 'électroménager'],
  publishedAt: '2026-09-25',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'La cuisine est souvent le poste le plus cher d’une rénovation d’appartement, et aussi le plus difficile à chiffrer au téléphone : deux cuisines de même surface peuvent afficher un écart de prix considérable selon l’agencement choisi.',
    },
    { type: 'h2', text: '1. Trois niveaux de standing, trois budgets très différents' },
    {
      type: 'p',
      text: 'Pour une cuisine standard en kit avec pose (meubles de série, plan de travail stratifié, électroménager encastrable d’entrée de gamme), comptez généralement entre CHF 12’000 et 20’000. En milieu de gamme avec agencement semi-sur-mesure, la fourchette monte souvent à CHF 20’000 – 35’000. Une cuisine entièrement sur mesure avec électroménager haut de gamme peut facilement dépasser CHF 40’000 à 50’000.',
    },
    { type: 'h2', text: '2. Le détail poste par poste' },
    {
      type: 'table',
      headers: ['Poste', 'Détail', 'Fourchette CHF'],
      rows: [
        ['Agencement', 'Meubles, plan de travail, pose', '6’000 – 20’000'],
        ['Électroménager', 'Four, plaque, réfrigérateur, lave-vaisselle, hotte', '3’000 – 12’000'],
        ['Plomberie', 'Raccordement évier, éventuel déplacement d’arrivée', '1’000 – 3’000'],
        ['Électricité', 'Prises, éclairage, raccordement électroménager', '1’500 – 3’500'],
        ['Total indicatif', 'Cuisine standard à milieu de gamme, 8-10 m²', '12’000 – 35’000'],
      ],
    },
    { type: 'h2', text: '3. Ce qui fait le plus varier le devis' },
    {
      type: 'p',
      text: 'Le premier facteur de variation, ce n’est pas la surface, c’est le choix de garder ou non l’implantation existante. Déplacer le point d’eau ou l’arrivée électrique d’une cuisine implique souvent d’ouvrir le sol ou le mur, ce qui ajoute plusieurs corps de métier au chantier. Le second facteur, c’est la qualité de l’électroménager : sur une cuisine de milieu de gamme, l’électroménager haut de gamme peut à lui seul représenter le tiers du budget total.',
    },
    {
      type: 'callout',
      title: 'Le devis qui oublie l’électroménager',
      text: 'Beaucoup de devis de cuisine chiffrent uniquement l’agencement et laissent le client acheter l’électroménager séparément « pour comparer les prix ». Le résultat est souvent une facture finale bien supérieure à l’estimation initiale. Mieux vaut inclure une ligne électroménager avec une fourchette claire dès le départ, même provisoire.',
    },
    {
      type: 'cta',
      title: 'Un devis de cuisine qui ne cache aucune ligne',
      text: 'Agencement, électroménager, plomberie, électricité : Cantia vous permet de détailler chaque poste d’un devis de cuisine avec vos propres prix catalogue, pour que le client voie exactement ce qu’il paie.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Quel est le prix moyen d’une cuisine standard posée en Suisse ?',
      answer:
        'Pour une cuisine en kit de série avec pose et électroménager d’entrée de gamme, comptez généralement entre CHF 12’000 et 20’000 pour une surface de 8 à 10 m². Le prix grimpe rapidement dès qu’on passe à du semi-sur-mesure.',
    },
    {
      question: 'Pourquoi une cuisine sur mesure coûte-t-elle tellement plus cher ?',
      answer:
        'Le sur-mesure implique une fabrication spécifique à l’espace (pas de dimensions standardisées), souvent des matériaux plus nobles, et un temps de pose plus long. L’écart avec une cuisine en kit peut atteindre le double ou le triple pour une surface identique.',
    },
    {
      question: 'Faut-il inclure l’électroménager dans le devis global de cuisine ?',
      answer:
        'C’est fortement recommandé, même sous forme de fourchette indicative si le client n’a pas encore choisi ses appareils. Cela évite les mauvaises surprises et donne une vision réaliste du budget total dès le premier devis.',
    },
  ],
  relatedSlugs: [
    'prix-renovation-salle-de-bain-suisse-m2',
    'calculer-prix-devis-renovation-suisse',
    'calculer-prix-de-revient-chantier-batiment',
  ],
};
