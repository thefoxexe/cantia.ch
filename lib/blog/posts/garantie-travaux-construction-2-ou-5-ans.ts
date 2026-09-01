import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'garantie-travaux-construction-2-ou-5-ans',
  question: 'Garantie sur des travaux de construction en Suisse : 2 ans ou 5 ans ?',
  title: 'Garantie travaux de construction en Suisse : 2 ans, 5 ans, ou 10',
  description:
    'La garantie légale pour un ouvrage immobilier est de 5 ans, pas 2. Et un changement de droit entré en vigueur en 2026 réduit le délai pour signaler un défaut à 60 jours.',
  excerpt:
    'Beaucoup d’artisans citent « 2 ans » de garantie par réflexe. Pour tout ce qui est fixé au bâtiment, la loi suisse dit 5 ans, et un nouveau délai de 60 jours vient tout juste de changer la donne en 2026.',
  category: 'Juridique & normes',
  keywords: ['garantie construction', 'délai prescription', 'art 371 co', 'avis des défauts', 'défaut caché'],
  publishedAt: '2026-03-05',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: '« Deux ans de garantie » est le chiffre que tout le monde répète dans le bâtiment. C’est pourtant faux pour l’essentiel de ce qui touche à un ouvrage fixé au sol. L’art. 371 al. 2 du Code des obligations fixe le délai à cinq ans pour un ouvrage immobilier, pas deux.',
    },
    { type: 'h2', text: 'Trois délais, pas un seul' },
    {
      type: 'table',
      headers: ['Nature de l’ouvrage', 'Délai de garantie', 'Base légale'],
      rows: [
        ['Objet mobilier (non fixé au bâtiment)', '2 ans', 'Art. 371 al. 1 CO (renvoi à l’art. 210)'],
        ['Ouvrage immobilier ou fixé au bâtiment', '5 ans', 'Art. 371 al. 2 CO'],
        ['Défaut intentionnellement dissimulé', '10 ans', 'Art. 371 al. 2 CO'],
      ],
    },
    {
      type: 'p',
      text: 'La ligne de partage tient à un mot : « fixé ». Une fenêtre posée, une chape coulée, une installation électrique intégrée relèvent du régime immobilier à 5 ans. Du mobilier livré et non intégré à la structure reste sous le régime mobilier à 2 ans : une distinction que la plupart des entreprises n’appliquent jamais correctement sur leurs propres devis.',
    },
    {
      type: 'callout',
      title: 'Le changement à connaître pour 2026 : 60 jours pour signaler un défaut',
      text: 'Une réforme du droit de la garantie entrée en vigueur en 2026 fixe désormais un délai de 60 jours pour notifier un défaut au constructeur après sa découverte (un cadre plus précis que l’ancienne obligation, plus vague, de le signaler « immédiatement »). Un client qui attend trop longtemps pour signaler un défaut visible risque désormais de perdre son droit à réparation, même dans le délai de prescription de 5 ans.',
    },
    { type: 'h2', text: 'Ce que ça change concrètement sur un chantier' },
    {
      type: 'list',
      items: [
        'Le délai de garantie court depuis la réception de l’ouvrage, pas depuis la fin des travaux ou la date de la facture',
        'Un défaut caché découvert quatre ans après la réception reste couvert par les 5 ans (à condition d’être signalé dans les 60 jours suivant sa découverte)',
        'Une dissimulation intentionnelle d’un défaut connu prolonge le délai à 10 ans, un vrai risque pour l’entreprise qui « ferme les yeux » sur un problème visible en fin de chantier',
      ],
    },
    {
      type: 'p',
      text: 'Pour l’entreprise, la conséquence pratique est double : documenter précisément l’état de l’ouvrage à la réception (procès-verbal, photos datées) protège autant contre une réclamation infondée des années plus tard que contre l’accusation de dissimulation.',
    },
    {
      type: 'cta',
      title: 'Une trace de chaque chantier, photo par photo',
      text: 'Les rapports de chantier Cantia horodatent et géolocalisent chaque photo : une preuve précise de l’état des travaux à chaque étape, utile bien après la fin du chantier.',
      buttonLabel: 'Découvrir les rapports de chantier',
    },
  ],
  faq: [
    {
      question: 'La garantie sur des travaux de construction est-elle de 2 ans ou 5 ans en Suisse ?',
      answer:
        '5 ans pour tout ouvrage immobilier ou fixé au bâtiment (art. 371 al. 2 CO). Le délai de 2 ans ne s’applique qu’aux objets mobiliers non intégrés à la structure.',
    },
    {
      question: 'Depuis quand court le délai de garantie de 5 ans ?',
      answer:
        'Depuis la réception de l’ouvrage par le client, pas depuis la date de la facture ou la fin effective des travaux.',
    },
    {
      question: 'Quel est le nouveau délai pour signaler un défaut en 2026 ?',
      answer:
        'La réforme du droit de la garantie entrée en vigueur en 2026 fixe un délai de 60 jours pour notifier un défaut au constructeur après sa découverte, remplaçant l’ancienne exigence plus vague de signalement « immédiat ».',
    },
  ],
  relatedSlugs: [
    'defaut-construction-decouvert-apres-reception-qui-paie',
    'norme-sia-118-devis-obligatoire',
    'duree-conservation-devis-factures-suisse',
  ],
};
