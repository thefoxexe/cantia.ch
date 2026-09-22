import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'chantier-copropriete-ppe-facturation-suisse',
  question: 'Comment facturer un chantier en copropriété (PPE) avec plusieurs propriétaires ?',
  title: 'Chantier en copropriété (PPE) : comment facturer plusieurs propriétaires',
  description:
    'Assemblée de copropriétaires, administrateur PPE, répartition des quotes-parts : comment devis et facturation fonctionnent sur un chantier en propriété par étages en Suisse.',
  excerpt:
    'Un chantier en PPE n’a pas un client unique mais une communauté de propriétaires. Voici comment cela change la façon de faire valider un devis et d’organiser la facturation.',
  category: 'Chantier & rentabilité',
  keywords: ['chantier PPE facturation', 'devis copropriété suisse', 'administrateur PPE travaux'],
  publishedAt: '2026-10-11',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Un chantier en propriété par étages (PPE) ne fonctionne pas comme un chantier chez un client individuel. Le devis n’est généralement pas validé par une seule personne, mais par une assemblée de copropriétaires, et c’est souvent l’administrateur de la PPE qui sert d’interlocuteur à l’entreprise du début à la fin.',
    },
    { type: 'h2', text: 'Qui valide le devis, et qui le signe' },
    {
      type: 'p',
      text: 'Pour des travaux touchant les parties communes (toiture, façade, cage d’escalier, ascenseur), le devis doit généralement être approuvé par l’assemblée générale des copropriétaires, souvent à une majorité définie par le règlement de PPE. En pratique, c’est l’administrateur qui mandate l’entreprise et signe le devis au nom de la communauté, une fois l’accord de l’assemblée obtenu.',
    },
    { type: 'h2', text: 'Une prise de décision généralement plus lente' },
    {
      type: 'p',
      text: 'Contrairement à un client individuel qui peut valider un devis en quelques jours, une assemblée de copropriétaires doit être convoquée, ce qui prend souvent plusieurs semaines selon le règlement de la PPE et la disponibilité des propriétaires. Il vaut mieux intégrer ce délai dans la planification communiquée au client dès le premier contact, pour éviter les malentendus sur la date de démarrage.',
    },
    { type: 'h2', text: 'Comment sécuriser le paiement' },
    {
      type: 'list',
      items: [
        'Facturer à l’administration de la PPE, pas directement à chaque copropriétaire, sauf accord explicite contraire',
        'Faire figurer sur le devis le nom de la PPE et le numéro de parcelle ou de référence, pas seulement le nom d’un propriétaire',
        'Demander un acompte au démarrage, comme pour tout chantier, une fois le devis validé par l’assemblée',
        'Clarifier par écrit qui gère la répartition des coûts entre copropriétaires : cette répartition selon les quotes-parts reste une affaire interne à la PPE, pas à l’entreprise',
      ],
    },
    {
      type: 'callout',
      title: 'L’administrateur PPE est votre interlocuteur, pas votre garant',
      text: 'L’administrateur signe et mandate au nom de la communauté, mais la responsabilité du paiement reste celle de la PPE dans son ensemble. En cas de doute sur la solvabilité ou l’organisation d’une PPE, mieux vaut poser la question avant de démarrer les travaux plutôt qu’après.',
    },
    {
      type: 'cta',
      title: 'Un devis clair, même avec un client collectif',
      text: 'Cantia permet d’établir un devis au nom d’une PPE ou d’une administration, avec un suivi de facturation centralisé sur un seul dossier.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Faut-il un devis signé par chaque copropriétaire individuellement ?',
      answer:
        'Non, généralement pas. C’est l’administrateur de la PPE qui signe au nom de la communauté, une fois le devis approuvé par l’assemblée générale des copropriétaires selon la majorité prévue par le règlement.',
    },
    {
      question: 'Que faire si un copropriétaire refuse de payer sa quote-part ?',
      answer:
        'Cette question relève généralement de la gestion interne de la PPE, pas de la relation entre l’entreprise et la copropriété. L’entreprise facture l’administration de la PPE, qui reste responsable du recouvrement auprès des copropriétaires selon les règles internes.',
    },
    {
      question: 'Combien de temps faut-il prévoir avant qu’un devis soit validé en PPE ?',
      answer:
        'Cela dépend du règlement de chaque PPE et de la fréquence des assemblées, mais il vaut mieux prévoir plusieurs semaines, voire plus si une assemblée extraordinaire doit être convoquée spécifiquement pour ces travaux.',
    },
  ],
  relatedSlugs: [
    'contrat-entreprise-vs-mandat-artisan',
    'sous-traitant-batiment-suisse-contrat-facturation',
    'reception-travaux-proces-verbal-chantier',
  ],
};
