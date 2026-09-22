import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'provoquer-bouche-a-oreille-artisan',
  question: 'Comment provoquer le bouche-à-oreille plutôt que l’attendre en tant qu’artisan ?',
  title: 'Bouche-à-oreille : comment le provoquer plutôt que l’attendre',
  description:
    'Le bouche-à-oreille ne se limite pas à la qualité du travail. Le moment où il se déclenche, la dernière impression laissée sur le chantier et les petits déclencheurs qui font vraiment parler.',
  excerpt:
    'Le bouche-à-oreille n’est pas qu’une question de chance. Certains moments du chantier le déclenchent bien plus que d’autres.',
  category: 'Croissance & acquisition',
  keywords: ['provoquer bouche à oreille artisan', 'déclencher recommandation client bâtiment', 'dernière impression chantier'],
  publishedAt: '2026-09-29',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Beaucoup d’entreprises du bâtiment considèrent le bouche-à-oreille comme quelque chose qui arrive ou n’arrive pas, un peu par hasard, sans qu’on puisse vraiment agir dessus. En réalité, certains moments précis du chantier le déclenchent beaucoup plus que d’autres, et il suffit souvent de les repérer pour en profiter.',
    },
    { type: 'h2', text: 'Le moment du chantier fini est le meilleur moment pour demander' },
    {
      type: 'p',
      text: 'Juste après la fin d’un chantier réussi, la satisfaction du client est à son maximum. C’est le moment le plus naturel pour demander une recommandation ou simplement suggérer de partager une photo, sans que cela paraisse forcé. Attendre plusieurs semaines dilue cet effet : la satisfaction reste, mais l’envie spontanée d’en parler retombe vite une fois le chantier oublié du quotidien.',
    },
    { type: 'h2', text: 'L’effet des photos avant/après partagées' },
    {
      type: 'p',
      text: 'Une photo avant/après bien prise et partagée, par l’entreprise ou par le client lui-même, génère souvent plus de conversations qu’un simple avis écrit. Elle est concrète, visuelle, facile à faire circuler, et donne au client une bonne raison de montrer le résultat à son entourage, ce qui déclenche naturellement des questions sur qui a fait le travail.',
    },
    {
      type: 'callout',
      title: 'La dernière impression compte souvent plus que la qualité technique seule',
      text: 'Un chantier rangé, terminé à l’heure annoncée, avec un dernier passage propre, laisse une impression forte, presque indépendante de la qualité technique perçue par un client non expert. C’est souvent cette dernière impression, plus que le travail lui-même, qui alimente le plus le bouche-à-oreille.',
    },
    { type: 'h2', text: 'Des déclencheurs simples, sans programme formel' },
    {
      type: 'list',
      items: [
        'Demander directement, à la fin du chantier, si le client accepterait qu’on prenne une photo du résultat',
        'Proposer, sans insister, de partager la photo avant/après si le client est ouvert à cela',
        'Soigner particulièrement le dernier jour de chantier : rangement, ponctualité, dernier point avec le client',
        'Rester joignable facilement après la fin du chantier, pour une petite question qui, bien traitée, renforce encore la confiance',
      ],
    },
    {
      type: 'cta',
      title: 'Des photos avant/après prêtes à partager, à la fin de chaque chantier',
      text: 'Avec Cantia, les rapports de chantier avec photos sont générés automatiquement au fil de l’avancement. Plus besoin de tout réorganiser à la fin pour avoir de quoi provoquer une recommandation.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Quel est le meilleur moment pour demander une recommandation à un client ?',
      answer:
        'Juste après la fin d’un chantier réussi, quand la satisfaction est la plus forte. Attendre trop longtemps réduit fortement les chances d’obtenir une recommandation spontanée.',
    },
    {
      question: 'La qualité technique suffit-elle à générer du bouche-à-oreille ?',
      answer:
        'Pas toujours. La dernière impression, notamment la propreté et la ponctualité en fin de chantier, joue souvent un rôle au moins aussi important que la qualité technique perçue par un client non expert.',
    },
    {
      question: 'Faut-il mettre en place un programme de parrainage pour générer du bouche-à-oreille ?',
      answer:
        'Ce n’est pas indispensable pour démarrer. Des déclencheurs simples et non formels (demander une photo, soigner la fin de chantier) suffisent souvent. Un programme structuré avec incitations peut ensuite venir compléter cette base.',
    },
  ],
  relatedSlugs: ['parrainage-recommandation-clients-artisan-batiment', 'portfolio-photos-avant-apres-chantier-vente', 'trouver-clients-artisan-batiment-suisse'],
};
