import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'duree-conservation-devis-factures-suisse',
  question: 'Per quanto tempo conservare i propri preventivi e fatture in Svizzera?',
  title: 'Per quanto tempo conservare preventivi e fatture in Svizzera?',
  description:
    'Il Codice delle obbligazioni (art. 958f) impone una conservazione di 10 anni per i documenti contabili, fatture incluse, un termine che decorre dalla fine dell’esercizio, non dalla data del documento.',
  excerpt:
    'Una fattura di marzo 2026 deve restare accessibile fino a fine 2036, non fino a marzo 2036. Un dettaglio di calcolo del termine che quasi tutte le aziende sbagliano.',
  category: 'Juridique & normes',
  keywords: ['conservazione documenti', 'archiviazione fatture', 'termine legale', 'codice delle obbligazioni', 'contabilità'],
  publishedAt: '2026-02-16',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Si possono gettare i preventivi e le fatture di un cantiere concluso da cinque anni? Il principio svizzero è semplice, ma il calcolo esatto del termine sorprende quasi tutti: non è mai la data del documento che conta, è la fine dell’esercizio contabile in cui si inserisce.',
    },
    { type: 'h2', text: 'La regola: 10 anni, dalla fine dell’esercizio' },
    {
      type: 'p',
      text: 'L’art. 958f del Codice delle obbligazioni impone di conservare i libri contabili, i giustificativi (comprese le fatture emesse e ricevute), le relazioni sulla gestione e i rapporti di revisione per dieci anni. Il termine non decorre dalla data riportata sul documento, ma dalla fine dell’esercizio contabile a cui si riferisce.',
    },
    {
      type: 'callout',
      title: 'L’esempio che rende ovvio il calcolo',
      text: 'Una fattura datata 15 marzo 2026, per un’azienda il cui esercizio termina il 31 dicembre, deve restare accessibile fino al 31 dicembre 2036, e non fino al 15 marzo 2036. Nove mesi in più rispetto a quanto la maggior parte delle persone calcola istintivamente.',
    },
    { type: 'h2', text: 'Quali documenti sono interessati' },
    {
      type: 'list',
      items: [
        'Fatture emesse ai clienti e fatture ricevute da fornitori/subappaltatori',
        'Preventivi accettati che fungono da base contrattuale (collegati alla contabilità del cantiere)',
        'Libri contabili e giustificativi in senso lato',
        'Relazioni sulla gestione e rapporti di revisione, se applicabili',
      ],
    },
    { type: 'h2', text: 'Carta o digitale: cosa accetta davvero la legge' },
    {
      type: 'p',
      text: 'La legge non impone un supporto preciso: carta, forma elettronica, o qualsiasi forma equivalente vanno bene, a condizione che il collegamento con le operazioni interessate resti garantito e che l’accessibilità sia assicurata per tutta la durata legale. In pratica, una conservazione digitale ben salvata è ampiamente accettata, e infinitamente più rapida da ritrovare rispetto a una pila di raccoglitori cartacei frugati in un pomeriggio di controllo fiscale.',
    },
    { type: 'h2', text: 'Perché conta, al di là dell’obbligo' },
    {
      type: 'p',
      text: 'Ritrovare rapidamente un preventivo o una fattura di un cantiere vecchio di diversi anni serve ben oltre la conformità legale: una controversia di garanzia che riemerge, un controllo fiscale, o semplicemente un cliente che richiede nuovamente una copia di un documento vecchio. Una classificazione per cantiere, ricercabile, evita di dover frugare in un disco rigido o in una casella email anni dopo, spesso nel momento peggiore per farlo.',
    },
    {
      type: 'cta',
      title: 'Ogni preventivo e fattura, ritrovabile con un clic',
      text: 'Cantia conserva automaticamente ogni preventivo e fattura generati, classificati per cantiere e per cliente, senza limite di tempo né classificazione manuale da tenere personalmente.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Per quanto tempo un’azienda svizzera deve conservare le sue fatture?',
      answer:
        'Dieci anni, conformemente all’art. 958f del Codice delle obbligazioni, applicabile ai documenti contabili di cui fanno parte le fatture emesse e ricevute.',
    },
    {
      question: 'Il termine di 10 anni decorre dalla data della fattura?',
      answer:
        'No. Decorre dalla fine dell’esercizio contabile in cui si inserisce la fattura, non dalla sua data di emissione propria.',
    },
    {
      question: 'Si possono conservare le proprie fatture solo in formato digitale?',
      answer:
        'Sì, la legge accetta la conservazione elettronica a condizione che il collegamento con le transazioni interessate sia garantito e che l’accessibilità sia assicurata per tutta la durata legale.',
    },
  ],
  relatedSlugs: [
    'delai-paiement-facture-artisan-code-obligations',
    'norme-sia-118-devis-obligatoire',
    'qr-facture-obligatoire-2026',
  ],
};
