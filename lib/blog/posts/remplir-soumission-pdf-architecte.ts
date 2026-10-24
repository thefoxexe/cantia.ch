import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'remplir-soumission-pdf-architecte',
  question: 'Comment remplir une soumission PDF reçue de l’architecte sans tout recopier ?',
  title: 'Remplir une soumission PDF reçue de l’architecte, sans tout recopier',
  description:
    'L’architecte envoie un PDF de 40 pages et attend vos prix dedans. Méthode pour chiffrer vite, éviter les erreurs de report et renvoyer le document attendu.',
  excerpt:
    'Imprimer, écrire les prix au stylo, recalculer à la main, scanner : beaucoup d’entreprises remplissent encore leurs soumissions comme il y a vingt ans. Il y a plus simple.',
  category: 'Devis & facturation',
  keywords: ['remplir soumission pdf', 'soumission architecte', 'chiffrer une soumission', 'soumission bâtiment suisse', 'prix unitaire soumission'],
  publishedAt: '2026-10-24',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Vendredi, 16 heures : l’architecte envoie la soumission du lot maçonnerie, 38 pages en PDF, rendu dans dix jours. Vous savez déjà comment ça va finir : une soirée à imprimer, écrire les prix au stylo, multiplier les quantités à la calculatrice, reporter les sous-totaux de page en page, puis scanner le tout. Et la peur d’une erreur de report sur la page 22.',
    },
    { type: 'h2', text: 'Ce que l’architecte attend vraiment' },
    {
      type: 'p',
      text: 'Une soumission n’est pas un devis libre. Le maître d’ouvrage veut comparer plusieurs entreprises sur la même base : mêmes positions, mêmes quantités, même ordre. Votre travail consiste à remplir le prix unitaire de chaque position, à calculer les montants et à rendre le document dans sa forme d’origine. Réécrire l’offre dans votre propre modèle de devis complique la comparaison et peut, sur un marché public, faire écarter l’offre.',
    },
    {
      type: 'list',
      items: [
        'Les quantités sont celles du document : vous ne les modifiez pas, sauf quand une position vous demande de les indiquer.',
        'Chaque position reçoit un prix unitaire et un montant (quantité × prix).',
        'Les sous-totaux de page sont reportés à la page suivante, puis récapitulés par chapitre.',
        'Le récapitulatif final applique rabais, escompte et TVA dans l’ordre prévu par le document.',
        'Le document est daté, signé et rendu dans le délai, avec les annexes demandées.',
      ],
    },
    { type: 'h2', text: 'Les trois méthodes, et leurs limites' },
    {
      type: 'table',
      headers: ['Méthode', 'Ce qui va bien', 'Ce qui coince'],
      rows: [
        ['Papier et stylo', 'Aucun outil à apprendre', 'Calculs et reports à la main, illisible au scan, aucune réutilisation des prix'],
        ['Recopier dans Excel', 'Les calculs sont justes', 'Des heures de saisie, risque de sauter une position, le PDF d’origine reste vide'],
        ['Importer le PDF dans un outil', 'Positions reprises, prix seuls à saisir, PDF d’origine rempli', 'Une vérification reste nécessaire, surtout sur les scans'],
      ],
    },
    { type: 'h2', text: 'Une méthode qui tient en trois étapes' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Lire la soumission en entier avant de chiffrer : conditions particulières, délais, positions à compléter, variantes admises.',
        'Chiffrer position par position, en partant de vos prix habituels (catalogue, soumissions précédentes) et en ajustant au chantier.',
        'Contrôler le récapitulatif : nombre de positions remplies, reports de page, rabais, escompte, TVA, total. Puis rendre le document original complété.',
      ],
    },
    {
      type: 'callout',
      title: 'Le piège le plus fréquent',
      text: 'Une position laissée vide. Sur une comparaison d’offres, elle est soit considérée comme gratuite, soit comme une offre incomplète. Avant d’envoyer, comptez les positions sans prix : il doit y en avoir zéro, ou une explication écrite pour chacune.',
    },
    { type: 'h2', text: 'Ce que fait Cantia (bêta)' },
    {
      type: 'p',
      text: 'Dans Cantia, vous importez la soumission PDF telle que vous l’avez reçue, CAN ou non, même scannée. Les chapitres, positions, unités et quantités sont repris ; un écran de vérification vous montre ce qui a été lu. Vous saisissez ensuite les prix au clavier, avec vos prix habituels proposés, et Cantia écrit les prix unitaires, montants, reports et totaux dans le PDF d’origine. La fonction est en bêta, dès le plan Équipe (3 soumissions par mois) et illimitée avec le plan Entreprise.',
    },
    {
      type: 'cta',
      title: 'Remplissez votre prochaine soumission avec vos prix',
      text: 'Importez le PDF reçu, mettez vos prix, renvoyez le document d’origine rempli. 14 jours d’essai, sans engagement.',
      buttonLabel: 'Essayer Cantia',
    },
  ],
  faq: [
    {
      question: 'Peut-on modifier les quantités d’une soumission ?',
      answer:
        'En principe non : les quantités servent à comparer les offres. Si une quantité vous paraît fausse, signalez-le par écrit à l’architecte ou proposez une remarque, sans modifier la ligne. Certaines positions demandent en revanche d’indiquer la quantité : celles-là se remplissent.',
    },
    {
      question: 'Faut-il rendre la soumission dans son format d’origine ?',
      answer:
        'Le plus souvent oui, c’est ce que demande l’architecte ou l’adjudicateur. Un tableau à part ou un devis dans votre propre format complique la comparaison et peut, sur un marché public, rendre l’offre non conforme.',
    },
    {
      question: 'Cantia crée-t-il des soumissions vierges ?',
      answer: 'Non. La fonction sert à répondre aux soumissions que vous recevez : vous importez le PDF, mettez vos prix et récupérez le PDF rempli.',
    },
  ],
  relatedSlugs: ['repondre-appel-offres-public-batiment-etapes', 'erreurs-soumission-qui-coutent-le-marche', 'calculer-prix-unitaire-soumission'],
  relatedTradeSlug: 'macon',
};
