import { BlogPost } from '../types';

// Pillar article: the whole invoicing of a building job in Switzerland, from
// the quote to the payment, linking to every detailed article and to the
// free templates and tools.
export const post: BlogPost = {
  slug: 'facturation-chantier-guide-complet-suisse',
  question: 'Comment facturer un chantier en Suisse, du devis jusqu’au paiement ?',
  title: 'Facturation de chantier en Suisse : le guide complet, du devis au paiement',
  description:
    'Devis, acomptes, situations, travaux en plus, QR-facture et relances : toutes les étapes pour facturer un chantier en Suisse, avec modèles gratuits.',
  excerpt:
    'Un chantier se facture en plusieurs fois : acompte, situations, travaux en plus, décompte final. Voici chaque étape, ce qu’elle doit contenir et les erreurs qui retardent les paiements.',
  category: 'Devis & facturation',
  keywords: ['facturation chantier', 'facturer un chantier', 'facture chantier suisse', 'facture de situation', 'acompte chantier', 'décompte final chantier', 'qr-facture chantier'],
  publishedAt: '2026-11-25',
  readMinutes: 11,
  blocks: [
    {
      type: 'p',
      text: 'Sur un chantier, la facture n’est pas un document unique envoyé à la fin. Elle se construit dès le devis et se découpe en plusieurs étapes : un acompte au démarrage, des factures intermédiaires pendant les travaux, des travaux en plus acceptés en cours de route, puis un décompte final. Une étape mal préparée suffit à retarder le paiement de toutes les autres.',
    },
    {
      type: 'callout',
      title: 'En résumé',
      text: 'Un devis précis, un acompte à la commande, des situations au rythme de l’avancement, chaque travail en plus signé avant d’être fait, un décompte final qui reprend tout, une QR-facture correcte et des relances à dates fixes.',
    },
    { type: 'h2', text: '1. Le devis : la base de toutes les factures' },
    {
      type: 'p',
      text: 'Tout ce qui sera facturé découle du devis. Les positions, les unités et les prix unitaires qu’il fixe sont ceux que vous reprendrez dans chaque facture. Un devis flou (« travaux de carrelage, forfait ») rend chaque facture discutable ; un devis détaillé position par position rend les situations et le décompte final simples à justifier.',
    },
    {
      type: 'list',
      items: [
        'Positions numérotées avec quantité, unité et prix unitaire',
        'Taux de TVA (8,1 % pour la plupart des travaux du bâtiment) et total TTC',
        'Durée de validité, délai d’exécution et conditions de paiement (acompte, situations, solde)',
        'Ce qui n’est pas compris, pour que les travaux en plus soient clairement identifiables',
        'L’accord du client : signature datée, en ligne ou sur papier',
      ],
    },
    {
      type: 'leadmagnet',
      title: 'Modèle de devis gratuit (Word)',
      text: 'Un devis prêt à compléter : positions, TVA 8,1 %, conditions de paiement et bon pour accord. À télécharger après avoir indiqué votre e-mail.',
      buttonLabel: 'Recevoir le modèle',
      fileUrl: '/downloads/modele-devis-batiment.docx',
      fileLabel: 'Télécharger le modèle (Word)',
    },
    { type: 'h2', text: '2. L’acompte : sécuriser le démarrage' },
    {
      type: 'p',
      text: 'L’acompte couvre les achats de matériel et réduit le risque d’impayé. Il doit être prévu dans le devis signé (par exemple 30 % à la commande) et faire l’objet d’une facture d’acompte, avec la TVA sur le montant encaissé. Le décompte final le déduira, TVA comprise, pour que rien ne soit facturé deux fois.',
    },
    { type: 'h2', text: '3. Les situations : facturer au fil de l’avancement' },
    {
      type: 'p',
      text: 'Sur un chantier de plusieurs semaines, attendre la fin pour facturer pèse sur la trésorerie. La facture de situation (ou facture intermédiaire) facture la part des travaux réellement exécutée à une date donnée, en pourcentage ou en quantités par position, moins ce qui a déjà été facturé.',
    },
    {
      type: 'table',
      headers: ['Situation', 'Avancement cumulé', 'Montant cumulé HT', 'Déjà facturé', 'À facturer HT'],
      rows: [
        ['Acompte', '–', 'CHF 12’000', '–', 'CHF 12’000'],
        ['Situation 1', '40 %', 'CHF 16’000', 'CHF 12’000', 'CHF 4’000'],
        ['Situation 2', '75 %', 'CHF 30’000', 'CHF 16’000', 'CHF 14’000'],
        ['Décompte final', '100 %', 'CHF 40’000', 'CHF 30’000', 'CHF 10’000'],
      ],
    },
    {
      type: 'p',
      text: 'Exemple pour un devis de CHF 40’000 HT. Chaque situation repart du cumul, ce qui évite les erreurs de reports d’une facture à l’autre. Si le contrat prévoit une retenue de garantie, elle se calcule sur ces montants.',
    },
    { type: 'h2', text: '4. Les travaux en plus : signés avant d’être faits' },
    {
      type: 'p',
      text: 'C’est là que se perd le plus d’argent sur un chantier. Un travail non prévu au devis (une conduite à remplacer, une prise à déplacer) doit être chiffré et accepté par écrit avant l’exécution. Sinon, il devient difficile à facturer, ou il est oublié dans le décompte final. Pour les travaux au temps passé, le bon de régie relève les heures, le matériel et la signature du client sur place.',
    },
    { type: 'h2', text: '5. Le décompte final : tout reprendre, une seule fois' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Faire la réception des travaux et la documenter (procès-verbal daté et signé)',
        'Relever les quantités réellement exécutées (le métré) et les comparer au devis',
        'Ajouter les travaux en plus acceptés et retirer les moins-values',
        'Déduire l’acompte et les situations déjà facturés',
        'Calculer la retenue de garantie si le contrat en prévoit une',
        'Vérifier la TVA, arrondir le total aux 5 centimes et joindre la QR-facture',
      ],
    },
    {
      type: 'leadmagnet',
      title: 'Checklist de fin de chantier (PDF)',
      text: 'De la réception des travaux à la facture finale : les points à cocher pour ne rien oublier dans le décompte.',
      buttonLabel: 'Recevoir la checklist',
      fileUrl: '/downloads/checklist-fin-de-chantier.pdf',
      fileLabel: 'Télécharger la checklist (PDF)',
    },
    { type: 'h2', text: '6. La QR-facture : se faire payer sans erreur de saisie' },
    {
      type: 'p',
      text: 'Depuis le 1er octobre 2022, les anciens bulletins de versement ne sont plus acceptés. La section paiement avec QR code contient votre IBAN, le montant et une référence : le client la scanne dans son e-banking, sans rien recopier. La référence permet ensuite de reconnaître le paiement sur votre relevé bancaire.',
    },
    {
      type: 'leadmagnet',
      title: 'Modèle de facture gratuit (Excel)',
      text: 'Les totaux, la TVA 8,1 % et l’arrondi aux 5 centimes se calculent tout seuls. La QR-facture se crée ensuite gratuitement sur cantia.ch/outils/qr-facture.',
      buttonLabel: 'Recevoir le modèle',
      fileUrl: '/downloads/modele-facture-batiment.xlsx',
      fileLabel: 'Télécharger le modèle (Excel)',
    },
    { type: 'h2', text: '7. Délais de paiement et relances' },
    {
      type: 'p',
      text: 'Indiquez une échéance précise sur chaque facture (par exemple 30 jours). Passé ce délai, le client est en demeure et vous pouvez réclamer des intérêts moratoires de 5 % par an (art. 104 CO). Une relance aimable quelques jours après l’échéance, puis un rappel ferme, suffisent dans la plupart des cas. La poursuite n’intervient qu’en dernier recours.',
    },
    {
      type: 'table',
      headers: ['Moment', 'Action'],
      rows: [
        ['Échéance + 5 jours', 'Relance aimable par e-mail, avec la facture en pièce jointe'],
        ['Échéance + 20 jours', 'Rappel écrit avec un nouveau délai court (10 jours)'],
        ['Échéance + 40 jours', 'Dernier rappel, mention des intérêts et de la suite (poursuite)'],
      ],
    },
    { type: 'h2', text: '8. Conserver les pièces' },
    {
      type: 'p',
      text: 'Devis signés, bons de régie, procès-verbaux, factures et preuves de paiement se conservent 10 ans (art. 958f CO). En cas de contestation ou de défaut annoncé pendant la garantie, c’est le dossier complet du chantier qui fait foi.',
    },
    {
      type: 'linklist',
      title: 'Pour aller plus loin, étape par étape',
      items: [
        { label: 'Facturer un acompte et sécuriser le solde', slug: 'facturer-acompte-suisse-securiser-solde' },
        { label: 'Facturer des heures en régie', slug: 'facturation-heures-regie-batiment-comment-faire' },
        { label: 'Avenant, plus-value et moins-value', slug: 'avenant-chantier-plus-value-moins-value' },
        { label: 'Réception des travaux et procès-verbal', slug: 'reception-travaux-proces-verbal-chantier' },
        { label: 'Retenue de garantie sur un chantier', slug: 'retenue-de-garantie-chantier-consignation' },
        { label: 'Métré et post-calcul : la soumission a-t-elle rapporté ?', slug: 'metre-post-calcul-soumission-benefice-chantier' },
        { label: 'Checklist avant la facture finale', slug: 'checklist-cloture-chantier-avant-facturation' },
        { label: 'Mentions obligatoires d’une facture en Suisse', slug: 'mentions-obligatoires-facture-suisse-tva' },
        { label: 'La QR-facture expliquée', slug: 'qr-facture-obligatoire-2026' },
        { label: 'Délais de paiement et Code des obligations', slug: 'delai-paiement-facture-artisan-code-obligations' },
        { label: 'Relancer une facture impayée sans perdre le client', slug: 'relancer-client-facture-impayee-sans-perdre-client' },
        { label: 'La poursuite pour une facture impayée', slug: 'poursuite-facture-impayee-procedure-suisse' },
        { label: 'Note de crédit et facture rectificative', slug: 'note-de-credit-facture-rectificative-suisse' },
        { label: 'Combien de temps conserver devis et factures', slug: 'duree-conservation-devis-factures-suisse' },
      ],
    },
    {
      type: 'cta',
      title: 'Toute la facturation du chantier au même endroit',
      text: 'Avec Cantia, le devis signé devient facture d’acompte, situations et décompte final, les travaux en plus sont signés sur le chantier et chaque facture part avec sa QR-facture et ses relances.',
      buttonLabel: 'Essayer 14 jours',
    },
  ],
  faq: [
    {
      question: 'Quelle différence entre une facture d’acompte et une facture de situation ?',
      answer:
        'La facture d’acompte est demandée avant ou au démarrage des travaux, sur un montant fixé dans le devis. La facture de situation facture la part des travaux déjà exécutée, à une date donnée, moins ce qui a déjà été facturé.',
    },
    {
      question: 'Quel taux de TVA appliquer sur une facture de chantier ?',
      answer:
        'Le taux normal de 8,1 % s’applique à la plupart des travaux du bâtiment depuis le 1er janvier 2024, si votre entreprise est assujettie à la TVA. Le taux se vérifie selon votre situation, avec votre fiduciaire en cas de doute.',
    },
    {
      question: 'Que mettre dans le décompte final d’un chantier ?',
      answer:
        'Les quantités réellement exécutées aux prix du devis, les travaux en plus acceptés, les moins-values, moins l’acompte et les situations déjà facturés, la retenue de garantie éventuelle, la TVA et le total arrondi aux 5 centimes, avec la QR-facture.',
    },
    {
      question: 'Quand relancer une facture de chantier impayée ?',
      answer:
        'Quelques jours après l’échéance pour une première relance aimable, puis par un rappel écrit avec un nouveau délai court. Après l’échéance, des intérêts moratoires de 5 % par an peuvent être réclamés (art. 104 CO).',
    },
  ],
  relatedSlugs: ['facturer-acompte-suisse-securiser-solde', 'qr-facture-obligatoire-2026', 'relancer-client-facture-impayee-sans-perdre-client'],
};
