import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'poursuite-facture-impayee-procedure-suisse',
  question: 'Comment lancer une poursuite contre un client qui refuse de payer une facture, et combien ça coûte ?',
  title: 'Facture impayée : la procédure de poursuite en Suisse, étape par étape',
  description:
    'Réquisition de poursuite, commandement de payer, opposition, mainlevée : voici comment fonctionne réellement une poursuite pour facture impayée, et à quel moment elle devient utile.',
  excerpt:
    'La relance ne fonctionne pas toujours. Avant d’abandonner une créance ou de s’épuiser en rappels, la poursuite reste une procédure accessible, standardisée, et souvent plus rapide qu’on ne le croit.',
  category: 'Devis & facturation',
  keywords: ['poursuite facture impayée', 'commandement de payer', 'office des poursuites', 'mainlevée', 'créance artisan'],
  publishedAt: '2026-08-18',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Après plusieurs relances restées sans effet, beaucoup d’artisans hésitent à passer à l’étape suivante, par méconnaissance de la procédure ou par crainte qu’elle soit lourde et coûteuse. En réalité, la poursuite pour dettes en Suisse est une procédure administrative standardisée, accessible sans avocat pour une créance simple et documentée.',
    },
    { type: 'h2', text: 'Les 4 étapes concrètes' },
    {
      type: 'list',
      items: [
        'Réquisition de poursuite : un formulaire déposé à l’office des poursuites du domicile du débiteur, avec le montant dû et sa cause (numéro et date de facture)',
        'Commandement de payer : l’office notifie le débiteur, qui a 10 jours pour faire opposition',
        'Sans opposition, la poursuite continue directement vers la saisie ou la faillite selon le statut du débiteur',
        'Avec opposition, il faut obtenir la mainlevée (au tribunal) pour la faire lever et poursuivre la procédure',
      ],
      ordered: true,
    },
    {
      type: 'callout',
      title: 'Un devis signé ou une facture reconnue accélère fortement la mainlevée',
      text: 'La mainlevée provisoire est nettement plus rapide à obtenir quand la créance repose sur un titre écrit et signé par le débiteur (devis accepté, facture reconnue, extrait de compte non contesté) plutôt que sur une simple facture non signée.',
    },
    { type: 'h2', text: 'Ce qui rend une poursuite plus ou moins efficace' },
    {
      type: 'p',
      text: 'La poursuite ne garantit pas le recouvrement : si le débiteur est réellement insolvable, elle se soldera par un acte de défaut de biens. Mais elle a un effet dissuasif réel (elle apparaît dans l’extrait du registre des poursuites, ce qui pèse pour toute entreprise ou personne cherchant un crédit, un bail ou un marché), et elle reste souvent le déclencheur qui fait enfin payer un débiteur solvable mais de mauvaise foi.',
    },
    {
      type: 'list',
      items: [
        'Le montant exact réclamé doit correspondre précisément à la facture, sans arrondi ni ajout de frais non justifiés',
        'La date et le numéro de facture doivent être identifiables sans ambiguïté',
        'Un historique de relances écrites renforce le dossier si l’affaire va jusqu’au tribunal',
      ],
    },
    {
      type: 'cta',
      title: 'Un dossier de facture toujours prêt',
      text: 'Cantia garde chaque facture, son historique d’envoi et son statut de paiement centralisés par client. De quoi remplir une réquisition de poursuite en quelques minutes plutôt qu’en fouillant des mois d’e-mails.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Faut-il un avocat pour lancer une poursuite en Suisse ?',
      answer:
        'Non, pour une créance simple et documentée, la réquisition de poursuite se dépose directement auprès de l’office des poursuites, sans représentation obligatoire.',
    },
    {
      question: 'Que se passe-t-il si le débiteur fait opposition au commandement de payer ?',
      answer:
        'Il faut demander la mainlevée au tribunal pour faire lever l’opposition : une procédure nettement plus rapide si la créance repose sur un titre signé par le débiteur.',
    },
    {
      question: 'Une poursuite garantit-elle d’être payé ?',
      answer:
        'Non. Si le débiteur est insolvable, la poursuite peut se terminer par un acte de défaut de biens sans recouvrement, mais elle reste inscrite au registre des poursuites du débiteur.',
    },
  ],
  relatedSlugs: [
    'hypotheque-legale-artisans-entrepreneurs-suisse',
    'relancer-client-facture-impayee-sans-perdre-client',
    'delai-paiement-facture-artisan-code-obligations',
  ],
};
