import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'travailleur-detache-batiment-suisse-regles',
  question: 'Quelles sont les règles pour un travailleur détaché dans le bâtiment en Suisse ?',
  title: 'Travailleur détaché dans le bâtiment suisse : les règles à connaître',
  description:
    'Définition du détachement, procédure d’annonce préalable, respect des conditions de salaire et de travail suisses, et risques en cas de non-respect sur un chantier.',
  excerpt:
    'Faire intervenir une entreprise étrangère sur un chantier suisse ne dispense d’aucune règle : le détachement est encadré, et les contrôles sur les chantiers sont réels.',
  category: 'RH & salaires',
  keywords: ['travailleur détaché', 'bâtiment', 'annonce', 'CCT', 'contrôle chantier'],
  publishedAt: '2026-09-27',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Faire appel à une entreprise étrangère pour un chantier en Suisse, ou envoyer soi-même du personnel travailler temporairement à l’étranger, implique un cadre légal spécifique connu sous le nom de détachement.',
    },
    { type: 'h2', text: '1. Qu’est-ce qu’un travailleur détaché ?' },
    {
      type: 'p',
      text: 'Un travailleur détaché est un salarié employé par une entreprise établie hors de Suisse, envoyé temporairement exécuter une prestation de travail sur un chantier suisse, tout en restant employé par son entreprise d’origine. Ce statut se distingue de l’embauche directe par une entreprise suisse ou du recours à une agence de travail temporaire.',
    },
    { type: 'h2', text: '2. Les obligations principales' },
    {
      type: 'list',
      items: [
        'Une annonce préalable de l’intervention, généralement via la procédure d’annonce en ligne prévue à cet effet, avant le début des travaux en Suisse.',
        'Le respect des conditions de salaire et de travail suisses en vigueur, notamment celles fixées par la CCT étendue du secteur lorsque le chantier y est soumis.',
        'La tenue de documents justificatifs disponibles sur le chantier ou rapidement transmissibles en cas de contrôle (contrats, décomptes de salaire, preuves d’annonce).',
      ],
    },
    { type: 'h2', text: '3. Les risques en cas de non-respect' },
    {
      type: 'p',
      text: 'Les chantiers du bâtiment font l’objet de contrôles réguliers de la part des commissions paritaires et des autorités compétentes en matière de détachement. Le non-respect des obligations d’annonce ou des conditions de salaire et de travail suisses peut entraîner des sanctions, allant d’amendes à une interdiction temporaire d’intervenir sur le marché suisse pour l’entreprise concernée. Les délais et modalités précises de la procédure évoluent régulièrement : il est recommandé de vérifier les démarches à jour auprès des autorités cantonales ou fédérales compétentes avant chaque intervention.',
    },
    {
      type: 'callout',
      title: 'Le réflexe à avoir avant de signer un sous-traitant étranger',
      text: 'Avant de confirmer l’intervention d’une entreprise étrangère sur un chantier, vérifiez que la procédure d’annonce a bien été effectuée dans les délais requis. En cas de contrôle sur le chantier, c’est souvent l’entreprise mandante qui doit démontrer sa diligence, pas seulement le sous-traitant.',
    },
    {
      type: 'cta',
      title: 'Un suivi clair de vos intervenants, y compris les sous-traitants étrangers',
      text: 'Cantia vous aide à centraliser les documents et les affectations de chaque intervenant sur un chantier, pour retrouver rapidement les justificatifs nécessaires en cas de contrôle.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Faut-il annoncer chaque intervention d’une entreprise étrangère sur un chantier suisse ?',
      answer:
        'Dans la plupart des cas oui, via la procédure d’annonce préalable prévue à cet effet, avant le début des travaux. Les modalités exactes et les éventuelles exceptions doivent être vérifiées auprès des autorités compétentes, car elles peuvent évoluer.',
    },
    {
      question: 'Un travailleur détaché doit-il être payé selon les conditions suisses ?',
      answer:
        'Généralement oui, notamment lorsque le chantier est soumis à une CCT étendue du secteur, qui fixe des conditions de salaire et de travail minimales applicables à tous les intervenants, y compris détachés.',
    },
    {
      question: 'Que risque une entreprise qui ne respecte pas les règles du détachement ?',
      answer:
        'Des sanctions sont possibles, allant d’amendes à des restrictions temporaires d’intervention sur le marché suisse. Les chantiers du bâtiment font l’objet de contrôles réguliers, ce qui rend le respect de la procédure d’annonce particulièrement important.',
    },
  ],
  relatedSlugs: [
    'travailleur-temporaire-interimaire-batiment-regles',
    'salaire-minimum-cct-construction-suisse',
    'clauses-oubliees-contrat-travail-batiment',
  ],
};
