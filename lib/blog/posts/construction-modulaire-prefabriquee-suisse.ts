import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'construction-modulaire-prefabriquee-suisse',
  question: 'Où en est la construction modulaire et préfabriquée en Suisse ?',
  title: 'Construction modulaire et préfabriquée : où en est la Suisse',
  description:
    'Principe, avantages, limites et impact sur l’organisation d’une entreprise : où en est la construction modulaire et préfabriquée en Suisse en 2026.',
  excerpt:
    'Éléments fabriqués en atelier, assemblés sur site en quelques jours : la construction modulaire progresse en Suisse. Voici ce qu’elle change vraiment pour une entreprise du bâtiment.',
  category: 'Chantier & rentabilité',
  keywords: ['construction modulaire suisse', 'construction préfabriquée bâtiment', 'ossature préfabriquée atelier chantier'],
  publishedAt: '2026-10-11',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'La construction modulaire et préfabriquée gagne du terrain en Suisse, portée par la pression sur les délais et la pénurie de main-d’œuvre qualifiée sur certains métiers. Le principe reste simple : une partie importante du bâtiment est fabriquée en atelier, dans des conditions contrôlées, avant d’être assemblée sur site. Reste à savoir ce que cela change concrètement pour une entreprise qui doit s’y adapter.',
    },
    { type: 'h2', text: 'Le principe : déplacer le travail de l’extérieur vers l’atelier' },
    {
      type: 'p',
      text: 'Murs, planchers, salles de bains prééquipées ou modules entiers sont produits en atelier, puis transportés et assemblés sur le terrain. Le gros œuvre traditionnel — fondations, raccordements — reste généralement réalisé sur place, mais une part croissante du second œuvre est intégrée directement dans les éléments préfabriqués avant leur livraison.',
    },
    { type: 'h2', text: 'Des avantages réels, mais pas universels' },
    {
      type: 'list',
      items: [
        'Délai de chantier raccourci : l’assemblage sur site prend généralement bien moins de temps qu’une construction traditionnelle équivalente',
        'Moins de dépendance à la météo pour la partie fabriquée en atelier, ce qui limite les retards liés aux intempéries',
        'Qualité plus constante : la production en atelier permet un contrôle plus régulier que sur un chantier extérieur',
        'Moins de nuisances de chantier pour le voisinage, un argument qui pèse en zone urbaine dense',
      ],
    },
    { type: 'h2', text: 'Des limites à connaître avant de se lancer' },
    {
      type: 'p',
      text: 'La personnalisation reste généralement plus limitée qu’en construction traditionnelle, même si l’offre s’est diversifiée ces dernières années. Le transport et le grutage des modules doivent être planifiés très en amont : gabarit routier, accès au terrain, disponibilité d’une grue de forte capacité. Une erreur de planification logistique sur ce point peut annuler une bonne partie du gain de temps promis par la méthode.',
    },
    {
      type: 'callout',
      title: 'La précision se joue avant le chantier, pas pendant',
      text: 'Avec le modulaire, la marge de correction sur site est plus faible qu’en construction traditionnelle. Une erreur de cotation en amont se répercute directement sur l’assemblage : la préparation devient le moment le plus critique du projet.',
    },
    { type: 'h2', text: 'Ce que ça change pour une entreprise du bâtiment' },
    {
      type: 'p',
      text: 'S’adapter à ce mode de construction implique une coordination différente : moins de temps passé physiquement sur le chantier, mais davantage de précision exigée en amont, dans les plans, les commandes et la synchronisation avec le fabricant des modules. Les entreprises qui travaillent déjà en partie en préfabrication, comme certaines entreprises de construction bois, sont souvent les mieux placées pour intégrer ce type de projet.',
    },
    {
      type: 'cta',
      title: 'Suivre un chantier modulaire du devis à la facturation',
      text: 'Cantia permet de piloter un chantier en plusieurs phases, atelier et site, avec un suivi de rentabilité clair même quand une partie du travail sort du chantier traditionnel.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'La construction modulaire coûte-t-elle plus cher que la construction traditionnelle ?',
      answer:
        'Cela dépend fortement du projet. Le gain de temps et la réduction de la main-d’œuvre sur site compensent souvent un coût de fabrication en atelier plus élevé, mais le calcul reste à faire projet par projet, notamment selon la complexité du transport et du grutage.',
    },
    {
      question: 'Peut-on personnaliser un bâtiment modulaire comme une construction classique ?',
      answer:
        'La personnalisation est généralement plus limitée qu’en construction traditionnelle, mais l’offre s’est élargie : de nombreux fabricants proposent aujourd’hui des configurations modulables. Il vaut mieux clarifier ce point avec le client dès le devis pour éviter les malentendus.',
    },
    {
      question: 'Faut-il des compétences particulières pour travailler sur un chantier modulaire ?',
      answer:
        'La compétence clé se déplace vers la préparation : lecture de plans précis, coordination avec l’atelier de fabrication, et gestion logistique du transport et du grutage. Le travail d’assemblage sur site demande une bonne organisation plus qu’un nouveau métier.',
    },
  ],
  relatedSlugs: [
    'devis-facture-construction-bois-ossature-suisse',
    'previsionnel-tresorerie-entreprise-batiment',
    'checklist-ouverture-chantier-artisan',
  ],
};
