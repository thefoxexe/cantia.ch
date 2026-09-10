import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'contrat-ecrit-petits-travaux-quand-necessaire',
  question: 'Serve un contratto scritto anche per piccoli lavori in Svizzera?',
  title: 'Piccoli lavori: a partire da quale importo uno scritto diventa necessario',
  description:
    'Nessuna soglia legale impone lo scritto per un contratto d’appalto in Svizzera. Ma una soglia pratica esiste eccome, e dipende da ciò che diventa difficile da dimostrare a memoria.',
  excerpt:
    'La legge non impone alcuna soglia per richiedere uno scritto. La soglia che conta davvero non è legale: è quella oltre la quale un disaccordo di memoria costa caro.',
  category: 'Juridique & normes',
  keywords: ['contratto scritto', 'piccoli lavori', 'preventivo obbligatorio', 'riparazione', 'soglia pratica'],
  publishedAt: '2026-05-18',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Un rubinetto riparato in dieci minuti non richiede ovviamente un contratto firmato in triplice copia. Un cantiere di ristrutturazione da CHF 40’000 non si aspetta ovviamente la stessa leggerezza. Tra i due, dove si colloca la soglia? La risposta non è nella legge, ma nel buon senso, e vale la pena porla chiaramente una volta per tutte.',
    },
    { type: 'h2', text: 'Cosa dice (e non dice) la legge' },
    {
      type: 'p',
      text: 'Nessuna soglia legale esiste nel diritto svizzero per imporre una forma scritta a un contratto d’appalto, qualunque sia l’importo. Un preventivo da CHF 200 o da CHF 200’000 ha esattamente la stessa validità giuridica se accettato oralmente. Ciò che cambia con l’importo non è la validità, ma il costo di un disaccordo se manca lo scritto.',
    },
    {
      type: 'callout',
      title: 'Il vero criterio: cosa costerebbe un disaccordo',
      text: 'Per un intervento di meno di un’ora a basso importo, un disaccordo di memoria costa poco, perché la perdita potenziale resta gestibile. Non appena un cantiere supera qualche centinaio di franchi o si estende su più giorni, il costo di un malinteso (sul prezzo, il perimetro, il termine) diventa sufficiente a giustificare una traccia scritta sistematica, anche minima.',
    },
    { type: 'h2', text: 'Un riferimento pratico, non una regola legale' },
    {
      type: 'list',
      items: [
        'Riparazione puntuale, da qualche decina a un centinaio di franchi: un accordo orale basta nella grande maggioranza dei casi',
        'Intervento di mezza giornata o più, o importo di diverse centinaia di franchi: un preventivo scritto, anche sommario, protegge entrambe le parti',
        'Cantiere di più giorni o più mestieri: un preventivo dettagliato diventa indispensabile, non solo raccomandato',
      ],
    },
    { type: 'h2', text: 'Il compromesso rapido che copre l’essenziale' },
    {
      type: 'p',
      text: 'Anche per un piccolo intervento, un messaggio di testo inviato a posteriori («intervento del [data], sostituzione di [elemento], CHF [importo]») basta a trasformare un accordo orale fragile in una traccia utilizzabile, senza passare per un documento formale. È il minimo che cambia tutto in caso di contestazione successiva, per un costo di redazione prossimo allo zero.',
    },
    {
      type: 'cta',
      title: 'Un preventivo, anche per un piccolo intervento, in pochi minuti',
      text: 'Cantia permette di generare un preventivo rapido e quantificato anche per un piccolo intervento. La traccia esiste allora senza rallentare il ritmo di una giornata intensa.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Esiste un importo a partire dal quale un contratto scritto diventa legalmente obbligatorio?',
      answer:
        'No, nessuna soglia legale esiste nel diritto svizzero per un contratto d’appalto: un accordo orale resta valido qualunque sia l’importo.',
    },
    {
      question: 'Perché formalizzare per iscritto anche piccoli lavori?',
      answer:
        'Perché il costo di un disaccordo di memoria (sul prezzo, il perimetro o il termine) supera rapidamente lo sforzo di redigere una traccia scritta, anche minima.',
    },
    {
      question: 'Un semplice SMS di conferma basta a mettere al sicuro un piccolo cantiere?',
      answer:
        'Nella maggior parte dei casi pratici, sì, perché un messaggio che conferma la data, la prestazione e l’importo trasforma un accordo orale fragile in una prova utilizzabile.',
    },
  ],
  relatedSlugs: [
    'devis-oral-valeur-legale-suisse',
    'difference-devis-offre-facture-pro-forma',
    'signature-electronique-devis-suisse-valeur-legale',
  ],
};
