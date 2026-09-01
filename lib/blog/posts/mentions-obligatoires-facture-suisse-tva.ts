import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'mentions-obligatoires-facture-suisse-tva',
  question: 'Quelles mentions sont légalement obligatoires sur une facture en Suisse pour la TVA ?',
  title: 'Facture suisse : les mentions obligatoires pour être valable côté TVA',
  description:
    'Numéro TVA, taux applicable, date de prestation, référence QR : une facture incomplète peut être refusée en comptabilité ou contestée par un client. Voici la liste exacte à vérifier.',
  excerpt:
    'Une facture qui « a l’air correcte » et une facture qui respecte toutes les exigences de l’AFC ne sont pas toujours la même chose. Une seule mention manquante suffit à la fragiliser.',
  category: 'Devis & facturation',
  keywords: ['mentions facture suisse', 'numéro TVA facture', 'AFC facture', 'facture conforme', 'facturation artisan'],
  publishedAt: '2026-08-15',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Une entreprise assujettie à la TVA doit émettre des factures respectant certaines exigences formelles. Ce n’est pas une simple question de paperasse : une facture incomplète peut être refusée pour la déduction de l’impôt préalable côté client, ou fragilisée en cas de contrôle de l’Administration fédérale des contributions (AFC).',
    },
    { type: 'h2', text: 'La liste des mentions attendues' },
    {
      type: 'list',
      items: [
        'Nom et adresse complète de l’entreprise émettrice, ainsi que du destinataire',
        'Numéro IDE / numéro TVA de l’entreprise émettrice',
        'Date d’émission de la facture, et date ou période de la prestation si différente',
        'Description suffisamment précise de la nature et de l’étendue de la prestation',
        'Montant de la contre-prestation et taux de TVA applicable (généralement 8,1 % pour les travaux du bâtiment)',
        'Montant de la TVA, indiqué séparément ou par une mention claire du taux si le prix est TTC',
      ],
    },
    {
      type: 'callout',
      title: 'En dessous de CHF 400.-, une facture simplifiée suffit',
      text: 'Pour les petits montants, il n’est pas nécessaire d’indiquer le nom du destinataire ni le détail du taux de TVA. Le numéro IDE et le montant TTC restent en revanche obligatoires.',
    },
    { type: 'h2', text: 'La QR-facture ajoute ses propres exigences' },
    {
      type: 'p',
      text: 'Une QR-facture doit en plus respecter le standard suisse de paiement (IBAN ou QR-IBAN valide, référence QR ou sans référence selon le compte utilisé, adresse structurée avec NPA et localité séparés depuis la version 2.3 de la norme). Un format non conforme peut être refusé par certaines banques, ou générer une erreur au moment du scan côté client.',
    },
    {
      type: 'cta',
      title: 'Des factures conformes sans y penser',
      text: 'Cantia génère automatiquement des factures et QR-factures avec toutes les mentions légales à jour (TVA, IBAN, adresse structurée), sans que vous ayez à vérifier chaque champ à la main.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Le numéro IDE est-il obligatoire sur toute facture suisse ?',
      answer:
        'Oui, dès qu’une entreprise est assujettie à la TVA, son numéro IDE/TVA doit figurer sur la facture pour permettre la déduction de l’impôt préalable côté client.',
    },
    {
      question: 'Quel taux de TVA s’applique aux travaux du bâtiment en Suisse ?',
      answer:
        'Le taux normal de 8,1 % s’applique à la majorité des prestations du bâtiment depuis 2024, sauf cas particuliers relevant d’un taux réduit ou d’une exonération spécifique.',
    },
    {
      question: 'Une facture sans TVA détaillée est-elle valable ?',
      answer:
        'Pour les montants supérieurs à CHF 400.-, le taux et le montant de TVA doivent apparaître clairement, car leur absence peut faire refuser la déduction de l’impôt préalable au destinataire.',
    },
  ],
  relatedSlugs: [
    'qr-facture-obligatoire-2026',
    'difference-devis-offre-facture-pro-forma',
    'delai-paiement-facture-artisan-code-obligations',
  ],
};
