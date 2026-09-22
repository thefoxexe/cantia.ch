import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-facture-etancheur-suisse',
  question: 'Comment établir devis et factures en tant qu’étancheur en Suisse ?',
  title: 'Devis et facturation pour un étancheur en Suisse',
  description:
    'Toitures plates, terrasses, sous-sols : chiffrage au m² selon le système d’étanchéité et importance de la garantie pour un étancheur en Suisse.',
  excerpt:
    'Une infiltration peut apparaître des mois après la fin du chantier. Pour un étancheur, la documentation de l’exécution compte presque autant que le travail lui-même.',
  category: 'Métiers du bâtiment',
  keywords: ['devis étancheur suisse', 'facturation étanchéité toiture', 'prix étanchéité terrasse m2'],
  publishedAt: '2026-10-12',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Le métier d’étancheur intervient sur des ouvrages où l’erreur ne pardonne pas : toitures plates, terrasses, sous-sols, parkings souterrains. Une étanchéité mal posée ne se remarque pas immédiatement, ce qui rend le chiffrage, l’exécution et la documentation du chantier particulièrement importants dans ce métier.',
    },
    { type: 'h2', text: 'Des domaines d’intervention aux exigences différentes' },
    {
      type: 'list',
      items: [
        'Toitures plates : exposition directe aux intempéries et aux UV, système d’étanchéité à choisir selon l’usage prévu de la toiture',
        'Terrasses accessibles : contraintes supplémentaires liées au piétinement et souvent à la pose d’un revêtement par-dessus',
        'Sous-sols et fondations : étanchéité contre l’humidité ascensionnelle ou la pression de l’eau, technique différente de l’étanchéité en toiture',
        'Parkings souterrains : circulation de véhicules à intégrer dans le choix du système, résistance mécanique accrue nécessaire',
      ],
    },
    { type: 'h2', text: 'Un chiffrage au m² qui varie fortement selon le système' },
    {
      type: 'table',
      headers: ['Système', 'Caractéristique', 'Usage typique'],
      rows: [
        ['Bitumineux', 'Solution éprouvée, pose multicouche', 'Toitures plates classiques'],
        ['Membrane synthétique', 'Pose en un lit, bonne résistance UV', 'Toitures et terrasses exposées'],
        ['Résine liquide', 'Application sans joint, adaptée aux formes complexes', 'Terrasses, balcons, points singuliers'],
      ],
    },
    {
      type: 'p',
      text: 'Le choix du système influence directement le prix au m², mais aussi la durée de vie attendue de l’ouvrage. Le devis doit préciser clairement le système retenu et sa durée de garantie associée, pas seulement un prix global au m² sans référence technique.',
    },
    { type: 'h2', text: 'La documentation, une protection indispensable en cas de litige' },
    {
      type: 'p',
      text: 'Une infiltration peut apparaître plusieurs mois, voire plusieurs années après la fin des travaux, ce qui complique souvent l’identification de la cause exacte. Documenter précisément l’exécution — photos des différentes étapes, référence du système posé, épaisseur appliquée — devient alors une protection essentielle pour l’étancheur en cas de réclamation ultérieure, bien au-delà d’une simple formalité administrative.',
    },
    {
      type: 'callout',
      title: 'Sans documentation, la charge de la preuve devient difficile à gérer',
      text: 'En cas d’infiltration constatée longtemps après le chantier, celui qui peut prouver la conformité de son exécution est en position bien plus favorable que celui qui ne peut s’appuyer que sur sa parole. Photographier chaque étape clé du chantier n’est jamais du temps perdu dans ce métier.',
    },
    {
      type: 'cta',
      title: 'Un devis et un dossier de chantier qui se construisent ensemble',
      text: 'Cantia permet de joindre photos et documents techniques directement au dossier de chantier, pour un historique complet en cas de réclamation.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Quel système d’étanchéité choisir pour une terrasse accessible ?',
      answer:
        'Le choix dépend de l’usage prévu et du revêtement final souhaité. Une résine liquide convient souvent bien aux formes complexes et aux points singuliers, tandis qu’une membrane synthétique reste une valeur sûre pour de grandes surfaces exposées. Le conseil d’un professionnel reste indispensable au cas par cas.',
    },
    {
      question: 'Combien de temps après les travaux une infiltration peut-elle apparaître ?',
      answer:
        'Cela varie fortement selon la cause : un défaut de pose peut se révéler dès les premières fortes pluies, tandis qu’un vieillissement prématuré du matériau peut n’apparaître qu’après plusieurs années. C’est justement pour cela qu’une bonne documentation de l’exécution est essentielle.',
    },
    {
      question: 'Faut-il garantir l’étanchéité plus longtemps que les autres travaux du bâtiment ?',
      answer:
        'Les garanties légales générales s’appliquent, mais certains fabricants de systèmes d’étanchéité proposent en complément des garanties spécifiques sur leurs produits, sous réserve d’une pose conforme à leurs prescriptions. Il vaut mieux vérifier ces conditions avant de les indiquer au client.',
    },
  ],
  relatedSlugs: [
    'garantie-travaux-construction-2-ou-5-ans',
    'reception-travaux-proces-verbal-chantier',
    'checklist-cloture-chantier-avant-facturation',
  ],
  relatedTradeSlug: 'etancheur',
};
