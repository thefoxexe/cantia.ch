import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'bexio-vs-cantia-logiciel-batiment',
  question: 'Bexio ou Cantia : quel logiciel choisir pour une entreprise du bâtiment ?',
  title: 'Bexio vs Cantia : quel logiciel pour une entreprise du bâtiment ?',
  description:
    'Bexio est une comptabilité généraliste suisse. Cantia est pensée spécifiquement pour le chantier : devis dicté à la voix, rentabilité par projet, rapports photo, QR-facture native.',
  excerpt:
    'Bexio n’a jamais été pensé pour un chantier. C’est un excellent outil de comptabilité pour une PME suisse quelconque — pas un outil de terrain pour le bâtiment.',
  category: 'Comparatifs & outils',
  keywords: ['bexio', 'alternative bexio', 'logiciel bâtiment', 'devis facturation', 'comparatif'],
  publishedAt: '2026-02-02',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'Bexio s’est imposé comme l’un des logiciels de comptabilité et facturation les plus utilisés par les PME suisses, tous secteurs confondus. La vraie question, une fois qu’on l’utilise depuis un an dans le bâtiment, n’est pas « est-il bon ? » — c’est « a-t-il été pensé pour ce que je fais vraiment, ou juste pour ce que fait n’importe quelle PME » ?',
    },
    { type: 'h2', text: 'Ce que Bexio fait bien' },
    {
      type: 'p',
      text: 'Comptabilité en partie double, déclarations TVA, connecteurs bancaires, gestion de stock pensée pour du commerce. Pour une entreprise dont l’activité principale n’est pas le chantier lui-même, c’est un choix solide, éprouvé, et largement suffisant.',
    },
    { type: 'h2', text: 'Ce qui manque quand le vrai métier est le chantier' },
    {
      type: 'list',
      items: [
        'Pas de rentabilité par chantier : Bexio voit la comptabilité globale de l’entreprise, jamais ce qu’un chantier précis a réellement coûté face à ce qu’il a rapporté',
        'Pas de rapport de chantier avec photos géolocalisées — un besoin quotidien pour documenter l’avancement, une malfaçon ou une réserve',
        'Pas de dictée vocale pour créer un devis depuis le van, entre deux rendez-vous, sans tout retaper le soir au bureau',
        'Pas de planning d’équipe intégré aux chantiers et aux devis',
        'Pas de portail client pour qu’un devis se consulte et se signe en ligne sans échange de PDF par email',
      ],
    },
    {
      type: 'callout',
      title: 'Ce n’est pas une question de qualité, c’est une question de métier visé',
      text: 'Bexio a été conçu pour la comptabilité d’une PME au sens large — un salon de coiffure, un cabinet d’avocat, une entreprise du bâtiment s’y retrouvent tous logés à la même enseigne. Cantia a été pensé uniquement pour le déroulement d’un chantier suisse, du premier rendez-vous client jusqu’au paiement final.',
    },
    { type: 'h2', text: 'Le tableau qui tranche' },
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
      text: 'Dans la pratique, beaucoup d’entreprises utilisent les deux en parallèle : un outil métier comme Cantia pour tout ce qui touche au chantier, et une transmission des écritures à une fiduciaire ou à un outil de comptabilité pour la clôture annuelle. Aucun des deux n’a besoin de remplacer l’autre pour être le bon choix.',
    },
    {
      type: 'callout',
      title: 'Les deux, sans double saisie',
      text: 'Cantia se connecte désormais nativement à Bexio (dès le plan Entreprise) : clients importés automatiquement, factures envoyées vers Bexio en un clic, statuts de paiement synchronisés chaque heure. Le détail complet dans notre article dédié à l’intégration.',
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
        'Oui, c’est une combinaison fréquente — et depuis peu, ce n’est plus une double saisie : Cantia se connecte nativement à Bexio pour synchroniser clients, factures et statuts de paiement automatiquement.',
    },
  ],
  relatedSlugs: [
    'integration-bexio-cantia-synchronisation-automatique',
    'suivre-rentabilite-chantier-sans-excel',
    'calculer-prix-devis-renovation-suisse',
  ],
};
