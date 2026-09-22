import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'reemploi-materiaux-economie-circulaire-batiment',
  question: 'Comment fonctionne le réemploi de matériaux dans le bâtiment en Suisse ?',
  title: 'Réemploi de matériaux : l’économie circulaire dans le bâtiment suisse',
  description:
    'Récupérer et réutiliser des matériaux de démolition plutôt que les jeter : le réemploi progresse dans le bâtiment suisse. Voici comment ça fonctionne concrètement, et ses vraies limites.',
  excerpt:
    'Une porte en bon état, un parquet massif, une structure métallique : de plus en plus de chantiers récupèrent ce qu’un autre vient de démonter, plutôt que de tout envoyer à la benne.',
  category: 'Juridique & normes',
  keywords: ['réemploi matériaux bâtiment', 'économie circulaire construction suisse', 'récupération matériaux chantier'],
  publishedAt: '2026-10-08',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Le réemploi de matériaux gagne du terrain dans le bâtiment suisse, porté à la fois par la hausse du coût d’évacuation des déchets et par une demande croissante de maîtres d’ouvrage sensibles à l’impact environnemental de leurs projets. L’idée n’est pas nouvelle — récupérer ce qui peut resservir a toujours existé — mais elle devient plus organisée et plus fréquente sur des chantiers courants, pas seulement sur des projets militants.',
    },
    { type: 'h2', text: 'Ce qui se réemploie le plus facilement' },
    {
      type: 'p',
      text: 'Certains éléments se prêtent naturellement au réemploi parce qu’ils sont démontables sans destruction et faciles à contrôler avant réinstallation.',
    },
    {
      type: 'list',
      items: [
        'Les portes et fenêtres en bon état, souvent revendues ou réinstallées telles quelles',
        'Les parquets et revêtements de sol massifs, qui supportent le démontage et le poncage',
        'Les structures métalliques (poutres, escaliers, garde-corps), réutilisables après contrôle',
        'Les équipements sanitaires en bon état, notamment dans les rénovations non structurelles',
        'La brique et la pierre naturelle, récupérables sur certaines démolitions patrimoniales',
      ],
    },
    { type: 'h2', text: 'Les vraies difficultés du réemploi' },
    {
      type: 'p',
      text: 'Le réemploi séduit sur le principe, mais se heurte à des obstacles très concrets sur un chantier normal. La déconstruction soignée prend nettement plus de temps qu’une démolition classique, ce qui a un coût de main-d’œuvre qu’il faut anticiper dès le devis. La traçabilité pose aussi question : sans historique clair, difficile de garantir la conformité ou la résistance d’un matériau réemployé. Et la garantie elle-même reste un point sensible, puisqu’un matériau d’occasion ne bénéficie en général pas des mêmes assurances qu’un produit neuf.',
    },
    {
      type: 'callout',
      title: 'Le réemploi se décide avant la démolition, pas pendant',
      text: 'Un chantier de démolition classique ne laisse ni le temps ni le budget pour trier ce qui pourrait être réemployé une fois qu’il a commencé. La décision — et le devis qui va avec — doit se prendre en amont, quand c’est encore une déconstruction planifiée plutôt qu’une démolition rapide.',
    },
    { type: 'h2', text: 'Des réseaux d’échange qui émergent' },
    {
      type: 'p',
      text: 'Des plateformes et réseaux d’échange de matériaux de réemploi se développent progressivement en Suisse, mettant en relation des chantiers de démolition et des professionnels ou particuliers à la recherche de matériaux spécifiques. Leur usage reste variable selon les régions, mais la tendance est claire : le réemploi passe d’une pratique artisanale isolée à un circuit un peu plus structuré.',
    },
    {
      type: 'cta',
      title: 'Chiffrer une déconstruction soignée sans se tromper',
      text: 'Un chantier de réemploi demande plus de temps de main-d’œuvre qu’une démolition classique — un détail qui se perd vite dans un devis standard. Avec Cantia, chaque poste de temps reste chiffré et suivi jusqu’à la facture finale, réemploi compris.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Le réemploi de matériaux est-il moins cher que des matériaux neufs ?',
      answer:
        'Pas systématiquement : le matériau lui-même coûte souvent moins cher, mais le temps de déconstruction soignée, de stockage et de contrôle avant réutilisation peut compenser une partie de l’économie. Tout dépend du type de matériau et de la logistique disponible.',
    },
    {
      question: 'Un matériau réemployé bénéficie-t-il d’une garantie ?',
      answer:
        'En général non, ou pas dans les mêmes conditions qu’un produit neuf, ce qui explique la prudence de certains professionnels. C’est un point à clarifier explicitement avec le client avant d’intégrer un matériau réemployé dans un chantier.',
    },
    {
      question: 'Où trouver des matériaux de réemploi pour un chantier en Suisse ?',
      answer:
        'Des réseaux et plateformes d’échange spécialisés se développent progressivement selon les régions, en plus des filières informelles entre professionnels. Se renseigner localement, souvent via des associations ou des acteurs régionaux de la construction durable, reste le point de départ le plus fiable.',
    },
  ],
  relatedSlugs: [
    'bilan-carbone-chantier-construction-suisse',
    'gestion-dechets-chantier-tri-obligatoire-suisse',
    'norme-minergie-batiment-explication',
  ],
};
