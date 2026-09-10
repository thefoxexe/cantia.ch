import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'logiciel-facturation-qr-facture-comparatif-suisse',
  question: 'Come scegliere un software di fatturazione che gestisca davvero bene la fattura QR svizzera?',
  title: 'Software di fatturazione con fattura QR: cosa distingue un vero supporto da un modulo raffazzonato',
  description:
    'Molti strumenti si presentano come «compatibili fattura QR» senza rispettare la norma nel dettaglio: indirizzo strutturato, IBAN vs QR-IBAN, riferimento QR. Ecco cosa distingue i due.',
  excerpt:
    'Un codice QR che «sembra corretto» può essere rifiutato dalla banca alla scansione. La fattura QR svizzera ha regole precise, e non tutti i software le rispettano allo stesso modo.',
  category: 'Comparatifs & outils',
  keywords: ['software fattura QR', 'confronto fattura QR svizzera', 'software fatturazione QR-IBAN', 'standard fattura QR 2.3', 'fatturazione svizzera conforme'],
  publishedAt: '2026-06-03',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Dalla scomparsa della polizza di versamento arancione nel 2022, la fattura QR è l’unico standard di pagamento in Svizzera. La maggior parte dei software di fatturazione oggi presenta la «fattura QR» come argomento di marketing. Ma generare un codice QR che si scansioni correttamente, ogni volta, con i dati giusti, è più esigente di quanto sembri.',
    },
    { type: 'h2', text: 'Cosa distingue un vero supporto per la fattura QR' },
    {
      type: 'list',
      items: [
        'La gestione corretta di IBAN vs QR-IBAN (due formati diversi a seconda del tipo di conto, con o senza riferimento QR)',
        'L’indirizzo strutturato (NPA e località separati), obbligatorio dallo standard 2.3: un indirizzo in testo libero verrà rifiutato dalla fine di settembre 2026',
        'Il calcolo e la verifica automatica del riferimento QR (QRR), per evitare un errore di riconciliazione lato cliente',
        'Una zona di rispetto (quiet zone) sufficiente attorno al codice QR: un codice con margini sbagliati può fallire alla scansione anche se i dati sono corretti',
      ],
    },
    {
      type: 'callout',
      title: 'Un bug di generazione della fattura QR spesso si vede solo al momento del pagamento',
      text: 'Il PDF sembra normale, il cliente prova a scansionare o a inserire il riferimento, e fallisce. Il problema viene allora percepito come un ritardo di pagamento, senza che la vera causa (un difetto di conformità) sia evidente.',
    },
    { type: 'h2', text: 'Come verificare la conformità prima di scegliere' },
    {
      type: 'list',
      items: [
        'Generare una fattura di prova e scansionarla con una vera applicazione bancaria svizzera, non solo visivamente',
        'Verificare che l’indirizzo appaia effettivamente strutturato (NPA/località separati) e non in un unico blocco di testo',
        'Confermare che il software distingua automaticamente IBAN standard e QR-IBAN a seconda del conto configurato',
      ],
    },
    {
      type: 'cta',
      title: 'Fattura QR conforme, generata automaticamente',
      text: 'Cantia genera fatture QR conformi allo standard svizzero fin dalla creazione del preventivo o della fattura, senza alcuna configurazione tecnica da parte vostra.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Qual è la differenza tra IBAN e QR-IBAN?',
      answer:
        'Il QR-IBAN è un numero dedicato utilizzato unicamente per le fatture QR con riferimento QR strutturato (QRR), distinto da un IBAN standard utilizzabile senza riferimento.',
    },
    {
      question: 'Perché una fattura QR può fallire alla scansione?',
      answer:
        'Un indirizzo non strutturato, una zona di rispetto insufficiente o un riferimento QR calcolato male possono tutti impedire una scansione corretta, anche se il PDF sembra normale visivamente.',
    },
    {
      question: 'Da quando è obbligatorio l’indirizzo strutturato su una fattura QR?',
      answer:
        'Dallo standard 2.3 a partire da novembre 2025. Gli indirizzi in testo libero saranno definitivamente rifiutati a partire dal 30 settembre 2026.',
    },
  ],
  relatedSlugs: [
    'qr-facture-obligatoire-2026',
    'meilleur-logiciel-devis-facture-batiment-suisse-2026',
    'mentions-obligatoires-facture-suisse-tva',
  ],
};
