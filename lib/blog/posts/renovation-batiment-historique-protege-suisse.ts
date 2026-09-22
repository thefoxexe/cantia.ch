import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'renovation-batiment-historique-protege-suisse',
  question: 'Quelles sont les contraintes pour rénover un bâtiment historique ou protégé en Suisse ?',
  title: 'Rénover un bâtiment historique ou protégé : les contraintes à connaître',
  description:
    'Autorisations plus lourdes, matériaux imposés, délais d’exécution allongés : ce qui change quand un chantier de rénovation touche un bâtiment historique ou protégé en Suisse.',
  excerpt:
    'Un bâtiment classé ou protégé ne se rénove pas comme les autres. Entre autorisations plus lentes et matériaux imposés, voici ce qui change pour le chiffrage et le planning.',
  category: 'Chantier & rentabilité',
  keywords: ['rénovation bâtiment historique suisse', 'bâtiment protégé travaux autorisation', 'devis rénovation monument historique'],
  publishedAt: '2026-10-11',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Un bâtiment inscrit à l’inventaire, classé monument historique ou simplement situé dans un périmètre protégé ne se rénove pas comme une construction ordinaire. Les autorisations sont généralement plus lourdes, les matériaux parfois imposés, et le calendrier de chantier doit intégrer des délais administratifs que beaucoup d’entreprises sous-estiment au moment du devis.',
    },
    { type: 'h2', text: 'Une autorisation généralement plus lourde et plus lente' },
    {
      type: 'p',
      text: 'Dès qu’un bâtiment est protégé, le service cantonal des monuments historiques ou une commission communale d’urbanisme est généralement associé à l’instruction de la demande, en plus de l’autorité communale habituelle. Cette consultation supplémentaire allonge le délai de traitement, parfois de façon significative selon le canton et la complexité du projet. Il est indispensable de se renseigner en amont auprès du service compétent sur les pièces à fournir et les délais réels à prévoir.',
    },
    { type: 'h2', text: 'Des matériaux et des techniques souvent imposés' },
    {
      type: 'list',
      items: [
        'Menuiseries : remplacement par du bois plutôt que du PVC ou de l’aluminium, parfois avec obligation de reproduire le profil d’origine',
        'Façades : enduits à la chaux plutôt que des enduits synthétiques modernes, teintes parfois soumises à validation',
        'Toiture : tuiles ou matériaux de couverture d’un type précis, pose selon des techniques traditionnelles',
        'Éléments intérieurs remarquables (boiseries, stucs, escaliers) : restauration plutôt que remplacement, quand c’est possible',
      ],
    },
    { type: 'h2', text: 'Un impact direct sur le chiffrage et le planning' },
    {
      type: 'p',
      text: 'Ces contraintes se traduisent concrètement dans le devis : une pose selon une technique traditionnelle demande généralement plus de temps qu’une pose standard, la main-d’œuvre qualifiée en restauration coûte plus cher, et les matériaux spécifiques sont souvent plus onéreux que leurs équivalents modernes. Un devis qui ne tient pas compte de ces surcoûts se retrouve rapidement déficitaire une fois le chantier lancé.',
    },
    {
      type: 'callout',
      title: 'Ne jamais promettre une date de fin de chantier avant d’avoir l’autorisation en main',
      text: 'Le délai administratif pour un bâtiment protégé échappe largement au contrôle de l’entreprise. Communiquer une date de fin de chantier avant l’obtention de l’autorisation, c’est prendre un engagement que vous ne maîtrisez pas.',
    },
    {
      type: 'cta',
      title: 'Un devis qui intègre les surcoûts spécifiques d’une rénovation patrimoniale',
      text: 'Cantia permet de détailler chaque poste d’un devis, matériaux spécifiques et temps de restauration inclus, pour un chiffrage qui reflète la réalité du chantier.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Comment savoir si un bâtiment est protégé ou classé ?',
      answer:
        'L’information figure généralement dans l’inventaire cantonal des biens culturels ou dans le plan d’affectation communal. En cas de doute, il vaut mieux se renseigner directement auprès du service cantonal des monuments historiques ou de la commune avant de chiffrer les travaux.',
    },
    {
      question: 'Le surcoût d’une rénovation patrimoniale peut-il être subventionné ?',
      answer:
        'Certains cantons et communes proposent des aides pour la restauration de bâtiments protégés, mais les conditions varient fortement. Il faut vérifier au cas par cas auprès de l’autorité cantonale compétente, généralement avant le début des travaux.',
    },
    {
      question: 'Peut-on refuser certaines exigences du service des monuments historiques ?',
      answer:
        'Les prescriptions liées à un bien protégé sont généralement contraignantes et peu négociables sur le fond, même si des discussions restent possibles sur des détails d’exécution. Mieux vaut les anticiper dès le chiffrage plutôt que de les découvrir en cours de chantier.',
    },
  ],
  relatedSlugs: [
    'permis-construire-renovation-quand-necessaire',
    'checklist-ouverture-chantier-artisan',
    'garantie-travaux-construction-2-ou-5-ans',
    'renovation-apres-sinistre-degat-eau-assurance',
  ],
};
