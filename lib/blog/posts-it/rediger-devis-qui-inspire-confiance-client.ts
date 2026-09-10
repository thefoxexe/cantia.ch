import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'rediger-devis-qui-inspire-confiance-client',
  question: 'Come redigere un preventivo che dia fiducia a un cliente privato?',
  title: 'Come redigere un preventivo che ispira fiducia a un cliente privato',
  description:
    'Un preventivo chiaro, preciso e ben presentato rassicura quanto un prezzo competitivo. Ecco gli elementi concreti che fanno la differenza agli occhi di un cliente privato.',
  excerpt:
    'Due preventivi allo stesso prezzo non valgono mai lo stesso agli occhi di un cliente. Ciò che fa pendere la bilancia non è quasi mai la cifra in fondo alla pagina.',
  category: 'Devis & facturation',
  keywords: ['preventivo cliente', 'fiducia', 'presentazione preventivo', 'firma online', 'accettazione preventivo'],
  publishedAt: '2026-02-19',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Un cliente privato che confronta tre preventivi per ristrutturare il proprio bagno non li confronta quasi mai solo sul prezzo. Confronta soprattutto ciò che ogni documento gli lascia capire, o al contrario gli nasconde, su ciò per cui pagherà. E su questo terreno, un preventivo ben costruito vince regolarmente su un preventivo più economico ma illeggibile.',
    },
    { type: 'h2', text: '1. Dettagliare, mai riassumere in una cifra' },
    {
      type: 'p',
      text: 'Un preventivo ridotto a «Ristrutturazione bagno: CHF 12’000» preoccupa più di quanto rassicuri: il cliente non sa cosa è incluso, e si chiede istintivamente cosa manca. Dettagliare ogni voce (demolizione, idraulica, piastrelle, sanitari, manodopera) con quantità e prezzo unitario dà una lettura chiara di ciò che viene realmente acquistato, e neutralizza in anticipo la domanda «perché costa così tanto».',
    },
    { type: 'h2', text: '2. Dire chiaramente cosa non è incluso' },
    {
      type: 'list',
      items: [
        'Ciò che resta a carico del cliente (smaltimento rifiuti non previsto, impianto elettrico esistente non verificato, ecc.)',
        'La validità del preventivo nel tempo (30 giorni, ad esempio), poiché un prezzo del materiale può variare da una settimana all’altra',
        'L’importo di un eventuale acconto, e in quale momento viene richiesto',
      ],
    },
    {
      type: 'callout',
      title: 'La trasparenza sui limiti rassicura più di quanto spaventi',
      text: 'Un cliente che scopre in seguito un costo «nascosto» perde immediatamente fiducia nel resto della collaborazione. Al contrario, un preventivo che pone chiaramente i propri limiti fin dall’inizio risulta onesto, anche quando questi limiti implicano un costo potenziale supplementare.',
    },
    { type: 'h2', text: '3. L’impaginazione conta più di quanto si vorrebbe' },
    {
      type: 'p',
      text: 'Un preventivo pulito, con logo, coordinate complete, impaginazione coerente, senza caratteri mescolati né tabella disallineata, proietta una serietà che rassicura ancor prima della lettura del contenuto. È ingiusto nella sostanza: la qualità del lavoro futuro non ha nulla a che vedere con l’impaginazione di un documento. Ma è un bias ben documentato nella decisione d’acquisto, e gioca contro di Lei se nessuno vi presta attenzione.',
    },
    { type: 'h2', text: '4. Togliere l’attrito dalla firma' },
    {
      type: 'p',
      text: 'Un preventivo inviato come allegato PDF che va stampato, firmato, scansionato aggiunge un passaggio logistico che fa rimandare la decisione. Non è mancanza di interesse, solo pigrizia. Un link a un portale dove il cliente legge, pone una domanda e firma direttamente online riduce questo freno senza togliere nulla alla serietà del documento.',
    },
    { type: 'h2', text: '5. Rispondere in fretta, o perdere lo slancio' },
    {
      type: 'p',
      text: 'Un cliente che riceve una risposta entro un’ora conserva un’impressione molto diversa da chi aspetta tre giorni per una semplice domanda. Sapere con precisione quando un preventivo è stato aperto permette di sollecitare al momento giusto: né troppo presto per sembrare insistenti, né troppo tardi per lasciare che il cliente vada a guardare altrove.',
    },
    {
      type: 'cta',
      title: 'Preventivi chiari, firmati online',
      text: 'Cantia genera preventivi dettagliati e ben presentati, con un portale cliente dove il preventivo si consulta, si discute e si firma online. Viene notificato non appena viene aperto.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Bisogna dettagliare ogni voce di un preventivo o dare un prezzo globale?',
      answer:
        'Il dettaglio voce per voce (quantità, prezzo unitario) è quasi sempre preferibile: rassicura il cliente su ciò che è realmente incluso e facilita il confronto con altri preventivi ricevuti.',
    },
    {
      question: 'Come gestire i possibili imprevisti su un preventivo di ristrutturazione?',
      answer:
        'Menzionandoli esplicitamente come esclusioni o prevedendo una clausola chiara di fatturazione complementare in caso di scoperta imprevista: la trasparenza su questo punto rafforza la fiducia invece di indebolirla.',
    },
    {
      question: 'La firma elettronica di un preventivo ha valore in Svizzera?',
      answer:
        'Una firma elettronica semplice (come una convalida online con marca temporale) vale come accettazione contrattuale nella maggior parte dei casi pratici dell’edilizia; per questioni giuridiche di maggior portata, può essere consigliata una firma elettronica qualificata.',
    },
  ],
  relatedSlugs: [
    'calculer-prix-devis-renovation-suisse',
    'norme-sia-118-devis-obligatoire',
    'bexio-vs-cantia-logiciel-batiment',
  ],
};
