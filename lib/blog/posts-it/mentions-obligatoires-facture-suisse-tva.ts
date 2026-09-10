import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'mentions-obligatoires-facture-suisse-tva',
  question: 'Quali indicazioni sono legalmente obbligatorie su una fattura in Svizzera ai fini IVA?',
  title: 'Fattura svizzera: le indicazioni obbligatorie per essere valida ai fini IVA',
  description:
    'Numero IVA, aliquota applicabile, data della prestazione, riferimento QR: una fattura incompleta può essere rifiutata in contabilità o contestata da un cliente. Ecco l’elenco esatto da verificare.',
  excerpt:
    'Una fattura che «sembra corretta» e una fattura che rispetta tutte le esigenze dell’AFC non sono sempre la stessa cosa. Basta una sola indicazione mancante per indebolirla.',
  category: 'Devis & facturation',
  keywords: ['indicazioni fattura svizzera', 'numero IVA fattura', 'AFC fattura', 'fattura conforme', 'fatturazione artigiano'],
  publishedAt: '2026-08-15',
  readMinutes: 4,
  blocks: [
    {
      type: 'p',
      text: 'Un’azienda assoggettata all’IVA deve emettere fatture che rispettino determinate esigenze formali. Non è una semplice questione di burocrazia: una fattura incompleta può essere rifiutata per la deduzione dell’imposta precedente lato cliente, o indebolita in caso di controllo dell’Amministrazione federale delle contribuzioni (AFC).',
    },
    { type: 'h2', text: 'L’elenco delle indicazioni attese' },
    {
      type: 'list',
      items: [
        'Nome e indirizzo completo dell’azienda emittente, nonché del destinatario',
        'Numero IDI / numero IVA dell’azienda emittente',
        'Data di emissione della fattura, e data o periodo della prestazione se diversa',
        'Descrizione sufficientemente precisa della natura e della portata della prestazione',
        'Importo della controprestazione e aliquota IVA applicabile (generalmente 8,1 % per i lavori edili)',
        'Importo dell’IVA, indicato separatamente o tramite una menzione chiara dell’aliquota se il prezzo è IVA inclusa',
      ],
    },
    {
      type: 'callout',
      title: 'Sotto CHF 400.-, una fattura semplificata è sufficiente',
      text: 'Per i piccoli importi, non è necessario indicare il nome del destinatario né il dettaglio dell’aliquota IVA. Il numero IDI e l’importo lordo restano invece obbligatori.',
    },
    { type: 'h2', text: 'La fattura QR aggiunge le proprie esigenze' },
    {
      type: 'p',
      text: 'Una fattura QR deve inoltre rispettare lo standard svizzero di pagamento (IBAN o QR-IBAN valido, riferimento QR o senza riferimento a seconda del conto utilizzato, indirizzo strutturato con NPA e località separati dalla versione 2.3 della norma). Un formato non conforme può essere rifiutato da alcune banche, o generare un errore al momento della scansione lato cliente.',
    },
    {
      type: 'cta',
      title: 'Fatture conformi senza pensarci',
      text: 'Cantia genera automaticamente fatture e fatture QR con tutte le indicazioni legali aggiornate (IVA, IBAN, indirizzo strutturato), senza che dobbiate verificare ogni campo a mano.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Il numero IDI è obbligatorio su ogni fattura svizzera?',
      answer:
        'Sì, non appena un’azienda è assoggettata all’IVA, il suo numero IDI/IVA deve figurare sulla fattura per permettere la deduzione dell’imposta precedente lato cliente.',
    },
    {
      question: 'Quale aliquota IVA si applica ai lavori edili in Svizzera?',
      answer:
        'L’aliquota normale dell’8,1 % si applica alla maggioranza delle prestazioni edili dal 2024, salvo casi particolari soggetti a un’aliquota ridotta o a un’esenzione specifica.',
    },
    {
      question: 'Una fattura senza IVA dettagliata è valida?',
      answer:
        'Per gli importi superiori a CHF 400.-, l’aliquota e l’importo dell’IVA devono apparire chiaramente, perché la loro assenza può far rifiutare la deduzione dell’imposta precedente al destinatario.',
    },
  ],
  relatedSlugs: [
    'qr-facture-obligatoire-2026',
    'difference-devis-offre-facture-pro-forma',
    'delai-paiement-facture-artisan-code-obligations',
  ],
};
