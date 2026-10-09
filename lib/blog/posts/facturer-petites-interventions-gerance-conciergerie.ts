import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'facturer-petites-interventions-gerance-conciergerie',
  question: 'Comment facturer les petites interventions d’une conciergerie à une gérance ?',
  title: 'Conciergerie : facturer les petites interventions sans en oublier',
  description:
    'Ampoules, débouchages, réglages : les petites régies d’une conciergerie se perdent facilement. Comment les noter, les prouver et les facturer chaque mois à la gérance.',
  excerpt:
    'Une intervention de vingt minutes ne paraît pas valoir une facture. Additionnées sur un mois et plusieurs immeubles, elles représentent pourtant une part réelle du chiffre d’affaires.',
  category: 'Services & autres métiers',
  keywords: ['facturer régie conciergerie', 'conciergerie gérance facture', 'facility management Suisse', 'bon d’intervention', 'travaux en régie immeuble'],
  publishedAt: '2026-10-09',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Le contrat d’entretien couvre le travail courant. Tout le reste (une serrure qui coince, un écoulement bouché, une ampoule dans les communs) est souvent fait « en passant » et jamais facturé. Le problème n’est pas l’intervention, c’est la trace.',
    },
    { type: 'h2', text: 'Ce que le contrat doit prévoir' },
    {
      type: 'list',
      items: [
        'La liste des tâches comprises dans le forfait',
        'Le tarif horaire des interventions hors forfait, avec un minimum facturé',
        'Le prix ou la règle pour le petit matériel fourni',
        'Le seuil au-delà duquel l’accord préalable de la gérance est nécessaire',
      ],
    },
    { type: 'h2', text: 'Noter l’intervention sur place' },
    {
      type: 'p',
      text: 'Une intervention notée le soir est souvent incomplète, une intervention notée le lendemain est souvent oubliée. Sur place : l’immeuble, ce qui a été fait, le temps, le matériel et une photo avant/après. C’est ce qui permet à la gérance de répercuter le coût au bon propriétaire ou locataire.',
    },
    {
      type: 'callout',
      title: 'La photo vaut mieux qu’un long texte',
      text: 'Une photo datée de la conduite bouchée puis dégagée répond d’avance à la question « qu’est-ce qui a été fait ? ».',
    },
    { type: 'h2', text: 'Une facture par mois et par gérance' },
    {
      type: 'p',
      text: 'Regroupez les interventions du mois sur une facture par gérance, avec une ligne par intervention : date, immeuble, description, temps et matériel. La gérance peut ainsi ventiler les frais sans vous rappeler. Ajoutez le bulletin QR et une échéance claire.',
    },
    {
      type: 'table',
      headers: ['Date', 'Immeuble', 'Intervention', 'Temps'],
      rows: [
        ['03.10', 'Rue du Lac 12', 'Débouchage écoulement buanderie', '0,75 h'],
        ['11.10', 'Av. de la Gare 4', 'Remplacement de 3 ampoules, communs', '0,25 h'],
        ['18.10', 'Rue du Lac 12', 'Réglage ferme-porte entrée', '0,5 h'],
      ],
    },
    {
      type: 'cta',
      title: 'Chaque intervention notée, chaque régie facturée',
      text: 'Avec Cantia, l’intervention est enregistrée sur l’immeuble avec photos et heures, et se retrouve dans la facture du mois. Essai gratuit de 14 jours.',
      buttonLabel: 'Essayer 14 jours',
    },
  ],
  faq: [
    {
      question: 'Faut-il l’accord de la gérance avant chaque intervention ?',
      answer: 'Cela dépend du contrat. Il est courant de fixer un montant en dessous duquel vous intervenez directement, et au-dessus duquel un accord écrit est demandé.',
    },
    {
      question: 'Peut-on facturer un minimum par intervention ?',
      answer: 'Oui, si le contrat ou votre liste de prix le prévoit, par exemple un quart d’heure ou une demi-heure minimum.',
    },
    {
      question: 'Comment prouver une intervention contestée ?',
      answer: 'Avec la date, l’heure, la description et des photos prises sur place, idéalement enregistrées au moment de l’intervention.',
    },
  ],
  relatedSlugs: ['prix-contrat-nettoyage-bureaux-suisse-calcul', 'facturation-heures-regie-batiment-comment-faire', 'photos-chantier-preuve-juridique-litige'],
  relatedTradeSlug: 'conciergerie',
};
