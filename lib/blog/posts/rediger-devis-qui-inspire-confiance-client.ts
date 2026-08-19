import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'rediger-devis-qui-inspire-confiance-client',
  question: 'Comment rédiger un devis qui donne confiance à un client particulier ?',
  title: 'Comment rédiger un devis qui inspire confiance à un client particulier',
  description:
    'Un devis clair, précis et bien présenté rassure autant qu’un prix compétitif. Voici les éléments concrets qui font la différence aux yeux d’un client particulier.',
  excerpt:
    'Deux devis au même prix ne se valent jamais aux yeux d’un client. Ce qui fait pencher la balance n’est presque jamais le chiffre en bas de page.',
  category: 'Devis & facturation',
  keywords: ['devis client', 'confiance', 'présentation devis', 'signature en ligne', 'acceptation devis'],
  publishedAt: '2026-02-19',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Un client particulier qui compare trois devis pour rénover sa salle de bains ne les compare presque jamais uniquement au prix. Il compare ce que chaque document lui laisse comprendre — ou lui cache — de ce pour quoi il va payer. Et sur ce terrain-là, un devis bien construit gagne régulièrement face à un devis moins cher mais illisible.',
    },
    { type: 'h2', text: '1. Détailler, jamais résumer en un chiffre' },
    {
      type: 'p',
      text: 'Un devis réduit à « Rénovation salle de bains — CHF 12’000 » inquiète plus qu’il ne rassure : le client ne sait pas ce qui est inclus, et se demande instinctivement ce qui manque. Détailler chaque poste — démolition, plomberie, carrelage, sanitaires, main-d’œuvre — avec quantité et prix unitaire donne une lecture claire de ce qui est réellement acheté, et neutralise d’avance la question « pourquoi c’est si cher ».',
    },
    { type: 'h2', text: '2. Dire clairement ce qui n’est pas inclus' },
    {
      type: 'list',
      items: [
        'Ce qui reste à la charge du client (évacuation de déchets non prévue, alimentation électrique existante non vérifiée, etc.)',
        'La validité du devis dans le temps (30 jours, par exemple) — un prix matériel peut bouger d’une semaine à l’autre',
        'Le montant d’un éventuel acompte, et à quel moment il est demandé',
      ],
    },
    {
      type: 'callout',
      title: 'La transparence sur les limites rassure plus qu’elle n’effraie',
      text: 'Un client qui découvre après coup un coût « caché » perd immédiatement confiance dans toute la suite de la collaboration. À l’inverse, un devis qui pose clairement ses limites dès le départ passe pour honnête — même quand ces limites impliquent un coût potentiel supplémentaire.',
    },
    { type: 'h2', text: '3. La mise en page compte plus qu’on ne le voudrait' },
    {
      type: 'p',
      text: 'Un devis propre — logo, coordonnées complètes, mise en page cohérente, sans police mélangée ni tableau mal aligné — projette un sérieux qui rassure avant même la lecture du contenu. C’est injuste sur le fond : la qualité du travail à venir n’a rien à voir avec la mise en page d’un document. Mais c’est un biais bien documenté dans la décision d’achat, et il joue contre vous si personne n’y prête attention.',
    },
    { type: 'h2', text: '4. Retirer la friction de la signature' },
    {
      type: 'p',
      text: 'Un devis envoyé en pièce jointe PDF qu’il faut imprimer, signer, scanner ajoute une étape logistique qui fait repousser la décision — pas par manque d’intérêt, juste par flemme. Un lien vers un portail où le client lit, pose une question et signe directement en ligne réduit ce frein sans rien retirer au sérieux du document.',
    },
    { type: 'h2', text: '5. Répondre vite, ou perdre le momentum' },
    {
      type: 'p',
      text: 'Un client qui reçoit une réponse dans l’heure garde une impression très différente de celui qui attend trois jours pour une simple question. Savoir précisément quand un devis a été ouvert permet de relancer au bon moment — ni trop tôt pour paraître pressant, ni trop tard pour laisser le client aller voir ailleurs.',
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
