import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-facture-paysagiste-jardinier-suisse',
  question: 'Come deve calcolare un paesaggista un preventivo tra sistemazione puntuale e manutenzione ricorrente?',
  title: 'Paesaggista: calcolare la sistemazione puntuale e la manutenzione ricorrente senza confonderle',
  description:
    'Un cantiere di sistemazione esterna e un contratto di manutenzione del giardino seguono due logiche di fatturazione opposte, l’una per progetto, l’altra ricorrente. Come strutturarle correttamente.',
  excerpt:
    'Un paesaggista vende spesso due cose molto diverse allo stesso cliente: una sistemazione puntuale fatturata una volta, e una manutenzione ricorrente fatturata tutto l’anno. Confonderle nello stesso preventivo finisce per calcolare male entrambe.',
  category: 'Métiers du bâtiment',
  keywords: ['preventivo paesaggista', 'fatturazione giardiniere Svizzera', 'contratto manutenzione giardino prezzo', 'preventivo sistemazione esterna', 'fatturazione ricorrente paesaggista'],
  publishedAt: '2026-09-10',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'La sistemazione di un giardino (scavo, piantumazione, pavimentazione, irrigazione automatica) si calcola come qualsiasi cantiere puntuale: un preventivo, una realizzazione, una fattura. La manutenzione che segue (taglio dell’erba, potatura, diserbo) funziona con un ritmo completamente diverso, spesso mensile o stagionale, e merita un contratto separato piuttosto che un preventivo classico ripetuto ogni volta.',
    },
    { type: 'h2', text: 'Sistemazione puntuale: calcolare voce per voce' },
    {
      type: 'list',
      items: [
        'Scavo ed evacuazione della terra, spesso la voce più variabile secondo l’accesso al terreno',
        'Fornitura di vegetali, separata dal tempo di piantumazione, poiché i prezzi variano secondo la stagione',
        'Opere murarie da giardino (muretti, pavimentazione, cordoli) al m² o a forfait',
        'Irrigazione automatica e illuminazione esterna, spesso subappaltate ma da integrare nel monitoraggio globale del cantiere',
      ],
    },
    { type: 'h2', text: 'Manutenzione ricorrente: un contratto, non un preventivo ripetuto' },
    {
      type: 'p',
      text: 'Rifare un preventivo a ogni passaggio di manutenzione è una perdita di tempo amministrativo per tutti. Un contratto annuale o stagionale, con una frequenza di passaggio definita e una fatturazione regolare (mensile o per passaggio), semplifica la gestione e assicura un reddito ricorrente più stabile di una successione di cantieri puntuali.',
    },
    {
      type: 'stat',
      value: '4-8',
      label: 'passaggi annuali tipici per un contratto di manutenzione di un giardino residenziale standard in Svizzera, escluse le interventi eccezionali',
    },
    {
      type: 'callout',
      title: 'La stagionalità influisce direttamente sulla liquidità',
      text: 'Un paesaggista la cui attività si concentra su primavera ed estate deve anticipare i mesi più calmi. Un contratto di manutenzione ricorrente firmato per l’anno intero attenua parte di questa stagionalità, a differenza di cantieri puntuali che si fermano in inverno.',
    },
    {
      type: 'cta',
      title: 'Tenga ben separati i Suoi cantieri puntuali e i Suoi contratti di manutenzione',
      text: 'Cantia permette di seguire ogni cantiere indipendentemente (preventivi, fatture e redditività) per distinguere chiaramente i Suoi progetti di sistemazione dai Suoi contratti di manutenzione ricorrenti.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Bisogna rifare un preventivo a ogni passaggio di manutenzione del giardino?',
      answer:
        'No: un contratto di manutenzione annuale o stagionale con una frequenza di passaggio definita evita di riprodurre un preventivo a ogni intervento e semplifica la fatturazione ricorrente.',
    },
    {
      question: 'Come calcolare la fornitura di vegetali in un preventivo di sistemazione?',
      answer:
        'Separandola dal tempo di piantumazione, poiché il prezzo dei vegetali varia fortemente secondo la stagione e la disponibilità. Mescolarli in un forfait unico complica qualsiasi revisione successiva.',
    },
    {
      question: 'Come gestire la stagionalità dell’attività di un paesaggista durante l’anno?',
      answer:
        'Assicurando una quota di reddito ricorrente tramite contratti di manutenzione annuali, che attenuano in parte i mesi più calmi tipici dell’autunno e dell’inverno.',
    },
  ],
  relatedSlugs: [
    'previsionnel-tresorerie-entreprise-batiment',
    'facturation-heures-regie-batiment-comment-faire',
    'sous-traitant-batiment-suisse-contrat-facturation',
  ],
  relatedTradeSlug: 'paysagiste',
};
