import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-facture-entreprise-renovation-suisse',
  question: 'Comment établir devis et factures pour une entreprise de rénovation générale en Suisse ?',
  title: 'Devis et facturation pour une entreprise de rénovation générale',
  description:
    'Coordination de plusieurs corps de métier, état réel du bâtiment inconnu au devis, clause d’imprévu structurel : comment chiffrer une rénovation générale en Suisse.',
  excerpt:
    'Contrairement au neuf, une rénovation générale se chiffre toujours avec une part d’inconnu : l’état réel du bâtiment existant. Voici comment s’en protéger dès le devis.',
  category: 'Métiers du bâtiment',
  keywords: ['devis rénovation générale suisse', 'facturation entreprise rénovation', 'clause imprévu chantier rénovation'],
  publishedAt: '2026-10-12',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'Une entreprise de rénovation générale coordonne souvent plusieurs corps de métier sur un même chantier, un peu comme une entreprise générale mais à une échelle plus réduite, sur des projets de rénovation plutôt que de construction neuve. Cette coordination multi-lots s’accompagne d’une difficulté propre à la rénovation : l’état réel du bâtiment existant n’est jamais complètement connu avant le début des travaux.',
    },
    { type: 'h2', text: 'Un profil de coordination, pas seulement d’exécution' },
    {
      type: 'p',
      text: 'Comme une entreprise générale, l’entreprise de rénovation générale facture souvent un prix global au client pour l’ensemble du chantier, en faisant intervenir différents corps de métier, avec ou sans sous-traitance selon son organisation interne. La différence tient surtout à l’échelle : des chantiers généralement plus petits, mais avec les mêmes exigences de coordination de planning et de responsabilité vis-à-vis du client final.',
    },
    { type: 'h2', text: 'Le défi propre à la rénovation : l’inconnu derrière les murs' },
    {
      type: 'p',
      text: 'Contrairement à une construction neuve, où les plans définissent précisément ce qui sera construit, une rénovation part d’un bâtiment existant dont l’état réel — structure, installations, matériaux utilisés à l’époque — n’est jamais totalement connu avant l’ouverture du chantier. Un sondage ou une visite préalable réduit le risque mais ne l’élimine jamais complètement, en particulier sur des bâtiments anciens.',
    },
    {
      type: 'list',
      items: [
        'Mur porteur découvert en cours de démolition, non identifié comme tel sur les plans existants ou en leur absence',
        'Installation électrique non conforme aux normes actuelles, découverte seulement après ouverture des cloisons',
        'Canalisations en mauvais état ou d’un matériau obsolète, révélées lors de travaux de plomberie',
        'Présence de matériaux nécessitant un diagnostic ou un traitement spécifique avant de poursuivre les travaux',
      ],
    },
    { type: 'h2', text: 'La clause d’imprévu structurel, indispensable dans ce métier' },
    {
      type: 'p',
      text: 'Un devis de rénovation générale sans clause d’imprévu structurel expose l’entreprise à devoir absorber seule le coût de toute découverte en cours de chantier, ou à devoir négocier un avenant en pleine tension avec un client surpris. Prévoir explicitement, dès le devis, la marche à suivre en cas de découverte imprévue — arrêt du poste concerné, devis complémentaire, validation du client avant reprise — protège les deux parties et évite les conflits les plus fréquents du métier.',
    },
    {
      type: 'callout',
      title: 'Le devis initial n’est jamais le prix final, et le client doit le savoir dès le départ',
      text: 'Annoncer d’emblée qu’une rénovation peut réserver des découvertes, et expliquer comment elles seront gérées contractuellement, vaut toujours mieux que de laisser le client croire à un prix figé qui ne l’est presque jamais dans ce métier.',
    },
    {
      type: 'cta',
      title: 'Un devis prêt à absorber les imprévus de la rénovation',
      text: 'Cantia permet de générer rapidement un avenant lié à une découverte imprévue, sans repartir de zéro sur le devis initial ni perdre le fil du chantier.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Comment intégrer une clause d’imprévu structurel dans un devis de rénovation ?',
      answer:
        'Il faut mentionner explicitement que le devis se base sur l’état visible du bâtiment au moment du chiffrage, et prévoir la procédure en cas de découverte imprévue : arrêt du poste concerné, établissement d’un devis complémentaire, validation du client avant reprise des travaux.',
    },
    {
      question: 'Un sondage préalable élimine-t-il tous les risques de découverte imprévue ?',
      answer:
        'Non, il les réduit mais ne les élimine jamais complètement, en particulier sur un bâtiment ancien où certains éléments structurels ou techniques ne sont visibles qu’une fois les travaux de démolition partielle engagés.',
    },
    {
      question: 'Comment facturer un avenant lié à une découverte imprévue sans perdre la confiance du client ?',
      answer:
        'La transparence est essentielle : documenter la découverte avec des photos, expliquer clairement pourquoi elle n’était pas visible au moment du devis initial, et présenter un devis complémentaire détaillé avant de reprendre les travaux, plutôt que de facturer après coup sans explication.',
    },
  ],
  relatedSlugs: [
    'renovation-apres-sinistre-degat-eau-assurance',
    'permis-construire-renovation-quand-necessaire',
    'previsionnel-tresorerie-entreprise-batiment',
    'renovation-batiment-historique-protege-suisse',
  ],
  relatedTradeSlug: 'entreprise-renovation',
};
