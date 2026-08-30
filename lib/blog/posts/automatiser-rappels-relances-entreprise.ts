import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'automatiser-rappels-relances-entreprise',
  question: 'Comment automatiser l\'envoi de rappels et de relances pour son entreprise du bâtiment ?',
  title: 'Automatiser ses relances : ne plus jamais oublier un impayé',
  description:
    'Relancer un client pour une facture impayée ou un devis en attente est souvent la première tâche administrative oubliée. Comment l\'automatiser sans perdre le ton personnel.',
  excerpt:
    'La relance client est souvent la tâche administrative la plus facile à oublier — pas par négligence, mais parce qu\'elle n\'a jamais de date fixe dans l\'agenda, contrairement à un rendez-vous chantier.',
  category: 'Sur-mesure & automatisations',
  keywords: ['automatiser relances entreprise', 'rappel facture impayée automatique', 'relance devis automatique', 'automatisation paiement client bâtiment', 'ne plus oublier relance client'],
  publishedAt: '2026-08-21',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Contrairement à un rendez-vous de chantier, une relance de facture impayée n\'a pas de date fixée dans l\'agenda — elle dépend d\'un délai écoulé, facile à perdre de vue au milieu du reste de l\'activité. Résultat : des impayés qui traînent, non pas par mauvaise volonté, mais par oubli pur et simple.',
    },
    { type: 'h2', text: 'Ce qu\'une relance automatisée permet concrètement' },
    {
      type: 'list',
      items: [
        'Un rappel envoyé automatiquement X jours après l\'échéance d\'une facture, sans avoir à y penser',
        'Un ton différent selon le nombre de relances déjà envoyées (courtois d\'abord, plus ferme ensuite)',
        'Une alerte interne visible pour l\'entreprise, même si la relance elle-même part automatiquement',
        'La possibilité de suspendre une relance automatique en cas d\'accord particulier avec le client',
      ],
    },
    {
      type: 'stat',
      value: '15-20 %',
      label: 'part des factures en retard généralement réglées dans les jours qui suivent une relance automatique bien calibrée, sans intervention manuelle',
    },
    { type: 'h2', text: 'Automatiser ne veut pas dire perdre le contrôle de la relation client' },
    {
      type: 'p',
      text: 'Une bonne relance automatisée reste toujours modifiable au cas par cas — pour un client fidèle qui a simplement un jour de retard, l\'entreprise garde la main pour ajuster le ton ou repousser l\'envoi, plutôt que de subir une automatisation rigide.',
    },
    {
      type: 'callout',
      title: 'La régularité compte plus que l\'agressivité du ton',
      text: 'Une relance automatique envoyée systématiquement au bon moment est souvent plus efficace qu\'une relance ponctuelle très insistante mais envoyée bien après le délai.',
    },
    {
      type: 'cta',
      title: 'Des relances qui partent toutes seules, au bon moment',
      text: 'Cantia peut automatiser vos relances de factures impayées, avec la possibilité d\'ajuster le ton ou de les suspendre au cas par cas.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Pourquoi les relances de factures impayées sont-elles souvent oubliées ?',
      answer:
        'Parce qu\'elles n\'ont pas de date fixe dans l\'agenda, contrairement à un rendez-vous de chantier — elles dépendent d\'un délai écoulé, plus facile à perdre de vue.',
    },
    {
      question: 'Une relance automatique remplace-t-elle totalement le suivi manuel ?',
      answer:
        'Non — une bonne relance automatisée reste modifiable au cas par cas, notamment pour un client fidèle avec qui un ajustement de ton ou de délai est justifié.',
    },
    {
      question: 'Quel est l\'impact concret d\'une relance automatique bien calibrée ?',
      answer:
        'Généralement 15 à 20 % des factures en retard sont réglées dans les jours suivant une relance automatique envoyée au bon moment, sans intervention manuelle.',
    },
  ],
  relatedSlugs: [
    'relancer-client-facture-impayee-sans-perdre-client',
    'automatiser-taches-repetitives-entreprise-sans-developpeur',
    'poursuite-facture-impayee-procedure-suisse',
  ],
};
