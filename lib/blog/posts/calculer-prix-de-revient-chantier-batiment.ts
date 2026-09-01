import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'calculer-prix-de-revient-chantier-batiment',
  question: 'Comment calculer le vrai prix de revient d’un chantier, au-delà du montant facturé ?',
  title: 'Prix de revient d’un chantier : la méthode pour savoir ce qu’il a vraiment coûté',
  description:
    'Le montant facturé n’est pas le prix de revient. Sans additionner main-d’œuvre réelle, matériaux, sous-traitance et frais généraux, impossible de savoir si un chantier a été rentable.',
  excerpt:
    'Un chantier « bien payé » peut quand même être un chantier perdant, si son coût réel n’a jamais été calculé après coup. Voici les composantes à additionner pour le savoir vraiment.',
  category: 'Chantier & rentabilité',
  keywords: ['prix de revient chantier', 'calcul coût chantier bâtiment', 'coût réel travaux construction', 'rentabilité travaux', 'décomposition coût chantier'],
  publishedAt: '2026-07-03',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Le montant facturé à un client ne dit rien, en soi, de la rentabilité d’un chantier. Le prix de revient (ce que le chantier a réellement coûté à l’entreprise) est une donnée distincte, qui demande d’additionner plusieurs composantes souvent dispersées entre plusieurs sources différentes.',
    },
    { type: 'h2', text: 'Les composantes du prix de revient' },
    {
      type: 'list',
      items: [
        'Main-d’œuvre réelle : heures effectivement passées sur le chantier, au coût horaire réel (charges sociales incluses), pas au tarif théorique du devis',
        'Matériaux : le coût effectivement payé, pas le prix catalogue estimé au moment du devis',
        'Sous-traitance : toutes les factures reçues de sous-traitants affectés à ce chantier précis',
        'Frais généraux affectés : une quote-part des coûts fixes de l’entreprise (véhicule, assurance, matériel partagé) répartie sur le chantier',
      ],
    },
    {
      type: 'stat',
      value: 'Marge réelle',
      label: 'Prix facturé − prix de revient = ce qu’il reste vraiment à l’entreprise, avant impôt',
    },
    { type: 'h2', text: 'Pourquoi cette différence est presque toujours sous-estimée' },
    {
      type: 'p',
      text: 'Un devis fixe un prix à l’avance, sur la base d’hypothèses (temps estimé, prix des matériaux au jour du chiffrage). Le chantier réel dévie presque toujours un peu, qu’il s’agisse d’un imprévu, d’un délai supplémentaire ou d’une variation de prix fournisseur. Sans comparaison systématique entre devisé et réel une fois le chantier terminé, cette dérive reste invisible, chantier après chantier.',
    },
    {
      type: 'callout',
      title: 'Le calcul n’a de valeur que fait chantier par chantier, pas globalement en fin d’année',
      text: 'Un chiffre d’affaires annuel positif peut masquer plusieurs chantiers structurellement perdants compensés par d’autres. Seule une analyse par chantier révèle lesquels tirent réellement l’activité vers le bas.',
    },
    {
      type: 'cta',
      title: 'Le prix de revient calculé automatiquement',
      text: 'Le module Rentabilité de Cantia confronte le devisé aux heures et coûts réellement engagés sur chaque chantier, sans besoin de reconstituer le calcul à la main.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Le montant facturé est-il le même que le prix de revient d’un chantier ?',
      answer:
        'Non, le prix de revient additionne le coût réel de la main-d’œuvre, des matériaux, de la sous-traitance et des frais généraux : il peut être très différent du montant facturé au client.',
    },
    {
      question: 'Pourquoi calculer le prix de revient chantier par chantier plutôt que globalement ?',
      answer:
        'Parce qu’un chiffre d’affaires annuel positif peut masquer des chantiers individuellement perdants compensés par d’autres. Seule une analyse fine révèle où l’entreprise perd réellement de l’argent.',
    },
    {
      question: 'Quelle est la composante la plus souvent sous-estimée dans un prix de revient ?',
      answer:
        'La main-d’œuvre réelle, calculée au coût horaire complet charges comprises. Elle est presque toujours plus élevée que le taux horaire théorique utilisé lors du chiffrage initial.',
    },
  ],
  relatedSlugs: [
    'calculer-prix-horaire-reel-ouvrier-batiment',
    'suivre-rentabilite-chantier-sans-excel',
    'chantier-complet-peut-etre-en-perte-taux-horaire',
  ],
};
