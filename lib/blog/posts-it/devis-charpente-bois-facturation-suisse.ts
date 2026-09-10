import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-charpente-bois-facturation-suisse',
  question: 'Come deve calcolare un carpentiere un preventivo tra il legno su misura e la posa in laboratorio?',
  title: 'Carpenteria in legno: calcolare un preventivo tra costo della materia, lavorazione e posa',
  description:
    'Tra il prezzo del legno che fluttua, il tempo di lavorazione in laboratorio e la posa in cantiere, un preventivo di carpenteria somma tre voci molto diverse. Come strutturarle per non perdersi lungo il percorso.',
  excerpt:
    'Una struttura in legno si costruisce in tre tempi: l’acquisto del legno, la lavorazione in laboratorio, poi la posa in cantiere. Un preventivo che non le distingue rischia di pagare l’inflazione del legno sul proprio margine.',
  category: 'Métiers du bâtiment',
  keywords: ['preventivo carpenteria legno', 'fatturazione carpentiere Svizzera', 'prezzo legno costruzione', 'preventivo laboratorio carpenteria', 'posa carpenteria cantiere'],
  publishedAt: '2026-09-04',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un preventivo di carpenteria attraversa tre tappe che non seguono lo stesso ritmo: l’acquisto del legno, il cui prezzo può evolvere tra la firma e l’ordine reale; la lavorazione in laboratorio, prevedibile e misurabile; e la posa in cantiere, che dipende dal meteo e dall’accessibilità. Trattarle come un unico forfait rigido espone ad assorbire da soli le variazioni che non dipendono dal lavoro svolto.',
    },
    { type: 'h2', text: 'Tre voci, tre logiche di prezzo' },
    {
      type: 'list',
      items: [
        'Legno e ferramenta: idealmente calcolati con una clausola di revisione se il termine tra preventivo e ordine supera qualche settimana',
        'Lavorazione in laboratorio: a forfait o a ora, prevedibile perché indipendente dagli imprevisti di cantiere',
        'Posa e sollevamento in loco: a economia o a forfait con una clausola meteo, poiché il tempo reale dipende fortemente dalle condizioni del giorno',
      ],
    },
    {
      type: 'stat',
      value: '2-3 sett.',
      label: 'termine tipico tra la redazione di un preventivo di carpenteria e l’avvio effettivo dell’ordine del legno, ampiamente sufficiente perché i prezzi si muovano',
    },
    { type: 'h2', text: 'Il sollevamento non è una semplice voce di manodopera' },
    {
      type: 'p',
      text: 'La posa di una struttura in legno implica spesso una gru o un autogru noleggiata a giornata, un intero team mobilitato contemporaneamente, e una forte dipendenza dal meteo. Un giorno di vento troppo forte che rinvia il sollevamento ha un costo reale (noleggio, team bloccato) che è meglio aver anticipato contrattualmente piuttosto che scoprirlo in piena negoziazione con il cliente.',
    },
    {
      type: 'callout',
      title: 'Una clausola di revisione del prezzo sul legno protegge entrambe le parti',
      text: 'Di fronte alla volatilità del prezzo del legno da costruzione, una clausola di revisione chiara (indicizzata sulla data d’ordine, non di firma del preventivo) evita al carpentiere di perdere il proprio margine e al cliente di avere una brutta sorpresa non anticipata.',
    },
    {
      type: 'cta',
      title: 'Separi materia, lavorazione e posa su ogni preventivo',
      text: 'Cantia permette di strutturare un preventivo in voci distinte con le proprie quantità e prezzi, affinché ogni parte del cantiere di carpenteria resti leggibile e regolabile indipendentemente dalle altre.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Come proteggersi dalla variazione del prezzo del legno tra il preventivo e l’ordine?',
      answer:
        'Integrando una clausola di revisione del prezzo sulla voce legno, indicizzata sulla data reale dell’ordine piuttosto che sulla data di firma del preventivo, soprattutto se il termine supera qualche settimana.',
    },
    {
      question: 'Bisogna fatturare il sollevamento della struttura separatamente dalla posa?',
      answer:
        'È consigliabile quando una gru o un autogru viene noleggiata appositamente, poiché questo costo è fisso per la giornata, indipendentemente dal tempo di posa effettivo, ed esposto direttamente al rischio meteo.',
    },
    {
      question: 'Come gestire un rinvio del cantiere di carpenteria per causa meteo?',
      answer:
        'Idealmente tramite una clausola prevista nel preventivo fin dall’inizio, che precisi chi assorbe il costo di un rinvio (noleggio di attrezzatura, team mobilitato) piuttosto che negoziarlo a posteriori sotto pressione.',
    },
  ],
  relatedSlugs: [
    'retard-chantier-meteo-obligations-contractuelles',
    'avenant-chantier-plus-value-moins-value',
    'devis-facture-facadier-isolation-suisse',
  ],
};
