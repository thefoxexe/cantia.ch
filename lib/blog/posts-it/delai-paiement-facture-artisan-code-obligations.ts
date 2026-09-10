import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'delai-paiement-facture-artisan-code-obligations',
  question: 'Qual è il termine di pagamento legale di una fattura di un artigiano in Svizzera?',
  title: 'Termine di pagamento di una fattura di un artigiano in Svizzera: cosa dice la legge?',
  description:
    'Il Codice delle obbligazioni non fissa un termine di pagamento legale fisso: 30 giorni è la prassi, ma tutto dipende da ciò che figura sulla Sua fattura. Spiegazioni e modello di clausola.',
  excerpt:
    'Un cliente che paga a 60 giorni non è necessariamente in torto. In Svizzera, il termine di pagamento esiste solo se Lei stesso lo ha scritto sulla fattura.',
  category: 'Juridique & normes',
  keywords: ['termine di pagamento', 'fattura', 'interesse di mora', 'codice delle obbligazioni', 'sollecito'],
  publishedAt: '2026-01-22',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Un cliente che paga 60 giorni dopo il ricevimento di una fattura è per questo in torto? La risposta dipende quasi interamente da una riga che la maggior parte degli imprenditori dimentica di scrivere, perché in Svizzera, a differenza dell’Unione Europea, nessun termine di pagamento legale fisso è imposto alle imprese edili.',
    },
    { type: 'h2', text: 'Cosa dice davvero il Codice delle obbligazioni' },
    {
      type: 'p',
      text: 'Non esiste un numero di giorni predefinito. In assenza di un termine precisato, l’art. 75 CO prevede che il credito sia esigibile immediatamente: il cliente dovrebbe pagare senza indugio. Nella prassi edile, 30 giorni è la norma d’uso, ma ha valore giuridico solo se scritta esplicitamente sulla fattura o sul preventivo accettato.',
    },
    {
      type: 'callout',
      title: 'Il punto che costa più caro ignorare',
      text: 'Una fattura senza scadenza scritta è in teoria pagabile immediatamente, ma in pratica quasi impossibile da far rispettare, per mancanza di una data di riferimento chiara per calcolare un ritardo. Una scadenza precisa non è quindi una semplice formalità: è ciò che rende esigibile un ritardo.',
    },
    { type: 'h2', text: 'Cosa succede una volta superata la scadenza' },
    {
      type: 'list',
      items: [
        'Il debitore è automaticamente in mora non appena la scadenza convenuta è superata (art. 102 cpv. 2 CO), senza che sia necessario un sollecito formale se era indicata una data',
        'Un interesse di mora del 5% annuo può essere richiesto di pieno diritto (art. 104 CO), senza doverlo aver menzionato in anticipo',
        'Senza scadenza scritta, è dapprima necessaria un’intimazione per far decorrere questo termine, il che sottolinea l’interesse di datare sempre con precisione',
      ],
    },
    { type: 'h2', text: 'Cosa scrivere davvero su una fattura' },
    {
      type: 'list',
      items: [
        'Una scadenza precisa: «Pagabile entro il 15.03.2026» piuttosto che un vago «pagabile a 30 giorni»',
        'Il richiamo dell’interesse di mora applicabile in caso di ritardo, a titolo dissuasivo',
        'Un sollecito scritto già a partire dal giorno successivo alla scadenza superata, prima che la pratica si impantani',
        'Un numero di riferimento QR per identificare immediatamente un pagamento ricevuto, per non sollecitare mai per errore un cliente che ha già pagato',
      ],
    },
    {
      type: 'p',
      text: 'In pratica, la difficoltà non è quasi mai giuridica. È logistica: sapere in tempo reale quali fatture restano in sospeso, senza dover confrontare a mano un estratto conto bancario con un elenco di fatture inviate tre mesi prima.',
    },
    {
      type: 'cta',
      title: 'Le scadenze, visibili senza cercarle',
      text: 'Cantia mostra in un colpo d’occhio le fatture in attesa, scadute o in ritardo, e riconcilia ogni pagamento ricevuto alla sua fattura grazie al riferimento QR.',
      buttonLabel: 'Vedere il modulo Fatturazione',
    },
  ],
  faq: [
    {
      question: 'La Svizzera impone un termine di pagamento legale di 30 giorni?',
      answer:
        'No, a differenza di alcuni paesi dell’UE. Il Codice delle obbligazioni non fissa un termine predefinito; 30 giorni è una prassi comune ma deve essere esplicitamente menzionata sulla fattura per avere un valore contrattuale chiaro.',
    },
    {
      question: 'Si possono richiedere interessi di ritardo senza averli menzionati sulla fattura?',
      answer:
        'Sì. L’interesse di mora del 5% annuo previsto dall’art. 104 CO si applica di pieno diritto non appena il debitore è in mora, sia stato menzionato sulla fattura o meno.',
    },
    {
      question: 'Cosa fare se una fattura non precisa alcuna scadenza?',
      answer:
        'Il credito è in linea di principio esigibile immediatamente, ma è consigliabile inviare una diffida scritta con una scadenza chiara per poter poi far decorrere un ritardo e richiedere interessi di mora.',
    },
  ],
  relatedSlugs: [
    'qr-facture-obligatoire-2026',
    'duree-conservation-devis-factures-suisse',
    'norme-sia-118-devis-obligatoire',
  ],
};
