import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'poursuite-facture-impayee-procedure-suisse',
  question: 'Come avviare un’esecuzione contro un cliente che rifiuta di pagare una fattura, e quanto costa?',
  title: 'Fattura non pagata: la procedura esecutiva in Svizzera, passo dopo passo',
  description:
    'Domanda d’esecuzione, precetto esecutivo, opposizione, rigetto: ecco come funziona realmente un’esecuzione per fattura non pagata, e in quale momento diventa utile.',
  excerpt:
    'Il sollecito non funziona sempre. Prima di rinunciare a un credito o di esaurirsi in richiami, l’esecuzione resta una procedura accessibile, standardizzata, e spesso più rapida di quanto si creda.',
  category: 'Devis & facturation',
  keywords: ['esecuzione fattura non pagata', 'precetto esecutivo', 'ufficio esecuzioni', 'rigetto opposizione', 'credito artigiano'],
  publishedAt: '2026-08-18',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Dopo diversi solleciti rimasti senza effetto, molti artigiani esitano a passare alla fase successiva, per scarsa conoscenza della procedura o per timore che sia pesante e costosa. In realtà, l’esecuzione per debiti in Svizzera è una procedura amministrativa standardizzata, accessibile senza avvocato per un credito semplice e documentato.',
    },
    { type: 'h2', text: 'Le 4 tappe concrete' },
    {
      type: 'list',
      items: [
        'Domanda d’esecuzione: un modulo depositato presso l’ufficio d’esecuzione del domicilio del debitore, con l’importo dovuto e la sua causa (numero e data della fattura)',
        'Precetto esecutivo: l’ufficio notifica il debitore, che ha 10 giorni per fare opposizione',
        'Senza opposizione, l’esecuzione prosegue direttamente verso il pignoramento o il fallimento a seconda dello statuto del debitore',
        'Con opposizione, occorre ottenere il rigetto (presso il tribunale) per farla annullare e proseguire la procedura',
      ],
      ordered: true,
    },
    {
      type: 'callout',
      title: 'Un preventivo firmato o una fattura riconosciuta accelerano notevolmente il rigetto',
      text: 'Il rigetto provvisorio si ottiene molto più rapidamente quando il credito si basa su un titolo scritto e firmato dal debitore (preventivo accettato, fattura riconosciuta, estratto conto non contestato) piuttosto che su una semplice fattura non firmata.',
    },
    { type: 'h2', text: 'Cosa rende un’esecuzione più o meno efficace' },
    {
      type: 'p',
      text: 'L’esecuzione non garantisce il recupero del credito: se il debitore è realmente insolvente, si concluderà con un attestato di carenza di beni. Ma ha un effetto dissuasivo reale (compare nell’estratto del registro delle esecuzioni, il che pesa per qualsiasi azienda o persona in cerca di un credito, un affitto o un appalto), e resta spesso il fattore scatenante che fa finalmente pagare un debitore solvibile ma in mala fede.',
    },
    {
      type: 'list',
      items: [
        'L’importo esatto richiesto deve corrispondere precisamente alla fattura, senza arrotondamento né aggiunta di spese non giustificate',
        'La data e il numero di fattura devono essere identificabili senza ambiguità',
        'Uno storico di solleciti scritti rafforza il fascicolo se la vicenda arriva fino al tribunale',
      ],
    },
    {
      type: 'cta',
      title: 'Un fascicolo fattura sempre pronto',
      text: 'Cantia conserva ogni fattura, il suo storico di invio e il suo stato di pagamento centralizzati per cliente. Tutto il necessario per compilare una domanda d’esecuzione in pochi minuti piuttosto che frugando mesi di email.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Serve un avvocato per avviare un’esecuzione in Svizzera?',
      answer:
        'No, per un credito semplice e documentato, la domanda d’esecuzione si deposita direttamente presso l’ufficio d’esecuzione, senza rappresentanza obbligatoria.',
    },
    {
      question: 'Cosa succede se il debitore fa opposizione al precetto esecutivo?',
      answer:
        'Bisogna chiedere il rigetto al tribunale per far annullare l’opposizione: una procedura nettamente più rapida se il credito si basa su un titolo firmato dal debitore.',
    },
    {
      question: 'Un’esecuzione garantisce di essere pagati?',
      answer:
        'No. Se il debitore è insolvente, l’esecuzione può concludersi con un attestato di carenza di beni senza recupero, ma resta iscritta nel registro delle esecuzioni del debitore.',
    },
  ],
  relatedSlugs: [
    'hypotheque-legale-artisans-entrepreneurs-suisse',
    'relancer-client-facture-impayee-sans-perdre-client',
    'delai-paiement-facture-artisan-code-obligations',
  ],
};
