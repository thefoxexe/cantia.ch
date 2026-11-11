import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'cantia-vs-klara',
  question: 'Cantia o Klara: quale scegliere per un’impresa edile in Svizzera?',
  title: 'Cantia vs Klara: quale software per un’impresa edile svizzera',
  description:
    'Klara è una solida soluzione svizzera di contabilità e fatturazione per indipendenti e piccole aziende. Cantia è pensata apposta per il cantiere. Un confronto onesto dei due approcci.',
  excerpt:
    'Klara è un buon strumento di contabilità per una piccola azienda svizzera qualsiasi. La domanda, per un’impresa edile, è se «qualsiasi» basta.',
  category: 'Comparatifs & outils',
  keywords: ['Klara', 'alternativa Klara edilizia', 'Klara vs Cantia', 'software edilizia svizzera'],
  publishedAt: '2026-09-22',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'Klara si è guadagnata un posto solido tra gli strumenti svizzeri di contabilità e fatturazione per indipendenti e piccole aziende, in tutti i settori. È uno strumento generalista, pensato per coprire molti mestieri invece di uno in particolare. La domanda, nell’edilizia, è cosa questa scelta generalista lascia fuori nella quotidianità del cantiere.',
    },
    { type: 'h2', text: 'Cosa fa bene Klara' },
    {
      type: 'p',
      text: 'Fatturazione conforme, controllo dei pagamenti, qualche automazione amministrativa e un’interfaccia pensata per restare semplice: Klara resta una scelta ragionevole per una piccola struttura la cui attività principale non è la gestione quotidiana di un cantiere.',
    },
    { type: 'h2', text: 'Cosa manca per un’attività di cantiere' },
    {
      type: 'p',
      text: 'Klara non è stato concepito apposta per l’edilizia: nessuna redditività cantiere per cantiere, nessun catalogo prezzi dei mestieri edili, nessun preventivo creato sul posto con foto, nessuna pianificazione del team legata ai cantieri in corso. Non sono difetti di Klara in sé, ma bisogni che escono dal suo perimetro.',
    },
    {
      type: 'callout',
      title: 'Un buon strumento generalista resta uno strumento generalista',
      text: 'Klara fa bene ciò per cui è stato pensato: contabilità e fatturazione di una piccola azienda svizzera, qualunque sia il settore. Cantia parte dal cantiere stesso e costruisce tutto il resto (preventivi, fatture, personale, pianificazione) attorno a questa realtà.',
    },
    { type: 'h2', text: 'La tabella di confronto' },
    {
      type: 'table',
      headers: ['Criterio', 'Klara', 'Cantia'],
      rows: [
        ['Fatturazione svizzera conforme (fattura QR)', 'Sì', 'Sì'],
        ['Catalogo prezzi dei mestieri edili', 'No', 'Sì'],
        ['Preventivo creato sul posto, dal cantiere', 'No', 'Sì'],
        ['Redditività per cantiere', 'No', 'Sì'],
        ['Rapporto di cantiere con foto', 'No', 'Sì'],
        ['Pianificazione del team per cantiere', 'No', 'Sì'],
        ['Contabilità generale svizzera', 'Sì', 'Sì, generata automaticamente da fatture, spese e salari'],
      ],
    },
    {
      type: 'p',
      text: 'Non è per forza una scelta esclusiva: alcune aziende tengono uno strumento di contabilità generale per la chiusura annuale e usano uno strumento di settore per tutto ciò che riguarda il cantiere, senza che l’uno sostituisca l’altro.',
    },
    {
      type: 'cta',
      title: 'Pensato per il cantiere, dal preventivo al pagamento',
      text: 'Cantia copre tutto il percorso di un cantiere svizzero: preventivo dettato a voce, fatture QR conformi, rapporti fotografici, pianificazione e redditività, senza mai dimenticare che il vero lavoro si fa sul posto.',
      buttonLabel: 'Provare 14 giorni',
    },
  ],
  faq: [
    {
      question: 'Klara va bene per un’impresa edile?',
      answer:
        'Klara può bastare per la fatturazione e la contabilità generale, ma non è stato concepito apposta per l’edilizia: nessuna redditività per cantiere, nessun catalogo prezzi di settore, nessun rapporto di cantiere con foto.',
    },
    {
      question: 'Qual è la differenza principale tra Klara e Cantia?',
      answer:
        'Klara è uno strumento generalista di contabilità e fatturazione per piccole aziende svizzere di tutti i settori. Cantia è pensata apposta per lo svolgimento di un cantiere, dal primo preventivo al pagamento finale.',
    },
    {
      question: 'Si possono usare Klara e Cantia insieme?',
      answer:
        'Sì, ma oggi non esiste un collegamento diretto tra i due. Cantia tiene anche una propria contabilità in partita doppia, generata automaticamente da fatture, spese e salari, con il rendiconto IVA: molte aziende hanno quindi bisogno di un solo strumento.',
    },
  ],
  relatedSlugs: ['bexio-vs-cantia-logiciel-batiment', 'cantia-vs-winbiz', 'meilleur-logiciel-devis-facture-batiment-suisse-2026'],
};
