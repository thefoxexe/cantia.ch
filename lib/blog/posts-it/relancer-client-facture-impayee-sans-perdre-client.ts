import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'relancer-client-facture-impayee-sans-perdre-client',
  question: 'Come sollecitare un cliente che non paga la fattura senza inimicarselo?',
  title: 'Sollecitare un cliente che non paga, senza perdere il cliente',
  description:
    'La maggior parte dei ritardi di pagamento non è malafede. Un metodo di sollecito in tre fasi che recupera il denaro senza rompere il rapporto.',
  excerpt:
    'La maggioranza delle fatture in ritardo non lo è per malafede, sono semplicemente finite in una pila. Il sollecito efficace parte da questa ipotesi, non dal contrario.',
  category: 'Devis & facturation',
  keywords: ['sollecito fattura', 'insoluto', 'recupero crediti', 'cliente che non paga', 'diffida'],
  publishedAt: '2026-02-26',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Una fattura in ritardo di dieci giorni non è quasi mai un segnale di insolvenza. È piuttosto il segno che è finita in una pila di posta, in un’email sommersa, o in un bonifico messo in attesa e poi dimenticato. Trattare ogni ritardo come uno scontro fin dal primo giorno danneggia rapporti che non avevano nulla di conflittuale.',
    },
    { type: 'h2', text: 'Tre fasi, non un solo tono' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Promemoria neutro, dal giorno successivo alla scadenza: «Un piccolo promemoria, la fattura n°XXX è giunta a scadenza, è riuscito a occuparsene?», senza alcuna accusa, solo un segnale',
        'Sollecito fermo, una settimana dopo: richiamo della scadenza superata, menzione esplicita dell’interesse di mora applicabile (5% annuo secondo l’art. 104 CO), richiesta di un termine di pagamento preciso',
        'Diffida formale, scritta, con un ultimo termine chiaro: la fase che prepara, se necessario, una procedura esecutiva',
      ],
    },
    {
      type: 'callout',
      title: 'Il dettaglio che cambia tutto: non sollecitare mai un cliente che ha già pagato',
      text: 'Niente danneggia di più un rapporto quanto un sollecito inviato a un cliente che ha pagato tre giorni prima. È il modo migliore per trasformare una semplice dimenticanza in una vera tensione, eppure è evitabile fin quando ogni pagamento ricevuto viene riconciliato automaticamente alla sua fattura tramite il riferimento QR, senza dipendere da una verifica manuale dell’estratto conto.',
    },
    { type: 'h2', text: 'Cosa funziona meglio di un tono duro' },
    {
      type: 'p',
      text: 'Proporre un piano di pagamento rateale spesso sblocca situazioni che un sollecito secco insabbia. Un cliente in vera difficoltà di liquidità che si sente ascoltato generalmente paga più in fretta di un cliente messo sotto accusa. Il sollecito non ha lo scopo di stabilire chi ha ragione; ha lo scopo di far rientrare il denaro il più velocemente possibile senza perdere il cliente per il prossimo cantiere.',
    },
    {
      type: 'p',
      text: 'E per i casi che vanno oltre il semplice sollecito (un cliente durevolmente irraggiungibile, un importo rilevante, un rifiuto esplicito di pagare), la questione cambia natura: è lì che bisogna valutare seriamente una procedura esecutiva, con i suoi propri costi e termini da conoscere prima di intraprenderla.',
    },
    {
      type: 'cta',
      title: 'Sapere chi deve cosa, senza cercare',
      text: 'La dashboard di fatturazione di Cantia mostra in un colpo d’occhio le fatture in attesa, scadute o in ritardo, e riconcilia ogni pagamento ricevuto tramite riferimento QR, senza solleciti inviati per errore.',
      buttonLabel: 'Vedere il modulo Fatturazione',
    },
  ],
  faq: [
    {
      question: 'Quanto tempo aspettare prima di sollecitare una fattura insoluta?',
      answer:
        'Un primo promemoria neutro fin dal giorno successivo alla scadenza superata è ragionevole. Non deve essere formale, solo presente, prima di un sollecito più fermo una settimana dopo se nulla si muove.',
    },
    {
      question: 'Bisogna menzionare l’interesse di mora già nel primo sollecito?',
      answer:
        'Meglio riservarlo al sollecito fermo (seconda fase): menzionarlo già nel primo promemoria neutro può dare un tono accusatorio inutile per una semplice dimenticanza.',
    },
    {
      question: 'Un piano di pagamento rateale indebolisce la posizione dell’azienda?',
      answer:
        'No, a condizione che sia formalizzato per iscritto con date precise: spesso sblocca una situazione più in fretta di un sollecito secco, senza rinunciare al diritto di reclamare il saldo in caso di mancato rispetto.',
    },
  ],
  relatedSlugs: [
    'delai-paiement-facture-artisan-code-obligations',
    'facturer-acompte-suisse-securiser-solde',
    'qr-facture-obligatoire-2026',
  ],
};
