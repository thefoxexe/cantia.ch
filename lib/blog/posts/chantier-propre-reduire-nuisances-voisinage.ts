import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'chantier-propre-reduire-nuisances-voisinage',
  question: 'Comment réduire les nuisances d’un chantier pour le voisinage ?',
  title: 'Chantier propre : réduire les nuisances pour le voisinage',
  description:
    'Bruit, poussière, accès bloqués : un chantier mal géré crée des tensions durables avec le voisinage. Voici les réflexes concrets pour limiter les nuisances et préserver la réputation de l’entreprise.',
  excerpt:
    'Un voisin excédé par la poussière ou le bruit ne se plaint pas toujours à l’entreprise directement. Il en parle autour de lui — et ça, ça se voit sur les avis Google.',
  category: 'Juridique & normes',
  keywords: ['chantier propre voisinage', 'réduire nuisances chantier', 'nuisances chantier construction'],
  publishedAt: '2026-10-08',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un chantier dérange presque toujours un peu, même bien mené. La différence entre un voisinage tolérant et un voisinage excédé tient rarement à la nature des travaux eux-mêmes, mais à la façon dont l’entreprise gère les nuisances inévitables : bruit, poussière, salissure de la voie publique, accès temporairement bloqués.',
    },
    { type: 'h2', text: 'Les nuisances qui reviennent le plus souvent' },
    {
      type: 'list',
      items: [
        'Le bruit, en particulier aux heures matinales, pendant la pause de midi ou en fin de journée',
        'La poussière qui se dépose sur les véhicules et façades voisines, surtout lors de travaux de démolition ou de ponçage',
        'La boue et les gravats laissés sur la voie publique par les camions et engins de chantier',
        'Les accès piétons ou véhicules bloqués sans préavis, notamment dans des rues étroites ou en milieu urbain dense',
      ],
    },
    { type: 'h2', text: 'Les bonnes pratiques qui font une vraie différence' },
    {
      type: 'p',
      text: 'Réduire les nuisances ne demande pas de moyens exceptionnels, mais une organisation un peu plus rigoureuse que le strict minimum.',
    },
    {
      type: 'list',
      items: [
        'Bâcher les zones de démolition ou de ponçage pour limiter la propagation de la poussière',
        'Nettoyer régulièrement les abords du chantier, pas seulement à la fin des travaux',
        'Prévenir les voisins directs avant une phase de travaux particulièrement bruyante, même par un simple mot',
        'Respecter strictement les horaires de tranquillité, en particulier tôt le matin et en soirée',
        'Baliser clairement les accès restreints, avec une durée annoncée plutôt qu’un blocage sans explication',
      ],
    },
    {
      type: 'callout',
      title: 'Prévenir coûte moins cher que réparer',
      text: 'Un mot glissé dans les boîtes aux lettres avant une semaine de démolition transforme souvent une plainte en simple gêne acceptée. Le coût de cette prévention est quasi nul comparé au temps perdu à gérer une réclamation ou une intervention de la police locale.',
    },
    { type: 'h2', text: 'Un chantier propre, un argument commercial' },
    {
      type: 'p',
      text: 'Un chantier bien tenu, avec des accès dégagés et des abords propres, se remarque — y compris par des voisins qui deviennent parfois eux-mêmes de futurs clients. À l’inverse, un chantier laissé sale ou bruyant sans considération pour le voisinage se retrouve vite mentionné, nommément, dans un avis en ligne négatif que l’entreprise devra ensuite gérer.',
    },
    {
      type: 'cta',
      title: 'Un chantier organisé se voit, même depuis le trottoir',
      text: 'Planning clair, tâches suivies, équipe informée des consignes du jour : Cantia aide à garder un chantier organisé du premier coup de pioche à la dernière finition, ce qui se ressent directement dans la façon dont il est perçu autour de lui.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Existe-t-il des horaires légaux à respecter sur un chantier ?',
      answer:
        'Les horaires de tranquillité, notamment en soirée, tôt le matin et le dimanche, sont généralement fixés par la réglementation communale ou cantonale, avec des règles qui varient d’une commune à l’autre. Se renseigner localement avant le début du chantier évite les mauvaises surprises.',
    },
    {
      question: 'Faut-il prévenir les voisins avant de commencer un chantier ?',
      answer:
        'Ce n’est pas toujours une obligation légale, mais c’est une pratique fortement recommandée, en particulier avant une phase bruyante ou un blocage d’accès. Un simple mot informatif suffit souvent à désamorcer une tension avant qu’elle n’apparaisse.',
    },
    {
      question: 'Un voisinage mécontent peut-il vraiment nuire à l’entreprise ?',
      answer:
        'Oui, un voisin excédé peut se plaindre auprès de la commune, mais aussi laisser un avis négatif en ligne visible par de futurs clients, ce qui pèse directement sur la réputation de l’entreprise au-delà du chantier concerné.',
    },
  ],
  relatedSlugs: [
    'gestion-dechets-chantier-tri-obligatoire-suisse',
    'permis-construire-renovation-quand-necessaire',
    'bilan-carbone-chantier-construction-suisse',
  ],
};
