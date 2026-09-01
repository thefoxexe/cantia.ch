import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'quel-logiciel-choisir-demarrer-entreprise-construction',
  question: 'Quel logiciel choisir pour démarrer une entreprise de construction en Suisse ?',
  title: 'Quel logiciel choisir en démarrant son entreprise de construction',
  description:
    'Face à la multitude d\'outils disponibles, la méthode la plus simple pour choisir : partir de ce dont on a réellement besoin les trois premiers mois, pas de la liste complète des fonctionnalités possibles.',
  excerpt:
    'Choisir un logiciel avant même d\'avoir son premier client, c\'est facile de se tromper. Mieux vaut se demander ce dont on aura besoin dans les trois premiers mois, pas dans les trois prochaines années.',
  category: 'Comparatifs & outils',
  keywords: ['logiciel démarrage entreprise construction', 'choisir logiciel gestion bâtiment', 'outil pour nouvelle entreprise bâtiment', 'logiciel entreprise construction Suisse', 'démarrer société bâtiment'],
  publishedAt: '2026-07-08',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Au moment de créer son entreprise de construction, la tentation est de choisir tout de suite un logiciel complet, capable de tout faire (y compris des choses qui ne serviront pas avant longtemps). Une approche plus efficace : partir des trois ou quatre besoins réels du premier trimestre.',
    },
    { type: 'h2', text: 'Ce qui compte vraiment dans les trois premiers mois' },
    {
      type: 'list',
      items: [
        'Émettre un devis professionnel et conforme rapidement, pour ne pas perdre de premiers clients',
        'Transformer ce devis en facture sans tout ressaisir',
        'Garder une trace de chaque chantier (photos, avancement) sans y penser en plus du travail',
        'Rester simple à utiliser seul, sans avoir encore d\'équipe à former dessus',
      ],
    },
    {
      type: 'stat',
      value: '80 %',
      label: 'part des besoins logiciels d\'une nouvelle entreprise de construction généralement couverte par devis, factures et suivi de chantier seuls, avant d\'avoir besoin de modules RH ou trésorerie',
    },
    { type: 'h2', text: 'Choisir un outil qui grandit, pas un outil qu\'il faudra remplacer' },
    {
      type: 'p',
      text: 'La vraie question à se poser n\'est pas "cet outil fait-il tout ce dont j\'ai besoin aujourd\'hui" mais "pourra-t-il suivre le jour où j\'embauche un premier employé ou que je gère plusieurs chantiers en parallèle". Changer d\'outil un an après le lancement fait perdre du temps et de l\'historique.',
    },
    {
      type: 'callout',
      title: 'Ne pas sous-estimer la conformité dès le premier document',
      text: 'TVA, QR-facture, mentions légales obligatoires : ces éléments doivent être corrects dès le tout premier devis envoyé, pas seulement une fois l\'entreprise "installée".',
    },
    {
      type: 'cta',
      title: 'Un outil pensé pour grandir avec l\'entreprise',
      text: 'Cantia accompagne une entreprise de construction du premier devis jusqu\'à la gestion d\'une équipe complète, sans jamais avoir à migrer vers un autre outil en cours de route.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Faut-il choisir un logiciel complet dès la création de son entreprise de construction ?',
      answer:
        'Pas nécessairement tout utiliser dès le départ, mais choisir un outil capable de couvrir les besoins futurs évite une migration forcée quelques mois plus tard.',
    },
    {
      question: 'Quels sont les besoins logiciels prioritaires pour une nouvelle entreprise de construction ?',
      answer:
        'Émettre des devis conformes, les transformer en factures sans ressaisie, et suivre chaque chantier : ces trois besoins couvrent la majorité de l\'activité des premiers mois.',
    },
    {
      question: 'Pourquoi anticiper la croissance de l\'entreprise dans le choix du logiciel ?',
      answer:
        'Changer d\'outil après plusieurs mois d\'activité fait perdre du temps et de l\'historique. Un outil évolutif dès le départ évite cette migration.',
    },
  ],
  relatedSlugs: [
    'demarrer-entreprise-batiment-outils-indispensables',
    'checklist-logiciels-ouverture-societe-construction',
    'lancer-entreprise-batiment-suisse-par-ou-commencer',
  ],
};
