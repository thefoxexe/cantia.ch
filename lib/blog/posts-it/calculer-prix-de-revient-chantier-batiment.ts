import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'calculer-prix-de-revient-chantier-batiment',
  question: 'Come calcolare il vero prezzo di costo di un cantiere, oltre l’importo fatturato?',
  title: 'Prezzo di costo di un cantiere: il metodo per sapere quanto è realmente costato',
  description:
    'L’importo fatturato non è il prezzo di costo. Senza sommare manodopera reale, materiali, subappalto e spese generali, è impossibile sapere se un cantiere è stato redditizio.',
  excerpt:
    'Un cantiere «ben pagato» può comunque essere un cantiere in perdita, se il suo costo reale non è mai stato calcolato a posteriori. Ecco le componenti da sommare per saperlo davvero.',
  category: 'Chantier & rentabilité',
  keywords: ['prezzo di costo cantiere', 'calcolo costo cantiere edilizia', 'costo reale lavori costruzione', 'redditività lavori', 'scomposizione costo cantiere'],
  publishedAt: '2026-07-03',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'L’importo fatturato a un cliente non dice nulla, di per sé, sulla redditività di un cantiere. Il prezzo di costo (quanto il cantiere è realmente costato all’impresa) è un dato distinto, che richiede di sommare diverse componenti spesso disperse tra fonti differenti.',
    },
    { type: 'h2', text: 'Le componenti del prezzo di costo' },
    {
      type: 'list',
      items: [
        'Manodopera reale: ore effettivamente trascorse sul cantiere, al costo orario reale (oneri sociali inclusi), non alla tariffa teorica del preventivo',
        'Materiali: il costo effettivamente pagato, non il prezzo di catalogo stimato al momento del preventivo',
        'Subappalto: tutte le fatture ricevute dai subappaltatori assegnati a quel cantiere preciso',
        'Spese generali imputate: una quota parte dei costi fissi dell’impresa (veicolo, assicurazione, attrezzatura condivisa) ripartita sul cantiere',
      ],
    },
    {
      type: 'stat',
      value: 'Margine reale',
      label: 'Prezzo fatturato − prezzo di costo = ciò che resta davvero all’impresa, prima delle imposte',
    },
    { type: 'h2', text: 'Perché questa differenza è quasi sempre sottostimata' },
    {
      type: 'p',
      text: 'Un preventivo fissa un prezzo in anticipo, sulla base di ipotesi (tempo stimato, prezzo dei materiali al giorno del calcolo). Il cantiere reale devia quasi sempre un po’, che si tratti di un imprevisto, di un termine supplementare o di una variazione del prezzo del fornitore. Senza un confronto sistematico tra preventivato e reale una volta terminato il cantiere, questa deriva resta invisibile, cantiere dopo cantiere.',
    },
    {
      type: 'callout',
      title: 'Il calcolo ha valore solo se fatto cantiere per cantiere, non globalmente a fine anno',
      text: 'Un fatturato annuale positivo può mascherare diversi cantieri strutturalmente in perdita compensati da altri. Solo un’analisi per cantiere rivela quali trascinano realmente l’attività verso il basso.',
    },
    {
      type: 'cta',
      title: 'Il prezzo di costo calcolato automaticamente',
      text: 'Il modulo Redditività di Cantia confronta il preventivato con le ore e i costi realmente impiegati su ogni cantiere, senza bisogno di ricostruire il calcolo a mano.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'L’importo fatturato è lo stesso del prezzo di costo di un cantiere?',
      answer:
        'No, il prezzo di costo somma il costo reale della manodopera, dei materiali, del subappalto e delle spese generali: può essere molto diverso dall’importo fatturato al cliente.',
    },
    {
      question: 'Perché calcolare il prezzo di costo cantiere per cantiere piuttosto che globalmente?',
      answer:
        'Perché un fatturato annuale positivo può mascherare cantieri singolarmente in perdita compensati da altri. Solo un’analisi puntuale rivela dove l’impresa perde realmente denaro.',
    },
    {
      question: 'Qual è la componente più spesso sottostimata in un prezzo di costo?',
      answer:
        'La manodopera reale, calcolata al costo orario completo, oneri compresi. È quasi sempre più elevata della tariffa oraria teorica utilizzata nel calcolo iniziale.',
    },
  ],
  relatedSlugs: [
    'calculer-prix-horaire-reel-ouvrier-batiment',
    'suivre-rentabilite-chantier-sans-excel',
    'chantier-complet-peut-etre-en-perte-taux-horaire',
  ],
  relatedTradeSlug: 'macon',
};
