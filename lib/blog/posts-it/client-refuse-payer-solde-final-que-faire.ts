import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'client-refuse-payer-solde-final-que-faire',
  question: 'Un cliente rifiuta di pagare il saldo finale del cantiere: cosa fare?',
  title: 'Un cliente rifiuta di pagare il saldo finale: il metodo, passo dopo passo',
  description:
    'Un rifiuto di pagamento sul saldo finale non è quasi mai definitivo. È spesso un disaccordo su un punto preciso. Distinguere i due casi cambia tutta la strategia da seguire.',
  excerpt:
    'Un cliente che «rifiuta di pagare» ha quasi sempre una ragione precisa in mente: un difetto, un disaccordo sul prezzo, un dubbio. Identificarla cambia tutto il resto.',
  category: 'Devis & facturation',
  keywords: ['saldo non pagato', 'rifiuto di pagamento', 'controversia cantiere', 'esecuzione svizzera', 'ritenuta di garanzia'],
  publishedAt: '2026-04-23',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Il cantiere è finito, la fattura finale inviata, eppure il cliente non paga. Prima di ogni azione di recupero, una domanda precede tutte le altre: perché? Un rifiuto di pagamento non ha quasi mai una sola causa, e la strategia da seguire cambia completamente a seconda della risposta.',
    },
    { type: 'h2', text: 'Distinguere tre situazioni molto diverse' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Il cliente contesta un difetto preciso nei lavori: il pagamento è legato a una reclamazione legittima o meno sulla qualità del risultato',
        'Il cliente contesta l’importo stesso (variante non convalidata, sforamento non spiegato): il disaccordo verte sul prezzo, non sul lavoro',
        'Il cliente semplicemente non ha la liquidità per pagare, o temporeggia senza giustificazione chiara (un problema di volontà o capacità, non di merito)',
      ],
    },
    {
      type: 'callout',
      title: 'Il riflesso che evita di aggravare la situazione',
      text: 'Se il cliente invoca un difetto, una ritenuta di garanzia proporzionata a quel difetto preciso (non all’intero saldo) è una reazione giuridicamente più solida di un rifiuto di pagamento totale. È anche ciò che un giudice si aspetterà di vedere documentato se la controversia si aggrava. Al contrario, trattenere il 100 % del saldo per un difetto minore indebolisce la posizione del cliente, non la vostra.',
    },
    { type: 'h2', text: 'La procedura concreta da seguire' },
    {
      type: 'list',
      items: [
        'Chiedere per iscritto il motivo preciso del mancato pagamento: una risposta vaga o l’assenza di risposta già dice molto',
        'Se viene invocato un difetto, proporre una visita di controllo rapida piuttosto che lasciare che il disaccordo si aggravi tramite scambi di email',
        'Documentare ogni scambio per iscritto da questo momento in poi, perché costituirà la base di un fascicolo se la controversia va oltre',
        'Inviare una diffida formale se non arriva alcuna risposta costruttiva entro un termine ragionevole',
        'Come ultima risorsa, una procedura esecutiva (domanda d’esecuzione presso l’ufficio d’esecuzione del domicilio del debitore) resta lo strumento legale per far valere il credito',
      ],
    },
    { type: 'h2', text: 'Ciò che protegge meglio, a monte' },
    {
      type: 'p',
      text: 'La migliore difesa contro questo tipo di blocco si costruisce prima che accada: un verbale di consegna firmato, foto datate dello stato finale dei lavori, e un preventivo sufficientemente dettagliato affinché nessuna voce possa essere contestata per mancanza di chiarezza. Un fascicolo solido accorcia quasi sempre la durata di una controversia, anche quando non la impedisce completamente.',
    },
    {
      type: 'cta',
      title: 'Ogni scambio, ogni foto, nello stesso posto',
      text: 'Cantia centralizza preventivi, fatture, rapporti di cantiere e scambi per progetto, cosicché il fascicolo esiste già il giorno in cui sorge una controversia, senza ricostruzione dell’ultimo minuto.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Un cliente può trattenere tutto il saldo per un difetto minore?',
      answer:
        'Giuridicamente, una ritenuta deve restare proporzionata al difetto reale. Trattenere l’intero saldo per un problema minore indebolisce la posizione del cliente piuttosto che quella dell’azienda.',
    },
    {
      question: 'Qual è il primo passo di fronte a un rifiuto di pagamento del saldo finale?',
      answer:
        'Chiedere per iscritto il motivo preciso del rifiuto: la risposta determina se la controversia riguarda un difetto, l’importo, o una semplice difficoltà di liquidità del cliente.',
    },
    {
      question: 'In quale momento considerare una procedura esecutiva?',
      answer:
        'Come ultima risorsa, dopo una diffida formale rimasta senza risposta costruttiva. La domanda d’esecuzione si deposita presso l’ufficio d’esecuzione del domicilio del debitore.',
    },
  ],
  relatedSlugs: [
    'relancer-client-facture-impayee-sans-perdre-client',
    'defaut-construction-decouvert-apres-reception-qui-paie',
    'facturer-acompte-suisse-securiser-solde',
  ],
};
