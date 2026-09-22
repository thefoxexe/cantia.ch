import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'renovation-apres-sinistre-degat-eau-assurance',
  question: 'Comment travailler avec l’assurance du client pour une rénovation après sinistre (dégât d’eau, incendie) ?',
  title: 'Rénovation après sinistre : travailler avec l’assurance du client',
  description:
    'Expertise préalable, documentation des dommages, délai de paiement : comment gérer un chantier de rénovation après dégât d’eau ou incendie quand l’assurance du client est impliquée.',
  excerpt:
    'Un chantier après sinistre n’a pas qu’un client : il a aussi une assurance à convaincre. Voici comment sécuriser le devis, la documentation et le paiement dans ce contexte particulier.',
  category: 'Chantier & rentabilité',
  keywords: ['rénovation après sinistre suisse', 'devis assurance dégât eau', 'travaux assurance incendie facturation'],
  publishedAt: '2026-10-11',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Un chantier de rénovation après dégât d’eau ou incendie se distingue d’une rénovation classique sur un point essentiel : le devis n’est généralement pas validé par le seul client, mais aussi, directement ou indirectement, par son assurance. Cette dimension change la façon de documenter, de chiffrer et de facturer les travaux.',
    },
    { type: 'h2', text: 'Un devis souvent soumis à validation ou expertise' },
    {
      type: 'p',
      text: 'Selon l’ampleur du sinistre, l’assurance du client mandate souvent un expert pour évaluer les dommages avant que les travaux ne débutent, ou pour valider le devis de l’entreprise avant remboursement. Il est utile de demander d’emblée au client si un expert est déjà intervenu ou va intervenir, pour éviter de commencer des travaux qui ne seraient ensuite pas couverts.',
    },
    { type: 'h2', text: 'Une documentation qui protège tout le monde' },
    {
      type: 'list',
      items: [
        'Photos datées de l’état des lieux avant travaux, y compris des zones qui ne seront pas touchées mais pourraient être questionnées plus tard',
        'Description précise et écrite des dommages constatés, pas seulement une estimation globale',
        'Conservation du rapport d’expert, s’il existe, en annexe du dossier de chantier',
        'Devis détaillé poste par poste : les assurances acceptent plus difficilement un forfait global non justifié',
      ],
    },
    { type: 'h2', text: 'Un délai de paiement souvent plus long' },
    {
      type: 'p',
      text: 'Le remboursement par une assurance prend généralement plus de temps qu’un paiement client classique. Il est essentiel de clarifier dès le devis qui avance les fonds : le client peut payer l’entreprise puis se faire rembourser par son assurance, ou dans certains cas l’assurance règle directement l’entreprise sur présentation de la facture. Cette question doit être tranchée avant le début des travaux, pas après.',
    },
    {
      type: 'callout',
      title: 'Ne jamais démarrer un chantier important sans savoir qui paie et quand',
      text: 'Un chantier après sinistre peut représenter un montant conséquent. Attendre la fin des travaux pour découvrir que le remboursement de l’assurance prendra plusieurs mois peut mettre sous tension la trésorerie de l’entreprise si aucun acompte n’a été prévu.',
    },
    {
      type: 'cta',
      title: 'Un devis détaillé, prêt pour une assurance',
      text: 'Cantia permet d’établir un devis poste par poste, avec photos et documents joints, pour un dossier complet à présenter à l’assurance du client.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Faut-il attendre l’accord de l’assurance avant de commencer les travaux ?',
      answer:
        'Cela dépend de l’urgence et de l’ampleur du sinistre. Pour des mesures conservatoires urgentes, il est souvent possible d’intervenir immédiatement, mais pour des travaux de rénovation complets, mieux vaut généralement attendre la validation de l’assurance ou de son expert pour éviter un refus de remboursement.',
    },
    {
      question: 'Qui paie l’entreprise : le client ou directement l’assurance ?',
      answer:
        'Les deux cas existent. Certaines assurances remboursent le client après paiement de la facture, d’autres acceptent de régler directement l’entreprise sur présentation des documents. Ce point doit être clarifié avec le client avant le début du chantier.',
    },
    {
      question: 'Que faire si l’assurance conteste une partie du devis ?',
      answer:
        'Une documentation précise, avec photos datées et description détaillée des dommages, facilite grandement la discussion. En cas de désaccord persistant, le client peut généralement faire appel à un contre-expert, mais cela allonge encore le délai de règlement.',
    },
  ],
  relatedSlugs: [
    'assurance-chantier-tous-risques-ectr-obligatoire',
    'devis-facture-entreprise-renovation-suisse',
    'previsionnel-tresorerie-entreprise-batiment',
    'reception-travaux-proces-verbal-chantier',
  ],
};
