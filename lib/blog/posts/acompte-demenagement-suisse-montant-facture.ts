import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'acompte-demenagement-suisse-montant-facture',
  question: 'Quel acompte demander pour un déménagement et comment le facturer ?',
  title: 'Acompte de déménagement : combien demander et comment le facturer',
  description:
    'Aucun taux légal n’impose un montant d’acompte pour un déménagement. Comment le fixer, le facturer, le déduire du solde et prévoir l’annulation dans l’offre.',
  excerpt:
    'Un camion et une équipe réservés pour un samedi de fin de mois valent cher. L’acompte protège cette date, à condition d’être prévu clairement dans l’offre.',
  category: 'Services & autres métiers',
  keywords: ['acompte déménagement', 'facture acompte Suisse', 'annulation déménagement frais', 'offre déménageur', 'déménagement devis'],
  publishedAt: '2026-10-09',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Les fins de mois sont pleines, et une annulation la veille laisse une équipe et un véhicule sans travail. L’acompte n’est pas une formalité : c’est ce qui engage le client.',
    },
    { type: 'h2', text: 'Combien demander ?' },
    {
      type: 'p',
      text: 'Il n’existe pas de taux légal. Le montant est libre et doit figurer dans l’offre acceptée. Il couvre au moins ce que vous perdez si le client annule tard : la journée bloquée, le matériel commandé, une éventuelle location.',
    },
    { type: 'h2', text: 'Prévoir l’annulation par écrit' },
    {
      type: 'list',
      items: [
        'Jusqu’à quelle date le client peut annuler sans frais',
        'Ce qui est retenu en cas d’annulation tardive',
        'Ce qui se passe si la date est déplacée',
      ],
    },
    {
      type: 'callout',
      title: 'Acompte ou arrhes',
      text: 'Un acompte est imputé sur le prix ; les arrhes et le dédit obéissent à des règles propres (art. 158 CO). Pour éviter toute discussion, écrivez dans l’offre ce que devient le montant versé en cas d’annulation.',
    },
    { type: 'h2', text: 'Facturer l’acompte, puis le solde' },
    {
      type: 'p',
      text: 'Émettez une facture d’acompte dès l’acceptation de l’offre, avec le bulletin QR. Si vous êtes assujetti à la TVA, l’acompte encaissé est soumis à la TVA comme le reste du prix. La facture finale reprend le prix total, les éventuels suppléments, puis déduit l’acompte déjà payé.',
    },
    { type: 'h2', text: 'Les heures en plus et l’état des biens' },
    {
      type: 'p',
      text: 'Un accès plus difficile que prévu ou un ascenseur en panne : faites accepter le supplément sur place. Et photographiez les objets fragiles au chargement : en cas de dommage, la responsabilité du transporteur est régie par le Code des obligations (art. 440 ss CO), et la photo montre l’état de départ.',
    },
    {
      type: 'cta',
      title: 'Acompte, solde et suppléments, sans papier',
      text: 'Cantia émet la facture d’acompte à la signature, déduit l’acompte du solde et garde les photos du déménagement. Essai gratuit de 14 jours.',
      buttonLabel: 'Essayer 14 jours',
    },
  ],
  faq: [
    {
      question: 'Existe-t-il un pourcentage légal d’acompte ?',
      answer: 'Non. Le montant est convenu librement entre vous et le client, de préférence dans l’offre signée.',
    },
    {
      question: 'L’acompte est-il soumis à la TVA ?',
      answer: 'Oui, pour une entreprise assujettie, la TVA est due sur les acomptes encaissés comme sur le solde.',
    },
    {
      question: 'Le client peut-il récupérer son acompte s’il annule ?',
      answer: 'Cela dépend de ce qui a été convenu. Prévoyez dans l’offre les délais et les montants retenus en cas d’annulation.',
    },
  ],
  relatedSlugs: ['facturer-acompte-suisse-securiser-solde', 'photos-chantier-preuve-juridique-litige', 'mentions-obligatoires-facture-suisse-tva'],
  relatedTradeSlug: 'demenageur',
};
