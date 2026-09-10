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
  publishedAt: '2026-02-02',
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
        ['Contabilità generale in partita doppia', 'Sì', 'No (non è il suo obiettivo)'],
      ],
    },
    {
      type: 'p',
      text: 'In pratica, molte aziende usano entrambi in parallelo: uno strumento di settore come Cantia per tutto ciò che riguarda il cantiere, e una trasmissione delle registrazioni a una fiduciaria o a uno strumento di contabilità per la chiusura annuale. Nessuno dei due ha bisogno di sostituire l’altro per essere la scelta giusta.',
    },
    {
      type: 'callout',
      title: 'Entrambi, senza doppia registrazione',
      text: 'Cantia ora si collega nativamente a Bexio (dal piano Impresa): clienti importati automaticamente, fatture inviate a Bexio con un clic, stati di pagamento sincronizzati ogni ora. Il dettaglio completo nel nostro articolo dedicato all’integrazione.',
    },
    {
      type: 'cta',
      title: 'Pensata per il cantiere, non per la contabilità generale',
      text: 'Cantia copre tutto il percorso di un cantiere svizzero: preventivi, fatturazione QR, rapporti, pianificazione, redditività e RH, tanto dal furgone quanto dall’ufficio.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Cantia può sostituire completamente Bexio?',
      answer:
        'Cantia non è un software di contabilità generale (nessuna contabilità in partita doppia). Per la tenuta contabile completa, la maggior parte delle aziende mantiene uno strumento dedicato o una fiduciaria, mentre Cantia si concentra sulla gestione operativa del cantiere.',
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
