import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'licenciement-ouvrier-batiment-delai-conge-cct',
  question: 'Quale termine di disdetta rispettare per licenziare un operaio edile in Svizzera?',
  title: 'Licenziamento nell’edilizia: i termini di disdetta secondo il CCL e il Codice delle obbligazioni',
  description:
    'Il termine di disdetta di un operaio edile dipende dalla sua anzianità di servizio e dal CCL applicabile. Sbagliare espone il datore di lavoro a dover indennizzare la differenza. Ecco come calcolarlo correttamente.',
  excerpt:
    'Un termine di disdetta calcolato male non è solo un errore amministrativo: è un credito salariale che l’operaio può reclamare, a volte mesi dopo la sua partenza.',
  category: 'RH & salaires',
  keywords: ['licenziamento edilizia', 'termine di disdetta CCL', 'anzianità di servizio dipendente', 'risoluzione contratto di lavoro', 'costruzione svizzera'],
  publishedAt: '2026-08-09',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Il termine di disdetta applicabile a un operaio edile non è fisso: dipende sia dalla sua anzianità di servizio nell’azienda sia dal contratto collettivo di lavoro (CCL) applicabile, che può prevedere regole più favorevoli rispetto al regime suppletivo del Codice delle obbligazioni. Riferirsi unicamente all’art. 335c CO senza verificare il CCL del settore è l’errore più frequente.',
    },
    { type: 'h2', text: 'I termini legali di default (art. 335c CO)' },
    {
      type: 'table',
      headers: ['Anzianità di servizio', 'Termine di disdetta'],
      rows: [
        ['Durante il periodo di prova', '7 giorni (salvo accordo contrario)'],
        ['1° anno di servizio', '1 mese per la fine di un mese'],
        ['Dal 2° al 9° anno di servizio', '2 mesi per la fine di un mese'],
        ['Dal 10° anno di servizio', '3 mesi per la fine di un mese'],
      ],
    },
    {
      type: 'callout',
      title: 'Il CCL del settore può imporre termini diversi',
      text: 'Il contratto collettivo nazionale del settore principale della costruzione (e le sue varianti cantonali) prevede talvolta disposizioni specifiche su termini, periodi di protezione o forma della disdetta: prevale sul regime legale suppletivo quando è più favorevole al lavoratore.',
    },
    { type: 'h2', text: 'I periodi in cui la disdetta non può essere data' },
    {
      type: 'list',
      items: [
        'Durante un’incapacità lavorativa per malattia o infortunio (protezione temporanea, durata variabile secondo l’anzianità di servizio)',
        'Durante il servizio militare svizzero o un obbligo legale analogo',
        'Durante la gravidanza e le 16 settimane successive al parto',
        'Una disdetta data durante un periodo protetto è nulla: dovrà essere notificata nuovamente una volta terminato il periodo',
      ],
    },
    {
      type: 'cta',
      title: 'Un team seguito, cantiere per cantiere',
      text: 'Il modulo RH di Cantia centralizza le date di entrata di ogni dipendente e il suo storico, il che è utile per verificare l’anzianità esatta al momento di calcolare un termine di disdetta.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Qual è il termine di disdetta legale per un dipendente con 3 anni di anzianità?',
      answer:
        'Due mesi per la fine di un mese secondo l’art. 335c CO, salvo disposizione più favorevole prevista dal CCL applicabile al settore della costruzione.',
    },
    {
      question: 'Si può licenziare un dipendente in malattia?',
      answer:
        'No, la disdetta data durante un periodo di protezione (malattia, infortunio, servizio militare, maternità) è nulla. Dovrà essere notificata nuovamente una volta trascorso il periodo protetto.',
    },
    {
      question: 'Il CCL può prevedere un termine più lungo del Codice delle obbligazioni?',
      answer:
        'Sì, e in tal caso prevale sul regime legale suppletivo: occorre sempre verificare il CCL applicabile prima di affidarsi unicamente all’art. 335c CO.',
    },
  ],
  relatedSlugs: [
    'salaire-minimum-cct-construction-suisse',
    'accident-travail-chantier-obligations-employeur-suva',
    'vacances-non-prises-fin-annee-batiment-cct',
  ],
};
