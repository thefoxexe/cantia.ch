import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-facture-vitrier-suisse',
  question: 'Comment établir devis et factures en tant que vitrier en Suisse ?',
  title: 'Devis et facturation pour un vitrier en Suisse',
  description:
    'Prise de mesure, délai de fabrication du verre, dépannage urgent ou remplacement planifié : comment chiffrer et facturer un chantier de vitrerie en Suisse.',
  excerpt:
    'Entre le dépannage d’urgence et le remplacement de fenêtres complètes, le vitrier jongle avec deux logiques de devis très différentes. Voici comment les structurer correctement.',
  category: 'Métiers du bâtiment',
  keywords: ['devis vitrier suisse', 'facturation vitrerie', 'prix remplacement vitrage suisse'],
  publishedAt: '2026-10-11',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Le métier de vitrier se partage entre deux réalités bien différentes : le dépannage urgent d’une vitre cassée, et le remplacement planifié de fenêtres complètes sur un chantier de rénovation ou de construction neuve. Ces deux situations demandent des logiques de devis et de facturation distinctes.',
    },
    { type: 'h2', text: 'La prise de mesure, étape la plus critique du devis' },
    {
      type: 'p',
      text: 'Contrairement à d’autres métiers où une estimation approximative reste possible, le verre se commande sur mesure et ne tolère aucune approximation. Une prise de mesure imprécise entraîne une commande à refaire, un délai supplémentaire et un coût que l’entreprise doit généralement absorber. Le devis doit clairement indiquer si le prix repose sur une mesure définitive ou sur une estimation à confirmer sur place.',
    },
    { type: 'h2', text: 'Dépannage urgent contre remplacement planifié' },
    {
      type: 'table',
      headers: ['', 'Dépannage urgent', 'Remplacement planifié'],
      rows: [
        ['Délai', 'Intervention rapide, souvent sous 24 à 48h', 'Plusieurs semaines, selon le délai de fabrication'],
        ['Devis', 'Souvent simplifié, facturé après intervention', 'Détaillé, validé avant commande'],
        ['Tarification', 'Majoration fréquente pour l’urgence', 'Tarif standard, parfois négociable sur volume'],
        ['Vitrage', 'Standard, disponible rapidement', 'Sur mesure, choix de performance possible'],
      ],
    },
    { type: 'h2', text: 'Le délai de fabrication, à intégrer dans le devis et le planning' },
    {
      type: 'p',
      text: 'Un double ou triple vitrage sur mesure demande généralement un délai de fabrication de plusieurs semaines chez le fournisseur, avant même la pose. Ce délai doit être communiqué clairement au client dès le devis, pour éviter les attentes irréalistes, surtout sur un chantier de rénovation où d’autres corps de métier attendent la pose des fenêtres pour avancer.',
    },
    {
      type: 'list',
      items: [
        'Double ou triple vitrage : le choix du niveau d’isolation fait varier fortement le prix et le délai',
        'Verre feuilleté de sécurité : obligatoire ou recommandé selon l’usage (garde-corps, zones à risque), à distinguer clairement dans le devis',
        'Verre sur mesure aux formes non standards : coût et délai généralement plus élevés qu’un format courant',
        'Films et traitements spécifiques (anti-effraction, contrôle solaire) : poste souvent facturé séparément',
      ],
    },
    {
      type: 'callout',
      title: 'Une majoration d’urgence clairement affichée évite les litiges',
      text: 'Facturer plus cher une intervention de nuit ou de week-end est normal dans ce métier, mais le client doit le savoir avant l’intervention, pas seulement le découvrir sur la facture. Une grille tarifaire claire pour les interventions urgentes protège l’entreprise comme le client.',
    },
    {
      type: 'cta',
      title: 'Deux logiques de facturation, un seul outil',
      text: 'Cantia permet de gérer aussi bien un dépannage urgent facturé rapidement qu’un devis de remplacement détaillé avec délai de fabrication intégré.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Faut-il facturer un devis pour un simple dépannage de vitre cassée ?',
      answer:
        'De nombreux vitriers facturent le dépannage directement après intervention plutôt que d’établir un devis préalable, notamment en cas d’urgence. Il reste toutefois recommandé d’indiquer une fourchette de prix au client par téléphone avant le déplacement.',
    },
    {
      question: 'Combien de temps prévoir pour la fabrication d’un vitrage sur mesure ?',
      answer:
        'Le délai varie selon le fournisseur et le type de vitrage, mais il faut généralement compter plusieurs semaines pour un double ou triple vitrage sur mesure. Ce délai doit être communiqué au client dès la signature du devis.',
    },
    {
      question: 'Le verre de sécurité feuilleté est-il obligatoire partout ?',
      answer:
        'Il est généralement requis dans certaines situations à risque, comme les garde-corps ou certaines zones de passage, selon les normes en vigueur. En cas de doute sur un cas précis, il vaut mieux vérifier auprès des normes applicables au type de bâtiment concerné.',
    },
  ],
  relatedSlugs: [
    'logiciel-devis-facture-maconnerie-suisse',
    'checklist-ouverture-chantier-artisan',
    'garantie-travaux-construction-2-ou-5-ans',
  ],
  relatedTradeSlug: 'vitrier',
};
