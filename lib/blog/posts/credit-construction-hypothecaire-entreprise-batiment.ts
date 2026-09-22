import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'credit-construction-hypothecaire-entreprise-batiment',
  question: 'Qu’est-ce qu’un crédit de construction et pourquoi un entrepreneur du bâtiment doit le comprendre ?',
  title: 'Le crédit de construction : ce qu’un entrepreneur doit comprendre',
  description:
    'Comment fonctionne un crédit de construction, pourquoi il influence directement le rythme de paiement d’un client, et comment adapter son calendrier de facturation par situations.',
  excerpt:
    'Le client paie en retard, encore. Avant d’y voir un problème de mauvaise volonté, il vaut la peine de comprendre comment son propre financement fonctionne.',
  category: 'Chantier & rentabilité',
  keywords: [
    'credit de construction batiment',
    'financement chantier maitre ouvrage',
    'facturation par situations credit construction',
  ],
  publishedAt: '2026-10-06',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Beaucoup d’entrepreneurs traitent le rythme de paiement de leurs clients comme un simple problème de discipline administrative. Sur les chantiers de construction ou de rénovation lourde, c’est souvent autre chose : le client, ou maître d’ouvrage, ne débourse pas son propre argent au fur et à mesure, il débloque un crédit de construction, tranche par tranche. Comprendre ce mécanisme change la façon de négocier ses paiements.',
    },
    { type: 'h2', text: 'Comment fonctionne un crédit de construction' },
    {
      type: 'p',
      text: 'Un crédit de construction est un financement à court terme, généralement contracté par le maître d’ouvrage auprès de sa banque, pour couvrir les coûts de construction avant que le bien ne soit terminé et, le cas échéant, transformé en crédit hypothécaire classique. Contrairement à un prêt classique versé en une fois, il est débloqué par tranches, au fur et à mesure de l’avancement réel du chantier, généralement après vérification de ce que les travaux réalisés justifient bien le montant demandé.',
    },
    { type: 'h2', text: 'Pourquoi un entrepreneur a intérêt à comprendre ce mécanisme' },
    {
      type: 'list',
      items: [
        'Le client ne peut souvent pas payer une facture avant que la banque n’ait débloqué la tranche correspondante.',
        'La banque exige en général des justificatifs d’avancement avant de libérer chaque tranche, ce qui peut ajouter un délai administratif.',
        'Un décalage entre le rythme de facturation de l’entreprise et le rythme de déblocage des tranches crée mécaniquement un problème de trésorerie, même chez un client solvable et de bonne foi.',
      ],
    },
    { type: 'h2', text: 'Adapter son calendrier de facturation par situations' },
    {
      type: 'p',
      text: 'La facturation par situations, c’est-à-dire par étapes d’avancement plutôt qu’en une seule fois à la fin, s’aligne naturellement sur la logique du crédit de construction. Émettre des factures qui correspondent précisément aux jalons que la banque du client va vérifier, plutôt qu’à un calendrier arbitraire, facilite le déblocage des fonds côté client et réduit les délais de paiement côté entreprise.',
    },
    {
      type: 'callout',
      title: 'Demander le rythme des tranches avant de fixer son propre calendrier',
      text: 'Sur un chantier financé par crédit de construction, il vaut la peine de demander directement au client ou à son architecte à quel rythme les tranches sont débloquées. Caler ses situations de facturation sur ce rythme évite des relances inutiles pour un retard qui n’est souvent pas de la mauvaise volonté, mais un simple décalage administratif bancaire.',
    },
    {
      type: 'cta',
      title: 'Facturez au rythme réel du chantier, pas à l’aveugle',
      text: 'Émettre des situations claires, alignées sur l’avancement réel, aide autant l’entreprise que son client face à la banque. Cantia permet de facturer par étapes et de suivre chaque encaissement chantier par chantier.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Le crédit de construction concerne-t-il l’entreprise ou uniquement le client ?',
      answer:
        'Il est généralement contracté par le maître d’ouvrage, pas par l’entreprise qui réalise les travaux. Mais son rythme de déblocage influence directement la rapidité avec laquelle ce client peut régler les factures de l’entreprise.',
    },
    {
      question: 'Pourquoi un client solvable peut-il quand même payer en retard ?',
      answer:
        'Parce que le paiement dépend parfois du déblocage d’une tranche de crédit par la banque, qui exige ses propres vérifications d’avancement avant de libérer les fonds. Le retard vient alors du processus bancaire, pas d’un manque de volonté du client.',
    },
    {
      question: 'La facturation par situations aide-t-elle vraiment à limiter ce risque ?',
      answer:
        'Oui, en alignant ses factures sur les jalons d’avancement que la banque du client va de toute façon vérifier, l’entreprise réduit le décalage entre sa demande de paiement et le moment où le client dispose réellement des fonds.',
    },
  ],
  relatedSlugs: [
    'previsionnel-tresorerie-entreprise-batiment',
    'cautionnement-bancaire-entreprise-generale-suisse',
    'chantier-complet-peut-etre-en-perte-taux-horaire',
  ],
};
