import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'relancer-client-facture-impayee-sans-perdre-client',
  question: 'Comment relancer un client qui ne paie pas sa facture sans le braquer ?',
  title: 'Relancer un client qui ne paie pas, sans perdre le client',
  description:
    'La plupart des retards de paiement ne sont pas de la mauvaise foi. Une méthode de relance en trois temps qui récupère l’argent sans casser la relation.',
  excerpt:
    'La majorité des factures en retard ne le sont pas par mauvaise foi — elles sont juste tombées dans une pile. La relance efficace commence par supposer ça, pas l’inverse.',
  category: 'Devis & facturation',
  keywords: ['relance facture', 'impayé', 'recouvrement', 'client qui ne paie pas', 'mise en demeure'],
  publishedAt: '2026-02-26',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Une facture en retard de dix jours n’est presque jamais un signal d’impayé — c’est un signal qu’elle est tombée dans une pile de courrier, un email noyé, ou un virement mis en attente puis oublié. Traiter chaque retard comme une confrontation dès le premier jour abîme des relations qui n’avaient rien de conflictuel.',
    },
    { type: 'h2', text: 'Trois temps, pas un seul ton' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Rappel neutre, dès le lendemain de l’échéance : « Petit rappel, la facture n°XXX arrive à échéance, avez-vous pu la traiter ? » — aucune accusation, juste un signal',
        'Relance ferme, une semaine après : rappel de l’échéance dépassée, mention explicite de l’intérêt moratoire applicable (5 % l’an selon l’art. 104 CO), demande d’un délai de paiement précis',
        'Mise en demeure formelle, écrite, avec un dernier délai clair — l’étape qui prépare, si nécessaire, une procédure de poursuite',
      ],
    },
    {
      type: 'callout',
      title: 'Le détail qui change tout : ne jamais relancer un client qui a déjà payé',
      text: 'Rien n’abîme plus une relation qu’une relance envoyée à un client qui a payé trois jours plus tôt. C’est le meilleur moyen de transformer un simple oubli en vraie tension — et c’est évitable dès lors que chaque paiement reçu se rapproche automatiquement à sa facture via la référence QR, sans dépendre d’une vérification manuelle du relevé bancaire.',
    },
    { type: 'h2', text: 'Ce qui fonctionne mieux qu’un ton dur' },
    {
      type: 'p',
      text: 'Proposer un plan de paiement en plusieurs fois débloque souvent des situations qu’une relance sèche enlise. Un client en vraie difficulté de trésorerie qui se sent écouté paie généralement plus vite qu’un client mis en accusation — la relance n’a pas vocation à établir qui a raison, elle a vocation à faire rentrer l’argent le plus vite possible sans perdre le client pour le prochain chantier.',
    },
    {
      type: 'p',
      text: 'Et pour les cas qui dépassent la simple relance — un client durablement injoignable, un montant important, un refus de payer explicite — la question change de nature : c’est là qu’il faut évaluer sérieusement une procédure de poursuite, avec ses propres coûts et délais à connaître avant de s’y engager.',
    },
    {
      type: 'cta',
      title: 'Savoir qui doit quoi, sans chercher',
      text: 'Le dashboard de facturation de Cantia affiche en un coup d’œil les factures en attente, échues ou en retard — et rapproche chaque paiement reçu par référence QR, sans relance envoyée par erreur.',
      buttonLabel: 'Voir le module Facturation',
    },
  ],
  faq: [
    {
      question: 'Combien de temps attendre avant de relancer une facture impayée ?',
      answer:
        'Un premier rappel neutre dès le lendemain de l’échéance dépassée est raisonnable — il n’a pas besoin d’être formel, juste présent, avant une relance plus ferme une semaine après si rien ne bouge.',
    },
    {
      question: 'Faut-il mentionner l’intérêt moratoire dès la première relance ?',
      answer:
        'Mieux vaut le garder pour la relance ferme (deuxième étape) — le mentionner dès le premier rappel neutre peut donner un ton accusateur inutile pour un simple oubli.',
    },
    {
      question: 'Un plan de paiement en plusieurs fois affaiblit-il la position de l’entreprise ?',
      answer:
        'Non, à condition qu’il soit formalisé par écrit avec des dates précises — il débloque souvent une situation plus vite qu’une relance sèche, sans renoncer au droit de réclamer le solde en cas de non-respect.',
    },
  ],
  relatedSlugs: [
    'delai-paiement-facture-artisan-code-obligations',
    'facturer-acompte-suisse-securiser-solde',
    'qr-facture-obligatoire-2026',
  ],
};
