import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'remplir-soumission-pdf-architecte',
  question: 'Come compilare un capitolato PDF ricevuto dall’architetto senza ricopiare tutto?',
  title: 'Compilare un capitolato PDF ricevuto dall’architetto, senza ricopiare tutto',
  description:
    'L’architetto manda un PDF di 40 pagine e aspetta i vostri prezzi dentro. Un metodo per calcolare in fretta, evitare errori di riporto e restituire il documento richiesto.',
  excerpt:
    'Stampare, scrivere i prezzi a penna, ricalcolare a mano, scansionare: molte imprese compilano ancora i capitolati come vent’anni fa. C’è un modo più semplice.',
  category: 'Devis & facturation',
  keywords: ['compilare capitolato pdf', 'capitolato architetto', 'calcolare un capitolato', 'appalto edilizia svizzera', 'prezzo unitario capitolato'],
  publishedAt: '2026-10-24',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Venerdì, ore 16: l’architetto manda il capitolato del lotto opere da impresario costruttore, 38 pagine in PDF, consegna fra dieci giorni. Sapete già come andrà a finire: una serata a stampare, scrivere i prezzi a penna, moltiplicare le quantità con la calcolatrice, riportare i subtotali di pagina in pagina, poi scansionare tutto. E la paura di un errore di riporto a pagina 22.',
    },
    { type: 'h2', text: 'Cosa si aspetta davvero l’architetto' },
    {
      type: 'p',
      text: 'Un capitolato non è un preventivo libero. Il committente vuole confrontare più imprese sulla stessa base: stesse posizioni, stesse quantità, stesso ordine. Il vostro lavoro consiste nel compilare il prezzo unitario di ogni posizione, calcolare gli importi e restituire il documento nella sua forma originale. Riscrivere l’offerta nel vostro modello di preventivo complica il confronto e, in un appalto pubblico, può far escludere l’offerta.',
    },
    {
      type: 'list',
      items: [
        'Le quantità sono quelle del documento: non le modificate, salvo quando una posizione vi chiede di indicarle.',
        'Ogni posizione riceve un prezzo unitario e un importo (quantità × prezzo).',
        'I subtotali di pagina vengono riportati alla pagina seguente, poi riassunti per capitolo.',
        'Il riepilogo finale applica ribasso, sconto e IVA nell’ordine previsto dal documento.',
        'Il documento viene datato, firmato e consegnato entro il termine, con gli allegati richiesti.',
      ],
    },
    { type: 'h2', text: 'I tre metodi e i loro limiti' },
    {
      type: 'table',
      headers: ['Metodo', 'Cosa funziona', 'Dove si inceppa'],
      rows: [
        ['Carta e penna', 'Nessuno strumento da imparare', 'Calcoli e riporti a mano, poco leggibile una volta scansionato, nessun riutilizzo dei prezzi'],
        ['Ricopiare in Excel', 'I calcoli sono giusti', 'Ore di inserimento, rischio di saltare una posizione, il PDF originale resta vuoto'],
        ['Importare il PDF in uno strumento', 'Posizioni riprese, solo i prezzi da inserire, PDF originale compilato', 'Serve comunque una verifica, soprattutto sulle scansioni'],
      ],
    },
    { type: 'h2', text: 'Un metodo in tre passi' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Leggere tutto il capitolato prima di calcolare: condizioni particolari, termini, posizioni da completare, varianti ammesse.',
        'Calcolare posizione per posizione, partendo dai vostri prezzi abituali (catalogo, capitolati precedenti) e adattandoli al cantiere.',
        'Controllare il riepilogo: numero di posizioni compilate, riporti di pagina, ribasso, sconto, IVA, totale. Poi consegnare il documento originale compilato.',
      ],
    },
    {
      type: 'callout',
      title: 'La trappola più frequente',
      text: 'Una posizione lasciata vuota. In un confronto di offerte è considerata gratuita oppure rende l’offerta incompleta. Prima di inviare, contate le posizioni senza prezzo: devono essere zero, oppure avere ciascuna una spiegazione scritta.',
    },
    { type: 'h2', text: 'Cosa fa Cantia (beta)' },
    {
      type: 'p',
      text: 'In Cantia importate il capitolato PDF così come l’avete ricevuto, CPN o no, anche scansionato. Capitoli, posizioni, unità e quantità vengono ripresi; una schermata di verifica vi mostra cosa è stato letto. Poi inserite i prezzi da tastiera, con i vostri prezzi abituali proposti, e Cantia scrive prezzi unitari, importi, riporti e totali nel PDF originale. La funzione è in beta: 1 di prova con il piano Essenziale, 3 al mese con Team e illimitata con il piano Entreprise.',
    },
    {
      type: 'cta',
      title: 'Compilate il vostro prossimo capitolato con i vostri prezzi',
      text: 'Importate il PDF ricevuto, inserite i prezzi, rimandate il documento originale compilato. 14 giorni di prova, senza impegno.',
      buttonLabel: 'Provare 14 giorni',
    },
  ],
  faq: [
    {
      question: 'Si possono modificare le quantità di un capitolato?',
      answer:
        'In linea di principio no: le quantità servono a confrontare le offerte. Se una quantità vi sembra sbagliata, segnalatelo per iscritto all’architetto o aggiungete un’osservazione, senza modificare la riga. Alcune posizioni chiedono invece di indicare la quantità: quelle si compilano.',
    },
    {
      question: 'Bisogna restituire il capitolato nel suo formato originale?',
      answer:
        'Il più delle volte sì, è ciò che chiede l’architetto o il committente. Una tabella a parte o un preventivo nel vostro formato complica il confronto e, in un appalto pubblico, può rendere l’offerta non conforme.',
    },
    {
      question: 'Cantia crea capitolati vuoti?',
      answer: 'No. La funzione serve a rispondere ai capitolati che ricevete: importate il PDF, inserite i prezzi e ottenete il PDF compilato.',
    },
  ],
  relatedSlugs: ['repondre-appel-offres-public-batiment-etapes', 'erreurs-soumission-qui-coutent-le-marche', 'calculer-prix-unitaire-soumission'],
  relatedTradeSlug: 'macon',
};
