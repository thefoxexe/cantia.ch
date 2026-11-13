import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'tva-methode-effective-ou-tdfn-batiment',
  question: 'Metodo effettivo o aliquota saldo: quale metodo IVA scegliere per un’impresa edile?',
  title: 'IVA: metodo effettivo o aliquota saldo, quale scegliere?',
  description:
    'Metodo effettivo o aliquota saldo per l’IVA di un’impresa edile: carico amministrativo, imposta precedente deducibile e come orientare la scelta.',
  excerpt:
    'I due metodi esistono per lo stesso motivo: semplificare la vita a certe imprese. Ma più semplice non vuol dire sempre più conveniente, e una scelta sbagliata si paga per diversi anni.',
  category: 'Juridique & normes',
  keywords: [
    'metodo effettivo o aliquota saldo edilizia',
    'aliquota saldo IVA costruzione',
    'scegliere metodo IVA impresa edile',
    'aliquota saldo artigiano svizzera',
    'imposta precedente IVA edilizia',
  ],
  publishedAt: '2026-09-22',
  readMinutes: 7,
  blocks: [
    {
      type: 'p',
      text: 'Per calcolare l’IVA dovuta da un’impresa assoggettata in Svizzera esistono due metodi: il metodo effettivo, che calcola con precisione la differenza tra l’IVA fatturata e l’imposta precedente realmente pagata, e l’aliquota saldo, un’aliquota forfettaria per ramo d’attività che semplifica il rendiconto ma cambia la logica del calcolo. La scelta si fa all’iscrizione o con un cambiamento di metodo presso l’AFC, e struttura la contabilità dell’impresa per gli anni seguenti.',
    },
    { type: 'h2', text: 'Il metodo effettivo: precisione, ma più contabilità' },
    {
      type: 'p',
      text: 'Con il metodo effettivo ogni fattura emessa porta l’IVA all’aliquota applicabile, e ogni fattura ricevuta (materiale, subappalto, noleggio di macchine, carburante) permette di dedurre l’imposta precedente corrispondente. L’IVA dovuta è la differenza tra le due. È il metodo più preciso, ma richiede di seguire con rigore ogni fattura d’acquisto e la sua aliquota, un carico reale per una piccola struttura senza servizio contabile.',
    },
    { type: 'h2', text: 'L’aliquota saldo: più semplice, ma non sempre più conveniente' },
    {
      type: 'p',
      text: 'L’aliquota saldo applica un’aliquota forfettaria, propria di ogni ramo d’attività, direttamente sulla cifra d’affari incassata, senza calcolare separatamente l’imposta precedente su ogni acquisto. Il rendiconto si allestisce molto più in fretta, di solito due volte all’anno invece di quattro. L’aliquota esatta per l’edilizia dipende dall’attività dichiarata ed evolve periodicamente: va verificata direttamente presso l’AFC o un fiduciario, mai supposta da un anno all’altro.',
    },
    { type: 'h2', text: 'Il vero criterio: il volume di acquisti deducibili' },
    {
      type: 'table',
      headers: ['Situazione', 'Metodo piuttosto conveniente'],
      rows: [
        ['Molti acquisti di materiale e investimenti', 'Metodo effettivo, per recuperare l’imposta precedente reale'],
        ['Attività soprattutto di manodopera, pochi acquisti', 'Aliquota saldo, spesso più semplice senza perdite significative'],
        ['Nessun servizio contabile interno', 'Aliquota saldo, per ridurre il lavoro di controllo trimestrale'],
        ['Contabilità già tenuta con precisione (software di gestione)', 'Metodo effettivo, perché il controllo non aggiunge un vero carico'],
      ],
    },
    {
      type: 'callout',
      title: 'Un impegno che dura, non una scelta trimestrale',
      text: 'Cambiare metodo non è immediato: l’AFC impone in genere una durata minima prima di poter passare da un metodo all’altro. Prima di scegliere l’aliquota saldo per la sua semplicità, conviene simulare un anno intero con i due metodi, soprattutto se a breve è previsto un investimento importante (veicolo, macchina).',
    },
    {
      type: 'cta',
      title: 'Qualunque sia il metodo IVA, ogni fattura legata al suo cantiere',
      text: 'Cantia riunisce preventivi, fatture e acquisti per cantiere, e semplifica il rendiconto che usiate il metodo effettivo o l’aliquota saldo.',
      buttonLabel: 'Provare 14 giorni',
    },
  ],
  faq: [
    {
      question: 'Si può cambiare metodo IVA durante l’anno?',
      answer:
        'No, un cambiamento di metodo avviene in genere all’inizio di un periodo fiscale e richiede il rispetto di una durata minima prima di poter tornare all’altro metodo. Ogni domanda passa dall’AFC.',
    },
    {
      question: 'Con l’aliquota saldo non bisogna più conservare le fatture d’acquisto?',
      answer:
        'No, l’aliquota saldo semplifica il calcolo dell’IVA dovuta, ma l’impresa deve comunque conservare le fatture d’acquisto e di vendita come ogni impresa assoggettata, in particolare in caso di controllo.',
    },
    {
      question: 'A una piccola impresa edile conviene restare con il metodo effettivo?',
      answer:
        'Dipende soprattutto dal volume di acquisti di materiale e di investimenti deducibili. Chi compra molto materiale ha spesso interesse a restare con il metodo effettivo per recuperare l’imposta precedente reale piuttosto che un’aliquota forfettaria.',
    },
  ],
  relatedSlugs: [
    'declaration-tva-trimestrielle-artisan-suisse',
    'delai-declaration-tva-suisse-calendrier',
    'mentions-obligatoires-facture-suisse-tva',
  ],
};
