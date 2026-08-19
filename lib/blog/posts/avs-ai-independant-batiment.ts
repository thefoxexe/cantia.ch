import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'avs-ai-independant-batiment',
  question: 'Comment fonctionnent les cotisations AVS/AI pour un indépendant du bâtiment ?',
  title: 'AVS/AI pour un indépendant du bâtiment : comment ça marche',
  description:
    'Cotisations AVS/AI/APG obligatoires dès 18 ans pour tout indépendant suisse, calculées sur le revenu net et dégressives sous CHF 60’500/an. Le guide complet.',
  excerpt:
    'L’AVS/AI n’est pas une option pour un indépendant, contrairement au 2e pilier. Et le taux qu’on vous applique dépend d’un seuil que presque personne ne connaît.',
  category: 'Juridique & normes',
  keywords: ['avs', 'ai', 'indépendant', 'cotisations', 'caisse de compensation', 'revenu net'],
  publishedAt: '2026-01-26',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Se mettre à son compte dans le bâtiment déclenche une affiliation obligatoire à l’AVS/AI/APG dès 18 ans révolus — c’est l’un des rares points qui n’est jamais optionnel pour un indépendant suisse, quel que soit son chiffre d’affaires.',
    },
    { type: 'h2', text: 'Sur quelle base se calcule vraiment la cotisation' },
    {
      type: 'p',
      text: 'Un salarié cotise sur un pourcentage fixe de son salaire brut. Un indépendant cotise sur son revenu net d’activité — après charges d’exploitation, avant impôts. La caisse de compensation cantonale (ou professionnelle, selon la branche) fixe le montant chaque année sur la base de la taxation fiscale, avec un décalage temporel qui surprend souvent : les acomptes de l’année en cours sont provisoires, et le rattrapage arrive une fois la taxation définitive connue — parfois deux ans plus tard.',
    },
    {
      type: 'callout',
      title: 'Le seuil que personne ne vérifie',
      text: 'Sous CHF 60’500 de revenu annuel, le taux de cotisation AVS/AI/APG est dégressif — nettement moins lourd que le taux plein d’environ 10 % appliqué au-delà. Beaucoup d’indépendants en phase de démarrage paient un taux qu’ils croient fixe alors qu’il change chaque année avec leur revenu.',
    },
    { type: 'h2', text: 'Une cotisation minimale, même à zéro' },
    {
      type: 'p',
      text: 'Même un revenu très faible ou nul une année donnée n’exonère pas d’une cotisation minimale annuelle. Elle garantit la continuité des droits — rente AVS future, couverture AI — et évite les lacunes de cotisation qui rognent une future rente de vieillesse, souvent sans qu’on s’en rende compte avant l’âge de la retraite.',
    },
    { type: 'h2', text: 'S’affilier, sans tarder' },
    {
      type: 'list',
      items: [
        'S’annoncer à la caisse de compensation cantonale ou à une caisse professionnelle du bâtiment dans les jours suivant le début d’activité',
        'Fournir une estimation du revenu de la première année (acomptes provisoires basés dessus)',
        'La caisse ajuste ensuite une fois la taxation fiscale définitive connue, avec rattrapage ou remboursement',
        'Provisionner la trésorerie en conséquence : les acomptes tombent indépendamment du rythme réel d’encaissement des chantiers',
      ],
    },
    { type: 'h2', text: 'AVS/AI n’est pas la LPP — et c’est là que ça se complique' },
    {
      type: 'p',
      text: 'L’AVS/AI/APG (1er pilier) est obligatoire pour tout indépendant. Le 2e pilier (LPP), lui, ne l’est pas — un indépendant peut s’y affilier volontairement, mais n’y est pas légalement tenu, sauf exceptions sectorielles liées à la SUVA. C’est la confusion la plus fréquente, et elle mérite son propre article.',
    },
    {
      type: 'cta',
      title: 'Vos revenus de chantier, sans approximation',
      text: 'Le module Rentabilité de Cantia suit ce que chaque chantier rapporte réellement une fois les coûts déduits — une base bien plus fiable pour estimer vos acomptes AVS qu’un chiffre approximatif tapé de mémoire.',
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
