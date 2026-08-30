import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'logiciel-standard-vs-solution-personnalisee-batiment',
  question: 'Faut-il choisir un logiciel standard ou une solution 100% personnalisée pour son entreprise du bâtiment ?',
  title: 'Logiciel standard ou 100% sur mesure : le vrai choix n\'est pas binaire',
  description:
    'Entre un outil standard rigide et un développement 100% personnalisé coûteux, il existe une troisième voie : un socle standard solide, complété par du sur-mesure ciblé.',
  excerpt:
    'La question "standard ou sur mesure" est souvent mal posée — la vraie option la plus efficace, pour la plupart des entreprises, est un socle standard fiable complété par juste ce qu\'il faut de personnalisation.',
  category: 'Sur-mesure & automatisations',
  keywords: ['logiciel standard vs sur mesure', 'solution personnalisée entreprise bâtiment', 'développement sur mesure coût', 'choisir entre logiciel standard et custom', 'outil gestion 100% personnalisé'],
  publishedAt: '2026-08-19',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Face à un besoin spécifique, la tentation peut être de faire développer un outil entièrement sur mesure, "from scratch". C\'est rarement le meilleur choix pour une PME du bâtiment — le coût, le délai et la maintenance d\'un développement 100% personnalisé dépassent largement ce qu\'un socle standard bien complété peut offrir.',
    },
    { type: 'h2', text: 'Les trois options, avec leurs vrais coûts' },
    {
      type: 'list',
      items: [
        'Logiciel 100% standard : rapide et abordable, mais rigide sur les besoins vraiment spécifiques',
        'Développement 100% sur mesure : parfaitement adapté, mais coûteux, long à livrer, et à maintenir seul dans la durée',
        'Socle standard + sur-mesure ciblé : le meilleur des deux — la base (devis, factures, TVA, mises à jour) reste maintenue par l\'éditeur, seul ce qui est vraiment spécifique est développé à part',
      ],
    },
    {
      type: 'stat',
      value: '5-10x',
      label: 'coût généralement supérieur d\'un développement logiciel 100% sur mesure par rapport à un socle standard complété par quelques fonctionnalités ciblées',
    },
    { type: 'h2', text: 'Le vrai risque du 100% sur mesure : la maintenance dans le temps' },
    {
      type: 'p',
      text: 'Un outil développé entièrement sur mesure doit être maintenu indéfiniment par l\'entreprise elle-même ou un prestataire dédié — les évolutions réglementaires (TVA, QR-facture) ne sont jamais automatiques comme elles le sont avec un éditeur qui maintient un socle standard pour tous ses clients.',
    },
    {
      type: 'callout',
      title: 'Le sur-mesure ciblé profite aussi des mises à jour du socle standard',
      text: 'Une fonctionnalité développée sur mesure au-dessus d\'un socle standard bien maintenu continue de bénéficier des mises à jour générales (conformité, sécurité) sans effort supplémentaire de l\'entreprise.',
    },
    {
      type: 'cta',
      title: 'Un socle solide, complété selon vos besoins',
      text: 'Cantia combine un socle standard complet et maintenu, avec la possibilité de développer des fonctionnalités sur mesure pour ce qui est vraiment spécifique à votre entreprise.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Un développement logiciel 100% sur mesure est-il un bon choix pour une PME du bâtiment ?',
      answer:
        'Rarement, en raison du coût, du délai et surtout de la charge de maintenance à long terme que cela représente pour une petite entreprise sans service informatique dédié.',
    },
    {
      question: 'Quelle est la meilleure option entre logiciel standard et solution personnalisée ?',
      answer:
        'Généralement un socle standard bien maintenu, complété par des fonctionnalités sur mesure ciblées uniquement là où c\'est vraiment nécessaire — plutôt que l\'un ou l\'autre à 100%.',
    },
    {
      question: 'Un outil sur mesure profite-t-il des mises à jour légales comme un outil standard ?',
      answer:
        'Si le sur-mesure est développé au-dessus d\'un socle standard bien maintenu, oui — sinon, l\'entreprise doit gérer elle-même chaque évolution réglementaire.',
    },
  ],
  relatedSlugs: [
    'cantia-adapte-metier-specifique-batiment',
    'creer-champ-processus-sur-mesure-logiciel-gestion',
    'logiciel-construit-avec-vous-sur-mesure',
  ],
};
