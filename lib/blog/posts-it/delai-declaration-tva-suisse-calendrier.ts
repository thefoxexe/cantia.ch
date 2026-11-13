import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'delai-declaration-tva-suisse-calendrier',
  question: 'Quali sono i termini per il rendiconto IVA in Svizzera?',
  title: 'Rendiconto IVA in Svizzera: le scadenze da non mancare mai',
  description:
    'Il ritmo delle scadenze IVA in Svizzera secondo il metodo scelto, le conseguenze di un ritardo e come non mancare una scadenza quando si gestisce un cantiere.',
  excerpt:
    'Non è mai il calcolo a creare problemi, ma la data che passa inosservata in mezzo a un cantiere. Ecco il ritmo da conoscere e come non mancarlo più.',
  category: 'Juridique & normes',
  keywords: [
    'scadenza rendiconto IVA svizzera',
    'calendario IVA impresa edile',
    'scadenza rendiconto IVA trimestrale',
    'termine invio IVA AFC',
    'interesse di mora IVA svizzera',
  ],
  publishedAt: '2026-09-22',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'La difficoltà non è quasi mai calcolare l’IVA dovuta, ma ricordarsi la data entro cui il rendiconto va inoltrato, in mezzo a un planning di cantieri che lascia poco spazio all’amministrazione. Il ritmo dipende dal metodo di rendiconto scelto, ed è meglio fissarlo una volta per tutte in agenda che riscoprirlo ogni trimestre.',
    },
    { type: 'h2', text: 'Il ritmo secondo il metodo scelto' },
    {
      type: 'list',
      items: [
        'Metodo effettivo: rendiconto di solito trimestrale, quindi quattro scadenze per anno civile.',
        'Aliquota saldo: rendiconto di solito semestrale, quindi due scadenze all’anno.',
        'Rendiconto mensile: possibile su domanda presso l’AFC, in particolare per le imprese che preferiscono distribuire la liquidità invece di accantonare un importo maggiore ogni tre mesi.',
      ],
    },
    { type: 'h2', text: 'Il termine abituale dopo la fine di ogni periodo' },
    {
      type: 'p',
      text: 'Il rendiconto va di solito inoltrato entro 60 giorni dalla fine del periodo interessato (trimestre, semestre o mese secondo il ritmo scelto). È un’indicazione abituale, non una regola immutabile: fa stato la data indicata sul portale dell’AFC per ogni impresa, ed è quella da seguire, non una stima approssimativa.',
    },
    { type: 'h2', text: 'Quanto costa un rendiconto in ritardo' },
    {
      type: 'p',
      text: 'Un rendiconto inoltrato dopo la scadenza comporta di solito un interesse di mora sull’importo dovuto, calcolato dalla data di scadenza e non da quella dell’inoltro effettivo. Il costo si applica anche se l’importo dichiarato è esatto: un rendiconto stimato inoltrato in tempo e poi corretto costa spesso meno di un rendiconto perfetto inoltrato in ritardo.',
    },
    {
      type: 'callout',
      title: 'Il riflesso giusto: un promemoria fin dall’iscrizione all’IVA',
      text: 'Appena attribuito il numero IVA, conviene segnare in agenda le quattro (o due) scadenze dell’anno, con un promemoria una o due settimane prima di ognuna. È l’unico modo affidabile per non mancare una data in mezzo a un cantiere impegnativo.',
    },
    {
      type: 'cta',
      title: 'Non scoprire più la scadenza IVA il giorno stesso',
      text: 'Cantia offre una visione d’insieme su fatture e cantieri in corso, perché la preparazione del rendiconto IVA non sia mai una sorpresa dell’ultimo minuto.',
      buttonLabel: 'Provare 14 giorni',
    },
  ],
  faq: [
    {
      question: 'Cosa fare se si sa già di non poter rispettare la scadenza IVA?',
      answer:
        'Prima della scadenza si può chiedere una proroga del termine all’AFC. Così si evita l’interesse di mora automatico legato a un ritardo non annunciato.',
    },
    {
      question: 'Il rendiconto mensile è interessante per una piccola impresa edile?',
      answer:
        'Può esserlo per distribuire la liquidità ed evitare di accantonare un grosso importo trimestrale, ma moltiplica anche le pratiche amministrative nell’anno. È una scelta da fare secondo la dimensione del servizio contabile.',
    },
    {
      question: 'L’interesse di mora si applica anche per pochi giorni di ritardo?',
      answer:
        'Sì, l’interesse di mora si calcola di solito dal giorno dopo la scadenza, senza giorni di tolleranza automatici. Meglio anticipare che contare su un margine.',
    },
  ],
  relatedSlugs: [
    'declaration-tva-trimestrielle-artisan-suisse',
    'tva-methode-effective-ou-tdfn-batiment',
    'mentions-obligatoires-facture-suisse-tva',
  ],
};
