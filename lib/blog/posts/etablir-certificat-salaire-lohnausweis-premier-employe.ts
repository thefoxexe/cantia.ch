import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'etablir-certificat-salaire-lohnausweis-premier-employe',
  question: 'Comment établir un certificat de salaire pour son premier employé dans le bâtiment ?',
  title: 'Comment établir un certificat de salaire (Lohnausweis) pour son premier employé',
  description:
    'Le certificat de salaire annuel expliqué pour un employeur du bâtiment qui engage son premier employé : contenu obligatoire, formulaire officiel, délai et lien avec la déclaration d’impôts.',
  excerpt:
    'C’est une obligation annuelle qui tombe souvent au mauvais moment, en plein hiver, quand l’activité de chantier ralentit déjà. Voici ce que le certificat doit contenir et comment l’établir sans erreur.',
  category: 'RH & salaires',
  keywords: [
    'certificat de salaire premier employé',
    'lohnausweis entreprise bâtiment',
    'établir certificat de salaire suisse',
    'formulaire officiel certificat salaire',
    'avantages en nature véhicule certificat salaire',
  ],
  publishedAt: '2026-09-22',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Engager son premier employé change beaucoup de choses dans le quotidien administratif d’une entreprise du bâtiment, et l’une des obligations les moins visibles au départ est l’établissement du certificat de salaire, chaque année, pour chaque employé. C’est un document standardisé au niveau suisse, pas une simple attestation maison, et il conditionne directement la déclaration d’impôts de l’employé.',
    },
    { type: 'h2', text: 'Pourquoi ce document est obligatoire chaque année' },
    {
      type: 'p',
      text: 'Tout employeur doit établir un certificat de salaire annuel pour chaque personne employée durant l’année civile, que le contrat ait duré toute l’année ou seulement quelques mois. L’employé en a besoin pour remplir sa propre déclaration d’impôts, et l’administration fiscale s’appuie sur ce document pour vérifier la cohérence entre ce qui est déclaré par l’employeur et ce qui est déclaré par l’employé.',
    },
    { type: 'h2', text: 'Ce que le certificat doit contenir' },
    {
      type: 'list',
      items: [
        'Le salaire brut annuel total, y compris les éventuelles primes, le 13e salaire et les indemnités régulières.',
        'Les déductions sociales opérées (AVS/AI/APG, assurance-chômage, LPP, assurance accidents non professionnels le cas échéant).',
        'Les avantages en nature, dont le plus fréquent dans le bâtiment est l’usage privé d’un véhicule de service, qui doit être valorisé et ajouté au salaire déterminant.',
        'Les frais professionnels remboursés séparément, qui suivent des règles de déclaration différentes du salaire proprement dit.',
      ],
    },
    { type: 'h2', text: 'Le formulaire officiel et le délai' },
    {
      type: 'p',
      text: 'Le certificat de salaire suit un modèle officiel standardisé, reconnu dans toute la Suisse, disponible via les logiciels de comptabilité et de paie ou directement auprès de l’administration fiscale cantonale. Il doit généralement être remis à l’employé en début d’année suivante, avant que celui-ci n’ait besoin de le joindre à sa propre déclaration d’impôts. Un employé qui quitte l’entreprise en cours d’année doit recevoir son certificat au moment de son départ, sans attendre la fin de l’année civile.',
    },
    {
      type: 'callout',
      title: 'L’oubli le plus fréquent : le véhicule de service',
      text: 'Dès qu’un employé utilise un véhicule d’entreprise pour des trajets privés, même occasionnels, cet avantage doit apparaître sur le certificat de salaire à une valeur forfaitaire ou réelle. C’est un point souvent oublié la première année d’emploi, et régulièrement contrôlé par l’administration fiscale.',
    },
    {
      type: 'cta',
      title: 'La paie du premier employé, sans réinventer le certificat de salaire chaque hiver',
      text: 'Cantia garde le suivi des salaires et des avantages en nature liés aux véhicules d’entreprise tout au long de l’année, pour que l’établissement du certificat de salaire ne devienne pas une reconstitution de dernière minute.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Faut-il établir un certificat de salaire même pour un employé engagé en cours d’année ?',
      answer:
        'Oui, un certificat couvre la période réellement travaillée durant l’année civile, même si elle ne fait que quelques mois. Il n’existe pas de seuil minimal de durée d’emploi en dessous duquel l’obligation disparaît.',
    },
    {
      question: 'Le certificat de salaire est-il le même document que la déclaration de salaire à la caisse AVS ?',
      answer:
        'Non, ce sont deux documents distincts avec des destinataires différents : le certificat de salaire est remis à l’employé pour sa déclaration d’impôts, la déclaration de salaire annuelle est transmise à la caisse de compensation AVS.',
    },
    {
      question: 'Comment valoriser l’usage privé d’un véhicule de service sur le certificat de salaire ?',
      answer:
        'Une valeur forfaitaire mensuelle est généralement appliquée, calculée sur un pourcentage du prix d’achat du véhicule, sauf si un décompte réel plus précis est tenu. Les règles exactes doivent être vérifiées auprès de sa fiduciaire ou de l’administration fiscale cantonale.',
    },
  ],
  relatedSlugs: [
    'avs-ai-independant-batiment',
    'lpp-deuxieme-pilier-independant-batiment',
    'seuil-lpp-affiliation-employe-batiment',
  ],
};
