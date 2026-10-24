import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'comprendre-soumission-can-positions',
  question: 'Come leggere un capitolato CPN (capitoli, posizioni, testi da completare)?',
  title: 'Leggere un capitolato CPN: capitoli, posizioni e testi da completare',
  description:
    'Cosa significano numeri, capitoli, posizioni riservate e testi da completare in un capitolato redatto secondo il CPN, per calcolare senza dimenticare nulla.',
  excerpt:
    'Un capitolato CPN sembra cifrato. Una volta capita la logica si legge in fretta, ed è proprio ciò che permette di riutilizzare i vostri prezzi da un cantiere all’altro.',
  category: 'Juridique & normes',
  keywords: ['capitolato cpn', 'catalogo delle posizioni normalizzate', 'crb cpn', 'npk', 'posizione capitolato', 'leggere un capitolato'],
  publishedAt: '2026-10-24',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'In Svizzera molti capitolati dell’edilizia sono redatti con il CPN, il Catalogo delle posizioni normalizzate pubblicato dal CRB (in tedesco NPK, in francese CAN). L’architetto vi sceglie testi standardizzati, li completa e aggiunge le quantità. Per l’impresa il vantaggio è doppio: le descrizioni sono precise, e una stessa prestazione porta lo stesso numero da un progetto all’altro.',
    },
    { type: 'h2', text: 'La struttura di un capitolato CPN' },
    {
      type: 'list',
      items: [
        'Il capitolo, identificato da un numero a tre cifre, corrisponde a un ambito di lavori.',
        'Al suo interno, paragrafi e sottoparagrafi raggruppano le prestazioni affini.',
        'La posizione è la riga che calcolate: numero, testo, unità, quantità, poi prezzo unitario e importo da compilare.',
        'Il riepilogo somma i capitoli e applica riduzioni e IVA.',
      ],
    },
    { type: 'h2', text: 'I testi da completare' },
    {
      type: 'p',
      text: 'Alcune posizioni contengono passaggi che l’architetto ha precisato (materiale, spessore, prodotto), altre vi chiedono un’informazione: marca proposta, tipo di prodotto o a volte una quantità. Leggetele con attenzione: un prodotto da indicare non compilato può rendere l’offerta incompleta, e un prodotto imposto cambia il vostro prezzo d’acquisto.',
    },
    { type: 'h2', text: 'Posizioni riservate ed eventuali' },
    {
      type: 'p',
      text: 'Un capitolato può contenere posizioni eseguite solo se necessario, o varianti da calcolare in aggiunta all’offerta di base. Il documento indica come contano nel totale. Calcolatele seriamente: servono spesso da base per i lavori supplementari durante il cantiere.',
    },
    {
      type: 'callout',
      title: 'E i capitolati senza CPN?',
      text: 'Molti architetti, soprattutto sui piccoli progetti, redigono le proprie posizioni. La logica resta la stessa: righe numerate con unità e quantità, un prezzo unitario da compilare, subtotali e un riepilogo.',
    },
    { type: 'h2', text: 'Perché è utile per i vostri prezzi' },
    {
      type: 'p',
      text: 'Poiché una stessa prestazione mantiene il suo numero di posizione, potete costruire un catalogo dei vostri prezzi per numero e riutilizzarlo. In Cantia, i prezzi che avete già offerto per un numero vengono proposti quando la stessa posizione torna in un nuovo capitolato importato. Il catalogo conserva il numero, l’unità e il vostro prezzo, mai il testo del CPN.',
    },
    {
      type: 'cta',
      title: 'Importate il vostro prossimo capitolato, CPN o no',
      text: 'Posizioni, unità e quantità riprese, i vostri prezzi proposti, il PDF originale compilato. In beta dal piano Team.',
      buttonLabel: 'Provare 14 giorni',
    },
  ],
  faq: [
    {
      question: 'Cosa vuol dire CPN?',
      answer: 'Catalogo delle posizioni normalizzate, pubblicato dal CRB. È la versione italiana del NPK (Normpositionen-Katalog) usato nella Svizzera tedesca, in francese CAN.',
    },
    {
      question: 'Serve una licenza per leggere un capitolato CPN?',
      answer:
        'In linea di principio no: ricevete il documento dall’architetto e lo compilate. Le licenze del CRB riguardano soprattutto chi redige capitolati o usa il catalogo in un software.',
    },
    {
      question: 'Cantia legge anche i capitolati senza CPN?',
      answer: 'Sì. L’importazione funziona con i capitolati CPN e con quelli redatti dall’architetto stesso, compresi i documenti scansionati, con una schermata di verifica.',
    },
  ],
  relatedSlugs: ['remplir-soumission-pdf-architecte', 'calculer-prix-unitaire-soumission', 'norme-sia-118-devis-obligatoire'],
};
