import { BlogPost } from '../types';

export const post: BlogPost = {
  slug: 'defaut-construction-decouvert-apres-reception-qui-paie',
  question: 'Un difetto di costruzione scoperto dopo la consegna: chi paga la riparazione?',
  title: 'Difetto scoperto dopo la consegna del cantiere: chi paga?',
  description:
    'Un difetto occulto scoperto mesi dopo la consegna resta a carico dell’impresario se segnalato in tempo. Cosa cambia con la riforma del diritto di garanzia nel 2026.',
  excerpt:
    'La consegna di un cantiere non chiude mai tutto: un difetto occulto scoperto in seguito resta a carico dell’impresario, a una condizione precisa che tutti ignorano.',
  category: 'Juridique & normes',
  keywords: ['difetto occulto', 'consegna opera', 'garanzia cantiere', 'responsabilità impresario', 'vizio'],
  publishedAt: '2026-03-09',
  readMinutes: 5,
  blocks: [
    {
      type: 'p',
      text: 'Il cliente firma la consegna, tutto sembra in ordine. Poi otto mesi dopo appare una crepa, o si manifesta un’infiltrazione dietro un rivestimento richiuso. La consegna non cancella la responsabilità dell’impresario per questo tipo di difetto: è esattamente ciò che il regime di garanzia di 5 anni è destinato a coprire.',
    },
    { type: 'h2', text: 'Difetto apparente vs difetto occulto: la distinzione che decide tutto' },
    {
      type: 'p',
      text: 'Un difetto visibile al momento della consegna deve essere segnalato immediatamente; in mancanza, il cliente è considerato averlo accettato così com’è, salvo clausola contraria. Un difetto occulto, non rilevabile con una verifica normale, resta coperto dal termine di garanzia anche dopo una consegna senza riserve.',
    },
    {
      type: 'callout',
      title: 'La condizione che fa cambiare la responsabilità',
      text: 'Dalla riforma del diritto di garanzia entrata in vigore nel 2026, un difetto occulto deve essere segnalato entro 60 giorni dalla sua scoperta. Un cliente che aspetta sei mesi dopo aver notato il problema rischia di perdere il proprio diritto alla riparazione, anche se il difetto stesso resta entro il termine di garanzia di 5 anni.',
    },
    { type: 'h2', text: 'Cosa determina chi paga' },
    {
      type: 'list',
      items: [
        'Il difetto è apparente o occulto? Un difetto apparente non segnalato alla consegna generalmente si perde',
        'È stato segnalato entro i 60 giorni successivi alla scoperta, per un difetto occulto?',
        'Il cantiere è ancora entro il termine di prescrizione di 5 anni (10 anni in caso di dissimulazione intenzionale)?',
        'Il difetto risulta da un vizio di esecuzione dell’impresario, o da un cattivo uso successivo del cliente (l’onere della prova gioca qui un ruolo decisivo)',
      ],
    },
    { type: 'h2', text: 'Proteggersi su entrambi i fronti' },
    {
      type: 'p',
      text: 'Un verbale di consegna dettagliato, accompagnato da foto datate di ogni zona del cantiere, protegge sia l’impresario (prova dello stato reale alla consegna) sia il cliente (riferimento in caso di controversia successiva). È il documento più sottoutilizzato del settore: spesso ridotto a una firma rapida a fine sopralluogo, mentre diventa il documento centrale se un difetto riemerge mesi dopo.',
    },
    {
      type: 'cta',
      title: 'Ogni fase del cantiere, documentata automaticamente',
      text: 'I rapporti Cantia marcano data, ora e posizione a ogni foto scattata sul cantiere. È la traccia più solida in caso di controversia di garanzia, senza alcuno sforzo di archiviazione supplementare.',
      buttonLabel: 'Scoprire i rapporti di cantiere',
    },
  ],
  faq: [
    {
      question: 'Un cliente può reclamare un difetto scoperto un anno dopo la consegna?',
      answer:
        'Sì, se si tratta di un difetto occulto non rilevabile con una verifica normale alla consegna, e a condizione di segnalarlo entro i 60 giorni successivi alla scoperta, entro il termine di prescrizione di 5 anni.',
    },
    {
      question: 'Cosa succede se un difetto apparente non è stato segnalato alla consegna?',
      answer:
        'In linea di principio è considerato accettato dal cliente, salvo clausola contraria prevista nel contratto, il che spiega l’interesse di un verbale di consegna dettagliato che elenchi con precisione ciò che è stato verificato.',
    },
    {
      question: 'Qual è il termine per segnalare un difetto occulto dopo la riforma 2026?',
      answer:
        '60 giorni dalla sua scoperta, un quadro più preciso rispetto alla vecchia esigenza di segnalazione «immediata». Un ritardo può far perdere il diritto alla riparazione anche entro il termine di garanzia complessivo.',
    },
  ],
  relatedSlugs: [
    'garantie-travaux-construction-2-ou-5-ans',
    'norme-sia-118-devis-obligatoire',
    'assurance-rc-professionnelle-batiment-obligatoire',
  ],
};
