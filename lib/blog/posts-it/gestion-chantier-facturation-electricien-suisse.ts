import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'gestion-chantier-facturation-electricien-suisse',
  question: 'Come deve gestire un elettricista indipendente i propri preventivi, le ore e la fatturazione?',
  title: 'Elettricista indipendente: gestire preventivi, ore e fatturazione senza perderci le serate',
  description:
    'Tra i punti elettrici da calcolare, le ore ripartite su più cantieri nella stessa giornata e i controlli NIBT da non dimenticare, la gestione amministrativa di un elettricista ha le sue trappole. Metodo concreto.',
  excerpt:
    'Un elettricista cambia spesso cantiere tre o quattro volte al giorno. La vera difficoltà non è quindi calcolare un punto elettrico, ma ritrovare la sera chi ha fatto cosa, dove, e per quanto tempo.',
  category: 'Métiers du bâtiment',
  keywords: ['preventivo elettricista indipendente', 'fatturazione elettricista Svizzera', 'gestione cantiere elettricità', 'software elettricista edilizia', 'ore elettricista più cantieri'],
  publishedAt: '2026-08-30',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un idraulico o un muratore resta spesso una giornata intera sullo stesso cantiere. Un elettricista, invece, concatena frequentemente più interventi brevi nella stessa giornata (una riparazione al mattino, una messa a norma al pomeriggio, un appuntamento per un preventivo a fine giornata). La difficoltà non è quindi solo calcolare bene, ma non perdere neanche un’ora tra due spostamenti.',
    },
    { type: 'h2', text: 'Calcolare per punto, per circuito, o a forfait?' },
    {
      type: 'list',
      items: [
        'Punti elettrici (prese, interruttori, corpi illuminanti): prezzo unitario, pratico per i preventivi di ristrutturazione dettagliati',
        'Circuiti completi (quadro, messa a terra, protezione differenziale): a forfait, perché il tempo varia poco da un’installazione standard all’altra',
        'Riparazione e intervento d’urgenza: a economia oraria, con un minimo fatturabile chiaramente comunicato al cliente',
        'Messa a norma NIBT: a forfait dopo sopralluogo, mai alla cieca per telefono',
      ],
    },
    { type: 'h2', text: 'Il vero costo nascosto: il tempo tra due cantieri' },
    {
      type: 'p',
      text: 'Uno spostamento non fatturato, moltiplicato per tre o quattro cantieri al giorno, rappresenta rapidamente mezza giornata di lavoro non valorizzata a settimana. La questione non è solo fatturare il tragitto (alcuni lo fanno, altri lo integrano nella tariffa oraria), ma contarlo almeno come tempo non disponibile per altri incarichi, per non sovraccaricare la propria giornata.',
    },
    {
      type: 'stat',
      value: '3-4',
      label: 'cantieri diversi trattati in media nella stessa giornata da un elettricista indipendente in intervento corrente',
    },
    {
      type: 'callout',
      title: 'Il controllo NIBT non è un’opzione facoltativa sul preventivo',
      text: 'Un’installazione elettrica modificata o creata deve essere annunciata e controllata conformemente all’ispezione degli impianti elettrici (NIBT). Dimenticare questo punto sul preventivo significa rischiare di doverlo fatturare con urgenza: il prezzo ottenuto è allora spesso meno favorevole, e inferiore a quanto costa realmente in tempo.',
    },
    {
      type: 'cta',
      title: 'Le Sue ore, registrate cantiere per cantiere, in pochi secondi',
      text: 'Cantia permette di registrare le proprie ore direttamente dal telefono tra due interventi, cantiere per cantiere, il che permette di ritrovare a fine mese esattamente chi ha fatto cosa, senza ricostruire la giornata a memoria.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Bisogna fatturare un preventivo di elettricità al punto o a forfait?',
      answer:
        'I due si combinano: il prezzo unitario per punto elettrico è adatto alle ristrutturazioni dettagliate, il forfait è più adatto ai circuiti completi standardizzati (quadro, messa a terra) dove il tempo varia poco.',
    },
    {
      question: 'Come fattura un elettricista i propri spostamenti tra più cantieri?',
      answer:
        'Non esiste una regola unica: alcuni li integrano nella tariffa oraria, altri li fatturano separatamente. L’essenziale è deciderlo chiaramente in anticipo e comunicarlo al cliente, non assorbirlo silenziosamente nel margine.',
    },
    {
      question: 'Il controllo NIBT deve figurare sul preventivo di elettricità?',
      answer:
        'Sì, poiché ogni installazione creata o modificata deve essere annunciata e controllata. Integrarlo nel preventivo fin dall’inizio evita una fatturazione d’urgenza, meno vantaggiosa, una volta terminato il cantiere.',
    },
  ],
  relatedSlugs: [
    'application-hors-ligne-chantier-pourquoi-important',
    'calculer-heures-travail-ouvrier-minutes-decimales',
    'facturation-heures-regie-batiment-comment-faire',
  ],
  relatedTradeSlug: 'electricien',
};
