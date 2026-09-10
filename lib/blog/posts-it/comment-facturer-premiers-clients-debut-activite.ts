import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'comment-facturer-premiers-clients-debut-activite',
  question: 'Come fatturare correttamente ai primi clienti quando si avvia un’attività?',
  title: 'Fatturare ai primi clienti: i giusti riflessi fin dal primo documento',
  description:
    'La prima fattura dà il tono a tutte quelle che seguiranno. I punti da verificare prima di inviarla, per partire con basi solide fin dall’inizio dell’attività.',
  excerpt:
    'La primissima fattura inviata conta più di quanto sembri. È spesso lei a determinare se un cliente agli esordi paga rapidamente e senza discutere, oppure tira per le lunghe.',
  category: 'Comparatifs & outils',
  keywords: ['fatturare primi clienti', 'prima fattura indipendente', 'iniziare fatturazione attività', 'fattura conforme principiante Svizzera', 'consigli prima fatturazione'],
  publishedAt: '2026-07-26',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'La prima fattura inviata a un cliente segna spesso una tappa simbolica in una nuova attività, ma ha anche un peso pratico reale: un documento professionale e conforme fin dall’inizio instaura un rapporto di fiducia, mentre un documento approssimativo insinua il dubbio.',
    },
    { type: 'h2', text: 'Ciò che non bisogna mai dimenticare su una prima fattura' },
    {
      type: 'list',
      items: [
        'Un numero di fattura sequenziale e senza salti, fin dal primo documento',
        'L’aliquota IVA applicabile, oppure un’indicazione chiara di non assoggettamento se è il caso',
        'Coordinate bancarie esatte, idealmente con un riferimento di pagamento fattura QR',
        'Un termine di pagamento chiaramente indicato, non solo sottinteso',
      ],
    },
    {
      type: 'stat',
      value: '30 giorni',
      label: 'termine di pagamento standard generalmente applicato in Svizzera per una prima fattura, salvo accordo diverso esplicitamente indicato',
    },
    { type: 'h2', text: 'Fatturare rapidamente dopo la fine del lavoro, non settimane dopo' },
    {
      type: 'p',
      text: 'Un cliente ricorda ancora chiaramente il lavoro svolto e la propria soddisfazione subito dopo la fine del cantiere. Una fattura inviata rapidamente si contesta quindi molto meno di una fattura arrivata tre settimane dopo, quando il ricordo è più sfumato.',
    },
    {
      type: 'callout',
      title: 'Uno strumento che applica automaticamente le regole corrette evita l’errore da principianti',
      text: 'Numerazione, IVA, indicazioni obbligatorie: un software di fatturazione le gestisce automaticamente, evitando così l’errore classico del primissimo documento fatto "a mano".',
    },
    {
      type: 'cta',
      title: 'Una fattura conforme fin dal primo invio',
      text: 'Cantia applica automaticamente numerazione, IVA e fattura QR svizzera: anche la primissima fattura ne esce impeccabile.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Quali indicazioni non devono mai mancare su una prima fattura?',
      answer:
        'Un numero sequenziale, l’aliquota IVA applicabile (o un’indicazione di non assoggettamento), coordinate bancarie esatte e un termine di pagamento chiaro.',
    },
    {
      question: 'Quanto tempo dopo la fine del cantiere bisogna inviare la fattura?',
      answer:
        'Il più rapidamente possibile, perché un cliente ricorda ancora chiaramente il lavoro svolto subito dopo, il che riduce il rischio di contestazione rispetto a una fattura inviata settimane dopo.',
    },
    {
      question: 'Un software di fatturazione aiuta a evitare gli errori da principianti?',
      answer:
        'Sì: applica automaticamente la numerazione, l’IVA e le indicazioni obbligatorie, evitando le dimenticanze frequenti su una fattura fatta manualmente.',
    },
  ],
  relatedSlugs: [
    'mentions-obligatoires-facture-suisse-tva',
    'vitesse-reponse-devis-taux-conversion-batiment',
    'logiciel-facturation-raison-individuelle-suisse',
  ],
};
