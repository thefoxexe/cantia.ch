import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'bexio-vs-cantia-logiciel-batiment',
  question: 'Bexio ou Cantia : quel logiciel choisir pour une entreprise du bâtiment ?',
  title: 'Bexio vs Cantia : quel logiciel pour une entreprise du bâtiment ?',
  description:
    'Bexio est une comptabilité généraliste suisse. Cantia est pensée spécifiquement pour le chantier : devis dicté à la voix, rentabilité par projet, rapports photo, QR-facture native.',
  excerpt:
    'Bexio n’a jamais été pensé pour un chantier. C’est un excellent outil de comptabilité pour une PME suisse quelconque, mais pas un outil de terrain pour le bâtiment.',
  category: 'Comparatifs & outils',
  keywords: ['bexio', 'alternative bexio', 'logiciel bâtiment', 'devis facturation', 'comparatif'],
  publishedAt: '2026-08-19',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'Bexio s’est imposé comme l’un des logiciels de comptabilité et facturation les plus utilisés par les PME suisses, tous secteurs confondus. La vraie question, une fois qu’on l’utilise depuis un an dans le bâtiment, n’est pas « est-il bon ? », mais plutôt « a-t-il été pensé pour ce que je fais vraiment, ou juste pour ce que fait n’importe quelle PME » ?',
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
        'Pas de rapport de chantier avec photos géolocalisées : un besoin pourtant quotidien pour documenter l’avancement, une malfaçon ou une réserve',
        'Pas de dictée vocale pour créer un devis depuis le van, entre deux rendez-vous, sans tout retaper le soir au bureau',
        'Pas de planning d’équipe intégré aux chantiers et aux devis',
        'Pas de portail client pour qu’un devis se consulte et se signe en ligne sans échange de PDF par email',
      ],
    },
    {
      type: 'callout',
      title: 'Ce n’est pas une question de qualité, c’est une question de métier visé',
      text: 'Bexio a été conçu pour la comptabilité d’une PME au sens large : un salon de coiffure, un cabinet d’avocat, une entreprise du bâtiment s’y retrouvent tous logés à la même enseigne. Cantia a été pensé uniquement pour le déroulement d’un chantier suisse, du premier rendez-vous client jusqu’au paiement final.',
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
        ['Photo de ticket → dépense enregistrée automatiquement', 'Oui (comptabilité générale)', 'Oui, directement dans la rentabilité du chantier concerné'],
        ['Comptabilité générale en partie double', 'Oui', 'Oui, générée automatiquement depuis factures, dépenses et salaires'],
      ],
    },
    {
      type: 'p',
      text: 'Dans la pratique, deux cas se présentent. Une entreprise déjà installée sur Bexio garde souvent sa comptabilité là-bas et utilise Cantia pour tout ce qui touche au chantier, les deux étant synchronisés. Une entreprise qui démarre peut tout faire dans Cantia : chaque facture, encaissement, dépense et salaire y génère une écriture comptable, avec le décompte TVA et le bouclement annuel, et la fiduciaire y accède avec Cantia Accounting.',
    },
    {
      type: 'callout',
      title: 'Les deux, sans double saisie',
      text: 'Cantia se connecte désormais nativement à Bexio (dès le plan Équipe) : clients synchronisés dans les deux sens, factures envoyées vers Bexio en un clic, statuts de paiement mis à jour toutes les 15 minutes. Le détail complet dans notre article dédié à l’intégration.',
    },
    {
      type: 'cta',
      title: 'Pensé pour le chantier, jusqu’à la comptabilité',
      text: 'Cantia couvre tout le parcours d’un chantier suisse : devis, facturation QR, rapports, planning, rentabilité et RH, aussi bien depuis le van que depuis le bureau.',
      buttonLabel: 'Essayer 14 jours',
    },
  ],
  faq: [
    {
      question: 'Cantia peut-il remplacer complètement Bexio ?',
      answer:
        'Oui, c’est possible. Cantia tient une comptabilité en partie double générée automatiquement à partir des factures, encaissements, dépenses et salaires, avec le décompte TVA et un assistant de bouclement annuel. Une entreprise qui préfère garder Bexio pour sa comptabilité peut aussi relier les deux : clients, articles, factures et paiements se synchronisent.',
    },
    {
      question: 'Bexio propose-t-il un module chantier ou rentabilité par projet ?',
      answer:
        'Non : Bexio est un ERP généraliste pour PME suisses, sans fonctionnalité dédiée au suivi de chantier, à la rentabilité par projet ou aux rapports photo géolocalisés.',
    },
    {
      question: 'Peut-on utiliser Cantia et Bexio en parallèle ?',
      answer:
        'Oui, c’est une combinaison fréquente. Et depuis peu, ce n’est plus une double saisie : Cantia se connecte nativement à Bexio pour synchroniser clients, factures et statuts de paiement automatiquement.',
    },
  ],
  relatedSlugs: [
    'integration-bexio-cantia-synchronisation-automatique',
    'suivre-rentabilite-chantier-sans-excel',
    'calculer-prix-devis-renovation-suisse',
  ],
};
