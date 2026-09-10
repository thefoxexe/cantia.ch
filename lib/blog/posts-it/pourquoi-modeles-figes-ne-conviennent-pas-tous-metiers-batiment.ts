import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'pourquoi-modeles-figes-ne-conviennent-pas-tous-metiers-batiment',
  question: 'Perché i modelli rigidi dei software gestionali non si adattano a tutti i mestieri dell’edilizia?',
  title: 'Perché un modello rigido non può andare bene per tutta l’edilizia insieme',
  description:
    'L’edilizia riunisce mestieri molto diversi tra loro. Perché uno stesso modello rigido di preventivo o di monitoraggio del cantiere non può logicamente andare bene a tutti contemporaneamente.',
  excerpt:
    'Un muratore, un elettricista e un paesaggista non hanno lo stesso modo di quotare, monitorare un cantiere o fatturare. Un modello unico e rigido non può quindi mai adattarsi perfettamente a tutti e tre contemporaneamente.',
  category: 'Sur-mesure & automatisations',
  keywords: ['modello rigido software edilizia', 'software adatto mestiere costruzioni', 'perché strumento generico non basta', 'diversità mestieri edilizia software', 'personalizzazione per mestiere costruzioni'],
  publishedAt: '2026-08-24',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Il termine "edilizia" racchiude una realtà estremamente diversa: muratura, elettricità, paesaggistica, carpenteria, ognuna con le proprie unità di misura, i propri processi di cantiere, le proprie abitudini di fatturazione. Un modello rigido, pensato per "l’edilizia" in generale, non può strutturalmente andare bene perfettamente a ciascuno.',
    },
    { type: 'h2', text: 'Esempi concreti di questa diversità' },
    {
      type: 'list',
      items: [
        'Un muratore quota in m³ di calcestruzzo, un elettricista in punti elettrici, un paesaggista spesso a forfait per prestazione',
        'Un tettoista documenta il suo cantiere con particolare attenzione al meteo, un falegname con un tempo di officina separato dalla posa',
        'Un termoidraulico deve integrare tempi di consegna lunghi, un fabbro gestisce soprattutto urgenze occasionali',
      ],
    },
    {
      type: 'stat',
      value: '15+',
      label: 'corpi di mestiere diversi generalmente raggruppati sotto il termine generico "edilizia" (ognuno con esigenze gestionali che divergono su punti concreti)',
    },
    { type: 'h2', text: 'Un buon strumento gestionale deve piegarsi al mestiere, non il contrario' },
    {
      type: 'p',
      text: 'Piuttosto che costringere ogni mestiere ad adattarsi a un modello unico, uno strumento gestionale pensato per l’edilizia dovrebbe permettere di regolare ciò che conta realmente per ogni mestiere (le unità usate, le tappe di monitoraggio, i documenti generati) senza perdere la coerenza d’insieme.',
    },
    {
      type: 'callout',
      title: 'Il nucleo comune resta ampio, solo i dettagli cambiano',
      text: 'La maggior parte delle esigenze (preventivi, fatture, IVA, monitoraggio del cantiere) sono comuni a tutti i mestieri dell’edilizia. È sui dettagli specifici che la personalizzazione fa davvero la differenza.',
    },
    {
      type: 'cta',
      title: 'Uno strumento che si adatta al Suo mestiere, non il contrario',
      text: 'Cantia copre già le specificità di numerosi mestieri dell’edilizia, e può essere regolato su misura per quelli che escono ancora dal quadro standard.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Perché un software generico "edilizia" non va bene perfettamente a tutti i mestieri?',
      answer:
        'Perché l’edilizia raggruppa più di 15 corpi di mestiere diversi, ognuno con le proprie unità di misura, processi di cantiere e abitudini di fatturazione.',
    },
    {
      question: 'Cosa resta comune tra tutti i mestieri dell’edilizia in un software gestionale?',
      answer:
        'La grande maggioranza delle esigenze di base (preventivi, fatture, conformità IVA, monitoraggio del cantiere) resta comune, solo alcuni dettagli specifici differiscono da un mestiere all’altro.',
    },
    {
      question: 'Un software gestionale deve adattarsi al mestiere o il mestiere deve adattarsi al software?',
      answer:
        'Idealmente lo strumento si adatta al mestiere, poiché un buon software deve permettere di regolare ciò che conta realmente (unità, tappe, documenti) senza costringere l’impresa a cambiare il proprio modo di lavorare.',
    },
  ],
  relatedSlugs: [
    'cantia-adapte-metier-specifique-batiment',
    'logiciel-standard-vs-solution-personnalisee-batiment',
    'logiciel-devis-facture-maconnerie-suisse',
  ],
};
