import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-menuisier-sur-mesure-facturation-suisse',
  question: 'Come deve calcolare un falegname-arredatore un preventivo di mobili o arredi su misura?',
  title: 'Falegname-arredatore: calcolare il su misura senza perdere il filo dal prototipo al montaggio',
  description:
    'Un arredo su misura passa attraverso quattro tappe: la presa di misure, la progettazione, la fabbricazione in laboratorio e il montaggio in loco, che meritano ciascuna la propria voce di preventivo.',
  excerpt:
    'A differenza di una posa standardizzata, ogni progetto di falegnameria su misura riparte da zero nella progettazione. Un preventivo che non distingue il tempo di studio dal tempo di laboratorio finisce per fatturarlo alla stessa tariffa della posa.',
  category: 'Métiers du bâtiment',
  keywords: ['preventivo falegname su misura', 'fatturazione arredo legno', 'prezzo mobili su misura Svizzera', 'preventivo laboratorio falegnameria', 'progettazione arredo fatturazione'],
  publishedAt: '2026-09-08',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Una cucina o una libreria su misura non si calcola come la posa di un elemento standard. Il tempo di progettazione (presa di misure, disegni, scelta dei materiali con il cliente) è spesso lungo quanto la fabbricazione stessa. Resta però quasi sempre il meno valorizzato, perché difficile da mostrare concretamente al cliente al momento di presentare il prezzo.',
    },
    { type: 'h2', text: 'Quattro tappe, quattro voci di preventivo' },
    {
      type: 'list',
      items: [
        'Presa di misure e studio di fattibilità: da fatturare separatamente se il progetto non si concretizza, o da integrare se il preventivo viene firmato',
        'Progettazione e disegni tecnici: tempo di ufficio tecnico, spesso sottovalutato',
        'Fabbricazione in laboratorio: la voce più prevedibile, calcolabile a tempo o a pezzo',
        'Posa e regolazioni in loco: sempre più lunga che in laboratorio, perché bisogna adattarsi all’esistente',
      ],
    },
    {
      type: 'stat',
      value: '20-25 %',
      label: 'quota tipica del tempo totale di un progetto di arredo su misura dedicata alla progettazione e ai disegni, ancor prima del primo taglio del legno',
    },
    { type: 'h2', text: 'Fatturare lo studio quando il progetto non si concretizza' },
    {
      type: 'p',
      text: 'Un preventivo dettagliato con disegni personalizzati rappresenta un vero lavoro: fornirlo sistematicamente gratis, anche quando il cliente confronta più artigiani senza mai firmare, equivale a finanziare la messa in concorrenza con gli altri. Fatturare un forfait di studio, deducibile dal prezzo finale se il progetto viene firmato, protegge questo tempo senza scoraggiare i clienti seri.',
    },
    {
      type: 'callout',
      title: 'Il montaggio in loco richiede quasi sempre più tempo che in laboratorio',
      text: 'Un muro non perfettamente a squadro, un pavimento non in piano: queste regolazioni dell’ultimo minuto fanno parte del mestiere, ma devono essere accantonate nel tempo di posa piuttosto che erodere il margine del progetto.',
    },
    {
      type: 'cta',
      title: 'Un preventivo che distingue studio, fabbricazione e posa',
      text: 'Cantia permette di strutturare un preventivo in voci chiare, con il catalogo dei Suoi prezzi ricorrenti per non ripartire da zero a ogni nuovo progetto su misura.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Bisogna fatturare la presa di misure e i disegni di un arredo su misura?',
      answer:
        'È consigliabile, almeno come forfait di studio deducibile dal prezzo finale se il preventivo viene firmato, poiché protegge un tempo di lavoro reale che resta spesso invisibile per il cliente.',
    },
    {
      question: 'Come calcolare il tempo di montaggio di un arredo su misura?',
      answer:
        'Prevedendo sistematicamente un margine rispetto al tempo teorico di laboratorio, poiché le irregolarità dell’edificio esistente (muri, pavimenti) allungano quasi sempre la posa reale.',
    },
    {
      question: 'Il preventivo di falegnameria su misura deve includere una clausola di modifica?',
      answer:
        'Sì. Un cliente che cambia idea su una finitura o una dimensione dopo la convalida dei disegni deve generare un supplemento calcolato, non una modifica silenziosa assorbita nel prezzo iniziale.',
    },
  ],
  relatedSlugs: [
    'avenant-chantier-plus-value-moins-value',
    'devis-oral-valeur-legale-suisse',
    'validite-devis-signe-prix-qui-bouge',
  ],
  relatedTradeSlug: 'menuisier',
};
