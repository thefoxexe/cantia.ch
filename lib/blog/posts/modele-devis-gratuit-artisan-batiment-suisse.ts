import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'modele-devis-gratuit-artisan-batiment-suisse',
  question: 'Où trouver un modèle de devis gratuit pour artisan du bâtiment en Suisse ?',
  title: 'Modèle de devis gratuit pour artisans du bâtiment (peintre, électricien, plombier…)',
  description:
    'Un modèle de devis gratuit à télécharger, conforme aux usages suisses (TVA, mentions obligatoires), pour tous les corps de métier du bâtiment.',
  excerpt:
    'Un devis brouillon dans un logiciel de traitement de texte fait perdre du temps et paraît souvent moins sérieux. Voici un modèle prêt à l’emploi, gratuit, à télécharger en un clic.',
  category: 'Comparatifs & outils',
  keywords: [
    'modèle de devis gratuit bâtiment',
    'modèle devis peintre électricien plombier',
    'devis vierge artisan suisse',
    'télécharger modèle devis construction',
    'exemple devis bâtiment suisse',
  ],
  publishedAt: '2026-09-20',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un devis bricolé dans un logiciel de traitement de texte, sans structure claire, donne rarement une bonne première impression. Et pourtant, beaucoup d’artisans démarrent avec exactement ça : un fichier recopié d’un ancien devis, avec des totaux calculés à la main. Voici un modèle prêt à l’emploi, gratuit, pensé pour n’importe quel corps de métier du bâtiment.',
    },
    { type: 'h2', text: 'Ce que doit contenir un devis, quel que soit le métier' },
    {
      type: 'list',
      items: [
        'Coordonnées complètes de l’entreprise, y compris le numéro IDE',
        'Coordonnées du client et adresse du chantier si différente',
        'Numéro et date du devis, avec une durée de validité clairement indiquée',
        'Description précise de chaque prestation, avec quantité et prix unitaire',
        'Sous-total hors taxe, taux et montant de TVA, total toutes taxes comprises',
        'Conditions de paiement et signature pour accord',
      ],
    },
    {
      type: 'callout',
      title: 'Le détail qui change tout',
      text: 'Un devis qui ne précise pas de durée de validité laisse la porte ouverte à une contestation de prix des mois plus tard, une fois les coûts matériaux remontés. Une simple ligne suffit à s’en protéger.',
    },
    { type: 'h2', text: 'Le modèle à télécharger' },
    {
      type: 'p',
      text: 'Ce modèle est neutre et s’adapte à n’importe quel corps de métier — peintre, électricien, plombier-sanitaire, menuisier, carreleur, plâtrier, ou tout autre artisan du bâtiment. Un fichier PDF prêt à imprimer ou à compléter, avec la structure attendue par un client suisse.',
    },
    {
      type: 'leadmagnet',
      title: 'Recevez le modèle de devis gratuit',
      text: 'Un fichier PDF, structure claire, conforme aux usages suisses. Entrez votre email pour le télécharger immédiatement.',
      buttonLabel: 'Recevoir le modèle',
      fileUrl: '/downloads/modele-devis-gratuit-batiment.pdf',
      fileLabel: 'Télécharger le modèle (PDF)',
    },
    { type: 'h2', text: 'Les limites d’un modèle statique' },
    {
      type: 'p',
      text: 'Un modèle figé règle le premier devis, pas les cinquante suivants. Recalculer chaque total à la main, retrouver le bon tarif d’une prestation déjà chiffrée le mois dernier, régénérer une TVA qui a changé de taux : ce sont les frictions qui, avec le volume, finissent par coûter plus de temps que le modèle n’en a fait gagner au départ.',
    },
    {
      type: 'stat',
      value: '0 calcul manuel',
      label: 'de TVA, de totaux ou de sous-total une fois le devis créé sur un outil qui les calcule automatiquement',
    },
    {
      type: 'cta',
      title: 'Passez du modèle statique au devis qui se remplit tout seul',
      text: 'Cantia calcule automatiquement TVA et totaux, garde en mémoire vos prix déjà utilisés dans un catalogue, et génère une QR-facture dès que le devis est accepté.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Ce modèle de devis convient-il à tous les corps de métier du bâtiment ?',
      answer:
        'Oui, la structure (coordonnées, positions, TVA, conditions) est neutre et s’adapte à n’importe quel corps de métier du bâtiment — seul le détail des prestations change d’un métier à l’autre.',
    },
    {
      question: 'Le modèle de devis inclut-il le calcul de la TVA suisse ?',
      answer:
        'Le modèle prévoit les lignes nécessaires (sous-total HT, TVA, total TTC) mais le calcul reste manuel, contrairement à un outil qui le calcule automatiquement à chaque ligne.',
    },
    {
      question: 'Quelles mentions sont obligatoires sur un devis en Suisse ?',
      answer:
        'Coordonnées de l’entreprise (idéalement avec numéro IDE), coordonnées du client, description précise des prestations, prix et TVA, ainsi qu’une durée de validité de l’offre.',
    },
  ],
  relatedSlugs: [
    'calculer-prix-devis-renovation-suisse',
    'rediger-devis-qui-inspire-confiance-client',
    'mentions-obligatoires-facture-suisse-tva',
    'demarrer-entreprise-batiment-outils-indispensables',
  ],
};
