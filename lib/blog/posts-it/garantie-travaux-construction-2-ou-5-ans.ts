import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'garantie-travaux-construction-2-ou-5-ans',
  question: 'Garanzia sui lavori di costruzione in Svizzera: 2 anni o 5 anni?',
  title: 'Garanzia lavori di costruzione in Svizzera: 2 anni, 5 anni, o 10',
  description:
    'La garanzia legale per un’opera immobiliare è di 5 anni, non 2. E una modifica legislativa entrata in vigore nel 2026 riduce a 60 giorni il termine per segnalare un difetto.',
  excerpt:
    'Molti artigiani citano «2 anni» di garanzia per riflesso. Per tutto ciò che è fissato all’edificio, la legge svizzera dice 5 anni, e un nuovo termine di 60 giorni ha appena cambiato le carte in tavola nel 2026.',
  category: 'Juridique & normes',
  keywords: ['garanzia costruzione', 'termine di prescrizione', 'art 371 co', 'avviso dei difetti', 'difetto occulto'],
  publishedAt: '2026-03-05',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: '«Due anni di garanzia» è la cifra che tutti ripetono nell’edilizia. Eppure è falsa per la maggior parte di ciò che riguarda un’opera fissata al suolo. L’art. 371 cpv. 2 del Codice delle obbligazioni fissa il termine a cinque anni per un’opera immobiliare, non due.',
    },
    { type: 'h2', text: 'Tre termini, non uno solo' },
    {
      type: 'table',
      headers: ['Natura dell’opera', 'Termine di garanzia', 'Base legale'],
      rows: [
        ['Oggetto mobile (non fissato all’edificio)', '2 anni', 'Art. 371 cpv. 1 CO (rinvio all’art. 210)'],
        ['Opera immobiliare o fissata all’edificio', '5 anni', 'Art. 371 cpv. 2 CO'],
        ['Difetto intenzionalmente dissimulato', '10 anni', 'Art. 371 cpv. 2 CO'],
      ],
    },
    {
      type: 'p',
      text: 'La linea di demarcazione si gioca su una parola: «fissato». Una finestra posata, un massetto colato, un impianto elettrico integrato rientrano nel regime immobiliare a 5 anni. Del mobilio consegnato e non integrato alla struttura resta sotto il regime mobiliare a 2 anni: una distinzione che la maggior parte delle aziende non applica mai correttamente sui propri preventivi.',
    },
    {
      type: 'callout',
      title: 'Il cambiamento da conoscere per il 2026: 60 giorni per segnalare un difetto',
      text: 'Una riforma del diritto di garanzia entrata in vigore nel 2026 fissa ora un termine di 60 giorni per notificare un difetto al costruttore dopo la sua scoperta (un quadro più preciso rispetto al vecchio obbligo, più vago, di segnalarlo «immediatamente»). Un cliente che aspetta troppo a lungo per segnalare un difetto visibile rischia ora di perdere il proprio diritto alla riparazione, anche entro il termine di prescrizione di 5 anni.',
    },
    { type: 'h2', text: 'Cosa cambia concretamente su un cantiere' },
    {
      type: 'list',
      items: [
        'Il termine di garanzia decorre dalla consegna dell’opera, non dalla fine dei lavori o dalla data della fattura',
        'Un difetto occulto scoperto quattro anni dopo la consegna resta coperto dai 5 anni (a condizione di essere segnalato entro i 60 giorni successivi alla sua scoperta)',
        'Una dissimulazione intenzionale di un difetto conosciuto prolunga il termine a 10 anni, un rischio reale per l’azienda che «chiude un occhio» su un problema visibile a fine cantiere',
      ],
    },
    {
      type: 'p',
      text: 'Per l’azienda, la conseguenza pratica è duplice: documentare con precisione lo stato dell’opera alla consegna (verbale, foto datate) protegge sia da una richiesta infondata anni dopo, sia dall’accusa di dissimulazione.',
    },
    {
      type: 'cta',
      title: 'Una traccia di ogni cantiere, foto per foto',
      text: 'I rapporti di cantiere Cantia marcano data, ora e posizione a ogni foto: una prova precisa dello stato dei lavori a ogni fase, utile ben dopo la fine del cantiere.',
      buttonLabel: 'Scoprire i rapporti di cantiere',
    },
  ],
  faq: [
    {
      question: 'La garanzia sui lavori di costruzione è di 2 anni o 5 anni in Svizzera?',
      answer:
        '5 anni per ogni opera immobiliare o fissata all’edificio (art. 371 cpv. 2 CO). Il termine di 2 anni si applica solo agli oggetti mobili non integrati alla struttura.',
    },
    {
      question: 'Da quando decorre il termine di garanzia di 5 anni?',
      answer:
        'Dalla consegna dell’opera al cliente, non dalla data della fattura o dalla fine effettiva dei lavori.',
    },
    {
      question: 'Qual è il nuovo termine per segnalare un difetto nel 2026?',
      answer:
        'La riforma del diritto di garanzia entrata in vigore nel 2026 fissa un termine di 60 giorni per notificare un difetto al costruttore dopo la sua scoperta, sostituendo la vecchia esigenza più vaga di segnalazione «immediata».',
    },
  ],
  relatedSlugs: [
    'defaut-construction-decouvert-apres-reception-qui-paie',
    'norme-sia-118-devis-obligatoire',
    'duree-conservation-devis-factures-suisse',
  ],
};
