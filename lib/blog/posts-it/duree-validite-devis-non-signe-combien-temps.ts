import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'duree-validite-devis-non-signe-combien-temps',
  question: 'Per quanto tempo resta valido un preventivo non firmato prima di doverlo rifare?',
  title: 'Per quanto tempo resta valido un preventivo in Svizzera (e perché precisarlo cambia tutto)',
  description:
    'Senza menzione esplicita, un preventivo non firmato non ha una durata di validità legale fissa, il che espone l’azienda a dover onorare un prezzo vecchio mentre materiali e manodopera sono intanto aumentati.',
  excerpt:
    'Salvo che il documento precisasse esplicitamente una data limite, un cliente che torna tre mesi dopo con «il vostro preventivo» può legittimamente aspettarsi lo stesso prezzo.',
  category: 'Devis & facturation',
  keywords: ['durata validità preventivo', 'preventivo non firmato termine', 'preventivo scaduto', 'per quanto tempo è valido un preventivo', 'validità offerta di prezzo'],
  publishedAt: '2026-06-09',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Un preventivo impegna l’azienda che lo emette, ma nulla nel Codice delle obbligazioni fissa automaticamente una durata di validità. Senza menzione esplicita sul documento, un cliente può legittimamente considerare che il prezzo resti applicabile mesi dopo, anche se il costo dei materiali o della manodopera è intanto aumentato.',
    },
    { type: 'h2', text: 'Perché una data di validità esplicita protegge l’azienda' },
    {
      type: 'list',
      items: [
        'Il prezzo dei materiali fluttua, talvolta fortemente, su periodi di pochi mesi: un preventivo senza scadenza congela un rischio finanziario',
        'Un cantiere accettato tardivamente può non essere più compatibile con il planning o la disponibilità del team',
        'Senza un limite chiaro, un cliente può esigere il prezzo iniziale anche dopo un anno, in assenza di contestazione formale da parte dell’azienda',
      ],
    },
    {
      type: 'stat',
      value: '30 giorni',
      label: 'durata di validità più comune per un preventivo di lavori edili in Svizzera (una prassi d’uso, non un obbligo legale)',
    },
    { type: 'h2', text: 'Come formularlo correttamente' },
    {
      type: 'p',
      text: 'Basta una semplice frase: «Il presente preventivo è valido 30 giorni dalla data di emissione. Trascorso questo termine, potrà essere necessaria una rivalutazione dei prezzi.» Questa menzione trasforma un’ambiguità potenziale in una regola chiara, accettata dal cliente al momento della lettura del documento, senza necessità di successiva negoziazione.',
    },
    {
      type: 'callout',
      title: 'La durata di validità e la validità giuridica del preventivo sono due cose diverse',
      text: 'Un preventivo resta giuridicamente impegnativo finché non viene ritirato, anche dopo la sua data di validità indicativa. La menzione protegge soprattutto la coerenza del prezzo, non l’esistenza stessa dell’impegno.',
    },
    {
      type: 'cta',
      title: 'Una data di validità applicata automaticamente',
      text: 'Cantia calcola e visualizza la durata di validità di ogni preventivo a partire dai parametri della vostra azienda, senza doverci pensare a ogni documento.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Un preventivo ha una durata di validità legale fissa in Svizzera?',
      answer:
        'No, nessuna legge fissa una durata automatica: senza menzione esplicita sul documento, il preventivo può restare considerato valido indefinitamente.',
    },
    {
      question: 'Quale durata di validità scegliere per un preventivo di lavori?',
      answer:
        '30 giorni è la prassi più comune nell’edilizia svizzera, ma nulla impedisce di adattare questo termine secondo la volatilità dei prezzi del cantiere interessato.',
    },
    {
      question: 'Cosa succede se un cliente accetta un preventivo dopo la sua data di validità?',
      answer:
        'L’azienda può chiedere una rivalutazione del prezzo, a condizione che la menzione di validità figurasse chiaramente sul documento iniziale.',
    },
  ],
  relatedSlugs: [
    'validite-devis-signe-prix-qui-bouge',
    'rediger-devis-qui-inspire-confiance-client',
    'devis-gratuit-ou-payant-que-dit-la-loi',
  ],
};
