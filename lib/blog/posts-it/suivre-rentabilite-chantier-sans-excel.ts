import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'suivre-rentabilite-chantier-sans-excel',
  question: 'Come seguire la redditività di un cantiere senza passare da Excel?',
  title: 'Seguire la redditività di un cantiere senza foglio di calcolo Excel',
  description:
    'Un foglio Excel di monitoraggio cantiere si rompe non appena una formula cambia o un collaboratore dimentica una riga. Ecco un metodo più affidabile per sapere se un cantiere è redditizio in tempo reale.',
  excerpt:
    'Il file Excel di monitoraggio cantiere raramente dura più di qualche mese. Il problema non è la disciplina del team: è il formato stesso.',
  category: 'Chantier & rentabilité',
  keywords: ['redditività cantiere', 'excel', 'preventivato vs reale', 'controllo dei costi', 'margine cantiere'],
  publishedAt: '2026-02-05',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Quasi tutte le aziende edili hanno, a un certo punto, tenuto un file Excel di monitoraggio cantiere. E quasi tutte hanno finito per abbandonarlo: non per mancanza di rigore, ma perché il foglio di calcolo si rompe per ragioni strutturali che la disciplina non risolve mai.',
    },
    { type: 'h2', text: 'Perché si rompe, nei fatti' },
    {
      type: 'list',
      items: [
        'Una formula modificata per errore su una riga si propaga silenziosamente, senza che nessuno se ne accorga finché il totale finale non è visibilmente sbagliato',
        'Il file vive su un computer o un drive condiviso: due persone che modificano contemporaneamente si sovrascrivono a vicenda il lavoro',
        'Le ore, le fatture fornitori e il materiale si registrano a posteriori, spesso a fine cantiere (troppo tardi per reagire a un superamento)',
        'Nessun collegamento automatico tra il preventivo iniziale e i costi reali: tutto va reinserito a mano, con il rischio di errore che ciò comporta',
      ],
    },
    { type: 'h2', text: 'Cosa significa davvero «redditività»' },
    {
      type: 'p',
      text: 'Non è soltanto «quanto ho fatturato». È il confronto tra ciò che è stato preventivato e ciò che il cantiere è realmente costato: ore di manodopera al costo orario reale, materiale effettivamente acquistato, subappalto fatturato. Senza questa riconciliazione precisa, un cantiere può sembrare redditizio sulla carta mentre ha assorbito tre volte più ore del previsto. Nessuno lo scopre prima della chiusura.',
    },
    {
      type: 'callout',
      title: 'Il segnale utile arriva a metà cantiere, non alla fine',
      text: 'Una redditività calcolata solo alla chiusura arriva troppo tardi per correggere qualsiasi cosa. Il vero vantaggio è vedere a metà cantiere che le ore superano già il budget, il che permette di correggere prima che il margine sia del tutto scomparso.',
    },
    { type: 'h2', text: 'Un metodo che regge nel tempo' },
    {
      type: 'list',
      items: [
        'Ogni preventivo accettato diventa il riferimento «budget» del cantiere (ore e materiale previsti, prezzo di vendita)',
        'Ogni ora lavorata e ogni acquisto materiale si registra direttamente sul cantiere, man mano (non ricostruito a fine mese) — una foto dello scontrino basta, il fornitore e l’importo si compilano da soli',
        'Le fatture dei subappaltatori legate al cantiere si sommano automaticamente al costo reale',
        'Il saldo (venduto meno costo reale) resta visibile in continuo, non solo alla chiusura',
      ],
    },
    {
      type: 'p',
      text: 'Questo calcolo diventa affidabile esattamente il giorno in cui non richiede più una reintroduzione manuale. Ogni inserimento alimenta lo stesso cantiere, senza fase di sincronizzazione tra più file che finiscono sempre per disallinearsi.',
    },
    {
      type: 'cta',
      title: 'La redditività, aggiornata da sola',
      text: 'Il modulo Redditività di Cantia confronta automaticamente il preventivato e il reale, cantiere per cantiere, a partire dalle ore e dalle spese già registrate altrove nell’app.',
      buttonLabel: 'Scoprire la redditività per cantiere',
    },
  ],
  faq: [
    {
      question: 'Come calcolare la redditività reale di un cantiere?',
      answer:
        'Confrontando l’importo venduto al cliente (preventivo accettato) con il costo reale del cantiere: ore lavorate al costo orario reale dell’azienda, materiale effettivamente acquistato e fatture dei subappaltatori legate al cantiere.',
    },
    {
      question: 'Perché un monitoraggio Excel del cantiere finisce spesso abbandonato?',
      answer:
        'Perché si basa su una registrazione manuale a posteriori, fragile agli errori di formula, difficile da condividere in team in tempo reale, e senza collegamento automatico con il preventivo iniziale o le fatture.',
    },
    {
      question: 'In quale momento del cantiere bisogna seguire la redditività?',
      answer:
        'Idealmente in continuo, fin dall’avvio. Un monitoraggio fatto solo alla chiusura del cantiere arriva troppo tardi per correggere un superamento di ore o di budget materiale in corso d’opera.',
    },
    {
      question: 'Bisogna reinserire a mano ogni scontrino?',
      answer:
        'No: una foto dello scontrino o della fattura fornitore basta, il fornitore e l’importo vengono letti automaticamente e precompilano la spesa — resta solo da verificare prima di registrare.',
    },
  ],
  relatedSlugs: [
    'bexio-vs-cantia-logiciel-batiment',
    'calculer-prix-devis-renovation-suisse',
    'calculer-heures-travail-ouvrier-minutes-decimales',
  ],
};
