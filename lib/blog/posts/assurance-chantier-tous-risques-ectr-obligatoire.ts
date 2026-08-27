import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'assurance-chantier-tous-risques-ectr-obligatoire',
  question: 'L’assurance chantier tous risques (ECTR) est-elle obligatoire, et qui doit la souscrire ?',
  title: 'Assurance chantier tous risques (ECTR) : obligatoire ou pas, et qui paie en cas de sinistre',
  description:
    'Contrairement à la RC professionnelle, l’ECTR n’est imposée par aucune loi fédérale — mais son absence peut coûter très cher en cas de dégât avant réception. Voici qui la souscrit en pratique et pourquoi.',
  excerpt:
    'Un dégât d’eau qui détruit un chantier en cours, un incendie, un vol de matériel avant la pose — sans ECTR, la question « qui paie » se transforme vite en conflit entre maître d’ouvrage et entrepreneurs.',
  category: 'Juridique & normes',
  keywords: ['assurance chantier tous risques', 'ECTR construction', 'assurance dégât chantier', 'sinistre chantier en cours', 'assurance travaux'],
  publishedAt: '2026-08-01',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'L’assurance chantier tous risques (ECTR — Entreprise de Construction Tous Risques) couvre les dommages matériels survenant sur l’ouvrage en cours de construction, avant sa réception : incendie, dégât d’eau, tempête, vol de matériaux déjà posés, voire erreur d’exécution accidentelle. Contrairement à la RC professionnelle, aucune loi fédérale ne l’impose — mais son absence expose l’ensemble des intervenants à un risque financier disproportionné.',
    },
    { type: 'h2', text: 'Qui la souscrit, en pratique' },
    {
      type: 'p',
      text: 'C’est généralement le maître d’ouvrage qui souscrit une ECTR pour l’ensemble du chantier, au bénéfice de tous les intervenants (architecte, entreprises, sous-traitants). Sur des chantiers plus modestes, certaines entreprises générales ou entrepreneurs principaux la souscrivent eux-mêmes et refacturent la prime dans leur devis global.',
    },
    {
      type: 'list',
      items: [
        'Vérifier avant le début du chantier qui a souscrit l’ECTR, et ne jamais présumer qu’elle existe sans confirmation écrite',
        'Un contrat qui ne mentionne aucune ECTR laisse chaque intervenant exposé pour son propre ouvrage en cas de sinistre',
        'L’ECTR ne remplace jamais la RC professionnelle de l’entrepreneur, qui couvre un tout autre risque (dommage causé à un tiers par une faute)',
      ],
    },
    {
      type: 'callout',
      title: 'Sans ECTR, un sinistre avant réception retombe souvent sur l’entrepreneur',
      text: 'Tant que l’ouvrage n’est pas réceptionné, l’entrepreneur en reste responsable — un incendie ou un dégât d’eau qui détruit un chantier en cours peut donc, en l’absence d’ECTR, représenter une perte sèche pour l’entreprise qui a exécuté les travaux.',
    },
    {
      type: 'cta',
      title: 'Documenter l’état du chantier avant tout sinistre',
      text: 'Les rapports de chantier de Cantia, avec photos géolocalisées et horodatées, donnent une base factuelle précieuse pour toute déclaration de sinistre — ECTR ou RC professionnelle.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'L’ECTR est-elle obligatoire en Suisse ?',
      answer:
        'Non, aucune loi fédérale ne l’impose — mais son absence expose fortement les intervenants du chantier en cas de sinistre avant réception, et certains maîtres d’ouvrage l’exigent contractuellement.',
    },
    {
      question: 'Qui souscrit généralement l’assurance chantier tous risques ?',
      answer:
        'Le plus souvent le maître d’ouvrage, au bénéfice de tous les intervenants du chantier — mais sur des projets plus modestes, l’entreprise principale peut aussi la souscrire elle-même.',
    },
    {
      question: 'L’ECTR remplace-t-elle la RC professionnelle de l’entrepreneur ?',
      answer:
        'Non, ce sont deux couvertures différentes : l’ECTR couvre les dommages matériels au chantier lui-même, la RC professionnelle couvre les dommages causés à un tiers par une faute de l’entrepreneur.',
    },
  ],
  relatedSlugs: [
    'assurance-rc-professionnelle-batiment-obligatoire',
    'reception-travaux-proces-verbal-chantier',
    'defaut-construction-decouvert-apres-reception-qui-paie',
  ],
};
