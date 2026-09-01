import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'numerotation-facture-obligations-legales-suisse',
  question: 'Faut-il une numérotation continue des factures en Suisse, et que risque-t-on à ne pas la respecter ?',
  title: 'Numérotation des factures en Suisse : pourquoi la continuité n’est pas un détail',
  description:
    'Un numéro de facture sauté, réutilisé ou désordonné attire immédiatement l’attention lors d’un contrôle fiscal, car la continuité numérique est l’un des premiers points vérifiés.',
  excerpt:
    'Deux factures avec le même numéro, ou une série qui saute de 042 à 057 sans explication : c’est exactement le genre de détail qu’un contrôle de l’AFC repère en quelques secondes.',
  category: 'Devis & facturation',
  keywords: ['numérotation facture suisse', 'continuité numéros facture', 'obligations facturation AFC', 'facture manquante contrôle fiscal', 'série de factures'],
  publishedAt: '2026-06-15',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'La numérotation des factures n’est pas qu’une question d’ordre : c’est l’un des premiers éléments vérifiés lors d’un contrôle de l’Administration fédérale des contributions (AFC). Une série continue et chronologique prouve qu’aucune facture n’a été émise puis dissimulée ; une série trouée ou désordonnée soulève immédiatement une question.',
    },
    { type: 'h2', text: 'Les règles de base à respecter' },
    {
      type: 'list',
      items: [
        'Chaque facture doit porter un numéro unique, jamais réutilisé, même après une annulation',
        'La série doit rester chronologique : un numéro plus récent ne doit jamais correspondre à une date antérieure à un numéro précédent',
        'Une facture annulée doit rester visible dans la série (avec sa note de crédit associée), pas simplement supprimée du système',
        'Un format cohérent (par exemple 2026-001, 2026-002…) facilite le suivi et le contrôle, sans être une obligation stricte de forme',
      ],
    },
    {
      type: 'callout',
      title: 'Un « trou » dans la numérotation n’est pas automatiquement une fraude, à condition de pouvoir l’expliquer',
      text: 'Une facture annulée avant envoi, par exemple, peut légitimement laisser un numéro inutilisé. L’essentiel est de pouvoir retracer pourquoi, avec une note de crédit ou un justificatif associé.',
    },
    { type: 'h2', text: 'Le risque concret d’une numérotation mal gérée' },
    {
      type: 'p',
      text: 'Plusieurs séries de factures gérées séparément (par exemple un carnet manuel en parallèle d’un logiciel) est l’erreur la plus fréquente chez les petites entreprises. Chaque système génère sa propre numérotation, créant des doublons ou des trous inexplicables au moment de tout rassembler pour la comptabilité annuelle.',
    },
    {
      type: 'cta',
      title: 'Une numérotation continue, gérée automatiquement',
      text: 'Cantia attribue un numéro unique et chronologique à chaque facture, sans jamais réutiliser de numéro ni créer de doublon entre plusieurs sources.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'La numérotation continue des factures est-elle obligatoire en Suisse ?',
      answer:
        'Ce n’est pas formalisée comme une loi stricte de format, mais l’AFC attend une série chronologique et traçable. Un contrôle fiscal vérifie systématiquement cette continuité.',
    },
    {
      question: 'Peut-on réutiliser un numéro de facture annulée ?',
      answer:
        'Non : une facture annulée doit rester identifiable dans la série avec une note de crédit associée, jamais être remplacée en réutilisant son numéro.',
    },
    {
      question: 'Que risque une entreprise avec une numérotation désordonnée ?',
      answer:
        'Un contrôle fiscal peut interpréter les incohérences comme un signe de dissimulation de chiffre d’affaires, même en l’absence de fraude réelle, si bien que la charge de la preuve retombe alors sur l’entreprise.',
    },
  ],
  relatedSlugs: [
    'note-de-credit-facture-rectificative-suisse',
    'duree-conservation-devis-factures-suisse',
    'mentions-obligatoires-facture-suisse-tva',
  ],
};
