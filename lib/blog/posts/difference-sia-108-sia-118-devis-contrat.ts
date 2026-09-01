import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'difference-sia-108-sia-118-devis-contrat',
  question: 'Quelle est la différence entre la norme SIA 108 et la norme SIA 118, et laquelle s’applique à mon devis ?',
  title: 'SIA 108 vs SIA 118 : deux normes qu’on confond souvent, deux rôles très différents',
  description:
    'La SIA 118 régit les relations entre maître d’ouvrage et entrepreneur, la SIA 108 celles avec les mandataires (architectes, ingénieurs). Les confondre expose à appliquer les mauvaises règles.',
  excerpt:
    'Les deux normes portent des numéros voisins et sortent du même éditeur. L’une concerne pourtant les travaux de construction, l’autre les prestations intellectuelles. La confusion est fréquente et coûteuse.',
  category: 'Juridique & normes',
  keywords: ['SIA 108 vs SIA 118', 'norme SIA construction', 'différence SIA 108 SIA 118', 'norme SIA devis', 'contrat entreprise SIA'],
  publishedAt: '2026-06-17',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'La SIA 118 et la SIA 108 sont deux normes contractuelles distinctes éditées par la Société suisse des ingénieurs et des architectes, souvent confondues à cause de leurs numéros voisins. Elles ne règlent pas la même relation, et appliquer l’une à la place de l’autre par erreur peut fausser des points essentiels comme la garantie ou la responsabilité.',
    },
    { type: 'h2', text: 'Ce que chaque norme couvre' },
    {
      type: 'table',
      headers: ['Norme', 'Relation couverte', 'Exemple type'],
      rows: [
        ['SIA 118', 'Maître d’ouvrage ↔ Entrepreneur (contrat d’entreprise)', 'Un maçon ou un électricien qui exécute des travaux'],
        ['SIA 108', 'Maître d’ouvrage ↔ Mandataire (contrat de mandat)', 'Un architecte ou un ingénieur qui conçoit/dirige un projet'],
      ],
    },
    {
      type: 'p',
      text: 'La SIA 118 s’applique à un contrat d’entreprise (art. 363 CO et suivants) : l’entrepreneur doit un résultat (l’ouvrage terminé). La SIA 108 s’applique quant à elle à un contrat de mandat (art. 394 CO et suivants), où le mandataire doit des moyens et une diligence, pas un résultat garanti. Cette distinction change fondamentalement le régime de responsabilité applicable.',
    },
    { type: 'h2', text: 'Comme la SIA 118, aucune des deux n’est automatique' },
    {
      type: 'list',
      items: [
        'Ni la SIA 108 ni la SIA 118 ne s’appliquent par défaut : elles doivent être explicitement mentionnées dans le contrat ou le devis',
        'En leur absence, seul le Code des obligations régit la relation, avec des règles parfois moins détaillées',
        'Un artisan exécutant des travaux (pas de la conception) doit se référer à la SIA 118, jamais à la SIA 108',
      ],
    },
    {
      type: 'callout',
      title: 'Pour un artisan du bâtiment, c’est presque toujours la SIA 118 qui est pertinente',
      text: 'La SIA 108 concerne les métiers de conception et de direction de projet. Un entrepreneur qui exécute des travaux relève, lui, du régime du contrat d’entreprise, donc de la SIA 118 si elle est appliquée.',
    },
    {
      type: 'cta',
      title: 'Mentionnez la bonne norme sur chaque devis',
      text: 'Cantia permet d’ajouter des conditions personnalisées, y compris une référence explicite à la SIA 118, directement sur vos devis et contrats.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Quelle norme SIA s’applique à un artisan qui exécute des travaux ?',
      answer:
        'C’est la SIA 118, qui régit le contrat d’entreprise entre maître d’ouvrage et entrepreneur. La SIA 108, elle, concerne les mandataires comme les architectes et ingénieurs.',
    },
    {
      question: 'Les normes SIA s’appliquent-elles automatiquement à un chantier ?',
      answer:
        'Non, ni la SIA 108 ni la SIA 118 ne s’appliquent par défaut. Elles doivent être explicitement mentionnées dans le contrat ou le devis pour être valables.',
    },
    {
      question: 'Quelle est la principale différence de régime entre les deux normes ?',
      answer:
        'La SIA 118 repose sur une obligation de résultat (l’ouvrage terminé), la SIA 108 sur une obligation de moyens et de diligence, sans garantie de résultat.',
    },
  ],
  relatedSlugs: [
    'norme-sia-118-devis-obligatoire',
    'contrat-entreprise-vs-mandat-artisan',
    'garantie-travaux-construction-2-ou-5-ans',
  ],
};
