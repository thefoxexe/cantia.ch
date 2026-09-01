import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'appel-offres-marches-publics-batiment-suisse',
  question: 'Comment répondre à un appel d’offres public dans le bâtiment en Suisse ?',
  title: 'Marchés publics du bâtiment : ce qu’il faut savoir avant de soumissionner',
  description:
    'Dès CHF 2 millions pour des travaux de construction, un marché public doit être publié sur SIMAP selon les seuils AIMP. En dessous, la procédure de gré à gré reste possible.',
  excerpt:
    'CHF 2 millions : le seuil à partir duquel un marché de construction doit passer par un appel d’offres public formel plutôt que par une simple négociation directe.',
  category: 'Juridique & normes',
  keywords: ['marchés publics', 'aimp', 'simap', 'appel d’offres', 'soumission construction'],
  publishedAt: '2026-05-21',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Une collectivité publique (commune, canton) qui lance un chantier ne peut pas simplement appeler l’entreprise qu’elle préfère au-delà d’un certain montant : elle doit suivre une procédure d’appel d’offres encadrée. Comprendre ces seuils permet à une entreprise du bâtiment de savoir où chercher les opportunités, et à quoi s’attendre en y répondant.',
    },
    { type: 'h2', text: 'Le seuil qui déclenche la procédure formelle' },
    {
      type: 'p',
      text: 'Pour des travaux de construction, le seuil de publication sur SIMAP (la plateforme suisse des marchés publics) se situe autour de CHF 2 millions, fixé par l’Accord intercantonal sur les marchés publics (AIMP), avec des valeurs révisées périodiquement. En dessous de ce seuil, une collectivité peut recourir à des procédures plus légères, jusqu’à l’adjudication de gré à gré pour les montants les plus modestes.',
    },
    {
      type: 'callout',
      title: 'Ne pas confondre absence de seuil et absence d’opportunité',
      text: 'La majorité des chantiers publics, notamment communaux, restent sous le seuil de publication SIMAP, sans pour autant être fermés aux petites entreprises. Beaucoup de collectivités tiennent des listes de fournisseurs ou d’entreprises locales consultées directement pour ces marchés de gré à gré, en dehors de toute publication formelle.',
    },
    { type: 'h2', text: 'Les grandes étapes d’une procédure formelle' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Publication de l’appel d’offres sur SIMAP, avec cahier des charges et critères d’adjudication',
        'Délai de dépôt des offres, généralement de plusieurs semaines pour laisser le temps de chiffrer',
        'Évaluation selon des critères pondérés, où le prix n’est presque jamais le seul élément retenu : la qualité et les délais comptent aussi',
        'Décision d’adjudication, publiée et motivée, avec un délai de recours possible pour les soumissionnaires évincés',
      ],
    },
    { type: 'h2', text: 'Ce qui prend du temps la première fois' },
    {
      type: 'p',
      text: 'Répondre à un appel d’offres public demande une rigueur différente d’un devis classique : respecter un cahier des charges précis, chiffrer selon une structure imposée, et souvent fournir des attestations (assurances, affiliations sociales à jour, absence de condamnation LTN) en plus du prix lui-même. La première soumission prend du temps ; les suivantes sont nettement plus rapides une fois le dossier type constitué.',
    },
    {
      type: 'cta',
      title: 'Un historique clair pour appuyer une soumission',
      text: 'Cantia conserve l’historique complet des chantiers réalisés, utile pour constituer les références demandées dans un dossier de soumission publique.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'À partir de quel montant un marché de construction doit-il être publié sur SIMAP ?',
      answer:
        'Autour de CHF 2 millions selon les seuils fixés par l’Accord intercantonal sur les marchés publics (AIMP), révisés périodiquement.',
    },
    {
      question: 'Les petits chantiers publics sont-ils accessibles aux petites entreprises ?',
      answer:
        'Oui, la majorité des marchés publics, notamment communaux, restent sous le seuil de publication formelle et passent par des procédures de gré à gré, souvent avec des entreprises locales.',
    },
    {
      question: 'Le prix est-il le seul critère d’adjudication d’un marché public ?',
      answer:
        'Non, les critères sont généralement pondérés et incluent aussi la qualité, les délais et les références de l’entreprise, pas uniquement le montant proposé.',
    },
  ],
  relatedSlugs: [
    'travail-au-noir-batiment-suisse-risques-controles',
    'assurance-rc-professionnelle-batiment-obligatoire',
    'sous-traitant-batiment-suisse-contrat-facturation',
  ],
};
