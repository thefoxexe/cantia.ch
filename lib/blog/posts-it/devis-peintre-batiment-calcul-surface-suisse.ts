import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-peintre-batiment-calcul-surface-suisse',
  question: 'Come calcolare correttamente le superfici e il prezzo di un preventivo di pittura edile?',
  title: 'Preventivo di pittura edile: calcolare bene la superficie per non sottostimare',
  description:
    'Una superficie mal calcolata (deduzioni dimenticate, numero di mani sottostimato, preparazione del supporto trascurata) è la prima causa di perdita di margine per i pittori edili.',
  excerpt:
    'Il prezzo al m² è semplice da annunciare, ma tutto si gioca nel calcolo della superficie reale. È esattamente lì che la maggior parte dei preventivi di pittura perde margine senza che nessuno se ne accorga.',
  category: 'Métiers du bâtiment',
  keywords: ['preventivo pittore edile', 'calcolo superficie pittura', 'prezzo pittura al m2 Svizzera', 'fatturazione pittore indipendente', 'preparazione supporto pittura preventivo'],
  publishedAt: '2026-09-02',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un prezzo al m² annunciato al cliente nasconde un’ipotesi implicita: una mano standard, su un supporto già pronto, senza deduzioni particolari. In pratica, quasi nessun cantiere corrisponde esattamente a questa ipotesi, il che spiega lo scarto frequente tra il preventivo firmato e il tempo realmente impiegato.',
    },
    { type: 'h2', text: 'Tre errori di calcolo che erodono il margine' },
    {
      type: 'list',
      items: [
        'Non dedurre le aperture (porte, finestre) mentre riducono la superficie reale da dipingere, allungando al contempo il tempo di finitura ai bordi',
        'Contare una sola mano mentre il cambio di tonalità o un supporto poroso ne richiede spesso due',
        'Dimenticare il tempo di preparazione del supporto (stuccatura, carteggiatura, protezione degli arredi) che può rappresentare tanto tempo quanto l’applicazione stessa',
      ],
    },
    {
      type: 'stat',
      value: '30-40 %',
      label: 'quota del tempo totale di un cantiere di pittura dedicata alla preparazione del supporto piuttosto che all’applicazione della pittura',
    },
    { type: 'h2', text: 'Un prezzo al m², ma mai un prezzo unico per tutto' },
    {
      type: 'p',
      text: 'Un muro liscio appena intonacato e un soffitto vecchio con crepe non hanno nulla in comune in termini di tempo di preparazione, anche se hanno la stessa superficie. Strutturare il preventivo con più tariffe al m² secondo lo stato del supporto (nuovo, buono stato, da riparare) protegge il margine senza complicare inutilmente il preventivo per il cliente.',
    },
    {
      type: 'callout',
      title: 'La protezione del cantiere non è gratuita',
      text: 'Coprire i pavimenti, proteggere gli arredi, applicare nastro di mascheratura: questo tempo di protezione è reale e deve comparire da qualche parte nel prezzo, sia integrato nella tariffa oraria, sia come voce separata sui cantieri occupati.',
    },
    {
      type: 'cta',
      title: 'Un catalogo di prezzi che distingue già le Sue diverse tariffe al m²',
      text: 'Cantia conserva in memoria le Sue diverse tariffe (supporto nuovo, da riparare, numero di mani), per comporre un preventivo corretto in pochi minuti invece di ricalcolare ogni superficie a mano.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Bisogna dedurre porte e finestre dal calcolo della superficie di pittura?',
      answer:
        'Sì per la superficie fatturata, ma il tempo di finitura ai bordi delle aperture resta reale, il che giustifica una tariffa che tenga conto del numero di aperture, non solo della superficie netta.',
    },
    {
      question: 'Come fatturare una seconda mano di pittura necessaria ma non prevista?',
      answer:
        'Il modo migliore è anticiparla nel preventivo iniziale secondo il tipo di supporto e il cambio di tonalità previsto, piuttosto che scoprirla in cantiere e doverla negoziare a posteriori.',
    },
    {
      question: 'Il tempo di protezione del cantiere va fatturato separatamente?',
      answer:
        'Non è obbligatorio, ma è consigliabile sui cantieri occupati o con arredi da proteggere. Questo tempo è reale e spesso sottostimato se resta assorbito nel prezzo al m².',
    },
  ],
  relatedSlugs: [
    'calculer-prix-devis-renovation-suisse',
    'checklist-cloture-chantier-avant-facturation',
    'devis-facture-facadier-isolation-suisse',
  ],
  relatedTradeSlug: 'peintre',
};
