import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'crm-artisan-batiment-pourquoi-utile',
  question: 'Un artigiano edile ha davvero bisogno di un CRM?',
  title: 'CRM per artigiano edile: utile o superfluo?',
  description:
    'La parola CRM evoca team commerciali e cruscotti complessi. Eppure un artigiano che gestisce 30, 50 o 100 clienti ha esattamente lo stesso problema di memoria di un commerciale.',
  excerpt:
    'Non serve un software di vendita complesso per aver bisogno di un CRM. Il vero segnale è il numero di volte in cui si cerca «chi era già questo cliente» nelle proprie e-mail.',
  category: 'Comparatifs & outils',
  keywords: ['CRM artigiano edilizia', 'gestione clienti impresa costruzione', 'software clienti artigiano', 'monitoraggio cliente cantiere', 'fidelizzazione cliente edilizia'],
  publishedAt: '2026-06-05',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'La parola CRM (customer relationship management) evoca spesso team commerciali con pipeline di vendita complesse (un universo lontano dalla quotidianità di un artigiano). Ma la funzione di base di un CRM (sapere chi sono i propri clienti, cosa hanno già ordinato, e quando risollecitarli) riguarda un’impresa edile esattamente quanto un team commerciale.',
    },
    { type: 'h2', text: 'Il segnale che indica che un CRM diventa utile' },
    {
      type: 'list',
      items: [
        'Cercare un vecchio preventivo o un indirizzo di cantiere nella propria casella e-mail piuttosto che in un file centralizzato',
        'Non ricordare più se un cliente è già stato fatturato per un intervento precedente',
        'Ricontattare un vecchio cliente per caso piuttosto che tramite un follow-up strutturato',
        'Perdere il filo di chi ha firmato cosa, su quale cantiere, con quale acconto versato',
      ],
    },
    {
      type: 'h2',
      text: 'Cosa porta concretamente un CRM adatto all’edilizia',
    },
    {
      type: 'list',
      items: [
        'Uno storico completo per cliente: preventivi, fatture, cantieri, note di follow-up, in un solo posto',
        'Una base per risollecitare un vecchio cliente al momento giusto, piuttosto che a caso di un ricordo',
        'Una vista chiara di chi sono i clienti ricorrenti, spesso i più redditizi da conservare',
        'Un risparmio di tempo diretto: non serve più ricostruire uno storico a ogni nuovo contatto con un cliente esistente',
      ],
    },
    {
      type: 'callout',
      title: 'Un cliente ricorrente costa molto meno da mantenere di uno nuovo da acquisire',
      text: 'Nell’edilizia come altrove, la fidelizzazione è quasi sempre più redditizia della prospezione. Bisogna però avere la visibilità necessaria per sapere chi risollecitare e quando.',
    },
    {
      type: 'cta',
      title: 'Uno storico cliente integrato, non un software a parte',
      text: 'Cantia centralizza preventivi, fatture e note per cliente direttamente collegati ai cantieri: non serve un CRM separato da sincronizzare in più.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Un artigiano indipendente ha bisogno di un CRM?',
      answer:
        'Non appena diventa difficile ricordare lo storico di ogni cliente senza cercare nelle proprie e-mail, un CRM semplice porta un vero risparmio di tempo, anche da soli.',
    },
    {
      question: 'Qual è la differenza tra un CRM e una semplice rubrica?',
      answer:
        'Un CRM collega lo storico completo (preventivi, fatture, cantieri, note) a ogni cliente, mentre una rubrica conserva solo i recapiti.',
    },
    {
      question: 'Serve un software separato per il CRM e la fatturazione?',
      answer:
        'Non necessariamente: uno strumento che collega nativamente clienti, preventivi e fatture evita la doppia digitazione e la sincronizzazione tra due sistemi distinti.',
    },
  ],
  relatedSlugs: [
    'relancer-client-facture-impayee-sans-perdre-client',
    'meilleur-logiciel-devis-facture-batiment-suisse-2026',
    'excel-vs-logiciel-gestion-chantier-limites',
  ],
};
