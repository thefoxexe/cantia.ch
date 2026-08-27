import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'reception-travaux-proces-verbal-chantier',
  question: 'Faut-il un procès-verbal de réception des travaux, et pourquoi c’est le document le plus important du chantier ?',
  title: 'Réception des travaux : pourquoi le procès-verbal protège autant le client que l’entrepreneur',
  description:
    'La réception des travaux déclenche le délai de garantie, transfère les risques et fige les défauts constatés. Sans procès-verbal écrit, ce moment charnière devient impossible à prouver.',
  excerpt:
    'Beaucoup de chantiers se terminent sans aucun document formel — juste des clés remises et un dernier acompte payé. C’est exactement le moment où un litige devient impossible à trancher faute de preuve.',
  category: 'Juridique & normes',
  keywords: ['réception des travaux', 'procès-verbal chantier', 'garantie construction', 'défauts chantier', 'fin de chantier'],
  publishedAt: '2026-08-21',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'La réception des travaux est le moment juridique où le maître d’ouvrage accepte l’ouvrage tel qu’il est livré. Ce n’est pas une formalité accessoire : c’est l’événement qui déclenche le délai de garantie, transfère les risques de l’entrepreneur vers le client, et fige la liste des défauts constatés à cet instant précis — tout ce qui n’est pas signalé lors de la réception devient plus difficile à faire valoir ensuite.',
    },
    { type: 'h2', text: 'Ce que le procès-verbal doit contenir' },
    {
      type: 'list',
      items: [
        'La date exacte de la réception, point de départ du délai de garantie',
        'La liste précise des défauts constatés ce jour-là, avec leur emplacement',
        'La signature des deux parties — sans signature, le document ne prouve rien en cas de désaccord',
        'La mention explicite d’une réception sans réserve si aucun défaut n’est constaté',
      ],
    },
    { type: 'h2', text: 'Ce qui se passe sans procès-verbal écrit' },
    {
      type: 'p',
      text: 'En l’absence de document formel, la réception peut être considérée comme tacite — par exemple lorsque le client utilise l’ouvrage sans réserve. Le problème n’est pas juridique mais pratique : sans date écrite, impossible de prouver précisément quand le délai de garantie a commencé à courir, ni quels défauts existaient déjà à ce moment-là plutôt qu’apparus après coup à cause d’un usage normal.',
    },
    {
      type: 'callout',
      title: 'Un client qui refuse de signer n’empêche pas la réception d’avoir lieu',
      text: 'Un procès-verbal peut être établi unilatéralement par l’entrepreneur et notifié au client — ce qui reste largement préférable à l’absence totale de trace écrite du moment de la réception.',
    },
    {
      type: 'p',
      text: 'Un rapport de fin de chantier avec photos horodatées, envoyé au client au moment de la remise des clés, joue en pratique le même rôle protecteur qu’un procès-verbal formel : il fixe une date, documente l’état de l’ouvrage, et donne une base factuelle en cas de contestation ultérieure.',
    },
    {
      type: 'cta',
      title: 'Un rapport de fin de chantier en quelques minutes',
      text: 'Cantia génère un rapport PDF avec photos géolocalisées et horodatées, envoyable au client directement depuis le chantier — de quoi documenter proprement chaque réception de travaux.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'La réception des travaux doit-elle obligatoirement être écrite ?',
      answer:
        'La loi n’impose pas de formalisme strict, mais sans document écrit et daté, prouver le moment exact de la réception et les défauts constatés devient très difficile en cas de litige.',
    },
    {
      question: 'Que se passe-t-il si le client refuse de signer le procès-verbal ?',
      answer:
        'L’entrepreneur peut établir le document unilatéralement et le notifier au client — cela reste une preuve bien plus solide que l’absence totale de trace écrite.',
    },
    {
      question: 'Quel est l’effet principal de la réception sur les garanties ?',
      answer:
        'Elle déclenche le point de départ du délai de garantie (généralement 2 ou 5 ans selon le type de défaut) et fixe la liste des défauts déjà connus à ce moment-là.',
    },
  ],
  relatedSlugs: [
    'garantie-travaux-construction-2-ou-5-ans',
    'defaut-construction-decouvert-apres-reception-qui-paie',
    'photos-chantier-preuve-juridique-litige',
  ],
};
