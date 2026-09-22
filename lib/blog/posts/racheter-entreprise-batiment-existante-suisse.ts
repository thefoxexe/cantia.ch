import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'racheter-entreprise-batiment-existante-suisse',
  question: 'Que faut-il vérifier avant de racheter une entreprise du bâtiment existante en Suisse ?',
  title: 'Racheter une entreprise du bâtiment existante : les points à vérifier',
  description:
    'Les points essentiels à vérifier avant de racheter une entreprise du bâtiment existante en Suisse : finances, carnet de commandes, matériel et clientèle.',
  excerpt:
    'Racheter une entreprise du bâtiment déjà en activité peut faire gagner des années — à condition de vérifier les bons éléments avant de signer.',
  category: 'Juridique & normes',
  keywords: ['racheter entreprise bâtiment suisse', 'rachat entreprise construction existante'],
  publishedAt: '2026-10-10',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'Racheter une entreprise existante plutôt que d’en créer une nouvelle permet de démarrer avec une clientèle, un matériel et une réputation déjà en place. Mais cette apparente facilité cache des risques précis, qui se vérifient avant la signature, pas après.',
    },
    { type: 'h2', text: 'Les points à vérifier avant de racheter' },
    {
      type: 'list',
      items: [
        'La santé financière réelle de l’entreprise, pas seulement le chiffre d’affaires affiché — regarder les marges, les dettes et la trésorerie sur plusieurs exercices',
        'Le carnet de commandes et sa fiabilité : des devis signés valent plus que des intentions verbales de clients',
        'L’état et l’âge réel du matériel et des véhicules repris, avec leur valeur de remplacement si nécessaire',
        'La part de la clientèle réellement fidèle à l’entreprise, par opposition à celle fidèle uniquement au patron actuel',
      ],
    },
    { type: 'h2', text: 'Racheter les parts ou racheter le fonds de commerce' },
    {
      type: 'p',
      text: 'Deux options très différentes juridiquement. Racheter les actions ou parts sociales d’une société (SA, Sàrl) reprend l’entreprise avec son historique complet, y compris ses éventuelles dettes ou litiges en cours. Racheter uniquement le fonds de commerce — les actifs et la clientèle — sans la structure juridique permet en général de repartir sur une base plus propre, sans hériter du passif de l’ancienne société.',
    },
    { type: 'h2', text: 'Pourquoi l’accompagnement est presque indispensable' },
    {
      type: 'p',
      text: 'Une fiduciaire pour analyser les comptes réels, et généralement un avocat pour structurer juridiquement le rachat, permettent d’éviter les mauvaises surprises les plus courantes — une dette non déclarée, un litige en cours avec un client, ou une clientèle qui se révèle moins fidèle que prévu une fois le rachat conclu.',
    },
    {
      type: 'callout',
      title: 'Le carnet de commandes annoncé n’a de valeur que documenté',
      text: 'Un vendeur peut annoncer un carnet de commandes solide sans preuve écrite. Exigez les devis signés et les contrats en cours avant de valoriser l’entreprise sur cette base — une intention client n’est pas une garantie.',
    },
    {
      type: 'cta',
      title: 'Évaluez une entreprise à racheter avec des chiffres clairs, pas des promesses',
      text: 'Cantia donne accès à un historique structuré de chantiers, devis et facturation — un atout pour qui rachète une entreprise comme pour qui la vend.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Vaut-il mieux racheter les parts d’une société ou son fonds de commerce ?',
      answer:
        'Cela dépend du passif de l’entreprise. Racheter le fonds de commerce évite généralement d’hériter des dettes ou litiges de l’ancienne structure, mais peut être fiscalement moins avantageux selon les cas — à valider avec une fiduciaire.',
    },
    {
      question: 'Comment vérifier que le chiffre d’affaires annoncé est réel ?',
      answer:
        'En demandant les comptes des trois derniers exercices, idéalement révisés, et en les croisant avec les décomptes TVA et les relevés bancaires plutôt que de se fier au seul bilan présenté.',
    },
    {
      question: 'La clientèle reste-t-elle automatiquement après un rachat ?',
      answer:
        'Non, rien ne le garantit. Une partie de la clientèle peut être fidèle au patron sortant plus qu’à l’entreprise. C’est un risque à intégrer dans la valorisation du rachat.',
    },
  ],
  relatedSlugs: [
    'transmettre-entreprise-batiment-retraite',
    'succession-familiale-entreprise-artisanale-batiment',
    'cout-creation-entreprise-construction-suisse',
  ],
};
