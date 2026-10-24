import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'erreurs-soumission-qui-coutent-le-marche',
  question: 'Quali errori fanno perdere un appalto nell’edilizia?',
  title: 'Capitolati: gli 8 errori che costano l’appalto (o il margine)',
  description:
    'Posizione dimenticata, riporto di pagina sbagliato, unità letta male, sconto nel posto sbagliato: gli errori che fanno escludere un’offerta o vincerla in perdita, e come evitarli.',
  excerpt:
    'Raramente si perde un appalto perché si era più cari del 2 %. Lo si perde, o lo si vince in perdita, per una riga vuota o un riporto sbagliato.',
  category: 'Devis & facturation',
  keywords: ['errori capitolato', 'appalto edilizia', 'offerta esclusa', 'riporto di pagina capitolato', 'controllo offerta'],
  publishedAt: '2026-10-24',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Un appalto si gioca sul prezzo, ma anche sul rigore. Un’offerta incompleta può essere esclusa prima ancora di essere confrontata, e un errore di calcolo scoperto dopo l’aggiudicazione si paga per tutta la durata del cantiere. Ecco gli errori più frequenti e il semplice controllo che li evita.',
    },
    { type: 'h2', text: '1. Una posizione lasciata senza prezzo' },
    {
      type: 'p',
      text: 'È l’errore più frequente in un documento di decine di pagine. A seconda del contesto, la posizione vuota è letta come inclusa gratuitamente o rende l’offerta incompleta. Contate le posizioni senza prezzo prima dell’invio: il numero deve essere zero, salvo posizioni che escludete volontariamente per iscritto.',
    },
    { type: 'h2', text: '2. Un riporto di pagina sbagliato' },
    {
      type: 'p',
      text: 'Su carta, il subtotale di ogni pagina viene riportato in cima alla seguente. Un solo errore di trascrizione sposta tutto il capitolo e il totale. Uno strumento che calcola i riporti a partire dagli importi elimina questo rischio.',
    },
    { type: 'h2', text: '3. Un’unità letta male' },
    {
      type: 'p',
      text: 'Prezzo al m² quando la posizione è al m³, al metro lineare invece che al pezzo, all’ora invece che a corpo: lo scarto può essere di un fattore dieci. Leggete l’unità di ogni posizione prima di riportarvi un prezzo del vostro catalogo.',
    },
    { type: 'h2', text: '4. Modificare le quantità del documento' },
    {
      type: 'p',
      text: 'Le quantità servono a confrontare le offerte tra loro. Se ritenete che una quantità sia sbagliata, ditelo in un’osservazione o in una lettera, ma non cambiate la riga. Le sole quantità che compilate sono quelle che la posizione vi chiede di indicare.',
    },
    { type: 'h2', text: '5. Ribasso e sconto nel posto sbagliato' },
    {
      type: 'p',
      text: 'Il ribasso riduce il prezzo dell’offerta; lo sconto premia un pagamento rapido. Applicarli nell’ordine sbagliato, o applicare l’IVA prima di loro, cambia il totale. Seguite l’ordine previsto dal riepilogo del capitolato.',
    },
    { type: 'h2', text: '6. Dimenticare le condizioni particolari' },
    {
      type: 'p',
      text: 'Le prime pagine contengono spesso ciò che costa di più: termini di esecuzione, penali, installazioni di cantiere a carico dell’impresa, orari ridotti, smaltimento dei rifiuti. Un prezzo unitario giusto può diventare perdente se queste condizioni non sono incluse.',
    },
    { type: 'h2', text: '7. Consegnare un documento diverso da quello richiesto' },
    {
      type: 'p',
      text: 'Un preventivo nel vostro formato, una tabella Excel al posto del modulo: il confronto diventa difficile e, in un appalto pubblico, l’offerta può essere giudicata non conforme. Consegnate il documento originale compilato, con gli allegati richiesti.',
    },
    { type: 'h2', text: '8. Consegnare in ritardo' },
    {
      type: 'p',
      text: 'In un appalto pubblico, un’offerta arrivata dopo la scadenza è in linea di principio esclusa, anche se eccellente. Annotate data e ora limite appena ricevuto il documento e puntate a inviare il giorno prima.',
    },
    {
      type: 'callout',
      title: 'Il controllo in 5 minuti prima di inviare',
      text: 'Posizioni senza prezzo: zero. Totale dei capitoli uguale al riepilogo. Ribasso, sconto e IVA nell’ordine del documento. Data, firma, allegati. Data e ora di consegna rispettate.',
    },
    { type: 'h2', text: 'Con Cantia (beta)' },
    {
      type: 'p',
      text: 'Cantia riprende le posizioni del PDF ricevuto e vi lascia compilare solo i prezzi: le quantità del documento restano intatte, importi, riporti e totali vengono calcolati e il riepilogo mostra cosa resta da calcolare. Il PDF originale esce compilato. In beta, dal piano Team (3 capitolati al mese), illimitato con Entreprise.',
    },
    {
      type: 'cta',
      title: 'Zero riporti sbagliati nel vostro prossimo capitolato',
      text: 'Importate il PDF, inserite i prezzi, Cantia calcola e compila il documento originale.',
      buttonLabel: 'Provare 14 giorni',
    },
  ],
  faq: [
    {
      question: 'Un’offerta con una posizione vuota è esclusa automaticamente?',
      answer:
        'Non sempre, ma il rischio è reale: secondo le regole del bando può essere considerata incompleta. In un appalto privato l’architetto vi chiederà nel migliore dei casi di completare, nel peggiore confronterà considerando la posizione inclusa.',
    },
    {
      question: 'Si può correggere un capitolato dopo averlo consegnato?',
      answer:
        'In un appalto pubblico le modifiche dopo la consegna sono molto regolamentate e il prezzo in linea di principio non si rinegozia liberamente. Meglio controllare prima dell’invio che contare su una correzione dopo.',
    },
    {
      question: 'Come evitare gli errori di riporto di pagina?',
      answer: 'Non facendoli a mano: un foglio di calcolo o uno strumento che calcola gli importi e riporta i subtotali automaticamente elimina questo rischio.',
    },
  ],
  relatedSlugs: ['remplir-soumission-pdf-architecte', 'rabais-escompte-tva-ordre-soumission', 'repondre-appel-offres-public-batiment-etapes'],
};
