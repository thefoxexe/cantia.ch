import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'logiciel-remplir-soumission-excel-papier',
  question: 'Papier, Excel ou logiciel : comment remplir ses soumissions ?',
  title: 'Papier, Excel ou logiciel : la bonne façon de remplir ses soumissions en 2026',
  description:
    'Comparatif concret des trois façons de répondre aux soumissions dans une PME du bâtiment suisse : temps passé, risques d’erreur, réutilisation des prix et document rendu.',
  excerpt:
    'Les grandes entreprises ont des logiciels de devis à plusieurs milliers de francs. Les petites remplissent au stylo. Il existe maintenant un entre-deux.',
  category: 'Comparatifs & outils',
  keywords: ['logiciel soumission', 'remplir soumission excel', 'logiciel devis bâtiment suisse', 'soumission pdf', 'outil chiffrage soumission'],
  publishedAt: '2026-10-24',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Dans une PME du bâtiment, les soumissions arrivent par e-mail, en PDF, à toutes les périodes de l’année. Selon la taille de l’entreprise, on les remplit au stylo, dans Excel, ou dans un logiciel de calculation spécialisé. Chaque méthode a sa logique ; voici comment les comparer honnêtement.',
    },
    { type: 'h2', text: 'Le comparatif' },
    {
      type: 'table',
      headers: ['', 'Papier', 'Excel', 'Logiciel de calculation', 'Import du PDF (Cantia, bêta)'],
      rows: [
        ['Saisie des positions', 'Aucune', 'Tout recopier', 'Import de fichiers structurés', 'Reprises du PDF reçu'],
        ['Calculs et reports', 'À la main', 'Automatiques', 'Automatiques', 'Automatiques'],
        ['Réutilisation des prix', 'Mémoire', 'Copier-coller', 'Bibliothèque de prix', 'Catalogue et historique proposés'],
        ['Document rendu', 'PDF scanné', 'Tableau à part ou recopie', 'Formulaire exporté', 'PDF d’origine rempli'],
        ['Coût et prise en main', 'Nul', 'Faible', 'Élevé, formation', '1 à l’essai avec Essentiel, puis dès Équipe'],
      ],
    },
    { type: 'h2', text: 'Quand le papier suffit' },
    {
      type: 'p',
      text: 'Pour une soumission de deux pages par an, le papier reste raisonnable. Dès que les documents dépassent une dizaine de pages ou que vous répondez chaque mois, le temps de calcul et le risque d’erreur de report deviennent coûteux.',
    },
    { type: 'h2', text: 'Les limites d’Excel' },
    {
      type: 'p',
      text: 'Excel calcule juste, mais il faut d’abord recopier chaque position, avec le risque d’en sauter une ou de se tromper d’unité. Et à la fin, l’architecte attend souvent son propre document rempli, pas votre tableau.',
    },
    { type: 'h2', text: 'Les logiciels de calculation' },
    {
      type: 'p',
      text: 'Les logiciels spécialisés du marché suisse gèrent les échanges de fichiers de soumission structurés et des bibliothèques de prix complètes. Ils sont puissants, mais souvent pensés pour des entreprises qui ont une personne dédiée à la calculation, avec le coût et la formation qui vont avec.',
    },
    { type: 'h2', text: 'L’entre-deux : partir du PDF reçu' },
    {
      type: 'p',
      text: 'La fonction « Remplir une soumission » de Cantia, en bêta, part du document que vous recevez vraiment : le PDF. Les positions, unités et quantités sont reprises, même d’un scan, avec un écran de vérification. Vous mettez vos prix au clavier, vos prix habituels sont proposés, et le PDF d’origine ressort rempli avec prix unitaires, montants, reports et totaux. 1 soumission d’essai avec le plan Essentiel, 3 par mois avec Équipe, illimitée avec le plan Entreprise.',
    },
    {
      type: 'callout',
      title: 'Ce que la fonction ne fait pas',
      text: 'Elle ne rédige pas de soumissions vierges et ne remplace pas un logiciel de calculation complet pour une grande entreprise. Elle sert à répondre vite et proprement aux soumissions que vous recevez.',
    },
    {
      type: 'cta',
      title: 'Essayez sur votre prochaine soumission',
      text: '14 jours d’essai, sans engagement : importez le PDF reçu et voyez le résultat.',
      buttonLabel: 'Essayer Cantia',
    },
  ],
  faq: [
    {
      question: 'Faut-il un logiciel spécial pour répondre aux soumissions en Suisse ?',
      answer: 'Non. Beaucoup de petites entreprises les remplissent à la main ou dans Excel. Un outil fait surtout gagner du temps et supprime les erreurs de calcul et de report.',
    },
    {
      question: 'Cantia lit-il les fichiers de soumission CRBX ou SIA 451 ?',
      answer: 'Pas encore : l’import porte aujourd’hui sur les soumissions en PDF, CAN ou non. C’est le format que la plupart des petites entreprises reçoivent.',
    },
    {
      question: 'Combien de soumissions peut-on remplir avec Cantia ?',
      answer: 'Une à l’essai avec le plan Essentiel, 3 par mois avec le plan Équipe, sans limite avec le plan Entreprise.',
    },
  ],
  relatedSlugs: ['remplir-soumission-pdf-architecte', 'bexio-vs-cantia-logiciel-batiment', 'temps-repondre-soumission-rentable'],
};
