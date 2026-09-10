import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'sous-traitant-batiment-suisse-contrat-facturation',
  question: 'Come gestire un subappaltatore su un cantiere svizzero (contratto, responsabilità, fatturazione)?',
  title: 'Subappaltatore edile in Svizzera: contratto, responsabilità e fatturazione',
  description:
    'Ricorrere a un subappaltatore impegna l’imprenditore principale su più fronti: responsabilità verso il cliente, verifica delle assicurazioni, e monitoraggio preciso delle fatture ricevute per cantiere.',
  excerpt:
    'Subappaltare non solleva mai l’imprenditore principale dalla sua responsabilità verso il cliente. Il malinteso più diffuso dell’edilizia romanda, e il più costoso.',
  category: 'Chantier & rentabilité',
  keywords: ['subappaltatore', 'subappalto edilizia', 'responsabilità', 'contratto d’appalto', 'fattura subappaltatore'],
  publishedAt: '2026-02-12',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Ricorrere a un subappaltatore è una pratica comune nell’edilizia svizzera: un cantiere di ristrutturazione combina quasi sempre più mestieri che un’unica azienda non copre. Ciò che molti scoprono troppo tardi: subappaltare non solleva mai l’imprenditore principale dalla sua responsabilità verso il cliente.',
    },
    { type: 'h2', text: 'La responsabilità non si subappalta' },
    {
      type: 'p',
      text: 'Nei confronti del cliente, l’imprenditore principale resta responsabile del risultato dell’opera, anche se una parte del lavoro è stata affidata a un subappaltatore. Il cliente non ha in linea di principio alcun legame contrattuale diretto con il subappaltatore. Si tratta di un contratto separato tra l’imprenditore principale e quest’ultimo. In caso di vizio dell’opera del subappaltatore, è anzitutto l’imprenditore principale a rispondere verso il cliente, prima di potersi eventualmente rivalere sul subappaltatore.',
    },
    {
      type: 'callout',
      title: 'Verificare le assicurazioni prima di firmare, non dopo un sinistro',
      text: 'Prima di ingaggiare un subappaltatore, verificare che disponga di una responsabilità civile professionale in corso di validità, e che sia correttamente affiliato alle assicurazioni sociali per il suo personale. Una lacuna qui può ricadere sull’imprenditore principale, e il momento peggiore per scoprirlo è in pieno sinistro.',
    },
    { type: 'h2', text: 'Cosa dovrebbe blindare un contratto di subappalto' },
    {
      type: 'list',
      items: [
        'Il perimetro esatto dei lavori affidati, con limiti chiari rispetto agli altri mestieri del cantiere',
        'Il prezzo concordato e le modalità di pagamento (acconto, scadenzario, termine dopo la consegna)',
        'I termini di esecuzione, coordinati con la pianificazione globale del cantiere',
        'Le garanzie applicabili e la loro durata, in coerenza con ciò che l’imprenditore principale ha promesso al cliente finale',
        'Il riferimento esplicito alla norma SIA 118 se si applica al contratto principale, per evitare uno scarto tra i due livelli di contratto',
      ],
    },
    { type: 'h2', text: 'Il vero punto di attrito: non il giuridico, il controllo finanziario' },
    {
      type: 'p',
      text: 'Al di là del contratto, la difficoltà più frequente nella pratica quotidiana è molto più concreta: quanto è già stato fatturato a questo subappaltatore, quanto resta dovuto, opera su più cantieri contemporaneamente? Senza un monitoraggio centralizzato per cantiere, una fattura ricevuta si perde facilmente, o viene attribuita al cantiere sbagliato al momento di calcolare la redditività, senza che nessuno se ne accorga prima della chiusura.',
    },
    {
      type: 'p',
      text: 'È esattamente il dato che alimenta il calcolo di redditività di un cantiere: una fattura di subappaltatore registrata male falsa silenziosamente il margine visualizzato, in un senso o nell’altro.',
    },
    {
      type: 'cta',
      title: 'Un elenco di subappaltatori, collegato ai Suoi cantieri',
      text: 'Cantia centralizza i Suoi subappaltatori, le loro assegnazioni per cantiere e le fatture ricevute, direttamente collegate al calcolo di redditività del cantiere interessato.',
      buttonLabel: 'Scoprire il modulo Subappaltatori',
    },
  ],
  faq: [
    {
      question: 'Chi è responsabile verso il cliente in caso di vizio di un subappaltatore?',
      answer:
        'L’imprenditore principale resta responsabile verso il cliente finale, non avendo il subappaltatore in linea di principio un legame contrattuale diretto con quest’ultimo. L’imprenditore principale può poi rivalersi sul subappaltatore sulla base del loro proprio contratto.',
    },
    {
      question: 'Bisogna verificare le assicurazioni di un subappaltatore prima di ingaggiarlo?',
      answer:
        'Sì: bisogna verificare in particolare la sua responsabilità civile professionale e la sua affiliazione alle assicurazioni sociali (LAINF) per il suo personale, poiché una lacuna può avere conseguenze per l’imprenditore principale.',
    },
    {
      question: 'Il contratto di subappalto deve riprendere la norma SIA 118 del contratto principale?',
      answer:
        'È consigliato quando il contratto principale vi fa esso stesso riferimento, per evitare uno scarto di garanzie o di termini tra i due livelli di contratto.',
    },
  ],
  relatedSlugs: [
    'avs-ai-independant-batiment',
    'suivre-rentabilite-chantier-sans-excel',
    'norme-sia-118-devis-obligatoire',
  ],
};
