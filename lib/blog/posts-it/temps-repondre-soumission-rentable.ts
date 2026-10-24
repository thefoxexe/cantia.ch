import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'temps-repondre-soumission-rentable',
  question: 'Quanto tempo dedicare a un capitolato, e quando dire di no?',
  title: 'Quanto costa un capitolato alla vostra impresa, e quando non rispondere',
  description:
    'Ore di calcolo, tasso di successo, costo reale di un appalto vinto: un calcolo semplice per decidere a quali capitolati rispondere e come dedicarvi meno tempo.',
  excerpt:
    'Se vincete un capitolato su cinque e ognuno vi prende una serata, ogni appalto vinto vi è costato cinque serate. Il calcolo merita di essere fatto.',
  category: 'Croissance & acquisition',
  keywords: ['tempo calcolo capitolato', 'tasso di successo offerte', 'rispondere capitolato redditizio', 'costo di un’offerta edilizia'],
  publishedAt: '2026-10-24',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Rispondere a un capitolato è lavoro non pagato: leggere l’incarto, a volte visitare il luogo, calcolare, controllare, consegnare. Lo si fa perché servono cantieri. Ma poche imprese calcolano quanto costa loro davvero un appalto vinto.',
    },
    { type: 'h2', text: 'Il calcolo' },
    {
      type: 'table',
      headers: ['Dato', 'Esempio'],
      rows: [
        ['Ore per capitolato (lettura, calcolo, controllo)', '6 h'],
        ['Costo orario di chi calcola', 'CHF 90.–'],
        ['Costo di un capitolato', 'CHF 540.–'],
        ['Tasso di successo', '1 su 5'],
        ['Costo di calcolo per appalto vinto', 'CHF 2’700.–'],
      ],
    },
    {
      type: 'p',
      text: 'Questi CHF 2’700.– devono essere coperti dal margine del cantiere vinto. Su un piccolo appalto possono mangiarlo tutto.',
    },
    { type: 'h2', text: 'Quando non rispondere' },
    {
      type: 'list',
      items: [
        'Il cantiere supera la vostra capacità nelle date previste: non potrete rispettare i termini.',
        'Le condizioni particolari (penali, garanzie, termini di pagamento) sono inaccettabili per la vostra liquidità.',
        'Non avete alcuna possibilità realistica: troppo lontano, mestiere sbagliato, committente che sceglie sempre lo stesso.',
        'L’incarto arriva troppo tardi per essere calcolato seriamente: un’offerta raffazzonata è peggio di un’assenza.',
      ],
    },
    {
      type: 'callout',
      title: 'Dire di no con garbo lascia la porta aperta',
      text: 'Un breve messaggio all’architetto («nessuna capacità in questo periodo, consultateci per i prossimi») vale più di un silenzio o di un’offerta volutamente cara.',
    },
    { type: 'h2', text: 'Ridurre il tempo per capitolato' },
    {
      type: 'list',
      items: [
        'Tenere un catalogo prezzi per numero di posizione e aggiornarlo dopo ogni cantiere.',
        'Non ricopiare più le posizioni: partire dal documento ricevuto.',
        'Far calcolare importi, riporti e totali invece di verificarli a mano.',
        'Tenere pronto un modello di lettera d’accompagnamento e l’elenco degli allegati abituali.',
      ],
    },
    {
      type: 'p',
      text: 'È il principio della funzione «Compilare un capitolato» di Cantia, in beta: il PDF ricevuto viene importato, i vostri prezzi vengono proposti, voi adattate e il PDF originale esce compilato. 1 di prova con Essenziale, 3 al mese con Team, illimitata con Entreprise.',
    },
    {
      type: 'cta',
      title: 'Meno tempo sui vostri capitolati',
      text: 'Importate il PDF ricevuto, calcolate da tastiera, rimandate il documento compilato.',
      buttonLabel: 'Provare 14 giorni',
    },
  ],
  faq: [
    {
      question: 'Qual è un buon tasso di successo sui capitolati?',
      answer: 'Dipende dal mestiere, dalla regione e dal tipo di appalto. L’importante è conoscere il vostro e seguirlo nel tempo, per sapere dove vincete.',
    },
    {
      question: 'Si può fatturare il calcolo di un capitolato?',
      answer: 'Di regola no, la risposta a un capitolato è gratuita. Uno studio o un progetto chiesto in più può essere oggetto di un accordo separato, da concordare prima.',
    },
    {
      question: 'Come sapere perché si è perso un appalto?',
      answer: 'Chiedete il risultato e, se possibile, la vostra posizione in classifica. In un appalto pubblico l’aggiudicazione viene comunicata e può essere motivata; in un appalto privato spesso basta una telefonata all’architetto.',
    },
  ],
  relatedSlugs: ['remplir-soumission-pdf-architecte', 'calculer-prix-unitaire-soumission', 'chantier-complet-peut-etre-en-perte-taux-horaire'],
};
