import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'resiliation-contrat-entreprise-chantier-en-cours',
  question: 'Un cliente può risolvere un contratto d’appalto a cantiere in corso, e a quale prezzo?',
  title: 'Risoluzione di un contratto d’appalto a cantiere in corso: cosa dice l’art. 377 CO',
  description:
    'Un committente può risolvere un contratto d’appalto in qualsiasi momento, anche a cantiere pieno, ma l’art. 377 CO gli impone di indennizzarvi integralmente. Ecco come.',
  excerpt:
    'Un cliente può fermare un cantiere dall’oggi al domani, senza colpa da parte vostra. La legge non lo impedisce, ma vi protegge finanziariamente, a condizione di saper quantificare correttamente.',
  category: 'Juridique & normes',
  keywords: ['risoluzione contratto cantiere', 'art 377 CO', 'arresto cantiere', 'indennizzo imprenditore', 'contratto d’appalto'],
  publishedAt: '2026-08-27',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'È una situazione che destabilizza molti artigiani: un cliente annuncia che ferma il cantiere, senza rimprovero particolare sul lavoro svolto. Prima reazione, spesso sbagliata: pensare che un contratto firmato non possa essere sciolto unilateralmente. Nel diritto svizzero, invece sì, ed è persino esplicitamente previsto dalla legge.',
    },
    { type: 'h2', text: 'L’art. 377 CO: una risoluzione possibile in qualsiasi momento' },
    {
      type: 'p',
      text: 'L’articolo 377 del Codice delle obbligazioni autorizza il committente a risolvere il contratto in ogni momento, finché l’opera non è terminata, senza dover giustificare un motivo né una colpa dell’imprenditore. Questo diritto esiste proprio perché la contropartita è chiara: il cliente che lo esercita deve indennizzare l’imprenditore per l’intero danno causato da questo arresto.',
    },
    {
      type: 'callout',
      title: 'L’indennizzo non si limita al lavoro già svolto',
      text: 'L’art. 377 CO prevede il rimborso delle spese sostenute, la remunerazione del lavoro già eseguito, e il guadagno mancato che l’imprenditore avrebbe realizzato se il cantiere fosse arrivato al termine, deduzione fatta di quanto risparmiato non dovendolo terminare.',
    },
    { type: 'h2', text: 'Cosa bisogna poter dimostrare per essere indennizzati correttamente' },
    {
      type: 'list',
      items: [
        'Il dettaglio delle ore e dei materiali già impiegati su quel cantiere precisamente, non una stima globale',
        'Il preventivo iniziale accettato, che serve da base per calcolare il mancato guadagno sulla parte non realizzata',
        'Gli ordini di materiale già effettuati (e non annullabili) al momento dell’arresto',
        'La data esatta della notifica di risoluzione, punto di partenza del calcolo',
      ],
    },
    {
      type: 'p',
      text: 'È qui che si gioca la maggior parte delle controversie: senza uno storico chiaro di ciò che è stato fatturato, quantificato o eseguito cantiere per cantiere, l’imprenditore negozia il proprio indennizzo alla cieca, e il cliente ha tutto l’interesse a minimizzarlo. Un preventivo dettagliato per voce, con un monitoraggio di ciò che è stato effettivamente fatturato su di esso, trasforma una trattativa vaga in un calcolo verificabile.',
    },
    {
      type: 'cta',
      title: 'Uno storico chiaro, cantiere per cantiere',
      text: 'Cantia collega ogni preventivo, fattura e acconto al suo cantiere. Tutto il necessario per ricostruire in pochi clic ciò che è stato impegnato e fatturato se un cliente ferma un cantiere in corso.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Un cliente può risolvere un contratto di cantiere senza motivo?',
      answer:
        'Sì, l’art. 377 CO lo permette in qualsiasi momento finché l’opera non è terminata, senza dover giustificare una colpa dell’imprenditore.',
    },
    {
      question: 'Cosa deve pagare il cliente che risolve un cantiere in corso?',
      answer:
        'Il lavoro già eseguito, le spese sostenute, e il guadagno mancato sulla parte non realizzata, deduzione fatta dei risparmi realizzati dall’imprenditore non dovendo terminare.',
    },
    {
      question: 'Serve un motivo scritto perché la risoluzione sia valida?',
      answer:
        'No, la legge non richiede una giustificazione, ma una notifica chiara e datata fissa il punto di partenza del calcolo dell’indennizzo.',
    },
  ],
  relatedSlugs: [
    'client-refuse-payer-solde-final-que-faire',
    'validite-devis-signe-prix-qui-bouge',
    'defaut-construction-decouvert-apres-reception-qui-paie',
  ],
};
