import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-pompe-a-chaleur-chiffrage',
  question: 'Comment chiffrer un devis d’installation de pompe à chaleur en Suisse ?',
  title: 'Comment chiffrer un devis d’installation de pompe à chaleur',
  description:
    'Comment chiffrer un devis de pompe à chaleur en Suisse : unité, raccordement, forage éventuel, facteurs de variation du prix, lien avec le Programme Bâtiments.',
  excerpt:
    'Air-eau ou géothermie, bâtiment bien isolé ou passoire thermique : le prix d’une pompe à chaleur varie fortement selon des critères que le devis doit rendre lisibles pour le client.',
  category: 'Devis & facturation',
  keywords: [
    'devis pompe à chaleur suisse',
    'prix installation pompe à chaleur',
    'pompe à chaleur air eau prix',
    'géothermie devis suisse',
  ],
  publishedAt: '2026-10-04',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Le remplacement d’un chauffage fossile par une pompe à chaleur est l’un des chantiers énergétiques les plus demandés en Suisse actuellement, et aussi l’un des plus mal compris par les clients au moment de recevoir un devis. Le prix affiché peut varier du simple au double selon des paramètres que le devis doit expliquer, pas seulement chiffrer.',
    },
    { type: 'h2', text: 'Les quatre postes principaux du devis' },
    {
      type: 'list',
      items: [
        'L’unité elle-même : le prix varie fortement selon la puissance nécessaire et la technologie (air-eau ou géothermie)',
        'L’installation et le raccordement hydraulique au circuit de chauffage existant',
        'Le raccordement électrique, qui peut nécessiter une adaptation du tableau selon la puissance de l’installation',
        'Le forage, uniquement pour une solution géothermique, poste à part entière qui peut représenter une part importante du budget total',
      ],
    },
    { type: 'h2', text: 'Air-eau ou géothermie : deux logiques de prix très différentes' },
    {
      type: 'p',
      text: 'Une pompe à chaleur air-eau coûte en général moins cher à l’installation qu’une solution géothermique, car elle ne nécessite pas de forage, mais son rendement dépend davantage de la température extérieure. La géothermie demande un investissement initial plus élevé, notamment à cause du forage, en échange d’un rendement plus stable toute l’année. Le devis doit présenter ce choix clairement au client, avec les deux options chiffrées séparément si la décision n’est pas encore arrêtée.',
    },
    { type: 'h2', text: 'L’état du bâtiment change tout le dimensionnement' },
    {
      type: 'p',
      text: 'Le dimensionnement de la pompe à chaleur dépend directement de l’isolation existante du bâtiment. Installer une pompe à chaleur dans un bâtiment mal isolé sans en tenir compte mène soit à un sous-dimensionnement qui ne chauffera pas correctement par grand froid, soit à un surdimensionnement coûteux et peu efficient. Un devis sérieux mentionne si une étude thermique ou un diagnostic de l’enveloppe a été réalisé, et recommande cette étape si ce n’est pas le cas.',
    },
    {
      type: 'callout',
      title: 'Le lien avec les subventions cantonales',
      text: 'Le remplacement d’un chauffage fossile par une pompe à chaleur entre souvent dans le cadre du Programme Bâtiments, avec un soutien financier dont le montant exact varie par canton. Le devis doit rester net de toute subvention, le client vérifiant séparément son éligibilité et le montant sur le site de son canton.',
    },
    {
      type: 'cta',
      title: 'Des devis clairs pour un choix technique complexe',
      text: 'Cantia permet de présenter plusieurs scénarios chiffrés (air-eau, géothermie) dans un même devis, pour que le client compare facilement avant de décider.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Pourquoi une pompe à chaleur géothermique coûte-t-elle plus cher qu’une air-eau ?',
      answer:
        'Principalement à cause du forage nécessaire pour capter la chaleur du sol, un poste supplémentaire qui n’existe pas pour une solution air-eau, en échange d’un rendement généralement plus stable toute l’année.',
    },
    {
      question: 'Faut-il isoler le bâtiment avant d’installer une pompe à chaleur ?',
      answer:
        'Ce n’est pas toujours obligatoire, mais l’état de l’isolation conditionne le bon dimensionnement de l’installation. Un diagnostic préalable permet d’éviter une pompe sous- ou surdimensionnée par rapport aux besoins réels.',
    },
    {
      question: 'Le remplacement d’un chauffage au mazout par une pompe à chaleur est-il subventionné ?',
      answer:
        'Souvent oui, dans le cadre du Programme Bâtiments, mais le montant exact et les conditions dépendent du canton. Le client doit vérifier son éligibilité et le montant précis sur le site cantonal correspondant.',
    },
  ],
  relatedSlugs: [
    'programme-batiments-subvention-renovation-suisse',
    'devis-facture-chauffagiste-cvc-suisse',
    'devis-facture-installateur-solaire-suisse',
    'calculer-prix-devis-renovation-suisse',
  ],
};
