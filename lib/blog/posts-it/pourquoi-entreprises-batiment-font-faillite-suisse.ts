import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'pourquoi-entreprises-batiment-font-faillite-suisse',
  question: 'Perché così tante piccole imprese edili falliscono nonostante un buon portafoglio ordini?',
  title: 'Perché imprese edili in piena attività finiscono per fallire',
  description:
    'Avere lavoro non basta: le cause più frequenti di fallimento nell’edilizia sono un problema di tesoreria e di margine invisibile, non una mancanza di cantieri.',
  excerpt:
    'Un’azienda che «non smette mai di lavorare» può comunque affondare. Il portafoglio ordini rassicura, ma non dice nulla sul margine reale né sullo sfasamento tra spese e incassi.',
  category: 'Chantier & rentabilité',
  keywords: ['fallimento impresa edile', 'tesoreria costruzione', 'margine invisibile cantiere', 'gestione PMI edilizia', 'redditività artigiano'],
  publishedAt: '2026-07-25',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'È un paradosso frequente nel settore: un’impresa edile con più cantieri attivi contemporaneamente, senza mancanza di lavoro, che si ritrova comunque in cessazione dei pagamenti. I dati del settore mostrano che la causa non è quasi mai una mancanza di domanda, ma una combinazione di tesoreria mal anticipata e margine reale mai misurato cantiere per cantiere.',
    },
    { type: 'h2', text: 'Le 4 cause più frequenti' },
    {
      type: 'list',
      items: [
        'Lo sfasamento di tesoreria: fornitori e salari si pagano ogni mese, ma le fatture clienti vengono saldate a 30, 60 o 90 giorni, tanto che un cantiere «redditizio sulla carta» può comunque provocare una crisi di liquidità',
        'Cantieri sotto-preventivati che si compensano mentalmente con altri giudicati «buoni», senza mai verificare quale finanzia davvero l’altro',
        'Una crescita troppo rapida dell’organico finanziata dal fatturato futuro invece che da una tesoreria già costituita',
        'Un solo cliente o un solo grande cantiere che rappresenta una quota sproporzionata del fatturato, con un rischio di concentrazione non anticipato',
      ],
    },
    {
      type: 'callout',
      title: 'Il fatturato non è mai un indicatore di salute finanziaria',
      text: 'Un’azienda può fatturare molto e restare strutturalmente in perdita se il suo margine reale per cantiere non viene mai misurato. Solo il monitoraggio della redditività cantiere per cantiere rivela ciò che il fatturato da solo non mostra.',
    },
    { type: 'h2', text: 'Cosa protegge concretamente una piccola struttura' },
    {
      type: 'list',
      items: [
        'Una previsione di tesoreria a 30-60-90 giorni, aggiornata regolarmente piuttosto che ricostruita in urgenza',
        'Un monitoraggio della redditività per cantiere, non solo del fatturato globale dell’azienda',
        'Una fatturazione di acconti sistematica sui cantieri di dimensione significativa',
        'Una diversificazione progressiva del portafoglio clienti, anche modesta',
      ],
    },
    {
      type: 'cta',
      title: 'Vedere arrivare i problemi di tesoreria prima che si presentino',
      text: 'Il modulo Liquidità di Cantia proietta il vostro saldo futuro tenendo conto delle fatture in sospeso e delle spese ricorrenti. Quanto basta per anticipare un calo piuttosto che subirlo.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Un buon portafoglio ordini protegge un’impresa edile dal fallimento?',
      answer:
        'No. La causa più frequente di fallimento nel settore è un problema di tesoreria o di margine reale non misurato, non una mancanza di cantieri in corso.',
    },
    {
      question: 'Perché un cantiere «redditizio» può comunque creare una crisi di tesoreria?',
      answer:
        'Perché gli oneri (salari, fornitori) si pagano mensilmente mentre i clienti pagano spesso a 30-90 giorni, il che può soffocare la cassa anche su un cantiere in utile.',
    },
    {
      question: 'Qual è il miglior indicatore di salute finanziaria per un’impresa edile?',
      answer:
        'Il miglior indicatore è la redditività misurata cantiere per cantiere, associata a una previsione di tesoreria a breve termine, poiché il fatturato globale da solo non rivela nulla del margine reale.',
    },
  ],
  relatedSlugs: [
    'chantier-complet-peut-etre-en-perte-taux-horaire',
    'calculer-prix-horaire-reel-ouvrier-batiment',
    'relancer-client-facture-impayee-sans-perdre-client',
  ],
};
