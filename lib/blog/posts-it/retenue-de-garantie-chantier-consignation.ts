import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'retenue-de-garantie-chantier-consignation',
  question: 'Che cos’è la ritenuta di garanzia su un cantiere, e un committente può imporla?',
  title: 'Ritenuta di garanzia su un cantiere: cosa copre e fin dove può arrivare',
  description:
    'Un committente a volte trattiene il 5-10 % dell’importo finale «per precauzione»: una pratica che non è automatica e va negoziata, non subita senza discussione.',
  excerpt:
    'Trattenere una parte del pagamento per tutelarsi da difetti futuri non è né vietato né un diritto acquisito. È una clausola che si negozia, con limiti chiari.',
  category: 'Juridique & normes',
  keywords: ['ritenuta di garanzia cantiere', 'consignazione lavori costruzione', 'garanzia bancaria cantiere', 'ritenuta di pagamento lavori', 'saldo cantiere trattenuto'],
  publishedAt: '2026-06-22',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'La ritenuta di garanzia consiste, per un committente, nel non versare immediatamente l’intero saldo finale di un cantiere, trattenendo una parte (spesso il 5-10 %) come garanzia contro eventuali difetti scoperti dopo la ricezione. Non è una regola legale automatica, ma una clausola contrattuale che deve essere negoziata e accettata esplicitamente.',
    },
    { type: 'h2', text: 'Cosa deve essere precisato perché una ritenuta sia valida' },
    {
      type: 'list',
      items: [
        'La percentuale esatta trattenuta, fissata in anticipo nel contratto o nel preventivo',
        'La durata della ritenuta, che corrisponde generalmente al periodo di garanzia iniziale (prima del passaggio ai 2 o 5 anni completi)',
        'Le condizioni di liberazione: a quale data, su quale base, la ritenuta viene restituita all’impresa',
        'Un’eventuale alternativa accettata in anticipo: garanzia bancaria a prima richiesta invece di una ritenuta in contanti',
      ],
    },
    { type: 'h2', text: 'Un’alternativa spesso più favorevole: la garanzia bancaria' },
    {
      type: 'p',
      text: 'Invece di lasciare una parte del cantiere non pagata per mesi, un’impresa può proporre una garanzia bancaria a prima richiesta (un impegno della banca a versare l’importo in caso di difetto comprovato, senza che l’impresa debba attendere la propria liquidità). Ciò evita l’immobilizzazione diretta di liquidità offrendo al cliente la stessa sicurezza.',
    },
    {
      type: 'callout',
      title: 'Una ritenuta di garanzia non regolata per iscritto diventa un punto di attrito ricorrente',
      text: 'Senza una data di liberazione chiara, il saldo trattenuto si trasforma spesso in una «dimenticanza» da parte del cliente. La ritenuta deve quindi sempre essere accompagnata da una scadenza precisa e scritta.',
    },
    {
      type: 'cta',
      title: 'Monitoraggio dei saldi trattenuti, cantiere per cantiere',
      text: 'Cantia tiene traccia chiara di ciò che resta dovuto su ogni fattura, per non perdere mai il filo di una ritenuta di garanzia da reclamare una volta trascorso il periodo.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Un committente può imporre una ritenuta di garanzia senza accordo preventivo?',
      answer:
        'No, la ritenuta di garanzia è una clausola contrattuale che deve essere negoziata e accettata esplicitamente. Non è automatica nel diritto svizzero.',
    },
    {
      question: 'Quale percentuale viene generalmente trattenuta su un cantiere?',
      answer:
        'Tra il 5 e il 10 % dell’importo finale, a seconda di quanto negoziato nel contratto, poiché non esiste un tasso legale fisso.',
    },
    {
      question: 'Esiste un’alternativa alla ritenuta in contanti?',
      answer:
        'Sì, una garanzia bancaria a prima richiesta permette di offrire la stessa sicurezza al cliente senza immobilizzare direttamente la liquidità dell’impresa.',
    },
  ],
  relatedSlugs: [
    'facturer-acompte-suisse-securiser-solde',
    'garantie-travaux-construction-2-ou-5-ans',
    'client-refuse-payer-solde-final-que-faire',
  ],
};
