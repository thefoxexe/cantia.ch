import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'arbitrage-sia-mediation-professionnelle-batiment',
  question: 'Qu’est-ce que l’arbitrage SIA et comment ça évite un tribunal pour un litige de chantier ?',
  title: 'Arbitrage SIA : une alternative au tribunal pour un litige de chantier',
  description:
    'Ce qu’est une clause d’arbitrage SIA dans un contrat de construction, ses avantages et inconvénients face à un tribunal ordinaire, et comment savoir si elle s’applique.',
  excerpt:
    'Certains contrats de construction prévoient un arbitrage plutôt qu’un tribunal en cas de litige. Voici ce que ça change concrètement, en bien comme en mal.',
  category: 'Juridique & normes',
  keywords: ['arbitrage SIA bâtiment', 'clause arbitrage contrat construction'],
  publishedAt: '2026-10-10',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Face à un litige de chantier, la question n’est pas toujours de choisir entre médiation et tribunal — certains contrats liés aux normes SIA prévoient une troisième voie : l’arbitrage. Encore faut-il savoir si votre contrat contient une telle clause avant qu’un litige n’éclate.',
    },
    { type: 'h2', text: 'Le principe' },
    {
      type: 'p',
      text: 'Une clause d’arbitrage, souvent associée aux normes SIA dans les contrats de construction, prévoit qu’en cas de litige, le différend sera tranché par un ou plusieurs arbitres désignés selon une procédure définie dans le contrat, plutôt que par un tribunal ordinaire. La décision rendue, appelée sentence arbitrale, a généralement une force équivalente à un jugement.',
    },
    { type: 'h2', text: 'Avantages et inconvénients généralement cités' },
    {
      type: 'table',
      headers: ['Avantages', 'Inconvénients'],
      rows: [
        ['Procédure souvent plus rapide qu’un tribunal ordinaire', 'Coût de l’arbitrage généralement à la charge des parties, parfois élevé'],
        ['Confidentialité de la procédure et de la décision', 'Décision généralement sans possibilité d’appel'],
        ['Arbitres choisis pour leur expertise technique du bâtiment', 'Nécessite l’accord préalable des deux parties, formalisé dans le contrat'],
      ],
    },
    { type: 'h2', text: 'Vérifier son contrat avant, pas pendant, un litige' },
    {
      type: 'p',
      text: 'La clause d’arbitrage doit être prévue dans le contrat en amont — on ne peut généralement pas décider d’y recourir une fois le litige déjà engagé, sauf accord des deux parties à ce moment-là. Relire ses contrats-types et vérifier s’ils intègrent une telle clause, avant qu’un désaccord ne survienne, évite de découvrir la procédure applicable dans l’urgence.',
    },
    {
      type: 'callout',
      title: 'L’arbitrage n’est pas automatiquement plus avantageux pour une petite entreprise',
      text: 'La rapidité et la confidentialité de l’arbitrage ont un coût, parfois plus élevé qu’une procédure judiciaire ordinaire pour un litige de faible montant. Pour un désaccord limité, la médiation ou le tribunal restent parfois plus adaptés — évaluez selon les cas.',
    },
    {
      type: 'cta',
      title: 'Gardez vos contrats et clauses de chantier centralisés et accessibles',
      text: 'Cantia conserve les contrats liés à chaque chantier au même endroit, pour retrouver rapidement quelle clause s’applique en cas de désaccord.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Comment savoir si mon contrat contient une clause d’arbitrage SIA ?',
      answer:
        'En relisant les conditions générales ou les clauses particulières du contrat, souvent en référence aux normes SIA 118. En cas de doute, un avocat peut confirmer si la clause s’applique à votre situation.',
    },
    {
      question: 'Peut-on refuser l’arbitrage si le contrat le prévoit ?',
      answer:
        'Généralement non, une fois la clause acceptée dans le contrat, elle engage les deux parties pour la résolution d’un litige futur, sauf accord mutuel de la modifier.',
    },
    {
      question: 'Une sentence arbitrale peut-elle être contestée devant un tribunal ?',
      answer:
        'Les possibilités de recours sont généralement très limitées, contrairement à un jugement ordinaire. Consultez un avocat pour connaître les voies de recours applicables à votre situation précise.',
    },
  ],
  relatedSlugs: [
    'litige-chantier-mediation-ou-tribunal',
    'difference-sia-108-sia-118-devis-contrat',
    'expertise-judiciaire-malfacon-construction-suisse',
  ],
};
