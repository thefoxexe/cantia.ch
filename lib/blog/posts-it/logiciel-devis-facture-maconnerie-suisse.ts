import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'logiciel-devis-facture-maconnerie-suisse',
  question: 'Come deve strutturare i propri preventivi e fatture un muratore indipendente o una piccola impresa di muratura?',
  title: 'Preventivi e fatture per un’impresa di muratura: il metodo che evita le brutte sorprese',
  description:
    'Un preventivo di muratura mal strutturato nasconde spesso una perdita: materiali sottovalutati, ore del team mal contate, imprevisti non accantonati. Metodo concreto per calcolare correttamente.',
  excerpt:
    'Tra le opere murarie fatturate al m³, le finiture al m² e le ore di movimentazione che non rientrano in nessuna categoria, un preventivo di muratura mal costruito erode il margine prima ancora del primo colpo di piccone.',
  category: 'Métiers du bâtiment',
  keywords: ['preventivo muratura', 'fatturazione muratore indipendente', 'software gestione impresa muratura', 'calcolare cantiere opere murarie', 'prezzo muratura Svizzera'],
  publishedAt: '2026-08-28',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'La muratura mescola diverse unità di misura nello stesso cantiere: il m³ di calcestruzzo colato, il m² di muro eretto, il numero di ore di movimentazione e finitura. Un preventivo che applica un unico prezzo forfettario sull’insieme finisce quasi sempre per sottovalutare una parte del lavoro, spesso la manodopera di finitura, che in realtà richiede più tempo del previsto.',
    },
    { type: 'h2', text: 'Strutturare il preventivo per voce, non per l’intero cantiere' },
    {
      type: 'list',
      items: [
        'Scavo e fondazioni: al m³ o a forfait secondo la complessità del terreno',
        'Elevazione dei muri (blocchi, mattoni, calcestruzzo): al m² o al m³ secondo il tipo di muratura',
        'Getto e solette in calcestruzzo: al m³, con il costo del calcestruzzo pronto per l’uso separato dalla manodopera',
        'Finiture (intonaci, giunti, rifacimento dei giunti): al m², spesso sottostimato perché richiede molto tempo',
        'Movimentazione, smaltimento delle macerie, pulizia del cantiere: in ore a economia, da non dimenticare mai',
      ],
    },
    {
      type: 'stat',
      value: '15-20 %',
      label: 'quota tipica del tempo totale di un cantiere di muratura dedicata alla movimentazione e alla pulizia, una voce spesso assente dal preventivo iniziale',
    },
    { type: 'h2', text: 'La trappola del prezzo al m² che non dice nulla sull’accesso al cantiere' },
    {
      type: 'p',
      text: 'Due cantieri con la stessa superficie di muro da erigere possono avere costi molto diversi a seconda dell’accesso (autobetoniera che può avvicinarsi o meno, piano, spazio di stoccaggio dei materiali). Un preventivo che applica un prezzo al m² identico ovunque, senza adeguarlo all’accessibilità reale del cantiere, finisce per livellare i margini verso il basso. Il cantiere facile paga così per quello difficile.',
    },
    {
      type: 'callout',
      title: 'Separare sempre materiali e manodopera sul preventivo',
      text: 'Il prezzo del cemento, dei blocchi o dell’armatura oscilla regolarmente. Un preventivo che li fonde in un forfait globale impedisce qualsiasi rivalutazione pulita se il cantiere subisce ritardi e i prezzi dei materiali si muovono nel frattempo.',
    },
    {
      type: 'cta',
      title: 'Un catalogo di prezzi che conserva le Sue voci ricorrenti',
      text: 'Cantia mantiene in memoria i Suoi prezzi di muratura (m³ di calcestruzzo, m² di muro, forfait di finitura) affinché ogni nuovo preventivo si costruisca assemblando voci già calcolate, non ripartendo da zero.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Come calcolare un preventivo di muratura che mescola più unità?',
      answer:
        'Dettagliando ogni voce con la propria unità (m³ per il calcestruzzo e le fondazioni, m² per i muri e le finiture, ore a economia per la movimentazione), piuttosto che un unico prezzo forfettario che maschera gli scostamenti.',
    },
    {
      question: 'Bisogna includere il prezzo dei materiali nel prezzo al m² di muratura?',
      answer:
        'È preferibile separarli sul preventivo: ciò permette di adeguare facilmente il prezzo se il costo dei materiali cambia prima dell’inizio del cantiere, senza dover rifare tutto il calcolo.',
    },
    {
      question: 'Come non dimenticare il tempo di movimentazione in un preventivo di muratura?',
      answer:
        'Prevedendo una voce dedicata in ore a economia per il trasporto dei materiali, lo smaltimento delle macerie e la pulizia: una voce che rappresenta spesso il 15-20 % del tempo totale del cantiere.',
    },
  ],
  relatedSlugs: [
    'calculer-prix-devis-renovation-suisse',
    'calculer-prix-de-revient-chantier-batiment',
    'checklist-ouverture-chantier-artisan',
  ],
};
