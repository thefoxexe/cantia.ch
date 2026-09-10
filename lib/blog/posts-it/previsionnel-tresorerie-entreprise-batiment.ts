import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'previsionnel-tresorerie-entreprise-batiment',
  question: 'Come fare un previsionale di liquidità semplice per un’impresa dell’edilizia?',
  title: 'Previsionale di liquidità per un’impresa dell’edilizia: il metodo senza complicazioni inutili',
  description:
    'Non serve un piano finanziario complesso per anticipare un calo di liquidità: un previsionale a 30-60-90 giorni basato sulle fatture in sospeso e sugli oneri noti basta a vedere arrivare i problemi.',
  excerpt:
    'La liquidità non crolla quasi mai senza segnali premonitori. Il problema è che senza previsionale, questo segnale resta invisibile fino al giorno in cui il conto è già in rosso.',
  category: 'Chantier & rentabilité',
  keywords: ['previsionale liquidità edilizia', 'liquidità impresa costruzione', 'gestione cashflow artigiano', 'previsione di liquidità semplice', 'anticipare problema di liquidità'],
  publishedAt: '2026-07-05',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un previsionale di liquidità non deve essere un esercizio finanziario complesso riservato alle grandi imprese. Per una PMI dell’edilizia, un previsionale semplice a 30, 60 e 90 giorni, basato su dati già disponibili (fatture emesse, oneri ricorrenti noti), è ampiamente sufficiente per anticipare un calo prima che diventi un problema.',
    },
    { type: 'h2', text: 'I dati da riunire' },
    {
      type: 'list',
      items: [
        'Le fatture già emesse e la loro scadenza di pagamento prevista',
        'Gli acconti attesi sui cantieri in corso',
        'Gli oneri fissi ricorrenti (salari, affitto, assicurazioni, leasing veicoli)',
        'Le spese puntuali già impegnate ma non ancora pagate (fornitori, subappaltatori)',
      ],
    },
    { type: 'h2', text: 'Il metodo su tre orizzonti' },
    {
      type: 'table',
      headers: ['Orizzonte', 'Cosa rivela'],
      rows: [
        ['30 giorni', 'Il rischio immediato: un calo di liquidità visibile fin da subito'],
        ['60 giorni', 'La tendenza (l’attività in corso basta a coprire gli oneri fissi?)'],
        ['90 giorni', 'Il margine di manovra per decidere un investimento o un’assunzione'],
      ],
    },
    {
      type: 'callout',
      title: 'Il previsionale ha valore solo se aggiornato regolarmente',
      text: 'Un previsionale congelato al giorno della sua creazione perde tutta la sua utilità in poche settimane. Ogni nuova fattura emessa o ogni pagamento ricevuto deve aggiornarlo per restare affidabile.',
    },
    {
      type: 'p',
      text: 'Il vero beneficio di un previsionale non è predire il futuro con precisione, ma individuare un calo diverse settimane in anticipo: abbastanza presto per sollecitare una fattura in ritardo, rinviare un acquisto non urgente, o negoziare una dilazione con un fornitore, piuttosto che scoprire il problema il giorno in cui il conto è già negativo.',
    },
    {
      type: 'cta',
      title: 'Una previsione di liquidità automatica',
      text: 'Il modulo Liquidità di Cantia proietta il Suo saldo futuro a partire dalle fatture in sospeso e dalle spese ricorrenti, aggiornato in tempo reale.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Un previsionale di liquidità deve essere complesso per essere utile?',
      answer:
        'No, un previsionale semplice a 30-60-90 giorni basato sulle fatture in sospeso e sugli oneri noti è ampiamente sufficiente per una PMI dell’edilizia.',
    },
    {
      question: 'Con quale frequenza bisogna aggiornare un previsionale di liquidità?',
      answer:
        'Idealmente a ogni nuova fattura emessa o a ogni pagamento ricevuto. Un previsionale congelato perde rapidamente la sua affidabilità.',
    },
    {
      question: 'Qual è il principale beneficio di un previsionale di liquidità?',
      answer:
        'Individuare un calo diverse settimane in anticipo, abbastanza presto per agire (sollecito, rinvio di acquisto, negoziazione con il fornitore) piuttosto che scoprirlo quando il conto è già negativo.',
    },
  ],
  relatedSlugs: [
    'pourquoi-entreprises-batiment-font-faillite-suisse',
    'calculer-prix-de-revient-chantier-batiment',
    'relancer-client-facture-impayee-sans-perdre-client',
  ],
};
