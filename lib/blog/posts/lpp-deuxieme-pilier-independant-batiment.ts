import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'lpp-deuxieme-pilier-independant-batiment',
  question: 'Un indépendant du bâtiment doit-il cotiser au 2e pilier (LPP) ?',
  title: 'LPP pour un indépendant du bâtiment : obligatoire ou pas ?',
  description:
    'Le 2e pilier (LPP) n’est pas obligatoire pour un indépendant suisse — sauf exceptions sectorielles liées à la SUVA dans certains métiers du bâtiment. Le point complet.',
  excerpt:
    'Contrairement à l’AVS/AI, le 2e pilier reste facultatif pour la plupart des indépendants — mais pas pour tous les métiers du bâtiment, à cause de la SUVA.',
  category: 'Juridique & normes',
  keywords: ['lpp', '2e pilier', 'indépendant', 'suva', 'laa', 'prévoyance'],
  publishedAt: '2026-01-29',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Beaucoup d’artisans qui se mettent à leur compte supposent que toutes les assurances sociales suisses sont obligatoires de la même façon. Ce n’est pas le cas pour le 2e pilier (LPP) — mais la réponse se complique dès qu’on entre dans certains métiers du bâtiment couverts par la SUVA.',
    },
    { type: 'h2', text: 'La règle générale : facultatif' },
    {
      type: 'p',
      text: 'Pour un salarié, l’affiliation LPP est obligatoire dès un certain seuil de salaire (le "salaire coordonné"). Pour un indépendant, en revanche, la LPP est facultative : elle peut s’y affilier volontairement, auprès de sa caisse de prévoyance professionnelle ou de l’institution supplétive, mais n’y est pas tenu par la loi.',
    },
    {
      type: 'callout',
      title: 'Pourquoi s’affilier volontairement quand même',
      text: 'Sans 2e pilier, un indépendant compte uniquement sur l’AVS (1er pilier) et son épargne privée pour la retraite. Les cotisations LPP volontaires sont aussi déductibles fiscalement, ce qui en fait un outil de prévoyance et d’optimisation fiscale à la fois — à évaluer avec un professionnel selon la situation.',
    },
    { type: 'h2', text: 'L’exception LAA/SUVA dans le bâtiment' },
    {
      type: 'p',
      text: 'Ce qui complique la donne dans le bâtiment, c’est la LAA (assurance-accidents), pas la LPP directement. Pour les salariés, la LAA est obligatoire — et gérée par la SUVA dans de nombreux métiers du bâtiment considérés à risque (gros œuvre, couverture, échafaudage, génie civil). Pour un indépendant sans employé, la LAA reste en principe facultative, sauf dans certains métiers où la SUVA impose une affiliation même aux indépendants exerçant une activité dangereuse listée par l’ordonnance.',
    },
    {
      type: 'list',
      items: [
        'LPP (2e pilier retraite) : facultative pour tout indépendant, sans exception liée au métier',
        'LAA (accidents) : facultative pour l’indépendant sans personnel, mais obligatoire pour ses employés dès le premier salarié engagé',
        'Certains métiers à risque du bâtiment peuvent tomber sous affiliation SUVA obligatoire même pour l’indépendant lui-même — à vérifier au cas par cas',
      ],
    },
    { type: 'h2', text: 'Dès le premier employé, tout change' },
    {
      type: 'p',
      text: 'Un indépendant qui engage son premier collaborateur devient employeur au sens des assurances sociales : LAA obligatoire pour ce collaborateur, et LPP obligatoire dès que son salaire dépasse le seuil d’entrée fixé chaque année. C’est un moment charnière administratif souvent sous-estimé lors de la première embauche.',
    },
    {
      type: 'cta',
      title: 'Les salaires de l’équipe, sans prise de tête',
      text: 'Le module RH & Salaires de Cantia centralise les heures, les salaires et les charges de votre équipe au même endroit que vos chantiers et vos devis.',
      buttonLabel: 'Découvrir RH & Salaires',
    },
  ],
  faq: [
    {
      question: 'Un indépendant du bâtiment doit-il obligatoirement cotiser au 2e pilier ?',
      answer:
        'Non, en règle générale la LPP reste facultative pour tout indépendant en Suisse — il peut s’y affilier volontairement mais n’y est pas légalement tenu.',
    },
    {
      question: 'La SUVA peut-elle imposer une assurance à un indépendant sans employé ?',
      answer:
        'Dans certains métiers du bâtiment considérés à risque, l’affiliation à la LAA/SUVA peut être obligatoire même pour l’indépendant lui-même — cela dépend de l’activité exacte exercée, à vérifier auprès de la SUVA.',
    },
    {
      question: 'Que devient l’obligation LPP dès qu’on engage un premier salarié ?',
      answer:
        'Dès le premier employé, l’employeur doit l’affilier à la LAA obligatoirement, et à la LPP dès que son salaire annuel dépasse le seuil d’entrée fixé chaque année par la Confédération.',
    },
  ],
  relatedSlugs: [
    'avs-ai-independant-batiment',
    'calculer-heures-travail-ouvrier-minutes-decimales',
    'sous-traitant-batiment-suisse-contrat-facturation',
  ],
};
