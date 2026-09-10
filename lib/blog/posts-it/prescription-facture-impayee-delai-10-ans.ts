import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'prescription-facture-impayee-delai-10-ans',
  question: 'Dopo quanto tempo una fattura impagata diventa legalmente irrecuperabile in Svizzera?',
  title: 'Prescrizione di una fattura impagata in Svizzera: il termine che non va mai lasciato scadere',
  description:
    'Pur esistendo atti interruttivi, un credito contrattuale si prescrive in linea di principio dopo 10 anni in Svizzera, e ignorarli può far perdere definitivamente il diritto di reclamare un pagamento.',
  excerpt:
    'Dieci anni sembra lungo, almeno finché una vecchia fattura dimenticata in un fascicolo si rivela totalmente irrecuperabile proprio nel momento in cui l’azienda ne ha più bisogno.',
  category: 'Devis & facturation',
  keywords: ['prescrizione fattura impagata', 'termine prescrizione credito svizzera', 'fattura vecchia impagata', 'interruzione prescrizione', 'credito costruzione termine'],
  publishedAt: '2026-06-12',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un credito nato da un contratto (come una fattura di lavori impagata) si prescrive in linea di principio dopo 10 anni nel diritto svizzero, secondo il regime generale dell’art. 127 CO. Trascorso questo termine senza azione, il debitore può legalmente rifiutarsi di pagare invocando la prescrizione: il credito esiste ancora moralmente, ma diventa giuridicamente inesigibile.',
    },
    { type: 'h2', text: 'Cosa interrompe il termine (e lo fa ripartire da zero)' },
    {
      type: 'list',
      items: [
        'Un’esecuzione avviata presso l’ufficio esecuzioni',
        'Un riconoscimento di debito firmato dal debitore, anche parziale',
        'Un atto giudiziario (citazione, azione in giudizio)',
        'Un semplice sollecito o un richiamo amichevole, invece, NON interrompe la prescrizione; solo un’azione formale lo fa',
      ],
    },
    {
      type: 'callout',
      title: 'Un semplice sollecito via e-mail non basta mai a posticipare il termine',
      text: 'È l’errore più frequente: credere che un richiamo regolare «mantenga vivo il credito». Solo un’esecuzione, un riconoscimento di debito firmato o un’azione in giudizio interrompono realmente la prescrizione.',
    },
    { type: 'h2', text: 'Perché questo termine non va mai preso alla leggera' },
    {
      type: 'p',
      text: 'Dieci anni sembra una scadenza lontana. Eppure, un credito vecchio, dimenticato negli archivi di una piccola azienda, può rivelarsi totalmente irrecuperabile proprio nel momento in cui sarebbe utile. Un monitoraggio centralizzato di ogni fattura, con la sua data di emissione e il suo stato di pagamento, è l’unico modo affidabile per individuare un credito prossimo alla prescrizione prima che sia troppo tardi per agire.',
    },
    {
      type: 'cta',
      title: 'Nessuna fattura impagata dimenticata in un cassetto',
      text: 'Cantia conserva uno storico completo di ogni fattura e del suo stato di pagamento. Quanto basta per individuare un credito vecchio prima che diventi irrecuperabile.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Dopo quanto tempo si prescrive un credito in Svizzera?',
      answer:
        'In linea di principio 10 anni per un credito contrattuale secondo il regime generale dell’art. 127 CO, salvo termini particolari applicabili a certi tipi di contratto.',
    },
    {
      question: 'Un sollecito amichevole interrompe la prescrizione?',
      answer:
        'No. Solo un’esecuzione, un riconoscimento di debito firmato dal debitore o un’azione in giudizio interrompono realmente il termine di prescrizione.',
    },
    {
      question: 'Cosa succede quando un credito è prescritto?',
      answer:
        'Il debitore può legalmente rifiutarsi di pagare invocando la prescrizione davanti a un tribunale: il credito diventa giuridicamente inesigibile, anche se resta dovuto moralmente.',
    },
  ],
  relatedSlugs: [
    'poursuite-facture-impayee-procedure-suisse',
    'relancer-client-facture-impayee-sans-perdre-client',
    'delai-paiement-facture-artisan-code-obligations',
  ],
};
