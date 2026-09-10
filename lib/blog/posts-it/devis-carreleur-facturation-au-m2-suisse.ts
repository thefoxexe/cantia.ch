import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-carreleur-facturation-au-m2-suisse',
  question: 'Come deve calcolare un piastrellista un preventivo al m² senza cadere nella trappola dei tagli e della posa complessa?',
  title: 'Preventivo di piastrellatura: perché il prezzo al m² non basta mai da solo',
  description:
    'Formato della piastrella, motivo di posa, tagli, piani di disposizione: tanti fattori che fanno variare fortemente il tempo di posa di un rivestimento, a parità di superficie. Come integrarli nel preventivo.',
  excerpt:
    'Due stanze della stessa superficie, piastrellate con lo stesso materiale, possono richiedere il doppio del tempo a seconda del formato delle piastrelle e del motivo di posa scelto: il prezzo al m² da solo non racconta mai tutta la storia.',
  category: 'Métiers du bâtiment',
  keywords: ['preventivo piastrellista', 'prezzo piastrelle al m2 Svizzera', 'fatturazione posa piastrelle', 'disposizione preventivo', 'taglio piastrelle tempo di posa'],
  publishedAt: '2026-09-03',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Il cliente confronta naturalmente i preventivi di piastrellatura in base al prezzo al m², perché è la cifra che ricorda. Ma questa cifra da sola non dice nulla del tempo di posa reale, che dipende fortemente dal formato delle piastrelle, dal motivo scelto (dritto, diagonale, a spina di pesce) e dal numero di tagli attorno agli angoli, prese elettriche o sanitari già presenti.',
    },
    { type: 'h2', text: 'Cosa fa variare il tempo di posa, a parità di superficie' },
    {
      type: 'list',
      items: [
        'Grande formato (60x60 e oltre): posa più rapida al m², ma manipolazione più delicata e livellamento più esigente',
        'Piccolo formato o mosaico: molte più fughe, quindi un tempo di posa nettamente superiore al m²',
        'Motivo diagonale o a spina di pesce: più tagli rispetto a una posa dritta classica, spesso il 20-30 % di tempo in più',
        'Numero di angoli, tubazioni e sanitari già posati attorno ai quali tagliare',
      ],
    },
    {
      type: 'stat',
      value: '+20-30 %',
      label: 'tempo di posa supplementare tipico per un motivo diagonale o a spina di pesce rispetto a una posa dritta, a parità di superficie',
    },
    { type: 'h2', text: 'Prevedere un margine di rottura fin dal preventivo' },
    {
      type: 'p',
      text: 'Un ordine di piastrelle senza margine di rottura espone al rischio di dover riordinare con urgenza, con il rischio di non trovare più lo stesso lotto né la stessa tonalità. Integrare un margine dell’8-12 % secondo la complessità della posa al momento del preventivo evita questo tipo di brutta sorpresa a cantiere avviato.',
    },
    {
      type: 'callout',
      title: 'Il livellamento del supporto non è sempre visibile prima del cantiere',
      text: 'Un pavimento che sembra piano a occhio nudo può richiedere un livellamento una volta rimosso il vecchio rivestimento. Prevedere questa eventualità nel preventivo (anche come opzione a parte) evita di dover rinegoziare un prezzo a metà cantiere.',
    },
    {
      type: 'cta',
      title: 'Preventivi che conservano i Suoi prezzi per formato e per motivo',
      text: 'Cantia conserva il Suo catalogo di prezzi (formato, motivo, margine di rottura) per comporre un preventivo di piastrellatura coerente in pochi minuti, senza dover ricalcolare tutto a ogni nuovo cantiere.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Perché due preventivi di piastrellatura a parità di superficie possono avere prezzi molto diversi?',
      answer:
        'Il formato delle piastrelle, il motivo di posa (dritto, diagonale, a spina di pesce) e il numero di tagli attorno agli ostacoli fanno variare fortemente il tempo di posa reale, anche a parità di superficie.',
    },
    {
      question: 'Quale margine di rottura prevedere su un ordine di piastrelle?',
      answer:
        'Generalmente tra l’8 e il 12 % secondo la complessità della posa, poiché un motivo con molti tagli consuma più piastrelle di una posa dritta semplice.',
    },
    {
      question: 'Bisogna prevedere il livellamento del supporto nel preventivo iniziale di piastrellatura?',
      answer:
        'È consigliabile, almeno come opzione a parte, poiché lo stato reale del supporto è spesso visibile solo dopo la rimozione del vecchio rivestimento.',
    },
  ],
  relatedSlugs: [
    'calculer-prix-devis-renovation-suisse',
    'checklist-ouverture-chantier-artisan',
    'devis-menuisier-sur-mesure-facturation-suisse',
  ],
};
