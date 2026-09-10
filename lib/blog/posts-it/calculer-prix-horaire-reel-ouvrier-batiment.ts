import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'calculer-prix-horaire-reel-ouvrier-batiment',
  question: 'Come calcolare il vero costo orario di un operaio, al di là del suo salario lordo?',
  title: 'Il vero costo orario di un operaio edile: molto più del suo salario lordo',
  description:
    'Un preventivo calcolato sul solo salario lordo di un operaio sottostima sistematicamente il vero costo orario: bisogna contare anche gli oneri sociali, le assenze pagate e il tempo non fatturabile.',
  excerpt:
    'Molte aziende calcolano i loro preventivi su una tariffa oraria approssimativa ereditata da anni di prassi, senza mai prendersi il tempo di ricalcolare quanto costa realmente un operaio una volta integrati tutti gli oneri.',
  category: 'Chantier & rentabilité',
  keywords: ['costo orario operaio', 'calcolo tariffa oraria edilizia', 'oneri sociali costruzione', 'redditività cantiere', 'calcolo preventivo'],
  publishedAt: '2026-07-28',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Un preventivo calcolato sul salario lordo di un operaio, senza altro, sottostima quasi sempre il vero costo orario dell’azienda. Tra gli oneri sociali a carico del datore di lavoro, le assenze pagate e il tempo di lavoro effettivamente fatturabile in un anno, lo scarto tra il salario dichiarato e il costo reale sostenuto dall’azienda supera spesso il 40 %.',
    },
    { type: 'h2', text: 'Le componenti del vero costo orario' },
    {
      type: 'list',
      items: [
        'Salario lordo annuo, compresa la tredicesima',
        'Oneri sociali a carico del datore di lavoro (AVS/AI/IPG, LPP, LAINF, assegni familiari), ossia generalmente il 15-20 % del salario lordo',
        'Vacanze e giorni festivi pagati, che riducono il numero di ore effettivamente lavorate ma non la massa salariale annua',
        'Tempo non fatturabile: spostamenti interni, manutenzione del materiale, formazione, intemperie pagate',
      ],
    },
    {
      type: 'stat',
      value: '~1750 h',
      label: 'ore effettivamente fatturabili all’anno e per operaio in media, dopo aver dedotto vacanze, assenze e tempo non produttivo da un tempo pieno teorico',
    },
    { type: 'h2', text: 'La formula di base' },
    {
      type: 'p',
      text: 'Costo orario reale = (salario lordo annuo + oneri sociali a carico del datore di lavoro) ÷ ore effettivamente fatturabili nell’anno. La trappola classica è dividere il costo annuo per il numero di ore contrattuali teoriche (ad esempio 2080 ore per un tempo pieno), senza dedurre le assenze e il tempo non produttivo; questo errore sottostima sistematicamente la tariffa oraria reale.',
    },
    {
      type: 'callout',
      title: 'Una tariffa oraria sottovalutata erode il margine su ogni cantiere, senza mai accorgersene cantiere per cantiere',
      text: 'Spesso è solo confrontando il preventivato con il costo realmente sostenuto, cantiere per cantiere, che un’azienda si rende conto che la sua tariffa oraria di riferimento era troppo bassa da anni.',
    },
    {
      type: 'cta',
      title: 'Confrontare preventivato e costo reale, cantiere per cantiere',
      text: 'Il modulo Redditività di Cantia confronta automaticamente quanto preventivato con le ore e i costi realmente sostenuti su ogni cantiere. È il modo migliore per sapere se la vostra tariffa oraria è realistica.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Bisogna includere gli oneri sociali nel calcolo del costo orario?',
      answer:
        'Sì, rappresentano generalmente il 15-20 % del salario lordo e devono essere imperativamente integrati, pena una forte sottostima del costo orario reale.',
    },
    {
      question: 'Quante ore lavora realmente un operaio all’anno, escluse le assenze?',
      answer:
        'Circa 1750 ore fatturabili in media, dopo aver dedotto vacanze, giorni festivi e tempo non produttivo da un tempo pieno teorico di circa 2080 ore.',
    },
    {
      question: 'Perché la tariffa oraria di riferimento di un’azienda è spesso troppo bassa?',
      answer:
        'Perché è ereditata da una prassi antica mai ricalcolata, piuttosto che da un calcolo esplicito che integri oneri sociali e ore effettivamente fatturabili.',
    },
  ],
  relatedSlugs: [
    'chantier-complet-peut-etre-en-perte-taux-horaire',
    'suivre-rentabilite-chantier-sans-excel',
    'calculer-prix-devis-renovation-suisse',
  ],
};
