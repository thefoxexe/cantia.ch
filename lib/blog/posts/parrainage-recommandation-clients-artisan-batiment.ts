import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'parrainage-recommandation-clients-artisan-batiment',
  question: 'Comment structurer un programme de recommandation pour transformer des clients satisfaits en apporteurs d’affaires ?',
  title: 'Transformer un client satisfait en apporteur d’affaires, sans que ça paraisse forcé',
  description:
    'Le bouche-à-oreille ne se décrète pas, mais il s’encourage. Comment mettre en place un système simple de recommandation sans donner l’impression de mendier des clients.',
  excerpt:
    'La plupart des clients satisfaits recommanderaient volontiers leur artisan — le problème n’est presque jamais leur envie, c’est qu’on ne le leur demande tout simplement jamais, ou trop maladroitement.',
  category: 'Croissance & acquisition',
  keywords: ['programme de parrainage artisan', 'recommandation clients bâtiment', 'bouche à oreille entreprise construction', 'fidélisation client artisan Suisse', 'apporteur affaire chantier'],
  publishedAt: '2026-09-07',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Un client satisfait pense rarement spontanément à recommander son artisan à un voisin ou un ami — non par manque de satisfaction, mais simplement parce que l’occasion ne se présente pas naturellement. Un petit geste au bon moment suffit souvent à transformer une satisfaction silencieuse en recommandation active.',
    },
    { type: 'h2', text: 'Le bon moment et la bonne façon de le demander' },
    {
      type: 'list',
      items: [
        'À la réception des travaux, quand la satisfaction est la plus fraîche et concrète',
        'De façon simple et directe : "si vous connaissez quelqu’un qui a un projet similaire, n’hésitez pas à donner mes coordonnées"',
        'Sans mettre de pression — une phrase suffit, pas besoin d’un argumentaire',
        'En facilitant la démarche : une carte de visite à transmettre, ou simplement le nom exact à retenir',
      ],
    },
    { type: 'h2', text: 'Un petit geste de remerciement, sans en faire un système commercial lourd' },
    {
      type: 'p',
      text: 'Un geste simple pour remercier une recommandation qui se concrétise — une petite réduction sur une prochaine prestation, ou même juste un message de remerciement sincère — entretient la relation sans transformer le client en commercial rémunéré. L’essentiel n’est pas la valeur du geste, c’est de montrer que la recommandation a été remarquée et appréciée.',
    },
    {
      type: 'stat',
      value: '2-3x',
      label: 'un client recommandé se transforme généralement en devis signé plus souvent qu’un prospect contacté sans lien préalable avec l’entreprise',
    },
    {
      type: 'callout',
      title: 'Une équipe soignée renforce aussi la recommandation',
      text: 'Un chantier propre, une équipe ponctuelle et respectueuse des lieux du client jouent un rôle presque aussi important que la qualité technique du travail dans la décision de recommander — la propreté du chantier reste, en pratique, ce qui se voit et se raconte le plus facilement.',
    },
    {
      type: 'cta',
      title: 'Un chantier bien documenté se raconte mieux',
      text: 'Cantia garde une trace claire de chaque chantier — photos, rapports, avancement — de quoi partager facilement une belle réalisation avec un client qui songe à vous recommander.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Quand demander à un client de recommander son artisan ?',
      answer:
        'Le meilleur moment est juste après la réception des travaux, quand la satisfaction est la plus fraîche et concrète — une demande simple, sans pression, suffit généralement.',
    },
    {
      question: 'Faut-il offrir une récompense financière pour une recommandation ?',
      answer:
        'Ce n’est pas obligatoire — un geste simple de remerciement (petite réduction, message sincère) suffit souvent à entretenir la relation sans transformer le client en apporteur d’affaires rémunéré.',
    },
    {
      question: 'Pourquoi un client recommandé se convertit-il plus facilement qu’un prospect classique ?',
      answer:
        'Parce que la confiance est déjà en partie établie par le lien avec la personne qui recommande — le prospect arrive avec un a priori positif que ne peut pas offrir une prise de contact sans lien préalable.',
    },
  ],
  relatedSlugs: [
    'trouver-clients-artisan-batiment-suisse',
    'avis-google-entreprise-construction-suisse',
    'portfolio-photos-avant-apres-chantier-vente',
  ],
};
