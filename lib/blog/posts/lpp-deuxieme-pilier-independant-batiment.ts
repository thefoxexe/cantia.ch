import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'lpp-deuxieme-pilier-independant-batiment',
  question: 'Un indépendant du bâtiment doit-il cotiser au 2e pilier (LPP) ?',
  title: 'LPP pour un indépendant du bâtiment : obligatoire ou pas ?',
  description:
    'Le 2e pilier (LPP) n’est pas obligatoire pour un indépendant suisse, à l’exception de certains métiers du bâtiment liés à la SUVA. Le point complet.',
  excerpt:
    'La LPP est facultative pour un indépendant. Sauf que dans certains métiers du bâtiment, la SUVA peut en décider autrement sans que personne ne vous prévienne.',
  category: 'Juridique & normes',
  keywords: ['lpp', '2e pilier', 'indépendant', 'suva', 'laa', 'prévoyance'],
  publishedAt: '2026-01-29',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Beaucoup d’artisans qui se mettent à leur compte supposent que toutes les assurances sociales suisses fonctionnent sur le même mode obligatoire que l’AVS. Faux pour le 2e pilier. Mais la réponse se complique sérieusement dès qu’on entre dans certains métiers du bâtiment couverts par la SUVA.',
    },
    { type: 'h2', text: 'La règle générale : facultatif, point' },
    {
      type: 'p',
      text: 'Pour un salarié, la LPP devient obligatoire dès un seuil de salaire précis (le « salaire coordonné »). Pour un indépendant, elle reste facultative : possible de s’y affilier volontairement auprès d’une caisse de prévoyance ou de l’institution supplétive, mais aucune obligation légale.',
    },
    {
      type: 'callout',
      title: 'Pourquoi s’affilier volontairement quand même',
      text: 'Sans 2e pilier, un indépendant ne compte que sur l’AVS et son épargne privée pour la retraite. Les cotisations LPP volontaires sont aussi déductibles fiscalement, ce qui en fait à la fois un outil de prévoyance et d’optimisation fiscale, à évaluer avec un professionnel selon la situation exacte.',
    },
    { type: 'h2', text: 'L’exception qui piège tout le monde : la LAA/SUVA' },
    {
      type: 'p',
      text: 'Ce qui complique la donne, ce n’est pas la LPP directement, c’est la LAA (assurance-accidents). Pour les salariés, elle est obligatoire et gérée par la SUVA dans de nombreux métiers du bâtiment considérés à risque, dont le gros œuvre, la couverture, l’échafaudage et le génie civil. Pour un indépendant sans employé, la LAA reste en principe facultative, sauf dans certains métiers où la SUVA impose une affiliation même à l’indépendant lui-même, sur la base d’une liste réglementaire que peu de gens consultent avant de signer leur premier chantier.',
    },
    {
      type: 'list',
      items: [
        'LPP (2e pilier retraite) : facultative pour tout indépendant, sans exception liée au métier',
        'LAA (accidents) : facultative pour l’indépendant sans personnel, obligatoire pour ses employés dès le premier engagé',
        'Certains métiers à risque du bâtiment peuvent tomber sous affiliation SUVA obligatoire même pour l’indépendant (à vérifier au cas par cas)',
      ],
    },
    { type: 'h2', text: 'Le vrai basculement : le premier employé' },
    {
      type: 'p',
      text: 'Un indépendant qui engage son premier collaborateur devient employeur au sens des assurances sociales : LAA obligatoire pour ce collaborateur, LPP obligatoire dès que son salaire dépasse le seuil d’entrée fixé chaque année. C’est le moment administratif le plus sous-estimé de la première embauche : le nombre de formulaires double sans qu’on l’ait vu venir.',
    },
    {
      type: 'cta',
      title: 'Les salaires de l’équipe, au même endroit que le chantier',
      text: 'Le module RH & Salaires de Cantia centralise heures, salaires et charges de votre équipe, sans jongler entre trois outils différents à chaque fin de mois.',
      buttonLabel: 'Découvrir RH & Salaires',
    },
  ],
  faq: [
    {
      question: 'Un indépendant du bâtiment doit-il obligatoirement cotiser au 2e pilier ?',
      answer:
        'Non, en règle générale la LPP reste facultative pour tout indépendant en Suisse. Il peut s’y affilier volontairement mais n’y est pas légalement tenu.',
    },
    {
      question: 'La SUVA peut-elle imposer une assurance à un indépendant sans employé ?',
      answer:
        'Dans certains métiers du bâtiment considérés à risque, l’affiliation à la LAA/SUVA peut être obligatoire même pour l’indépendant lui-même, car cela dépend de l’activité exacte exercée, à vérifier auprès de la SUVA.',
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
