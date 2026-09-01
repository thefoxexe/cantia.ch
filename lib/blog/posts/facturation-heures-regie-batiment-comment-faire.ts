import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'facturation-heures-regie-batiment-comment-faire',
  question: 'Comment facturer correctement des travaux en régie (au temps passé) dans le bâtiment ?',
  title: 'Facturer en régie dans le bâtiment : ce qu’il faut sur la facture pour ne pas être contesté',
  description:
    'Un travail facturé au temps passé plutôt qu’à prix fixe expose davantage à la contestation client, à moins que le détail des heures, des personnes et des tâches soit réellement traçable.',
  excerpt:
    'Sans devis à prix fixe pour s’appuyer dessus, une facture en régie repose entièrement sur la confiance du client dans le nombre d’heures annoncé. Cette confiance se construit avec du détail, pas avec un total rond.',
  category: 'Devis & facturation',
  keywords: ['facturation régie bâtiment', 'facture heures travaillées', 'travaux au temps passé', 'contestation facture régie', 'suivi heures chantier'],
  publishedAt: '2026-07-07',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'La facturation en régie, c’est-à-dire au temps réellement passé plutôt qu’à un prix fixe convenu à l’avance, est courante pour des travaux difficiles à chiffrer d’avance : dépannage, imprévu découvert en cours de chantier, petite intervention. Le problème n’est jamais le principe, c’est la preuve : sans détail suffisant, un client peut contester le nombre d’heures facturées sans qu’il y ait de base objective pour trancher.',
    },
    { type: 'h2', text: 'Ce qu’une facture en régie doit détailler' },
    {
      type: 'list',
      items: [
        'La date de chaque intervention, pas seulement une plage globale',
        'Le nombre d’heures par personne, pas un total agrégé sans détail',
        'La nature précise du travail effectué chaque jour, pas une description générique répétée',
        'Le taux horaire appliqué, cohérent avec ce qui a été communiqué au client avant le début des travaux',
      ],
    },
    {
      type: 'callout',
      title: 'Prévenir le client du principe de la régie avant de commencer reste la meilleure protection',
      text: 'Même sans devis à prix fixe, un accord écrit préalable sur le taux horaire et le principe de facturation au temps passé évite l’essentiel des contestations. Le flou vient presque toujours d’un silence initial, pas d’un désaccord réel sur le tarif.',
    },
    { type: 'h2', text: 'Le suivi d’heures est votre meilleure preuve' },
    {
      type: 'p',
      text: 'Un relevé d’heures horodaté, saisi au fur et à mesure plutôt que reconstitué de mémoire en fin de mois, transforme une facture en régie contestable en un document difficile à remettre en cause. C’est aussi ce qui protège l’entreprise si un client demande, des semaines plus tard, de justifier une facture déjà envoyée.',
    },
    {
      type: 'cta',
      title: 'Des heures suivies, facturées sans perte de détail',
      text: 'Le module Heures & Salaires de Cantia relie le suivi d’heures par chantier directement à la facturation, si bien que le détail par jour et par personne reste toujours disponible en cas de question du client.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Une facture en régie doit-elle détailler les heures jour par jour ?',
      answer:
        'Oui, c’est fortement recommandé, car un total global sans détail par date et par personne est bien plus facilement contestable qu’un relevé précis.',
    },
    {
      question: 'Faut-il un accord écrit avant de facturer des travaux en régie ?',
      answer:
        'Ce n’est pas une obligation légale stricte, mais informer le client du principe et du taux horaire avant de commencer évite l’essentiel des litiges ultérieurs.',
    },
    {
      question: 'Comment se protéger si un client conteste le nombre d’heures facturées ?',
      answer:
        'En s’appuyant sur un relevé d’heures horodaté et détaillé par tâche, saisi au fur et à mesure plutôt que reconstitué après coup de mémoire.',
    },
  ],
  relatedSlugs: [
    'calculer-heures-travail-ouvrier-minutes-decimales',
    'calculer-prix-horaire-reel-ouvrier-batiment',
    'relancer-client-facture-impayee-sans-perdre-client',
  ],
};
