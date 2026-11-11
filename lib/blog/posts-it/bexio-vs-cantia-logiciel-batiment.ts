import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'bexio-vs-cantia-logiciel-batiment',
  question: 'Bexio o Cantia: quale software scegliere per un’azienda edile?',
  title: 'Bexio vs Cantia: quale software per un’azienda edile?',
  description:
    'Bexio è una contabilità generalista svizzera. Cantia è pensata specificamente per il cantiere: preventivo dettato a voce, redditività per progetto, rapporti fotografici, fattura QR nativa.',
  excerpt:
    'Bexio non è mai stato pensato per un cantiere. È un ottimo strumento di contabilità per una PMI svizzera qualsiasi, ma non uno strumento da campo per l’edilizia.',
  category: 'Comparatifs & outils',
  keywords: ['bexio', 'alternativa bexio', 'software edilizia', 'preventivi fatturazione', 'confronto'],
  publishedAt: '2026-09-10',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'Bexio si è imposto come uno dei software di contabilità e fatturazione più utilizzati dalle PMI svizzere, in tutti i settori. La vera domanda, dopo un anno di utilizzo nell’edilizia, non è «è buono?», ma piuttosto «è stato pensato per ciò che faccio davvero, o solo per ciò che fa una PMI qualsiasi»?',
    },
    { type: 'h2', text: 'Cosa fa bene Bexio' },
    {
      type: 'p',
      text: 'Contabilità in partita doppia, dichiarazioni IVA, connettori bancari, gestione di magazzino pensata per il commercio. Per un’azienda la cui attività principale non è il cantiere stesso, è una scelta solida, collaudata e ampiamente sufficiente.',
    },
    { type: 'h2', text: 'Cosa manca quando il vero mestiere è il cantiere' },
    {
      type: 'list',
      items: [
        'Nessuna redditività per cantiere: Bexio vede la contabilità globale dell’azienda, mai quanto un cantiere preciso è realmente costato rispetto a quanto ha reso',
        'Nessun rapporto di cantiere con foto geolocalizzate: un bisogno però quotidiano per documentare l’avanzamento, un difetto o una riserva',
        'Nessuna dettatura vocale per creare un preventivo dal furgone, tra due appuntamenti, senza dover riscrivere tutto la sera in ufficio',
        'Nessuna pianificazione del team integrata ai cantieri e ai preventivi',
        'Nessun portale cliente perché un preventivo si consulti e si firmi online senza scambio di PDF via email',
      ],
    },
    {
      type: 'callout',
      title: 'Non è una questione di qualità, è una questione di mestiere di destinazione',
      text: 'Bexio è stato concepito per la contabilità di una PMI in senso lato: un salone di parrucchiere, uno studio legale, un’azienda edile vi si trovano tutti allo stesso modo. Cantia è stata pensata unicamente per lo svolgimento di un cantiere svizzero, dal primo appuntamento con il cliente fino al pagamento finale.',
    },
    { type: 'h2', text: 'La tabella che decide' },
    {
      type: 'table',
      headers: ['Esigenza', 'Bexio', 'Cantia'],
      rows: [
        ['Preventivi & fatture con fattura QR', 'Sì', 'Sì, con catalogo prezzi di settore'],
        ['Preventivo creato a voce sul cantiere', 'No', 'Sì'],
        ['Redditività per cantiere (preventivato vs reale)', 'No', 'Sì'],
        ['Rapporto di cantiere fotografico geolocalizzato', 'No', 'Sì'],
        ['Pianificazione del team per cantiere', 'No', 'Sì'],
        ['Portale cliente (firma preventivo online)', 'No', 'Sì'],
        ['Foto di scontrino → spesa registrata automaticamente', 'Sì (contabilità generale)', 'Sì, direttamente nella redditività del cantiere interessato'],
        ['Contabilità generale in partita doppia', 'Sì', 'Sì, generata automaticamente da fatture, spese e salari'],
      ],
    },
    {
      type: 'p',
      text: 'In pratica si presentano due casi. Un’azienda che usa già Bexio spesso vi mantiene la contabilità e usa Cantia per tutto ciò che riguarda il cantiere, con i due sincronizzati. Un’azienda che inizia può fare tutto in Cantia: ogni fattura, incasso, spesa e salario genera una registrazione contabile, con il rendiconto IVA e la chiusura annuale, e la fiduciaria vi accede con Cantia Accounting.',
    },
    {
      type: 'callout',
      title: 'Entrambi, senza doppia registrazione',
      text: 'Cantia ora si collega nativamente a Bexio (dal piano Team): clienti sincronizzati nei due sensi, fatture inviate a Bexio con un clic, stati di pagamento aggiornati ogni 15 minuti. Il dettaglio completo nel nostro articolo dedicato all’integrazione.',
    },
    {
      type: 'cta',
      title: 'Pensata per il cantiere, fino alla contabilità',
      text: 'Cantia copre tutto il percorso di un cantiere svizzero: preventivi, fatturazione QR, rapporti, pianificazione, redditività e RH, tanto dal furgone quanto dall’ufficio.',
      buttonLabel: 'Provare 14 giorni',
    },
  ],
  faq: [
    {
      question: 'Cantia può sostituire completamente Bexio?',
      answer:
        'Sì, è possibile. Cantia tiene una contabilità in partita doppia generata automaticamente da fatture, incassi, spese e salari, con il rendiconto IVA e un assistente per la chiusura annuale. Chi preferisce mantenere Bexio per la contabilità può anche collegare i due: clienti, articoli, fatture e pagamenti si sincronizzano.',
    },
    {
      question: 'Bexio propone un modulo cantiere o redditività per progetto?',
      answer:
        'No: Bexio è un ERP generalista per PMI svizzere, senza funzionalità dedicata al monitoraggio di cantiere, alla redditività per progetto o ai rapporti fotografici geolocalizzati.',
    },
    {
      question: 'Si possono usare Cantia e Bexio in parallelo?',
      answer:
        'Sì, è una combinazione frequente. E da poco non è più una doppia registrazione: Cantia si collega nativamente a Bexio per sincronizzare automaticamente clienti, fatture e stati di pagamento.',
    },
  ],
  relatedSlugs: [
    'integration-bexio-cantia-synchronisation-automatique',
    'suivre-rentabilite-chantier-sans-excel',
    'calculer-prix-devis-renovation-suisse',
  ],
};
