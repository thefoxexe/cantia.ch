import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'devis-facture-plombier-sanitaire-suisse',
  question: 'Come deve calcolare un idraulico-sanitario un preventivo e gestire le urgenze impreviste?',
  title: 'Idraulico-sanitario: calcolare correttamente tra preventivo pianificato e urgenza imprevista',
  description:
    'Tra un preventivo per un bagno completo e una riparazione di una perdita una domenica sera, l’idraulico-sanitario destreggia due logiche di fatturazione opposte. Come strutturare entrambe senza perderci.',
  excerpt:
    'Un preventivo di ristrutturazione sanitaria si prepara con calma. Una riparazione si fattura nell’urgenza, spesso senza aver avuto il tempo di scrivere nulla prima di intervenire. Le due logiche devono però convivere nello stesso strumento.',
  category: 'Métiers du bâtiment',
  keywords: ['preventivo idraulico sanitario', 'fatturazione idraulica Svizzera', 'tariffa riparazione idraulico', 'software gestione idraulica', 'preventivo ristrutturazione bagno'],
  publishedAt: '2026-09-01',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'L’idraulica-sanitaria copre due realtà molto diverse: il cantiere pianificato (ristrutturazione del bagno, sostituzione dello scaldabagno, nuovo allacciamento) che si calcola con calma prima dell’intervento, e la riparazione (perdita, tubatura ostruita, guasto al riscaldamento) che si fattura a posteriori, spesso fuori dagli orari normali. Confondere le due in un unico tariffario finisce sempre per penalizzare uno dei due casi.',
    },
    { type: 'h2', text: 'Il preventivo pianificato: dettagliare per evitare contestazioni' },
    {
      type: 'list',
      items: [
        'Smontaggio dell’installazione esistente e smaltimento (spesso dimenticato, ma richiede molto tempo)',
        'Fornitura del materiale sanitario (sanitari, rubinetteria, tubazioni), separata dalla posa',
        'Allacciamenti e tenuta stagna, con un forfait chiaro per punto d’acqua',
        'Messa in servizio e test di funzionamento prima della ricezione',
      ],
    },
    { type: 'h2', text: 'La riparazione: una tariffa chiara annunciata prima di intervenire' },
    {
      type: 'p',
      text: 'In un’urgenza, il cliente accetta raramente di negoziare un prezzo mentre l’acqua continua a scorrere. La migliore protezione, sia per l’idraulico che per il cliente, resta una tariffa di riparazione annunciata chiaramente in anticipo (spostamento, tariffa oraria, maggiorazione serale/weekend se applicabile), affinché la fattura inviata a posteriori non sia mai una sorpresa.',
    },
    {
      type: 'stat',
      value: '2x',
      label: 'maggiorazione comune applicata sugli interventi di riparazione serali, nel weekend o nei giorni festivi rispetto alla tariffa standard diurna',
    },
    {
      type: 'callout',
      title: 'Una riparazione non fatturata sul momento va fatturata rapidamente dopo',
      text: 'Un intervento d’urgenza eseguito senza fattura immediata si fattura tanto meglio quanto più rapidamente viene inviata: il cliente ricorda ancora chiaramente l’intervento, e l’accettazione del prezzo è più naturale che settimane dopo.',
    },
    {
      type: 'cta',
      title: 'Una fattura inviata dal cantiere, riparazione compresa',
      text: 'Con Cantia, un intervento di riparazione diventa una fattura in pochi minuti dal telefono, senza bisogno di tornare in ufficio né di lasciare un’urgenza fatturata tre settimane dopo.',
      buttonLabel: 'Provare gratuitamente',
    },
  ],
  faq: [
    {
      question: 'Come differenziare la tariffa di un preventivo pianificato e di una riparazione in idraulica?',
      answer:
        'Applicando due logiche distinte: un preventivo dettagliato voce per voce per i cantieri pianificati, e una tariffa di riparazione annunciata chiaramente prima dell’intervento (spostamento, tariffa oraria, eventuale maggiorazione) per le urgenze.',
    },
    {
      question: 'Si può fatturare una riparazione più cara la sera o nel weekend?',
      answer:
        'Sì, è una pratica comune e legittima nel settore, a condizione che la maggiorazione sia annunciata prima dell’intervento piuttosto che scoperta sulla fattura.',
    },
    {
      question: 'Bisogna separare la fornitura del materiale sanitario e la posa sul preventivo?',
      answer:
        'È consigliabile: ciò permette al cliente di comprendere la ripartizione del prezzo e facilita gli adeguamenti se il materiale scelto cambia in corso di progetto.',
    },
  ],
  relatedSlugs: [
    'facturer-acompte-suisse-securiser-solde',
    'relancer-client-facture-impayee-sans-perdre-client',
    'application-hors-ligne-chantier-pourquoi-important',
  ],
  relatedTradeSlug: 'plombier',
};
