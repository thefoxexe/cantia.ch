import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-gratuit-ou-payant-que-dit-la-loi',
  question: 'Un preventivo deve essere gratuito in Svizzera, o si può fatturare?',
  title: 'Preventivo gratuito o a pagamento: cosa impone davvero la legge svizzera (nulla)',
  description:
    'Nessuna legge svizzera obbliga un artigiano a stilare un preventivo gratuito. È semplicemente la prassi di mercato che ne ha fatto la norma. Ecco quando fatturare un preventivo è giustificato, e come proporlo senza perdere il cliente.',
  excerpt:
    'Un preventivo rappresenta ore di calcolo, a volte persino uno spostamento. Eppure quasi nessuno lo fattura. Non è un obbligo legale, è un uso. La sfumatura cambia tutto per un computo complesso.',
  category: 'Devis & facturation',
  keywords: ['preventivo gratuito o a pagamento', 'fatturare un preventivo', 'legge preventivo svizzera', 'computo lavori', 'preventivo complesso'],
  publishedAt: '2026-08-12',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Nessuna disposizione del Codice delle obbligazioni impone la gratuità di un preventivo. La convinzione che un preventivo «debba» essere gratuito deriva dalla prassi di mercato, non dalla legge. Un cliente può aspettarsi di non pagare nulla per un semplice computo standard, ma nulla impedisce giuridicamente di fatturare un preventivo, a condizione di proporlo chiaramente prima di impegnarsi.',
    },
    { type: 'h2', text: 'Quando fatturare un preventivo diventa giustificato' },
    {
      type: 'list',
      items: [
        'Un computo che richiede diverse ore di studio tecnico o uno spostamento su un cantiere complesso',
        'Uno studio di fattibilità o un progetto preliminare che va oltre un semplice prezzo indicativo',
        'Un bando di gara in cui più aziende preparano un fascicolo dettagliato senza garanzia di ottenere l’appalto',
        'Un cliente che richiede più versioni o varianti dello stesso preventivo',
      ],
    },
    {
      type: 'callout',
      title: 'Il preventivo fatturato viene spesso dedotto dal prezzo finale',
      text: 'Una prassi diffusa e ben accettata: fatturare un importo simbolico per lo studio, deducibile dal prezzo totale se il cantiere viene infine affidato, perché questo mette al sicuro il tempo investito senza scoraggiare un cliente serio.',
    },
    { type: 'h2', text: 'La vera posta in gioco: prevenirlo prima, non dopo' },
    {
      type: 'p',
      text: 'L’unico vero rischio non è giuridico ma commerciale: fatturare un preventivo senza averlo annunciato in anticipo crea una controversia evitabile. Al contrario, indicarlo esplicitamente («studio quantificato a CHF X, dedotto dall’importo finale in caso di accettazione») filtra naturalmente le richieste non serie restando al contempo trasparenti con un cliente impegnato.',
    },
    {
      type: 'cta',
      title: 'Un preventivo chiaro, fin dalla prima riga',
      text: 'Cantia permette di aggiungere una menzione di condizioni direttamente sul preventivo: tutto il necessario per precisare un’eventuale fatturazione dello studio senza ulteriore complessità amministrativa.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'La legge svizzera obbliga a fare preventivi gratuiti?',
      answer:
        'No, nessuna legge lo impone. La gratuità è un uso di mercato, non un obbligo legale. Un preventivo può peraltro essere fatturato se annunciato chiaramente in anticipo.',
    },
    {
      question: 'Si può dedurre il prezzo di un preventivo fatturato dall’importo finale dei lavori?',
      answer:
        'Sì, è una prassi diffusa e ben accettata dai clienti: l’importo dello studio viene dedotto dalla fattura finale se il cantiere viene affidato all’azienda.',
    },
    {
      question: 'Bisogna avvisare il cliente prima di fatturare un preventivo?',
      answer:
        'Sì, di fatto è indispensabile: fatturare un preventivo senza averlo annunciato in anticipo crea una controversia commerciale evitabile, anche se nulla lo vieta legalmente.',
    },
  ],
  relatedSlugs: [
    'rediger-devis-qui-inspire-confiance-client',
    'validite-devis-signe-prix-qui-bouge',
    'devis-oral-valeur-legale-suisse',
  ],
};
