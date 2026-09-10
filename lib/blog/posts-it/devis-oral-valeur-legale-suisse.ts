import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-oral-valeur-legale-suisse',
  question: 'Un preventivo accettato oralmente ha valore legale in Svizzera?',
  title: 'Preventivo accettato a voce: impegna, ma non si dimostra',
  description:
    'Nel diritto svizzero, un accordo orale vale come contratto: il Codice delle obbligazioni non richiede per default alcuna forma scritta. Il problema non è mai la validità, è la prova.',
  excerpt:
    '«Ci siamo accordati al telefono» impegna giuridicamente entrambe le parti in Svizzera. Il vero problema arriva il giorno in cui una delle due sostiene il contrario.',
  category: 'Juridique & normes',
  keywords: ['preventivo orale', 'accordo verbale', 'prova contratto', 'forma del contratto', 'art 11 co'],
  publishedAt: '2026-04-16',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un cliente dice sì al telefono, il cantiere parte la settimana successiva senza che sia stato firmato alcun documento. Molti artigiani pensano che un tale accordo non «conti davvero» finché non è su carta. È falso. Questa differenza cambia radicalmente il modo di gestire una controversia quando si presenta.',
    },
    { type: 'h2', text: 'Il principio: nessuna forma è richiesta per default' },
    {
      type: 'p',
      text: 'L’art. 11 cpv. 1 del Codice delle obbligazioni pone una regola semplice: la validità dei contratti per i quali la legge non prescrive una forma particolare non è subordinata all’osservanza di alcuna forma. Per un contratto d’appalto (preventivo di lavori), nessuna legge impone la forma scritta: un accordo verbale, uno scambio di SMS, un «va bene, andate pure» al telefono formano un contratto perfettamente valido.',
    },
    {
      type: 'callout',
      title: 'La vera domanda non è mai «è valido?»',
      text: 'È «posso dimostrarlo?». Un contratto orale esiste giuridicamente, ma in caso di disaccordo sul prezzo, sul perimetro o sul termine convenuto, chi deve dimostrare ciò che è stato detto si ritrova sprovvisto di fronte a un accordo mai messo su carta.',
    },
    { type: 'h2', text: 'Cosa si gioca concretamente in caso di controversia' },
    {
      type: 'list',
      items: [
        'Senza traccia scritta, il prezzo concordato diventa una questione di memoria di ciascuno, sapendo che i due ricordi raramente divergono a favore dello stesso importo',
        'Il perimetro esatto dei lavori («include la pittura o no?») si discute dopo, nel peggior momento possibile',
        'Un giudice civile svizzero decide sulla base delle prove presentate, non sulla parola data, cosicché un accordo orale non documentato parte con uno svantaggio strutturale',
      ],
    },
    { type: 'h2', text: 'Il compromesso che funziona in pratica' },
    {
      type: 'p',
      text: 'Nessuno si aspetta un contratto in piena regola per un piccolo intervento di due ore. Ma non appena è in gioco un importo significativo, un semplice messaggio scritto che conferma l’accordo orale («come concordato al telefono, inizio lunedì per CHF X, lavori Y») basta a trasformare un accordo fragile in una prova solida, senza pesantezza amministrativa.',
    },
    {
      type: 'p',
      text: 'Il vero guadagno di un preventivo formalizzato non è quindi rendere l’accordo «più valido» (lo è già oralmente), è renderlo dimostrabile il giorno in cui uno dei due se lo ricorda diversamente.',
    },
    {
      type: 'cta',
      title: 'Un preventivo inviato in trenta secondi, non in trenta minuti',
      text: 'Con la dettatura vocale di Cantia, un accordo dato al telefono si trasforma in un preventivo PDF calcolato in pochi minuti. La traccia scritta esiste così senza rallentare il ritmo del cantiere.',
      buttonLabel: 'Scoprire la dettatura vocale',
    },
  ],
  faq: [
    {
      question: 'Un accordo orale per dei lavori è valido nel diritto svizzero?',
      answer:
        'Sì, nella misura in cui l’art. 11 CO non richiede per default alcuna forma particolare per un contratto d’appalto. Un accordo verbale impegna giuridicamente entrambe le parti.',
    },
    {
      question: 'Qual è il rischio principale di un preventivo accettato solo oralmente?',
      answer:
        'La prova, non la validità: in caso di disaccordo sul prezzo o sul perimetro convenuto, diventa difficile dimostrare precisamente ciò che è stato detto.',
    },
    {
      question: 'Un semplice messaggio scritto basta a mettere al sicuro un accordo orale?',
      answer:
        'Nella maggior parte dei casi pratici, sì: un messaggio che conferma i termini dell’accordo (prezzo, perimetro, termine) costituisce una prova ben più solida di un accordo puramente verbale.',
    },
  ],
  relatedSlugs: [
    'signature-electronique-devis-suisse-valeur-legale',
    'validite-devis-signe-prix-qui-bouge',
    'rediger-devis-qui-inspire-confiance-client',
  ],
};
