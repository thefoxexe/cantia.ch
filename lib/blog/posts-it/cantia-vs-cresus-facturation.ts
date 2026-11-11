import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'cantia-vs-cresus-facturation',
  question: 'Cantia o Crésus Facturation: che differenza per un’impresa edile?',
  title: 'Cantia vs Crésus Facturation: la differenza per l’edilizia',
  description:
    'Crésus Facturation è un software svizzero popolare ed economico, storicamente pensato per Windows. Cantia è pensata mobile, per il cantiere. Un confronto onesto dei due approcci.',
  excerpt:
    'Crésus Facturation è usato da anni da molti indipendenti svizzeri, per buoni motivi. Resta da capire se copre ciò che succede davvero in un cantiere.',
  category: 'Comparatifs & outils',
  keywords: ['Crésus Facturation', 'alternativa Crésus edilizia', 'Crésus vs Cantia', 'software fatturazione svizzera artigiano'],
  publishedAt: '2026-09-22',
  readMinutes: 6,
  blocks: [
    {
      type: 'p',
      text: 'Crésus Facturation è tra i software svizzeri più conosciuti ed economici per fatturazione e contabilità, usato da tempo da molti indipendenti, storicamente in ambiente Windows. La sua popolarità deriva dalla semplicità e dal prezzo accessibile. La domanda, per un’impresa edile, è se questa semplicità copre anche ciò che succede davvero in cantiere.',
    },
    { type: 'h2', text: 'Cosa fa bene Crésus Facturation' },
    {
      type: 'p',
      text: 'Fatturazione chiara, contabilità di base, prezzo accessibile per un indipendente o una piccola struttura: Crésus resta una scelta pertinente per bisogni di fatturazione semplici e generali, senza esigenze particolari legate a un mestiere sul posto.',
    },
    { type: 'h2', text: 'Cosa manca per seguire un cantiere' },
    {
      type: 'p',
      text: 'Crésus Facturation non è stato costruito attorno ai bisogni specifici dell’edilizia: nessun catalogo prezzi per mestiere, nessun preventivo creato in cantiere dal telefono, nessuna redditività cantiere per cantiere, nessun rapporto di cantiere con foto. Sono bisogni che vanno oltre il perimetro di un software di fatturazione generalista.',
    },
    {
      type: 'callout',
      title: 'Un software di fatturazione non è uno strumento di gestione del cantiere',
      text: 'Crésus Facturation fa bene ciò per cui è stato pensato: emettere fatture in modo semplice ed economico. Cantia parte dal cantiere, non dalla fattura, e costruisce tutto il resto (preventivi, pianificazione, redditività) attorno a questa realtà.',
    },
    { type: 'h2', text: 'La tabella di confronto' },
    {
      type: 'table',
      headers: ['Criterio', 'Crésus Facturation', 'Cantia'],
      rows: [
        ['Fatturazione semplice ed economica', 'Sì', 'Sì'],
        ['Catalogo prezzi dei mestieri edili', 'No', 'Sì'],
        ['Preventivo creato in cantiere, da mobile', 'No', 'Sì'],
        ['Redditività per cantiere (preventivo vs reale)', 'No', 'Sì'],
        ['Rapporto di cantiere con foto', 'No', 'Sì'],
        ['App mobile pensata per il cantiere', 'Limitata', 'Sì'],
      ],
    },
    {
      type: 'p',
      text: 'Per un indipendente con bisogni di fatturazione molto semplici e senza un vero tema di gestione del cantiere, Crésus Facturation resta una scelta economica ragionevole. Quando la redditività per cantiere o la mobilità sul posto diventano centrali, la distanza da uno strumento pensato per l’edilizia si fa sentire.',
    },
    {
      type: 'cta',
      title: 'Un preventivo fatto in cantiere, una fattura che segue automaticamente',
      text: 'Con Cantia il preventivo si crea a voce direttamente in cantiere, la fattura QR svizzera si genera poi con un clic e la redditività del cantiere si calcola senza ricopiare nulla.',
      buttonLabel: 'Provare 14 giorni',
    },
  ],
  faq: [
    {
      question: 'Crésus Facturation basta per gestire un’impresa edile?',
      answer:
        'Per la sola fatturazione, spesso sì. Ma Crésus Facturation non copre la gestione del cantiere, la redditività per progetto né i preventivi creati sul posto, bisogni tipici del mestiere edile.',
    },
    {
      question: 'Qual è la differenza principale tra Crésus Facturation e Cantia?',
      answer:
        'Crésus Facturation è un software di fatturazione generalista, semplice ed economico. Cantia è pensata apposta per lo svolgimento di un cantiere edile, dal preventivo sul posto al pagamento finale.',
    },
    {
      question: 'Si possono usare Crésus e Cantia in parallelo?',
      answer:
        'È possibile per un periodo di transizione, ma la maggior parte delle imprese edili che adottano uno strumento di settore come Cantia finisce per riunire preventivi e fatture nello stesso posto, per evitare di inserire due volte i dati.',
    },
  ],
  relatedSlugs: ['cantia-vs-winbiz', 'cantia-vs-klara', 'meilleur-logiciel-devis-facture-batiment-suisse-2026'],
};
