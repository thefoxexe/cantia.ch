import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-facture-frigoriste-climatisation-suisse',
  question: 'Comment établir devis et factures en tant que frigoriste-climaticien en Suisse ?',
  title: 'Devis et facturation pour un frigoriste-climaticien en Suisse',
  description:
    'Comment chiffrer un devis et facturer en tant que frigoriste-climaticien en Suisse : matériel dominant, fluides frigorigènes, contrats d’entretien récurrent.',
  excerpt:
    'Les étés chauds font grimper la demande en climatisation. Voici comment un frigoriste-climaticien structure un devis entre matériel, pose et entretien récurrent.',
  category: 'Métiers du bâtiment',
  keywords: [
    'devis climatisation suisse',
    'facturation frigoriste',
    'prix installation climatiseur',
    'contrat entretien climatisation',
  ],
  publishedAt: '2026-10-03',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'La demande en climatisation et réfrigération augmente avec des étés de plus en plus chauds, et beaucoup de frigoristes-climaticiens voient leur carnet de commandes se remplir bien plus vite que leur capacité de pose. Un devis bien structuré, avec un matériel clairement chiffré et un service d’entretien pensé dès le départ, fait la différence sur la rentabilité réelle de l’activité.',
    },
    { type: 'h2', text: 'Le matériel, poste dominant du devis' },
    {
      type: 'p',
      text: 'Comme pour beaucoup de métiers du chauffage-ventilation, le matériel (unités intérieures et extérieures, fluide frigorigène, réseau de distribution) représente la part la plus importante du prix d’une installation. Le devis doit détailler la puissance et le modèle choisis, car les écarts de prix entre gammes d’entrée et gammes performantes sont significatifs et source de confusion si le client compare plusieurs devis sans comprendre pourquoi les prix diffèrent autant.',
    },
    { type: 'h2', text: 'La manipulation des fluides frigorigènes est encadrée' },
    {
      type: 'p',
      text: 'La manipulation des fluides frigorigènes est soumise à des exigences de certification professionnelle, dont le détail exact dépend du type de fluide et du cadre réglementaire en vigueur. Un devis sérieux mentionne que l’intervention est réalisée par du personnel qualifié pour cette manipulation, et le frigoriste doit vérifier que sa certification reste à jour selon les exigences applicables à son activité.',
    },
    { type: 'h2', text: 'L’entretien récurrent, un revenu à ne pas négliger' },
    {
      type: 'list',
      items: [
        'Une installation neuve s’accompagne souvent d’une proposition de contrat d’entretien annuel dès la signature du devis initial',
        'Le contrat d’entretien lisse le chiffre d’affaires sur l’année, alors que les installations neuves se concentrent surtout sur les mois chauds',
        'Un entretien régulier prolonge la durée de vie du matériel et limite les pannes en pleine canicule, ce qui est aussi un argument commercial fort',
      ],
    },
    {
      type: 'callout',
      title: 'Séparer devis d’installation et contrat d’entretien',
      text: 'Même quand les deux sont vendus ensemble, présenter le contrat d’entretien comme une ligne distincte, facturée séparément et de façon récurrente, permet de suivre sa rentabilité propre sans la diluer dans le prix de l’installation.',
    },
    {
      type: 'cta',
      title: 'Installation et entretien, dans le même outil',
      text: 'Cantia gère aussi bien un devis d’installation ponctuel qu’un contrat d’entretien facturé automatiquement chaque année.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Pourquoi le prix d’une climatisation varie-t-il autant entre deux devis ?',
      answer:
        'Principalement à cause du matériel : la puissance, la gamme et la technologie de l’unité choisie font varier fortement le prix, bien plus que le temps de pose lui-même.',
    },
    {
      question: 'Faut-il facturer le contrat d’entretien séparément de l’installation ?',
      answer:
        'C’est recommandé, car cela permet de suivre la rentabilité de chaque activité indépendamment et de lisser le chiffre d’affaires sur l’année plutôt que de tout concentrer sur les mois de forte demande.',
    },
    {
      question: 'Qui peut manipuler les fluides frigorigènes lors d’une installation ?',
      answer:
        'Uniquement du personnel disposant de la certification professionnelle requise pour ce type de fluide. Le frigoriste doit s’assurer que sa qualification reste valide selon les exigences applicables à son activité.',
    },
  ],
  relatedSlugs: [
    'devis-facture-chauffagiste-cvc-suisse',
    'devis-pompe-a-chaleur-chiffrage',
    'previsionnel-tresorerie-entreprise-batiment',
  ],
};
