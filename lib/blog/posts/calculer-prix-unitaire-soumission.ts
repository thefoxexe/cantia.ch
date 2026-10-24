import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'calculer-prix-unitaire-soumission',
  question: 'Comment calculer un prix unitaire juste pour une soumission ?',
  title: 'Calculer un prix unitaire de soumission : la méthode position par position',
  description:
    'Main-d’œuvre, matériaux, machines, frais généraux, risques et marge : comment construire un prix unitaire défendable pour chaque position d’une soumission suisse.',
  excerpt:
    'Le prix unitaire d’une position n’est pas « ce qu’on mettait l’an dernier ». C’est un calcul, et il se refait chantier par chantier.',
  category: 'Chantier & rentabilité',
  keywords: ['prix unitaire soumission', 'calcul prix unitaire bâtiment', 'chiffrer soumission', 'frais généraux entreprise bâtiment', 'marge soumission'],
  publishedAt: '2026-10-24',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'Dans une soumission, chaque position attend un prix unitaire : par m², m³, mètre, pièce ou forfait. Multiplié par la quantité de l’architecte, il donne le montant. Si le prix unitaire est trop bas, vous gagnez le marché et perdez de l’argent à chaque mètre posé. S’il est trop haut, vous perdez le marché. Voici comment le construire.',
    },
    { type: 'h2', text: 'Les briques d’un prix unitaire' },
    {
      type: 'list',
      items: [
        'Main-d’œuvre : temps nécessaire par unité × coût horaire complet (salaire, charges sociales, vacances, jours fériés, temps non productif).',
        'Matériaux : quantité par unité × prix d’achat, plus les pertes et chutes.',
        'Machines et outillage : location ou coût d’usage rapporté à l’unité.',
        'Frais généraux : bureau, véhicules, assurances, administration, répartis sur les heures productives.',
        'Risques et imprévus : accès difficile, météo, délais serrés, conditions particulières.',
        'Marge : ce qui reste pour l’entreprise une fois tout payé.',
      ],
    },
    { type: 'h2', text: 'Un exemple chiffré' },
    {
      type: 'p',
      text: 'Pour un mur en briques de 15 cm au m², avec un rendement de 0,9 heure par m² et un coût horaire complet de CHF 78.– :',
    },
    {
      type: 'table',
      headers: ['Élément', 'Calcul', 'CHF / m²'],
      rows: [
        ['Main-d’œuvre', '0,9 h × 78.–', '70.20'],
        ['Matériaux', 'Briques, mortier, 5 % de pertes', '38.50'],
        ['Machines', 'Échafaudage, malaxeur, rapporté au m²', '4.80'],
        ['Sous-total des coûts directs', '', '113.50'],
        ['Frais généraux 12 %', '113.50 × 12 %', '13.62'],
        ['Marge 8 %', '127.12 × 8 %', '10.17'],
        ['Prix unitaire', '', '137.29'],
      ],
    },
    {
      type: 'callout',
      title: 'Les chiffres de l’exemple sont des hypothèses',
      text: 'Rendements, coût horaire et taux de frais généraux varient fortement selon l’entreprise et la région. Ce qui compte, c’est la méthode : chacun de vos prix doit pouvoir se décomposer ainsi.',
    },
    { type: 'h2', text: 'Votre coût horaire complet, le chiffre clé' },
    {
      type: 'p',
      text: 'La plupart des prix trop bas viennent d’un coût horaire sous-estimé : on part du salaire brut et on oublie les charges, les vacances, les jours de pluie, les trajets. Notre calculateur de taux horaire vous donne ce chiffre à partir de vos vraies données.',
    },
    { type: 'h2', text: 'Réutiliser ses prix d’une soumission à l’autre' },
    {
      type: 'p',
      text: 'Une même position revient d’un chantier à l’autre, avec le même numéro quand la soumission suit le CAN. Garder un catalogue de vos prix par numéro de position, et l’historique de ce que vous avez offert, fait gagner des heures et rend vos offres cohérentes.',
    },
    {
      type: 'p',
      text: 'Dans Cantia, quand vous remplissez une soumission importée, vos prix de catalogue et ceux de vos soumissions précédentes sont proposés pour chaque position. Vous ajustez au chantier, et le PDF d’origine ressort rempli. Fonction en bêta, dès le plan Équipe (3 soumissions par mois), illimitée avec Entreprise.',
    },
    {
      type: 'cta',
      title: 'Vos prix, proposés à chaque position',
      text: 'Importez la soumission reçue et chiffrez avec votre catalogue et votre historique.',
      buttonLabel: 'Essayer Cantia',
    },
  ],
  faq: [
    {
      question: 'Quel taux de frais généraux appliquer ?',
      answer:
        'Il se calcule à partir de vos comptes : total des frais qui ne sont pas liés à un chantier précis, divisé par le volume de travail productif. Il n’existe pas de taux universel ; reprenez-le chaque année avec votre bouclement.',
    },
    {
      question: 'Faut-il intégrer les installations de chantier dans les prix unitaires ?',
      answer:
        'Seulement si la soumission ne prévoit pas de positions dédiées. Quand des positions d’installation de chantier existent, chiffrez-les là, sinon vous les payez deux fois ou pas du tout.',
    },
    {
      question: 'Comment savoir si un prix unitaire était juste ?',
      answer: 'En comparant après coup les heures et le matériel réellement consommés au calcul de départ. Le suivi de rentabilité par chantier sert exactement à ça.',
    },
  ],
  relatedSlugs: ['remplir-soumission-pdf-architecte', 'chantier-complet-peut-etre-en-perte-taux-horaire', 'suivre-rentabilite-chantier-sans-excel'],
  relatedTradeSlug: 'macon',
};
