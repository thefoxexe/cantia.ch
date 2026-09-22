import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'prix-isolation-facade-m2-suisse',
  question: 'Combien coûte une isolation de façade au m² en Suisse ?',
  title: 'Combien coûte une isolation de façade au m² en Suisse',
  description:
    'Fourchettes CHF/m² réalistes pour une isolation de façade en Suisse selon le type de système (crépi isolant, bardage ventilé), avec le lien vers les subventions cantonales.',
  excerpt:
    'Le prix au m² d’une isolation de façade varie du simple au double selon le système choisi — et l’écart initial se rattrape souvent sur la facture de chauffage.',
  category: 'Devis & facturation',
  keywords: ['isolation', 'façade', 'prix', 'm2', 'rénovation énergétique', 'subventions'],
  publishedAt: '2026-09-25',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Isoler une façade n’est pas un chantier standard : le prix au m² dépend directement du système choisi, de l’état du support existant et de la complexité de la façade (fenêtres, balcons, ornements).',
    },
    { type: 'h2', text: '1. Deux grandes familles de systèmes, deux budgets' },
    {
      type: 'p',
      text: 'L’isolation périphérique sous crépi (type ITE avec panneaux isolants et enduit) coûte généralement entre CHF 180 et 280 par m², fourniture et pose comprises. Un bardage ventilé (façade rapportée en bois, métal ou fibrociment sur ossature) revient plus cher, souvent entre CHF 300 et 450 par m², mais offre une meilleure durabilité et davantage de choix esthétiques. Ces montants restent indicatifs : ils varient selon le canton, l’accès au chantier et la complexité de la façade.',
    },
    { type: 'h2', text: '2. Le détail par poste (exemple crépi isolant)' },
    {
      type: 'table',
      headers: ['Poste', 'Détail', 'Fourchette CHF/m²'],
      rows: [
        ['Échafaudage', 'Montage, location, démontage', '20 – 35'],
        ['Isolant', 'Panneaux (laine minérale ou polystyrène expansé), pose', '80 – 130'],
        ['Enduit de finition', 'Sous-couche, crépi, teinte', '50 – 80'],
        ['Total indicatif', 'Isolation sous crépi, façade standard', '180 – 280'],
      ],
    },
    { type: 'h2', text: '3. Le lien avec les subventions cantonales' },
    {
      type: 'p',
      text: 'La plupart des cantons proposent des subventions pour l’isolation de l’enveloppe du bâtiment, généralement via le Programme Bâtiments. Les montants et conditions varient fortement d’un canton à l’autre et évoluent régulièrement : mieux vaut orienter le client vers le service cantonal de l’énergie ou un point de contact officiel plutôt que d’annoncer un chiffre précis dans le devis. Ce qui reste constant, c’est que ces aides réduisent le coût net du projet et accélèrent souvent la décision du client.',
    },
    {
      type: 'callout',
      title: 'Le retour sur investissement se lit sur plusieurs années, pas sur la facture',
      text: 'Un client qui compare uniquement le prix au m² de deux devis passe à côté de l’essentiel : une bonne isolation de façade réduit durablement les besoins de chauffage. Présenter cet argument concrètement, même sans chiffre précis d’économie garanti, aide souvent à justifier l’écart de prix entre deux systèmes.',
    },
    {
      type: 'cta',
      title: 'Un devis d’isolation de façade qui distingue clairement chaque poste',
      text: 'Échafaudage, isolant, finition : sur Cantia, vous construisez un devis façade détaillé par m² avec vos prix catalogue, prêt à envoyer et à faire signer en ligne.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Quel est le prix moyen d’une isolation de façade au m² en Suisse ?',
      answer:
        'Pour une isolation sous crépi, comptez généralement entre CHF 180 et 280 par m², fourniture et pose comprises. Un bardage ventilé coûte plus cher, souvent entre CHF 300 et 450 par m². Ces fourchettes varient selon la région et la complexité de la façade.',
    },
    {
      question: 'Les subventions cantonales couvrent-elles une part importante du coût ?',
      answer:
        'Cela dépend fortement du canton et évolue régulièrement, généralement via le Programme Bâtiments. Il est recommandé d’orienter le client vers le service cantonal de l’énergie pour connaître les montants et conditions exacts au moment du projet.',
    },
    {
      question: 'Le bardage ventilé est-il toujours plus cher que le crépi isolant ?',
      answer:
        'Dans la plupart des cas oui, mais le bardage offre une meilleure durabilité dans le temps et davantage de possibilités esthétiques. Le choix dépend souvent autant du budget que du rendu recherché par le client.',
    },
  ],
  relatedSlugs: [
    'prix-refection-toiture-suisse',
    'calculer-prix-devis-renovation-suisse',
    'calculer-prix-de-revient-chantier-batiment',
  ],
};
