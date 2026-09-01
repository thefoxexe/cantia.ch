import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'logiciel-devis-facture-maconnerie-suisse',
  question: 'Comment un maçon indépendant ou une petite entreprise de maçonnerie doit-il structurer ses devis et factures ?',
  title: 'Devis et factures pour une entreprise de maçonnerie : la méthode qui évite les mauvaises surprises',
  description:
    'Un devis de maçonnerie mal structuré cache souvent une perte : matériaux sous-évalués, heures d’équipe mal comptées, imprévus non provisionnés. Méthode concrète pour chiffrer juste.',
  excerpt:
    'Entre le gros œuvre facturé au m³, les finitions au m² et les heures de manutention qui ne rentrent dans aucune case, un devis de maçonnerie mal construit rogne la marge avant même le premier coup de pioche.',
  category: 'Métiers du bâtiment',
  keywords: ['devis maçonnerie', 'facturation maçon indépendant', 'logiciel gestion entreprise maçonnerie', 'chiffrer chantier gros œuvre', 'prix maçonnerie Suisse'],
  publishedAt: '2026-08-28',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'La maçonnerie mélange plusieurs unités de mesure dans le même chantier : le m³ de béton coulé, le m² de mur monté, le nombre d’heures de manutention et de finition. Un devis qui applique un seul prix forfaitaire sur l’ensemble finit presque toujours par sous-évaluer une partie du travail, souvent la main-d’œuvre de finition, qui prend en réalité plus de temps que prévu.',
    },
    { type: 'h2', text: 'Structurer le devis par poste, pas par chantier entier' },
    {
      type: 'list',
      items: [
        'Terrassement et fondations : au m³ ou au forfait selon la complexité du sol',
        'Élévation des murs (parpaings, briques, béton) : au m² ou au m³ selon le type de maçonnerie',
        'Coulage et dalles béton : au m³, avec le coût du béton prêt à l’emploi séparé de la main-d’œuvre',
        'Finitions (enduits, joints, rejointoiement) : au m², souvent sous-estimé car chronophage',
        'Manutention, évacuation des gravats, nettoyage de chantier : en heures de régie, à ne jamais oublier',
      ],
    },
    {
      type: 'stat',
      value: '15-20 %',
      label: 'part typique du temps total d’un chantier de maçonnerie consacrée à la manutention et au nettoyage, un poste souvent absent du devis initial',
    },
    { type: 'h2', text: 'Le piège du prix au m² qui ne dit rien de l’accès au chantier' },
    {
      type: 'p',
      text: 'Deux chantiers avec la même surface de mur à monter peuvent avoir des coûts très différents selon l’accès (camion-toupie qui peut approcher ou non, étage, espace de stockage des matériaux). Un devis qui applique un prix au m² identique partout, sans ajuster selon l’accessibilité réelle du chantier, finit par égaliser les marges vers le bas. Le chantier facile paie alors pour le chantier difficile.',
    },
    {
      type: 'callout',
      title: 'Séparer toujours matériaux et main-d’œuvre sur le devis',
      text: 'Le prix du ciment, des agglos ou de l’armature fluctue régulièrement. Un devis qui les noie dans un forfait global empêche toute réévaluation propre si le chantier prend du retard et que les prix matériaux bougent entre-temps.',
    },
    {
      type: 'cta',
      title: 'Un catalogue de prix qui retient vos postes récurrents',
      text: 'Cantia garde en mémoire vos prix de maçonnerie (m³ béton, m² de mur, forfaits de finition) pour que chaque nouveau devis se construise en assemblant des postes déjà chiffrés, pas en repartant de zéro.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Comment chiffrer un devis de maçonnerie qui mélange plusieurs unités ?',
      answer:
        'En détaillant chaque poste avec sa propre unité (m³ pour le béton et les fondations, m² pour les murs et finitions, heures de régie pour la manutention), plutôt qu’un prix forfaitaire unique qui masque les écarts.',
    },
    {
      question: 'Faut-il inclure le prix des matériaux dans le prix au m² de maçonnerie ?',
      answer:
        'Il est préférable de les séparer sur le devis : cela permet d’ajuster facilement si le prix des matériaux change avant le début du chantier, sans devoir refaire tout le calcul.',
    },
    {
      question: 'Comment ne pas oublier le temps de manutention dans un devis de maçonnerie ?',
      answer:
        'En prévoyant une ligne dédiée en heures de régie pour le transport des matériaux, l’évacuation des gravats et le nettoyage : un poste qui représente souvent 15 à 20 % du temps total du chantier.',
    },
  ],
  relatedSlugs: [
    'calculer-prix-devis-renovation-suisse',
    'calculer-prix-de-revient-chantier-batiment',
    'checklist-ouverture-chantier-artisan',
  ],
};
