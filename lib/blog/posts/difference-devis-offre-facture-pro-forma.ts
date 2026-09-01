import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'difference-devis-offre-facture-pro-forma',
  question: 'Quelle est la différence entre un devis, une offre et une facture pro forma ?',
  title: 'Devis, offre, facture pro forma : trois mots, trois usages différents',
  description:
    'Les trois termes s’utilisent souvent l’un pour l’autre dans le bâtiment suisse alors qu’ils n’engagent pas de la même façon. Un point rapide pour ne plus les confondre.',
  excerpt:
    '« Offre », « devis », « facture pro forma » : trois documents qu’on utilise souvent comme des synonymes, alors qu’ils n’ont ni la même valeur ni le même usage.',
  category: 'Devis & facturation',
  keywords: ['devis', 'offre', 'facture pro forma', 'terminologie', 'document commercial'],
  publishedAt: '2026-05-11',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Dans le langage courant du bâtiment, « devis » et « offre » s’emploient souvent comme des synonymes. Dans la plupart des cas, cela ne pose pas de problème. La confusion devient gênante quand une « facture pro forma » entre dans la conversation, parce que ce document-là ne joue pas du tout le même rôle.',
    },
    { type: 'h2', text: 'Devis et offre : la même chose, dans la pratique du bâtiment' },
    {
      type: 'p',
      text: 'Juridiquement, les deux termes décrivent une proposition de contrat (une offre au sens du droit des obligations, que le client accepte ou refuse). « Devis » est le terme d’usage dans le bâtiment (avec le détail des postes chiffrés) ; « offre » est un terme plus générique utilisé dans d’autres secteurs pour désigner la même chose. Aucune différence de valeur juridique entre les deux dans ce contexte.',
    },
    {
      type: 'callout',
      title: 'La facture pro forma n’est pas une facture, et n’engage à rien',
      text: 'Une facture pro forma est un document informatif qui présente un montant estimé, souvent utilisé pour des démarches administratives (dossier de financement, douane). Elle ne constitue cependant ni une créance juridique, ni une acceptation contractuelle. Contrairement à un devis accepté, elle n’engage aucune des deux parties.',
    },
    { type: 'h2', text: 'Pourquoi la distinction compte' },
    {
      type: 'list',
      items: [
        'Un devis accepté par le client crée un contrat d’entreprise : les deux parties sont engagées',
        'Une facture pro forma ne crée aucune obligation de payer (elle informe, sans engager)',
        'Une vraie facture (émise après exécution ou en acompte) crée, elle, une créance exigible avec échéance',
      ],
    },
    {
      type: 'p',
      text: 'Le risque concret d’une confusion : envoyer une « facture pro forma » en pensant avoir sécurisé un engagement client, alors qu’aucune acceptation contractuelle n’a réellement eu lieu. Le client peut alors se rétracter sans aucune conséquence juridique, contrairement à un devis dûment accepté.',
    },
    {
      type: 'cta',
      title: 'Devis, factures, acomptes : chacun à sa place',
      text: 'Cantia distingue clairement chaque statut de document (brouillon, devis envoyé, accepté, facturé) pour ne jamais confondre une proposition avec un engagement réel.',
      buttonLabel: 'Découvrir le module Devis',
    },
  ],
  faq: [
    {
      question: 'Un devis et une offre sont-ils la même chose dans le bâtiment ?',
      answer:
        'Oui dans la pratique : les deux termes désignent une proposition de contrat, « devis » étant le terme d’usage courant dans le secteur du bâtiment.',
    },
    {
      question: 'Une facture pro forma engage-t-elle le client à payer ?',
      answer:
        'Non. C’est un document purement informatif présentant un montant estimé, sans valeur de créance ni acceptation contractuelle.',
    },
    {
      question: 'Quelle est la différence entre un devis accepté et une vraie facture ?',
      answer:
        'Le devis accepté forme le contrat d’entreprise ; la facture, elle, crée une créance exigible avec une échéance de paiement, généralement émise après exécution ou en acompte.',
    },
  ],
  relatedSlugs: [
    'devis-oral-valeur-legale-suisse',
    'validite-devis-signe-prix-qui-bouge',
    'facturer-acompte-suisse-securiser-solde',
  ],
};
