import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'gestion-entreprise-sur-mobile-artisan',
  question: 'Si può davvero gestire tutta la propria impresa artigiana da un telefono?',
  title: 'Gestire la propria impresa dal telefono: fino a dove è davvero possibile',
  description:
    'Preventivi, fatture, foto di cantiere, ore del team: ciò che oggi funziona davvero bene su mobile, e ciò che resta più comodo su uno schermo più grande.',
  excerpt:
    'La promessa "gestisca tutto dal Suo telefono" è vera per la maggior parte della quotidianità di un artigiano. Non lo è per assolutamente tutto, ed è meglio sapere dove si trova il limite.',
  category: 'Comparatifs & outils',
  keywords: ['gestione impresa mobile', 'gestire artigianato da telefono', 'applicazione gestione smartphone edilizia', 'gestire tutto su mobile PMI', 'software mobile artigiano Svizzera'],
  publishedAt: '2026-07-20',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'La promessa di "gestire tutto dal proprio telefono" torna in quasi tutte le pubblicità di strumenti di gestione. È globalmente vera per la quotidianità di un artigiano, ma con sfumature che è meglio conoscere prima di affidarvisi completamente.',
    },
    { type: 'h2', text: 'Cosa funziona molto bene su mobile' },
    {
      type: 'list',
      items: [
        'Creare e inviare un preventivo o una fattura dal cantiere',
        'Scattare e organizzare foto geolocalizzate',
        'Registrare le proprie ore o consultare la propria pianificazione',
        'Consultare lo stato dei pagamenti in attesa a colpo d\'occhio',
      ],
    },
    { type: 'h2', text: 'Cosa resta più comodo sul computer' },
    {
      type: 'list',
      items: [
        'Costruire un catalogo prezzi dettagliato la prima volta',
        'Analizzare in profondità la redditività di più cantieri in parallelo',
        'Configurare i ruoli e i permessi di un team in crescita',
      ],
    },
    {
      type: 'stat',
      value: '90 %',
      label: 'quota delle attività quotidiane di un artigiano (preventivo, fattura, foto, ore) realizzabili interamente da mobile con un buon strumento di gestione',
    },
    {
      type: 'callout',
      title: 'La buona app completa il mobile piuttosto che sostituirlo del tutto',
      text: 'Uno strumento che funziona altrettanto bene su computer che su mobile permette di svolgere le attività rapide sul campo, e le attività di configurazione con più calma in ufficio, il che evita di essere bloccati da un lato o dall\'altro.',
    },
    {
      type: 'cta',
      title: 'La quotidianità su mobile, la configurazione su computer',
      text: 'Basta un unico account Cantia, tanto da un telefono in cantiere quanto da un computer per le attività più avanzate.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Si può davvero creare un preventivo completo dal proprio telefono?',
      answer:
        'Sì, con uno strumento ben concepito per mobile (incluso un catalogo prezzi per evitare di ridigitare tutto a mano su uno schermo piccolo).',
    },
    {
      question: 'Quali attività restano più facili su computer che su mobile?',
      answer:
        'La costruzione iniziale di un catalogo prezzi dettagliato o l\'analisi approfondita di più cantieri restano generalmente più comode su uno schermo più grande.',
    },
    {
      question: 'Un artigiano può fare completamente a meno del computer usando un buon strumento mobile?',
      answer:
        'Per la quotidianità, ampiamente sì. Mantenere un accesso occasionale a un computer resta comunque utile per le attività di configurazione più avanzate.',
    },
  ],
  relatedSlugs: [
    'application-gestion-freelance-batiment',
    'application-hors-ligne-chantier-pourquoi-important',
    'outil-facturation-en-ligne-pme-suisse',
  ],
};
