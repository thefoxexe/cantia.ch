import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'rediger-devis-qui-inspire-confiance-client',
  question: 'Comment rédiger un devis qui donne confiance à un client particulier ?',
  title: 'Comment rédiger un devis qui inspire confiance à un client particulier',
  description:
    'Un devis clair, précis et bien présenté rassure autant qu’un prix compétitif. Voici les éléments concrets qui font la différence aux yeux d’un client particulier.',
  excerpt:
    'Deux devis au même prix ne se valent pas aux yeux d’un client : la clarté et la présentation pèsent souvent plus que le montant final dans la décision.',
  category: 'Devis & facturation',
  keywords: ['devis client', 'confiance', 'présentation devis', 'signature en ligne', 'acceptation devis'],
  publishedAt: '2026-02-19',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Un client particulier qui compare plusieurs devis pour des travaux de rénovation ne les compare pas seulement au prix final. Il compare aussi ce que chaque document lui laisse comprendre — ou pas — de ce pour quoi il va payer.',
    },
    { type: 'h2', text: '1. Détailler les postes, pas un seul chiffre global' },
    {
      type: 'p',
      text: 'Un devis réduit à une ligne "Rénovation salle de bains — CHF 12’000" inquiète plus qu’il ne rassure : le client ne sait pas ce qui est inclus, et se demande instinctivement ce qui manque. Détailler chaque poste (démolition, plomberie, carrelage, sanitaires, main-d’œuvre) avec quantité et prix unitaire donne une lecture claire de ce qui est réellement acheté.',
    },
    { type: 'h2', text: '2. Être précis sur ce qui n’est pas inclus' },
    {
      type: 'list',
      items: [
        'Mentionner explicitement ce qui reste à la charge du client (évacuation de déchets non prévue, alimentation électrique existante non vérifiée, etc.)',
        'Préciser la validité du devis dans le temps (ex. 30 jours) — un prix matériel peut varier',
        'Indiquer clairement si un acompte est demandé, son montant et à quel moment',
      ],
    },
    {
      type: 'callout',
      title: 'La transparence sur les limites rassure plus qu’elle n’effraie',
      text: 'Un client qui découvre après coup un coût "caché" perd immédiatement confiance dans toute future collaboration. À l’inverse, un devis qui pose clairement ses limites dès le départ est perçu comme honnête, même si ces limites impliquent un coût potentiel supplémentaire.',
    },
    { type: 'h2', text: '3. Soigner la présentation visuelle' },
    {
      type: 'p',
      text: 'Un devis mis en page proprement — logo, coordonnées complètes, mise en page cohérente, sans police mélangée ni tableau mal aligné — projette un niveau de sérieux qui rassure sur la qualité du travail à venir, avant même la lecture du contenu. C’est injuste sur le fond (la qualité du travail n’a rien à voir avec la mise en page du devis), mais c’est un biais bien documenté dans la décision d’achat.',
    },
    { type: 'h2', text: '4. Faciliter l’acceptation' },
    {
      type: 'p',
      text: 'Un devis envoyé en pièce jointe PDF qu’il faut imprimer, signer et scanner ajoute une friction inutile — certains clients repoussent la décision simplement à cause de cette étape logistique. Un lien vers un portail où le client peut lire, poser une question et signer directement en ligne réduit ce frein, sans rien enlever au sérieux du document.',
    },
    { type: 'h2', text: '5. Répondre vite après l’envoi' },
    {
      type: 'p',
      text: 'Un client qui reçoit une réponse à sa question dans l’heure retient une impression de professionnalisme très différente de celui qui attend trois jours. Savoir quand un devis a été ouvert par le client permet de relancer au bon moment, ni trop tôt ni trop tard.',
    },
    {
      type: 'cta',
      title: 'Des devis clairs, signés en ligne',
      text: 'Cantia génère des devis détaillés et bien présentés, avec un portail client où le devis se consulte, se discute et se signe en ligne — vous êtes notifié dès qu’il est ouvert.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Faut-il détailler chaque poste d’un devis ou donner un prix global ?',
      answer:
        'Le détail poste par poste (quantité, prix unitaire) est presque toujours préférable : il rassure le client sur ce qui est réellement inclus et facilite la comparaison avec d’autres devis reçus.',
    },
    {
      question: 'Comment gérer les imprévus possibles sur un devis de rénovation ?',
      answer:
        'En les mentionnant explicitement comme exclusions ou en prévoyant une clause claire de facturation complémentaire en cas de découverte imprévue — la transparence sur ce point renforce la confiance plutôt que de l’affaiblir.',
    },
    {
      question: 'La signature électronique d’un devis a-t-elle une valeur en Suisse ?',
      answer:
        'Une signature électronique simple (comme une validation en ligne horodatée) vaut acceptation contractuelle dans la plupart des cas pratiques du bâtiment ; pour des enjeux juridiques plus élevés, une signature électronique qualifiée peut être recommandée.',
    },
  ],
  relatedSlugs: [
    'calculer-prix-devis-renovation-suisse',
    'norme-sia-118-devis-obligatoire',
    'bexio-vs-cantia-logiciel-batiment',
  ],
};
