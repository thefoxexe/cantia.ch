import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'hypotheque-legale-artisans-entrepreneurs-suisse',
  question: 'Cos’è l’ipoteca legale degli artigiani e imprenditori, e come non perderla?',
  title: 'Ipoteca legale degli artigiani e imprenditori: la vostra garanzia di pagamento, con un termine rigido',
  description:
    'L’ipoteca legale (art. 837 CC) garantisce il pagamento dei vostri lavori sull’immobile stesso. Deve tuttavia essere iscritta nel registro fondiario entro un termine di 4 mesi. Superato questo termine, si estingue.',
  excerpt:
    'Un cliente che non paga può essere escusso. Ma se è insolvente o scompare, l’esecuzione non recupera nulla. L’ipoteca legale, invece, mantiene una presa diretta sull’edificio che avete costruito.',
  category: 'Juridique & normes',
  keywords: ['ipoteca legale artigiani', 'art 837 CC', 'garanzia pagamento cantiere', 'registro fondiario', 'imprenditore non pagato'],
  publishedAt: '2026-08-24',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un cliente insolvente o in mala fede che non paga la vostra fattura non è solo un problema di liquidità: è un rischio che l’esecuzione ordinaria non copre sempre, se non ha più beni mobili. L’ipoteca legale degli artigiani e imprenditori, prevista dall’art. 837 del Codice civile, esiste proprio per questo caso: vi dà un diritto di pegno direttamente sull’immobile che avete costruito, trasformato o ristrutturato.',
    },
    { type: 'h2', text: 'Un diritto potente, ma che scade in fretta' },
    {
      type: 'p',
      text: 'Questo diritto non è automatico e non è permanente: deve essere iscritto nel registro fondiario entro un termine di 4 mesi dal completamento dei lavori. Superato questo termine, l’ipoteca legale si estingue definitivamente, anche se il credito stesso resta dovuto. È peraltro la trappola più frequente, poiché molti imprenditori scoprono questo meccanismo solo quando è già troppo tardi per utilizzarlo.',
    },
    {
      type: 'stat',
      value: '4 mesi',
      label: 'termine rigido, dalla fine dei lavori, per richiedere l’iscrizione nel registro fondiario',
    },
    { type: 'h2', text: 'Chi può avvalersene, e su cosa' },
    {
      type: 'list',
      items: [
        'Ogni artigiano o imprenditore che ha fornito materiali e/o lavoro per la costruzione o la ristrutturazione di un immobile',
        'Compreso un subappaltatore, anche senza legame contrattuale diretto con il proprietario del bene',
        'La garanzia riguarda l’immobile interessato, qualunque sia la struttura finanziaria o il numero di attori sul cantiere',
        'Un semplice accordo o un riconoscimento di debito del cliente non sostituisce mai l’iscrizione: solo l’iscrizione nel registro fondiario crea la garanzia',
      ],
    },
    {
      type: 'callout',
      title: 'Il conto alla rovescia parte dalla fine effettiva dei lavori, non dalla data della fattura',
      text: 'Sapere precisamente quando un cantiere si è concluso (e poterlo dimostrare) è ciò che determina se siete ancora nel termine di 4 mesi o già fuori termine.',
    },
    {
      type: 'cta',
      title: 'Un cantiere datato, dal primo all’ultimo giorno',
      text: 'Cantia conserva la traccia di ogni cantiere, dalla sua apertura alla sua chiusura, il che permette di stabilire senza ambiguità la data di fine lavori se dovete agire in fretta per preservare la vostra ipoteca legale.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Cos’è l’ipoteca legale degli artigiani e imprenditori?',
      answer:
        'Un diritto di pegno sull’immobile costruito o ristrutturato, previsto dall’art. 837 CC, che garantisce il pagamento dei lavori forniti anche in assenza di altri beni pignorabili presso il cliente.',
    },
    {
      question: 'Qual è il termine per iscriverla?',
      answer:
        'Quattro mesi dal completamento dei lavori. Superato questo termine, il diritto si estingue definitivamente, anche se il credito resta dovuto.',
    },
    {
      question: 'Un subappaltatore può richiedere un’ipoteca legale?',
      answer:
        'Sì, questo diritto esiste indipendentemente da un legame contrattuale diretto con il proprietario dell’immobile, purché siano stati forniti materiali o lavoro per la costruzione.',
    },
  ],
  relatedSlugs: [
    'poursuite-facture-impayee-procedure-suisse',
    'relancer-client-facture-impayee-sans-perdre-client',
    'client-refuse-payer-solde-final-que-faire',
  ],
};
