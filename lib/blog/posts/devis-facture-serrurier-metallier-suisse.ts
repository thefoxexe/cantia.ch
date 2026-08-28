import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-facture-serrurier-metallier-suisse',
  question: 'Comment un serrurier-métallier doit-il chiffrer un devis entre fabrication sur mesure et dépannage urgent ?',
  title: 'Serrurier-métallier : chiffrer entre ouvrage sur mesure et dépannage dans l’urgence',
  description:
    'Un garde-corps sur mesure se conçoit tranquillement, une porte forcée se dépanne dans l’heure — le serrurier-métallier vit des deux logiques en parallèle. Comment les structurer sans les confondre.',
  excerpt:
    'Entre un portail en acier fabriqué sur plusieurs semaines et une serrure changée en urgence un samedi soir, le métallier-serrurier doit faire cohabiter deux façons de facturer radicalement différentes.',
  category: 'Métiers du bâtiment',
  keywords: ['devis serrurier métallier', 'facturation dépannage serrure', 'prix ouvrage métallique sur mesure', 'devis garde-corps portail', 'tarif serrurier urgence Suisse'],
  publishedAt: '2026-09-15',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'La construction métallique sur mesure (garde-corps, portails, escaliers, structures) suit le rythme d’un chantier classique — prise de cotes, conception, fabrication en atelier, pose. Le dépannage de serrurerie (porte claquée, serrure forcée, clé cassée) suit un rythme totalement différent : intervention immédiate, souvent hors horaires normaux, sans le temps de préparer un devis détaillé au préalable.',
    },
    { type: 'h2', text: 'Ouvrage sur mesure : un devis qui suit la fabrication' },
    {
      type: 'list',
      items: [
        'Prise de cotes et plan technique, particulièrement important sur des structures porteuses',
        'Fourniture de matière (acier, inox, aluminium), dont le prix peut varier entre commande et livraison',
        'Façonnage et soudure en atelier, chiffrable au temps ou à la pièce selon la complexité',
        'Pose, fixation et finitions (peinture, galvanisation) sur site',
      ],
    },
    { type: 'h2', text: 'Dépannage : un tarif annoncé avant d’intervenir, même sous pression' },
    {
      type: 'p',
      text: 'Une personne bloquée devant sa porte n’est pas en position de négocier sereinement un prix. Annoncer clairement le tarif de déplacement et d’intervention avant de se déplacer — plutôt que de facturer après coup — protège le client d’une mauvaise surprise et protège le serrurier d’une contestation ultérieure du prix.',
    },
    {
      type: 'stat',
      value: '30-50 %',
      label: 'majoration courante appliquée sur une intervention de serrurerie d’urgence en dehors des heures normales, par rapport à un rendez-vous planifié',
    },
    {
      type: 'callout',
      title: 'La variation du prix de l’acier mérite une clause au devis',
      text: 'Sur un ouvrage sur mesure dont la fabrication s’étale sur plusieurs semaines, une clause de révision du prix matière évite d’absorber seul une hausse du cours de l’acier survenue entre le devis et la commande réelle.',
    },
    {
      type: 'cta',
      title: 'Facturez un dépannage depuis le trottoir, en quelques minutes',
      text: 'Cantia permet d’émettre une facture directement depuis le téléphone juste après une intervention de dépannage — pas besoin de rentrer à l’atelier pour ne pas oublier de la facturer.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Comment facturer un dépannage de serrurerie en urgence sans devis préalable ?',
      answer:
        'En annonçant clairement le tarif de déplacement et d’intervention avant de se rendre sur place, oralement ou par message, plutôt que d’établir la facture après coup sans accord préalable sur le prix.',
    },
    {
      question: 'Peut-on majorer le tarif d’un dépannage de serrurerie hors horaires normaux ?',
      answer:
        'Oui, c’est une pratique courante — généralement entre 30 et 50 % de majoration — à condition que le client en soit informé avant l’intervention, pas seulement sur la facture finale.',
    },
    {
      question: 'Faut-il prévoir une clause de révision de prix sur un ouvrage métallique sur mesure ?',
      answer:
        'C’est recommandé lorsque la fabrication s’étale sur plusieurs semaines, car le cours des matières premières comme l’acier peut varier sensiblement entre le devis et la commande réelle.',
    },
  ],
  relatedSlugs: [
    'devis-facture-plombier-sanitaire-suisse',
    'facturer-acompte-suisse-securiser-solde',
    'devis-charpente-bois-facturation-suisse',
  ],
};
