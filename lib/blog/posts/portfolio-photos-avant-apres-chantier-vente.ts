import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'portfolio-photos-avant-apres-chantier-vente',
  question: 'Comment transformer les photos de chantier avant/après en véritable outil commercial ?',
  title: 'Les photos avant/après de chantier : l’outil commercial le plus sous-exploité du bâtiment',
  description:
    'La plupart des artisans prennent des photos de chantier pour le suivi, sans jamais les réutiliser commercialement. Comment en faire un vrai portfolio qui aide à convertir de nouveaux devis.',
  excerpt:
    'Une photo avant/après convainc souvent plus qu’un long argumentaire. Elle montre en un coup d’œil ce qu’un devis ne peut que décrire, et c’est exactement ce qu’un client hésitant a besoin de voir.',
  category: 'Croissance & acquisition',
  keywords: ['photos avant après chantier', 'portfolio artisan bâtiment', 'preuve sociale entreprise construction', 'photos réalisations marketing artisan', 'valoriser chantiers terminés'],
  publishedAt: '2026-09-16',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'La plupart des entreprises du bâtiment prennent déjà des photos de chantier (pour le suivi, pour se couvrir en cas de litige, parfois par simple habitude). Très peu les réutilisent ensuite comme argument commercial, alors qu’une bonne photo avant/après vaut souvent plus qu’un paragraphe entier pour convaincre un client hésitant.',
    },
    { type: 'h2', text: 'Ce qui fait une bonne photo avant/après' },
    {
      type: 'list',
      items: [
        'Le même angle exact pour l’avant et l’après, sans quoi la comparaison perd toute sa force',
        'Une lumière correcte, idéalement naturelle, plutôt qu’un flash direct qui écrase les détails',
        'Le chantier propre et rangé au moment de la photo "après" : les outils qui traînent nuisent à l’impression finale',
        'L’accord du client avant toute publication, surtout pour un intérieur de logement privé',
      ],
    },
    { type: 'h2', text: 'Un portfolio organisé par type de travaux, pas juste une pile de photos' },
    {
      type: 'p',
      text: 'Un client qui cherche une rénovation de salle de bain veut voir des salles de bain, pas un mélange de toitures, terrasses et cuisines dans le désordre. Organiser ses photos par catégorie de prestation (même simplement dans des dossiers bien nommés) facilite grandement leur réutilisation, que ce soit pour un site, une fiche Google ou simplement à montrer sur le téléphone lors d’un rendez-vous devis.',
    },
    {
      type: 'stat',
      value: '3-5',
      label: 'photos avant/après bien choisies suffisent généralement à illustrer une prestation type sur un site ou une fiche Google, pas besoin de dizaines de clichés',
    },
    {
      type: 'callout',
      title: 'Une photo prise pendant le chantier vaut aussi la peine d’être gardée',
      text: 'Une photo montrant le travail en cours (préparation, structure, détails techniques) rassure un client sur le sérieux du processus, pas seulement sur le résultat final. C’est un complément utile aux photos avant/après classiques.',
    },
    {
      type: 'cta',
      title: 'Toutes vos photos de chantier centralisées, chantier par chantier',
      text: 'Cantia organise automatiquement les photos par chantier, avec géolocalisation et date. De quoi retrouver facilement une belle réalisation à réutiliser, sans fouiller dans une pellicule de téléphone.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Faut-il l’accord du client pour publier des photos de son chantier ?',
      answer:
        'Oui, en particulier pour un intérieur privé. Il est recommandé de demander explicitement l’accord avant toute publication sur un site, une fiche Google ou un réseau professionnel.',
    },
    {
      question: 'Combien de photos avant/après faut-il pour un portfolio efficace ?',
      answer:
        'Un petit nombre bien choisi (3 à 5 par type de prestation) est généralement plus efficace qu’une grande quantité de photos peu organisées ou de qualité inégale.',
    },
    {
      question: 'Comment prendre une bonne photo avant/après de chantier ?',
      answer:
        'En conservant le même angle exact entre l’avant et l’après, avec une lumière naturelle si possible, et un chantier propre et rangé au moment de la photo finale.',
    },
  ],
  relatedSlugs: [
    'avis-google-entreprise-construction-suisse',
    'site-internet-artisan-batiment-utile',
    'photos-chantier-preuve-juridique-litige',
  ],
};
