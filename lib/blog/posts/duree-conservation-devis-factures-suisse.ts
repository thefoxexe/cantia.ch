import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'duree-conservation-devis-factures-suisse',
  question: 'Combien de temps garder ses devis et factures en Suisse ?',
  title: 'Combien de temps conserver devis et factures en Suisse ?',
  description:
    'Le Code des obligations (art. 958f) impose une conservation de 10 ans pour les pièces comptables, factures incluses — délai qui court depuis la fin de l’exercice, pas la date du document.',
  excerpt:
    'Une facture de mars 2026 doit rester accessible jusqu’à fin 2036, pas jusqu’à mars 2036. Un détail de calcul du délai que la plupart des entreprises ratent.',
  category: 'Juridique & normes',
  keywords: ['conservation documents', 'archivage factures', 'délai légal', 'code des obligations', 'comptabilité'],
  publishedAt: '2026-02-16',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Peut-on jeter les devis et factures d’un chantier terminé depuis cinq ans ? Le principe suisse est simple, mais le calcul exact du délai surprend presque tout le monde : ce n’est jamais la date du document qui compte, c’est la fin de l’exercice comptable dans lequel il s’inscrit.',
    },
    { type: 'h2', text: 'La règle : 10 ans, depuis la fin de l’exercice' },
    {
      type: 'p',
      text: 'L’art. 958f du Code des obligations impose de conserver les livres comptables, pièces justificatives (dont les factures émises et reçues), rapports de gestion et rapports de révision pendant dix ans. Le délai ne part pas de la date figurant sur le document, mais de la fin de l’exercice comptable auquel il se rapporte.',
    },
    {
      type: 'callout',
      title: 'L’exemple qui rend le calcul évident',
      text: 'Une facture datée du 15 mars 2026, pour une entreprise dont l’exercice se termine le 31 décembre, doit rester accessible jusqu’au 31 décembre 2036 — pas jusqu’au 15 mars 2036. Neuf mois de plus que ce que la plupart des gens calculent instinctivement.',
    },
    { type: 'h2', text: 'Quels documents sont concernés' },
    {
      type: 'list',
      items: [
        'Factures émises aux clients et factures reçues des fournisseurs/sous-traitants',
        'Devis acceptés servant de base contractuelle (rattachés à la comptabilité du chantier)',
        'Livres comptables et pièces justificatives au sens large',
        'Rapports de gestion et rapports de révision, le cas échéant',
      ],
    },
    { type: 'h2', text: 'Papier ou numérique : ce que la loi accepte réellement' },
    {
      type: 'p',
      text: 'Papier, forme électronique, ou toute forme équivalente — la loi n’impose pas de support précis, à condition que le lien avec les opérations concernées reste garanti et que l’accessibilité soit assurée pendant toute la durée légale. En pratique, une conservation numérique bien sauvegardée est largement acceptée, et infiniment plus rapide à retrouver qu’une pile de classeurs papier fouillée un après-midi de contrôle fiscal.',
    },
    { type: 'h2', text: 'Pourquoi ça compte, au-delà de l’obligation' },
    {
      type: 'p',
      text: 'Retrouver rapidement un devis ou une facture d’un chantier vieux de plusieurs années sert bien au-delà de la conformité légale : un litige de garantie qui ressurgit, un contrôle fiscal, ou simplement un client qui redemande une copie d’un document ancien. Un classement par chantier, cherchable, évite de fouiller un disque dur ou une boîte mail des années plus tard, souvent au pire moment pour le faire.',
    },
    {
      type: 'cta',
      title: 'Chaque devis et facture, retrouvable en un clic',
      text: 'Cantia conserve automatiquement chaque devis et facture générés, classés par chantier et par client, sans limite de temps ni classement manuel à tenir soi-même.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Pendant combien de temps une entreprise suisse doit-elle garder ses factures ?',
      answer:
        'Dix ans, conformément à l’art. 958f du Code des obligations, applicable aux pièces comptables dont les factures émises et reçues font partie.',
    },
    {
      question: 'Le délai de 10 ans court-il depuis la date de la facture ?',
      answer:
        'Non — il court depuis la fin de l’exercice comptable dans lequel la facture s’inscrit, pas depuis sa date d’émission propre.',
    },
    {
      question: 'Peut-on conserver ses factures uniquement en format numérique ?',
      answer:
        'Oui, la loi accepte la conservation électronique à condition que le lien avec les transactions concernées soit garanti et que l’accessibilité soit assurée pendant toute la durée légale.',
    },
  ],
  relatedSlugs: [
    'delai-paiement-facture-artisan-code-obligations',
    'norme-sia-118-devis-obligatoire',
    'qr-facture-obligatoire-2026',
  ],
};
