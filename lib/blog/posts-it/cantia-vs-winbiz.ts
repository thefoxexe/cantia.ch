import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'cantia-vs-winbiz',
  question: 'Cantia o Winbiz: quale scegliere per un artigiano dell’edilizia?',
  title: 'Cantia vs Winbiz: confronto per artigiani dell’edilizia',
  description:
    'Winbiz è un software svizzero affermato di contabilità, fatturazione e gestione, storicamente pensato per una postazione fissa. Cantia è pensata mobile, per il cantiere. Un confronto oggettivo dei due approcci.',
  excerpt:
    'Winbiz è usato da tempo da molte PMI romande. Ma un artigiano che passa le giornate in cantiere non ha gli stessi bisogni di una PMI d’ufficio.',
  category: 'Comparatifs & outils',
  keywords: ['Winbiz', 'alternativa Winbiz edilizia', 'Winbiz vs Cantia', 'software gestione artigiano svizzera'],
  publishedAt: '2026-09-22',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'Winbiz è un nome conosciuto nella Svizzera romanda, usato da tempo da molte PMI per contabilità, fatturazione e gestione commerciale. È uno strumento affermato, storicamente pensato per l’uso da una postazione fissa, in ufficio. Per un artigiano che lavora soprattutto sul posto, questa impostazione d’origine cambia molto nella quotidianità.',
    },
    { type: 'h2', text: 'Cosa fa bene Winbiz' },
    {
      type: 'p',
      text: 'Contabilità completa, fatturazione, gestione delle scorte e degli acquisti: Winbiz copre un ampio spettro di bisogni gestionali di una PMI svizzera, con un’affidabilità provata negli anni da molte aziende.',
    },
    { type: 'h2', text: 'Cosa manca per un uso mobile, in cantiere' },
    {
      type: 'p',
      text: 'Winbiz non è stato pensato, all’origine, per un uso in mobilità dal cantiere: nessun preventivo dettato a voce tra due appuntamenti, nessun rapporto di cantiere con foto geolocalizzate, nessuna redditività cantiere per cantiere, nessun portale cliente per firmare un preventivo online. Sono bisogni propri del mestiere edile sul posto, non della gestione amministrativa generale.',
    },
    {
      type: 'callout',
      title: 'La differenza sta soprattutto nel luogo in cui si lavora davvero',
      text: 'Winbiz è stato concepito per l’uso in ufficio, il che resta pertinente per la gestione amministrativa complessiva di un’azienda. Cantia parte dal principio che la maggior parte del lavoro di un artigiano si svolge in cantiere, non dietro uno schermo fisso.',
    },
    { type: 'h2', text: 'La tabella di confronto' },
    {
      type: 'table',
      headers: ['Criterio', 'Winbiz', 'Cantia'],
      rows: [
        ['Contabilità generale e fatturazione svizzera', 'Sì', 'Sì, generata automaticamente da fatture, spese e salari'],
        ['Preventivo creato direttamente dal cantiere', 'No', 'Sì'],
        ['Catalogo prezzi dei mestieri edili', 'No', 'Sì'],
        ['Rapporto di cantiere con foto', 'No', 'Sì'],
        ['Redditività per cantiere (preventivo vs reale)', 'No', 'Sì'],
        ['App mobile pensata per il cantiere', 'Limitata', 'Sì'],
      ],
    },
    {
      type: 'p',
      text: 'Un’azienda che usa già Winbiz per la contabilità non deve per forza abbandonarlo: spesso si tratta di completare la gestione d’ufficio con uno strumento pensato per ciò che succede davvero in cantiere, invece di forzare un solo strumento a coprire due mondi.',
    },
    {
      type: 'cta',
      title: 'Uno strumento pensato per il cantiere, non per l’ufficio',
      text: 'Cantia accompagna l’artigiano dove si lavora davvero: preventivo dettato a voce in cantiere, fatture QR conformi, rapporti fotografici, pianificazione e redditività per cantiere.',
      buttonLabel: 'Provare 14 giorni',
    },
  ],
  faq: [
    {
      question: 'Winbiz va bene per un’impresa edile?',
      answer:
        'Winbiz copre bene la contabilità e la fatturazione generale, ma non è stato concepito apposta per l’edilizia né per l’uso mobile dal cantiere, a differenza di uno strumento come Cantia.',
    },
    {
      question: 'Si può sostituire Winbiz solo con Cantia?',
      answer:
        'Cantia tiene una contabilità in partita doppia generata automaticamente da fatture, incassi, spese e salari, con il rendiconto IVA e un assistente per la chiusura annuale. Un’azienda legata a Winbiz per la contabilità può anche tenerlo e usare Cantia per la gestione dei cantieri.',
    },
    {
      question: 'Winbiz funziona bene dal cantiere, su mobile?',
      answer:
        'Winbiz resta storicamente più orientato all’uso da una postazione fissa. Per creare un preventivo o documentare un cantiere direttamente sul posto, uno strumento pensato mobile fin dall’inizio, come Cantia, è in genere più adatto.',
    },
  ],
  relatedSlugs: ['cantia-vs-klara', 'cantia-vs-cresus-facturation', 'application-devis-mobile-artisan'],
};
