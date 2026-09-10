import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'avenant-chantier-plus-value-moins-value',
  question: 'Come fatturare una variante (plusvalore o minusvalore) durante il cantiere?',
  title: 'Fatturare una variante durante il cantiere senza farsi incastrare',
  description:
    'Un cliente che chiede una modifica durante il cantiere non firma quasi mai una variante scritta sul momento. È esattamente questo che trasforma un servizio reso in lavoro gratuito.',
  excerpt:
    '«Visto che ci siete, aggiungete anche questo»: la frase più redditizia da sentire su un cantiere, e la più pericolosa da non fatturare correttamente.',
  category: 'Devis & facturation',
  keywords: ['variante', 'plusvalore', 'minusvalore', 'lavori supplementari', 'modifica preventivo'],
  publishedAt: '2026-04-27',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: '«Visto che siete qui, potreste anche…». È la frase che avvia metà delle varianti di cantiere, quasi sempre a voce, quasi sempre senza che un nuovo prezzo sia chiaramente stabilito prima che il lavoro inizi.',
    },
    { type: 'h2', text: 'Il plusvalore: fatturarlo prima, non dopo' },
    {
      type: 'p',
      text: 'Un’aggiunta di lavoro eseguita senza accordo preliminare sul prezzo lascia l’azienda in posizione di debolezza al momento di fatturare: il cliente scopre l’importo a posteriori, senza averlo potuto anticipare, e quasi sempre si apre in quel momento una trattativa sfavorevole. La regola semplice: una variante, anche breve e informale, va quantificata e fatta convalidare prima di iniziare il lavoro supplementare. Un messaggio scritto con il prezzo basta, non serve un documento formale di più pagine.',
    },
    {
      type: 'callout',
      title: 'La trappola del «non ci vorrà molto»',
      text: 'Un piccolo plusvalore non fatturato oggi diventa un precedente silenzioso: il cliente si abitua ad aggiustamenti gratuiti, e la prossima richiesta (più consistente) arriva con la stessa aspettativa implicita. Fatturare sistematicamente, anche un piccolo importo, mantiene il riferimento chiaro per tutto il resto del cantiere.',
    },
    { type: 'h2', text: 'Il minusvalore: altrettanto importante da documentare' },
    {
      type: 'p',
      text: 'Un cliente che rinuncia a una prestazione prevista nel preventivo iniziale (rinuncia a una finitura, riduce una superficie) deve vedere l’importo corrispondente chiaramente dedotto. Questa deduzione deve tuttavia essere anch’essa messa per iscritto, con il nuovo totale. Senza questa traccia, una contestazione successiva sull’importo finale diventa un punto di disaccordo evitabile.',
    },
    { type: 'h2', text: 'Cosa dovrebbe sempre precisare una variante' },
    {
      type: 'list',
      items: [
        'La descrizione precisa di ciò che cambia (aggiunta o rimozione) rispetto al preventivo iniziale',
        'L’importo esatto del plusvalore o minusvalore, quantificato separatamente',
        'L’eventuale impatto sul termine di consegna, se la modifica ne ha uno',
        'Il riferimento esplicito al preventivo iniziale che modifica',
      ],
    },
    {
      type: 'p',
      text: 'Su un cantiere con più varianti successive, tenere traccia di ciascuna evita anche una confusione frequente a fine cantiere: ricostruire, al momento della fattura finale, tutti gli aggiustamenti accumulati senza un documento di riferimento chiaro per ciascuno.',
    },
    {
      type: 'cta',
      title: 'Una variante, quantificata e inviata in pochi minuti',
      text: 'Cantia permette di creare rapidamente una variante collegata al preventivo iniziale, con il nuovo totale ricalcolato automaticamente, poi inviata al cliente prima che il lavoro supplementare inizi.',
      buttonLabel: 'Scoprire il modulo Preventivi',
    },
  ],
  faq: [
    {
      question: 'Bisogna fatturare un piccolo plusvalore richiesto durante il cantiere?',
      answer:
        'Sì, sistematicamente, anche per un piccolo importo: questo mantiene un riferimento chiaro ed evita che il cliente si abitui ad aggiustamenti gratuiti.',
    },
    {
      question: 'Quando bisogna far convalidare il prezzo di una variante?',
      answer:
        'Prima di iniziare il lavoro supplementare, non dopo. Un messaggio scritto con il prezzo basta a garantire l’accordo senza un documento formale pesante.',
    },
    {
      question: 'Un minusvalore deve essere anch’esso documentato per iscritto?',
      answer:
        'Sì: la deduzione e il nuovo totale devono essere chiaramente messi per iscritto, per evitare qualsiasi contestazione successiva sull’importo finale.',
    },
  ],
  relatedSlugs: [
    'validite-devis-signe-prix-qui-bouge',
    'rediger-devis-qui-inspire-confiance-client',
    'client-refuse-payer-solde-final-que-faire',
  ],
};
