import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'etablir-certificat-salaire-lohnausweis-premier-employe',
  question: 'Come si allestisce il certificato di salario per il primo dipendente nell’edilizia?',
  title: 'Certificato di salario: come allestirlo per il primo dipendente',
  description:
    'Il certificato di salario annuale spiegato a un datore di lavoro edile che assume il primo dipendente: contenuto obbligatorio, modulo ufficiale, termine e dichiarazione d’imposta.',
  excerpt:
    'È un obbligo annuale che arriva spesso nel momento peggiore, in pieno inverno, quando i cantieri rallentano già. Ecco cosa deve contenere il certificato e come allestirlo senza errori.',
  category: 'RH & salaires',
  keywords: [
    'certificato di salario primo dipendente',
    'certificato di salario impresa edile',
    'allestire certificato di salario svizzera',
    'modulo ufficiale certificato di salario',
    'veicolo aziendale certificato di salario',
  ],
  publishedAt: '2026-09-22',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Assumere il primo dipendente cambia molto l’amministrazione quotidiana di un’impresa edile, e uno degli obblighi meno visibili all’inizio è il certificato di salario, ogni anno, per ogni dipendente. È un documento standardizzato a livello svizzero, non un attestato fatto in casa, e determina direttamente la dichiarazione d’imposta del dipendente.',
    },
    { type: 'h2', text: 'Perché il documento è obbligatorio ogni anno' },
    {
      type: 'p',
      text: 'Ogni datore di lavoro deve allestire un certificato di salario annuale per ogni persona impiegata durante l’anno civile, che il contratto sia durato tutto l’anno o solo qualche mese. Il dipendente ne ha bisogno per la propria dichiarazione d’imposta, e l’amministrazione fiscale lo usa per verificare la coerenza tra quanto dichiarato dal datore di lavoro e quanto dichiarato dal dipendente.',
    },
    { type: 'h2', text: 'Cosa deve contenere il certificato' },
    {
      type: 'list',
      items: [
        'Il salario lordo annuo totale, compresi eventuali premi, la tredicesima e le indennità regolari.',
        'Le deduzioni sociali operate (AVS/AI/IPG, assicurazione contro la disoccupazione, LPP, eventualmente assicurazione contro gli infortuni non professionali).',
        'Le prestazioni in natura, nell’edilizia soprattutto l’uso privato di un veicolo aziendale, da valutare e aggiungere al salario determinante.',
        'Le spese professionali rimborsate separatamente, che seguono regole di dichiarazione diverse dal salario vero e proprio.',
      ],
    },
    { type: 'h2', text: 'Il modulo ufficiale e il termine' },
    {
      type: 'p',
      text: 'Il certificato di salario segue un modello ufficiale standardizzato, riconosciuto in tutta la Svizzera, disponibile nei programmi di contabilità e di gestione dei salari o direttamente presso l’amministrazione fiscale cantonale. Va consegnato al dipendente di solito all’inizio dell’anno successivo, prima che debba allegarlo alla propria dichiarazione d’imposta. Chi lascia l’impresa durante l’anno riceve il certificato al momento della partenza, senza attendere la fine dell’anno civile.',
    },
    {
      type: 'callout',
      title: 'La dimenticanza più frequente: il veicolo aziendale',
      text: 'Appena un dipendente usa un veicolo dell’impresa anche per tragitti privati, pure occasionali, questo vantaggio deve figurare sul certificato di salario a un valore forfettario o effettivo. È un punto spesso dimenticato nel primo anno d’impiego e controllato regolarmente dall’amministrazione fiscale.',
    },
    {
      type: 'cta',
      title: 'I salari del primo dipendente, senza reinventare il certificato ogni inverno',
      text: 'Cantia tiene traccia dei salari e delle prestazioni in natura legate ai veicoli aziendali durante tutto l’anno, perché il certificato di salario non diventi una ricostruzione dell’ultimo minuto.',
      buttonLabel: 'Provare 14 giorni',
    },
  ],
  faq: [
    {
      question: 'Serve un certificato di salario anche per un dipendente assunto durante l’anno?',
      answer:
        'Sì, il certificato copre il periodo realmente lavorato nell’anno civile, anche se si tratta solo di qualche mese. Non esiste una durata minima d’impiego sotto la quale l’obbligo scompare.',
    },
    {
      question: 'Il certificato di salario è lo stesso documento della dichiarazione dei salari alla cassa AVS?',
      answer:
        'No, sono due documenti distinti con destinatari diversi: il certificato di salario va al dipendente per la dichiarazione d’imposta, la dichiarazione annuale dei salari va alla cassa di compensazione AVS.',
    },
    {
      question: 'Come si valuta l’uso privato di un veicolo aziendale sul certificato di salario?',
      answer:
        'In genere con un importo forfettario mensile pari a una percentuale del prezzo d’acquisto del veicolo, salvo se si tiene un conteggio effettivo più preciso. Le regole esatte vanno verificate con il fiduciario o con l’amministrazione fiscale cantonale.',
    },
  ],
  relatedSlugs: [
    'avs-ai-independant-batiment',
    'lpp-deuxieme-pilier-independant-batiment',
    'seuil-lpp-affiliation-employe-batiment',
  ],
};
