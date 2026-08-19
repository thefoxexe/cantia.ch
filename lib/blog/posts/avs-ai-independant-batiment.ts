import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'avs-ai-independant-batiment',
  question: 'Comment fonctionnent les cotisations AVS/AI pour un indépendant du bâtiment ?',
  title: 'AVS/AI pour un indépendant du bâtiment : comment ça marche',
  description:
    'Cotisations AVS/AI/APG obligatoires dès 18 ans pour tout indépendant suisse, calculées sur le revenu net et dégressives sous CHF 60’500/an. Le guide complet.',
  excerpt:
    'Contrairement au 2e pilier, l’AVS/AI/APG est obligatoire pour tout indépendant en Suisse, dès l’âge de 18 ans — voici comment le taux se calcule réellement.',
  category: 'Juridique & normes',
  keywords: ['avs', 'ai', 'indépendant', 'cotisations', 'caisse de compensation', 'revenu net'],
  publishedAt: '2026-01-26',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Se mettre à son compte dans le bâtiment implique une affiliation obligatoire à l’AVS/AI/APG (assurance-vieillesse et survivants / assurance-invalidité / allocations pour perte de gain) dès l’âge de 18 ans — c’est l’un des rares points qui n’est pas optionnel pour un indépendant suisse.',
    },
    { type: 'h2', text: 'Sur quelle base se calcule la cotisation ?' },
    {
      type: 'p',
      text: 'Contrairement à un salarié, dont la cotisation est un pourcentage fixe du salaire brut, l’indépendant cotise sur son revenu net d’activité — c’est-à-dire après déduction des charges d’exploitation, mais avant impôts. La caisse de compensation cantonale (ou professionnelle, selon la branche) fixe le montant annuellement sur la base de la taxation fiscale.',
    },
    {
      type: 'callout',
      title: 'Taux dégressif sous CHF 60’500 de revenu annuel',
      text: 'En dessous de ce seuil, le taux de cotisation AVS/AI/APG est dégressif (barème réduit) plutôt que le taux plein de 10 % environ appliqué au-delà — un avantage pensé pour les indépendants en phase de démarrage ou à faible revenu, comme beaucoup d’artisans nouvellement installés.',
    },
    { type: 'h2', text: 'Cotisation minimale même à revenu nul' },
    {
      type: 'p',
      text: 'Même en cas de revenu très faible ou nul une année donnée, une cotisation minimale annuelle reste due — elle garantit la continuité des droits (rente AVS future, couverture AI) et évite les lacunes de cotisation qui réduiraient une future rente de vieillesse.',
    },
    { type: 'h2', text: 'Comment s’affilier' },
    {
      type: 'list',
      items: [
        'S’annoncer à la caisse de compensation cantonale ou à une caisse professionnelle du bâtiment dans les jours suivant le début d’activité indépendante',
        'Fournir une estimation du revenu de la première année (acomptes provisoires calculés sur cette base)',
        'La caisse ajuste ensuite les acomptes une fois la taxation fiscale définitive connue, avec rattrapage ou remboursement',
        'Prévoir la trésorerie en conséquence : les acomptes AVS tombent indépendamment du rythme réel des encaissements de chantiers',
      ],
    },
    { type: 'h2', text: 'AVS/AI vs LPP : ne pas confondre' },
    {
      type: 'p',
      text: 'L’AVS/AI/APG (1er pilier) est obligatoire pour tout indépendant. Le 2e pilier (LPP) ne l’est en revanche pas — un indépendant peut s’y affilier volontairement, mais n’y est pas tenu, sauf exceptions sectorielles. C’est un point de confusion fréquent qui mérite un article à part.',
    },
    {
      type: 'cta',
      title: 'Vos revenus de chantier, toujours clairs',
      text: 'Le module Rentabilité de Cantia suit ce que chaque chantier rapporte réellement une fois les coûts déduits — une base plus fiable pour estimer vos acomptes AVS que des chiffres approximatifs.',
      buttonLabel: 'Découvrir la rentabilité par chantier',
    },
  ],
  faq: [
    {
      question: 'À partir de quel âge un indépendant doit-il cotiser à l’AVS/AI ?',
      answer:
        'Dès 18 ans révolus, l’affiliation à l’AVS/AI/APG est obligatoire pour toute personne exerçant une activité lucrative indépendante en Suisse.',
    },
    {
      question: 'Le taux de cotisation AVS/AI est-il le même pour tous les indépendants ?',
      answer:
        'Non — il est dégressif sous un revenu annuel d’environ CHF 60’500 (barème réduit), puis atteint un taux plein d’environ 10 % du revenu net au-delà de ce seuil.',
    },
    {
      question: 'Faut-il cotiser même sans bénéfice une année donnée ?',
      answer:
        'Oui, une cotisation minimale annuelle reste due même à revenu très faible ou nul, afin de préserver la continuité des droits (rente AVS, couverture AI).',
    },
  ],
  relatedSlugs: [
    'lpp-deuxieme-pilier-independant-batiment',
    'calculer-heures-travail-ouvrier-minutes-decimales',
    'sous-traitant-batiment-suisse-contrat-facturation',
  ],
};
