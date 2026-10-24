import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'logiciel-remplir-soumission-excel-papier',
  question: 'Carta, Excel o software: come compilare i capitolati?',
  title: 'Carta, Excel o software: il modo giusto di compilare i capitolati nel 2026',
  description:
    'Confronto concreto dei tre modi di rispondere ai capitolati in una PMI edile svizzera: tempo impiegato, rischio di errori, riutilizzo dei prezzi e documento consegnato.',
  excerpt:
    'Le grandi imprese hanno software di calcolo da diverse migliaia di franchi. Le piccole compilano a penna. Ora esiste una via di mezzo.',
  category: 'Comparatifs & outils',
  keywords: ['software capitolato', 'compilare capitolato excel', 'software preventivi edilizia svizzera', 'capitolato pdf', 'strumento calcolo capitolato'],
  publishedAt: '2026-10-24',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'In una PMI edile i capitolati arrivano per e-mail, in PDF, in ogni periodo dell’anno. Secondo la dimensione dell’impresa si compilano a penna, in Excel o in un software di calcolo specializzato. Ogni metodo ha la sua logica; ecco come confrontarli onestamente.',
    },
    { type: 'h2', text: 'Il confronto' },
    {
      type: 'table',
      headers: ['', 'Carta', 'Excel', 'Software di calcolo', 'Importazione del PDF (Cantia, beta)'],
      rows: [
        ['Inserimento delle posizioni', 'Nessuno', 'Ricopiare tutto', 'Importazione di file strutturati', 'Riprese dal PDF ricevuto'],
        ['Calcoli e riporti', 'A mano', 'Automatici', 'Automatici', 'Automatici'],
        ['Riutilizzo dei prezzi', 'Memoria', 'Copia e incolla', 'Biblioteca prezzi', 'Catalogo e storico proposti'],
        ['Documento consegnato', 'PDF scansionato', 'Tabella a parte o trascrizione', 'Modulo esportato', 'PDF originale compilato'],
        ['Costo e apprendimento', 'Nullo', 'Basso', 'Elevato, formazione', 'Incluso dal piano Team'],
      ],
    },
    { type: 'h2', text: 'Quando basta la carta' },
    {
      type: 'p',
      text: 'Per un capitolato di due pagine all’anno, la carta resta ragionevole. Appena i documenti superano una decina di pagine o rispondete ogni mese, il tempo di calcolo e il rischio di errori di riporto diventano costosi.',
    },
    { type: 'h2', text: 'I limiti di Excel' },
    {
      type: 'p',
      text: 'Excel calcola giusto, ma prima bisogna ricopiare ogni posizione, con il rischio di saltarne una o di sbagliare unità. E alla fine l’architetto si aspetta spesso il proprio documento compilato, non la vostra tabella.',
    },
    { type: 'h2', text: 'I software di calcolo' },
    {
      type: 'p',
      text: 'I software specializzati del mercato svizzero gestiscono lo scambio di file di capitolato strutturati e biblioteche di prezzi complete. Sono potenti, ma spesso pensati per imprese che hanno una persona dedicata al calcolo, con i costi e la formazione che ne derivano.',
    },
    { type: 'h2', text: 'La via di mezzo: partire dal PDF ricevuto' },
    {
      type: 'p',
      text: 'La funzione «Compilare un capitolato» di Cantia, in beta, parte dal documento che ricevete davvero: il PDF. Posizioni, unità e quantità vengono riprese, anche da una scansione, con una schermata di verifica. Inserite i prezzi da tastiera, i vostri prezzi abituali vengono proposti e il PDF originale esce compilato con prezzi unitari, importi, riporti e totali. Dal piano Team con 3 capitolati al mese, illimitata con il piano Entreprise.',
    },
    {
      type: 'callout',
      title: 'Cosa la funzione non fa',
      text: 'Non redige capitolati vuoti e non sostituisce un software di calcolo completo per una grande impresa. Serve a rispondere in fretta e bene ai capitolati che ricevete.',
    },
    {
      type: 'cta',
      title: 'Provatela sul vostro prossimo capitolato',
      text: '14 giorni di prova, senza impegno: importate il PDF ricevuto e guardate il risultato.',
      buttonLabel: 'Provare 14 giorni',
    },
  ],
  faq: [
    {
      question: 'Serve un software speciale per rispondere ai capitolati in Svizzera?',
      answer: 'No. Molte piccole imprese li compilano a mano o in Excel. Uno strumento fa soprattutto risparmiare tempo ed elimina gli errori di calcolo e di riporto.',
    },
    {
      question: 'Cantia legge i file di capitolato CRBX o SIA 451?',
      answer: 'Non ancora: oggi l’importazione riguarda i capitolati in PDF, CPN o no. È il formato che riceve la maggior parte delle piccole imprese.',
    },
    {
      question: 'Quanti capitolati si possono compilare con Cantia?',
      answer: '3 al mese con il piano Team, senza limite con il piano Entreprise. La funzione non è inclusa nel piano Essenziale.',
    },
  ],
  relatedSlugs: ['remplir-soumission-pdf-architecte', 'bexio-vs-cantia-logiciel-batiment', 'temps-repondre-soumission-rentable'],
};
