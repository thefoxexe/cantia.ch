import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'gestion-chantier-devis-couvreur-toiture-suisse',
  question: 'Come deve calcolare un copritetto un preventivo di tetto tenendo conto del meteo e della sicurezza?',
  title: 'Copritetto: calcolare un tetto senza farsi cogliere dal meteo',
  description:
    'Un cantiere di tetto dipende direttamente dal meteo e impone misure di sicurezza che hanno un costo reale. Come integrarle nel preventivo senza nasconderle in un margine invisibile.',
  excerpt:
    'Nessun altro mestiere dell’edilizia è così direttamente esposto al meteo quanto la copertura. Un preventivo di tetto che non prevede né margine meteo né costo di sicurezza fa quindi una scommessa che finisce spesso per perdere.',
  category: 'Métiers du bâtiment',
  keywords: ['preventivo copritetto', 'fatturazione tetto Svizzera', 'prezzo ristrutturazione tetto', 'sicurezza cantiere tetto', 'preventivo carpenteria copertura'],
  publishedAt: '2026-09-07',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un cantiere di tetto non può avanzare sotto la pioggia, né talvolta con un vento troppo forte. Un preventivo che non accantona questo rischio meteo trasforma ogni intemperie in una perdita secca per l’impresa, poiché il cliente paga solo il lavoro effettivamente svolto.',
    },
    { type: 'h2', text: 'Cosa deve comparire esplicitamente nel preventivo' },
    {
      type: 'list',
      items: [
        'Smontaggio della copertura esistente e smaltimento dei rifiuti (spesso sottovalutato)',
        'Carpenteria: eventuale riparazione o rinforzo, da calcolare dopo ispezione, mai alla cieca',
        'Copertura nuova (tegole, ardesia, lamiera) con il costo della messa in sicurezza del cantiere incluso',
        'Lattoneria, grondaie e scarichi (una voce distinta spesso dimenticata nel prezzo globale «tetto»)',
      ],
    },
    { type: 'h2', text: 'Il costo della sicurezza non è negoziabile' },
    {
      type: 'p',
      text: 'Ponteggio, linea vita, parapetto perimetrale: questi dispositivi di sicurezza in quota hanno un costo reale di noleggio e montaggio, che deve comparire chiaramente nel preventivo piuttosto che essere assorbito silenziosamente nel prezzo al m² di copertura. Altrimenti, esiste la tentazione di ridurli sui cantieri più tirati finanziariamente.',
    },
    {
      type: 'stat',
      value: '5-10 %',
      label: 'quota del budget di un cantiere di tetto tipicamente dedicata ai dispositivi di sicurezza in quota (ponteggio, linea vita, protezioni)',
    },
    {
      type: 'callout',
      title: 'Una clausola meteo protegge la relazione con il cliente tanto quanto il margine',
      text: 'Prevedere esplicitamente nel preventivo che un blocco meteo rinvia la pianificazione senza penale evita una negoziazione tesa a metà cantiere: il cliente comprende infatti meglio un rinvio annunciato in anticipo di un ritardo scoperto sul posto.',
    },
    {
      type: 'cta',
      title: 'Segua l’avanzamento del cantiere dal telefono, anche in quota',
      text: 'Cantia permette di aggiungere foto e rapporti di avanzamento direttamente dal cantiere, utile per documentare un blocco meteo o un imprevisto di carpenteria scoperto durante lo smontaggio.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Come integrare il rischio meteo in un preventivo di tetto?',
      answer:
        'Prevedendo esplicitamente una clausola di rinvio senza penale in caso di intemperie che impediscano il lavoro in quota. Ciò protegge l’impresa ed evita una negoziazione tesa a metà cantiere.',
    },
    {
      question: 'Bisogna fatturare separatamente i dispositivi di sicurezza su un cantiere di tetto?',
      answer:
        'È consigliabile: ponteggio, linea vita e parapetto hanno un costo reale di noleggio e montaggio che deve restare visibile, piuttosto che essere diluito nel prezzo al m² di copertura.',
    },
    {
      question: 'Si può calcolare una riparazione di carpenteria senza ispezione preventiva?',
      answer:
        'No, o solo in modo molto approssimativo, poiché lo stato reale di una carpenteria è spesso visibile solo dopo lo smontaggio della copertura esistente, da cui l’interesse di un’ispezione prima del preventivo definitivo.',
    },
  ],
  relatedSlugs: [
    'retard-chantier-meteo-obligations-contractuelles',
    'assurance-chantier-tous-risques-ectr-obligatoire',
    'application-hors-ligne-chantier-pourquoi-important',
  ],
};
