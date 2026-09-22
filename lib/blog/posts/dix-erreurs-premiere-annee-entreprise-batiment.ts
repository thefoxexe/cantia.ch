import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'dix-erreurs-premiere-annee-entreprise-batiment',
  question: 'Quelles sont les erreurs les plus fréquentes la première année d’une entreprise du bâtiment ?',
  title: 'Les 10 erreurs à éviter la première année d’une entreprise du bâtiment',
  description:
    '10 erreurs qui reviennent le plus souvent chez les jeunes entreprises du bâtiment en Suisse — et comment les éviter, avant qu’elles ne coûtent une marge entière.',
  excerpt:
    'Aucune de ces 10 erreurs n’est spectaculaire. C’est justement pour ça qu’elles sont dangereuses : elles s’installent en silence, chantier après chantier, jusqu’à ce que le compte en banque parle.',
  category: 'Chantier & rentabilité',
  keywords: [
    'erreurs première année entreprise bâtiment',
    'erreurs à éviter jeune entreprise construction',
    'pièges création entreprise artisan suisse',
    'pourquoi entreprise bâtiment échoue',
    'conseils démarrage entreprise construction',
  ],
  publishedAt: '2026-09-15',
  readMinutes: 8,
  blocks: [
    {
      type: 'p',
      text: 'Aucune de ces erreurs ne ressemble à une catastrophe sur le moment. C’est exactement ce qui les rend dangereuses : elles s’installent discrètement, un devis un peu trop bas, une relance qu’on repousse, un chantier de trop accepté en parallèle, jusqu’à ce qu’une année entière tourne sans jamais vraiment enrichir personne.',
    },
    { type: 'h2', text: 'Les 10 erreurs, dans l’ordre où elles frappent le plus souvent' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Fixer ses prix en copiant la concurrence, sans avoir calculé son propre coût horaire réel',
        'Démarrer sans trésorerie tampon pour couvrir les 60 à 90 premiers jours sans encaissement',
        'Ne jamais provisionner d’imprévus dans un devis de rénovation, où l’imprévu est la norme',
        'Accepter trop de chantiers en parallèle sans visibilité claire sur le planning réel',
        'Laisser les relances de factures impayées traîner par gêne, jusqu’à ce que la créance devienne difficile à récupérer',
        'Ne jamais savoir, chantier par chantier, lequel a vraiment fait gagner de l’argent et lequel a fait perdre',
        'Sous-estimer le temps administratif non facturable (devis, coordination, trajets) dans le calcul du prix',
        'Retarder l’assurance RC professionnelle, jusqu’au jour où un client ou un architecte l’exige avant de signer',
        'Gérer devis, factures et suivi de chantier sur des outils séparés qui ne se parlent jamais entre eux',
        'Attendre d’avoir un problème avant de suivre sa trésorerie, plutôt que de l’anticiper chantier après chantier',
      ],
    },
    { type: 'h2', text: 'Celle qui coûte le plus cher : ne pas connaître sa rentabilité par chantier' },
    {
      type: 'p',
      text: 'Un carnet de commandes plein n’a jamais garanti une entreprise rentable. Une entreprise peut enchaîner les chantiers, sembler occupée en permanence, et pourtant perdre de l’argent sur un chantier sur trois sans que personne ne s’en rende compte avant la fin d’année, quand le comptable annonce un résultat décevant malgré une activité intense. Sans suivi chantier par chantier, impossible de savoir lequel a vraiment fait gagner de l’argent, et lequel aurait mieux valu refuser.',
    },
    {
      type: 'callout',
      title: 'Le signe qui ne trompe pas',
      text: 'Si la question « ce chantier m’a-t-il fait gagner ou perdre de l’argent ? » ne trouve pas de réponse chiffrée en moins d’une minute, la rentabilité de l’entreprise repose sur une impression, pas sur des faits.',
    },
    { type: 'h2', text: 'Celle qu’on ignore le plus longtemps : la trésorerie de départ' },
    {
      type: 'p',
      text: 'Le délai entre un devis signé et l’encaissement réel dépasse souvent deux à trois mois une fois le chantier exécuté et la facture émise. Sans réserve de trésorerie couvrant les charges fixes sur cette période, une entreprise pourtant rentable sur le papier peut se retrouver en tension permanente — un problème de calendrier, pas de rentabilité, mais qui met tout aussi bien la clé sous la porte.',
    },
    {
      type: 'stat',
      value: '1 an',
      label: 'suffit souvent pour qu’une accumulation de petites erreurs invisibles transforme un carnet de commandes plein en résultat décevant',
    },
    {
      type: 'cta',
      title: 'Éviter ces erreurs sans y penser en permanence',
      text: 'Devis chiffrés justement, relances automatiques, rentabilité par chantier et trésorerie suivie en temps réel : Cantia couvre les erreurs les plus fréquentes de la première année, sans y passer un temps que vous n’avez pas.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Quelle est l’erreur la plus coûteuse la première année d’une entreprise du bâtiment ?',
      answer:
        'Ne pas savoir, chantier par chantier, lequel a réellement fait gagner de l’argent et lequel a fait perdre : sans ce suivi, une entreprise très occupée peut rester peu rentable sans que personne ne s’en aperçoive avant la fin de l’année.',
    },
    {
      question: 'Un carnet de commandes plein garantit-il une entreprise rentable ?',
      answer:
        'Non, une activité intense peut coexister avec une rentabilité médiocre si certains chantiers sont sous-évalués ou si le suivi financier par chantier n’existe pas.',
    },
    {
      question: 'Combien de temps faut-il prévoir en trésorerie tampon au démarrage ?',
      answer:
        'Généralement deux à trois mois de charges fixes, pour couvrir le délai habituel entre le premier chantier signé et le premier encaissement réel.',
    },
  ],
  relatedSlugs: [
    'creer-entreprise-batiment-suisse-guide-complet',
    'pourquoi-entreprises-batiment-font-faillite-suisse',
    'chantier-complet-peut-etre-en-perte-taux-horaire',
    'previsionnel-tresorerie-entreprise-batiment',
  ],
};
