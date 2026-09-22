import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'instagram-ou-facebook-artisan-batiment',
  question: 'Faut-il privilégier Facebook ou Instagram en tant qu’artisan du bâtiment en Suisse ?',
  title: 'Facebook ou Instagram : quel réseau pour un artisan du bâtiment',
  description:
    'Facebook et Instagram ne touchent pas le même public ni le même usage. Lequel privilégier selon sa clientèle, et pourquoi il vaut mieux bien alimenter un seul réseau plutôt que d’en abandonner deux.',
  excerpt:
    'Entre Facebook et Instagram, la question n’est pas lequel est le meilleur dans l’absolu, mais lequel correspond vraiment à la clientèle visée.',
  category: 'Croissance & acquisition',
  keywords: ['Facebook ou Instagram artisan', 'réseau social entreprise bâtiment suisse', 'réseaux sociaux artisan'],
  publishedAt: '2026-09-29',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Facebook ou Instagram : la question revient souvent, et la réponse dépend moins de préférence personnelle que du type de clientèle visée et du temps réellement disponible pour alimenter un réseau plutôt que deux, à moitié.',
    },
    { type: 'h2', text: 'Deux audiences, deux formats différents' },
    {
      type: 'p',
      text: 'Facebook reste plus généraliste et local : groupes de quartier, pages communales, échanges entre voisins qui recommandent une entreprise pour des travaux précis. Instagram fonctionne différemment, davantage centré sur l’image : avant/après de chantiers, ambiance de l’équipe, portfolio visuel qui se construit dans la durée plutôt que par la discussion.',
    },
    { type: 'h2', text: 'Lequel convient mieux selon la clientèle' },
    {
      type: 'list',
      items: [
        'Une clientèle de particuliers locaux (rénovation, dépannage, petits travaux) : Facebook, pour sa dimension de recommandation de proximité et de groupes locaux actifs',
        'Une activité très visuelle (finitions, aménagement extérieur, rénovation esthétique) : Instagram, où les photos avant/après parlent d’elles-mêmes',
        'Une clientèle plus professionnelle (régies, promoteurs, autres entreprises) : les deux réseaux comptent souvent moins qu’un site internet ou des références directes',
      ],
    },
    {
      type: 'callout',
      title: 'Un seul réseau bien alimenté vaut mieux que deux à l’abandon',
      text: 'Un compte Instagram sans publication depuis six mois envoie un signal plus négatif qu’aucun compte du tout. Mieux vaut choisir un seul réseau réellement adapté à sa clientèle, et l’alimenter régulièrement avec ce qui existe déjà : des photos de chantiers prises au fil de l’eau.',
    },
    {
      type: 'p',
      text: 'Dans la pratique, le choix se fait souvent naturellement en observant où se trouvent déjà les clients potentiels : dans un groupe Facebook de quartier actif, ou en suivant des comptes d’artisans locaux sur Instagram. Le bon réseau est simplement celui où l’audience visée passe déjà du temps.',
    },
    {
      type: 'cta',
      title: 'Des photos de chantier prêtes à publier',
      text: 'Avec Cantia, chaque rapport de chantier inclut déjà des photos avant/après organisées. De quoi alimenter un réseau social sans travail de reprise supplémentaire.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Faut-il être présent sur Facebook et Instagram à la fois ?',
      answer:
        'Ce n’est pas nécessaire au démarrage. Mieux vaut choisir le réseau le plus adapté à sa clientèle et l’alimenter régulièrement, plutôt que de se disperser sur deux comptes peu actifs.',
    },
    {
      question: 'Instagram est-il utile pour une entreprise du bâtiment qui travaille surtout avec des particuliers locaux ?',
      answer:
        'Il peut l’être pour des activités très visuelles comme la rénovation esthétique ou l’aménagement, mais pour une clientèle très locale et orientée recommandation, Facebook et ses groupes de quartier restent souvent plus efficaces.',
    },
    {
      question: 'Combien de temps faut-il consacrer aux réseaux sociaux en tant qu’artisan ?',
      answer:
        'Généralement très peu si l’activité est déjà documentée par des photos de chantier : quelques minutes suffisent pour publier une photo avant/après avec une légende courte, sans que cela devienne une charge de travail à part entière.',
    },
  ],
  relatedSlugs: ['portfolio-photos-avant-apres-chantier-vente', 'avis-google-entreprise-construction-suisse', 'site-internet-ou-carte-de-visite-artisan'],
};
