import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'logiciel-construit-avec-vous-sur-mesure',
  question: 'Cosa cambia avere un software costruito con Lei piuttosto che per tutti?',
  title: 'Un software costruito con Lei, non solo venduto a tutti',
  description:
    'Un editore che vende un prodotto rigido e un editore che costruisce con i propri clienti non offrono la stessa esperienza: ecco cosa cambia concretamente per un’impresa edile.',
  excerpt:
    'La maggior parte dei software è pensata una volta, per un cliente medio immaginario, poi venduta così com’è a tutti. Un software costruito con i propri clienti segue una logica diversa, più vicina al terreno.',
  category: 'Sur-mesure & automatisations',
  keywords: ['software costruito con Lei', 'editore che ascolta i propri clienti', 'software gestionale collaborativo edilizia', 'prodotto che evolve con i feedback clienti', 'Cantia sviluppo con clienti'],
  publishedAt: '2026-08-28',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'La maggior parte dei software gestionali sono concepiti una volta, per un profilo di cliente "medio" immaginato all’inizio, poi venduti così come sono a tutto un settore. Esiste un altro approccio: costruire lo strumento direttamente con le imprese che lo usano, funzionalità dopo funzionalità, feedback dopo feedback.',
    },
    { type: 'h2', text: 'Cosa cambia concretamente' },
    {
      type: 'list',
      items: [
        'Le nuove funzionalità nascono spesso da un’esigenza reale segnalata da un cliente, non da un’idea astratta interna',
        'Un problema riscontrato sul campo può essere segnalato direttamente, senza passare per un servizio clienti anonimo',
        'Lo strumento evolve al ritmo delle vere esigenze dell’edilizia svizzera, non di una tabella di marcia fissata in anticipo',
        'Una funzionalità utile a un’impresa in particolare giova poi spesso a tutte le altre',
      ],
    },
    {
      type: 'stat',
      value: '20+',
      label: 'imprese edili svizzere accompagnano già l’evoluzione di Cantia, con feedback che plasmano direttamente le prossime funzionalità',
    },
    { type: 'h2', text: 'Cosa non significa' },
    {
      type: 'p',
      text: 'Costruire con i propri clienti non significa sviluppare una versione totalmente diversa per ciascuno: il nucleo standard resta comune a tutti. Ciò che cambia è la capacità di regolarlo realmente, piuttosto che imporre un prodotto rigido senza mai adattarlo.',
    },
    {
      type: 'callout',
      title: 'Un feedback, anche piccolo, può davvero cambiare qualcosa',
      text: 'Un’osservazione su un dettaglio che crea attrito nella quotidianità ha spesso più impatto sull’evoluzione dello strumento di quanto si immagini, poiché questo tipo di feedback è direttamente all’origine di diverse funzionalità già esistenti in Cantia.',
    },
    {
      type: 'cta',
      title: 'Il Suo parere plasma direttamente lo strumento',
      text: 'Da Cantia, ogni feedback conta davvero nell’evoluzione del prodotto. Lo provi gratuitamente e ci dica cosa potrebbe adattarsi meglio al Suo modo di lavorare.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Cosa differenzia un software "costruito con i propri clienti" da un software classico?',
      answer:
        'Le nuove funzionalità nascono spesso da esigenze reali segnalate direttamente dai clienti, piuttosto che da una tabella di marcia decisa unicamente internamente.',
    },
    {
      question: 'Un software costruito con i propri clienti sviluppa una versione diversa per ciascuno?',
      answer:
        'No, il nucleo standard resta comune a tutti: la differenza riguarda la capacità di regolarlo realmente secondo i feedback del campo, piuttosto che restare rigido.',
    },
    {
      question: 'Come può un feedback cliente influenzare concretamente l’evoluzione dello strumento?',
      answer:
        'Un problema riscontrato nella quotidianità, segnalato direttamente, può dare origine a una nuova funzionalità che giova poi a tutti gli utenti dello strumento.',
    },
  ],
  relatedSlugs: [
    'cantia-adapte-metier-specifique-batiment',
    'demander-fonctionnalite-sur-mesure-editeur-logiciel',
    'logiciel-standard-vs-solution-personnalisee-batiment',
  ],
};
