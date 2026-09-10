import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'gerer-entreprise-sans-comptable-debut',
  question: 'Si può gestire la propria impresa senza commercialista agli inizi dell\'attività?',
  title: 'Gestire la propria impresa senza commercialista all\'avvio: fino a dove è ragionevole',
  description:
    'Molti indipendenti iniziano senza fiduciaria per risparmiare. Cosa è realistico gestire da soli, e il momento in cui un accompagnamento diventa necessario.',
  excerpt:
    'Fare a meno di un commercialista all\'avvio non è un\'imprudenza di per sé: è una questione di sapere precisamente dove si ferma ciò che si può gestire da soli, e dove diventa rischioso.',
  category: 'Comparatifs & outils',
  keywords: ['gestire impresa senza commercialista', 'avviare senza fiduciaria Svizzera', 'contabilità indipendente principiante', 'gestione amministrativa senza commercialista', 'auto-gestione impresa edile'],
  publishedAt: '2026-07-14',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Rivolgersi a una fiduciaria fin dal primo giorno rappresenta un costo che molti indipendenti preferiscono evitare all\'avvio, quando ogni franco conta. A condizione di sapere precisamente cosa si può gestire da soli e cosa necessita di un accompagnamento, non è irragionevole.',
    },
    { type: 'h2', text: 'Cosa può generalmente gestire da solo un indipendente' },
    {
      type: 'list',
      items: [
        'L\'emissione di preventivi e fatture conformi, con uno strumento che applica automaticamente le regole giuste',
        'Il monitoraggio di base della liquidità: chi deve pagare cosa, e quando',
        'L\'archiviazione dei documenti, per ritrovare facilmente una fattura in caso di controllo',
      ],
    },
    { type: 'h2', text: 'Cosa richiede generalmente un accompagnamento' },
    {
      type: 'list',
      items: [
        'La dichiarazione IVA una volta superata la soglia di assoggettamento',
        'La chiusura annuale dei conti',
        'I contributi sociali (AVS/AI) e il loro calcolo esatto in base al reddito reale',
      ],
    },
    {
      type: 'stat',
      value: 'CHF 100 000',
      label: 'soglia di fatturato generalmente associata all\'assoggettamento obbligatorio all\'IVA in Svizzera (un riferimento spesso citato per decidere di rivolgersi a una fiduciaria)',
    },
    {
      type: 'callout',
      title: 'Un buon strumento di gestione facilita il lavoro della fiduciaria, il giorno in cui arriva',
      text: 'Preventivi e fatture ben strutturati fin dall\'inizio, con uno storico chiaro, riducono il tempo (e quindi il costo) che una fiduciaria impiegherà per riprendere la contabilità più tardi.',
    },
    {
      type: 'cta',
      title: 'Una base pulita fin dal primo documento',
      text: 'Cantia struttura automaticamente preventivi e fatture in modo conforme. È una base solida, sia che Lei gestisca da solo oggi o con una fiduciaria domani.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Si può avviare la propria attività senza fiduciaria in Svizzera?',
      answer:
        'Sì per le attività di base (preventivi, fatture, monitoraggio della liquidità), ma la dichiarazione IVA una volta assoggettati e la chiusura annuale richiedono generalmente un accompagnamento.',
    },
    {
      question: 'A partire da quale fatturato bisogna considerare una fiduciaria?',
      answer:
        'La soglia di assoggettamento all\'IVA (generalmente CHF 100 000 di fatturato) è spesso il riferimento che spinge a rivolgersi a un accompagnamento professionale.',
    },
    {
      question: 'Un buon software di gestione sostituisce una fiduciaria?',
      answer:
        'No, ma facilita notevolmente il lavoro della fiduciaria una volta coinvolta, mantenendo uno storico di documenti pulito e conforme fin dall\'inizio.',
    },
  ],
  relatedSlugs: [
    'avs-ai-independant-batiment',
    'logiciel-facturation-raison-individuelle-suisse',
    'gerer-entreprise-seul-sans-embaucher-outils',
  ],
};
