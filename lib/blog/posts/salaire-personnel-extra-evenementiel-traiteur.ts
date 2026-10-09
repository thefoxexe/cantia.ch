import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'salaire-personnel-extra-evenementiel-traiteur',
  question: 'Comment calculer le salaire du personnel extra d’un traiteur en Suisse ?',
  title: 'Personnel extra d’un traiteur : salaire horaire, vacances et charges',
  description:
    'Salaire horaire, indemnité de vacances en pour-cent, cotisations AVS et assurances : comment payer correctement le personnel engagé à l’heure pour un événement.',
  excerpt:
    'Le personnel extra est payé à l’heure, mais pas seulement l’heure : vacances, éventuel 13e et cotisations s’ajoutent, et doivent apparaître sur la fiche de salaire.',
  category: 'Services & autres métiers',
  keywords: ['salaire extra traiteur', 'personnel événementiel salaire horaire', 'indemnité vacances 8,33 %', 'CCNT extra', 'fiche de salaire extra'],
  publishedAt: '2026-10-09',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Service, montage, démontage : un événement mobilise souvent du personnel engagé à l’heure. Ces collaborateurs ont les mêmes droits de base que les autres, et leur salaire se calcule en plusieurs couches.',
    },
    { type: 'h2', text: '1. Le salaire horaire de base' },
    {
      type: 'p',
      text: 'Vérifiez si une convention collective s’applique à votre entreprise. Dans l’hôtellerie-restauration, la CCNT fixe des salaires minimaux et des règles propres ; d’autres activités événementielles relèvent d’autres règles. Le salaire de base ne peut pas être inférieur au minimum applicable.',
    },
    { type: 'h2', text: '2. L’indemnité de vacances' },
    {
      type: 'p',
      text: 'Pour un travail irrégulier payé à l’heure, les vacances sont souvent payées sous forme de supplément en pour-cent, indiqué séparément sur chaque fiche de salaire.',
    },
    {
      type: 'table',
      headers: ['Droit aux vacances', 'Supplément sur le salaire horaire'],
      rows: [
        ['4 semaines', '8,33 %'],
        ['5 semaines', '10,64 %'],
      ],
    },
    {
      type: 'callout',
      title: 'Le supplément doit être visible',
      text: 'L’indemnité de vacances incluse dans le salaire horaire doit figurer séparément, en francs ou en pour-cent, sur le contrat et sur chaque décompte.',
    },
    { type: 'h2', text: '3. 13e salaire et jours fériés' },
    {
      type: 'p',
      text: 'S’ils sont dus selon le contrat ou la convention collective, ils peuvent aussi être versés en pour-cent du salaire horaire. Un 13e salaire correspond à 8,33 % du salaire de base.',
    },
    { type: 'h2', text: '4. Les cotisations' },
    {
      type: 'list',
      items: [
        'AVS/AI/APG et assurance chômage, retenues sur le salaire et payées aussi par l’employeur',
        'Assurance accidents : accidents professionnels à la charge de l’employeur ; accidents non professionnels retenus si l’employé travaille au moins 8 heures par semaine chez vous',
        'LPP seulement au-delà du seuil d’entrée annuel',
        'Impôt à la source pour les personnes qui y sont soumises',
      ],
    },
    { type: 'h2', text: 'Des heures planifiées aux fiches de salaire' },
    {
      type: 'p',
      text: 'Le plus simple : planifier le personnel par événement, faire saisir les heures réelles, et laisser ces heures alimenter la fiche de salaire du mois. Vous savez aussi ce que le personnel a coûté pour chaque événement.',
    },
    {
      type: 'cta',
      title: 'Du planning à la fiche de salaire',
      text: 'Avec Cantia, les heures du personnel par événement donnent les fiches de salaire avec les déductions suisses, puis le certificat de salaire. Essai gratuit de 14 jours.',
      buttonLabel: 'Essayer 14 jours',
    },
  ],
  faq: [
    {
      question: 'Combien représente l’indemnité de vacances pour 5 semaines ?',
      answer: '10,64 % du salaire horaire de base (5 semaines ÷ 47 semaines travaillées).',
    },
    {
      question: 'Le personnel extra doit-il avoir une fiche de salaire ?',
      answer: 'Oui, chaque paiement de salaire doit être accompagné d’un décompte indiquant le salaire, les suppléments et les déductions.',
    },
    {
      question: 'Faut-il retenir l’assurance accidents non professionnels ?',
      answer: 'Seulement si la personne travaille au moins 8 heures par semaine chez vous ; sinon, elle n’est pas assurée chez vous pour les accidents non professionnels.',
    },
  ],
  relatedSlugs: ['calculer-13e-salaire-prorata-employe', 'formateur-independant-suisse-tva-facture', 'acompte-demenagement-suisse-montant-facture'],
  relatedTradeSlug: 'traiteur',
};
