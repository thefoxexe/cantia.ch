import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'qr-facture-obligatoire-2026',
  question: 'La fattura QR è obbligatoria in Svizzera nel 2026?',
  title: 'Fattura QR obbligatoria in Svizzera: cosa sapere nel 2026',
  description:
    'La BVR non esiste più dal 2022, la fattura QR è l’unico standard. E da fine 2025, un nuovo cambiamento di formato minaccia le fatture QR non conformi.',
  excerpt:
    'Se le Sue fatture QR vengono ancora scansionate oggi, non significa che verranno scansionate anche in ottobre 2026. Un dettaglio di formato ha appena cambiato le carte in tavola.',
  category: 'Devis & facturation',
  keywords: ['fattura qr', 'bvr', 'iban', 'fatturazione svizzera', 'qr-bill', 'pagamento'],
  publishedAt: '2026-01-19',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Se fattura ancora con una polizza di versamento arancione o rosa nel 2026, la banca del Suo cliente semplicemente non la accetterà più. Questi documenti sono morti dal 30 settembre 2022. Ma la vera domanda per quest’anno non è più questa: è in un cambiamento di formato molto più discreto, passato inosservato per la maggior parte delle aziende.',
    },
    { type: 'h2', text: 'Cos’è la fattura QR' },
    {
      type: 'p',
      text: 'Una sezione di pagamento strutturata (importo, IBAN o QR-IBAN, riferimento, debitore) più un codice QR leggibile da qualsiasi app bancaria svizzera. Il cliente scansiona, l’importo e le coordinate si compilano da soli: finito l’errore di trascrizione del riferimento, finita la polizza smarrita in fondo a un raccoglitore.',
    },
    {
      type: 'stat',
      value: '30.09.2022',
      label: 'Data a partire dalla quale le BVR/BV arancioni e rosa non sono più accettate dalle banche svizzere',
    },
    { type: 'h2', text: 'La vera trappola del 2026: gli indirizzi non strutturati' },
    {
      type: 'p',
      text: 'La versione 2.3 delle specifiche della fattura QR, entrata in vigore a novembre 2025, impone che solo gli indirizzi strutturati (tipo «S»: via, numero, NPA e località in campi separati) siano accettati nel codice QR. Gli indirizzi in testo libero (tipo «K») saranno rifiutati dalle banche a partire dal 30 settembre 2026.',
    },
    {
      type: 'callout',
      title: 'Perché nessuno lo vede arrivare',
      text: 'Un software che genera ancora fatture QR con indirizzo non strutturato continua a produrre documenti perfettamente funzionanti oggi. Il problema non appare in fase di test, appare il giorno in cui una banca inizia a rifiutarli, e spesso senza un messaggio di errore chiaro lato utente.',
    },
    { type: 'h2', text: 'Cosa deve contenere una fattura QR' },
    {
      type: 'list',
      items: [
        'IBAN o QR-IBAN del beneficiario (numero dedicato per il riferimento QR strutturato)',
        'Importo e valuta, o campo vuoto se l’importo è lasciato al debitore',
        'Riferimento di pagamento (QRR a 27 cifre, o riferimento ISO 11649/SCOR)',
        'Coordinate del creditore e, se del caso, del debitore (in indirizzo strutturato dal 2025-2026)',
        'Il codice QR stesso, dimensionato e posizionato secondo la norma, zona di rispetto inclusa',
      ],
    },
    { type: 'h2', text: 'Il vero vantaggio non è la conformità, è la riconciliazione automatica' },
    {
      type: 'p',
      text: 'Il riferimento strutturato permette di far corrispondere un pagamento ricevuto alla sua fattura senza indovinare, senza dover controllare un elenco di bonifici riga per riga un mercoledì sera. È l’argomento che conta di più una volta acquisita la conformità.',
    },
    {
      type: 'cta',
      title: 'Conforme oggi, conforme a settembre 2026',
      text: 'Cantia genera fatture QR con indirizzo strutturato fin dal primo giorno e riconcilia automaticamente ogni pagamento ricevuto grazie al numero di riferimento.',
      buttonLabel: 'Vedere il modulo Fatturazione',
    },
  ],
  faq: [
    {
      question: 'Si può ancora usare una polizza di versamento arancione nel 2026?',
      answer:
        'No. Le BVR (arancioni) e BV (rosa) non sono più emesse né accettate dalle banche svizzere dal 30 settembre 2022. Ogni fattura deve ormai includere una sezione fattura QR.',
    },
    {
      question: 'Cosa cambia con la versione 2.3 della norma fattura QR?',
      answer:
        'Da novembre 2025, solo gli indirizzi strutturati (via, numero, NPA, località in campi separati) sono ammessi nel codice QR. Gli indirizzi in testo libero saranno rifiutati dalle banche a partire dal 30 settembre 2026.',
    },
    {
      question: 'Qual è la differenza tra IBAN e QR-IBAN?',
      answer:
        'Il QR-IBAN è un numero dedicato, riconoscibile dal suo identificativo di istituto finanziario specifico, utilizzato solo per le fatture QR con riferimento QR strutturato (QRR). Un IBAN standard può essere usato anche su una fattura QR, ma con un riferimento di tipo SCOR o senza riferimento.',
    },
  ],
  relatedSlugs: [
    'delai-paiement-facture-artisan-code-obligations',
    'duree-conservation-devis-factures-suisse',
    'calculer-prix-devis-renovation-suisse',
  ],
};
