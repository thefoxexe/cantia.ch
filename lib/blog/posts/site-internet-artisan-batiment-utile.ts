import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'site-internet-artisan-batiment-utile',
  question: 'Un artisan du bâtiment a-t-il vraiment besoin d’un site internet, et à quoi doit-il servir ?',
  title: 'Un site internet pour un artisan du bâtiment : utile, ou juste une dépense de plus ?',
  description:
    'Un site internet n’est pas indispensable pour trouver des clients, mais il change ce qui se passe après le premier contact. Ce qu’il doit vraiment contenir pour être utile, sans budget démesuré.',
  excerpt:
    'La question n’est pas vraiment de savoir si un site internet apporte directement des clients : c’est surtout ce qui se passe juste après qu’un client potentiel a entendu parler de vous, et va vérifier avant d’appeler.',
  category: 'Croissance & acquisition',
  keywords: ['site internet artisan bâtiment', 'faut-il un site web entreprise construction', 'vitrine en ligne artisan', 'crédibilité digitale entreprise bâtiment', 'référencement local artisan'],
  publishedAt: '2026-09-04',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Un site internet ne remplace pas le bouche-à-oreille, mais il joue un rôle différent, complémentaire, souvent sous-estimé : quand un voisin recommande un artisan, la première chose que fait le prospect est presque toujours de chercher son nom en ligne, pour vérifier qu’il existe bien et se faire une idée de son travail avant même le premier appel.',
    },
    { type: 'h2', text: 'Ce qu’un site d’artisan doit vraiment contenir' },
    {
      type: 'list',
      items: [
        'Des photos de réalisations réelles, idéalement avant/après (la preuve concrète compte plus que le texte)',
        'Les corps de métier ou services précis proposés, pas une liste vague et générique',
        'La zone géographique d’intervention, importante pour le référencement local et pour filtrer les demandes hors zone',
        'Un moyen de contact simple et visible, comme un téléphone cliquable ou un formulaire court, sans compte à créer',
      ],
    },
    {
      type: 'stat',
      value: '< 10',
      label: 'pages généralement suffisantes pour un site d’artisan efficace (accueil, réalisations, services, contact), sans complexité inutile',
    },
    { type: 'h2', text: 'Pas besoin d’un budget publicitaire pour être trouvé localement' },
    {
      type: 'p',
      text: 'Un site simple, avec le bon vocabulaire (nom du métier, ville, canton) répété naturellement dans les textes, remonte souvent bien dans les recherches locales sans nécessiter de campagne publicitaire payante. Le référencement local (Google Maps, fiche Google Business liée au site) rapporte généralement plus, pour un artisan, qu’une campagne publicitaire générique.',
    },
    {
      type: 'callout',
      title: 'Un site à jour vaut mieux qu’un site sophistiqué mais figé',
      text: 'Un site avec trois réalisations récentes ajoutées cette année inspire plus confiance qu’un site élaboré mais dont la dernière mise à jour remonte à plusieurs années. La fraîcheur du contenu compte autant que sa qualité de conception.',
    },
    {
      type: 'cta',
      title: 'Des chantiers documentés, prêts à alimenter votre site',
      text: 'Cantia centralise les photos et rapports de chaque chantier au fil de l’avancement, ce qui donne une base toute prête pour nourrir régulièrement un site ou une fiche Google sans effort supplémentaire.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Un artisan indépendant a-t-il vraiment besoin d’un site internet ?',
      answer:
        'Pas indispensable pour trouver des clients directement, mais utile pour rassurer un prospect qui vérifie en ligne avant de contacter un artisan recommandé. Son rôle est donc plus celui de la crédibilité que de l’acquisition directe.',
    },
    {
      question: 'Combien de pages doit contenir le site d’un artisan du bâtiment ?',
      answer:
        'Généralement moins de dix suffisent (accueil, réalisations, services proposés et contact), car l’essentiel est la clarté et la fraîcheur du contenu, pas la complexité de la structure.',
    },
    {
      question: 'Le référencement local est-il plus important que la publicité payante pour un artisan ?',
      answer:
        'Dans la majorité des cas, oui. Un site bien référencé localement (avec la ville et le métier mentionnés naturellement) et une fiche Google Business active rapportent généralement plus qu’une campagne publicitaire générique.',
    },
  ],
  relatedSlugs: [
    'avis-google-entreprise-construction-suisse',
    'portfolio-photos-avant-apres-chantier-vente',
    'trouver-clients-artisan-batiment-suisse',
  ],
};
