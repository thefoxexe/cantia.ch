import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'norme-aeai-incendie-batiment-obligation',
  question: 'Que dit la norme incendie AEAI pour un artisan du bâtiment ?',
  title: 'Norme incendie AEAI : ce qu’un artisan doit connaître avant un chantier',
  description:
    'Le rôle de l’AEAI dans la protection incendie en Suisse, ce que ça implique concrètement pour un artisan (matériaux classés, cloisons coupe-feu, issues de secours) et le risque d’ignorer la norme.',
  excerpt:
    'Un artisan qui pose la mauvaise cloison ou le mauvais matériau dans une zone soumise à la norme incendie peut bloquer la réception d’un chantier entier. Voici ce qu’il faut savoir avant de commander le matériel.',
  category: 'Juridique & normes',
  keywords: [
    'norme incendie aeai bâtiment',
    'protection incendie chantier suisse',
    'cloison coupe-feu norme aeai',
    'matériaux classés résistance au feu',
    'aeai construction suisse',
  ],
  publishedAt: '2026-09-23',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'L’AEAI, l’Association des établissements cantonaux d’assurance incendie, est l’organisme qui définit les normes et directives de protection incendie applicables aux bâtiments en Suisse. Ce n’est pas une réglementation réservée aux architectes : un artisan qui pose une cloison, installe une gaine technique ou choisit un revêtement dans certaines zones d’un bâtiment doit en tenir compte, sous peine de voir son travail refusé à la réception.',
    },
    { type: 'h2', text: 'Ce que la norme incendie implique concrètement sur un chantier' },
    {
      type: 'list',
      items: [
        'Des matériaux de construction classés selon leur réaction et leur résistance au feu, avec des exigences différentes selon l’usage du local (habitation, local technique, cage d’escalier).',
        'Des cloisons et portes coupe-feu dans certaines zones, notamment les séparations entre logements, les gaines techniques ou les accès aux issues de secours.',
        'Des issues de secours dégagées et dimensionnées selon des règles précises, particulièrement sensibles dans les bâtiments collectifs ou les locaux recevant du public.',
        'Une compartimentation du bâtiment qui limite la propagation du feu et de la fumée entre les différentes zones, un point souvent invisible une fois les finitions posées mais vérifié lors des contrôles.',
      ],
    },
    { type: 'h2', text: 'Pourquoi ignorer la norme peut bloquer une réception de chantier' },
    {
      type: 'p',
      text: 'Un contrôle de conformité incendie, souvent réalisé par l’autorité cantonale compétente ou son mandataire, peut refuser la réception d’un ouvrage si un matériau non classé a été utilisé à un endroit sensible, ou si une cloison coupe-feu prévue au plan a été remplacée par une cloison standard sans validation. Reprendre ces travaux après coup coûte presque toujours plus cher que de vérifier la norme applicable avant de commander le matériel.',
    },
    { type: 'h2', text: 'Le réflexe à avoir avant un chantier sensible' },
    {
      type: 'p',
      text: 'Dès qu’un chantier touche une cage d’escalier, une séparation entre logements, un local technique ou un bâtiment recevant du public, il vaut la peine de vérifier les exigences de protection incendie applicables avant de passer commande de matériel, en particulier pour les cloisons, les portes et les revêtements. Le plan d’exécution fourni par l’architecte ou l’ingénieur mentionne normalement ces exigences, mais elles méritent d’être confirmées avant d’acheter, pas après avoir posé.',
    },
    {
      type: 'callout',
      title: 'Un matériau qui ressemble à l’original ne suffit pas',
      text: 'Substituer une cloison ou une porte coupe-feu par un modèle visuellement similaire mais non certifié reste une erreur fréquente lors d’un remplacement en urgence sur un chantier. Seule la classification officielle du produit compte lors du contrôle, pas son apparence.',
    },
    {
      type: 'cta',
      title: 'Des exigences techniques qui restent attachées au bon chantier',
      text: 'Cantia permet de rattacher les spécifications et les contraintes propres à chaque chantier, protection incendie comprise, pour que la bonne exigence reste visible au moment de commander le matériel.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Qui vérifie le respect de la norme incendie AEAI sur un chantier ?',
      answer:
        'Le contrôle est généralement effectué par l’autorité cantonale compétente en matière de protection incendie ou par un mandataire spécialisé, souvent au moment de la réception de l’ouvrage.',
    },
    {
      question: 'Toutes les cloisons d’un bâtiment doivent-elles être coupe-feu ?',
      answer:
        'Non, seules certaines zones sont concernées, notamment les séparations entre logements, les cages d’escalier et les gaines techniques. Les exigences précises dépendent de l’usage et de la configuration du bâtiment, à vérifier sur les plans d’exécution.',
    },
    {
      question: 'Que risque une entreprise qui pose un matériau non conforme à la norme incendie ?',
      answer:
        'Elle risque un refus de réception du chantier et l’obligation de reprendre les travaux à ses frais, en plus d’une responsabilité engagée en cas de sinistre où la non-conformité serait constatée.',
    },
  ],
  relatedSlugs: [
    'permis-construire-renovation-quand-necessaire',
    'assurance-chantier-tous-risques-ectr-obligatoire',
    'diagnostic-amiante-renovation-obligatoire-suisse',
  ],
};
