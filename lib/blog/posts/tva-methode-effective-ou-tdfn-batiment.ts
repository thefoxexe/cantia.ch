import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'tva-methode-effective-ou-tdfn-batiment',
  question: 'Faut-il choisir la méthode effective ou le taux de la dette fiscale nette (TDFN) pour la TVA d’une entreprise du bâtiment ?',
  title: 'TVA méthode effective ou taux de la dette fiscale nette : laquelle choisir',
  description:
    'Méthode effective ou TDFN pour la TVA d’une entreprise du bâtiment : ce que chaque méthode implique en charge administrative, en impôt préalable déductible, et comment orienter son choix.',
  excerpt:
    'Les deux méthodes existent pour la même raison : simplifier la vie de certaines entreprises. Mais la simplification n’est pas toujours un avantage financier, et le mauvais choix se paie sur plusieurs années.',
  category: 'Juridique & normes',
  keywords: [
    'méthode effective ou tdfn bâtiment',
    'taux de la dette fiscale nette construction',
    'choisir méthode tva entreprise bâtiment',
    'tdfn artisan suisse',
    'impôt préalable tva construction',
  ],
  publishedAt: '2026-09-21',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'Deux méthodes existent pour calculer la TVA due par une entreprise assujettie en Suisse : la méthode effective, qui calcule précisément la différence entre la TVA facturée et l’impôt préalable réellement payé, et le taux de la dette fiscale nette (TDFN), un taux forfaitaire par branche d’activité qui simplifie le décompte mais change la logique de calcul. Le choix se fait à l’inscription ou lors d’un changement de méthode auprès de l’AFC, et il structure la comptabilité de l’entreprise pour les années suivantes.',
    },
    { type: 'h2', text: 'La méthode effective : précision, mais plus de comptabilité' },
    {
      type: 'p',
      text: 'Avec la méthode effective, chaque facture émise porte la TVA au taux applicable, et chaque facture reçue (matériel, sous-traitance, location d’engins, carburant) permet de récupérer l’impôt préalable correspondant. La TVA due est la différence entre les deux. C’est la méthode la plus précise, mais elle demande de suivre rigoureusement chaque facture d’achat et son taux, ce qui représente une charge administrative réelle pour une petite structure sans service comptable dédié.',
    },
    { type: 'h2', text: 'Le TDFN : plus simple, mais pas toujours plus avantageux' },
    {
      type: 'p',
      text: 'Le TDFN applique un taux forfaitaire, propre à chaque branche d’activité, directement sur le chiffre d’affaires encaissé, sans calculer séparément l’impôt préalable sur chaque achat. Le décompte devient beaucoup plus rapide à établir, généralement deux fois par an au lieu de quatre. Le taux exact applicable au secteur de la construction varie selon l’activité précise déclarée et évolue périodiquement : il doit être vérifié directement auprès de l’AFC ou d’une fiduciaire, jamais supposé d’une année sur l’autre.',
    },
    { type: 'h2', text: 'Le vrai critère de choix : le volume d’achats déductibles' },
    {
      type: 'table',
      headers: ['Situation', 'Méthode plutôt avantageuse'],
      rows: [
        ['Beaucoup d’achats de matériel et d’investissements', 'Méthode effective, pour récupérer l’impôt préalable réel'],
        ['Activité surtout en main-d’œuvre, peu d’achats', 'TDFN, souvent plus simple sans perte significative'],
        ['Pas de service comptable interne', 'TDFN, pour réduire la charge de suivi trimestriel'],
        ['Comptabilité déjà tenue avec précision (logiciel de gestion)', 'Méthode effective, car le suivi n’ajoute plus de charge réelle'],
      ],
    },
    {
      type: 'callout',
      title: 'Un engagement qui dure, pas un choix trimestriel',
      text: 'Changer de méthode n’est pas instantané : l’AFC impose généralement une durée minimale avant de pouvoir basculer d’une méthode à l’autre. Avant de choisir le TDFN pour sa simplicité, il vaut la peine de simuler une année complète avec les deux méthodes, notamment si un investissement important (véhicule, machine) est prévu à court terme.',
    },
    {
      type: 'cta',
      title: 'Quelle que soit la méthode TVA choisie, gardez chaque facture rattachée à son chantier',
      text: 'Cantia centralise devis, factures et achats par chantier, ce qui simplifie le décompte que vous soyez en méthode effective ou en TDFN.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Peut-on changer de méthode TVA en cours d’année ?',
      answer:
        'Non, un changement de méthode s’effectue en général au début d’une période fiscale et implique le respect d’un délai minimal avant de pouvoir revenir à l’autre méthode. Toute demande de changement doit passer par l’AFC.',
    },
    {
      question: 'Le TDFN dispense-t-il complètement de suivre les factures d’achat ?',
      answer:
        'Non, il simplifie le calcul de la TVA due, mais l’entreprise doit tout de même conserver ses factures d’achat et de vente comme n’importe quelle entreprise assujettie, notamment en cas de contrôle.',
    },
    {
      question: 'Une petite entreprise du bâtiment a-t-elle intérêt à rester en méthode effective ?',
      answer:
        'Cela dépend surtout du volume d’achats de matériel et d’investissements déductibles. Une entreprise qui achète beaucoup de matériel a souvent intérêt à rester en méthode effective pour récupérer l’impôt préalable réel plutôt qu’un taux forfaitaire.',
    },
  ],
  relatedSlugs: [
    'declaration-tva-trimestrielle-artisan-suisse',
    'delai-declaration-tva-suisse-calendrier',
    'mentions-obligatoires-facture-suisse-tva',
  ],
};
