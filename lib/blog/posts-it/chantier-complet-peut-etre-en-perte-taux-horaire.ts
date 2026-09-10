import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'chantier-complet-peut-etre-en-perte-taux-horaire',
  question: 'Perché un cantiere terminato e pagato può comunque essere in perdita?',
  title: 'Un cantiere «riuscito» può comunque essere in perdita: ecco perché',
  description:
    'Un cantiere consegnato nei tempi, pagato integralmente, può comunque essere in perdita reale se il costo orario del dipendente non è mai stato confrontato con le ore effettivamente lavorate.',
  excerpt:
    'Il cantiere è consegnato, il cliente soddisfatto, la fattura pagata. Eppure l’azienda potrebbe averci perso denaro, senza che alcun segnale lo abbia mai mostrato.',
  category: 'Chantier & rentabilité',
  keywords: ['cantiere in perdita', 'redditività cantiere', 'costo orario', 'preventivato vs reale', 'margine reale'],
  publishedAt: '2026-04-06',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Il cliente è soddisfatto, il pagamento è arrivato, il cantiere successivo sta già partendo. Tutto indica un successo. Tranne una cifra che nessuno ha guardato: quante ore sono state davvero impiegate, rispetto a quanto era stato preventivato. È lì che si nasconde la perdita che la sensazione di «cantiere riuscito» maschera quasi sempre.',
    },
    { type: 'h2', text: 'La trappola del ragionamento «sono stato pagato quindi ho guadagnato»' },
    {
      type: 'p',
      text: 'Essere pagati l’importo del preventivo non dice nulla sulla redditività se il preventivo stesso sottostimava le ore necessarie. Un cantiere preventivato su 40h di manodopera che ne ha effettivamente richieste 58 non ha generato il margine previsto, anche se il cliente ha pagato esattamente l’importo concordato. Lo scarto di ore è stato semplicemente assorbito in silenzio, senza che la fattura ne dicesse nulla.',
    },
    {
      type: 'callout',
      title: 'Il calcolo che quasi nessuno fa',
      text: 'Margine reale = prezzo venduto − (ore effettivamente impiegate × costo orario reale) − materiale effettivamente acquistato − subappalto effettivamente fatturato. Senza questo calcolo specifico per cantiere, un’azienda può sembrare redditizia a fine anno pur avendo, cantiere dopo cantiere, sottostimato sistematicamente le proprie ore.',
    },
    { type: 'h2', text: 'Perché passa inosservato' },
    {
      type: 'list',
      items: [
        'La contabilità generale dell’azienda resta positiva finché un altro cantiere più redditizio compensa la perdita del primo, così che la perdita individuale si dissolve nella media',
        'Senza un monitoraggio delle ore cantiere per cantiere, semplicemente non esiste alcuna cifra da confrontare con il preventivo iniziale',
        'Uno sforamento di ore distribuito su più settimane non salta mai all’occhio come farebbe uno sforamento di un solo giorno',
      ],
    },
    { type: 'h2', text: 'Il segnale da sorvegliare, non a posteriori' },
    {
      type: 'p',
      text: 'Il momento utile per rilevare questo tipo di perdita non è la chiusura del cantiere, è la metà, quando le ore già impiegate si avvicinano già a quanto era stato preventivato per l’insieme. A questo punto resta ancora un margine di manovra: riorganizzare, accelerare, o quantomeno capire per il prossimo preventivo simile.',
    },
    {
      type: 'p',
      text: 'Sul lungo periodo, è proprio questa cifra a distinguere un’azienda che cresce da un’azienda che gira senza mai arricchirsi: non il fatturato fatturato, ma lo scarto medio tra ore preventivate e ore reali, cantiere dopo cantiere.',
    },
    {
      type: 'cta',
      title: 'Il margine reale, visibile cantiere per cantiere',
      text: 'Il modulo Redditività di Cantia confronta automaticamente il preventivato e il reale (ore, materiale, subappalto) per individuare uno sforamento prima della chiusura, non dopo.',
      buttonLabel: 'Scoprire la redditività per cantiere',
    },
  ],
  faq: [
    {
      question: 'Come può un cantiere pagato integralmente essere in perdita?',
      answer:
        'Se le ore effettivamente impiegate superano significativamente le ore preventivate, il costo reale della manodopera può superare il margine previsto, anche se il cliente ha pagato l’importo esatto del preventivo.',
    },
    {
      question: 'Perché questo tipo di perdita passa spesso inosservato?',
      answer:
        'Perché la contabilità generale dell’azienda può restare positiva grazie ad altri cantieri più redditizi, e perché senza un monitoraggio preciso delle ore per cantiere, non esiste alcuna cifra da confrontare con il preventivo iniziale.',
    },
    {
      question: 'In quale momento bisogna verificare se un cantiere sta sforando in ore?',
      answer:
        'Durante il cantiere, non alla chiusura: un monitoraggio continuo permette ancora di correggere, mentre una constatazione fatta dopo la fine dei lavori serve solo a capire cosa è successo.',
    },
  ],
  relatedSlugs: [
    'suivre-rentabilite-chantier-sans-excel',
    'calculer-prix-devis-renovation-suisse',
    'gerer-plusieurs-chantiers-en-parallele-methode',
  ],
};
