import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'calculer-heures-travail-ouvrier-minutes-decimales',
  question: 'Come calcolare ore di lavoro come "4h45" senza sbagliare in decimale?',
  title: 'Calcolare le ore di lavoro: perché 4h45 non è 4,45',
  description:
    'Un operaio che ha lavorato dalle 8 alle 12:45 ha fatto 4h45, e non 4,45 ore decimali (che varrebbe 4h27). Ecco perché questa confusione costa caro su una busta paga.',
  excerpt:
    '4h45 di lavoro non è 4,45 ore. È l’errore di inserimento RH più frequente dell’edilizia: probabilmente quello che falsa più buste paga, senza che nessuno se ne accorga.',
  category: 'RH & salaires',
  keywords: ['ore di lavoro', 'conteggio ore', 'salario orario', 'rh edilizia', 'busta paga'],
  publishedAt: '2026-02-09',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un operaio inizia alle 8:00, termina alle 12:45. Quante ore ha lavorato? «4h45» è la risposta istintiva corretta. Il problema arriva non appena bisogna digitarla in un foglio di calcolo o in un software paghe: 4h45 non è 4,45 in scrittura decimale, e questa confusione produce buste paga sbagliate senza che scatti alcun segnale d’allarme.',
    },
    { type: 'h2', text: 'La trappola del separatore' },
    {
      type: 'p',
      text: '45 minuti valgono 45/60 di ora, ossia 0,75 ore decimali. 4h45 di lavoro equivale dunque a 4,75 ore decimali, non 4,45. L’errore nasce da una confusione molto naturale: si scrive «4.45» pensando ai minuti visualizzati su un orologio, senza convertire mentalmente in centesimi di ora.',
    },
    {
      type: 'table',
      headers: ['Cosa si scrive (minuti)', 'Cosa significa', 'Equivalente decimale corretto'],
      rows: [
        ['4.15', '4h15', '4.25'],
        ['4.30', '4h30', '4.50'],
        ['4.45', '4h45', '4.75'],
        ['7.50', '7h50', '7.83'],
      ],
    },
    {
      type: 'callout',
      title: 'Perché costa davvero denaro',
      text: 'Su una busta paga mensile che cumula decine di voci, una conversione sbagliata su ogni riga fa derivare il totale di diverse ore senza che nessun errore individuale salti agli occhi. Lo stipendio versato risulta sbagliato (troppo alto o troppo basso), e nessuno sa perché i numeri non tornano più.',
    },
    { type: 'h2', text: 'Due modi affidabili per annotare una durata' },
    {
      type: 'list',
      items: [
        'Annotare sempre in ore e minuti espliciti: «4h45», mai un numero ambiguo da solo',
        'Se un campo decimale è davvero necessario, convertire sistematicamente i minuti in sessantesimi prima di digitare il numero (45 min = 0,75, mai 0,45)',
        'Il più affidabile resta inserire l’ora di inizio e l’ora di fine («8h00» a «12h45») e lasciare che il totale si calcoli automaticamente, il che elimina completamente l’errore umano',
      ],
    },
    { type: 'h2', text: 'Cosa implica per uno strumento RH per l’edilizia' },
    {
      type: 'p',
      text: 'Un buon strumento di monitoraggio ore deve accettare il modo in cui le persone scrivono naturalmente una durata («4.45» per dire 4h45), piuttosto che imporre un inserimento in decimale puro che non corrisponde a nessuna abitudine reale in cantiere. È un dettaglio di ergonomia minuscolo che evita decine di piccoli errori di paga ogni mese, mese dopo mese.',
    },
    {
      type: 'cta',
      title: 'Le ore si inseriscono come si pensano',
      text: 'Nel modulo RH & Stipendi di Cantia, «4.45» inserito nel campo Ore viene interpretato come 4h45 (mai come una frazione decimale), esattamente come i campi di inizio e fine giornata.',
      buttonLabel: 'Scoprire RH & Stipendi',
    },
  ],
  faq: [
    {
      question: 'Come convertire 4h45 di lavoro in ore decimali?',
      answer:
        '45 minuti corrispondono a 45/60 = 0,75 ore. 4h45 di lavoro equivale dunque a 4,75 ore decimali, e non a 4,45, che corrisponderebbe in realtà a 4h27.',
    },
    {
      question: 'Perché tanti errori di paga derivano dall’inserimento delle ore?',
      answer:
        'Perché il modo naturale di scrivere una durata ("4h45", digitato "4.45") assomiglia visivamente a un numero decimale, mentre le cifre dopo il separatore rappresentano minuti (base 60) e non centesimi (base 100).',
    },
    {
      question: 'Qual è il metodo più sicuro per annotare le ore di cantiere?',
      answer:
        'Inserire direttamente l’ora di inizio e l’ora di fine piuttosto che una durata totale calcolata a mano: il totale si calcola allora automaticamente, senza rischio di confusione tra minuti e decimali.',
    },
  ],
  relatedSlugs: [
    'avs-ai-independant-batiment',
    'lpp-deuxieme-pilier-independant-batiment',
    'suivre-rentabilite-chantier-sans-excel',
  ],
};
