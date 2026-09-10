import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'appel-offres-marches-publics-batiment-suisse',
  question: 'Come rispondere a un bando pubblico nell’edilizia in Svizzera?',
  title: 'Appalti pubblici dell’edilizia: cosa sapere prima di presentare un’offerta',
  description:
    'A partire da CHF 2 milioni per lavori di costruzione, un appalto pubblico deve essere pubblicato su SIMAP secondo le soglie AIMP. Al di sotto, la procedura a trattativa privata resta possibile.',
  excerpt:
    'CHF 2 milioni: la soglia a partire dalla quale un appalto di costruzione deve passare per un bando pubblico formale piuttosto che per una semplice trattativa diretta.',
  category: 'Juridique & normes',
  keywords: ['appalti pubblici', 'aimp', 'simap', 'bando di gara', 'appalto costruzione'],
  publishedAt: '2026-05-21',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Un ente pubblico (comune, cantone) che avvia un cantiere non può semplicemente chiamare l’azienda che preferisce oltre un certo importo: deve seguire una procedura di bando disciplinata. Comprendere queste soglie permette a un’azienda edile di sapere dove cercare le opportunità, e cosa aspettarsi rispondendo.',
    },
    { type: 'h2', text: 'La soglia che fa scattare la procedura formale' },
    {
      type: 'p',
      text: 'Per lavori di costruzione, la soglia di pubblicazione su SIMAP (la piattaforma svizzera degli appalti pubblici) si situa intorno a CHF 2 milioni, fissata dall’Accordo intercantonale sugli appalti pubblici (AIMP), con valori rivisti periodicamente. Al di sotto di questa soglia, un ente pubblico può ricorrere a procedure più leggere, fino all’aggiudicazione a trattativa privata per gli importi più modesti.',
    },
    {
      type: 'callout',
      title: 'Non confondere assenza di soglia e assenza di opportunità',
      text: 'La maggioranza degli appalti pubblici, in particolare comunali, resta sotto la soglia di pubblicazione SIMAP, senza per questo essere chiusa alle piccole imprese. Molti enti pubblici tengono elenchi di fornitori o aziende locali consultate direttamente per questi appalti a trattativa privata, al di fuori di ogni pubblicazione formale.',
    },
    { type: 'h2', text: 'Le grandi tappe di una procedura formale' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Pubblicazione del bando su SIMAP, con capitolato d’oneri e criteri di aggiudicazione',
        'Termine di presentazione delle offerte, generalmente di diverse settimane per lasciare il tempo di quantificare',
        'Valutazione secondo criteri ponderati, dove il prezzo non è quasi mai l’unico elemento considerato: la qualità e i termini contano anch’essi',
        'Decisione di aggiudicazione, pubblicata e motivata, con un termine di ricorso possibile per gli offerenti esclusi',
      ],
    },
    { type: 'h2', text: 'Cosa richiede tempo la prima volta' },
    {
      type: 'p',
      text: 'Rispondere a un bando pubblico richiede un rigore diverso da un preventivo classico: rispettare un capitolato preciso, quantificare secondo una struttura imposta, e spesso fornire attestazioni (assicurazioni, affiliazioni sociali aggiornate, assenza di condanna LLN) oltre al prezzo stesso. La prima presentazione richiede tempo; le successive sono nettamente più rapide una volta costituito il fascicolo tipo.',
    },
    {
      type: 'cta',
      title: 'Uno storico chiaro a sostegno di un’offerta',
      text: 'Cantia conserva lo storico completo dei cantieri realizzati, utile per costituire le referenze richieste in un fascicolo di offerta pubblica.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'A partire da quale importo un appalto di costruzione deve essere pubblicato su SIMAP?',
      answer:
        'Intorno a CHF 2 milioni secondo le soglie fissate dall’Accordo intercantonale sugli appalti pubblici (AIMP), riviste periodicamente.',
    },
    {
      question: 'I piccoli appalti pubblici sono accessibili alle piccole imprese?',
      answer:
        'Sì, la maggioranza degli appalti pubblici, in particolare comunali, resta sotto la soglia di pubblicazione formale e passa per procedure a trattativa privata, spesso con aziende locali.',
    },
    {
      question: 'Il prezzo è l’unico criterio di aggiudicazione di un appalto pubblico?',
      answer:
        'No, i criteri sono generalmente ponderati e includono anche la qualità, i termini e le referenze dell’azienda, non solo l’importo proposto.',
    },
  ],
  relatedSlugs: [
    'travail-au-noir-batiment-suisse-risques-controles',
    'assurance-rc-professionnelle-batiment-obligatoire',
    'sous-traitant-batiment-suisse-contrat-facturation',
  ],
};
