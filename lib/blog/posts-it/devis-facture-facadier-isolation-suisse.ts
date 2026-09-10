import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-facture-facadier-isolation-suisse',
  question: 'Come calcolare un preventivo di facciata e isolamento perimetrale tenendo conto degli aiuti cantonali?',
  title: 'Facciatista e isolamento perimetrale: calcolare un preventivo che tenga conto dei sussidi',
  description:
    'Un preventivo di isolamento perimetrale (CECE, Programma Edifici) implica spesso una richiesta di sussidio in parallelo al cantiere. Come strutturare preventivo e fatturazione senza bloccare il fascicolo del cliente.',
  excerpt:
    'L’isolamento perimetrale è uno dei rari cantieri dell’edilizia in cui il prezzo del preventivo influenza direttamente un fascicolo amministrativo parallelo, quello del sussidio cantonale, e questa dipendenza cambia il modo di fatturare.',
  category: 'Métiers du bâtiment',
  keywords: ['preventivo facciata isolamento', 'fatturazione isolamento perimetrale Svizzera', 'sussidio Programma Edifici preventivo', 'prezzo isolamento facciata m2', 'CECE preventivo ristrutturazione'],
  publishedAt: '2026-09-09',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'A differenza della maggior parte dei cantieri edili, un progetto di isolamento perimetrale è spesso accompagnato da una richiesta di sussidio cantonale (tramite il Programma Edifici) o da un certificato CECE. Il cliente si aspetta frequentemente un preventivo conforme ai requisiti del fascicolo ancor prima di firmarlo, il che cambia l’ordine abituale tra preventivo e impegno.',
    },
    { type: 'h2', text: 'Cosa deve contenere il preventivo per restare compatibile con il sussidio' },
    {
      type: 'list',
      items: [
        'Spessore e valore di isolamento (valore U) chiaramente indicati, non solo il tipo di materiale',
        'Superficie di facciata trattata dettagliata, poiché i sussidi sono spesso calcolati al m²',
        'Distinzione tra facciata, zoccolo e contorno delle finestre, che possono avere requisiti diversi',
        'Data di realizzazione prevista, poiché alcuni Cantoni impongono un termine tra la concessione e la fine dei lavori',
      ],
    },
    {
      type: 'stat',
      value: 'CHF 400-1200',
      label: 'ordine di grandezza degli aiuti cantonali per elemento di involucro risanato, molto variabile secondo il Cantone e il tipo di edificio',
    },
    { type: 'h2', text: 'Non far dipendere la propria liquidità dal calendario del sussidio' },
    {
      type: 'p',
      text: 'Il versamento di un sussidio può richiedere diversi mesi dopo la fine dei lavori. Fatturare normalmente il cliente secondo l’avanzamento del cantiere, senza attendere il versamento cantonale per emettere la fattura, evita che la liquidità dell’impresa dipenda dal ritmo amministrativo di un terzo.',
    },
    {
      type: 'callout',
      title: 'Il preventivo deve restare valido per tutta la durata del fascicolo di sussidio',
      text: 'Un fascicolo di sussidio può richiedere diverse settimane per essere validato. Prevedere una durata di validità del preventivo sufficientemente lunga, o in mancanza una clausola di revisione chiara in caso di superamento, evita di dover rifare un preventivo identico solo per una questione di termine amministrativo.',
    },
    {
      type: 'cta',
      title: 'Preventivi dettagliati, pronti ad accompagnare un fascicolo di sussidio',
      text: 'Cantia permette di generare preventivi chiari e dettagliati per voce, con tutte le superfici e quantità necessarie per corroborare un fascicolo di sussidio cantonale.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Il preventivo di isolamento perimetrale deve indicare il valore U del materiale?',
      answer:
        'È fortemente consigliato, poiché i fascicoli di sussidio cantonali (Programma Edifici) esigono generalmente un valore di isolamento preciso, non solo una denominazione commerciale del materiale.',
    },
    {
      question: 'Bisogna attendere il versamento del sussidio prima di fatturare il cliente?',
      answer:
        'No, è preferibile fatturare secondo l’avanzamento normale del cantiere, senza legare la propria liquidità al calendario di versamento, talvolta lungo, dell’aiuto cantonale.',
    },
    {
      question: 'Un preventivo di isolamento perimetrale deve avere una durata di validità più lunga della media?',
      answer:
        'È consigliato, poiché la costituzione di un fascicolo di sussidio può richiedere diverse settimane; una clausola di revisione chiara evita quindi di dover rifare un preventivo identico per un semplice superamento di termine.',
    },
  ],
  relatedSlugs: [
    'validite-devis-signe-prix-qui-bouge',
    'devis-charpente-bois-facturation-suisse',
    'permis-construire-renovation-quand-necessaire',
  ],
};
