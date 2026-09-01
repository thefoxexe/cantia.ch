import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'note-de-credit-facture-rectificative-suisse',
  question: 'Comment corriger une facture déjà envoyée : note de crédit ou facture rectificative ?',
  title: 'Facture déjà envoyée mais fausse : note de crédit ou facture rectificative ?',
  description:
    'Une erreur de montant, de TVA ou de prestation sur une facture déjà envoyée ne se corrige jamais en éditant le PDF original. Voici la bonne méthode, conforme à la comptabilité suisse.',
  excerpt:
    'Renvoyer une version corrigée du même numéro de facture crée un doublon comptable des deux côtés. La note de crédit existe précisément pour corriger proprement, sans jamais réécrire l’histoire.',
  category: 'Devis & facturation',
  keywords: ['note de crédit facture', 'facture rectificative suisse', 'corriger une facture', 'erreur facture déjà envoyée', 'annuler une facture'],
  publishedAt: '2026-06-11',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Une erreur découverte après l’envoi d’une facture (mauvais montant, TVA incorrecte, prestation mal décrite) ne se corrige jamais en modifiant le document original et en le renvoyant sous le même numéro. Une fois émise, une facture reste dans la comptabilité telle quelle ; la correction passe par un document distinct : la note de crédit.',
    },
    { type: 'h2', text: 'Pourquoi ne jamais réémettre le même numéro de facture' },
    {
      type: 'list',
      items: [
        'La numérotation des factures doit rester continue et chronologique, car réutiliser ou modifier un numéro déjà émis casse cette continuité, un point vérifié en cas de contrôle fiscal',
        'Le client a peut-être déjà enregistré la facture initiale dans sa propre comptabilité, et un doublon silencieux crée alors une confusion difficile à tracer plus tard',
        'Une facture, une fois envoyée, constitue une pièce comptable définitive : seule une contre-écriture peut légitimement en neutraliser les effets',
      ],
    },
    { type: 'h2', text: 'La méthode correcte' },
    {
      type: 'list',
      items: [
        'Émettre une note de crédit référençant explicitement le numéro de la facture initiale, pour le montant à annuler (total ou partiel)',
        'Émettre ensuite une nouvelle facture, avec un nouveau numéro, contenant les données corrigées',
        'Conserver les deux documents (facture initiale + note de crédit + nouvelle facture) dans l’historique ; ils forment ensemble la trace comptable complète',
      ],
      ordered: true,
    },
    {
      type: 'callout',
      title: 'Une erreur mineure ne justifie pas toujours une note de crédit complète',
      text: 'Pour une simple coquille sans impact sur le montant ou la TVA, un e-mail de clarification au client peut suffire. La note de crédit devient nécessaire dès que le montant facturé lui-même doit changer.',
    },
    {
      type: 'cta',
      title: 'Note de crédit générée en un clic',
      text: 'Cantia permet d’émettre une note de crédit directement liée à la facture d’origine, avec numérotation automatique et continue.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Peut-on simplement modifier une facture déjà envoyée à un client ?',
      answer:
        'Non, une facture émise reste une pièce comptable définitive. Toute correction doit passer par une note de crédit suivie d’une nouvelle facture, jamais par une modification du document original.',
    },
    {
      question: 'Qu’est-ce qu’une note de crédit exactement ?',
      answer:
        'Un document qui annule tout ou partie d’une facture déjà émise, référençant explicitement son numéro d’origine, sans casser la continuité de la numérotation.',
    },
    {
      question: 'Faut-il une note de crédit pour une simple faute de frappe sur une facture ?',
      answer:
        'Pas nécessairement si le montant et la TVA ne changent pas : une clarification écrite au client peut suffire dans ce cas précis.',
    },
  ],
  relatedSlugs: [
    'numerotation-facture-obligations-legales-suisse',
    'mentions-obligatoires-facture-suisse-tva',
    'difference-devis-offre-facture-pro-forma',
  ],
};
