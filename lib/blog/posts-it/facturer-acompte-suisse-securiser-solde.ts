import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'facturer-acompte-suisse-securiser-solde',
  question: 'Come fatturare un acconto in Svizzera senza ritrovarsi a rincorrere il saldo?',
  title: 'Fatturare un acconto senza finire a rincorrere il saldo',
  description:
    'Un acconto mal strutturato protegge raramente l’azienda. Ecco come ripartire i pagamenti su un cantiere per non anticipare mai più di quanto sia già coperto.',
  excerpt:
    'Un acconto del 30% all’avvio dà una falsa sensazione di sicurezza se il resto del pagamento è suddiviso solo in due fasi. Il denaro che manca è quasi sempre quello di mezzo.',
  category: 'Devis & facturation',
  keywords: ['acconto', 'scadenzario pagamenti', 'fattura cantiere', 'sicurezza pagamento', 'saldo finale'],
  publishedAt: '2026-02-23',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Un cantiere da CHF 25’000 con un acconto del 30% all’inizio sembra prudente. Non lo è se tutto il resto ricade su un’unica fattura finale: tra l’acconto e il saldo, l’azienda ha già pagato il materiale, le ore, talvolta un subappaltatore, e questo con fondi propri, in attesa di un bonifico che può tardare.',
    },
    { type: 'h2', text: 'Il vero problema non è l’acconto, è il centro del cantiere' },
    {
      type: 'p',
      text: 'Un acconto d’avvio protegge la decisione di cominciare. Non protegge nulla di ciò che si impegna in seguito. Su un cantiere di più settimane, il punto di svolta finanziario non è né all’inizio né alla fine. Si situa nel momento in cui il materiale viene acquistato e le ore fatturate, ancor prima che il cliente abbia rivisto un centesimo dopo l’acconto.',
    },
    {
      type: 'list',
      items: [
        'Un acconto alla firma (spesso dal 20 al 30%) che copra almeno il materiale specifico già impegnato',
        'Una o più fatture intermedie calibrate su fasi visibili del cantiere (fine del grezzo, posa dei serramenti, ecc.), e non su date arbitrarie',
        'Un saldo finale limitato, idealmente sotto il 20-30% del totale, regolato alla consegna',
      ],
    },
    {
      type: 'callout',
      title: 'La regola semplice che evita la trappola',
      text: 'In nessun momento del cantiere l’azienda dovrebbe aver anticipato più di quanto sia già stato fatturato e incassato. Se una voce di materiale importante arriva prima della prossima scadenza di pagamento, è lo scadenzario a essere mal suddiviso, non il cliente ad agire in malafede.',
    },
    { type: 'h2', text: 'Cosa rende un acconto davvero esecutivo' },
    {
      type: 'p',
      text: 'Lo scadenzario di pagamento deve figurare sul preventivo firmato, non essere negoziato a voce una volta avviato il cantiere. Un accordo verbale del tipo «Le pagherò man mano» non protegge nulla giuridicamente e si trasforma regolarmente in un malinteso in buona fede da entrambe le parti.',
    },
    {
      type: 'cta',
      title: 'Fatture d’acconto dedotte automaticamente',
      text: 'Cantia permette di fatturare una percentuale del preventivo come acconto, poi deduce tale importo dalla fattura finale senza reinserimento, e lo scadenzario resta visibile dal primo all’ultimo pagamento.',
      buttonLabel: 'Vedere il modulo Fatturazione',
    },
  ],
  faq: [
    {
      question: 'Quale percentuale di acconto richiedere su un cantiere in Svizzera?',
      answer:
        'Non esiste una regola legale fissa: dal 20 al 30% alla firma è comune, ma il punto importante è che lo scadenzario completo copra le spese impegnate a ogni fase, non solo l’avvio.',
    },
    {
      question: 'Un acconto è rimborsabile se il cliente annulla il cantiere?',
      answer:
        'Dipende dalle condizioni figuranti sul preventivo firmato. In assenza di una clausola chiara, una controversia su questo punto si risolve caso per caso, il che giustifica di scrivere sempre una clausola di annullamento esplicita.',
    },
    {
      question: 'Si possono fatturare più acconti intermedi sullo stesso cantiere?',
      answer:
        'Sì, ed è consigliato sui cantieri di più settimane: calibrare le fatture intermedie su fasi visibili evita di anticipare troppa liquidità prima del prossimo incasso.',
    },
  ],
  relatedSlugs: [
    'delai-paiement-facture-artisan-code-obligations',
    'relancer-client-facture-impayee-sans-perdre-client',
    'calculer-prix-devis-renovation-suisse',
  ],
};
