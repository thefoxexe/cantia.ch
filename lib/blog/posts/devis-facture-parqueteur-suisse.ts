import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-facture-parqueteur-suisse',
  question: 'Comment établir devis et factures en tant que parqueteur en Suisse ?',
  title: 'Devis et facturation pour un parqueteur en Suisse',
  description:
    'Chiffrage au m² selon le type de pose et l’essence, délai d’acclimatation du bois, ponçage et vitrification : comment établir devis et factures en tant que parqueteur en Suisse.',
  excerpt:
    'Le prix d’un parquet varie fortement selon la pose et l’essence choisie, mais le facteur le plus souvent oublié au devis reste le délai d’acclimatation du bois avant chantier.',
  category: 'Métiers du bâtiment',
  keywords: ['devis parqueteur suisse', 'facturation pose parquet', 'prix parquet m2 suisse'],
  publishedAt: '2026-10-11',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Le chiffrage d’un chantier de parquet repose au premier abord sur une simple surface au m², mais le prix final dépend fortement du type de pose choisi, de l’essence de bois, et d’un facteur souvent négligé dans le planning annoncé au client : le délai d’acclimatation du bois avant la pose.',
    },
    { type: 'h2', text: 'Un prix au m² qui varie selon la pose et l’essence' },
    {
      type: 'table',
      headers: ['Type de pose', 'Caractéristique', 'Niveau de prix'],
      rows: [
        ['Pose flottante', 'Sans colle ni clous, la plus rapide à poser', 'Généralement le plus accessible'],
        ['Pose collée', 'Meilleure stabilité, adaptée au chauffage au sol', 'Intermédiaire à élevé'],
        ['Pose clouée', 'Réservée au parquet massif sur lambourdes', 'Généralement la plus coûteuse en main-d’œuvre'],
      ],
    },
    {
      type: 'p',
      text: 'À cela s’ajoute l’essence choisie : un parquet en bois exotique ou en essence rare coûte nettement plus cher qu’un parquet en chêne ou en hêtre standard. Le devis doit clairement séparer le coût de la fourniture, souvent très variable, du coût de la pose elle-même.',
    },
    { type: 'h2', text: 'Le délai d’acclimatation, à intégrer dans le planning' },
    {
      type: 'p',
      text: 'Le bois doit généralement s’acclimater plusieurs jours dans la pièce où il sera posé, pour s’adapter au taux d’humidité et à la température du lieu avant la pose. Ignorer cette étape ou la sous-estimer dans le planning expose à des problèmes ultérieurs : gonflement, tuilage ou apparition de jours entre les lames après quelques semaines. Ce délai doit figurer explicitement dans le calendrier communiqué au client, pas seulement dans l’organisation interne de l’entreprise.',
    },
    { type: 'h2', text: 'Ponçage et vitrification : une prestation à facturer séparément' },
    {
      type: 'list',
      items: [
        'Ponçage d’un parquet existant : prestation distincte de la pose neuve, à chiffrer selon l’état du support',
        'Vitrification ou huilage : le choix de finition change le prix et la durée d’intervention',
        'Réparation ponctuelle de lames : souvent facturée à la lame ou en forfait selon l’étendue des dégâts',
        'Ces prestations sont fréquemment demandées seules, sans pose neuve associée, et méritent un devis à part entière',
      ],
    },
    {
      type: 'callout',
      title: 'Un parquet posé trop tôt après livraison est un risque que le client ne voit pas',
      text: 'Le client presse souvent pour accélérer le planning, mais poser un parquet sans délai d’acclimatation suffisant peut provoquer des désordres visibles seulement après plusieurs semaines. Expliquer ce délai dès le devis protège l’entreprise en cas de réclamation ultérieure.',
    },
    {
      type: 'cta',
      title: 'Un devis qui distingue fourniture, pose et finition',
      text: 'Cantia permet de détailler un devis de parquet poste par poste, avec le planning d’acclimatation intégré au calendrier du chantier.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Combien de temps faut-il pour l’acclimatation du bois avant la pose ?',
      answer:
        'Le délai varie selon l’essence, le taux d’humidité de la pièce et le type de bois, mais il faut généralement compter plusieurs jours. Le fournisseur du parquet donne généralement une recommandation précise selon le produit livré.',
    },
    {
      question: 'Le ponçage d’un parquet ancien peut-il être facturé au même tarif que la pose neuve ?',
      answer:
        'Non, ce sont deux prestations différentes avec des logiques de prix distinctes. Le ponçage dépend surtout de l’état du support existant et du nombre de passages nécessaires, alors que la pose neuve dépend de la surface et du type de pose choisi.',
    },
    {
      question: 'Un parquet flottant est-il toujours moins cher qu’un parquet collé ?',
      answer:
        'Généralement oui en termes de main-d’œuvre, mais pas systématiquement en fourniture : certains parquets flottants haut de gamme peuvent coûter plus cher que des parquets collés d’entrée de gamme. Le devis doit distinguer clairement les deux postes.',
    },
  ],
  relatedSlugs: [
    'logiciel-devis-facture-maconnerie-suisse',
    'checklist-cloture-chantier-avant-facturation',
    'garantie-travaux-construction-2-ou-5-ans',
  ],
  relatedTradeSlug: 'parqueteur',
};
