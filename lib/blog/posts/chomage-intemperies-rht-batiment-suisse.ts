import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'chomage-intemperies-rht-batiment-suisse',
  question: 'Comment fonctionne le chômage-intempéries (RHT) dans le bâtiment en Suisse ?',
  title: 'Chômage-intempéries (RHT) dans le bâtiment : comment ça fonctionne',
  description:
    'Le mécanisme du chômage-intempéries pour le secteur du bâtiment en Suisse : conditions, démarches auprès de la caisse de chômage, délai de carence et impact sur la trésorerie d’hiver.',
  excerpt:
    'Un chantier extérieur arrêté par la météo n’est pas seulement une perte de journée : c’est un mécanisme précis, avec ses propres démarches, qui peut protéger la trésorerie de l’entreprise en hiver.',
  category: 'RH & salaires',
  keywords: [
    'chômage intempéries bâtiment',
    'rht construction suisse',
    'indemnité intempéries employeur',
    'démarche chômage intempéries',
    'trésorerie hiver entreprise bâtiment',
  ],
  publishedAt: '2026-09-24',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Dans le bâtiment, l’hiver ramène chaque année la même incertitude : des journées de chantier perdues à cause du froid, de la neige ou du vent, sans que l’entreprise ne puisse simplement suspendre les salaires. Le chômage-intempéries, souvent désigné RHT dans ce contexte, est le mécanisme suisse conçu précisément pour cette situation, spécifique aux secteurs exposés aux conditions météorologiques comme le bâtiment et le génie civil.',
    },
    { type: 'h2', text: 'Le principe du mécanisme' },
    {
      type: 'p',
      text: 'Quand des intempéries empêchent la poursuite de travaux extérieurs, l’assurance-chômage peut indemniser une partie du salaire des employés concernés, pour la durée de l’interruption. L’employeur continue de verser un salaire, en partie compensé ensuite par l’assurance-chômage, plutôt que de devoir choisir entre payer des heures non travaillées ou licencier temporairement.',
    },
    { type: 'h2', text: 'Les démarches à effectuer côté employeur' },
    {
      type: 'list',
      items: [
        'Annoncer la perte de travail liée aux intempéries à la caisse de chômage compétente, en respectant les démarches et les délais qu’elle impose.',
        'Documenter la nature de l’interruption (type de travaux extérieurs concernés, conditions météorologiques constatées) pour justifier la demande d’indemnisation.',
        'Tenir compte d’un délai de carence en début de période, pendant lequel la perte reste à la charge de l’entreprise avant que l’indemnisation ne s’applique.',
        'Continuer de verser le salaire aux employés concernés durant la période d’intempéries, l’indemnisation venant ensuite compenser une partie de cette charge.',
      ],
    },
    { type: 'h2', text: 'Pourquoi c’est un point important pour la trésorerie d’hiver' },
    {
      type: 'p',
      text: 'Une entreprise du bâtiment qui ignore ce mécanisme, ou qui ne l’active pas à temps, absorbe seule le coût des journées perdues à cause de la météo, alors qu’une partie peut être compensée. Sur un hiver avec plusieurs semaines d’intempéries cumulées, la différence entre une trésorerie qui anticipe ce mécanisme et une trésorerie qui le découvre après coup peut être significative, en particulier pour une petite structure.',
    },
    {
      type: 'callout',
      title: 'Ne pas confondre intempéries et simple baisse d’activité',
      text: 'Le chômage-intempéries couvre spécifiquement l’impossibilité de travailler à l’extérieur à cause des conditions météorologiques, pas une baisse générale de commandes en hiver. Les deux situations ne relèvent pas des mêmes démarches, et confondre les deux peut retarder ou compromettre une demande légitime.',
    },
    {
      type: 'cta',
      title: 'Une trésorerie d’hiver moins tendue, chantier par chantier',
      text: 'Cantia aide à suivre l’avancement et la facturation de chaque chantier, pour visualiser l’impact réel d’un arrêt lié aux intempéries sur la trésorerie de l’entreprise, et anticiper plutôt que subir.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Le chômage-intempéries s’applique-t-il à tous les métiers du bâtiment ?',
      answer:
        'Il concerne surtout les travaux extérieurs directement empêchés par les conditions météorologiques, typiquement le gros œuvre et le génie civil. Les métiers qui travaillent principalement en intérieur sont en général moins concernés, sauf si le chantier dans son ensemble est bloqué.',
    },
    {
      question: 'Y a-t-il un délai avant que l’indemnisation ne commence ?',
      answer:
        'Oui, un délai de carence s’applique généralement en début de période, durant lequel la perte reste à la charge de l’employeur avant que l’indemnisation ne prenne le relais.',
    },
    {
      question: 'Faut-il une autorisation préalable pour bénéficier du chômage-intempéries ?',
      answer:
        'L’entreprise doit annoncer la perte de travail à la caisse de chômage compétente selon la procédure en vigueur. Il est recommandé de se renseigner à l’avance sur les démarches exactes plutôt que d’attendre la première interruption pour les découvrir.',
    },
  ],
  relatedSlugs: [
    'previsionnel-tresorerie-entreprise-batiment',
    'retard-chantier-meteo-obligations-contractuelles',
    'accident-travail-chantier-obligations-employeur-suva',
  ],
};
