import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-charpente-bois-facturation-suisse',
  question: 'Comment un charpentier doit-il chiffrer un devis entre le bois sur mesure et la pose en atelier ?',
  title: 'Charpente bois : chiffrer un devis entre coût matière, façonnage et pose',
  description:
    'Entre le prix du bois qui fluctue, le temps de façonnage en atelier et la pose sur chantier, un devis de charpente additionne trois postes très différents. Comment les structurer pour ne pas perdre en route.',
  excerpt:
    'Une charpente se construit en trois temps — l’achat du bois, le façonnage en atelier, la pose sur chantier — et un devis qui ne les distingue pas prend le risque de payer l’inflation du bois sur sa propre marge.',
  category: 'Métiers du bâtiment',
  keywords: ['devis charpente bois', 'facturation charpentier Suisse', 'prix bois construction', 'devis atelier charpente', 'pose charpente chantier'],
  publishedAt: '2026-09-04',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un devis de charpente traverse trois étapes qui n’ont pas le même rythme : l’achat du bois, dont le prix peut évoluer entre la signature et la commande réelle ; le façonnage en atelier, prévisible et mesurable ; et la pose sur chantier, qui dépend de la météo et de l’accessibilité. Les traiter comme un seul forfait rigide expose à absorber seul les variations qui ne dépendent pas du travail réalisé.',
    },
    { type: 'h2', text: 'Trois postes, trois logiques de prix' },
    {
      type: 'list',
      items: [
        'Bois et quincaillerie : idéalement chiffré avec une clause de révision si le délai entre devis et commande dépasse quelques semaines',
        'Façonnage en atelier : au forfait ou à l’heure, prévisible car indépendant des aléas de chantier',
        'Pose et levage sur site : en régie ou au forfait avec une clause météo, car le temps réel dépend fortement des conditions du jour',
      ],
    },
    {
      type: 'stat',
      value: '2 à 3 sem.',
      label: 'délai typique entre l’établissement d’un devis de charpente et le lancement effectif de la commande de bois — assez pour que les prix bougent',
    },
    { type: 'h2', text: 'Le levage n’est pas une simple ligne de main-d’œuvre' },
    {
      type: 'p',
      text: 'La pose d’une charpente implique souvent une grue ou un camion-grue loué à la journée, une équipe complète mobilisée en même temps, et une dépendance forte à la météo. Un jour de vent trop fort qui reporte le levage a un coût réel (location, équipe bloquée) qu’il vaut mieux avoir anticipé contractuellement plutôt que de le découvrir en pleine négociation avec le client.',
    },
    {
      type: 'callout',
      title: 'Une clause de révision de prix sur le bois protège les deux parties',
      text: 'Face à la volatilité du prix du bois de construction, une clause de révision claire (indexée sur une date de commande, pas de signature du devis) évite au charpentier de perdre sa marge et au client d’avoir une mauvaise surprise non anticipée.',
    },
    {
      type: 'cta',
      title: 'Séparez matière, façonnage et pose sur chaque devis',
      text: 'Cantia permet de structurer un devis en postes distincts avec leurs propres quantités et prix, pour que chaque partie du chantier de charpente reste lisible et ajustable indépendamment des autres.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Comment se protéger de la variation du prix du bois entre le devis et la commande ?',
      answer:
        'En intégrant une clause de révision de prix sur le poste bois, indexée sur la date réelle de commande plutôt que sur la date de signature du devis, surtout si le délai dépasse quelques semaines.',
    },
    {
      question: 'Faut-il facturer le levage de charpente séparément de la pose ?',
      answer:
        'C’est recommandé lorsqu’une grue ou un camion-grue est loué spécifiquement, car ce coût est fixe pour la journée, indépendamment du temps de pose effectif — et il est directement exposé au risque météo.',
    },
    {
      question: 'Comment gérer un report de chantier de charpente pour cause de météo ?',
      answer:
        'Idéalement via une clause prévue au devis dès le départ, précisant qui absorbe le coût d’un report (location de matériel, équipe mobilisée) plutôt que de le négocier après coup sous pression.',
    },
  ],
  relatedSlugs: [
    'retard-chantier-meteo-obligations-contractuelles',
    'avenant-chantier-plus-value-moins-value',
    'devis-facture-facadier-isolation-suisse',
  ],
};
