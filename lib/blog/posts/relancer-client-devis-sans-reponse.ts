import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'relancer-client-devis-sans-reponse',
  question: 'Comment relancer un client qui ne répond plus après l’envoi d’un devis ?',
  title: 'Comment relancer un client qui ne répond plus après un devis',
  description:
    'Un silence après un devis n’est pas forcément un refus. Le calendrier de relance à respecter, le ton à adopter et les erreurs qui font perdre un chantier encore possible.',
  excerpt:
    'Un devis envoyé qui reste sans réponse n’est pas toujours perdu. La façon de relancer change souvent tout, dans un sens comme dans l’autre.',
  category: 'Croissance & acquisition',
  keywords: ['relancer client devis sans réponse', 'devis sans nouvelles client', 'relance devis avant expiration'],
  publishedAt: '2026-09-29',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un devis envoyé, puis plus rien. Ni oui, ni non. C’est l’une des situations les plus courantes dans le bâtiment, et aussi l’une des plus mal gérées : par peur de déranger, beaucoup d’entreprises attendent trop longtemps, ou n’osent jamais relancer du tout.',
    },
    { type: 'h2', text: 'Le silence n’est pas toujours un refus' },
    {
      type: 'p',
      text: 'Un client qui ne répond pas compare souvent encore d’autres devis, attend une validation budgétaire, ou a simplement laissé le sujet de côté quelques jours sous la pression du quotidien. Interpréter un silence comme un refus définitif fait perdre des chantiers qui restaient parfaitement accessibles avec une simple relance.',
    },
    { type: 'h2', text: 'Un calendrier de relance raisonnable' },
    {
      type: 'list',
      items: [
        'Une première relance courte quelques jours après l’envoi du devis, sans insister, juste pour confirmer la bonne réception',
        'Une deuxième relance plus tard, avant l’expiration de la validité du devis, pour rappeler l’échéance sans mettre de pression excessive',
        'Au-delà, laisser la porte ouverte sans multiplier les messages : un dernier message bref suffit largement',
      ],
    },
    {
      type: 'callout',
      title: 'La date de validité du devis est un argument de relance naturel, pas une contrainte',
      text: 'Rappeler que le devis expire à une date précise donne une raison concrète et neutre de relancer, sans donner l’impression de mettre la pression sur le client. C’est souvent le déclic qui manquait pour obtenir une réponse.',
    },
    { type: 'h2', text: 'Le ton à adopter' },
    {
      type: 'p',
      text: 'Une relance efficace reste courte, factuelle et sans reproche. Demander simplement si le devis a bien été reçu, si des questions restent en suspens, ou proposer un court appel pour clarifier un point technique fonctionne mieux qu’un message qui sous-entend une attente d’urgence.',
    },
    { type: 'h2', text: 'Ce qu’il ne faut pas faire' },
    {
      type: 'list',
      items: [
        'Relancer trop souvent ou trop rapprochées : cela agace plus que cela convainc',
        'Adopter un ton insistant ou culpabilisant qui met le client sur la défensive',
        'Baisser le prix spontanément dans la relance, sans savoir pourquoi le client hésite réellement',
      ],
    },
    {
      type: 'cta',
      title: 'Des relances de devis qui partent au bon moment',
      text: 'Avec Cantia, chaque devis en attente peut être relancé automatiquement à intervalle raisonnable, sans avoir à y penser manuellement ni à laisser filer une échéance de validité.',
      buttonLabel: 'Essayer gratuitement',
    },
  ],
  faq: [
    {
      question: 'Au bout de combien de temps faut-il relancer un client après un devis ?',
      answer:
        'Une première relance quelques jours après l’envoi reste raisonnable, suivie d’une deuxième plus tard, avant l’expiration de la validité du devis. Au-delà, mieux vaut espacer largement plutôt que d’insister trop souvent.',
    },
    {
      question: 'Un client qui ne répond pas a-t-il forcément choisi un concurrent ?',
      answer:
        'Pas nécessairement. Le silence traduit souvent une décision encore en cours, une comparaison de devis non terminée ou simplement un oubli. Une relance courte et sans pression permet souvent de le savoir.',
    },
    {
      question: 'Faut-il baisser le prix dans une relance de devis sans réponse ?',
      answer:
        'Non, pas d’emblée. Il est préférable de d’abord comprendre la raison du silence (question technique, délai, budget) avant d’envisager un ajustement, plutôt que de baisser le prix sans savoir ce qui bloque réellement.',
    },
  ],
  relatedSlugs: ['relancer-client-facture-impayee-sans-perdre-client', 'negocier-prix-client-compare-plusieurs-devis', 'vitesse-reponse-devis-taux-conversion-batiment'],
};
