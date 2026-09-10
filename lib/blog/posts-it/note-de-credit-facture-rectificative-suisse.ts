import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'note-de-credit-facture-rectificative-suisse',
  question: 'Come correggere una fattura già inviata: nota di credito o fattura rettificativa?',
  title: 'Fattura già inviata ma errata: nota di credito o fattura rettificativa?',
  description:
    'Un errore di importo, di IVA o di prestazione su una fattura già inviata non si corregge mai modificando il PDF originale. Ecco il metodo corretto, conforme alla contabilità svizzera.',
  excerpt:
    'Rispedire una versione corretta con lo stesso numero di fattura crea un doppione contabile da entrambe le parti. La nota di credito esiste precisamente per correggere in modo pulito, senza mai riscrivere la storia.',
  category: 'Devis & facturation',
  keywords: ['nota di credito fattura', 'fattura rettificativa svizzera', 'correggere una fattura', 'errore fattura già inviata', 'annullare una fattura'],
  publishedAt: '2026-06-11',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Un errore scoperto dopo l’invio di una fattura (importo sbagliato, IVA scorretta, prestazione mal descritta) non si corregge mai modificando il documento originale e rispedendolo con lo stesso numero. Una volta emessa, una fattura resta nella contabilità così com’è; la correzione passa attraverso un documento distinto: la nota di credito.',
    },
    { type: 'h2', text: 'Perché non riemettere mai lo stesso numero di fattura' },
    {
      type: 'list',
      items: [
        'La numerazione delle fatture deve restare continua e cronologica, perché riutilizzare o modificare un numero già emesso rompe questa continuità, un punto verificato in caso di controllo fiscale',
        'Il cliente potrebbe aver già registrato la fattura iniziale nella propria contabilità, e un doppione silenzioso crea allora una confusione difficile da tracciare in seguito',
        'Una fattura, una volta inviata, costituisce un documento contabile definitivo: solo una controscrittura può legittimamente neutralizzarne gli effetti',
      ],
    },
    { type: 'h2', text: 'Il metodo corretto' },
    {
      type: 'list',
      items: [
        'Emettere una nota di credito che referenzi esplicitamente il numero della fattura iniziale, per l’importo da annullare (totale o parziale)',
        'Emettere quindi una nuova fattura, con un nuovo numero, contenente i dati corretti',
        'Conservare entrambi i documenti (fattura iniziale + nota di credito + nuova fattura) nello storico; formano insieme la traccia contabile completa',
      ],
      ordered: true,
    },
    {
      type: 'callout',
      title: 'Un errore minore non giustifica sempre una nota di credito completa',
      text: 'Per una semplice svista senza impatto sull’importo o sull’IVA, un’e-mail di chiarimento al cliente può bastare. La nota di credito diventa necessaria non appena l’importo fatturato stesso deve cambiare.',
    },
    {
      type: 'cta',
      title: 'Nota di credito generata in un clic',
      text: 'Cantia permette di emettere una nota di credito direttamente collegata alla fattura d’origine, con numerazione automatica e continua.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Si può semplicemente modificare una fattura già inviata a un cliente?',
      answer:
        'No, una fattura emessa resta un documento contabile definitivo. Ogni correzione deve passare attraverso una nota di credito seguita da una nuova fattura, mai attraverso una modifica del documento originale.',
    },
    {
      question: 'Cos’è esattamente una nota di credito?',
      answer:
        'Un documento che annulla in tutto o in parte una fattura già emessa, referenziando esplicitamente il suo numero di origine, senza rompere la continuità della numerazione.',
    },
    {
      question: 'Serve una nota di credito per un semplice errore di battitura su una fattura?',
      answer:
        'Non necessariamente se l’importo e l’IVA non cambiano: un chiarimento scritto al cliente può bastare in questo caso preciso.',
    },
  ],
  relatedSlugs: [
    'numerotation-facture-obligations-legales-suisse',
    'mentions-obligatoires-facture-suisse-tva',
    'difference-devis-offre-facture-pro-forma',
  ],
};
