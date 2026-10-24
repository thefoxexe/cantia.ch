import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'rabais-escompte-tva-ordre-soumission',
  question: 'Dans quel ordre appliquer rabais, escompte et TVA sur une soumission ?',
  title: 'Rabais, escompte, TVA : dans quel ordre sur le récapitulatif d’une soumission ?',
  description:
    'Rabais et escompte ne sont pas la même chose, et l’ordre du calcul change le total. Exemple chiffré du récapitulatif d’une soumission suisse, de la somme brute au total TTC.',
  excerpt:
    'Deux entreprises offrent le même rabais et la même escompte, mais n’arrivent pas au même total. L’une des deux s’est trompée d’ordre.',
  category: 'Devis & facturation',
  keywords: ['rabais escompte soumission', 'escompte 2%', 'récapitulatif soumission', 'tva soumission', 'total offre bâtiment'],
  publishedAt: '2026-10-24',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Au bas d’une soumission, le récapitulatif additionne les chapitres puis applique des déductions et la TVA. Les deux déductions les plus courantes, le rabais et l’escompte, n’ont pas le même rôle, et le document indique généralement dans quel ordre les appliquer.',
    },
    { type: 'h2', text: 'Rabais et escompte, deux choses différentes' },
    {
      type: 'list',
      items: [
        'Le rabais réduit le prix de l’offre, sans condition : c’est un geste commercial, souvent pour gagner le marché.',
        'L’escompte est une réduction accordée si le client paie dans un délai court (par exemple 2 % à 30 jours). Il ne s’applique que si la condition est remplie.',
      ],
    },
    { type: 'h2', text: 'L’ordre le plus courant' },
    {
      type: 'table',
      headers: ['Ligne', 'Calcul', 'CHF'],
      rows: [
        ['Total brut des chapitres', '', '100 000.00'],
        ['Rabais 3 %', '100 000 × 3 %', '− 3 000.00'],
        ['Total après rabais', '', '97 000.00'],
        ['Escompte 2 %', '97 000 × 2 %', '− 1 940.00'],
        ['Total net hors TVA', '', '95 060.00'],
        ['TVA 8,1 %', '95 060 × 8,1 %', '7 699.86'],
        ['Total TTC', '', '102 759.86'],
      ],
    },
    {
      type: 'callout',
      title: 'Toujours suivre le document',
      text: 'Certaines soumissions placent l’escompte après la TVA, d’autres demandent un total net sans escompte. Le récapitulatif du document fait foi : remplissez les lignes qu’il prévoit, dans son ordre, plutôt que votre présentation habituelle.',
    },
    { type: 'h2', text: 'Les erreurs fréquentes' },
    {
      type: 'list',
      items: [
        'Additionner rabais et escompte (5 % sur le brut) au lieu de les appliquer l’un après l’autre : la différence est faible, mais le total ne correspond plus à celui de l’architecte.',
        'Appliquer la TVA sur le brut puis déduire les remises.',
        'Oublier qu’un rabais affiché sur le récapitulatif s’ajoute à des prix unitaires déjà serrés.',
      ],
    },
    {
      type: 'p',
      text: 'Le taux normal de TVA en Suisse est de 8,1 % depuis 2024. Une entreprise non assujettie n’ajoute pas de TVA et doit l’indiquer clairement.',
    },
    { type: 'h2', text: 'Avec Cantia (bêta)' },
    {
      type: 'p',
      text: 'Quand vous remplissez une soumission dans Cantia, le rabais, l’escompte et la TVA se règlent sur le récapitulatif ; les totaux sont recalculés et écrits à leur place dans le PDF d’origine. Fonction en bêta, dès le plan Équipe (3 soumissions par mois), illimitée avec Entreprise.',
    },
    {
      type: 'cta',
      title: 'Un récapitulatif juste, sans calculatrice',
      text: 'Importez la soumission, mettez vos prix et vos remises : Cantia calcule et remplit le PDF.',
      buttonLabel: 'Essayer Cantia',
    },
  ],
  faq: [
    {
      question: 'La TVA se calcule-t-elle avant ou après l’escompte ?',
      answer:
        'Le plus souvent après les remises, sur le montant net. Mais le récapitulatif de la soumission prévaut : suivez l’ordre qu’il indique.',
    },
    {
      question: 'Faut-il accorder un escompte sur une soumission ?',
      answer: 'Ce n’est pas une obligation. Certaines soumissions prévoient la ligne et vous laissent fixer le taux, d’autres l’imposent. Un escompte n’a de sens que si vous tenez à être payé vite.',
    },
    {
      question: 'Quel taux de TVA appliquer sur des travaux de construction ?',
      answer: 'En règle générale le taux normal de 8,1 %. Une entreprise non assujettie à la TVA n’en facture pas.',
    },
  ],
  relatedSlugs: ['remplir-soumission-pdf-architecte', 'erreurs-soumission-qui-coutent-le-marche', 'calculer-prix-unitaire-soumission'],
};
