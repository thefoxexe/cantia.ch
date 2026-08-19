import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'bexio-vs-cantia-logiciel-batiment',
  question: 'Bexio ou Cantia : quel logiciel choisir pour une entreprise du bâtiment ?',
  title: 'Bexio vs Cantia : quel logiciel pour une entreprise du bâtiment ?',
  description:
    'Bexio est une comptabilité généraliste suisse. Cantia est pensée spécifiquement pour le chantier : devis dicté à la voix, rentabilité par projet, rapports photo, QR-facture native.',
  excerpt:
    'Bexio couvre très bien la comptabilité générale d’une PME suisse. Sur le terrain, dans le bâtiment, les besoins sont différents — voici où les deux outils divergent.',
  category: 'Comparatifs & outils',
  keywords: ['bexio', 'alternative bexio', 'logiciel bâtiment', 'devis facturation', 'comparatif'],
  publishedAt: '2026-02-02',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'Bexio s’est imposé comme l’un des logiciels de comptabilité et facturation les plus utilisés par les PME suisses, tous secteurs confondus. La question qui revient chez les artisans qui l’utilisent déjà : est-il vraiment adapté à un métier de chantier, ou juste "suffisant" faute de mieux ?',
    },
    { type: 'h2', text: 'Ce que Bexio fait bien' },
    {
      type: 'p',
      text: 'Bexio est un outil de comptabilité et de facturation généraliste solide : comptabilité en partie double, déclarations TVA, gestion des stocks pour du commerce, connecteurs bancaires. Pour une entreprise dont l’activité principale n’est pas le chantier lui-même (vente, services de bureau), c’est un choix cohérent et éprouvé.',
    },
    { type: 'h2', text: 'Ce qui manque quand le vrai métier est le chantier' },
    {
      type: 'list',
      items: [
        'Pas de rentabilité par chantier : Bexio suit la comptabilité globale de l’entreprise, pas ce qu’un chantier précis a réellement coûté face à ce qu’il a rapporté',
        'Pas de rapport de chantier avec photos géolocalisées — un besoin quotidien pour documenter l’avancement, les malfaçons ou les réserves',
        'Pas de dictée vocale pour créer un devis directement depuis le van, entre deux rendez-vous, sans ressaisir au bureau le soir',
        'Pas de planning d’équipe intégré aux chantiers et aux devis',
        'Pas de portail client pour que le client consulte et signe son devis en ligne sans échange de PDF par email',
      ],
    },
    {
      type: 'callout',
      title: 'La vraie différence n’est pas la qualité, c’est le métier visé',
      text: 'Bexio a été conçu pour la comptabilité d’une PME au sens large. Cantia a été conçu spécifiquement pour le déroulement d’un chantier suisse — du premier rendez-vous client jusqu’au paiement final, en passant par les rapports et le suivi de rentabilité.',
    },
    { type: 'h2', text: 'Tableau comparatif' },
    {
      type: 'table',
      headers: ['Besoin', 'Bexio', 'Cantia'],
      rows: [
        ['Devis & factures avec QR-facture', 'Oui', 'Oui, avec catalogue de prix métier'],
        ['Devis créé à la voix sur chantier', 'Non', 'Oui'],
        ['Rentabilité par chantier (devisé vs réel)', 'Non', 'Oui'],
        ['Rapport de chantier photo géolocalisé', 'Non', 'Oui'],
        ['Planning d’équipe par chantier', 'Non', 'Oui'],
        ['Portail client (signature devis en ligne)', 'Non', 'Oui'],
        ['Comptabilité générale en partie double', 'Oui', 'Non (pas son objectif)'],
      ],
    },
    {
      type: 'p',
      text: 'Dans la pratique, beaucoup d’entreprises du bâtiment utilisent les deux : un outil métier comme Cantia pour tout ce qui touche au chantier (devis, suivi, rentabilité, équipe), et transmettent les écritures à leur fiduciaire ou à un outil de comptabilité pour la clôture annuelle.',
    },
    {
      type: 'cta',
      title: 'Pensé pour le chantier, pas pour la comptabilité générale',
      text: 'Cantia couvre tout le parcours d’un chantier suisse : devis, facturation QR, rapports, planning, rentabilité et RH — depuis le van comme depuis le bureau.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Cantia peut-il remplacer complètement Bexio ?',
      answer:
        'Cantia n’est pas un logiciel de comptabilité générale (pas de comptabilité en partie double). Pour la tenue comptable complète, la plupart des entreprises gardent un outil dédié ou une fiduciaire — Cantia se concentre sur le pilotage opérationnel du chantier.',
    },
    {
      question: 'Bexio propose-t-il un module chantier ou rentabilité par projet ?',
      answer:
        'Non — Bexio est un ERP généraliste pour PME suisses, sans fonctionnalité dédiée au suivi de chantier, à la rentabilité par projet ou aux rapports photo géolocalisés.',
    },
    {
      question: 'Peut-on utiliser Cantia et Bexio en parallèle ?',
      answer:
        'Oui, c’est une combinaison fréquente : Cantia pour le pilotage quotidien des chantiers et devis, Bexio ou une fiduciaire pour la comptabilité générale et les déclarations fiscales.',
    },
  ],
  relatedSlugs: [
    'suivre-rentabilite-chantier-sans-excel',
    'calculer-prix-devis-renovation-suisse',
    'rediger-devis-qui-inspire-confiance-client',
  ],
};
