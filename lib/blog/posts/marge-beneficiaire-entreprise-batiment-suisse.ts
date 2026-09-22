import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'marge-beneficiaire-entreprise-batiment-suisse',
  question: 'Quelle marge bénéficiaire viser pour une entreprise du bâtiment en Suisse ?',
  title: 'Quelle marge bénéficiaire viser dans le bâtiment en Suisse',
  description:
    'Marge brute, marge nette, fourchettes réalistes selon le corps de métier, et pourquoi une marge trop basse peut tuer une entreprise malgré un carnet de commandes plein.',
  excerpt:
    'Une entreprise qui enchaîne les chantiers sans jamais respirer financièrement n’a pas un problème de charge de travail : elle a un problème de marge.',
  category: 'Chantier & rentabilité',
  keywords: ['marge', 'rentabilité', 'entreprise', 'bâtiment', 'marge brute', 'marge nette'],
  publishedAt: '2026-09-26',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'Beaucoup d’entreprises du bâtiment confondent être occupé et être rentable. On peut avoir un agenda plein toute l’année et pourtant dégager une marge trop faible pour survivre à un imprévu.',
    },
    { type: 'h2', text: '1. Marge brute et marge nette ne racontent pas la même histoire' },
    {
      type: 'p',
      text: 'La marge brute correspond à la différence entre le prix de vente d’un chantier et le coût direct des matériaux et de la main-d’œuvre qui y sont affectés. La marge nette, elle, tient compte en plus de toutes les charges de structure de l’entreprise (locaux, véhicules, administratif, assurances, comptabilité). Une entreprise peut afficher une marge brute confortable sur chaque chantier et terminer l’année dans le rouge si ses frais fixes ne sont pas correctement répercutés dans les prix.',
    },
    { type: 'h2', text: '2. Des fourchettes indicatives selon le corps de métier' },
    {
      type: 'p',
      text: 'Les fourchettes varient sensiblement selon le corps de métier, le niveau de concurrence local et la taille de l’entreprise. À titre indicatif, une marge nette confortable dans le bâtiment se situe généralement entre 8 et 15 % du chiffre d’affaires, avec des écarts importants entre le gros œuvre, souvent plus serré, et certains métiers de finition ou de second œuvre, qui peuvent viser plus haut. Ces chiffres ne remplacent pas un calcul propre à votre structure, mais donnent un ordre de grandeur pour se situer.',
    },
    { type: 'h2', text: '3. Pourquoi une marge trop basse est dangereuse même avec beaucoup de travail' },
    {
      type: 'p',
      text: 'Une marge insuffisante ne se voit pas forcément dans la trésorerie du mois : elle se voit au premier imprévu sérieux — un chantier qui déborde, un impayé, une panne de véhicule, une hausse du prix des matériaux non répercutée. Sans coussin de marge, ces aléas ne sont pas absorbés, ils se transforment directement en perte. C’est pourquoi suivre la rentabilité chantier par chantier, et pas seulement le chiffre d’affaires global, est essentiel pour repérer les projets qui grignotent la marge des autres.',
    },
    {
      type: 'callout',
      title: 'Le signal d’alarme le plus fiable',
      text: 'Si vous ne pouvez pas dire, chantier par chantier, quelle marge vous avez réellement dégagée, c’est probablement le signe que votre marge globale est en train de fondre sans que vous le voyiez venir. La marge se pilote chantier par chantier, pas seulement au bilan annuel.',
    },
    {
      type: 'cta',
      title: 'Voir la marge de chaque chantier, pas seulement celle de l’année',
      text: 'Cantia calcule automatiquement la rentabilité de chaque chantier en comparant les heures et le matériel réellement engagés au devis initial, pour repérer les dérapages avant la clôture du dossier.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Quelle est la différence entre marge brute et marge nette ?',
      answer:
        'La marge brute ne déduit que les coûts directs d’un chantier (matériaux, main-d’œuvre affectée). La marge nette déduit en plus toutes les charges de structure de l’entreprise. Une entreprise peut avoir une bonne marge brute chantier par chantier et une marge nette insuffisante si ses frais fixes sont mal répercutés.',
    },
    {
      question: 'Quelle marge nette viser dans le bâtiment en Suisse ?',
      answer:
        'Il n’existe pas de chiffre universel, mais une marge nette confortable se situe généralement entre 8 et 15 % du chiffre d’affaires selon le corps de métier et la taille de l’entreprise. Ces repères doivent être ajustés à votre structure de coûts réelle.',
    },
    {
      question: 'Pourquoi une entreprise très occupée peut-elle quand même perdre de l’argent ?',
      answer:
        'Parce qu’être occupé ne veut pas dire être rentable : si les prix pratiqués ne couvrent pas correctement les coûts réels et les charges de structure, plus l’entreprise travaille, plus elle accumule de la perte sur chaque chantier mal chiffré.',
    },
  ],
  relatedSlugs: [
    'chantier-complet-peut-etre-en-perte-taux-horaire',
    'calculer-prix-de-revient-chantier-batiment',
    'fixer-prix-artisan-sans-brader-concurrence-suisse',
  ],
};
