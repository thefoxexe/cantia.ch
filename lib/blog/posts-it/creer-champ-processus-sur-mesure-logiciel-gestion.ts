import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'creer-champ-processus-sur-mesure-logiciel-gestion',
  question: 'È possibile aggiungere un campo o un processo su misura nel proprio software gestionale?',
  title: 'Aggiungere un campo o un processo che non esiste da nessun’altra parte',
  description:
    'Un modulo standard non aderisce mai al 100% al modo di lavorare di un’impresa. Come un campo o un processo su misura colma quest’ultimo divario.',
  excerpt:
    'Un modulo preventivo standard copre il 90% delle esigenze. Il restante 10%, proprio del modo di lavorare di un’impresa precisa, merita talvolta un campo che non esiste in nessuno strumento generico.',
  category: 'Sur-mesure & automatisations',
  keywords: ['aggiungere campo su misura software', 'processo personalizzato gestione impresa', 'modulo su misura preventivo fattura', 'adattare software esigenze specifiche', 'campo personalizzato strumento gestionale edile'],
  publishedAt: '2026-08-18',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Uno strumento gestionale standard copre generalmente la grande maggioranza delle esigenze di un’impresa edile. Ma alcune imprese hanno un dettaglio di funzionamento proprio (un’informazione da monitorare sistematicamente, una tappa di validazione particolare) che nessun modulo generico prevede.',
    },
    { type: 'h2', text: 'Esempi di campi o processi davvero su misura' },
    {
      type: 'list',
      items: [
        'Un campo specifico da spuntare prima che un preventivo possa essere inviato (verifica propria del mestiere)',
        'Una tappa di validazione supplementare da parte di un responsabile prima dell’emissione di una fattura',
        'Un campo di monitoraggio proprio di un tipo di cantiere particolare, assente dai moduli standard',
        'Un processo di collaudo del cantiere con criteri propri dell’impresa',
      ],
    },
    {
      type: 'stat',
      value: '80/20',
      label: 'ripartizione tipica tra esigenze coperte da uno strumento standard ed esigenze davvero specifiche a un’impresa: è su questo ultimo 20% che il su misura fa la differenza',
    },
    { type: 'h2', text: 'Il su misura parte sempre da un’esigenza reale, non da un’idea astratta' },
    {
      type: 'p',
      text: 'Un campo o un processo su misura ha senso solo se risponde a un attrito reale riscontrato nella quotidianità. Per questo si costruisce generalmente discutendo direttamente del problema concreto, non elencando desideri teorici.',
    },
    {
      type: 'callout',
      title: 'Un campo su misura resta integrato al resto dello strumento',
      text: 'A differenza di un espediente improvvisato (un foglio di calcolo a parte, ad esempio), un campo sviluppato su misura si integra nello stesso posto del resto dei dati. Non c’è quindi né reinserimento né sistema parallelo da mantenere.',
    },
    {
      type: 'cta',
      title: 'Parliamo di ciò che manca alla Sua quotidianità',
      text: 'Se un dettaglio del Suo modo di lavorare non trova posto in Cantia oggi, ne parliamo. È spesso il punto di partenza di una funzionalità su misura.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Si può aggiungere un campo personalizzato a un preventivo o a una fattura in Cantia?',
      answer:
        'È possibile tramite lo sviluppo di funzionalità su misura, per esigenze proprie del modo di lavorare di un’impresa in particolare.',
    },
    {
      question: 'Come inizia concretamente una richiesta di campo o processo su misura?',
      answer:
        'In genere con una discussione diretta sul problema concreto riscontrato nella quotidianità, piuttosto che da un elenco teorico di desideri.',
    },
    {
      question: 'Un campo su misura resta integrato al resto dello strumento?',
      answer:
        'Sì: a differenza di un espediente esterno (foglio di calcolo separato, ad esempio), un campo sviluppato su misura si integra direttamente ai dati esistenti, senza reinserimento.',
    },
  ],
  relatedSlugs: [
    'cantia-adapte-metier-specifique-batiment',
    'pourquoi-modeles-figes-ne-conviennent-pas-tous-metiers-batiment',
    'demander-fonctionnalite-sur-mesure-editeur-logiciel',
  ],
};
