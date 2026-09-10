import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'automatiser-taches-repetitives-entreprise-sans-developpeur',
  question: 'Si possono automatizzare le attività ripetitive della propria impresa senza essere sviluppatori?',
  title: 'Automatizzare senza programmare: cosa è possibile per un’impresa edile',
  description:
    'L’automazione non è più riservata alle imprese con un servizio informatico. Cosa si può oggi automatizzare in una piccola impresa edile, senza scrivere una riga di codice.',
  excerpt:
    'Automatizzare fa spesso pensare a script complicati o software costosi. Per una piccola impresa edile, può invece semplicemente significare che un sollecito di fattura parte da solo, al momento giusto.',
  category: 'Sur-mesure & automatisations',
  keywords: ['automatizzare attività impresa senza sviluppatore', 'automazione PMI edile', 'automatizzare senza programmare', 'risparmiare tempo automazione gestione', 'automazione amministrativa artigiano'],
  publishedAt: '2026-08-16',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'L’automazione evoca spesso strumenti complessi riservati alle grandi imprese con un servizio informatico dedicato. Per una piccola impresa edile, l’automazione utile è spesso molto più semplice: attività ripetitive che si attivano senza intervento manuale.',
    },
    { type: 'h2', text: 'Esempi concreti di automazione già accessibile' },
    {
      type: 'list',
      items: [
        'Un sollecito di fattura non pagata inviato automaticamente dopo un termine definito',
        'Una notifica quando un preventivo si avvicina alla sua data di validità, per sollecitare il cliente in tempo',
        'Il calcolo automatico della redditività di un cantiere non appena vengono inserite ore e spese',
        'Un rapporto di cantiere generato automaticamente a partire da foto e note già prese sul campo',
      ],
    },
    {
      type: 'stat',
      value: '3-6h',
      label: 'tempo settimanale risparmiato in media grazie all’automazione delle attività amministrative ripetitive in una piccola impresa edile',
    },
    { type: 'h2', text: 'La differenza tra automazione standard e automazione su misura' },
    {
      type: 'p',
      text: 'Alcune automazioni esistono già in modo standard in un buon strumento gestionale (solleciti, notifiche). Altre sono proprie del modo di lavorare di un’impresa in particolare: possono essere sviluppate su misura, senza che l’impresa debba assumere uno sviluppatore per questo.',
    },
    {
      type: 'callout',
      title: 'Automatizzare non significa perdere il controllo',
      text: 'Una buona automazione resta sempre visibile e modificabile. Un sollecito automatico può essere annullato manualmente se la situazione lo richiede: non sostituisce il giudizio dell’impresa.',
    },
    {
      type: 'cta',
      title: 'Automazioni già pronte, e altre possibili su misura',
      text: 'Cantia automatizza già solleciti e notifiche di base. Può anche sviluppare automazioni proprie del Suo modo di lavorare se necessario.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Servono competenze tecniche per automatizzare attività nella propria impresa edile?',
      answer:
        'No, poiché numerose automazioni (solleciti, notifiche, calcoli) esistono già in modo standard in un buon strumento gestionale, senza richiedere competenze di programmazione.',
    },
    {
      question: 'Quali attività possono essere automatizzate in via prioritaria in una piccola impresa edile?',
      answer:
        'I solleciti di fatture non pagate, le notifiche di preventivi in scadenza e il calcolo automatico della redditività di un cantiere sono tra le automazioni più utili nella quotidianità.',
    },
    {
      question: 'Un’automazione toglie il controllo sulle decisioni dell’impresa?',
      answer:
        'No, una buona automazione resta sempre visibile e modificabile manualmente. Accelera le attività ripetitive senza sostituire il giudizio umano sulle decisioni importanti.',
    },
  ],
  relatedSlugs: [
    'automatiser-rappels-relances-entreprise',
    'automatiser-suivi-administratif-entreprise-artisanale',
    'relancer-client-facture-impayee-sans-perdre-client',
  ],
};
