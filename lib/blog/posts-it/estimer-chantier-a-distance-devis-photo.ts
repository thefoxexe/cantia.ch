import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'estimer-chantier-a-distance-devis-photo',
  question: 'Si può stimare seriamente un cantiere a distanza, senza spostarsi?',
  title: 'Stimare un cantiere a distanza: fin dove è ragionevole',
  description:
    'Uno spostamento per ogni richiesta di prezzo costa tempo che pochi artigiani fatturano. Alcune stime a distanza sono affidabili; altre sono una scommessa rischiosa.',
  excerpt:
    'Ogni visita non trasformata in cantiere è tempo regalato al cliente successivo. Sapere quando stimare a distanza, e quando rifiutarsi di farlo, si può calcolare.',
  category: 'Chantier & rentabilité',
  keywords: ['preventivo a distanza', 'stima foto', 'visita cantiere', 'prezzo appuntamento', 'produttività artigiano'],
  publishedAt: '2026-05-25',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Uno spostamento di un’ora per stimare un cantiere si concretizza solo una volta su due. Quest’ora non fatturata pesa direttamente sulla redditività della settimana. La domanda non è «bisogna sempre spostarsi», ma «per quale tipo di richiesta lo spostamento è davvero necessario».',
    },
    { type: 'h2', text: 'Cosa si può stimare ragionevolmente su foto' },
    {
      type: 'list',
      items: [
        'Una sostituzione identica (finestra, porta, sanitario) le cui dimensioni sono misurabili dal cliente stesso',
        'Una prestazione standardizzata con un prezzo al metro quadro o a unità già noto all’azienda',
        'Una prima stima indicativa, esplicitamente presentata come tale, per permettere al cliente di decidere se spingere oltre la pratica',
      ],
    },
    {
      type: 'callout',
      title: 'Ciò che non si stima mai seriamente senza visita',
      text: 'Tutto ciò che riguarda lo stato strutturale esistente (muro portante sospetto, umidità, impianto elettrico datato) non può essere valutato su foto, perché il rischio di un preventivo vago o irrealistico supera ampiamente il tempo risparmiato evitando lo spostamento. Un preventivo basato su un’ipotesi sbagliata costa molto di più in variante e in fiducia persa di una visita di un’ora.',
    },
    { type: 'h2', text: 'Il metodo che limita il rischio da entrambe le parti' },
    {
      type: 'p',
      text: 'Presentare chiaramente una stima a distanza come indicativa (non come prezzo fermo) protegge l’azienda da un impegno preso su informazioni incomplete, dando al contempo al cliente una base rapida per procedere. Il preventivo fermo, invece, resta condizionato a una conferma sul posto prima dell’avvio effettivo dei lavori, in particolare per tutto ciò che riguarda la ristrutturazione.',
    },
    { type: 'h2', text: 'Cosa cambia nell’organizzazione della settimana' },
    {
      type: 'p',
      text: 'Filtrare le richieste che possono davvero essere stimate a distanza da quelle che richiedono una visita libera tempo di spostamento per i cantieri che ne hanno davvero bisogno, preservando al contempo l’affidabilità dei prezzi annunciati. È una selezione che si fa fin dal primo contatto, non a posteriori.',
    },
    {
      type: 'cta',
      title: 'Un preventivo quantificato da una semplice foto, dettato a voce',
      text: 'Con Cantia, una stima indicativa si trasforma in un preventivo quantificato in pochi minuti, a partire da foto e da una descrizione dettata a voce, senza necessariamente passare per un primo spostamento.',
      buttonLabel: 'Scoprire la dettatura vocale',
    },
  ],
  faq: [
    {
      question: 'Si può stabilire un preventivo fermo solo sulla base di foto?',
      answer:
        'È rischioso per tutto ciò che riguarda lo stato strutturale esistente. Meglio allora presentare una stima indicativa e condizionare il preventivo fermo a una visita sul posto.',
    },
    {
      question: 'Quali tipi di lavori si prestano meglio a una stima a distanza?',
      answer:
        'Le sostituzioni identiche con dimensioni misurabili dal cliente, o le prestazioni standardizzate con un prezzo già noto all’azienda.',
    },
    {
      question: 'Come limitare il rischio di una stima a distanza che si rivela sbagliata?',
      answer:
        'Presentandola chiaramente come indicativa, non contrattuale, e riservando il preventivo fermo a una conferma effettuata sul posto.',
    },
  ],
  relatedSlugs: [
    'rediger-devis-qui-inspire-confiance-client',
    'calculer-prix-devis-renovation-suisse',
    'logiciel-gestion-chantier-independant-seul',
  ],
};
