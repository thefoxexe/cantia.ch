import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'calculer-prix-unitaire-soumission',
  question: 'Come calcolare un prezzo unitario corretto per un capitolato?',
  title: 'Calcolare un prezzo unitario di capitolato: il metodo posizione per posizione',
  description:
    'Manodopera, materiali, macchine, spese generali, rischi e margine: come costruire un prezzo unitario difendibile per ogni posizione di un capitolato svizzero.',
  excerpt:
    'Il prezzo unitario di una posizione non è «quello che mettevamo l’anno scorso». È un calcolo, e si rifà cantiere per cantiere.',
  category: 'Chantier & rentabilité',
  keywords: ['prezzo unitario capitolato', 'calcolo prezzo unitario edilizia', 'calcolare capitolato', 'spese generali impresa edile', 'margine appalto'],
  publishedAt: '2026-10-24',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'In un capitolato ogni posizione attende un prezzo unitario: al m², m³, metro, pezzo o a corpo. Moltiplicato per la quantità dell’architetto, dà l’importo. Se il prezzo unitario è troppo basso, vincete l’appalto e perdete soldi a ogni metro posato. Se è troppo alto, perdete l’appalto. Ecco come costruirlo.',
    },
    { type: 'h2', text: 'I mattoni di un prezzo unitario' },
    {
      type: 'list',
      items: [
        'Manodopera: tempo necessario per unità × costo orario completo (salario, oneri sociali, vacanze, giorni festivi, tempo non produttivo).',
        'Materiali: quantità per unità × prezzo d’acquisto, più perdite e sfridi.',
        'Macchine e attrezzi: noleggio o costo d’uso riportato all’unità.',
        'Spese generali: ufficio, veicoli, assicurazioni, amministrazione, ripartite sulle ore produttive.',
        'Rischi e imprevisti: accesso difficile, meteo, termini stretti, condizioni particolari.',
        'Margine: ciò che resta all’impresa una volta pagato tutto.',
      ],
    },
    { type: 'h2', text: 'Un esempio con le cifre' },
    {
      type: 'p',
      text: 'Per un muro in mattoni di 15 cm al m², con una resa di 0,9 ore per m² e un costo orario completo di CHF 78.–:',
    },
    {
      type: 'table',
      headers: ['Elemento', 'Calcolo', 'CHF / m²'],
      rows: [
        ['Manodopera', '0,9 h × 78.–', '70.20'],
        ['Materiali', 'Mattoni, malta, 5 % di perdite', '38.50'],
        ['Macchine', 'Ponteggio, betoniera, riportati al m²', '4.80'],
        ['Subtotale costi diretti', '', '113.50'],
        ['Spese generali 12 %', '113.50 × 12 %', '13.62'],
        ['Margine 8 %', '127.12 × 8 %', '10.17'],
        ['Prezzo unitario', '', '137.29'],
      ],
    },
    {
      type: 'callout',
      title: 'Le cifre dell’esempio sono ipotesi',
      text: 'Rese, costo orario e tasso di spese generali variano molto secondo l’impresa e la regione. Ciò che conta è il metodo: ognuno dei vostri prezzi deve poter essere scomposto così.',
    },
    { type: 'h2', text: 'Il vostro costo orario completo, la cifra chiave' },
    {
      type: 'p',
      text: 'La maggior parte dei prezzi troppo bassi nasce da un costo orario sottostimato: si parte dal salario lordo e si dimenticano oneri, vacanze, giorni di pioggia, trasferte. Il nostro calcolatore della tariffa oraria vi dà questa cifra partendo dai vostri dati reali.',
    },
    { type: 'h2', text: 'Riutilizzare i prezzi da un capitolato all’altro' },
    {
      type: 'p',
      text: 'Una stessa posizione ritorna da un cantiere all’altro, con lo stesso numero quando il capitolato segue il CPN. Tenere un catalogo dei vostri prezzi per numero di posizione, e lo storico di ciò che avete offerto, fa risparmiare ore e rende coerenti le vostre offerte.',
    },
    {
      type: 'p',
      text: 'In Cantia, quando compilate un capitolato importato, per ogni posizione vengono proposti i prezzi del vostro catalogo e quelli dei capitolati precedenti. Adattate al cantiere e il PDF originale esce compilato. Funzione in beta, dal piano Team (3 capitolati al mese), illimitata con Entreprise.',
    },
    {
      type: 'cta',
      title: 'I vostri prezzi, proposti a ogni posizione',
      text: 'Importate il capitolato ricevuto e calcolate con il vostro catalogo e il vostro storico.',
      buttonLabel: 'Provare 14 giorni',
    },
  ],
  faq: [
    {
      question: 'Quale tasso di spese generali applicare?',
      answer:
        'Si calcola dalla vostra contabilità: totale delle spese non legate a un cantiere preciso, diviso per il volume di lavoro produttivo. Non esiste un tasso universale; riprendetelo ogni anno con la chiusura dei conti.',
    },
    {
      question: 'Le installazioni di cantiere vanno incluse nei prezzi unitari?',
      answer:
        'Solo se il capitolato non prevede posizioni dedicate. Quando esistono posizioni per l’installazione di cantiere, calcolatele lì, altrimenti le pagate due volte o per niente.',
    },
    {
      question: 'Come sapere se un prezzo unitario era giusto?',
      answer: 'Confrontando a posteriori le ore e il materiale realmente consumati con il calcolo di partenza. Il controllo della redditività per cantiere serve esattamente a questo.',
    },
  ],
  relatedSlugs: ['remplir-soumission-pdf-architecte', 'chantier-complet-peut-etre-en-perte-taux-horaire', 'suivre-rentabilite-chantier-sans-excel'],
  relatedTradeSlug: 'macon',
};
