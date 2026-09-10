import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'calculer-prix-devis-renovation-suisse',
  question: 'Come si calcola il prezzo di un preventivo di ristrutturazione in Svizzera?',
  title: 'Come calcolare il prezzo di un preventivo di ristrutturazione in Svizzera',
  description:
    'Metodo concreto per calcolare un preventivo di ristrutturazione in Svizzera (costo orario reale, materiale, margine, IVA 8,1%), con un esempio numerico completo.',
  excerpt:
    'La tariffa oraria copiata da un concorrente è la prima causa di cantieri che «girano» senza mai arricchire nessuno. Ecco come calcolarla davvero.',
  category: 'Devis & facturation',
  keywords: ['preventivo', 'prezzo', 'ristrutturazione', 'costo orario', 'margine', 'iva', 'calcolo prezzi'],
  publishedAt: '2026-01-12',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'Un preventivo che batte la concorrenza di dieci franchi all’ora quasi mai è un preventivo intelligente. Spesso è un preventivo che non è mai stato calcolato davvero. La tariffa oraria ricopiata da un concorrente, o decisa d’istinto un lunedì mattina, è la prima ragione per cui un cantiere «che gira» non finisce mai per arricchire nessuno.',
    },
    { type: 'h2', text: '1. Il costo orario reale non ha nulla a che vedere con lo stipendio netto' },
    {
      type: 'p',
      text: 'Un collaboratore pagato CHF 32/h lordi non costa CHF 32/h all’azienda. Bisogna aggiungere gli oneri sociali a carico del datore di lavoro (AVS/AI/IPG, AD, LPP, LAINF: contate dal 15 al 20% del lordo a seconda della cassa e del ramo), la tredicesima e le vacanze proporzionali, l’attrezzatura e l’abbigliamento da lavoro, e soprattutto il tempo che non si fattura mai: spostamenti, preventivi, coordinamento, amministrazione. Su una settimana reale, questo tempo morto sfiora spesso un’intera giornata su cinque. Risultato: un’azienda che paga CHF 32/h lordi sostiene un costo orario reale vicino a CHF 55-65/h, tutto incluso. Ed è questa la cifra da inserire nel preventivo, non lo stipendio.',
    },
    {
      type: 'callout',
      title: 'Il test di trenta secondi',
      text: 'Prenda la Sua tariffa oraria fatturata, tolga il 20% di oneri, poi ancora il tempo non fatturabile della settimana (spesso un buon terzo del tempo reale). Se ciò che resta non copre comodamente la Sua struttura, non perde denaro ogni giorno. Ma un solo mese negativo basta a cancellare il margine dell’intero anno.',
    },
    { type: 'h2', text: '2. Il materiale: calcolare al prezzo pagato, mai al prezzo sperato' },
    {
      type: 'p',
      text: 'Un prezzo fornitore visto a gennaio non è garantito per nessuno a giugno. Su un cantiere di ristrutturazione che si estende su più mesi, esistono solo due opzioni: ottenere un’offerta ferma dal fornitore per tutta la durata, oppure integrare un margine di sicurezza del 3-8% (più alto per legno, metallo e isolanti, i cui prezzi oscillano di più).',
    },
    { type: 'h2', text: '3. Il margine: ciò che separa un preventivo onesto da uno suicida' },
    {
      type: 'list',
      items: [
        'Spese fisse di struttura (locale, veicoli, assicurazioni, contabilità): contate dal 10 al 15%',
        'Utile netto mirato: dal 5 al 12% a seconda del mestiere',
        'Accantonamento per imprevisti: dal 5 al 10%, e in una ristrutturazione non è mai un lusso',
      ],
    },
    {
      type: 'p',
      text: 'Nella ristrutturazione, l’imprevisto non è l’eccezione, è la norma: un muro portante scoperto dietro un rivestimento, un impianto elettrico fuori norma, umidità che risale da un vespaio che nessuno apriva da vent’anni. Un preventivo che non accantona nulla per questo si trasforma sistematicamente in un supplemento penoso da negoziare a cantiere aperto, proprio nel momento in cui il rapporto di forza è passato dalla parte del cliente.',
    },
    { type: 'h2', text: '4. L’IVA, sull’importo giusto' },
    {
      type: 'p',
      text: 'L’aliquota normale svizzera è dell’8,1% dal 1° gennaio 2024, applicata sul totale al netto (manodopera + materiale + margine), e non riga per riga con arrotondamenti che derivano su una lunga lista di posizioni. È esattamente il tipo di errore invisibile prodotto da un foglio di calcolo mal concepito.',
    },
    { type: 'h2', text: '5. Un esempio concreto: posa di finestre a triplo vetro' },
    {
      type: 'table',
      headers: ['Voce', 'Dettaglio', 'Importo CHF'],
      rows: [
        ['Manodopera', '16h × CHF 65/h (costo reale)', '1’040.00'],
        ['Materiale', '6 finestre a triplo vetro + posa', '4’300.00'],
        ['Margine (spese fisse + utile)', '18% sul subtotale', '961.20'],
        ['Totale al netto', '', '6’301.20'],
        ['IVA 8,1%', '', '510.40'],
        ['Totale lordo', '', '6’811.60'],
      ],
    },
    {
      type: 'cta',
      title: 'Il calcolo si fa da solo, il margine no',
      text: 'Su Cantia, l’IVA, i totali e il catalogo prezzi si calcolano automaticamente a ogni riga. L’unica cifra che resta da scegliere è il Suo margine.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Quale margine applicare su un preventivo di ristrutturazione in Svizzera?',
      answer:
        'In genere tra il 20 e il 35% in totale (spese fisse + utile + accantonamento imprevisti), da adattare in base al mestiere e al livello di incertezza dello stato esistente del cantiere.',
    },
    {
      question: 'Bisogna includere gli imprevisti nel prezzo del preventivo o fatturarli a parte?',
      answer:
        'Esistono entrambi gli approcci: un accantonamento integrato nel prezzo fisso, oppure una clausola esplicita che prevede una fatturazione complementare su preventivo supplementare in caso di scoperta imprevista, a condizione però che tale clausola figuri chiaramente sul preventivo iniziale.',
    },
    {
      question: 'L’IVA si calcola sul prezzo netto o lordo del preventivo?',
      answer:
        'Sempre sull’importo al netto dell’imposta. L’aliquota normale è dell’8,1% dal 2024 per la maggior parte delle prestazioni edili.',
    },
  ],
  relatedSlugs: [
    'rediger-devis-qui-inspire-confiance-client',
    'norme-sia-118-devis-obligatoire',
    'suivre-rentabilite-chantier-sans-excel',
  ],
};
