import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'checklist-cloture-chantier-avant-facturation',
  question: 'Que vérifier avant de clôturer un chantier et d’envoyer la facture finale ?',
  title: 'Checklist de fin de chantier : ce qu’il faut vérifier avant d’envoyer la facture finale',
  description:
    'Une facture finale envoyée trop vite, sans réception documentée ni vérification du chiffrage, ouvre la porte à des contestations évitables. Voici les points à cocher avant de clôturer.',
  excerpt:
    'La facture finale n’est pas juste le dernier document du chantier — c’est celui qui fige la relation client. Mieux vaut la préparer avec méthode que de devoir la corriger après coup.',
  category: 'Chantier & rentabilité',
  keywords: ['checklist fin de chantier', 'clôturer un chantier', 'facture finale travaux', 'vérification avant facturation', 'fin de travaux bâtiment'],
  publishedAt: '2026-06-10',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'La facture finale d’un chantier n’est pas juste le dernier document administratif — c’est celui qui fige la relation avec le client, déclenche la garantie, et souvent conclut le dossier. L’envoyer sans une vérification structurée ouvre la porte à des erreurs évitables : travaux supplémentaires oubliés, acompte mal déduit, réception non documentée.',
    },
    { type: 'h2', text: 'Avant d’envoyer la facture finale' },
    {
      type: 'list',
      items: [
        'Réception des travaux effectuée et documentée (procès-verbal ou rapport photo daté)',
        'Tous les travaux supplémentaires acceptés en cours de chantier bien intégrés au décompte final',
        'Acomptes déjà versés correctement déduits du montant final',
        'Défauts éventuels constatés à la réception notés et, si nécessaire, traités avant la facturation du solde',
        'Montant, TVA et mentions QR-facture vérifiés une dernière fois avant envoi',
      ],
    },
    { type: 'h2', text: 'Après l’envoi' },
    {
      type: 'list',
      items: [
        'Un rappel de garantie envoyé au client, avec la date de début et de fin de la période applicable',
        'Le dossier chantier archivé complet (devis, factures, photos, échanges) pour référence future',
        'Une éventuelle retenue de garantie notée avec sa date de libération prévue',
      ],
    },
    {
      type: 'callout',
      title: 'Une facture finale envoyée trop vite coûte souvent plus cher qu’un jour de retard',
      text: 'Un oubli de travaux supplémentaires ou un acompte mal déduit se traduit directement en argent perdu — quelques minutes de vérification structurée évitent presque toujours cette perte.',
    },
    {
      type: 'cta',
      title: 'Un dossier de chantier complet, prêt pour la facture finale',
      text: 'Cantia relie devis, acomptes, travaux supplémentaires et photos au même chantier — la facture finale se prépare sans reconstituer l’historique à la main.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Pourquoi documenter la réception avant d’envoyer la facture finale ?',
      answer:
        'Parce qu’elle déclenche le délai de garantie et fige les défauts constatés — sans document daté, ce moment devient impossible à prouver en cas de litige ultérieur.',
    },
    {
      question: 'Que risque-t-on à oublier des travaux supplémentaires dans le décompte final ?',
      answer:
        'Une perte financière directe si le décompte ne les inclut pas, et une difficulté à les réclamer après coup une fois la facture finale envoyée et acceptée.',
    },
    {
      question: 'Faut-il archiver le dossier chantier après la facturation finale ?',
      answer:
        'Oui, un dossier complet (devis, factures, photos, échanges) reste utile pendant toute la période de garantie et au-delà, en cas de litige ou de question ultérieure du client.',
    },
  ],
  relatedSlugs: [
    'checklist-ouverture-chantier-artisan',
    'reception-travaux-proces-verbal-chantier',
    'avenant-chantier-plus-value-moins-value',
  ],
};
