import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-facture-chauffagiste-cvc-suisse',
  question: 'Come deve calcolare un tecnico del riscaldamento CVC un preventivo di sostituzione della caldaia di fronte agli aiuti cantonali?',
  title: 'Tecnico del riscaldamento CVC: calcolare una sostituzione di caldaia tra prezzo, termine e sussidio',
  description:
    'Sostituire un riscaldamento a nafta o a gas con una pompa di calore implica un preventivo tecnico, un termine di consegna spesso lungo, e frequentemente un sussidio cantonale. Come integrare tutto senza bloccare il cliente.',
  excerpt:
    'Un preventivo di sostituzione del riscaldamento non è quasi mai una semplice sostituzione di materiale: è un progetto tecnico, un termine di consegna da anticipare, e spesso un fascicolo di sussidio da far quadrare.',
  category: 'Métiers du bâtiment',
  keywords: ['preventivo tecnico riscaldamento', 'fatturazione installatore CVC Svizzera', 'prezzo sostituzione caldaia', 'pompa di calore preventivo sussidio', 'termine consegna riscaldamento preventivo'],
  publishedAt: '2026-09-14',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Sostituire una caldaia a nafta o a gas con una pompa di calore non è solo una questione di apparecchiatura. È spesso anche un adeguamento della rete esistente, un termine di consegna che può superare diverse settimane in alta stagione, e per molti clienti, una richiesta di sussidio cantonale che condiziona la loro decisione di firmare.',
    },
    { type: 'h2', text: 'Cosa deve coprire un preventivo di sostituzione del riscaldamento' },
    {
      type: 'list',
      items: [
        'Smontaggio e smaltimento dell’installazione precedente, incluso il serbatoio della nafta se del caso',
        'Adeguamento della rete esistente (radiatori, regolazione), spesso necessario con una pompa di calore',
        'Fornitura e posa dell’apparecchiatura nuova, con il termine di consegna indicato chiaramente',
        'Messa in servizio, regolazioni e consegna di una documentazione tecnica completa al cliente',
      ],
    },
    {
      type: 'stat',
      value: '6-12 sett.',
      label: 'termine di consegna comune per una pompa di calore in periodo di forte domanda, da comunicare esplicitamente al cliente fin dal preventivo',
    },
    { type: 'h2', text: 'Il preventivo condiziona spesso il sussidio, non il contrario' },
    {
      type: 'p',
      text: 'La maggior parte dei programmi cantonali richiede un preventivo dettagliato prima di qualsiasi impegno dei lavori per convalidare una richiesta di sussidio: iniziare il cantiere prima della concessione può annullare il diritto all’aiuto. Il preventivo deve quindi essere sufficientemente preciso e datato per servire direttamente come documento giustificativo, senza attendere che il cliente ne richieda un altro per il proprio fascicolo.',
    },
    {
      type: 'callout',
      title: 'Un termine di consegna comunicato male costa più caro di un prezzo mal calcolato',
      text: 'Un cliente che scopre un termine di diversi mesi dopo aver firmato, in pieno inverno senza riscaldamento funzionante, raramente ricorda la sfumatura tecnica. Comunicare il termine reale fin dal preventivo evita questo tipo di conflitto evitabile.',
    },
    {
      type: 'cta',
      title: 'Preventivi precisi, pronti a corroborare una richiesta di sussidio',
      text: 'Cantia genera preventivi dettagliati e datati, con tutte le quantità e prestazioni necessarie per accompagnare un fascicolo di sussidio cantonale senza dover produrre alcun documento aggiuntivo.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Bisogna attendere la concessione del sussidio prima di iniziare i lavori di riscaldamento?',
      answer:
        'Generalmente sì: la maggior parte dei programmi cantonali richiede che il preventivo sia sottoposto e l’aiuto concesso prima dell’inizio dei lavori, pena la perdita del diritto al sussidio.',
    },
    {
      question: 'Come comunicare un lungo termine di consegna della pompa di calore al cliente?',
      answer:
        'Indicandolo esplicitamente e per iscritto fin dal preventivo, soprattutto in alta stagione dove i termini possono superare i due-tre mesi, il che evita qualsiasi malinteso una volta firmato il preventivo.',
    },
    {
      question: 'Il preventivo di riscaldamento deve includere l’adeguamento della rete esistente?',
      answer:
        'È consigliato, in particolare per un passaggio a una pompa di calore, poiché i radiatori e la regolazione esistenti non sono sempre compatibili senza adeguamento.',
    },
  ],
  relatedSlugs: [
    'devis-facture-facadier-isolation-suisse',
    'permis-construire-renovation-quand-necessaire',
    'validite-devis-signe-prix-qui-bouge',
  ],
};
