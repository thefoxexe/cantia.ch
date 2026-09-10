import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'avs-ai-independant-batiment',
  question: 'Come funzionano i contributi AVS/AI per un indipendente dell’edilizia?',
  title: 'AVS/AI per un indipendente dell’edilizia: come funziona',
  description:
    'Contributi AVS/AI/IPG obbligatori dai 18 anni per ogni indipendente svizzero, calcolati sul reddito netto e degressivi sotto CHF 60’500/anno. La guida completa.',
  excerpt:
    'L’AVS/AI non è un’opzione per un indipendente, a differenza del 2° pilastro. E l’aliquota che Le viene applicata dipende da una soglia che quasi nessuno conosce.',
  category: 'Juridique & normes',
  keywords: ['avs', 'ai', 'indipendente', 'contributi', 'cassa di compensazione', 'reddito netto'],
  publishedAt: '2026-01-26',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Mettersi in proprio nell’edilizia comporta un’affiliazione obbligatoria all’AVS/AI/IPG a partire dai 18 anni compiuti. È uno dei pochi punti che non è mai facoltativo per un indipendente svizzero, qualunque sia la sua cifra d’affari.',
    },
    { type: 'h2', text: 'Su quale base si calcola davvero il contributo' },
    {
      type: 'p',
      text: 'Un dipendente contribuisce su una percentuale fissa del suo salario lordo. Un indipendente contribuisce sul suo reddito netto d’attività (dopo le spese d’esercizio, prima delle imposte). La cassa di compensazione cantonale (o professionale, a seconda del ramo) fissa l’importo ogni anno sulla base della tassazione fiscale, con uno sfasamento temporale che spesso sorprende: gli acconti dell’anno in corso sono provvisori, e il conguaglio arriva una volta conosciuta la tassazione definitiva (a volte due anni dopo).',
    },
    {
      type: 'callout',
      title: 'La soglia che nessuno verifica',
      text: 'Sotto CHF 60’500 di reddito annuo, l’aliquota di contribuzione AVS/AI/IPG è degressiva, dunque nettamente meno onerosa dell’aliquota piena di circa il 10% applicata oltre. Molti indipendenti in fase di avvio pagano un’aliquota che credono fissa mentre invece cambia ogni anno con il loro reddito.',
    },
    { type: 'h2', text: 'Un contributo minimo, anche a zero' },
    {
      type: 'p',
      text: 'Anche un reddito molto basso o nullo in un dato anno non esonera da un contributo minimo annuo. Esso garantisce la continuità dei diritti (rendita AVS futura, copertura AI) ed evita le lacune contributive che erodono una futura rendita di vecchiaia, spesso senza che ce ne si accorga prima dell’età di pensionamento.',
    },
    { type: 'h2', text: 'Affiliarsi, senza indugio' },
    {
      type: 'list',
      items: [
        'Annunciarsi alla cassa di compensazione cantonale o a una cassa professionale dell’edilizia nei giorni successivi all’inizio dell’attività',
        'Fornire una stima del reddito del primo anno (acconti provvisori basati su di essa)',
        'La cassa adegua poi l’importo una volta conosciuta la tassazione fiscale definitiva, con conguaglio o rimborso',
        'Provvisionare la liquidità di conseguenza: gli acconti cadono indipendentemente dal ritmo reale d’incasso dei cantieri',
      ],
    },
    { type: 'h2', text: 'AVS/AI non è la LPP: ciò che complica tutto' },
    {
      type: 'p',
      text: 'L’AVS/AI/IPG (1° pilastro) è obbligatoria per ogni indipendente. Il 2° pilastro (LPP), invece, non lo è: un indipendente può affiliarvisi volontariamente, ma non vi è legalmente tenuto, salvo eccezioni settoriali legate alla SUVA. È la confusione più frequente, e merita un articolo a parte.',
    },
    {
      type: 'cta',
      title: 'I Suoi ricavi di cantiere, senza approssimazioni',
      text: 'Il modulo Redditività di Cantia segue ciò che ogni cantiere rende realmente una volta dedotti i costi, il che ne fa una base molto più affidabile per stimare i Suoi acconti AVS rispetto a una cifra approssimativa digitata a memoria.',
      buttonLabel: 'Scoprire la redditività per cantiere',
    },
  ],
  faq: [
    {
      question: 'A partire da quale età un indipendente deve versare contributi all’AVS/AI?',
      answer:
        'Dai 18 anni compiuti, l’affiliazione all’AVS/AI/IPG è obbligatoria per chiunque eserciti un’attività lucrativa indipendente in Svizzera.',
    },
    {
      question: 'L’aliquota di contribuzione AVS/AI è la stessa per tutti gli indipendenti?',
      answer:
        'No: è degressiva sotto un reddito annuo di circa CHF 60’500 (barema ridotto), poi raggiunge un’aliquota piena di circa il 10% del reddito netto oltre questa soglia.',
    },
    {
      question: 'Bisogna versare contributi anche senza utile in un dato anno?',
      answer:
        'Sì, un contributo minimo annuo resta dovuto anche con reddito molto basso o nullo, al fine di preservare la continuità dei diritti (rendita AVS, copertura AI).',
    },
  ],
  relatedSlugs: [
    'lpp-deuxieme-pilier-independant-batiment',
    'calculer-heures-travail-ouvrier-minutes-decimales',
    'sous-traitant-batiment-suisse-contrat-facturation',
  ],
};
