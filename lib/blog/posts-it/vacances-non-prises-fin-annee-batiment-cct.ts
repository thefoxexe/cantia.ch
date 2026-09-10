import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'vacances-non-prises-fin-annee-batiment-cct',
  question: 'Cosa fare dei giorni di vacanza non presi da un dipendente edile a fine anno?',
  title: 'Vacanze non prese a fine anno nell’edilizia: riporto, pagamento o perdita?',
  description:
    'Il saldo di vacanze non prese pone una vera questione di tesoreria e di diritto del lavoro per le imprese edili: ecco le regole da conoscere prima di decidere.',
  excerpt:
    'Un saldo di vacanze che si accumula di anno in anno non è mai banale: o rappresenta un debito verso il dipendente, o rivela un problema organizzativo destinato a ripetersi.',
  category: 'RH & salaires',
  keywords: ['vacanze non prese', 'saldo vacanze dipendente', 'diritto del lavoro edilizia', 'CCL costruzione vacanze', 'gestione RH cantiere'],
  publishedAt: '2026-07-31',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Il principio di base del diritto svizzero è chiaro: le vacanze devono essere godute in natura e non possono in linea di principio essere sostituite da una prestazione in denaro finché dura il rapporto di lavoro (art. 329d CO). Un datore di lavoro che «paga» sistematicamente le vacanze non prese invece di farle prendere corre un rischio giuridico, anche se la prassi resta diffusa in alcune piccole strutture.',
    },
    { type: 'h2', text: 'Perché la compensazione in denaro è rischiosa' },
    {
      type: 'p',
      text: 'Il pagamento in contanti delle vacanze durante il contratto è ammesso solo in casi molto limitati, tipicamente un impiego di breve durata o irregolare in cui il riposo effettivo non è praticabile. Per un dipendente in posizione stabile nell’edilizia, questa non è in linea di principio la regola, e un controllo successivo può riqualificare questi pagamenti ed esigere comunque che i giorni siano effettivamente presi o compensati.',
    },
    {
      type: 'list',
      items: [
        'Il riporto da un anno all’altro è possibile se resta ragionevole e non si accumula indefinitamente',
        'Il datore di lavoro ha il diritto di fissare la data delle vacanze tenendo conto dei desideri del dipendente, nella misura compatibile con l’azienda',
        'Alla fine del rapporto di lavoro, il saldo non preso deve essere pagato, questa volta in denaro',
        'Un CCL settoriale può fissare regole complementari sul riporto o sulla pianificazione',
      ],
    },
    {
      type: 'callout',
      title: 'La vera posta in gioco operativa: pianificare le vacanze prima di fine anno',
      text: 'Un saldo che esplode a dicembre traduce spesso una mancanza di visibilità sul planning di cantiere. Il datore di lavoro esita a liberare personale per paura di ritardare i lavori in corso.',
    },
    {
      type: 'cta',
      title: 'Un planning di squadra che anticipa le assenze',
      text: 'Il modulo Planning di Cantia offre una vista chiara dei cantieri in corso e del team disponibile. Quanto basta per pianificare le vacanze senza ritrovarsi a corto di manodopera in piena stagione.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Si possono pagare le vacanze non prese invece di farle prendere?',
      answer:
        'Salvo casi particolari come un impiego di breve durata, la risposta è no finché dura il rapporto di lavoro. Il pagamento in denaro diventa la regola solo alla fine del contratto.',
    },
    {
      question: 'Un dipendente può riportare le sue vacanze sull’anno successivo?',
      answer:
        'Sì, entro una misura ragionevole, ma un saldo che si accumula indefinitamente di anno in anno non è conforme allo spirito della legge, che vuole un riposo effettivo regolare.',
    },
    {
      question: 'Chi decide la data delle vacanze: il datore di lavoro o il dipendente?',
      answer:
        'Il datore di lavoro fissa la data tenendo conto dei desideri del dipendente nella misura compatibile con le esigenze dell’azienda. Non è un diritto unilaterale dell’uno o dell’altro.',
    },
  ],
  relatedSlugs: [
    'licenciement-ouvrier-batiment-delai-conge-cct',
    'calculer-13e-salaire-prorata-employe',
    'gerer-plusieurs-chantiers-en-parallele-methode',
  ],
};
