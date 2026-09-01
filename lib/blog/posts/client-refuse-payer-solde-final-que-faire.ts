import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'client-refuse-payer-solde-final-que-faire',
  question: 'Un client refuse de payer le solde final du chantier : que faire ?',
  title: 'Un client refuse de payer le solde final : la méthode, étape par étape',
  description:
    'Un refus de paiement sur le solde final n’est presque jamais définitif. C’est souvent un désaccord sur un point précis. Distinguer les deux change toute la stratégie à suivre.',
  excerpt:
    'Un client qui « refuse de payer » a presque toujours une raison précise en tête — un défaut, un désaccord de prix, un doute. Identifier laquelle change tout le reste.',
  category: 'Devis & facturation',
  keywords: ['solde impayé', 'refus de paiement', 'litige chantier', 'poursuite suisse', 'retenue de garantie'],
  publishedAt: '2026-04-23',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Le chantier est fini, la facture finale envoyée — et le client ne paie pas. Avant toute démarche de recouvrement, une question précède toutes les autres : pourquoi ? Un refus de paiement n’a presque jamais une seule cause, et la stratégie à suivre change complètement selon la réponse.',
    },
    { type: 'h2', text: 'Distinguer trois situations très différentes' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Le client conteste un défaut précis dans les travaux — le paiement est lié à une réclamation légitime ou non sur la qualité du résultat',
        'Le client conteste le montant lui-même (avenant non validé, dépassement non expliqué) — le désaccord porte sur le prix, pas sur le travail',
        'Le client n’a tout simplement pas la trésorerie pour payer, ou fait traîner sans justification claire — un problème de volonté ou de capacité, pas de fond',
      ],
    },
    {
      type: 'callout',
      title: 'Le réflexe qui évite d’aggraver la situation',
      text: 'Si le client invoque un défaut, une retenue de garantie proportionnée à ce défaut précis (pas au solde entier) est une réaction plus solide juridiquement qu’un refus de paiement total — et c’est ce qu’un juge attendra de voir documenté si le litige s’envenime. À l’inverse, retenir 100 % du solde pour un défaut mineur affaiblit la position du client, pas la vôtre.',
    },
    { type: 'h2', text: 'La marche à suivre concrète' },
    {
      type: 'list',
      items: [
        'Demander par écrit la raison précise du non-paiement — une réponse vague ou une absence de réponse en dit déjà long',
        'Si un défaut est invoqué, proposer une visite de contrôle rapide plutôt que de laisser le désaccord s’envenimer par échange d’emails',
        'Documenter chaque échange par écrit à partir de ce moment — c’est ce qui constituera la base d’un dossier si le litige va plus loin',
        'Envoyer une mise en demeure formelle si aucune réponse constructive n’arrive dans un délai raisonnable',
        'En dernier recours, une procédure de poursuite (réquisition de poursuite auprès de l’office des poursuites du domicile du débiteur) reste l’outil légal pour faire valoir la créance',
      ],
    },
    { type: 'h2', text: 'Ce qui protège le mieux, en amont' },
    {
      type: 'p',
      text: 'La meilleure défense contre ce type de blocage se construit avant qu’il n’arrive : un procès-verbal de réception signé, des photos datées de l’état final des travaux, et un devis suffisamment détaillé pour qu’aucun poste ne puisse être contesté faute de clarté. Un dossier solide raccourcit presque toujours la durée d’un litige, même quand il ne l’empêche pas complètement.',
    },
    {
      type: 'cta',
      title: 'Chaque échange, chaque photo, au même endroit',
      text: 'Cantia centralise devis, factures, rapports de chantier et échanges par projet — le dossier existe déjà le jour où un litige survient, sans reconstitution de dernière minute.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Un client peut-il retenir tout le solde pour un défaut mineur ?',
      answer:
        'Juridiquement, une retenue doit rester proportionnée au défaut réel — retenir l’intégralité du solde pour un problème mineur affaiblit la position du client plutôt que celle de l’entreprise.',
    },
    {
      question: 'Quelle est la première étape face à un refus de paiement du solde final ?',
      answer:
        'Demander par écrit la raison précise du refus — la réponse détermine si le litige porte sur un défaut, sur le montant, ou sur une simple difficulté de trésorerie du client.',
    },
    {
      question: 'À quel moment envisager une procédure de poursuite ?',
      answer:
        'En dernier recours, après une mise en demeure formelle restée sans réponse constructive — la réquisition de poursuite se dépose auprès de l’office des poursuites du domicile du débiteur.',
    },
  ],
  relatedSlugs: [
    'relancer-client-facture-impayee-sans-perdre-client',
    'defaut-construction-decouvert-apres-reception-qui-paie',
    'facturer-acompte-suisse-securiser-solde',
  ],
};
