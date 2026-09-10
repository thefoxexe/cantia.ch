import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'difference-devis-offre-facture-pro-forma',
  question: 'Qual è la differenza tra un preventivo, un’offerta e una fattura proforma?',
  title: 'Preventivo, offerta, fattura proforma: tre parole, tre usi diversi',
  description:
    'I tre termini si usano spesso l’uno al posto dell’altro nell’edilizia svizzera, anche se non impegnano allo stesso modo. Un punto rapido per non confonderli più.',
  excerpt:
    '«Offerta», «preventivo», «fattura proforma»: tre documenti spesso usati come sinonimi, mentre non hanno né lo stesso valore né lo stesso uso.',
  category: 'Devis & facturation',
  keywords: ['preventivo', 'offerta', 'fattura proforma', 'terminologia', 'documento commerciale'],
  publishedAt: '2026-05-11',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Nel linguaggio corrente dell’edilizia, «preventivo» e «offerta» si usano spesso come sinonimi. Nella maggior parte dei casi, questo non crea problemi. La confusione diventa fastidiosa quando una «fattura proforma» entra nella conversazione, perché quel documento non svolge affatto lo stesso ruolo.',
    },
    { type: 'h2', text: 'Preventivo e offerta: la stessa cosa, nella pratica dell’edilizia' },
    {
      type: 'p',
      text: 'Giuridicamente, i due termini descrivono una proposta di contratto (un’offerta ai sensi del diritto delle obbligazioni, che il cliente accetta o rifiuta). «Preventivo» è il termine d’uso nell’edilizia (con il dettaglio delle voci quantificate); «offerta» è un termine più generico usato in altri settori per designare la stessa cosa. Nessuna differenza di valore giuridico tra i due in questo contesto.',
    },
    {
      type: 'callout',
      title: 'La fattura proforma non è una fattura, e non impegna a nulla',
      text: 'Una fattura proforma è un documento informativo che presenta un importo stimato, spesso utilizzato per pratiche amministrative (fascicolo di finanziamento, dogana). Non costituisce tuttavia né un credito giuridico, né un’accettazione contrattuale. A differenza di un preventivo accettato, non impegna nessuna delle due parti.',
    },
    { type: 'h2', text: 'Perché la distinzione conta' },
    {
      type: 'list',
      items: [
        'Un preventivo accettato dal cliente crea un contratto d’appalto: entrambe le parti sono impegnate',
        'Una fattura proforma non crea alcun obbligo di pagamento (informa, senza impegnare)',
        'Una vera fattura (emessa dopo l’esecuzione o come acconto) crea, invece, un credito esigibile con scadenza',
      ],
    },
    {
      type: 'p',
      text: 'Il rischio concreto di una confusione: inviare una «fattura proforma» pensando di aver messo al sicuro un impegno del cliente, mentre non è avvenuta alcuna accettazione contrattuale reale. Il cliente può quindi ritirarsi senza alcuna conseguenza giuridica, a differenza di un preventivo debitamente accettato.',
    },
    {
      type: 'cta',
      title: 'Preventivi, fatture, acconti: ognuno al suo posto',
      text: 'Cantia distingue chiaramente ogni stato del documento (bozza, preventivo inviato, accettato, fatturato) per non confondere mai una proposta con un impegno reale.',
      buttonLabel: 'Scoprire il modulo Preventivi',
    },
  ],
  faq: [
    {
      question: 'Un preventivo e un’offerta sono la stessa cosa nell’edilizia?',
      answer:
        'Sì nella pratica: entrambi i termini designano una proposta di contratto, «preventivo» essendo il termine d’uso corrente nel settore edile.',
    },
    {
      question: 'Una fattura proforma impegna il cliente a pagare?',
      answer:
        'No. È un documento puramente informativo che presenta un importo stimato, senza valore di credito né accettazione contrattuale.',
    },
    {
      question: 'Qual è la differenza tra un preventivo accettato e una vera fattura?',
      answer:
        'Il preventivo accettato forma il contratto d’appalto; la fattura, invece, crea un credito esigibile con una scadenza di pagamento, generalmente emessa dopo l’esecuzione o come acconto.',
    },
  ],
  relatedSlugs: [
    'devis-oral-valeur-legale-suisse',
    'validite-devis-signe-prix-qui-bouge',
    'facturer-acompte-suisse-securiser-solde',
  ],
};
