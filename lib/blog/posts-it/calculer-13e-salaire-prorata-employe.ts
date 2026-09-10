import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'calculer-13e-salaire-prorata-employe',
  question: 'Come si calcola la tredicesima al pro rata per un dipendente assunto durante l’anno?',
  title: 'Calcolare la tredicesima al pro rata durante l’anno',
  description:
    'Un dipendente assunto ad aprile non ha diritto a una tredicesima completa a dicembre. Il calcolo al pro rata si basa sui mesi effettivamente lavorati, premi e assenze compresi.',
  excerpt:
    'Un operaio assunto il 1° aprile non riceve una tredicesima completa a dicembre. Resta però da sapere esattamente su quali mesi si calcola, e cosa la riduce.',
  category: 'RH & salaires',
  keywords: ['tredicesima', 'pro rata', 'calcolo salario', 'assunzione in corso d’anno', 'partenza dipendente'],
  publishedAt: '2026-04-02',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Un operaio assunto il 1° aprile, licenziato o dimessosi il 30 settembre: quanto gli è dovuto a titolo di tredicesima? La risposta sta in una formula semplice, ma gli errori più frequenti derivano da ciò che si include (o non si include) nel calcolo.',
    },
    { type: 'h2', text: 'La formula di base' },
    {
      type: 'p',
      text: 'La tredicesima al pro rata si calcola così: (numero di mesi lavorati nell’anno ÷ 12) × importo della tredicesima completa. Un dipendente che ha lavorato 6 mesi completi in un anno ha diritto alla metà di una tredicesima, non a un mese di salario arbitrario calcolato diversamente.',
    },
    {
      type: 'table',
      headers: ['Situazione', 'Mesi lavorati', 'Frazione della tredicesima'],
      rows: [
        ['Dipendente per tutto l’anno', '12', '12/12 = 100 %'],
        ['Assunzione il 1° aprile', '9', '9/12 = 75 %'],
        ['Partenza il 30 settembre', '9', '9/12 = 75 %'],
        ['Contratto di 3 mesi (interinale/stagionale)', '3', '3/12 = 25 %'],
      ],
    },
    {
      type: 'callout',
      title: 'Il dettaglio che falsa il calcolo: i mesi incompleti',
      text: 'Un dipendente assunto il 15 del mese non ha in linea di principio diritto a un mese completo nel calcolo: la maggior parte dei contratti e degli usi applica una regola proporzionale al numero di giorni lavorati in quel mese, piuttosto che arrotondare sistematicamente al mese intero. Il contratto di lavoro o il CCL applicabile precisa generalmente il metodo esatto da seguire.',
    },
    { type: 'h2', text: 'Cosa può ridurre la tredicesima' },
    {
      type: 'list',
      items: [
        'Un’assenza prolungata non retribuita (ad esempio un congedo non pagato) riduce generalmente il pro rata sul periodo interessato',
        'Un’assenza per malattia o infortunio di lunga durata può avere un trattamento diverso a seconda del contratto e delle assicurazioni per perdita di guadagno applicabili',
        'Un cambiamento del tasso di attività durante l’anno (passaggio a tempo parziale) deve riflettersi proporzionalmente sul periodo interessato',
      ],
    },
    { type: 'h2', text: 'Il vero rischio: dimenticarla al momento della partenza' },
    {
      type: 'p',
      text: 'La tredicesima al pro rata dovuta in caso di partenza durante l’anno viene regolarmente dimenticata nel conteggio finale, soprattutto quando la partenza è gestita con urgenza. È un credito del dipendente, non un gesto facoltativo. Ometterla espone quindi a una richiesta di pagamento, spesso ben dopo la partenza effettiva.',
    },
    {
      type: 'cta',
      title: 'I salari del team, calcolati correttamente',
      text: 'Il modulo RH & Salaires di Cantia calcola il salario netto a partire dalle ore e dai tassi configurati per dipendente, il che lo rende una base più affidabile di un calcolo rifatto a mano a ogni partenza.',
      buttonLabel: 'Scoprire RH & Salaires',
    },
  ],
  faq: [
    {
      question: 'Come si calcola una tredicesima per un dipendente assunto durante l’anno?',
      answer:
        'Moltiplicando l’importo della tredicesima completa per il numero di mesi effettivamente lavorati diviso per 12: un dipendente presente 9 mesi su 12 ha diritto al 75 % di una tredicesima completa.',
    },
    {
      question: 'Un dipendente che se ne va durante l’anno ha diritto a una tredicesima al pro rata?',
      answer:
        'Sì, è un credito dovuto al momento della partenza, calcolato sui mesi effettivamente lavorati. Deve figurare nel conteggio finale del salario.',
    },
    {
      question: 'Un’assenza per malattia riduce la tredicesima al pro rata?',
      answer:
        'Dipende dal contratto di lavoro e dal contratto collettivo applicabile. Un’assenza prolungata non retribuita riduce generalmente il pro rata, ma il trattamento esatto varia a seconda dei casi.',
    },
  ],
  relatedSlugs: [
    'salaire-minimum-cct-construction-suisse',
    'heures-supplementaires-batiment-majoration-25',
    'avs-ai-independant-batiment',
  ],
};
