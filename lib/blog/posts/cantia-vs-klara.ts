import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'cantia-vs-klara',
  question: 'Cantia ou Klara : lequel choisir pour une entreprise du bâtiment en Suisse ?',
  title: 'Cantia vs Klara : quel logiciel pour une entreprise du bâtiment suisse',
  description:
    'Klara est une solution suisse solide de comptabilité et facturation pour indépendants et petites entreprises. Cantia est pensée spécifiquement pour le chantier. Comparaison honnête des deux approches.',
  excerpt:
    'Klara est un bon outil de comptabilité pour une petite entreprise suisse quelconque. La question, pour une entreprise du bâtiment, est de savoir si « quelconque » suffit.',
  category: 'Comparatifs & outils',
  keywords: ['Klara', 'alternative Klara bâtiment', 'Klara vs Cantia', 'logiciel bâtiment suisse'],
  publishedAt: '2026-09-30',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'Klara s’est fait une place solide parmi les outils suisses de comptabilité et de facturation pour indépendants et petites entreprises, tous secteurs confondus. C’est un outil généraliste, pensé pour couvrir un large éventail de métiers plutôt qu’un métier en particulier. La question à se poser, dans le bâtiment, est de savoir ce que ce choix généraliste laisse de côté au quotidien sur un chantier.',
    },
    { type: 'h2', text: 'Ce que Klara fait bien' },
    {
      type: 'p',
      text: 'Facturation conforme, suivi des paiements, quelques automatisations administratives et une interface pensée pour rester simple : Klara reste un choix raisonnable pour une petite structure dont l’activité principale n’est pas le pilotage d’un chantier au jour le jour.',
    },
    { type: 'h2', text: 'Ce qui manque pour une activité de chantier' },
    {
      type: 'p',
      text: 'Klara n’a pas été conçu pour le bâtiment en particulier : pas de suivi de rentabilité chantier par chantier, pas de catalogue de prix propre aux métiers du bâtiment, pas de création de devis directement sur le terrain avec des photos, pas de planning d’équipe rattaché aux chantiers en cours. Ce ne sont pas des défauts de Klara en tant que tel, simplement des besoins qui n’entrent pas dans son périmètre.',
    },
    {
      type: 'callout',
      title: 'Un bon outil généraliste reste un outil généraliste',
      text: 'Klara fait bien ce pour quoi il a été conçu : la comptabilité et la facturation d’une petite entreprise suisse, quel que soit son secteur. Cantia part du chantier lui-même, et construit tout le reste (devis, factures, RH, planning) autour de cette réalité de terrain.',
    },
    { type: 'h2', text: 'Le tableau comparatif' },
    {
      type: 'table',
      headers: ['Critère', 'Klara', 'Cantia'],
      rows: [
        ['Facturation conforme suisse (QR-facture)', 'Oui', 'Oui'],
        ['Catalogue de prix spécifique aux métiers du bâtiment', 'Non', 'Oui'],
        ['Devis créé sur le terrain, depuis le chantier', 'Non', 'Oui'],
        ['Suivi de rentabilité par chantier', 'Non', 'Oui'],
        ['Rapport de chantier avec photos', 'Non', 'Oui'],
        ['Planning d’équipe par chantier', 'Non', 'Oui'],
        ['Comptabilité générale suisse', 'Oui', 'Non (pas son objectif)'],
      ],
    },
    {
      type: 'p',
      text: 'Ce n’est pas un choix qui s’exclut forcément : certaines entreprises gardent un outil de comptabilité générale pour la clôture annuelle et utilisent un outil métier pour tout ce qui touche au chantier lui-même, sans que l’un remplace l’autre.',
    },
    {
      type: 'cta',
      title: 'Pensé pour le chantier, du devis au paiement',
      text: 'Cantia couvre tout le parcours d’un chantier suisse : devis dicté à la voix, factures QR conformes, rapports photo, planning et rentabilité, sans jamais perdre de vue que le vrai métier se passe sur le terrain.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Klara convient-il à une entreprise du bâtiment ?',
      answer:
        'Klara peut convenir pour la facturation et la comptabilité générale, mais il n’a pas été conçu spécifiquement pour le bâtiment : pas de suivi de rentabilité par chantier, pas de catalogue de prix métier, pas de rapport de chantier avec photos.',
    },
    {
      question: 'Quelle est la principale différence entre Klara et Cantia ?',
      answer:
        'Klara est un outil généraliste de comptabilité et facturation pour petites entreprises suisses, tous secteurs confondus. Cantia est pensé spécifiquement pour le déroulement d’un chantier, du premier devis jusqu’au paiement final.',
    },
    {
      question: 'Peut-on utiliser Klara et Cantia ensemble ?',
      answer:
        'C’est possible : certaines entreprises gardent un outil de comptabilité générale comme Klara pour la clôture annuelle, tout en utilisant Cantia au quotidien pour le pilotage opérationnel des chantiers.',
    },
  ],
  relatedSlugs: ['bexio-vs-cantia-logiciel-batiment', 'cantia-vs-winbiz', 'meilleur-logiciel-devis-facture-batiment-suisse-2026'],
};
