import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'assurance-rc-professionnelle-batiment-obligatoire',
  question: 'L’assurance responsabilité civile professionnelle est-elle obligatoire dans le bâtiment en Suisse ?',
  title: 'RC professionnelle dans le bâtiment : obligatoire ou pas en Suisse ?',
  description:
    'Aucune loi fédérale unique n’impose la RC professionnelle à tout artisan — mais plusieurs cantons et donneurs d’ordre l’exigent de fait pour certains métiers. Le point clair.',
  excerpt:
    'Il n’existe pas de loi fédérale unique imposant la RC pro à tout artisan. Ce qui l’impose en pratique, c’est souvent le canton, le donneur d’ordre — ou un sinistre qu’on découvre trop tard n’être pas couvert.',
  category: 'Juridique & normes',
  keywords: ['rc professionnelle', 'assurance bâtiment', 'responsabilité civile', 'assurance obligatoire', 'artisan suisse'],
  publishedAt: '2026-03-12',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: '« C’est obligatoire, non ? » — la réponse honnête est qu’il n’existe pas une seule loi fédérale imposant la RC professionnelle à tout artisan du bâtiment. Ce qui la rend obligatoire en pratique varie selon le canton, le métier exact, et souvent le maître d’ouvrage lui-même.',
    },
    { type: 'h2', text: 'Ce que la RC professionnelle couvre réellement' },
    {
      type: 'p',
      text: 'Les dommages causés à des tiers dans l’exercice de l’activité professionnelle — corporels, matériels, immatériels — ainsi que les frais de défense en cas de procédure. Un dégât des eaux causé par une erreur de pose, un échafaudage qui endommage la propriété voisine, une erreur de calcul qui compromet la structure : c’est exactement le type de sinistre que cette assurance couvre, et que la garantie décennale du chantier ne couvre pas de la même façon.',
    },
    {
      type: 'callout',
      title: 'Où elle devient obligatoire de fait',
      text: 'Plusieurs cantons l’imposent explicitement pour certains métiers réglementés du bâtiment. Architectes et ingénieurs y sont pratiquement toujours tenus. Et même sans obligation légale directe, un maître d’œuvre, une régie ou un appel d’offres public l’exige presque systématiquement comme condition d’admission — ce qui la rend obligatoire dans les faits, même sans texte de loi qui la nomme.',
    },
    { type: 'h2', text: 'Le risque de na pas en avoir' },
    {
      type: 'list',
      items: [
        'Un sinistre important sans couverture engage le patrimoine personnel de l’entreprise individuelle, pas seulement sa trésorerie',
        'Un maître d’œuvre exigeant une attestation d’assurance peut refuser une soumission sans elle, avant même d’étudier le prix',
        'Certains fournisseurs ou banques la demandent aussi lors de l’ouverture d’un compte professionnel ou d’une ligne de crédit',
      ],
    },
    { type: 'h2', text: 'Vérifier avant de signer, pas après un sinistre' },
    {
      type: 'p',
      text: 'Le réflexe le plus utile n’est pas de se demander « suis-je obligé ? » mais « qu’est-ce que je risque réellement si ce n’est pas couvert ? ». Sur un métier à risque physique (échafaudage, toiture, terrassement), la réponse penche presque toujours vers une souscription — obligatoire ou non sur le papier.',
    },
    {
      type: 'cta',
      title: 'Piloter le chantier, pas gérer la paperasse d’assurance',
      text: 'Cantia centralise devis, factures et sous-traitants par chantier — pour se concentrer sur le travail plutôt que sur la recherche du bon document au mauvais moment.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'La RC professionnelle est-elle obligatoire pour tout artisan suisse ?',
      answer:
        'Non, il n’existe pas de loi fédérale unique l’imposant à tous les métiers du bâtiment — mais plusieurs cantons l’exigent pour certains métiers réglementés, et de nombreux donneurs d’ordre la demandent systématiquement.',
    },
    {
      question: 'La RC professionnelle remplace-t-elle la garantie décennale d’un chantier ?',
      answer:
        'Non, ce sont deux mécanismes différents : la garantie légale (art. 371 CO) couvre les défauts de l’ouvrage lui-même, la RC professionnelle couvre les dommages causés à des tiers pendant l’exécution des travaux.',
    },
    {
      question: 'Que risque une entreprise sans RC professionnelle en cas de sinistre important ?',
      answer:
        'Le patrimoine de l’entreprise, voire personnel pour une entreprise individuelle, peut être directement engagé pour couvrir les dommages — sans assurance intermédiaire pour absorber le coût.',
    },
  ],
  relatedSlugs: [
    'defaut-construction-decouvert-apres-reception-qui-paie',
    'sous-traitant-batiment-suisse-contrat-facturation',
    'garantie-travaux-construction-2-ou-5-ans',
  ],
};
