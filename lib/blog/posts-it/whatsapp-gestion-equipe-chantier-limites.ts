import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'whatsapp-gestion-equipe-chantier-limites',
  question: 'Perché WhatsApp non regge più per gestire un team di cantiere oltre qualche persona?',
  title: 'WhatsApp per gestire un team di cantiere: perché smette di funzionare dopo 5 persone',
  description:
    'WhatsApp funziona molto bene per due o tre persone. Oltre, l’informazione si perde nello scorrimento dei messaggi: ecco perché, e cosa prende il posto.',
  excerpt:
    'WhatsApp è un ottimo strumento di conversazione. Non è uno strumento di gestione. E la differenza diventa brutale non appena il team supera le cinque persone.',
  category: 'Comparatifs & outils',
  keywords: ['whatsapp cantiere', 'gestione team', 'comunicazione cantiere', 'strumento cantiere', 'organizzazione edilizia'],
  publishedAt: '2026-04-13',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un gruppo WhatsApp per il team funziona incredibilmente bene all’inizio (rapido, familiare, ce l’hanno già tutti installato). Poi il team cresce, i cantieri si moltiplicano, e lo stesso strumento che sembrava bastare diventa il principale punto di attrito dell’organizzazione.',
    },
    { type: 'h2', text: 'Ciò che WhatsApp fa molto bene' },
    {
      type: 'p',
      text: 'Inviare una foto rapida, porre una domanda urgente, avvisare di un ritardo: per questo tipo di scambio puntuale, nulla batte WhatsApp in rapidità. Il problema non appare mai su un messaggio isolato. Appare nell’accumulo.',
    },
    { type: 'h2', text: 'Dove si rompe concretamente' },
    {
      type: 'list',
      items: [
        'Un’informazione importante inviata un martedì si perde sotto cinquanta messaggi prima di giovedì, così che nessuno la ritrova senza scorrere tutta la cronologia',
        'Nessun collegamento strutturale tra un messaggio e il cantiere a cui si riferisce: impossibile filtrare «tutto ciò che riguarda questo cantiere preciso»',
        'Una foto inviata nel gruppo non è geolocalizzata né datata in modo utilizzabile per un rapporto o una controversia successiva',
        'La pianificazione di chi va dove resta nella testa di chi l’ha decisa, non visibile a tutto il team contemporaneamente',
        'Nessuna traccia pulita per la fatturazione, la redditività o lo storico cliente: tutto resta in una conversazione, non in un sistema',
      ],
    },
    {
      type: 'callout',
      title: 'La soglia non è magica, ma esiste',
      text: 'Non c’è una regola rigida a cinque persone, ma lo schema si ripete: oltre un piccolo team e uno o due cantieri, il volume di messaggi supera ciò che una conversazione lineare può assorbire senza perdita di informazione. Il sintomo più chiaro: qualcuno che richiede un’informazione già data, semplicemente perché è scomparsa nel flusso.',
    },
    { type: 'h2', text: 'Cosa prende il relè senza cambiare tutto in un colpo' },
    {
      type: 'p',
      text: 'La transizione più morbida non contrappone «WhatsApp» a «un software». Mantiene WhatsApp per l’urgenza puntuale e sposta tutto ciò che deve restare ritrovabile (pianificazione, foto di cantiere, decisioni, monitoraggio cliente) verso uno strumento strutturato per cantiere. Il messaggio rapido resta rapido; ciò che deve sopravvivere nel tempo smette di dipendere da uno scorrimento di conversazione.',
    },
    {
      type: 'cta',
      title: 'Un feed di attività per cantiere, non un unico grande gruppo',
      text: 'Cantia organizza scambi, foto e note per cantiere (ritrovabili mesi dopo), senza dover scorrere un’intera conversazione per ritrovare l’informazione cercata.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'WhatsApp basta per gestire un piccolo team di cantiere?',
      answer:
        'Per due o tre persone e un cantiere alla volta, sì: il limite appare quando il team e il numero di cantieri crescono, e l’informazione si perde nel volume di messaggi.',
    },
    {
      question: 'Qual è il problema principale di WhatsApp per gestire più cantieri?',
      answer:
        'L’assenza di struttura: nessun collegamento tra un messaggio e il cantiere interessato, il che rende impossibile ritrovare o filtrare l’informazione in seguito.',
    },
    {
      question: 'Bisogna abbandonare completamente WhatsApp per uno strumento di gestione cantiere?',
      answer:
        'Non necessariamente. WhatsApp resta efficace per l’urgenza puntuale, ma la transizione più efficace sposta soprattutto ciò che deve restare ritrovabile (pianificazione, foto, storico) verso uno strumento strutturato per cantiere.',
    },
  ],
  relatedSlugs: [
    'gerer-plusieurs-chantiers-en-parallele-methode',
    'bexio-vs-cantia-logiciel-batiment',
    'suivre-rentabilite-chantier-sans-excel',
  ],
};
