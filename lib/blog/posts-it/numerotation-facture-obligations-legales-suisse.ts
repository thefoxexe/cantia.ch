import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'numerotation-facture-obligations-legales-suisse',
  question: 'Serve una numerazione continua delle fatture in Svizzera, e cosa si rischia a non rispettarla?',
  title: 'Numerazione delle fatture in Svizzera: perché la continuità non è un dettaglio',
  description:
    'Un numero di fattura saltato, riutilizzato o disordinato attira immediatamente l’attenzione durante un controllo fiscale, poiché la continuità numerica è uno dei primi punti verificati.',
  excerpt:
    'Due fatture con lo stesso numero, o una serie che salta da 042 a 057 senza spiegazione: è esattamente il tipo di dettaglio che un controllo dell’AFC individua in pochi secondi.',
  category: 'Devis & facturation',
  keywords: ['numerazione fattura svizzera', 'continuità numeri fattura', 'obblighi fatturazione AFC', 'fattura mancante controllo fiscale', 'serie di fatture'],
  publishedAt: '2026-06-15',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'La numerazione delle fatture non è solo una questione di ordine: è uno dei primi elementi verificati durante un controllo dell’Amministrazione federale delle contribuzioni (AFC). Una serie continua e cronologica dimostra che nessuna fattura è stata emessa e poi occultata; una serie con buchi o disordinata solleva immediatamente una domanda.',
    },
    { type: 'h2', text: 'Le regole di base da rispettare' },
    {
      type: 'list',
      items: [
        'Ogni fattura deve portare un numero unico, mai riutilizzato, anche dopo un annullamento',
        'La serie deve restare cronologica: un numero più recente non deve mai corrispondere a una data anteriore a un numero precedente',
        'Una fattura annullata deve restare visibile nella serie (con la sua nota di credito associata), non semplicemente eliminata dal sistema',
        'Un formato coerente (ad esempio 2026-001, 2026-002…) facilita il monitoraggio e il controllo, senza essere un obbligo formale rigoroso',
      ],
    },
    {
      type: 'callout',
      title: 'Un «buco» nella numerazione non è automaticamente una frode, a condizione di poterlo spiegare',
      text: 'Una fattura annullata prima dell’invio, ad esempio, può legittimamente lasciare un numero inutilizzato. L’essenziale è poter ricostruire il perché, con una nota di credito o un giustificativo associato.',
    },
    { type: 'h2', text: 'Il rischio concreto di una numerazione mal gestita' },
    {
      type: 'p',
      text: 'Più serie di fatture gestite separatamente (ad esempio un blocchetto manuale in parallelo a un software) è l’errore più frequente tra le piccole imprese. Ogni sistema genera la propria numerazione, creando doppioni o buchi inspiegabili al momento di riunire tutto per la contabilità annuale.',
    },
    {
      type: 'cta',
      title: 'Una numerazione continua, gestita automaticamente',
      text: 'Cantia attribuisce un numero unico e cronologico a ogni fattura, senza mai riutilizzare un numero né creare doppioni tra più fonti.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'La numerazione continua delle fatture è obbligatoria in Svizzera?',
      answer:
        'Non è formalizzata come una legge rigorosa di formato, ma l’AFC si aspetta una serie cronologica e tracciabile. Un controllo fiscale verifica sistematicamente questa continuità.',
    },
    {
      question: 'Si può riutilizzare un numero di fattura annullata?',
      answer:
        'No: una fattura annullata deve restare identificabile nella serie con una nota di credito associata, mai essere sostituita riutilizzando il suo numero.',
    },
    {
      question: 'Cosa rischia un’azienda con una numerazione disordinata?',
      answer:
        'Un controllo fiscale può interpretare le incongruenze come un segno di occultamento di fatturato, anche in assenza di frode reale, cosicché l’onere della prova ricade allora sull’azienda.',
    },
  ],
  relatedSlugs: [
    'note-de-credit-facture-rectificative-suisse',
    'duree-conservation-devis-factures-suisse',
    'mentions-obligatoires-facture-suisse-tva',
  ],
};
