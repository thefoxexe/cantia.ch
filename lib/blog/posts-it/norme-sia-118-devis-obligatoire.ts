import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'norme-sia-118-devis-obligatoire',
  question: 'La norma SIA 118 è obbligatoria sul mio preventivo?',
  title: 'La norma SIA 118 è obbligatoria su un preventivo?',
  description:
    'La norma SIA 118 non è mai automatica: si applica solo se il contratto o il preventivo la menziona esplicitamente. Spiegazioni e buone pratiche.',
  excerpt:
    'Un architetto ha menzionato la SIA 118 in riunione e Lei pensa che si applichi d’ufficio al Suo cantiere. È falso, e in caso di controversia costa caro.',
  category: 'Juridique & normes',
  keywords: ['sia 118', 'norma', 'contratto', 'preventivo', 'obbligo', 'edilizia'],
  publishedAt: '2026-01-15',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un architetto ha evocato la SIA 118 in riunione di cantiere, e da allora Lei crede che si applichi automaticamente a tutto ciò che firma in Svizzera. È falso. Si tratta anzi di una delle confusioni giuridiche più diffuse nell’edilizia romanda, quella che fa perdere ricorsi in garanzia a imprenditori che pure avevano ragione.',
    },
    { type: 'h2', text: 'Cos’è realmente la SIA 118' },
    {
      type: 'p',
      text: 'La SIA 118 ("Condizioni generali per l’esecuzione di lavori di costruzione") è un contratto-tipo privato pubblicato dalla Società svizzera degli ingegneri e degli architetti, e non una legge. Completa e precisa il Codice delle obbligazioni (CO) su punti come i termini di garanzia, la consegna dell’opera o la gestione dei difetti, ma soltanto laddove entrambe le parti hanno scelto di farvi ricorso.',
    },
    {
      type: 'callout',
      title: 'Cosa cambia il giorno in cui le cose vanno male',
      text: 'Senza la frase esatta «le presenti condizioni sono soggette alla norma SIA 118» da qualche parte sul documento firmato, un giudice applicherà il solo Codice delle obbligazioni, anche se tutti sul cantiere pensavano di essere sotto SIA 118. La differenza si gioca in anni di garanzia e in procedura di consegna, non in un dettaglio cosmetico.',
    },
    { type: 'h2', text: 'Cosa cambia concretamente' },
    {
      type: 'list',
      items: [
        'Termini di garanzia e di prescrizione diversi tra CO da solo e CO + SIA 118',
        'Consegna dell’opera più formalizzata sotto SIA 118 (verbale di consegna)',
        'Regole di risoluzione e di acconti precisate dalla norma',
        'Un giudice applica la SIA 118 solo se il contratto la menziona nero su bianco; non la deduce mai dal contesto',
      ],
    },
    { type: 'h2', text: 'Bisogna imporla sui propri preventivi?' },
    {
      type: 'p',
      text: 'Per un intervento di riparazione o una piccola ristrutturazione presso un privato, il solo CO basta generalmente ed è più leggibile per un cliente non esperto. Per un cantiere più impegnativo, in subappalto di un direttore lavori, o quando l’architetto l’ha già imposta al resto del cantiere, menzionare la SIA 118 sul Suo preventivo armonizza le condizioni con ciò che avviene attorno a Lei, evitando così l’assurdità di due regimi diversi sullo stesso cantiere.',
    },
    {
      type: 'p',
      text: 'Il punto che conta davvero: se sceglie di applicarla, la menzione deve essere visibile sul preventivo stesso, e non nascosta in un documento allegato che nessuno rilegge prima di firmare.',
    },
    {
      type: 'cta',
      title: 'Le Sue condizioni, mai dimenticate',
      text: 'Le Sue clausole contrattuali (SIA 118 o meno) si registrano una volta in Cantia e riappaiono automaticamente su ogni preventivo PDF, così diventa impossibile dimenticarle in un invio fatto di fretta.',
      buttonLabel: 'Scoprire il modulo Preventivi',
    },
  ],
  faq: [
    {
      question: 'La SIA 118 è una legge svizzera?',
      answer:
        'No. È una norma contrattuale privata pubblicata dalla SIA (Società svizzera degli ingegneri e degli architetti), che si applica solo se il contratto o il preventivo vi fa esplicito riferimento.',
    },
    {
      question: 'Cosa succede se il preventivo non menziona la SIA 118?',
      answer:
        'Il contratto d’appalto resta regolato dal solo Codice delle obbligazioni (art. 363 e seguenti CO), con le sue proprie regole di garanzia e di consegna, distinte da quelle della norma.',
    },
    {
      question: 'Un privato può rifiutare l’applicazione della SIA 118?',
      answer:
        'Sì, nella misura in cui la sua integrazione risulta da un accordo tra le parti: un cliente può negoziare il suo ritiro o la sua sostituzione con le sole regole del CO prima di firmare il preventivo.',
    },
  ],
  relatedSlugs: [
    'calculer-prix-devis-renovation-suisse',
    'delai-paiement-facture-artisan-code-obligations',
    'duree-conservation-devis-factures-suisse',
  ],
};
