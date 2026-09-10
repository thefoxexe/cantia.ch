import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'checklist-cloture-chantier-avant-facturation',
  question: 'Cosa verificare prima di chiudere un cantiere e inviare la fattura finale?',
  title: 'Checklist di fine cantiere: cosa verificare prima di inviare la fattura finale',
  description:
    'Una fattura finale inviata troppo in fretta, senza ricezione documentata né verifica del calcolo, apre la porta a contestazioni evitabili. Ecco i punti da spuntare prima di chiudere.',
  excerpt:
    'La fattura finale non è solo l’ultimo documento del cantiere: è quello che fissa la relazione con il cliente. Meglio prepararla con metodo che doverla correggere in seguito.',
  category: 'Chantier & rentabilité',
  keywords: ['checklist fine cantiere', 'chiudere un cantiere', 'fattura finale lavori', 'verifica prima della fatturazione', 'fine lavori edilizia'],
  publishedAt: '2026-06-10',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'La fattura finale di un cantiere non è solo l’ultimo documento amministrativo. È quello che fissa la relazione con il cliente, avvia la garanzia, e spesso chiude il fascicolo. Inviarla senza una verifica strutturata apre la porta a errori evitabili: lavori supplementari dimenticati, acconto dedotto male, ricezione non documentata.',
    },
    { type: 'h2', text: 'Prima di inviare la fattura finale' },
    {
      type: 'list',
      items: [
        'Ricezione dei lavori effettuata e documentata (verbale o rapporto fotografico datato)',
        'Tutti i lavori supplementari accettati durante il cantiere ben integrati nel conteggio finale',
        'Acconti già versati correttamente dedotti dall’importo finale',
        'Eventuali difetti riscontrati alla ricezione annotati e, se necessario, trattati prima della fatturazione del saldo',
        'Importo, IVA e diciture della fattura QR verificati un’ultima volta prima dell’invio',
      ],
    },
    { type: 'h2', text: 'Dopo l’invio' },
    {
      type: 'list',
      items: [
        'Un promemoria di garanzia inviato al cliente, con la data di inizio e di fine del periodo applicabile',
        'Il fascicolo del cantiere archiviato completo (preventivo, fatture, foto, scambi) per riferimento futuro',
        'Un’eventuale ritenuta di garanzia annotata con la sua data di liberazione prevista',
      ],
    },
    {
      type: 'callout',
      title: 'Una fattura finale inviata troppo in fretta costa spesso più cara di un giorno di ritardo',
      text: 'Una dimenticanza di lavori supplementari o un acconto dedotto male si traduce direttamente in denaro perso, mentre pochi minuti di verifica strutturata evitano quasi sempre questa perdita.',
    },
    {
      type: 'cta',
      title: 'Un fascicolo di cantiere completo, pronto per la fattura finale',
      text: 'Cantia collega preventivo, acconti, lavori supplementari e foto allo stesso cantiere, così che la fattura finale si prepari senza dover ricostruire lo storico a mano.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Perché documentare la ricezione prima di inviare la fattura finale?',
      answer:
        'Perché avvia il termine di garanzia e fissa i difetti riscontrati. Senza documento datato, questo momento diventa impossibile da provare in caso di controversia successiva.',
    },
    {
      question: 'Cosa si rischia a dimenticare lavori supplementari nel conteggio finale?',
      answer:
        'Una perdita finanziaria diretta se il conteggio non li include, e una difficoltà a reclamarli in seguito una volta la fattura finale inviata e accettata.',
    },
    {
      question: 'Bisogna archiviare il fascicolo del cantiere dopo la fatturazione finale?',
      answer:
        'Sì, un fascicolo completo (preventivo, fatture, foto, scambi) resta utile per tutto il periodo di garanzia e oltre, in caso di controversia o di domanda successiva del cliente.',
    },
  ],
  relatedSlugs: [
    'checklist-ouverture-chantier-artisan',
    'reception-travaux-proces-verbal-chantier',
    'avenant-chantier-plus-value-moins-value',
  ],
};
